import { GoogleSignin, statusCodes } from "@react-native-google-signin/google-signin";
import { Alert } from "react-native";
import axios from "axios";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";

// Fix Fail-Safe URL: Jadikan production sebagai default jika env kosong
const API_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  "https://mage12-api-production.up.railway.app/api";

const api = axios.create({
  baseURL: API_URL,
  // Fix Content-Type: Hapus properti headers 'Content-Type': 'application/json'
  // agar otomatis menyesuaikan termasuk untuk FormData (multipart/form-data)
});

// Request Interceptor untuk mengirim Token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync("userToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
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
  (response) => response,
  async (error) => {
    // Fix 401 Redirect Logic: Tambahkan pengecualian agar tidak nge-redirect user jika gagal login
    if (
      error.response?.status === 401 &&
      !error.config?.url?.includes("/auth/login")
    ) {
      await SecureStore.deleteItemAsync("userToken");
      router.replace("/");
    }
    return Promise.reject(error);
  },
);

export default api;

GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || "694319697914-5ov6mf48s2votq1htk2tm5toeiap7jbs.apps.googleusercontent.com",
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
      await SecureStore.setItemAsync("userToken", token);
      if (userData) {
        await SecureStore.setItemAsync("userData", JSON.stringify(userData));
      }
      
      if (!userData.latitude) {
        router.replace("/(auth)/location-setup");
      } else {
        router.replace("/");
      }
      
      return userData;
    }
  } catch (error: any) {
    if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      // user cancelled the login flow
      return null;
    }
    
    if (error.response) {
       if (error.response.status === 401) {
         Alert.alert("Error", "Sesi Google kedaluwarsa, coba lagi");
       } else if (error.response.status === 400) {
         Alert.alert("Error", error.response.data?.message || "Permintaan tidak valid");
       } else {
         Alert.alert("Error", error.response.data?.message || "Terjadi kesalahan pada server");
       }
    } else {
       Alert.alert("Error", error.message || "Gagal masuk dengan Google");
    }
    
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
  user_nama: string;
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

export const getCommunityPosts = async (latitude: number, longitude: number, page: number = 1, limit: number = 10) => {
  const response = await api.get("/community", { params: { latitude, longitude, page, limit } });
  return response.data;
};


export const deleteTanaman = async (id: number): Promise<void> => {
  await api.delete(`/tanaman/${id}`);
};

export const getLogsByTanaman = async (tanamanId: number): Promise<LogAktivitas[]> => {
  const response = await api.get(`/logs/${tanamanId}`);
  return response.data.data;
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
      formData.append("foto", {
        uri: fotoUri,
        name: "foto.jpg",
        type: "image/jpeg",
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

export const sendTanibotMessage = async (message: string): Promise<string> => {
  const response = await api.post("/tanibot", { pertanyaan: message });
  return response.data.data.jawaban;
};

export const getTanibotHistory = async (page: number = 1, limit: number = 20): Promise<{ meta: any; data: ChatMessage[] }> => {
  const response = await api.get("/tanibot/history", { params: { page, limit } });
  return response.data;
};


export const updateProfile = async (formData: FormData): Promise<any> => {
  const response = await api.put("/user/me", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data.data;
};

export const updateTanaman = async (id: number, data: { jenisTanaman?: string; nickname?: string }): Promise<any> => {
  const response = await api.put(`/tanaman/${id}`, data);
  return response.data.data;
};
