import { GoogleSignin, statusCodes } from "@react-native-google-signin/google-signin";
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";

declare module "axios" {
  export interface AxiosRequestConfig {
    bypassDedupe?: boolean;
  }
}

// Fix Fail-Safe URL: Jadikan production sebagai default jika env kosong
const API_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  "https://mage12-api.vercel.app/api";

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
});

let cachedToken: string | null = null;
let tokenPromise: Promise<string | null> | null = null;

export const setAuthToken = (token: string | null) => {
  cachedToken = token;
  tokenPromise = null;
};

let isLoggingOut = false;

export const ALL_CACHE_KEYS = [
  "dashboard_weather",
  "dashboard_tanaman",
  "last_rain_notified",
  "tanibot_history",
  "tanibot_history_cache",
  "profile_posts_cache",
  "profile_posts_cache_v1",
  "profile_achievements_cache",
  "profile_achievements_cache_v1",
  "profile_riwayat_cache",
  "profile_riwayat_panen_cache_v1",
  "community_feed_cache_v1",
  "heatmap_cache_v1_semua",
  "heatmap_cache_v1_kutu-putih",
  "heatmap_cache_v1_wereng",
  "heatmap_cache_v1_ulat",
  "peta_hama_cache_store",
  "notifications_cache_v1",
  "notifications_cache",
];

type LogoutCallback = () => void;
const logoutCallbacks: LogoutCallback[] = [];

export const registerOnLogout = (cb: LogoutCallback) => {
  logoutCallbacks.push(cb);
};

export const clearAppCache = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const keysToRemove = keys.filter((k) => k !== "hasSeenOnboarding");
    if (keysToRemove.length > 0) {
      await AsyncStorage.multiRemove(keysToRemove);
    }
  } catch (error) {
    console.warn("Failed to clear app cache:", error);
    try {
      await AsyncStorage.multiRemove(ALL_CACHE_KEYS);
    } catch {}
  }
};

const inFlightRequests = new Map<string, Promise<any>>();

export const clearInFlightRequests = () => {
  inFlightRequests.clear();
};

const getDedupeKey = (url: string, config?: AxiosRequestConfig): string => {
  try {
    const rawUri = api.getUri({ url, params: config?.params });
    const qIndex = rawUri.indexOf("?");
    if (qIndex === -1) return rawUri;

    const base = rawUri.slice(0, qIndex);
    const qs = rawUri.slice(qIndex + 1);
    if (!qs) return base;

    const sp = new URLSearchParams(qs);
    sp.sort();
    return `${base}?${sp.toString()}`;
  } catch {
    const fallbackParams = config?.params ? JSON.stringify(config.params) : "";
    return `${url}?${fallbackParams}`;
  }
};

const originalGet = api.get.bind(api);

api.get = (function (
  url: string,
  config?: any
): Promise<any> {
  const dedupeKey = getDedupeKey(url, config);

  if (!config?.bypassDedupe) {
    const existing = inFlightRequests.get(dedupeKey);
    if (existing) {
      return existing;
    }
  }

  const promise = (originalGet as any)(url, config).finally(() => {
    inFlightRequests.delete(dedupeKey);
  });

  inFlightRequests.set(dedupeKey, promise);
  return promise;
} as any);

export const logoutUser = async () => {
  setAuthToken(null);
  clearInFlightRequests();
  logoutCallbacks.forEach((cb) => {
    try {
      cb();
    } catch (e) {
      console.warn("Logout callback error:", e);
    }
  });

  if (isLoggingOut) return;
  isLoggingOut = true;

  try {
    await SecureStore.deleteItemAsync("userToken");
    await SecureStore.deleteItemAsync("userData");
    await clearAppCache();
    await GoogleSignin.signOut().catch(() => null);
    router.replace("/(auth)/login");
  } catch (error) {
    console.error("Logout error:", error);
    router.replace("/(auth)/login");
  } finally {
    // Beri jeda singkat agar routing selesai sebelum flag dilepas
    setTimeout(() => {
      isLoggingOut = false;
    }, 1000);
  }
};

