import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import api from "../../services/api";

export default function LocationSetupScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [locationStr, setLocationStr] = useState<string | null>(null);
  const [locationData, setLocationData] = useState<{lat: string, lon: string} | null>(null);

  const requestLocation = async () => {
    setIsLoading(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Izin Ditolak", "Tanpa lokasi, kamu nggak bisa pakai fitur komunitas broskie. Buka setting HP buat ngasih izin.");
        setIsLoading(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const lat = String(location.coords.latitude);
      const lon = String(location.coords.longitude);
      
      setLocationStr(`${lat}, ${lon}`);
      setLocationData({ lat, lon });
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Gagal mengambil lokasi. Coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveLocation = async () => {
    if (!locationData) return;
    setIsLoading(true);
    try {
      // Contract: FormData dengan KEDUA latitude & longitude sebagai STRING
      const formData = new FormData();
      formData.append("latitude", locationData.lat);
      formData.append("longitude", locationData.lon);

      // Using PUT /api/user/me
      const response = await api.put("/user/me", formData);

      // Update local user data
      const storedUserData = await SecureStore.getItemAsync("userData");
      if (storedUserData) {
        const parsed = JSON.parse(storedUserData);
        parsed.latitude = locationData.lat;
        parsed.longitude = locationData.lon;
        await SecureStore.setItemAsync("userData", JSON.stringify(parsed));
      }

      router.replace("/");
    } catch (error: any) {
      const msg = error.response?.data?.message || "Gagal menyimpan lokasi ke server.";
      Alert.alert("Error", msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.iconContainer}>
          <MaterialIcons name="my-location" size={64} color="#123924" />
        </View>
        
        <Text style={styles.title}>Lokasi Kamu</Text>
        <Text style={styles.subtitle}>
          TaniSync butuh tau posisi kebun kamu biar bisa ngasih info komunitas dan cuaca yang akurat.
        </Text>

        <View style={styles.statusBox}>
          {locationStr ? (
            <>
              <Text style={styles.statusLabel}>Lokasi Terdeteksi:</Text>
              <Text style={styles.statusText}>{locationStr}</Text>
            </>
          ) : (
            <Text style={styles.statusText}>Belum ada lokasi.</Text>
          )}
        </View>

        {!locationStr ? (
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={requestLocation}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.primaryButtonText}>Deteksi Lokasi</Text>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleSaveLocation}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.primaryButtonText}>Simpan Lokasi</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FBF8F0" },
  container: { flex: 1, padding: 24, paddingTop: 48, alignItems: "center" },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    borderWidth: 2,
    borderColor: "#123924",
    boxShadow: "4px 4px 0px #123924",
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
    marginBottom: 32,
    textAlign: "center",
    lineHeight: 22,
  },
  statusBox: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#123924",
    boxShadow: "4px 4px 0px #123924",
    marginBottom: 32,
    alignItems: "center",
  },
  statusLabel: {
    fontSize: 12,
    fontFamily: "Nunito_700Bold",
    color: "#3FA86B",
    textTransform: "uppercase",
    marginBottom: 8,
  },
  statusText: {
    fontSize: 16,
    fontFamily: "Nunito_700Bold",
    color: "#123924",
    textAlign: "center",
  },
  primaryButton: {
    backgroundColor: "#3FA86B",
    width: "100%",
    height: 56,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "#123924",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "4px 4px 0px #123924",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Nunito_700Bold",
  },
});
