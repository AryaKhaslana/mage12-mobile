import { MaterialIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useState, useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import api from "../../services/api";
import { Image } from 'expo-image';

const AnimatedExpoImage = Animated.createAnimatedComponent(Image);

export default function LocationSetupScreen() {
  const [isLoading, setIsLoading] = useState(false);
  
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
  }, []);

  const animatedImageStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: breathingScale.value },
        { translateY: floatingTranslateY.value }
      ],
    };
  });
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
          <AnimatedExpoImage 
            source={require("../../assets/images/icontampilanawal/seedling-meneropong.svg")} 
            style={[{ width: 340, height: 340 }, animatedImageStyle]} 
            contentFit="contain" 
          />
        </View>
        
        <Text style={styles.title}>Lokasi Kamu</Text>
        <Text style={styles.subtitle}>
          TaniSync butuh tau posisi kebun kamu biar bisa ngasih info komunitas dan cuaca yang akurat.
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
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
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
    backgroundColor: "#F1EEE6",
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#123924",
    marginBottom: 32,
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