const isFormData = (data: any): boolean => {
  if (!data) return false;
  if (typeof FormData !== "undefined" && data instanceof FormData) return true;
  return (
    typeof data === "object" &&
    typeof data.append === "function" &&
    (data.constructor?.name === "FormData" ||
      data[Symbol.toStringTag] === "FormData" ||
      Array.isArray(data._parts))
  );
};

api.interceptors.request.use(
  async (config) => {
    // Jika sedang dalam proses logout, jangan jalankan request ke backend
    if (isLoggingOut && !config.url?.includes("/auth/")) {
      const controller = new AbortController();
      config.signal = controller.signal;
      controller.abort("User sedang logout");
      return config;
    }

    // Penyesuaian timeout khusus untuk tanibot (AI) atau upload FormData
    const isTanibot = typeof config.url === "string" && config.url.includes("tanibot");
    const hasFormData = isFormData(config.data);

    if (isTanibot || hasFormData) {
      config.timeout = 25000;
    }

    if (hasFormData) {
      config.headers = config.headers || {};
      if (typeof (config.headers as any).set === "function") {
        (config.headers as any).set("Content-Type", "multipart/form-data");
      } else {
        config.headers["Content-Type"] = "multipart/form-data";
      }
      config.transformRequest = [(data) => data];
    }

    try {
      if (!cachedToken) {
        if (!tokenPromise) {
          tokenPromise = SecureStore.getItemAsync("userToken").finally(() => {
            tokenPromise = null;
          });
        }
        cachedToken = await tokenPromise;
      }
      if (cachedToken) {
        config.headers = config.headers || {};
        if (typeof (config.headers as any).set === "function") {
          (config.headers as any).set("Authorization", `Bearer ${cachedToken}`);
        } else {
          config.headers.Authorization = `Bearer ${cachedToken}`;
        }
      }
    } catch (error) {
      console.error("Error fetching token for request:", error);
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response Interceptor
api.interceptors.response.use(
  (response) => {
    if (
      response.config?.url &&
      response.config.url.includes("/auth/") &&
      response.data?.data?.token
    ) {
      setAuthToken(response.data.data.token);
    }
    return response;
  },
  async (error) => {
    // Abaikan jika sedang logout atau request dibatalkan
    if (isLoggingOut || axios.isCancel(error)) {
      return Promise.reject(error);
    }

    if (
      error.response?.status === 401 &&
      !error.config?.url?.includes("/auth/")
    ) {
      await logoutUser();
    }

    // Normalisasi error jaringan dan timeout
    const isTimeout =
      error.code === "ECONNABORTED" ||
      error.code === "ETIMEDOUT" ||
      Boolean(error.message && /timeout/i.test(error.message));
    const isNetworkError =
      !error.response ||
      isTimeout ||
      error.code === "ERR_NETWORK" ||
      error.message === "Network Error";

    const friendlyMessage =
      "Koneksi ke server sedang lambat atau terputus. Silakan coba sesaat lagi.";

    if (isNetworkError) {
      if (!error.response) {
        error.response = {
          data: {
            message: friendlyMessage,
            status: "error",
          },
          status: isTimeout ? 408 : 0,
          statusText: isTimeout ? "Request Timeout" : "Network Error",
          headers: {},
          config: error.config,
        };
      } else if (!error.response.data?.message) {
        if (typeof error.response.data !== "object" || error.response.data === null) {
          error.response.data = { message: friendlyMessage, status: "error" };
        } else {
          error.response.data.message = friendlyMessage;
        }
      }
      error.userMessage = friendlyMessage;
    } else if (
      error.response &&
      error.response.status >= 500 &&
      (!error.response.data?.message || typeof error.response.data !== "object")
    ) {
      error.response.data = {
        message: friendlyMessage,
        status: "error",
      };
      error.userMessage = friendlyMessage;
    }
    
    // Improved logging to see exactly why it failed
    console.error(
      "AXIOS ERROR URL:", 
      error.config?.url, 
      "| STATUS:", 
      error.response?.status, 
      "| MESSAGE:", 
      error.response?.data?.message || error.message
    );
    
    return Promise.reject(error);
  },
);

export default api;

GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || "",
});

export const googleSignIn = async () => {
  try {
    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn();
    const idToken = userInfo.data?.idToken;
    
    if (!idToken) {
      throw new Error("Gagal mendapatkan idToken dari Google");
    }

    const response = await api.post("/auth/google", { idToken });
    const token = response.data?.data?.token;
    const userData = response.data?.data?.user;

    if (token) {
      setAuthToken(token);
      await SecureStore.setItemAsync("userToken", token);
      if (userData) {
        await SecureStore.setItemAsync("userData", JSON.stringify(userData));
      }
      
      if (!userData?.username) {
        // Akun baru Google belum memiliki username: arahkan ke Sesi 1 (Identitas Akun)
        router.replace("/(auth)/profile-setup");
      } else if (!userData?.latitude) {
        router.replace("/(auth)/location-setup");
      } else {
        router.replace("/(tabs)");
      }
      
      return userData;
    }
  } catch (error: any) {
    if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      // user cancelled the login flow
      return null;
    }
    console.error("GoogleSignin service error:", error?.code, error?.message || error);
    // Propagate error to caller for unified in-app notification
    throw error;
  }
};

