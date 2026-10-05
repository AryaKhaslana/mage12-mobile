import { MaterialIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { router } from "expo-router";
import React, { useState } from "react";
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
    View 
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import api, { googleSignIn } from "../../services/api";
import { useNotification } from "../../components/NotificationContext";
import { Image } from 'expo-image';
import AuthHeader from "../../components/AuthHeader";
import * as SecureStore from "expo-secure-store";

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
  const [isLoading, setIsLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  // Interaction states for mascot
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [activeInput, setActiveInput] = useState<string | null>(null);

  const handleRegister = async () => {
    if (!nama || !email || !username || !password || !confirmPassword) {
      showNotification("Waduh!", "Isi semua datanya dulu broskie biar bisa lanjut.", "info");
      return;
    }
    if (password !== confirmPassword) {
      showNotification("Waduh!", "Kata sandi sama konfirmasinya beda nih, coba cek lagi.", "info");
      return;
    }
    if (!agreeTnc) {
      showNotification("Waduh!", "Centang dulu syarat & ketentuannya ya broskie.", "info");
      return;
    }

    try {
      setIsLoading(true);
      
      let lat = null;
      let lng = null;
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        let location = await Location.getCurrentPositionAsync({});
        lat = location.coords.latitude;
        lng = location.coords.longitude;
      }

      const payload = {
        nama,
        email,
        username,
        password,
        latitude: lat,
        longitude: lng,
      };

      const res = await api.post("/auth/register", payload);
      if (res.data.status === "success") {
        router.replace("/(auth)/login");
        showNotification("Mantap!", "Akun lu udah jadi broskie, tinggal login aja sekarang.", "success");
      }
    } catch (error: any) {
      console.error(error.response?.data || error.message);
      showNotification("Gagal Daftar", error.response?.data?.message || "Ada yang salah pas daftar nih.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#DFF3E6" }}>
      <AuthHeader 
        isPasswordFocused={isPasswordFocused && !showPassword}
        
        
      />

      <SafeAreaView style={{ flex: 1, zIndex: 2 }} edges={['bottom', 'left', 'right']}>
        <KeyboardAvoidingView 
          style={{ flex: 1 }} 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView style={{ zIndex: 2 }} contentContainerStyle={styles.scrollContainer} bounces={false}>
            {/* Title and Subtitle */}
            <View style={{ marginBottom: 24, paddingHorizontal: 8, alignItems: "center" }}>
              <Text style={{ fontSize: 28, fontFamily: "Nunito_800ExtraBold", color: "#1B4332", marginBottom: 4, textAlign: "center" }}>Daftar TaniSync</Text>
              <Text style={{ fontSize: 16, fontFamily: "Nunito_500Medium", color: "#5C5A4F", textAlign: "center" }}>Ayo mulai perjalanan bertanimu!</Text>
            </View>
            
            {/* Main Form Card */}
            <View style={styles.wallCard}>
              <View style={styles.inputContainer}>
                <TextInput
                  style={[styles.input, activeInput === 'nama' && styles.inputFocused]}
                  placeholder="Nama Lengkap"
                  placeholderTextColor="#8F9B94"
                  value={nama}
                  onChangeText={setNama}
                  onFocus={() => setActiveInput('nama')}
                  onBlur={() => setActiveInput(null)}
                />
              </View>

              <View style={styles.inputContainer}>
                <TextInput
                  style={[styles.input, activeInput === 'email' && styles.inputFocused]}
                  placeholder="Email"
                  placeholderTextColor="#8F9B94"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onFocus={() => setActiveInput('email')}
                  onBlur={() => setActiveInput(null)}
                />
              </View>

              <View style={styles.inputContainer}>
                <TextInput
                  style={[styles.input, activeInput === 'password' && styles.inputFocused]}
                  placeholder="Kata Sandi"
                  placeholderTextColor="#8F9B94"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  onFocus={() => {
                    setActiveInput('password');
                    setIsPasswordFocused(true);
                  }}
                  onBlur={() => {
                    setActiveInput(null);
                    setIsPasswordFocused(false);
                  }}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
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
                  style={[styles.input, activeInput === 'confirmPassword' && styles.inputFocused]}
                  placeholder="Konfirmasi Kata Sandi"
                  placeholderTextColor="#8F9B94"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  onFocus={() => {
                    setActiveInput('confirmPassword');
                    setIsPasswordFocused(true);
                  }}
                  onBlur={() => {
                    setActiveInput(null);
                    setIsPasswordFocused(false);
                  }}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
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
                  pressed && { transform: [{ scale: 0.97 }], shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 }
                ]}
                onPress={handleRegister}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.primaryButtonText}>Daftar</Text>
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
                  pressed && { opacity: 0.8, transform: [{ scale: 0.97 }] }
                ]}
                onPress={async () => {
                  try {
                    setIsLoading(true);
                    await googleSignIn();
                  } catch (error) {
                    showNotification("Gagal", "Google Sign In bermasalah.", "error");
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
                1. Data lokasi lu cuma disimpen buat keperluan cuaca dan komunitas, santai ga kita sebar broskie.{"\n\n"}
                2. Jaga etika pas posting di komunitas ya.{"\n\n"}
                3. Jangan spam panen kalo emang kaga ada tanaman.{"\n\n"}
                4. Data login diproses pake enkripsi standar, jadi aman.
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
    paddingBottom: 24,
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
