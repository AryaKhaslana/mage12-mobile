import { MaterialIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { router } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    Image,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ScrollView,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";
import { SafeAreaView } from "react-native-safe-area-context";
import api from "../../services/api";
import { useNotification } from "../../components/NotificationContext";
export default function RegisterScreen() {
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTnc, setAgreeTnc] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const { showNotification } = useNotification();
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
  const handleRegister = async () => {
    // Validasi
    if (!nama || !email || !password || !confirmPassword) {
      return showNotification("Oops", "Semua data wajib diisi.", "error");
    }
    if (password.length < 8) {
      return showNotification("Oops", "Kata sandi minimal 8 karakter.", "error");
    }
    if (password !== confirmPassword) {
      return showNotification("Oops", "Konfirmasi kata sandi tidak sama.", "error");
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
      showNotification("Berhasil!", "Akun kamu sudah dibuat. Silakan masuk.", "success");
      setTimeout(() => router.replace("/(auth)/login"), 1500);
      setTimeout(() => router.replace({ pathname: "/(auth)/login", params: { isNewUser: "true" } }), 1500);
    } catch (error: any) {
      const msg =
        error.response?.data?.message ||
        "Tidak bisa terhubung ke server. Cek koneksi internetmu.";
      showNotification("Register Gagal", msg, "error");
    } finally {
      setIsLoading(false);
    }
  };
  const { width } = Dimensions.get('window');

  return (
    <View style={{ flex: 1, backgroundColor: "#FBF8F0" }}>
      {/* BACKGROUND: Giant Green Inverted Trapezoid filling the top half */}
      <View style={{ position: 'absolute', top: 0, width: '100%', height: 300, zIndex: 0 }}>
        <Svg height="100%" width="100%">
          <Path 
            d={`M 0,0 L ${width},0 L ${width - 33},250 Q ${width - 40},300 ${width - 90},300 L 90,300 Q 40,300 33,250 Z`} 
            fill="#3FA86B" 
            stroke="#123924" 
            strokeWidth="4" 
          />
        </Svg>
      </View>

      {/* Floating Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.replace("/(auth)/login")}
      >
        <MaterialIcons name="arrow-back" size={24} color="#123924" />
      </TouchableOpacity>

      {/* MASCOT: In the middle of the green trapezoid */}
      <View style={{ position: 'absolute', top: 60, width: '100%', alignItems: 'center', zIndex: 1 }}>
        <Image
          source={require("../../assets/images/icontampilanawal/seedling-ngintip.png")}
          style={{ width: 400, height: 400 }}
          resizeMode="contain"
        />
      </View>

      <SafeAreaView style={{ flex: 1, zIndex: 2 }}>
        <KeyboardAvoidingView 
          style={{ flex: 1 }} 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false} bounces={false}>
            
            {/* Header Title */}
            <View style={styles.headerContainer}>
              <Text style={styles.title}>Bikin akun baru</Text>
              <Text style={styles.subtitle}>Mulai perjalanan berkebunmu </Text>
            </View>

            {/* Main Form Card */}
            <View style={styles.wallCard}>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Nama Lengkap"
                  placeholderTextColor="#5C5A4F"
                  value={nama}
                  onChangeText={setNama}
                />
              </View>
              
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

              {/* Checkbox & Privacy Policy */}
              <View style={styles.checkboxContainer}>
                <TouchableOpacity 
                  style={{ marginRight: 12 }} 
                  onPress={() => setAgreeTnc(!agreeTnc)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.checkbox, { marginRight: 0 }, agreeTnc && styles.checkboxChecked]}>
                    {agreeTnc && (
                      <MaterialIcons name="check" size={16} color="#FFFFFF" />
                    )}
                  </View>
                </TouchableOpacity>
                <Text style={[styles.checkboxText, { flex: 1, lineHeight: 18 }]}>
                  <Text onPress={() => setAgreeTnc(!agreeTnc)}>Saya setuju dengan </Text>
                  <Text style={styles.privacyLinkText} onPress={() => setModalVisible(true)}>Syarat & Ketentuan serta Kebijakan Privasi</Text>
                </Text>
              </View>

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
        <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Kebijakan Privasi 🛡️</Text>
            <ScrollView style={styles.modalScroll}>
              <Text style={styles.modalText}>
                Data pribadi dan lokasi lahan kamu dijamin <Text style={{ fontFamily: 'Nunito_800ExtraBold' }}>100% AMAN</Text> bersama TaniSync!{"\n\n"}
                • Kami tidak menjual datamu ke pihak ketiga.{"\n"}
                • Izin lokasi murni dipakai buat fitur Peta Wabah Hama & Cuaca Lokal.{"\n"}
                • Password dilindungi enkripsi kelas militer.{"\n\n"}
                Lanjutin daftar tanpa khawatir, lahanmu jadi subur, privasimu nggak hancur!
              </Text>
            </ScrollView>
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.primaryButtonText}>Sip, Paham!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
    </View>
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
    marginTop: 220,
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontFamily: "Nunito_800ExtraBold",
    color: "#123924",
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: "Nunito_700Bold",
    color: "#5C5A4F",
    textAlign: 'center',
  },
  wallCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    borderWidth: 3,
    borderColor: "#123924",
    boxShadow: "6px 6px 0px #123924",
    padding: 24,
    paddingTop: 32,
    position: "relative",
    zIndex: 2,
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 24,
    zIndex: 10,
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: "#123924",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FBF8F0",
    boxShadow: "3px 3px 0px #123924",
  },
  inputContainer: { marginBottom: 16, position: "relative" },
  input: {
    height: 56,
    borderWidth: 2,
    borderColor: "#123924",
    borderRadius: 30,
    paddingHorizontal: 20,
    backgroundColor: "#FBF8F0",
    fontSize: 16,
    fontFamily: "Nunito_500Medium",
    color: "#123924",
  },
  eyeIcon: { position: "absolute", right: 16, top: 16 },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    marginTop: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#123924",
    backgroundColor: "#FBF8F0",
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: { backgroundColor: "#3FA86B" },
  checkboxText: {
    fontSize: 12,
    color: "#5C5A4F",
    fontFamily: "Nunito_700Bold",
  },
  privacyLinkText: {
    fontSize: 12,
    color: "#3FA86B",
    fontFamily: "Nunito_800ExtraBold",
    textDecorationLine: "underline",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(18, 57, 36, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: "#FBF8F0",
    borderRadius: 24,
    borderWidth: 3,
    borderColor: "#123924",
    boxShadow: "8px 8px 0px #123924",
    padding: 24,
    width: '100%',
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 24,
    fontFamily: "Nunito_800ExtraBold",
    color: "#123924",
    marginBottom: 16,
    textAlign: "center",
  },
  modalScroll: {
    marginBottom: 24,
  },
  modalText: {
    fontSize: 14,
    fontFamily: "Nunito_500Medium",
    color: "#123924",
    lineHeight: 22,
    },
  primaryButton: {
    backgroundColor: "#3FA86B",
    height: 56,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "#123924",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    marginTop: 8,
    boxShadow: "3px 3px 0px #123924",
  },
  primaryButtonText: {
    color: "#FFFFFF",
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
