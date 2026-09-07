import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,

    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import api from "../../services/api";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return;
    setIsLoading(true);
    try {
      const response = await api.post("/auth/login", { email, password });
      const token = response.data?.token;
      const userData = response.data?.data;
      if (token) {
        await SecureStore.setItemAsync("userToken", token);
        if (userData) {
          await SecureStore.setItemAsync("userData", JSON.stringify(userData));
        }
        router.replace("/");
      }
    } catch (error: any) {
      const msg =
        error.response?.data?.message ||
        "Tidak bisa terhubung ke server. Cek koneksi internetmu.";
      Alert.alert("Login Gagal", msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Mascot */}
        <View style={styles.mascotContainer}>
          <View style={styles.mascot} />
          <Text style={styles.mascotText}>TaniSync</Text>
        </View>

        {/* Header */}
        <Text style={styles.title}>Selamat datang balik!</Text>
        <Text style={styles.subtitle}>Yuk lanjut rawat tanamanmu</Text>

        {/* Inputs */}
        <View style={styles.inputContainer}>
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
          <TextInput
            style={styles.input}
            placeholder="Kata sandi"
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

        {/* Submit Button */}
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.primaryButtonText}>Masuk</Text>
          )}
        </TouchableOpacity>

        {/* Footer */}
        <TouchableOpacity
          style={styles.footerLink}
          onPress={() => router.replace("/(auth)/register")}
        >
          <Text style={styles.footerText}>
            Belum punya akun?{" "}
            <Text style={styles.footerTextBold}>Daftar di sini</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FBF8F0" },
  container: { flex: 1, padding: 24, paddingTop: 48 },
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
  eyeIcon: { position: "absolute", right: 16, top: 16 },
  primaryButton: {
    backgroundColor: "#3FA86B",
    height: 56,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#123924",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
    marginTop: 16,
    shadowColor: "#123924",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  primaryButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
  footerLink: { alignItems: "center" },
  footerText: { color: "#5C5A4F", fontSize: 14 },
  footerTextBold: { color: "#123924", fontWeight: "700" },
});
