import {
  Nunito_400Regular,
  Nunito_500Medium,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
  useFonts,
} from "@expo-google-fonts/nunito";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";

import { NotificationProvider } from "../components/NotificationContext";

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Nunito_400Regular,
    Nunito_500Medium,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <NotificationProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#FBF8F0" },
          animation: "slide_from_right",
        }}
      >
        {/* Alur Utama dengan Transisi Fade */}
        <Stack.Screen name="index" options={{ animation: "fade" }} />
        <Stack.Screen name="onboarding" options={{ animation: "fade" }} />
        <Stack.Screen name="(tabs)" options={{ animation: "fade" }} />
        <Stack.Screen name="(auth)" options={{ animation: "fade" }} />

        {/* Layar Detail dan Fitur */}
        <Stack.Screen name="detail-tanaman" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="detail-komunitas" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="peta-hama" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="profil-pengguna" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="edit-profil" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="koneksi" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="notifikasi" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="pusat-bantuan" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="pengaturan-notifikasi" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="kebijakan-privasi" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="ketentuan-layanan" options={{ animation: "slide_from_right" }} />

        {/* Modal Cuaca */}
        <Stack.Screen
          name="cuaca"
          options={{
            presentation: "modal",
            animation: "slide_from_bottom",
          }}
        />
      </Stack>

      <StatusBar style="dark" />
    </NotificationProvider>
  );
}
