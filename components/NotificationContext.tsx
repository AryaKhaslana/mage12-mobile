import { MaterialIcons } from "@expo/vector-icons";
import React, { createContext, useContext, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type NotificationType = "success" | "error" | "info";

interface NotificationData {
  title: string;
  message: string;
  type: NotificationType;
}

interface NotificationContextData {
  showNotification: (title: string, message: string, type?: NotificationType) => void;
}

const NotificationContext = createContext<NotificationContextData>({
  showNotification: () => {} });

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [notification, setNotification] = useState<NotificationData | null>(null);
  const insets = useSafeAreaInsets();

  const showNotification = (title: string, message: string, type: NotificationType = "success") => {
    setNotification({ title, message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      {/* NOTIFICATION TOAST */}
      {notification && (
        <View style={[styles.notificationCard, { bottom: Math.max(insets.bottom, 24) + 65 }]}>
          <View style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
            <View
              style={[
                styles.notifIconBox,
                {
                  backgroundColor: notification.type === "success" ? "#FFB627" : notification.type === "info" ? "#4DB8FF" : "#FF6B5C" },
              ]}
            >
              <MaterialIcons
                name={notification.type === "success" ? "check" : notification.type === "info" ? "info-outline" : "error-outline"}
                size={24}
                color={notification.type === "error" ? "#FFFFFF" : "#123924"}
              />
            </View>
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={styles.notifTitle}>{notification.title}</Text>
              <Text style={styles.notifMessage}>{notification.message}</Text>
            </View>
          </View>
          <Pressable onPress={() => setNotification(null)} style={{ padding: 4 }}>
            <MaterialIcons name="close" size={24} color="#123924" />
          </Pressable>
        </View>
      )}
    </NotificationContext.Provider>
  );
};

const styles = StyleSheet.create({
  notificationCard: {
    position: "absolute",
    left: 20,
    right: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    shadowColor: '#123924', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 9999, // ensures it stays above other elements
  },
  notifIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center" },
  notifTitle: {
    fontFamily: "Nunito_700Bold",
    fontSize: 14,
    color: "#123924",
    marginBottom: 2 },
  notifMessage: {
    fontFamily: "Nunito_500Medium",
    fontSize: 12,
    color: "#5C5A4F" } });

