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
