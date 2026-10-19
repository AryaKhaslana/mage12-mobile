import { MaterialIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { router, useLocalSearchParams } from "expo-router";
import * as SecureStore from "expo-secure-store";
import * as Haptics from "expo-haptics";
import React, { useState, useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  cancelAnimation,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import api, { getFriendlyErrorMessage } from "../../services/api";
import { Image } from "expo-image";
import { useNotification } from "../../components/NotificationContext";

const AnimatedExpoImage = Animated.createAnimatedComponent(Image);

const DEFAULT_COORDS = {
  lat: "-7.4478",
  lon: "112.7183",
  label: "Sidoarjo, Jawa Timur",
};

export default function LocationSetupScreen() {
  const { from } = useLocalSearchParams<{ from?: string }>();
  const { showNotification } = useNotification();
  const [isLoading, setIsLoading] = useState(false);
  const [showDeniedModal, setShowDeniedModal] = useState(false);
  const [locationStr, setLocationStr] = useState<string | null>(null);
  const [locationData, setLocationData] = useState<{ lat: string; lon: string } | null>(null);

  const isSavingRef = useRef(false);
  const isRequestingRef = useRef(false);

  // Animation values
  const breathingScale = useSharedValue(1);
  const floatingTranslateY = useSharedValue(0);

  useEffect(() => {
    breathingScale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1500 }),
        withTiming(1, { duration: 1500 })
      ),
      -1,
      true
    );
    floatingTranslateY.value = withRepeat(
      withSequence(
        withTiming(-10, { duration: 2000 }),
        withTiming(0, { duration: 2000 })
      ),
      -1,
      true
    );

    return () => {
      cancelAnimation(breathingScale);
      cancelAnimation(floatingTranslateY);
    };
  }, [breathingScale, floatingTranslateY]);

  const animatedImageStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: breathingScale.value },
        { translateY: floatingTranslateY.value },
      ],
    };
  });

  const requestLocation = async () => {
    if (isRequestingRef.current || isLoading) return;
    isRequestingRef.current = true;
    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const permRes = await Location.requestForegroundPermissionsAsync();
      if (permRes.status !== "granted") {
        // Fallback ramah: terapkan lokasi default otomatis
        setLocationStr(`${DEFAULT_COORDS.lat}, ${DEFAULT_COORDS.lon} (${DEFAULT_COORDS.label})`);
        setLocationData({ lat: DEFAULT_COORDS.lat, lon: DEFAULT_COORDS.lon });
        showNotification(
          "Lokasi Default Diterapkan",
          "Izin lokasi belum diberikan. Lokasi default (Sidoarjo, Jawa Timur) telah diterapkan agar kamu tetap dapat menikmati fitur cuaca.",
          "info"
        );
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        setShowDeniedModal(true);
        setIsLoading(false);
        isRequestingRef.current = false;
        return;
      }

      // Cek dulu last known position (0ms instan)
      let location: Location.LocationObject | null = await Location.getLastKnownPositionAsync().catch(() => null);

      // Jika kosong, panggil getCurrentPositionAsync dengan timeout 3.5 detik (Promise.race)
      if (!location?.coords) {
        const fetchPromise = Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error("Timeout mencari lokasi")), 3500);
        });
        location = await Promise.race([fetchPromise, timeoutPromise]);
      }

      if (location?.coords) {
        const lat = String(location.coords.latitude);
        const lon = String(location.coords.longitude);
        setLocationStr(`${lat}, ${lon}`);
        setLocationData({ lat, lon });
        showNotification("Lokasi Terdeteksi", "Lokasi kamu berhasil ditemukan.", "success");
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        throw new Error("Data koordinat kosong");
      }
    } catch (error) {
      console.error("Gagal mendeteksi lokasi:", error);
      setLocationStr(`${DEFAULT_COORDS.lat}, ${DEFAULT_COORDS.lon} (${DEFAULT_COORDS.label})`);
      setLocationData({ lat: DEFAULT_COORDS.lat, lon: DEFAULT_COORDS.lon });
      showNotification(
        "Gagal Mendeteksi Lokasi",
        "Koneksi GPS lemah atau tidak merespons. Lokasi default Sidoarjo telah diterapkan.",
        "info"
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } finally {
      setIsLoading(false);
      isRequestingRef.current = false;
    }
  };

  const handleUseDefaultLocation = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLocationStr(`${DEFAULT_COORDS.lat}, ${DEFAULT_COORDS.lon} (${DEFAULT_COORDS.label})`);
    setLocationData({ lat: DEFAULT_COORDS.lat, lon: DEFAULT_COORDS.lon });
    showNotification("Lokasi Default Dipilih", "Menggunakan koordinat default Sidoarjo.", "info");
  };

  const handleSkip = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await handleSaveLocation({ lat: DEFAULT_COORDS.lat, lon: DEFAULT_COORDS.lon });
  };

  const handleSaveLocation = async (coordsOverride?: { lat: string; lon: string }) => {
    const targetCoords = coordsOverride || locationData || { lat: DEFAULT_COORDS.lat, lon: DEFAULT_COORDS.lon };
    if (!targetCoords) return;
    if (isSavingRef.current || isLoading) return;
    isSavingRef.current = true;
    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      // Contract: FormData dengan KEDUA latitude & longitude sebagai STRING
      const formData = new FormData();
      formData.append("latitude", targetCoords.lat);
      formData.append("longitude", targetCoords.lon);

      // Using PUT /api/user/me
      const response = await api.put("/user/me", formData);
      const serverUser = response.data?.data || response.data || {};

      // Update local user data - selalu simpan walaupun storedUserData sebelumnya kosong
      const storedUserData = await SecureStore.getItemAsync("userData");
      const parsed = storedUserData ? JSON.parse(storedUserData) : {};
      const merged = {
        ...parsed,
        ...serverUser,
        latitude: targetCoords.lat,
        longitude: targetCoords.lon,
      };
      await SecureStore.setItemAsync("userData", JSON.stringify(merged));

      showNotification("Berhasil", "Lokasi kamu berhasil disimpan.", "success");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      if (from === "edit-profil" && router.canGoBack()) {
        router.back();
      } else {
        router.replace("/(tabs)");
      }
    } catch (error: any) {
      console.error("Gagal simpan lokasi:", error);
      const msg = getFriendlyErrorMessage(error, "Gagal menyimpan lokasi ke server.");
      showNotification("Error", msg, "error");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsLoading(false);
      isSavingRef.current = false;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          {from === "edit-profil" && (
            <Pressable
              onPress={() => router.back()}
              style={{ alignSelf: 'flex-start', padding: 8, marginBottom: 4 }}
              hitSlop={12}
            >
              <MaterialIcons name="arrow-back" size={24} color="#123924" />
            </Pressable>
          )}
          <View style={styles.iconContainer}>
            <AnimatedExpoImage
              source={require("../../assets/images/icontampilanawal/seedling-meneropong.svg")}
              style={[{ width: 260, height: 260 }, animatedImageStyle]}
              contentFit="contain"
            />
          </View>

          <Text style={styles.title}>Lokasi Kamu</Text>
          <Text style={styles.subtitle}>
            TaniSync memerlukan data lokasi kamu agar dapat memberikan informasi cuaca serta rekomendasi komunitas yang akurat.
          </Text>

          <View style={styles.statusBox}>
            {locationStr ? (
              <>
                <MaterialIcons name="check-circle" size={24} color="#3FA86B" style={{ marginRight: 12 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.statusLabel}>Lokasi Terdeteksi:</Text>
                  <Text style={styles.statusText}>{locationStr}</Text>
                </View>
              </>
            ) : (
              <>
                <MaterialIcons name="location-pin" size={24} color="#5C5A4F" style={{ marginRight: 12 }} />
                <Text style={[styles.statusText, { color: "#5C5A4F", flex: 1 }]}>Belum ada lokasi.</Text>
              </>
            )}
          </View>

          {!locationStr ? (
            <>
              <Pressable
                style={({ pressed }) => [
                  styles.primaryButton,
                  pressed && { transform: [{ scale: 0.98 }] },
                  isLoading && styles.buttonDisabled,
                ]}
                onPress={requestLocation}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <View style={styles.buttonInner}>
                    <MaterialIcons name="my-location" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                    <Text style={styles.primaryButtonText}>Deteksi Lokasi</Text>
                  </View>
                )}
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.secondaryButton,
                  pressed && { transform: [{ scale: 0.98 }] },
                  isLoading && styles.buttonDisabled,
                ]}
                onPress={handleUseDefaultLocation}
                disabled={isLoading}
              >
                <Text style={styles.secondaryButtonText}>Gunakan Lokasi Default (Sidoarjo)</Text>
              </Pressable>
            </>
          ) : (
            <>
              <Pressable
                style={({ pressed }) => [
                  styles.primaryButton,
                  pressed && { transform: [{ scale: 0.98 }] },
                  isLoading && styles.buttonDisabled,
                ]}
                onPress={() => handleSaveLocation()}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <View style={styles.buttonInner}>
                    <MaterialIcons name="check" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                    <Text style={styles.primaryButtonText}>Simpan Lokasi</Text>
                  </View>
                )}
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.secondaryButton,
                  pressed && { transform: [{ scale: 0.98 }] },
                  isLoading && styles.buttonDisabled,
                ]}
                onPress={requestLocation}
                disabled={isLoading}
              >
                <Text style={styles.secondaryButtonText}>Deteksi Ulang Lokasi</Text>
              </Pressable>
            </>
          )}

          <Pressable
            style={({ pressed }) => [
              styles.skipButton,
              pressed && { opacity: 0.7 },
              isLoading && styles.buttonDisabled,
            ]}
            onPress={from === "edit-profil" ? () => router.back() : handleSkip}
            disabled={isLoading}
          >
            <Text style={styles.skipButtonText}>
              {from === "edit-profil" ? "Batal" : "Lewati untuk Sekarang"}
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* MODAL FALLBACK IZIN LOKASI DITOLAK */}
      <Modal
        transparent
        animationType="fade"
        visible={showDeniedModal}
        onRequestClose={() => setShowDeniedModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalIconBox}>
              <MaterialIcons name="location-off" size={32} color="#123924" />
            </View>
            <Text style={styles.modalTitle}>Lokasi Default Diterapkan</Text>
            <Text style={styles.modalSubtitle}>
              Izin lokasi belum aktif di perangkatmu. Kami telah menetapkan lokasi default (Sidoarjo, Jawa Timur) agar informasi cuaca dan kalender tanam tetap berfungsi optimal.
            </Text>
            <View style={styles.modalActionGroup}>
              <Pressable
                style={({ pressed }) => [
                  styles.modalPrimaryBtn,
                  pressed && { transform: [{ scale: 0.98 }] },
                ]}
                onPress={() => {
                  setShowDeniedModal(false);
                  handleSaveLocation(DEFAULT_COORDS);
                }}
              >
                <Text style={styles.modalPrimaryBtnText}>Lanjutkan dengan Default</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.modalSecondaryBtn,
                  pressed && { transform: [{ scale: 0.98 }] },
                ]}
                onPress={() => {
                  setShowDeniedModal(false);
                  Linking.openSettings();
                }}
              >
                <Text style={styles.modalSecondaryBtnText}>Buka Pengaturan</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FBF8F0" },
  scrollContent: { flexGrow: 1 },
  container: { flex: 1, padding: 24, paddingTop: 32, paddingBottom: 36, alignItems: "center" },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontFamily: "Nunito_800ExtraBold",
    color: "#123924",
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Nunito_500Medium",
    color: "#5C5A4F",
    marginBottom: 24,
    textAlign: "center",
    lineHeight: 22,
  },
  statusBox: {
    width: "100%",
    backgroundColor: "#F1EEE6",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    alignItems: "center",
    flexDirection: "row",
  },
  statusLabel: {
    fontSize: 11,
    fontFamily: "Nunito_700Bold",
    color: "#3FA86B",
    textTransform: "uppercase",
    marginBottom: 2,
  },
  statusText: {
    fontSize: 14,
    fontFamily: "Nunito_700Bold",
    color: "#123924",
  },
  buttonInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  primaryButton: {
    backgroundColor: "#3FA86B",
    width: "100%",
    height: 56,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#123924",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Nunito_700Bold",
  },
  secondaryButton: {
    backgroundColor: "#F1EEE6",
    width: "100%",
    height: 52,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    borderWidth: 1,
    borderColor: "rgba(18, 57, 36, 0.12)",
  },
  secondaryButtonText: {
    color: "#123924",
    fontSize: 14,
    fontFamily: "Nunito_700Bold",
  },
  skipButton: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  skipButtonText: {
    color: "#5C5A4F",
    fontSize: 14,
    fontFamily: "Nunito_700Bold",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(18, 57, 36, 0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalCard: {
    width: "100%",
    backgroundColor: "#FBF8F0",
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(18, 57, 36, 0.1)",
    alignItems: "center",
    shadowColor: "#123924",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  modalIconBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#E8F5E9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: "Nunito_800ExtraBold",
    color: "#123924",
    marginBottom: 8,
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: 14,
    fontFamily: "Nunito_500Medium",
    color: "#5C5A4F",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
  modalActionGroup: {
    width: "100%",
    gap: 10,
  },
  modalPrimaryBtn: {
    backgroundColor: "#3FA86B",
    width: "100%",
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  modalPrimaryBtnText: {
    color: "#FFFFFF",
    fontFamily: "Nunito_700Bold",
    fontSize: 15,
  },
  modalSecondaryBtn: {
    backgroundColor: "#F1EEE6",
    width: "100%",
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(18, 57, 36, 0.12)",
  },
  modalSecondaryBtnText: {
    color: "#123924",
    fontFamily: "Nunito_700Bold",
    fontSize: 14,
  },
});
