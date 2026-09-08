import fs from 'fs';

const content = fs.readFileSync('services/api.ts', 'utf8');

const importToAdd = `import { GoogleSignin, statusCodes } from "@react-native-google-signin/google-signin";\nimport { Alert } from "react-native";\n`;

const configToAdd = `
GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || "694319697914-8rvbgiikftnv41g0fltp0c3d8jqe813l.apps.googleusercontent.com",
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
        console.log("[LOCATION-SETUP] perlu diarahkan ke sini");
        // For now just redirect to location-setup (which we will create later)
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
`;

const updatedContent = importToAdd + content + configToAdd;
fs.writeFileSync('services/api.ts', updatedContent);
