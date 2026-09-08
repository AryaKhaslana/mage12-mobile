import fs from 'fs';

let content = fs.readFileSync('app/index.tsx', 'utf8');

const oldCheck = `        const userToken = await SecureStore.getItemAsync("userToken");
        if (!userToken) {
          router.replace("/(auth)/login");
          return;
        }

        router.replace("/(tabs)");`;

const newCheck = `        const userToken = await SecureStore.getItemAsync("userToken");
        if (!userToken) {
          router.replace("/(auth)/login");
          return;
        }

        const userDataStr = await SecureStore.getItemAsync("userData");
        if (userDataStr) {
          const userData = JSON.parse(userDataStr);
          if (!userData.latitude) {
            router.replace("/(auth)/location-setup");
            return;
          }
        }

        router.replace("/(tabs)");`;

content = content.replace(oldCheck, newCheck);
fs.writeFileSync('app/index.tsx', content);
