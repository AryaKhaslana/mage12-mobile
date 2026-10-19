import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Modal,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as SecureStore from 'expo-secure-store';
import * as Haptics from 'expo-haptics';
import { updateProfile, logoutUser, getFriendlyErrorMessage } from '../../services/api';
import { useNotification } from '../../components/NotificationContext';

const { width } = Dimensions.get('window');

const C = {
  primary: '#3FA86B',
  primaryDark: '#2E8A54',
  primaryLight: '#E8F5E9',
  bg: '#FBF8F0',
  surface: '#FFFFFF',
  ink: '#123924',
  muted: '#5C5A4F',
  outline: '#E5E2DB',
  coral: '#FF6B5C',
  amber: '#FFB627',
  inputBg: '#F8FBF9',
  inputBorder: '#D6E6DC',
  inputBorderActive: '#3FA86B',
};

const F = {
  regular: 'Nunito_400Regular',
  medium: 'Nunito_500Medium',
  bold: 'Nunito_700Bold',
  extra: 'Nunito_800ExtraBold',
};

export default function ProfileSetupScreen() {
  const { showNotification } = useNotification();
  const [nama, setNama] = useState('');
  const [username, setUsername] = useState('');
  const [activeInput, setActiveInput] = useState<'nama' | 'username' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showSwitchModal, setShowSwitchModal] = useState(false);

  const submitLockRef = useRef(false);
  const initialUserRef = useRef<{ nama: string; username: string }>({ nama: '', username: '' });
  const namaInputRef = useRef<TextInput>(null);
  const usernameInputRef = useRef<TextInput>(null);

  // Preload user data from Google (if any)
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const storedStr = await SecureStore.getItemAsync('userData');
        if (storedStr) {
          const parsed = JSON.parse(storedStr);
          const initialNama = parsed.nama ? String(parsed.nama).trim() : '';
          const initialUsername = parsed.username
            ? String(parsed.username).trim().toLowerCase().replace(/^@/, '')
            : '';

          if (initialNama) {
            setNama(initialNama);
          }
          if (initialUsername) {
            setUsername(initialUsername);
          }
          initialUserRef.current = {
            nama: initialNama,
            username: initialUsername,
          };
        }
      } catch (err) {
        console.error('Gagal memuat data akun:', err);
      }
    };
    loadUserData();
  }, []);

  const handleUsernameChange = (text: string) => {
    // Sanitasi otomatis: huruf kecil, tanpa spasi, hapus karakter khusus selain titik dan underscore
    const cleaned = text
      .toLowerCase()
      .replace(/^@/, '')
      .replace(/\s+/g, '')
      .replace(/[^a-z0-9_.]/g, '');
    setUsername(cleaned);
    if (errorMsg) setErrorMsg('');
  };

  const handleNamaChange = (text: string) => {
    setNama(text);
    if (errorMsg) setErrorMsg('');
  };

  const handleSubmit = async () => {
    if (submitLockRef.current || isLoading) return;

    const cleanNama = nama.trim();
    const cleanUsername = username.trim().toLowerCase().replace(/^@/, '');

    if (!cleanNama) {
      setErrorMsg('Nama lengkap wajib diisi.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }
    if (cleanNama.length < 2) {
      setErrorMsg('Nama lengkap minimal terdiri dari 2 karakter.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }
    if (!cleanUsername) {
      setErrorMsg('Username wajib diisi.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }
    if (cleanUsername.length < 3) {
      setErrorMsg('Username minimal terdiri dari 3 karakter.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }
    if (!/^[a-z0-9_.]+$/.test(cleanUsername)) {
      setErrorMsg('Username hanya boleh memuat huruf, angka, garis bawah (_), dan titik (.).');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    // Skip request jika data tidak berubah dari preload SecureStore
    const initNama = initialUserRef.current.nama;
    const initUsername = initialUserRef.current.username;
    if (initNama && initUsername && cleanNama === initNama && cleanUsername === initUsername) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      router.replace('/(auth)/avatar-setup');
      return;
    }

    submitLockRef.current = true;
    setIsLoading(true);
    setErrorMsg('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const formData = new FormData();
      formData.append('nama', cleanNama);
      formData.append('username', cleanUsername);

      const updatedUser = await updateProfile(formData);

      // Simpan perubahan ke SecureStore
      const storedStr = await SecureStore.getItemAsync('userData');
      const cached = storedStr ? JSON.parse(storedStr) : {};
      const merged = {
        ...cached,
        ...updatedUser,
        nama: cleanNama,
        username: cleanUsername,
      };
      await SecureStore.setItemAsync('userData', JSON.stringify(merged));

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showNotification('Langkah 1 Selesai!', 'Nama dan username kamu berhasil disimpan.', 'success');
      // Lanjut ke Sesi 2: Avatar & Banner
      router.replace('/(auth)/avatar-setup');
    } catch (error: any) {
      console.error('Error simpan identitas profil:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      if (error.response?.status === 409) {
        setErrorMsg(`Username @${cleanUsername} sudah digunakan. Silakan pilih username lain.`);
      } else {
        setErrorMsg(
          getFriendlyErrorMessage(error, 'Terjadi kesalahan saat menyimpan identitas akun. Silakan coba lagi.')
        );
      }
    } finally {
      setIsLoading(false);
      submitLockRef.current = false;
    }
  };

  const handleSwitchAccount = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowSwitchModal(true);
  };

  const isFormValid = nama.trim().length >= 2 && username.trim().length >= 3;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        enabled={Platform.OS === 'ios'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="none"
          showsVerticalScrollIndicator={false}
        >
          {/* STEP INDICATOR BADGE */}
          <View style={styles.badgeRow}>
            <View style={styles.stepBadge}>
              <MaterialIcons name="person-outline" size={14} color={C.primaryDark} style={{ marginRight: 6 }} />
              <Text style={styles.stepBadgeText}>Langkah 1 dari 2: Identitas Akun</Text>
            </View>
          </View>

          {/* MASCOT GREETING */}
          <View style={styles.mascotContainer}>
            <Animated.View entering={FadeInDown.duration(400)} style={styles.mascotWrapper}>
              <Image
                source={require('../../assets/images/icontampilanawal/seedling-halo.svg')}
                style={styles.mascotImage}
                contentFit="contain"
              />
            </Animated.View>
          </View>

          {/* HEADINGS */}
          <View style={styles.headingBox}>
            <Text style={styles.title}>Buat Identitas Akunmu</Text>
            <Text style={styles.subtitle}>
              Lengkapi nama akun dan username unik kamu. Keduanya wajib diisi agar kamu dapat berinteraksi di komunitas TaniSync.
            </Text>
          </View>

          {/* FORM CARD */}
          <View style={styles.card}>
            {/* FIELD 1: NAMA LENGKAP */}
            <View style={styles.fieldGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Nama Akun / Nama Lengkap</Text>
                <Text style={styles.requiredTag}>Wajib</Text>
              </View>
              <Pressable
                style={[
                  styles.inputContainer,
                  activeInput === 'nama' && styles.inputContainerActive,
                ]}
                onPress={() => namaInputRef.current?.focus()}
                accessible={false}
              >
                <MaterialIcons
                  name="badge"
                  size={20}
                  color={activeInput === 'nama' ? C.primary : '#8F9B94'}
                  style={styles.inputIcon}
                />
                <TextInput
                  ref={namaInputRef}
                  style={styles.textInput}
                  placeholder="Contoh: Budi Santoso"
                  placeholderTextColor="#A0AAB5"
                  value={nama}
                  onChangeText={handleNamaChange}
                  onFocus={() => setActiveInput('nama')}
                  onBlur={() => setActiveInput(null)}
                  maxLength={50}
                  autoCapitalize="words"
                  autoCorrect={false}
                  blurOnSubmit={false}
                  returnKeyType="next"
                  onSubmitEditing={() => usernameInputRef.current?.focus()}
                />
                {nama.length > 0 && (
                  <Pressable
                    onPress={() => {
                      handleNamaChange('');
                      namaInputRef.current?.focus();
                    }}
                    hitSlop={10}
                    style={styles.clearBtn}
                  >
                    <MaterialIcons name="cancel" size={18} color="#C4CCC7" />
                  </Pressable>
                )}
              </Pressable>
              <Text style={styles.helperText}>
                Nama ini akan ditampilkan pada profil dan postingan kamu.
              </Text>
            </View>

            {/* FIELD 2: USERNAME */}
            <View style={styles.fieldGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Username Akun</Text>
                <Text style={styles.requiredTag}>Wajib & Unik</Text>
              </View>
              <Pressable
                style={[
                  styles.inputContainer,
                  activeInput === 'username' && styles.inputContainerActive,
                ]}
                onPress={() => usernameInputRef.current?.focus()}
                accessible={false}
              >
                <Ionicons
                  name="at"
                  size={20}
                  color={activeInput === 'username' ? C.primary : '#8F9B94'}
                  style={styles.inputIcon}
                />
                <TextInput
                  ref={usernameInputRef}
                  style={styles.textInput}
                  placeholder="username_kamu"
                  placeholderTextColor="#A0AAB5"
                  value={username}
                  onChangeText={handleUsernameChange}
                  onFocus={() => setActiveInput('username')}
                  onBlur={() => setActiveInput(null)}
                  autoCapitalize="none"
                  autoCorrect={false}
                  maxLength={30}
                  blurOnSubmit={true}
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit}
                />
                {username.length > 0 && (
                  <Pressable
                    onPress={() => {
                      handleUsernameChange('');
                      usernameInputRef.current?.focus();
                    }}
                    hitSlop={10}
                    style={styles.clearBtn}
                  >
                    <MaterialIcons name="cancel" size={18} color="#C4CCC7" />
                  </Pressable>
                )}
              </Pressable>
              <View style={styles.usernamePreviewRow}>
                <Text style={styles.helperText}>
                  {username.length >= 3 ? (
                    <Text style={{ color: C.primaryDark, fontFamily: F.bold }}>
                      @{username}
                    </Text>
                  ) : (
                    'Minimal 3 karakter, hanya huruf, angka, garis bawah (_), dan titik (.).'
                  )}
                </Text>
                <Text style={styles.charCount}>{username.length}/30</Text>
              </View>
            </View>

            {/* ERROR MESSAGE BANNER */}
            {errorMsg ? (
              <View style={styles.errorBanner}>
                <MaterialIcons name="error-outline" size={18} color={C.coral} style={{ marginRight: 6 }} />
                <Text style={styles.errorBannerText}>{errorMsg}</Text>
              </View>
            ) : null}

            {/* INFO CALLOUT */}
            <View style={styles.infoBox}>
              <MaterialIcons name="shield" size={18} color={C.primary} style={{ marginRight: 8, marginTop: 1 }} />
              <Text style={styles.infoText}>
                Pada sesi berikutnya, kamu dapat memasang foto profil dan banner kebun secara opsional.
              </Text>
            </View>

            {/* SUBMIT BUTTON */}
            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && { transform: [{ scale: 0.98 }] },
                (!isFormValid || isLoading) && styles.primaryButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={!isFormValid || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <View style={styles.buttonContent}>
                  <Text style={styles.primaryButtonText}>Lanjutkan ke Sesi 2</Text>
                  <MaterialIcons name="arrow-forward" size={20} color="#FFFFFF" style={{ marginLeft: 6 }} />
                </View>
              )}
            </Pressable>
          </View>

          {/* SWITCH ACCOUNT FOOTER */}
          <Pressable style={styles.switchAccountBtn} onPress={handleSwitchAccount}>
            <Text style={styles.switchAccountText}>
              Bukan akun kamu?{' '}
              <Text style={styles.switchAccountTextBold}>Ganti Akun</Text>
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* MODAL KONFIRMASI GANTI AKUN NEOCLAY */}
      <Modal
        transparent
        animationType="fade"
        visible={showSwitchModal}
        onRequestClose={() => setShowSwitchModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalIconBox}>
              <MaterialIcons name="swap-horiz" size={32} color="#123924" />
            </View>
            <Text style={styles.modalTitle}>Ganti Akun</Text>
            <Text style={styles.modalSubtitle}>
              Apakah kamu ingin keluar dan masuk menggunakan akun Google atau email yang lain?
            </Text>
            <View style={styles.modalActionGroup}>
              <Pressable
                style={({ pressed }) => [
                  styles.modalSwitchBtn,
                  pressed && { transform: [{ scale: 0.98 }] },
                ]}
                onPress={async () => {
                  setShowSwitchModal(false);
                  await logoutUser();
                }}
              >
                <Text style={styles.modalSwitchBtnText}>Ganti Akun</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.modalCancelBtn,
                  pressed && { transform: [{ scale: 0.98 }] },
                ]}
                onPress={() => setShowSwitchModal(false)}
              >
                <Text style={styles.modalCancelBtnText}>Batal</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: C.bg,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 36,
    alignItems: 'center',
  },
  badgeRow: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.primaryLight,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  stepBadgeText: {
    fontFamily: F.bold,
    fontSize: 12,
    color: C.primaryDark,
  },
  mascotContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  mascotWrapper: {
    width: 130,
    height: 130,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mascotImage: {
    width: 120,
    height: 120,
  },
  headingBox: {
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  title: {
    fontFamily: F.extra,
    fontSize: 24,
    color: C.ink,
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontFamily: F.medium,
    fontSize: 14,
    color: C.muted,
    textAlign: 'center',
    lineHeight: 20,
  },
  card: {
    width: '100%',
    backgroundColor: C.surface,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: C.outline,
    shadowColor: '#123924',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 3,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontFamily: F.bold,
    fontSize: 13,
    color: C.ink,
  },
  requiredTag: {
    fontFamily: F.bold,
    fontSize: 11,
    color: C.primaryDark,
    backgroundColor: C.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.inputBg,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: C.inputBorder,
    paddingHorizontal: 12,
    height: 52,
  },
  inputContainerActive: {
    borderColor: C.inputBorderActive,
    backgroundColor: '#FFFFFF',
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    height: '100%',
    fontFamily: F.medium,
    fontSize: 15,
    color: C.ink,
    paddingVertical: 0,
    textAlignVertical: 'center',
  },
  clearBtn: {
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  helperText: {
    fontFamily: F.regular,
    fontSize: 12,
    color: C.muted,
    marginTop: 5,
    flex: 1,
  },
  usernamePreviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  charCount: {
    fontFamily: F.medium,
    fontSize: 11,
    color: '#8F9B94',
    marginTop: 5,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    borderRadius: 12,
    padding: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  errorBannerText: {
    flex: 1,
    fontFamily: F.bold,
    fontSize: 12,
    color: '#C62828',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F3F9F5',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#D8ECE0',
  },
  infoText: {
    flex: 1,
    fontFamily: F.medium,
    fontSize: 12,
    color: '#2E6646',
    lineHeight: 17,
  },
  primaryButton: {
    backgroundColor: C.primary,
    borderRadius: 14,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryButtonDisabled: {
    backgroundColor: '#A5D6B6',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontFamily: F.bold,
    fontSize: 15,
    color: '#FFFFFF',
  },
  switchAccountBtn: {
    marginTop: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  switchAccountText: {
    fontFamily: F.medium,
    fontSize: 13,
    color: C.muted,
  },
  switchAccountTextBold: {
    fontFamily: F.bold,
    color: C.primaryDark,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(18, 57, 36, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#FBF8F0',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(18, 57, 36, 0.12)',
    alignItems: 'center',
    shadowColor: '#123924',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  modalIconBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: F.extra,
    color: '#123924',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    fontFamily: F.medium,
    color: '#5C5A4F',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  modalActionGroup: {
    width: '100%',
    gap: 10,
  },
  modalSwitchBtn: {
    backgroundColor: '#3FA86B',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#123924',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  modalSwitchBtnText: {
    color: '#FFFFFF',
    fontFamily: F.bold,
    fontSize: 15,
  },
  modalCancelBtn: {
    backgroundColor: '#F1EEE6',
    width: '100%',
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(18, 57, 36, 0.12)',
  },
  modalCancelBtnText: {
    color: '#5C5A4F',
    fontFamily: F.bold,
    fontSize: 14,
  },
});