export interface TanamanDetail {
  id: number;
  userId: number;
  jenisTanaman: string;
  nickname: string | null;
  tanggalTanam: string;
  daysToHarvest: number;
  predictiveScore: number;
  statusPenyiraman: string;
  sisaHariPanen: number;
  logTerakhir: {
    id: number;
    tipeValidasi: string;
    fotoUrl: string | null;
    createdAt: string;
  } | null;
}

export interface LogAktivitas {
  id: number;
  userId: number;
  tanamanId: number;
  tipeValidasi: string;
  fotoUrl: string | null;
  createdAt: string;
}

export interface CreateLogResponse {
  log: LogAktivitas;
  skorSaatIni: number;
  streak: number;
  expDidapat: number;
  expSekarang: number;
  level: number;
  levelUp: boolean;
}

export const getTanamanById = async (id: number): Promise<TanamanDetail> => {
  const response = await api.get(`/tanaman/${id}`);
  return response.data.data;
};

export const getWeatherToday = async (): Promise<any> => {
  const response = await api.get("/weather/today");
  return response.data.data;
};


export interface Achievement {
  kode: string;
  judul: string;
  deskripsi: string;
  tercapai: boolean;
  progress: number;
  target: number;
}

export interface AchievementResponse {
  streak: number;
  totalPanen: number;
  tanamanAktif: number;
  level: number;
  achievements: Achievement[];
}


export interface CommunityPostDetail extends CommunityPost {
  jumlahKomentar: number;
  jumlahLike: number;
  isLiked: boolean;
  isOwner: boolean;
}


export interface ChatMessage {
  id: number;
  role: "USER" | "BOT";
  message: string;
  createdAt: string;
}

export interface CommunityComment {
  id: number;
  userId: number;
  userNama: string;
  userAvatar: string | null;
  teks: string;
  createdAt: string;
}

export interface CommunityPost {
  id: number;
  userId: number;
  user_nama?: string;
  username?: string;
  user_username?: string;
  userAvatar?: string;
  author?: { id?: number, nama?: string, avatarUrl?: string, username?: string };
  user?: { nama?: string };
  judul?: string;
  lokasiNama?: string;
  tipePost: "progress_update" | "panen_surplus" | "pertanyaan";
  deskripsi: string;
  fotoUrl: string | null;
  createdAt: string;
  latitude: number;
  longitude: number;
  distance: number;
  jumlahKomentar?: number;
  jumlahLike?: number;
  isLiked?: boolean;
}

export const createCommunityPost = async (formData: FormData): Promise<any> => {
  const response = await api.post("/community", formData);
  return response.data;
};

export const getCommunityPosts = async (latitude?: number, longitude?: number, page: number = 1, limit: number = 10, search?: string) => {
  const response = await api.get("/community", { params: { latitude, longitude, page, limit, search } });
  return response.data;
};

export const getMyCommunityPosts = async (page: number = 1, limit: number = 10) => {
  const response = await api.get("/community/me", { params: { page, limit } });
  return response.data;
};


