import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

export default function IndexScreen() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const hasSeenOnboarding =
          await AsyncStorage.getItem("hasSeenOnboarding");

        if (hasSeenOnboarding !== "true") {
          router.replace("/onboarding");
          return;
        }

        const userToken = await SecureStore.getItemAsync("userToken");
        if (!userToken) {
          router.replace("/(auth)/login");
          return;
        }

        router.replace("/(tabs)");
      } catch (e) {
        console.error(e);
        router.replace("/(auth)/login");
      } finally {
        setIsReady(true);
      }
    };

    bootstrapAsync();
  }, []);

  if (!isReady) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#FBF8F0",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color="#3FA86B" />
      </View>
    );
  }

  return null;
}
