import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useState } from "react";
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    Image,
    View,
    KeyboardAvoidingView,
    Platform,
    ScrollView
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import api, { googleSignIn } from "../../services/api";
import { useNotification } from "../../components/NotificationContext";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { showNotification } = useNotification();

  const handleLogin = async () => {
    if (!email || !password) {
      showNotification("Perhatian", "Email dan password wajib diisi", "error");
      return;
    }
    setIsLoading(true);
    try {
      const response = await api.post("/auth/login", { email, password });
      
      const token = response.data?.token || response.data?.data?.token;
      const userData = response.data?.data;
      
      if (token) {
        await SecureStore.setItemAsync("userToken", token);
        if (userData) {
          await SecureStore.setItemAsync("userData", JSON.stringify(userData));
        }
        router.replace("/");
      } else {
        showNotification("Login Gagal", "Login sukses tapi token tidak ditemukan di response.", "error");
      }
    } catch (error: any) {
      const msg =
        error.response?.data?.message ||
        "Tidak bisa terhubung ke server. Cek koneksi internetmu.";
      showNotification("Login Gagal", msg, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} bounces={false}>
          
          {/* Header Title */}
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Selamat datang balik!</Text>
            <Text style={styles.subtitle}>Yuk lanjut rawat tanamanmu 🌱</Text>
          </View>

          {/* Form Card (The Wall) */}
          <View style={styles.wallCard}>
            {/* Peeking Mascot */}
            <Image
              source={require("../../assets/images/icontampilanawal/seedling-ngintip.png")}
              style={styles.peekingMascot}
              resizeMode="contain"
            />

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
            
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>ATAU</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Google Sign In Button */}
            <TouchableOpacity
              style={styles.googleButton}
              onPress={async () => {
                try {
                  setIsLoading(true);
                  await googleSignIn();
                } catch (error) {
                  console.error("Google sign in error", error);
                  showNotification("Gagal", "Google Sign In bermasalah. Coba lagi broskie.", "error");
                } finally {
                  setIsLoading(false);
                }
              }}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#123924" />
              ) : (
                <>
                  <Image 
                    source={require("../../assets/images/google-logo.png")} 
                    style={styles.googleLogo} 
                    resizeMode="contain" 
                  />
                  <Text style={styles.googleButtonText}>Masuk dengan Google</Text>
                </>
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
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FBF8F0" },
  scrollContainer: { 
    flexGrow: 1, 
    justifyContent: "flex-end", 
    paddingHorizontal: 24,
    paddingBottom: 24
  },
  headerContainer: {
    marginBottom: 100, // Space for the mascot to peek out
    marginTop: 48,
  },
  title: {
    fontSize: 32,
    fontFamily: "Nunito_800ExtraBold",
    color: "#123924",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: "Nunito_500Medium",
    color: "#5C5A4F",
  },
  wallCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    borderWidth: 3,
    borderColor: "#123924",
    boxShadow: "6px 6px 0px #123924",
    padding: 24,
    paddingTop: 32, // extra padding top for inputs
    position: "relative",
  },
  peekingMascot: {
    width: 140,
    height: 140,
    position: "absolute",
    top: -75, // Pull the mascot up precisely so its hands grip the border
    alignSelf: "center",
    zIndex: 10,
  },
  inputContainer: { marginBottom: 16, position: "relative" },
  input: {
    height: 56,
    borderWidth: 2,
    borderColor: "#123924",
    borderRadius: 30,
    paddingHorizontal: 20,
    backgroundColor: "#FBF8F0", // slight contrast against the white wall
    fontSize: 16,
    fontFamily: "Nunito_500Medium",
    color: "#123924",
  },
  eyeIcon: { position: "absolute", right: 16, top: 16 },
  primaryButton: {
    backgroundColor: "#3FA86B",
    height: 56,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "#123924",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    marginTop: 8,
    boxShadow: "3px 3px 0px #123924",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Nunito_800ExtraBold",
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  dividerLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#123924',
  },
  dividerText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 12,
    color: '#123924',
    marginHorizontal: 12,
  },
  googleButton: {
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    height: 56,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "#123924",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  googleLogo: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  googleButtonText: {
    color: "#123924",
    fontSize: 16,
    fontFamily: "Nunito_800ExtraBold",
  },
  footerLink: { alignItems: "center" },
  footerText: {
    color: "#5C5A4F",
    fontSize: 14,
    fontFamily: "Nunito_500Medium",
  },
  footerTextBold: { color: "#123924", fontFamily: "Nunito_800ExtraBold" },
});
