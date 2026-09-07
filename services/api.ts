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
