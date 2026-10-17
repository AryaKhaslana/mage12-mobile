import * as SecureStore from "expo-secure-store";
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import api, { updateProfile } from '../services/api';
import { useNotification } from '../components/NotificationContext';

export default function EditProfilScreen() {
  const [initialData, setInitialData] = useState<any>(null);
  const [nama, setNama] = useState('');
  const [username, setUsername] = useState('');
  const [noHp, setNoHp] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);

  const [fotoBaru, setFotoBaru] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [bannerBaru, setBannerBaru] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const isDirtyRef = useRef(false);
  const savingLockRef = useRef(false);
  const { showNotification } = useNotification();

  // 0ms Cache-First Form Loader
  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      // 1. Baca cache SecureStore instan 0ms
      try {
        const cachedRaw = await SecureStore.getItemAsync("userData");
        if (cachedRaw && isMounted) {
          const cachedUser = JSON.parse(cachedRaw);
          setInitialData(cachedUser);
          setNama(cachedUser.nama || '');
          setUsername(cachedUser.username || '');
          setNoHp(cachedUser.noHp || '');
          setBio(cachedUser.bio || '');
          setAvatarUrl(cachedUser.avatarUrl || null);
          setBannerUrl(cachedUser.bannerUrl || null);
          setIsLoading(false);
        }
      } catch (err) {
        console.warn("Gagal membaca cache userData di edit profil:", err);
      }

      // 2. Fetch data terbaru di background secara silent jika form belum diedit
      try {
        const res = await api.get("/user/me");
        if (res.data?.data && isMounted) {
          const freshUser = res.data.data;
          setInitialData(freshUser);

          // Update SecureStore dengan data terbaru
          await SecureStore.setItemAsync("userData", JSON.stringify(freshUser));

          // Hanya isi field jika pengguna belum mengetik
          if (!isDirtyRef.current) {
            setNama(freshUser.nama || '');
            setUsername(freshUser.username || '');
            setNoHp(freshUser.noHp || '');
            setBio(freshUser.bio || '');
            setAvatarUrl(freshUser.avatarUrl || null);
            setBannerUrl(freshUser.bannerUrl || null);
          }
        }
      } catch (error) {
        console.warn("Gagal menyinkronkan data profil terbaru dari server:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        showNotification(
          'Izin Ditolak',
          'TaniSync membutuhkan izin akses galeri untuk mengganti foto profil kamu.',
          'error'
        );
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.6,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        isDirtyRef.current = true;
        setFotoBaru(result.assets[0]);
      }
    } catch {
      showNotification('Error', 'Gagal membuka galeri foto.', 'error');
    }
  };

  const pickBanner = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        showNotification(
          'Izin Ditolak',
          'TaniSync membutuhkan izin akses galeri untuk mengganti banner profil kamu.',
          'error'
        );
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.6,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        isDirtyRef.current = true;
        setBannerBaru(result.assets[0]);
      }
    } catch {
      showNotification('Error', 'Gagal membuka galeri banner.', 'error');
    }
  };

  const handleSave = async () => {
    if (savingLockRef.current) return;

    const cleanNama = nama.trim();
    const cleanUsername = username.trim().replace(/\s+/g, '').toLowerCase();
    const cleanNoHp = noHp.trim();
    const cleanBio = bio.trim();

    if (!cleanNama) {
      showNotification("Validasi", "Nama lengkap tidak boleh kosong.", "error");
      return;
    }

    // Cek apakah ada perubahan data atau gambar
    const hasChanges =
      cleanNama !== (initialData?.nama ?? "") ||
      cleanUsername !== (initialData?.username ?? "") ||
      cleanNoHp !== (initialData?.noHp ?? "") ||
      cleanBio !== (initialData?.bio ?? "") ||
      Boolean(fotoBaru) ||
      Boolean(bannerBaru);

    if (!hasChanges) {
      showNotification("Info", "Tidak ada perubahan profil.", "info");
      router.back();
      return;
    }

    savingLockRef.current = true;
    setIsSaving(true);

    try {
      const formData = new FormData();

      if (cleanNama !== (initialData?.nama ?? "")) formData.append("nama", cleanNama);
      if (cleanUsername !== (initialData?.username ?? "")) formData.append("username", cleanUsername);
      if (cleanNoHp !== (initialData?.noHp ?? "")) formData.append("noHp", cleanNoHp);
      if (cleanBio !== (initialData?.bio ?? "")) formData.append("bio", cleanBio);

      if (fotoBaru) {
        formData.append("avatar", {
          uri: fotoBaru.uri,
          name: "avatar.jpg",
          type: "image/jpeg"
        } as any);
      }

      if (bannerBaru) {
        formData.append("banner", {
          uri: bannerBaru.uri,
          name: "banner.jpg",
          type: "image/jpeg"
        } as any);
      }

      const updatedUser = await updateProfile(formData);

      // Gabungkan data lokal dan server ke SecureStore agar 0ms sync di Profil & Beranda
      const cachedStr = await SecureStore.getItemAsync("userData");
      const cached = cachedStr ? JSON.parse(cachedStr) : (initialData || {});
      const merged = {
        ...cached,
        nama: cleanNama,
        username: cleanUsername,
        noHp: cleanNoHp,
        bio: cleanBio,
        ...(updatedUser || {})
      };
      await SecureStore.setItemAsync("userData", JSON.stringify(merged));

      showNotification("Berhasil", "Profil berhasil diperbarui!", "success");
      router.back();
    } catch (error: any) {
      console.error("Gagal simpan profil:", error);
      showNotification(
        "Gagal",
        error.response?.data?.message || "Gagal menyimpan perubahan profil.",
        "error"
      );
    } finally {
      setIsSaving(false);
      savingLockRef.current = false;
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator size="large" color="#3FA86B" />
      </SafeAreaView>
    );
  }

  const displayAvatarUri = fotoBaru ? fotoBaru.uri : avatarUrl;
  const displayBannerUri = bannerBaru ? bannerBaru.uri : bannerUrl;

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

        {/* HEADER */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={{ marginRight: 16 }} hitSlop={10} accessibilityLabel="Kembali">
            <MaterialIcons name="arrow-back" size={24} color="#123924" />
          </Pressable>
          <Text style={styles.headerTitle}>Edit Profil</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>

            {/* BANNER & AVATAR COMPOSITE (OVERLAP SEPERTI PROFIL SCREEN) */}
            <View style={styles.mediaCompositeSection}>
              {/* BANNER */}
              <Pressable onPress={pickBanner} style={({ pressed }) => [styles.bannerContainer, pressed && { opacity: 0.85 }]}>
                {displayBannerUri ? (
                  <Image
                    source={{ uri: displayBannerUri }}
                    style={styles.bannerImage}
                    contentFit="cover"
                    cachePolicy="memory-disk"
                  />
                ) : (
                  <View style={styles.bannerPlaceholder}>
                    <MaterialIcons name="image" size={32} color="#A09D91" />
                  </View>
                )}
                <View style={styles.bannerEditBadge}>
                  <MaterialIcons name="camera-alt" size={14} color="#FFFFFF" />
                </View>
              </Pressable>

              {/* AVATAR OVERLAPPING BANNER */}
              <View style={styles.avatarRow}>
                <Pressable onPress={pickImage} style={({ pressed }) => [styles.avatarContainer, pressed && { opacity: 0.85 }]}>
                  {displayAvatarUri ? (
                    <Image
                      source={{ uri: displayAvatarUri }}
                      style={styles.avatarImage}
                      contentFit="cover"
                      cachePolicy="memory-disk"
                    />
                  ) : (
                    <Text style={styles.avatarInitials}>
                      {nama.charAt(0).toUpperCase() || 'P'}
                    </Text>
                  )}
                  <View style={styles.avatarEditBadge}>
                    <MaterialIcons name="camera-alt" size={14} color="#FFFFFF" />
                  </View>
                </Pressable>
                <View style={styles.mediaHintWrapper}>
                  <Text style={styles.mediaHintText}>Ketuk foto atau banner untuk mengganti</Text>
                </View>
              </View>
            </View>

            {/* FORM FIELDS */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nama Lengkap *</Text>
              <TextInput
                style={styles.inputField}
                value={nama}
                onChangeText={(text) => {
                  isDirtyRef.current = true;
                  setNama(text);
                }}
                maxLength={50}
                placeholder="Masukkan nama"
                placeholderTextColor="#5C5A4F"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Username</Text>
              <TextInput
                style={styles.inputField}
                value={username}
                onChangeText={(text) => {
                  isDirtyRef.current = true;
                  setUsername(text.replace(/\s+/g, '').toLowerCase());
                }}
                maxLength={30}
                placeholder="Masukkan username"
                placeholderTextColor="#5C5A4F"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nomor HP</Text>
              <TextInput
                style={styles.inputField}
                value={noHp}
                onChangeText={(text) => {
                  isDirtyRef.current = true;
                  setNoHp(text);
                }}
                maxLength={15}
                placeholder="08xxxxxxxxxx"
                placeholderTextColor="#5C5A4F"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.inputLabel}>Bio Singkat</Text>
                <Text style={styles.charCount}>{bio.length}/160</Text>
              </View>
              <TextInput
                style={[styles.inputField, styles.bioField]}
                value={bio}
                onChangeText={(text) => {
                  isDirtyRef.current = true;
                  setBio(text);
                }}
                placeholder="Ceritakan sedikit tentang kebunmu..."
                placeholderTextColor="#5C5A4F"
                multiline
                maxLength={160}
                textAlignVertical="top"
              />
            </View>
          </View>
        </ScrollView>

        {/* BOTTOM ACTION */}
        <View style={styles.bottomBar}>
          <Pressable
            style={({ pressed }) => [
              styles.saveButton,
              isSaving && { opacity: 0.7 },
              pressed && { transform: [{ scale: 0.98 }] }
            ]}
            onPress={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <MaterialIcons name="save" size={20} color="#FFFFFF" />
                <Text style={styles.saveButtonText}>Simpan Perubahan</Text>
              </>
            )}
          </Pressable>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FBF8F0'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E5DA',
    backgroundColor: '#FFFFFF'
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Nunito_800ExtraBold',
    color: '#123924'
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 0,
    borderRadius: 24,
    padding: 20,
    shadowColor: "#123924",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4
  },
  mediaCompositeSection: {
    marginBottom: 24
  },
  bannerContainer: {
    width: '100%',
    height: 128,
    borderRadius: 18,
    backgroundColor: '#E8E5DA',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden'
  },
  bannerImage: {
    width: '100%',
    height: '100%'
  },
  bannerPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E8E5DA',
    justifyContent: 'center',
    alignItems: 'center'
  },
  bannerEditBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: '#123924',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF'
  },
  avatarRow: {
    marginTop: -44,
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    gap: 14
  },
  avatarContainer: {
    width: 88,
    height: 88,
    borderRadius: 24,
    backgroundColor: '#3FA86B',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#123924",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 21
  },
  avatarInitials: {
    fontSize: 36,
    fontFamily: 'Nunito_800ExtraBold',
    color: '#FFFFFF'
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#123924',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF'
  },
  mediaHintWrapper: {
    flex: 1,
    marginBottom: 8
  },
  mediaHintText: {
    fontSize: 12,
    fontFamily: 'Nunito_600SemiBold',
    color: '#5C5A4F'
  },
  inputGroup: {
    marginBottom: 16
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: 'Nunito_700Bold',
    color: '#123924',
    marginBottom: 8
  },
  charCount: {
    fontSize: 11,
    fontFamily: 'Nunito_600SemiBold',
    color: '#5C5A4F',
    marginBottom: 8
  },
  inputField: {
    backgroundColor: '#FBF8F0',
    borderWidth: 1,
    borderColor: '#E8E5DA',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    fontFamily: 'Nunito_500Medium',
    fontSize: 14,
    color: '#123924'
  },
  bioField: {
    height: 88,
    paddingTop: 12
  },
  bottomBar: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E8E5DA'
  },
  saveButton: {
    backgroundColor: '#3FA86B',
    borderRadius: 100,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#123924",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
    gap: 8
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: 'Nunito_800ExtraBold',
    color: '#FFFFFF'
  }
});
