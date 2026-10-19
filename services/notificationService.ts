import AsyncStorage from "@react-native-async-storage/async-storage";
// @ts-ignore
import * as Notifications from "expo-notifications";
import { SchedulableTriggerInputTypes } from "expo-notifications";
import { Platform } from "react-native";
import api from "./api";

// Handle notifications when app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Pengingat Kebun TaniSync",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#3FA86B",
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== "granted") {
    return false;
  }
  return true;
}

export async function cancelAllPlantReminders() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function scheduleDailyPlantReminder(hour: number, minute: number) {
  // Clear any existing notifications to avoid duplicates
  await cancelAllPlantReminders();

  let body = "Saatnya memeriksa kebun kamu hari ini.";

  try {
    let tanamanList: any[] = [];

    // 0ms cache-first from AsyncStorage
    const cached = await AsyncStorage.getItem("dashboard_tanaman");
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          tanamanList = parsed;
        }
      } catch (e) {
        // non-fatal
      }
    }

    // Fallback to quick network call if cache empty with 1500ms max timeout
    if (tanamanList.length === 0) {
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Timeout")), 1500)
      );
      const response: any = await Promise.race([
        api.get("/tanaman"),
        timeoutPromise,
      ]);
      tanamanList = response.data?.data || [];
    }

    if (tanamanList.length > 0) {
      // Find priority plant: 'PERLU_SIRAM' first
      let priorityPlant = tanamanList.find(
        (t) => t.statusPenyiraman === "PERLU_SIRAM",
      );

      // If none need watering immediately, find the one with least sisaHariPenyiraman
      if (!priorityPlant) {
        priorityPlant = tanamanList.reduce((prev, curr) => {
          const prevDays = prev.sisaHariPenyiraman ?? 999;
          const currDays = curr.sisaHariPenyiraman ?? 999;
          return currDays < prevDays ? curr : prev;
        });
      }

      const plantName = priorityPlant.nickname || priorityPlant.jenisTanaman;
      body = `${plantName} membutuhkan perhatian kamu hari ini — periksa jadwal perawatannya!`;
    }
  } catch (error) {
    // Non-fatal, use default body
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Pengingat Kebun TaniSync",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#3FA86B",
    }).catch(() => {});
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Waktunya Merawat Tanaman!",
      body: body,
      sound: true,
    },
    trigger: {
      type: SchedulableTriggerInputTypes.DAILY,
      hour: hour,
      minute: minute,
    },
  });
}
