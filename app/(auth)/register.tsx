import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import * as Haptics from "expo-haptics";
import React, { useState, useRef } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    Pressable,
    View,
    Keyboard
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import api, { googleSignIn, setAuthToken, clearAppCache, getFriendlyErrorMessage } from "../../services/api";
import { useNotification } from "../../components/NotificationContext";
import { Image } from 'expo-image';
import AuthHeader from "../../components/AuthHeader";

export default function RegisterScreen() {
  const { showNotification } = useNotification();
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTnc, setAgreeTnc] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const authLockRef = useRef(false);

  // TextInput refs for chained navigation
  const namaInputRef = useRef<TextInput>(null);
  const emailInputRef = useRef<TextInput>(null);
  const usernameInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const confirmPasswordInputRef = useRef<TextInput>(null);

  // Interaction state for active input and mascot
  const [activeInput, setActiveInput] = useState<string | null>(null);

  const handleRegister = async () => {
    Keyboard.dismiss();
    if (authLockRef.current || isSubmitting || isGoogleLoading) return;

    const cleanNama = nama.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = username.replace(/\s+/g, "").toLowerCase();

    if (!cleanNama || !cleanEmail || !cleanUsername || !password || !confirmPassword) {
      showNotification("Perhatian", "Silakan lengkapi semua data formulir terlebih dahulu.", "info");
      return;
    }
    if (password !== confirmPassword) {
      showNotification("Perhatian", "Konfirmasi kata sandi tidak cocok. Silakan periksa kembali.", "info");
      return;
    }
    if (!agreeTnc) {
      showNotification("Perhatian", "Silakan setujui syarat & ketentuan terlebih dahulu.", "info");
      return;
    }

    authLockRef.current = true;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});

    try {
      setIsSubmitting(true);

      const payload = {
        nama: cleanNama,
        email: cleanEmail,
        username: cleanUsername,
        password,
        latitude: null,
        longitude: null,
      };

      const res = await api.post("/auth/register", payload);
      if (res.data?.status === "success") {
        const directToken = res.data?.data?.token;
        const directUser = res.data?.data?.user;

        if (directToken) {
          setAuthToken(directToken);
          await SecureStore.setItemAsync("userToken", directToken);
          if (directUser) {
            await SecureStore.setItemAsync("userData", JSON.stringify(directUser));
          }
          await clearAppCache();
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
          showNotification("Akun Berhasil Dibuat!", "Silakan atur foto profil dan banner kebun kamu.", "success");
          router.replace("/(auth)/avatar-setup");
          return;
        }

        try {
          // Otomatis login agar user langsung punya sesi aktif untuk upload avatar & banner
          const loginRes = await api.post("/auth/login", { email: cleanEmail, password });
          if (loginRes.data?.status === "success" && loginRes.data?.data?.token) {
            const loginToken = loginRes.data.data.token;
            const loginUser = loginRes.data.data.user;
            setAuthToken(loginToken);
            await SecureStore.setItemAsync("userToken", loginToken);
            if (loginUser) {
              await SecureStore.setItemAsync("userData", JSON.stringify(loginUser));
            }
            await clearAppCache();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
            showNotification("Akun Berhasil Dibuat!", "Silakan atur foto profil dan banner kebun kamu.", "success");
            router.replace("/(auth)/avatar-setup");
            return;
          }
        } catch (loginErr) {
          console.warn("Auto-login error:", loginErr);
        }

        // Fallback jika auto-login gagal: arahkan ke login
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        router.replace("/(auth)/login");
        showNotification("Pendaftaran Berhasil!", "Akun kamu sudah siap digunakan, silakan masuk.", "success");
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
        showNotification("Gagal Mendaftar", res.data?.message || "Terjadi kesalahan saat pendaftaran, silakan coba lagi.", "error");
      }
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      console.error(error.response?.data || error.message);
      showNotification("Gagal Mendaftar", getFriendlyErrorMessage(error, "Terjadi kesalahan saat pendaftaran, silakan coba lagi."), "error");
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
    } catch (error: any) {
      console.error("Register Google Sign-In Error:", error?.code, error?.message || error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      const msg = error?.code === "10" || error?.message?.includes("DEVELOPER_ERROR")
        ? "Google Sign-In memerlukan build APK / Client ID (.env) yang sesuai."
        : getFriendlyErrorMessage(error, "Google Sign In bermasalah.");
      showNotification("Gagal", msg, "error");
    } finally {
      setIsGoogleLoading(false);
      authLockRef.current = false;
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#DFF3E6" }}>
      <AuthHeader 
        isPasswordVisible={showPassword || showConfirmPassword}
        isPasswordFocused={showPassword || showConfirmPassword}
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
            {/* Title and Subtitle with Step Indicator */}
            <View style={{ marginBottom: 20, paddingHorizontal: 8, alignItems: "center" }}>
              <Text style={{ fontSize: 26, fontFamily: "Nunito_800ExtraBold", color: "#1B4332", marginBottom: 4, textAlign: "center" }}>Daftar Akun TaniSync</Text>
              <Text style={{ fontSize: 14, fontFamily: "Nunito_500Medium", color: "#5C5A4F", textAlign: "center" }}>Nama dan username wajib diisi untuk identitas kebun kamu</Text>
            </View>
            
            {/* Main Form Card */}
            <View style={styles.wallCard}>
              <View style={styles.inputContainer}>
                <TextInput
                  ref={namaInputRef}
                  style={[styles.input, activeInput === 'nama' && styles.inputFocused]}
                  placeholder="Nama Lengkap"
                  placeholderTextColor="#8F9B94"
                  value={nama}
                  onChangeText={setNama}
                  autoCapitalize="words"
                  maxLength={100}
                  returnKeyType="next"
                  onSubmitEditing={() => emailInputRef.current?.focus()}
                  blurOnSubmit={false}
                  onFocus={() => setActiveInput('nama')}
                  onBlur={() => setActiveInput(null)}
                />
              </View>

              <View style={styles.inputContainer}>
                <TextInput
                  ref={emailInputRef}
                  style={[styles.input, activeInput === 'email' && styles.inputFocused]}
                  placeholder="Email"
                  placeholderTextColor="#8F9B94"
                  value={email}
                  onChangeText={(text) => setEmail(text.replace(/\s+/g, ""))}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  maxLength={100}
                  returnKeyType="next"
                  onSubmitEditing={() => usernameInputRef.current?.focus()}
                  blurOnSubmit={false}
                  onFocus={() => setActiveInput('email')}
                  onBlur={() => setActiveInput(null)}
                />
              </View>

              {/* Username */}
              <View style={styles.inputContainer}>
                <TextInput
                  ref={usernameInputRef}
                  style={[styles.input, activeInput === 'username' && styles.inputFocused]}
                  placeholder="Username (tanpa spasi)"
                  placeholderTextColor="#8F9B94"
                  value={username}
                  onChangeText={(text) => setUsername(text.replace(/\s+/g, "").toLowerCase())}
                  autoCapitalize="none"
                  autoCorrect={false}
                  maxLength={30}
                  returnKeyType="next"
                  onSubmitEditing={() => passwordInputRef.current?.focus()}
                  blurOnSubmit={false}
                  onFocus={() => setActiveInput('username')}
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
                  placeholder="Kata Sandi"
                  placeholderTextColor="#8F9B94"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  maxLength={128}
                  returnKeyType="next"
                  onSubmitEditing={() => confirmPasswordInputRef.current?.focus()}
                  blurOnSubmit={false}
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

              <View style={styles.inputContainer}>
                <TextInput
                  ref={confirmPasswordInputRef}
                  style={[
                    styles.input,
                    styles.passwordInput,
                    activeInput === 'confirmPassword' && styles.inputFocused
                  ]}
                  placeholder="Konfirmasi Kata Sandi"
                  placeholderTextColor="#8F9B94"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  maxLength={128}
                  returnKeyType="done"
                  onSubmitEditing={handleRegister}
                  blurOnSubmit={true}
                  onFocus={() => setActiveInput('confirmPassword')}
                  onBlur={() => setActiveInput(null)}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  hitSlop={10}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <MaterialIcons
                    name={showConfirmPassword ? "visibility" : "visibility-off"}
                    size={24}
                    color="#5C5A4F"
                  />
                </TouchableOpacity>
              </View>

              {/* Checkbox & Privacy Policy */}
              <View style={styles.checkboxContainer}>
                <TouchableOpacity 
                  style={{ marginRight: 12 }} 
                  onPress={() => setAgreeTnc(!agreeTnc)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.checkbox, agreeTnc && styles.checkboxChecked]}>
                    {agreeTnc && (
                      <MaterialIcons name="check" size={16} color="#FFFFFF" />
                    )}
                  </View>
                </TouchableOpacity>
                <Text style={styles.checkboxText}>
                  <Text onPress={() => setAgreeTnc(!agreeTnc)}>Saya setuju dengan </Text>
                  <Text style={styles.privacyLinkText} onPress={() => setModalVisible(true)}>Syarat & Ketentuan serta Kebijakan Privasi</Text>
                </Text>
              </View>

              <Pressable
                style={({ pressed }) => [
                  styles.primaryButton,
                  (isSubmitting || isGoogleLoading) && { opacity: 0.7 },
                  pressed && !isSubmitting && !isGoogleLoading && { transform: [{ scale: 0.97 }], shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 }
                ]}
                onPress={handleRegister}
                disabled={isSubmitting || isGoogleLoading}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.primaryButtonText}>Daftar & Lanjutkan</Text>
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
                    <Text style={styles.googleButtonText}>Daftar dengan Google</Text>
                  </>
                )}
              </Pressable>

              <TouchableOpacity
                style={styles.footerLink}
                onPress={() => router.replace("/(auth)/login")}
              >
                <Text style={styles.footerText}>
                  Sudah punya akun?{" "}
                  <Text style={styles.footerTextBold}>Masuk di sini</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* S&K Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Syarat & Ketentuan</Text>
            <ScrollView style={{ marginVertical: 16 }}>
              <Text style={{ fontFamily: "Nunito_500Medium", color: "#5C5A4F", lineHeight: 22 }}>
                1. Data lokasi kamu hanya disimpan untuk keperluan fitur cuaca dan komunitas, serta dijaga kerahasiaannya.{"\n\n"}
                2. Harap saling menghargai dan menjaga etika berkomunikasi di komunitas.{"\n\n"}
                3. Gunakan fitur pencatatan panen secara bijak dan sesuai dengan kondisi nyata.{"\n\n"}
                4. Data akun dan kata sandi kamu diamankan menggunakan enkripsi standar industri.
              </Text>
            </ScrollView>
            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && { transform: [{ scale: 0.97 }] }
              ]}
              onPress={() => {
                setAgreeTnc(true);
                setModalVisible(false);
              }}
            >
              <Text style={styles.primaryButtonText}>Saya Mengerti & Setuju</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
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
    elevation: 4,
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
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#CFE8D8",
    backgroundColor: "#FFFFFF",
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: "#3FA96B",
    borderColor: "#3FA96B",
  },
  checkboxText: {
    flex: 1,
    fontFamily: "Nunito_500Medium",
    fontSize: 14,
    color: "#5C5A4F",
    lineHeight: 20,
  },
  privacyLinkText: {
    color: "#3FA96B",
    fontFamily: "Nunito_800ExtraBold",
  },
  primaryButton: {
    backgroundColor: "#3FA96B",
    height: 56,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
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
  footerTextBold: { color: "#3FA96B", fontFamily: "Nunito_800ExtraBold" },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    maxHeight: '80%',
    shadowColor: "#1B4332", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.05, shadowRadius: 14, elevation: 4,
  },
  modalTitle: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 20,
    color: "#1B4332",
    textAlign: "center",
  }
});
