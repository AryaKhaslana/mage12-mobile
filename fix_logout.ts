import fs from 'fs';

// FIX app/(tabs)/index.tsx
let indexContent = fs.readFileSync('app/(tabs)/index.tsx', 'utf8');
indexContent = indexContent.replace(
  'await AsyncStorage.removeItem("hasSeenOnboarding");\n            router.replace("/");',
  '// await AsyncStorage.removeItem("hasSeenOnboarding"); // Jangan hapus onboarding statenya\n            router.replace("/(auth)/login");'
);
fs.writeFileSync('app/(tabs)/index.tsx', indexContent);

// FIX app/(tabs)/profil.tsx
let profilContent = fs.readFileSync('app/(tabs)/profil.tsx', 'utf8');
const oldProfilLogout = `{/* LOGOUT BUTTON */}
        <Pressable 
          style={({ pressed }) => [
            styles.logoutButton,
            pressed && styles.pressedShadow3,
          ]}`;

const newProfilLogout = `{/* LOGOUT BUTTON */}
        <Pressable 
          style={({ pressed }) => [
            styles.logoutButton,
            pressed && styles.pressedShadow3,
          ]}
          onPress={async () => {
            const SecureStore = await import("expo-secure-store");
            const { router } = await import("expo-router");
            await SecureStore.deleteItemAsync("userToken");
            await SecureStore.deleteItemAsync("userData");
            router.replace("/(auth)/login");
          }}`;

profilContent = profilContent.replace(oldProfilLogout, newProfilLogout);
fs.writeFileSync('app/(tabs)/profil.tsx', profilContent);
