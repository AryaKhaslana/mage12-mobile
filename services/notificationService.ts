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
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
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

  let body = "Cek kebunmu hari ini ya 🌱";

  try {
    // Fetch user plants
    const response = await api.get("/tanaman");
    const tanamanList: any[] = response.data?.data || []; // Use any[] to access sisaHariPenyiraman

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
      body = `${plantName} menunggu kamu nih — cek jadwal siramnya!`;
    }
  } catch (error) {
    console.warn(
      "Failed to fetch plants for notification body, using generic body.",
    );
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Waktunya merawat tanaman! 💧",
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
