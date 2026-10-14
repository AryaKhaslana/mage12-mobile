import { MaterialIcons } from "@expo/vector-icons";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type NotificationType = "success" | "error" | "info";

export interface NotificationData {
  id: number;
  title: string;
  message: string;
  type: NotificationType;
}

export interface NotificationContextData {
  showNotification: (title: string, message: string, type?: NotificationType) => void;
  dismissNotification: () => void;
}

const NotificationContext = createContext<NotificationContextData>({
  showNotification: () => {},
  dismissNotification: () => {},
});

export const useNotification = () => useContext(NotificationContext);

const NOTIF_CONFIG: Record<
  NotificationType,
  {
    iconBoxBg: string;
    iconName: keyof typeof MaterialIcons.glyphMap;
    borderColor: string;
    accentBorder: string;
  }
> = {
  success: {
    iconBoxBg: "#3FA86B",
    iconName: "check-circle",
    borderColor: "rgba(63, 168, 107, 0.25)",
    accentBorder: "#3FA86B",
  },
  info: {
    iconBoxBg: "#0EA5E9",
    iconName: "info",
    borderColor: "rgba(14, 165, 233, 0.25)",
    accentBorder: "#0EA5E9",
  },
  error: {
    iconBoxBg: "#FF6B5C",
    iconName: "error-outline",
    borderColor: "rgba(255, 107, 92, 0.25)",
    accentBorder: "#FF6B5C",
  },
};

interface NotificationToastProps {
  notification: NotificationData;
  onDismiss: () => void;
  registerDismiss: (fn: () => void) => void;
}

const NotificationToast = React.memo(function NotificationToast({
  notification,
  onDismiss,
  registerDismiss,
}: NotificationToastProps) {
  const insets = useSafeAreaInsets();
  const topOffset = Math.max(insets.top, 12) + 8;

  const translateY = useSharedValue(-80);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(1);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isDismissingRef = useRef(false);
  const prevIdRef = useRef<number | null>(null);

  const finalizeDismiss = useCallback(() => {
    if (isDismissingRef.current) {
      isDismissingRef.current = false;
      onDismiss();
    }
  }, [onDismiss]);

  const handleDismiss = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    isDismissingRef.current = true;

    translateY.value = withTiming(-80, { duration: 220 });
    scale.value = withTiming(0.95, { duration: 220 });
    opacity.value = withTiming(0, { duration: 220 }, (finished) => {
      if (finished) {
        runOnJS(finalizeDismiss)();
      }
    });
  }, [finalizeDismiss, opacity, scale, translateY]);

  useEffect(() => {
    registerDismiss(handleDismiss);
    return () => {
      registerDismiss(() => {});
    };
  }, [handleDismiss, registerDismiss]);

  useEffect(() => {
    isDismissingRef.current = false;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    const isSpamUpdate = prevIdRef.current !== null && prevIdRef.current !== notification.id;
    prevIdRef.current = notification.id;

    if (isSpamUpdate) {
      scale.value = withSequence(
        withTiming(0.96, { duration: 50 }),
        withSpring(1, { damping: 12, stiffness: 220 })
      );
      translateY.value = withSpring(0, { damping: 16, stiffness: 180 });
      opacity.value = withTiming(1, { duration: 120 });
    } else {
      translateY.value = -80;
      opacity.value = 0;
      scale.value = 0.94;

      translateY.value = withSpring(0, { damping: 15, stiffness: 180, mass: 0.8 });
      opacity.value = withTiming(1, { duration: 180 });
      scale.value = withSpring(1, { damping: 14, stiffness: 200 });
    }

    timerRef.current = setTimeout(() => {
      handleDismiss();
    }, 2800);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [notification, handleDismiss, opacity, scale, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  const config = NOTIF_CONFIG[notification.type] || NOTIF_CONFIG.success;

  return (
    <Animated.View
      style={[
        styles.notificationCard,
        {
          top: topOffset,
          borderColor: config.borderColor,
          borderLeftColor: config.accentBorder,
        },
        animatedStyle,
      ]}
      pointerEvents="box-none"
    >
      <View style={styles.contentRow} pointerEvents="auto">
        <View style={[styles.notifIconBox, { backgroundColor: config.iconBoxBg }]}>
          <MaterialIcons name={config.iconName} size={22} color="#FFFFFF" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.notifTitle} numberOfLines={1}>
            {notification.title}
          </Text>
          <Text style={styles.notifMessage} numberOfLines={2}>
            {notification.message}
          </Text>
        </View>
      </View>
      <Pressable
        onPress={handleDismiss}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        style={({ pressed }) => [
          styles.closeButton,
          pressed && { opacity: 0.6, transform: [{ scale: 0.92 }] },
        ]}
      >
        <MaterialIcons name="close" size={20} color="#5C5A4F" />
      </Pressable>
    </Animated.View>
  );
});

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [notification, setNotification] = useState<NotificationData | null>(null);
  const notifCounterRef = useRef(0);
  const dismissToastRef = useRef<() => void>(() => {});

  const registerDismiss = useCallback((fn: () => void) => {
    dismissToastRef.current = fn;
  }, []);

  const dismissNotificationState = useCallback(() => {
    setNotification(null);
  }, []);

  const dismissNotification = useCallback(() => {
    dismissToastRef.current();
  }, []);

  const showNotification = useCallback((title: string, message: string, type: NotificationType = "success") => {
    notifCounterRef.current += 1;
    setNotification({
      id: notifCounterRef.current,
      title,
      message,
      type,
    });
  }, []);

  const contextValue = useMemo(() => ({
    showNotification,
    dismissNotification,
  }), [showNotification, dismissNotification]);

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      {notification && (
        <NotificationToast
          notification={notification}
          onDismiss={dismissNotificationState}
          registerDismiss={registerDismiss}
        />
      )}
    </NotificationContext.Provider>
  );
};

const styles = StyleSheet.create({
  notificationCard: {
    position: "absolute",
    left: 16,
    right: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderLeftWidth: 4,
    shadowColor: "#123924",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 99999,
  },
  contentRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  notifIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  textContainer: {
    marginLeft: 12,
    flex: 1,
    justifyContent: "center",
  },
  notifTitle: {
    fontFamily: "Nunito_700Bold",
    fontSize: 14,
    color: "#123924",
    marginBottom: 2,
  },
  notifMessage: {
    fontFamily: "Nunito_500Medium",
    fontSize: 12,
    color: "#5C5A4F",
    lineHeight: 16,
  },
  closeButton: {
    padding: 6,
    marginLeft: 8,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
});