export const deleteTanaman = async (id: number): Promise<void> => {
  await api.delete(`/tanaman/${id}`);
};

export const getLogsByTanaman = async (tanamanId: number): Promise<LogAktivitas[]> => {
  const response = await api.get(`/logs/${tanamanId}`);
  return response.data.data;
};

const getFileInfo = (uri: string) => {
  const cleanUri = uri.split("?")[0];
  let rawName = cleanUri.split("/").pop() || "";
  try {
    rawName = decodeURIComponent(rawName);
  } catch {
    // Keep rawName as is
  }
  const lastDot = rawName.lastIndexOf(".");
  const extMatch = lastDot > 0 ? rawName.slice(lastDot + 1).toLowerCase() : null;
  const extension = extMatch || "jpg";

  let mimeType = "image/jpeg";
  if (extension === "png") {
    mimeType = "image/png";
  } else if (extension === "webp") {
    mimeType = "image/webp";
  } else if (extension === "heic") {
    mimeType = "image/heic";
  } else if (extension === "heif") {
    mimeType = "image/heif";
  } else if (extension === "gif") {
    mimeType = "image/gif";
  } else if (extension === "jpg" || extension === "jpeg") {
    mimeType = "image/jpeg";
  }

  const normalizedExt = extension === "jpeg" ? "jpg" : extension;
  const fileName =
    lastDot > 0
      ? rawName
      : `foto_${Date.now()}.${normalizedExt}`;

  return { fileName, mimeType };
};

export const createLog = async ({
  tanamanId,
  tipeValidasi,
  fotoUri,
}: {
  tanamanId: number;
  tipeValidasi: "button_only" | "photo";
  fotoUri?: string;
}): Promise<CreateLogResponse> => {
  if (tipeValidasi === "button_only") {
    const response = await api.post("/logs", { tanamanId, tipeValidasi });
    return response.data.data;
  } else {
    const formData = new FormData();
    formData.append("tanamanId", String(tanamanId));
    formData.append("tipeValidasi", tipeValidasi);
    if (fotoUri) {
      const { fileName, mimeType } = getFileInfo(fotoUri);
      formData.append("foto", {
        uri: fotoUri,
        name: fileName,
        type: mimeType,
      } as any);
    }
    const response = await api.post("/logs", formData);
    return response.data.data;
  }
};

export const deleteCommunityPost = async (id: number): Promise<void> => {
  await api.delete(`/community/${id}`);
};

export const harvestTanaman = async (id: number): Promise<any> => {
  const response = await api.post(`/tanaman/${id}/panen`);
  return response.data;
};

export const getAchievements = async (): Promise<AchievementResponse> => {
  const response = await api.get('/achievements');
  return response.data.data;
};

export const getCommunityPostDetail = async (id: number): Promise<CommunityPostDetail> => {
  const response = await api.get(`/community/${id}`);
  return response.data.data ? response.data.data : response.data;
};

export const getCommunityComments = async (id: number, page: number = 1, limit: number = 20): Promise<{ meta: any; data: CommunityComment[] }> => {
  const response = await api.get(`/community/${id}/komentar`, { params: { page, limit } });
  return response.data;
};

export const addCommunityComment = async (id: number, teks: string): Promise<CommunityComment> => {
  const response = await api.post(`/community/${id}/komentar`, { teks });
  // the API says it returns "201 data komentar baru"
  return response.data.data ? response.data.data : response.data;
};

export const deleteCommunityComment = async (id: number): Promise<void> => {
  await api.delete(`/community/komentar/${id}`);
};

export const toggleCommunityLike = async (id: number): Promise<{ liked: boolean; jumlahLike: number }> => {
  const response = await api.post(`/community/${id}/like`);
  // POST /community/:id/like (toggle) -> { liked: boolean, jumlahLike: number }
  // Usually wrapped in response.data or response.data.data, let's assume response.data handles it if no 'data' wrapper, else we check.
  // We'll return response.data directly assuming the backend returns it at the root of the JSON or inside data.
  // Actually, standard TaniSync response format is { status: "success", data: {...} } or directly.
  return response.data.data || response.data;
};

