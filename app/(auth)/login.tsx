import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    Image,
    View,
} from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import api from "../../services/api";
export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // Animasi Mascot
  const scale = useSharedValue(1);
  React.useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1500 }),
        withTiming(1, { duration: 1500 }),
      ),
      -1,
      true,
    );
  }, []);
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Perhatian", "Email dan password wajib diisi");
      return;
    }
    setIsLoading(true);
    try {
      const response = await api.post("/auth/login", { email, password });
      
      // Fallback: token bisa di response.data.token atau response.data.data.token
      const token = response.data?.token || response.data?.data?.token;
      const userData = response.data?.data;
      
      if (token) {
        await SecureStore.setItemAsync("userToken", token);
        if (userData) {
          await SecureStore.setItemAsync("userData", JSON.stringify(userData));
        }
        router.replace("/");
      } else {
        Alert.alert("Login Gagal", "Login sukses tapi token tidak ditemukan di response.");
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
          <Animated.Image
            source={require("../../assets/images/icontampilanawal/seedling-halo.png")}
            style={[styles.mascot, animatedStyle]}
            resizeMode="contain"
          />
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
        
        {/* Google Sign In Button */}
        <TouchableOpacity
          style={styles.googleButton}
          onPress={async () => {
            try {
              setIsLoading(true);
              const { googleSignIn } = await import("../../services/api");
              await googleSignIn();
            } catch (error) {
              console.error("Google sign in error", error);
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
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FBF8F0" },
  container: { flex: 1, padding: 24, paddingTop: 48 },
  mascotContainer: { alignItems: "center", marginBottom: 32 },
  mascot: {
    width: 100,
    height: 100,
    marginBottom: 8,
  },
  mascotText: { fontSize: 16, fontFamily: "Nunito_700Bold", color: "#123924" },
  title: {
    fontSize: 28,
    fontFamily: "Nunito_800ExtraBold",
    color: "#123924",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Nunito_500Medium",
    color: "#5C5A4F",
    marginBottom: 32,
  },
  inputContainer: { marginBottom: 16, position: "relative" },
  input: {
    height: 56,
    borderWidth: 2,
    borderColor: "#123924",
    borderRadius: 30,
    paddingHorizontal: 20,
    backgroundColor: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Nunito_500Medium",
    color: "#123924",
    boxShadow: "4px 4px 0px #123924",
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
    marginBottom: 32,
    marginTop: 16,
    boxShadow: "4px 4px 0px #123924",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Nunito_700Bold",
  },
  footerLink: { alignItems: "center" },
  footerText: {
    color: "#5C5A4F",
    fontSize: 14,
    fontFamily: "Nunito_500Medium",
  },
  footerTextBold: { color: "#123924", fontFamily: "Nunito_700Bold" },

  googleButton: {
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    height: 56,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "#123924",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
    boxShadow: "4px 4px 0px #123924",
  },
  googleLogo: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  googleButtonText: {
    color: "#123924",
    fontSize: 16,
    fontFamily: "Nunito_700Bold",
  },
});
