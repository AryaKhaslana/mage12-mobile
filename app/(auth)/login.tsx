import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import * as SecureStore from "expo-secure-store";
import * as Haptics from "expo-haptics";
import React, { useState, useRef } from "react";
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    Pressable,
    View,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Keyboard
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNotification } from "../../components/NotificationContext";
import api, { googleSignIn, setAuthToken, clearAppCache } from "../../services/api";
import { Image } from 'expo-image';
import AuthHeader from "../../components/AuthHeader";

export default function LoginScreen() {
  const { showNotification } = useNotification();
  const { sessionExpired } = useLocalSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const authLockRef = useRef(false);
  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  
  // Interaction state for active input and mascot
  const [activeInput, setActiveInput] = useState<string | null>(null);

  React.useEffect(() => {
    if (sessionExpired === "true") {
      showNotification(
        "Sesi Berakhir",
        "Sesi login kamu telah berakhir. Silakan masuk kembali.",
        "info"
      );
    }
  }, [sessionExpired]);

  const handleLogin = async () => {
    Keyboard.dismiss();
    if (authLockRef.current || isSubmitting || isGoogleLoading) return;

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      showNotification("Perhatian", "Email dan kata sandi wajib diisi ya.", "info");
      return;
    }

    authLockRef.current = true;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});

    try {
      setIsSubmitting(true);
      const res = await api.post("/auth/login", { email: cleanEmail, password });
      if (res.data?.status === "success") {
        const token = res.data?.data?.token;
        const loggedUser = res.data?.data?.user;

        if (token) {
          setAuthToken(token);
          await SecureStore.setItemAsync("userToken", token);
        }
        if (loggedUser) {
          await SecureStore.setItemAsync("userData", JSON.stringify(loggedUser));
        }
        await clearAppCache();

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

        if (!loggedUser?.username) {
          router.replace("/(auth)/profile-setup");
        } else if (!loggedUser?.latitude) {
          router.replace("/(auth)/location-setup");
        } else {
          router.replace("/(tabs)");
        }
        showNotification("Berhasil!", `Selamat datang kembali, ${loggedUser?.nama || "Petani"}!`, "success");
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
        showNotification("Gagal Masuk", res.data?.message || "Gagal masuk, periksa data akun kamu.", "error");
      }
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      console.error(error.response?.data || error.message);
      showNotification("Gagal Masuk", error.response?.data?.message || "Terjadi gangguan koneksi, silakan coba lagi.", "error");
    } finally {
      setIsSubmitting(false);
      authLockRef.current = false;
    }
  };

  const handleGoogleSignIn = async () => {
    Keyboard.dismiss();
    if (authLockRef.current || isSubmitting || isGoogleLoading) return;
    authLockRef.current = true;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});

    try {
      setIsGoogleLoading(true);
      await clearAppCache();
      await googleSignIn();
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      showNotification("Gagal", "Google Sign In bermasalah.", "error");
    } finally {
      setIsGoogleLoading(false);
      authLockRef.current = false;
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#DFF3E6" }}>
      <AuthHeader 
        isPasswordFocused={activeInput === 'password' && !showPassword}
      />

      <SafeAreaView style={{ flex: 1, backgroundColor: '#FBF8F1', zIndex: 2 }} edges={['bottom', 'left', 'right']}>
        <KeyboardAvoidingView 
          style={{ flex: 1 }} 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          enabled={Platform.OS === 'ios'}
        >
         <ScrollView
            style={{ flex: 1, backgroundColor: '#FBF8F1', zIndex: 2 }}
            contentContainerStyle={styles.scrollContainer}
            bounces={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="none"
          >
            {/* Title and Subtitle */}
            <View style={{ marginBottom: 24, paddingHorizontal: 8, alignItems: "center" }}>
              <Text style={{ fontSize: 28, fontFamily: "Nunito_800ExtraBold", color: "#1B4332", marginBottom: 4, textAlign: "center" }}>Selamat datang balik!</Text>
              <Text style={{ fontSize: 16, fontFamily: "Nunito_500Medium", color: "#5C5A4F", textAlign: "center" }}>Yuk lanjut rawat tanamanmu</Text>
            </View>
            
            {/* Main Form Card */}
            <View style={styles.wallCard}>
              <View style={styles.inputContainer}>
                <TextInput
                  ref={emailInputRef}
                  style={[styles.input, activeInput === 'email' && styles.inputFocused]}
                  placeholder="Email"
                  placeholderTextColor="#8F9B94"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                  onSubmitEditing={() => passwordInputRef.current?.focus()}
                  blurOnSubmit={false}
                  onFocus={() => setActiveInput('email')}
                  onBlur={() => setActiveInput(null)}
                />
              </View>
              <View style={styles.inputContainer}>
                <TextInput
                  ref={passwordInputRef}
                  style={[
                    styles.input,
                    styles.passwordInput,
                    activeInput === 'password' && styles.inputFocused
                  ]}
                  placeholder="Kata sandi"
                  placeholderTextColor="#8F9B94"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                  blurOnSubmit={true}
                  onFocus={() => setActiveInput('password')}
                  onBlur={() => setActiveInput(null)}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  hitSlop={10}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <MaterialIcons
                    name={showPassword ? "visibility" : "visibility-off"}
                    size={24}
                    color="#5C5A4F"
                  />
                </TouchableOpacity>
              </View>

              <Pressable
                style={({ pressed }) => [
                  styles.primaryButton,
                  (isSubmitting || isGoogleLoading) && { opacity: 0.7 },
                  pressed && !isSubmitting && !isGoogleLoading && { transform: [{ scale: 0.97 }], shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 }
                ]}
                onPress={handleLogin}
                disabled={isSubmitting || isGoogleLoading}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.primaryButtonText}>Masuk</Text>
                )}
              </Pressable>
              
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>ATAU</Text>
                <View style={styles.dividerLine} />
              </View>

              <Pressable
                style={({ pressed }) => [
                  styles.googleButton,
                  (isSubmitting || isGoogleLoading) && { opacity: 0.7 },
                  pressed && !isSubmitting && !isGoogleLoading && { opacity: 0.8, transform: [{ scale: 0.97 }] }
                ]}
                onPress={handleGoogleSignIn}
                disabled={isSubmitting || isGoogleLoading}
              >
                {isGoogleLoading ? (
                  <ActivityIndicator color="#123924" />
                ) : (
                  <>
                    <Image 
                      source={require("../../assets/images/google-logo.png")} 
                      style={styles.googleLogo} 
                      contentFit="contain" 
                    />
                    <Text style={styles.googleButtonText}>Masuk dengan Google</Text>
                  </>
                )}
              </Pressable>

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
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { 
    flexGrow: 1, 
    justifyContent: "flex-start", 
    paddingHorizontal: 24,
    paddingBottom: 48,
    paddingTop: 12,
    backgroundColor: '#FBF8F1', // Smooth transition from cloud
  },
  wallCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    shadowColor: "#1B4332", 
    shadowOffset: { width: 0, height: 6 }, 
    shadowOpacity: 0.05, 
    shadowRadius: 14, 
    elevation: 2,
    padding: 24,
    paddingTop: 32,
  },
  inputContainer: { marginBottom: 16, position: "relative" },
  input: {
    height: 56,
    borderWidth: 1.5,
    borderColor: "#CFE8D8",
    borderRadius: 30,
    paddingHorizontal: 20,
    backgroundColor: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Nunito_500Medium",
    color: "#1B4332",
  },
  inputFocused: {
    borderColor: "#3FA96B",
    backgroundColor: "#FBF8F1",
  },
  passwordInput: {
    paddingRight: 52,
  },
  eyeIcon: { position: "absolute", right: 16, top: 16 },
  primaryButton: {
    backgroundColor: "#3FA96B",
    height: 56,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    marginTop: 8,
    shadowColor: "#3FA96B", 
    shadowOffset: { width: 0, height: 6 }, 
    shadowOpacity: 0.2, 
    shadowRadius: 14, 
    elevation: 4 
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Nunito_800ExtraBold" 
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 16 
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#CFE8D8' 
  },
  dividerText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 12,
    color: '#8F9B94',
    marginHorizontal: 12 
  },
  googleButton: {
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    height: 56,
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: "#CFE8D8",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  googleLogo: {
    width: 24,
    height: 24,
    marginRight: 12 
  },
  googleButtonText: {
    color: "#1B4332",
    fontSize: 16,
    fontFamily: "Nunito_800ExtraBold" 
  },
  footerLink: { alignItems: "center" },
  footerText: {
    color: "#5C5A4F",
    fontSize: 15,
    fontFamily: "Nunito_500Medium" 
  },
  footerTextBold: { color: "#3FA96B", fontFamily: "Nunito_800ExtraBold" } 
});