export const sendTanibotMessage = async (message: string, latitude?: number, longitude?: number): Promise<string> => {
  const response = await api.post("/tanibot", { pertanyaan: message, latitude, longitude });
  return response.data.data.jawaban;
};

export const getTanibotHistory = async (page: number = 1, limit: number = 20): Promise<{ meta: any; data: ChatMessage[] }> => {
  const response = await api.get("/tanibot/history", { params: { page, limit } });
  return response.data;
};


export const updateProfile = async (formData: FormData): Promise<any> => {
  const response = await api.put("/user/me", formData);
  return response.data.data;
};

export const updateTanaman = async (id: number, data: { jenisTanaman?: string; nickname?: string }): Promise<any> => {
  const response = await api.put(`/tanaman/${id}`, data);
  return response.data.data;
};

// ===== PROFIL PUBLIK PENGGUNA LAIN =====
// Catatan: Endpoint di bawah diasumsikan sesuai CONTRACT.md, sesuaikan kalau backend beda.

export interface PublicUserProfile {
  id: number;
  nama: string;
  username?: string | null;
  avatarUrl?: string | null;
  bannerUrl?: string | null;
  bio?: string | null;
  level?: number;
  streak?: number;
  jumlahTanaman?: number;
  jumlahPengikut?: number;
  jumlahMengikuti?: number;
  isFollowing?: boolean;
  createdAt?: string;
}

/** GET /user/:id -> profil publik user lain */
export const getPublicUserProfile = async (username: string): Promise<PublicUserProfile> => {
  const response = await api.get(`/user/profile/${encodeURIComponent(username)}`);
  return response.data.data ?? response.data;
};

/** GET /community/user/:id -> postingan milik user tertentu */
export const getUserCommunityPosts = async (username: string, page: number = 1, limit: number = 10) => {
  const response = await api.get(`/community/user/${encodeURIComponent(username)}`, { params: { page, limit } });
  return response.data as { meta?: any; data: CommunityPost[] };
};

/** GET /tanaman/user/:id -> tanaman publik milik user tertentu */
export const getUserPublicTanaman = async (username: string): Promise<TanamanDetail[]> => {
  const response = await api.get(`/tanaman/user/${encodeURIComponent(username)}`);
  return response.data.data ?? [];
};

/** POST /user/:id/follow (toggle) -> { following, jumlahPengikut } */
export const toggleFollowUser = async (userId: number): Promise<{ following: boolean; jumlahPengikut?: number }> => {
  const response = await api.post(`/user/${userId}/follow`);
  return response.data.data ?? response.data;
};

/** GET /notifications -> ambil daftar notifikasi user */
export const getMyNotifications = async (page: number = 1, limit: number = 20) => {
  const response = await api.get('/notifications', { params: { page, limit } });
  return response.data as { meta?: any; data: any[] };
};

/** PUT /notifications/:id/read -> tandai notifikasi dibaca */
export const markNotificationAsRead = async (id: number) => {
  const response = await api.put(`/notifications/${id}/read`);
  return response.data;
};

/** PUT /notifications/read-all -> tandai semua dibaca */
export const markAllNotificationsAsRead = async () => {
  const response = await api.put('/notifications/read-all');
  return response.data;
};

export const clearTanibotHistory = async (): Promise<any> => {
  const res = await api.delete("/tanibot/history");
  return res.data;
};

/** GET /user/:id/followers -> daftar pengikut */
export const getUserFollowers = async (userId: number): Promise<PublicUserProfile[]> => {
  try {
    const response = await api.get(`/user/${userId}/followers`);
    return response.data.data ?? response.data ?? [];
  } catch (error) {
    console.log("Error get followers:", error);
    return [];
  }
};

/** GET /user/:id/following -> daftar diikuti */
export const getUserFollowing = async (userId: number): Promise<PublicUserProfile[]> => {
  try {
    const response = await api.get(`/user/${userId}/following`);
    return response.data.data ?? response.data ?? [];
  } catch (error) {
    console.log("Error get following:", error);
    return [];
  }
};
