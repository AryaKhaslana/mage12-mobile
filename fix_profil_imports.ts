import fs from 'fs';

let content = fs.readFileSync('app/(tabs)/profil.tsx', 'utf8');

// Add static imports to the top if they don't exist
if (!content.includes('import * as SecureStore from "expo-secure-store";')) {
  content = content.replace(
    'import { MaterialIcons } from "@expo/vector-icons";',
    'import { MaterialIcons } from "@expo/vector-icons";\nimport * as SecureStore from "expo-secure-store";\nimport { router } from "expo-router";'
  );
}

// Remove the dynamic imports
const brokenLogic = `          onPress={async () => {
            const SecureStore = await import("expo-secure-store");
            const { router } = await import("expo-router");
            await SecureStore.deleteItemAsync("userToken");
            await SecureStore.deleteItemAsync("userData");
            router.replace("/(auth)/login");
          }}`;

const fixedLogic = `          onPress={async () => {
            await SecureStore.deleteItemAsync("userToken");
            await SecureStore.deleteItemAsync("userData");
            router.replace("/(auth)/login");
          }}`;

content = content.replace(brokenLogic, fixedLogic);

fs.writeFileSync('app/(tabs)/profil.tsx', content);
