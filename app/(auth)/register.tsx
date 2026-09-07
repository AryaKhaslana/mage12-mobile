import { MaterialIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { router } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,

    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import api from "../../services/api";

export default function RegisterScreen() {
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTnc, setAgreeTnc] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    // Validasi
    if (!nama || !email || !password || !confirmPassword) {
      return Alert.alert("Oops", "Semua data wajib diisi.");
    }
    if (password.length < 8) {
      return Alert.alert("Oops", "Kata sandi minimal 8 karakter.");
    }
    if (password !== confirmPassword) {
      return Alert.alert("Oops", "Konfirmasi kata sandi tidak sama.");
    }
    if (!agreeTnc) {
      return Alert.alert(
        "Oops",
        "Centang persetujuan Syarat & Ketentuan dulu ya.",
      );
    }

    setIsLoading(true);
    try {
      // Dapatkan lokasi user
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setIsLoading(false);
        return Alert.alert(
          "Izin Lokasi Diperlukan",
          "TaniSync butuh lokasimu untuk menghubungkanmu dengan petani di sekitar. Aktifkan izin lokasi lalu coba lagi.",
        );
      }

      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      // Panggil API register
      await api.post("/auth/register", {
        nama,
        email,
        password,
        latitude,
        longitude,
      });

      // Kembali ke login jika sukses
      Alert.alert("Berhasil!", "Akun kamu sudah dibuat. Silakan masuk.", [
        { text: "OK", onPress: () => router.replace("/(auth)/login") },
      ]);
    } catch (error: any) {
      const msg =
        error.response?.data?.message ||
        "Tidak bisa terhubung ke server. Cek koneksi internetmu.";
      Alert.alert("Register Gagal", msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#123924" />
        </TouchableOpacity>

        {/* Mascot */}
        <View style={styles.mascotContainer}>
          <View style={styles.mascot} />
          <Text style={styles.mascotText}>TaniSync</Text>
        </View>

        {/* Header */}
        <Text style={styles.title}>Bikin akun baru</Text>
        <Text style={styles.subtitle}>
          Mulai perjalanan berkebunmu bareng TaniSync
        </Text>

        {/* Inputs */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>NAMA LENGKAP</Text>
          <TextInput
            style={styles.input}
            placeholder="Nama Lengkap"
            placeholderTextColor="#5C5A4F"
            value={nama}
            onChangeText={setNama}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>EMAIL</Text>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#5C5A4F"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>KATA SANDI</Text>
          <TextInput
            style={styles.input}
            placeholder="Kata Sandi"
            placeholderTextColor="#5C5A4F"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowPassword(!showPassword)}
          >
            <MaterialIcons
              name={showPassword ? "visibility" : "visibility-off"}
              size={24}
              color="#123924"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>KONFIRMASI KATA SANDI</Text>
          <TextInput
            style={styles.input}
            placeholder="Konfirmasi Kata Sandi"
            placeholderTextColor="#5C5A4F"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            <MaterialIcons
              name={showConfirmPassword ? "visibility" : "visibility-off"}
              size={24}
              color="#123924"
            />
          </TouchableOpacity>
        </View>

        {/* Checkbox */}
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => setAgreeTnc(!agreeTnc)}
        >
          <View style={[styles.checkbox, agreeTnc && styles.checkboxChecked]}>
            {agreeTnc && (
              <MaterialIcons name="check" size={16} color="#FFFFFF" />
            )}
          </View>
          <Text style={styles.checkboxText}>
            Saya setuju dengan Syarat & Ketentuan serta Kebijakan Privasi
          </Text>
        </TouchableOpacity>

        {/* Submit Button */}
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleRegister}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.primaryButtonText}>Daftar</Text>
          )}
        </TouchableOpacity>

        {/* Footer */}
        <TouchableOpacity
          style={styles.footerLink}
          onPress={() => router.replace("/(auth)/login")}
        >
          <Text style={styles.footerText}>
            Sudah punya akun?{" "}
            <Text style={styles.footerTextBold}>Masuk di sini</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FBF8F0" },
  container: { flex: 1 },
  contentContainer: { padding: 24, paddingTop: 16, paddingBottom: 40 },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "#123924",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    marginBottom: 32,
    shadowColor: "#123924",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  mascotContainer: { alignItems: "center", marginBottom: 32 },
  mascot: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#3FA86B",
    marginBottom: 8,
  },
  mascotText: { fontSize: 16, fontWeight: "700", color: "#123924" },
  title: { fontSize: 28, fontWeight: "800", color: "#123924", marginBottom: 8 },
  subtitle: { fontSize: 14, color: "#5C5A4F", marginBottom: 32 },
  inputContainer: { marginBottom: 16, position: "relative" },
  inputLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#123924",
    marginBottom: 8,
  },
  input: {
    height: 56,
    borderWidth: 2,
    borderColor: "#123924",
    borderRadius: 16,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
    fontSize: 16,
    color: "#123924",
    shadowColor: "#123924",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  eyeIcon: { position: "absolute", right: 16, top: 38 },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 32,
    marginTop: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#123924",
    backgroundColor: "#FFFFFF",
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: { backgroundColor: "#3FA86B" },
  checkboxText: { flex: 1, fontSize: 12, color: "#5C5A4F", lineHeight: 18 },
  primaryButton: {
    backgroundColor: "#3FA86B",
    height: 56,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#123924",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
    shadowColor: "#123924",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  footerLink: { alignItems: "center" },
  footerText: { color: "#5C5A4F", fontSize: 14 },
  footerTextBold: { color: "#123924", fontWeight: "700" },
});
