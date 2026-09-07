import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        {/* Tambahkan baris ini untuk mendaftarkan Pop-Up Modal */}
        <Stack.Screen 
          name="detail-tanaman" 
          options={{ 
            presentation: 'modal', // Ini yang bikin animasinya muncul dari bawah (pop-up)
            headerShown: false 
          }} 
        />
      </Stack>
      
      <StatusBar style="dark" />
    </>
  );
}