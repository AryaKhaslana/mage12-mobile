import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <>
      <Stack>
        {/* Mengarahkan routing utama ke folder (tabs) tanpa double header */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      </Stack>

      {/* Kunci status bar HP ke mode gelap karena background aplikasi kita terang */}
      <StatusBar style="dark" />
    </>
  );
}
