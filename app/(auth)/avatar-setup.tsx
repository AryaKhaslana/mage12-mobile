import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import * as SecureStore from 'expo-secure-store';
import { updateProfile } from '../../services/api';
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
};

const F = {
  regular: 'Nunito_400Regular',
  medium: 'Nunito_500Medium',
  bold: 'Nunito_700Bold',
  extra: 'Nunito_800ExtraBold',
};

export default function AvatarSetupScreen() {
  const { showNotification } = useNotification();
  const [avatar, setAvatar] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [banner, setBanner] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState<{
    nama?: string;
    username?: string;
    avatarUrl?: string | null;
    bannerUrl?: string | null;
    latitude?: any;
    longitude?: any;
  } | null>(null);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const storedStr = await SecureStore.getItemAsync('userData');
        if (storedStr) {
          setUserData(JSON.parse(storedStr));
        }
      } catch (err) {
        console.error('Gagal memuat cache user:', err);
      }
    };
    loadUserData();
  }, []);

  const pickAvatar = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Izin Galeri Ditolak',
          'TaniSync membutuhkan izin akses galeri untuk memilih foto profil kamu.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setAvatar(result.assets[0]);
      }
    } catch (e: any) {
      console.error(e);
      showNotification('Gagal', 'Terjadi kesalahan saat memilih foto.', 'error');
    }
  };

  const pickBanner = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Izin Galeri Ditolak',
          'TaniSync membutuhkan izin akses galeri untuk memilih foto banner kamu.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setBanner(result.assets[0]);
      }
    } catch (e: any) {
      console.error(e);
      showNotification('Gagal', 'Terjadi kesalahan saat memilih banner.', 'error');
    }
  };

  const navigateNext = (userObj?: any) => {
    const current = userObj || userData;
    // Cek apakah lokasi GPS sudah tersedia
    if (!current?.latitude || !current?.longitude) {
      router.replace('/(auth)/location-setup');
    } else {
      router.replace('/(tabs)');
    }
  };

  const handleSaveAndContinue = async () => {
    // Jika tidak ada foto maupun banner yang dipilih, langsung lanjut
    if (!avatar && !banner) {
      navigateNext();
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();

      if (avatar) {
        formData.append('avatar', {
          uri: avatar.uri,
          name: 'avatar.jpg',
          type: 'image/jpeg',
        } as any);
      }

      if (banner) {
        formData.append('banner', {
          uri: banner.uri,
          name: 'banner.jpg',
          type: 'image/jpeg',
        } as any);
      }

      const updatedUser = await updateProfile(formData);

      // Simpan pembaruan ke SecureStore
      const cachedStr = await SecureStore.getItemAsync('userData');
      let merged = updatedUser;
      if (cachedStr) {
        const cached = JSON.parse(cachedStr);
        merged = { ...cached, ...updatedUser };
        await SecureStore.setItemAsync('userData', JSON.stringify(merged));
      }

      showNotification('Berhasil!', 'Foto profil dan banner kamu berhasil disimpan.', 'success');
      navigateNext(merged);
    } catch (error: any) {
      console.error('Error simpan media onboarding:', error);
      Alert.alert(
        'Gagal Menyimpan',
        error.response?.data?.message || 'Gagal mengunggah foto. Kamu dapat melewatinya dan mencobanya nanti di menu profil.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    navigateNext();
  };

  const initialLetter = (userData?.nama?.trim().charAt(0) || 'P').toUpperCase();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* STEP INDICATOR HEADER */}
        <View style={styles.header}>
          <View style={styles.stepBadge}>
            <Ionicons name="sparkles" size={14} color={C.primary} style={{ marginRight: 6 }} />
            <Text style={styles.stepBadgeText}>Langkah 2 dari 2: Foto & Banner Kebun</Text>
          </View>
          <Text style={styles.title}>Lengkapi Profil Kebunmu</Text>
          <Text style={styles.subtitle}>
            Tambahkan foto profil dan banner agar teman-teman di komunitas mudah mengenali kebun kamu. Langkah ini bersifat opsional.
          </Text>
        </View>

        {/* PROFILE PREVIEW CARD */}
        <View style={styles.previewCard}>
          {/* BANNER SECTION */}
          <Pressable
            style={({ pressed }) => [styles.bannerWrapper, pressed && { opacity: 0.85 }]}
            onPress={pickBanner}
            disabled={isLoading}
          >
            {banner ? (
              <>
                <Image source={{ uri: banner.uri }} style={styles.bannerImage} contentFit="cover" />
                <View style={styles.bannerActionRow}>
                  <Pressable
                    style={styles.bannerIconBtn}
                    onPress={pickBanner}
                    hitSlop={8}
                  >
                    <MaterialIcons name="photo-camera" size={18} color="#FFFFFF" />
                  </Pressable>
                  <Pressable
                    style={[styles.bannerIconBtn, { backgroundColor: 'rgba(255, 76, 76, 0.85)' }]}
                    onPress={() => setBanner(null)}
                    hitSlop={8}
                  >
                    <MaterialIcons name="close" size={18} color="#FFFFFF" />
                  </Pressable>
                </View>
              </>
            ) : userData?.bannerUrl ? (
              <>
                <Image source={{ uri: userData.bannerUrl }} style={styles.bannerImage} contentFit="cover" />
                <View style={styles.bannerActionRow}>
                  <Pressable
                    style={styles.bannerIconBtn}
                    onPress={pickBanner}
                    hitSlop={8}
                  >
                    <MaterialIcons name="photo-camera" size={18} color="#FFFFFF" />
                  </Pressable>
                </View>
              </>
            ) : (
              <View style={styles.bannerPlaceholder}>
                <View style={styles.bannerPlaceholderIconBox}>
                  <MaterialIcons name="add-photo-alternate" size={28} color={C.primary} />
                </View>
                <Text style={styles.bannerPlaceholderText}>Ketuk untuk Memilih Banner</Text>
                <Text style={styles.bannerPlaceholderSub}>Rekomendasi rasio 16:9</Text>
              </View>
            )}
          </Pressable>

          {/* AVATAR SECTION (Overlapping Banner) */}
          <View style={styles.avatarRow}>
            <Pressable
              style={({ pressed }) => [styles.avatarWrapper, pressed && { transform: [{ scale: 0.98 }] }]}
              onPress={pickAvatar}
              disabled={isLoading}
            >
              {avatar ? (
                <Image source={{ uri: avatar.uri }} style={styles.avatarImage} contentFit="cover" />
              ) : userData?.avatarUrl ? (
                <Image source={{ uri: userData.avatarUrl }} style={styles.avatarImage} contentFit="cover" />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarInitialText}>{initialLetter}</Text>
                </View>
              )}
              <View style={styles.cameraBadge}>
                <MaterialIcons name="photo-camera" size={16} color="#FFFFFF" />
              </View>
            </Pressable>
          </View>

          {/* USER INFO PREVIEW */}
          <View style={styles.userInfoContainer}>
            <Text style={styles.userNameText}>{userData?.nama || 'Petani Urban'}</Text>
            {userData?.username ? (
              <Text style={styles.userHandleText}>@{userData.username}</Text>
            ) : null}
            <View style={styles.memberTag}>
              <Text style={styles.memberTagText}>🌱 Petani Pemula</Text>
            </View>
          </View>
        </View>

        {/* INFO NOTICE */}
        <View style={styles.infoBox}>
          <MaterialIcons name="info-outline" size={20} color={C.primary} style={{ marginRight: 10, marginTop: 2 }} />
          <Text style={styles.infoText}>
            Kamu tetap dapat mengubah foto profil dan banner kapan saja melalui halaman <Text style={{ fontFamily: F.bold }}>Edit Profil</Text>.
          </Text>
        </View>
      </ScrollView>

      {/* BOTTOM ACTION BAR */}
      <View style={styles.bottomBar}>
        <Pressable
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && { transform: [{ scale: 0.98 }] },
            isLoading && { opacity: 0.7 },
          ]}
          onPress={handleSaveAndContinue}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.primaryButtonText}>
                {avatar || banner ? 'Simpan & Lanjutkan' : 'Lanjutkan'}
              </Text>
              <MaterialIcons name="arrow-forward" size={20} color="#FFFFFF" style={{ marginLeft: 6 }} />
            </>
          )}
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.skipButton, pressed && { opacity: 0.7 }]}
          onPress={handleSkip}
          disabled={isLoading}
        >
          <Text style={styles.skipButtonText}>Lewati untuk Sekarang</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: C.bg,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  header: {
    marginBottom: 20,
  },
  stepBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: C.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    marginBottom: 12,
  },
  stepBadgeText: {
    fontFamily: F.bold,
    fontSize: 13,
    color: C.primary,
  },
  title: {
    fontFamily: F.extra,
    fontSize: 26,
    color: C.ink,
    marginBottom: 6,
  },
  subtitle: {
    fontFamily: F.medium,
    fontSize: 14,
    color: C.muted,
    lineHeight: 22,
  },
  previewCard: {
    backgroundColor: C.surface,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: C.ink,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 3,
    borderWidth: 1,
    borderColor: C.outline,
    marginBottom: 20,
  },
  bannerWrapper: {
    width: '100%',
    height: 140,
    backgroundColor: '#F3EFE6',
    position: 'relative',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerActionRow: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    gap: 8,
  },
  bannerIconBtn: {
    backgroundColor: 'rgba(18, 57, 36, 0.75)',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#D8D4C8',
    borderStyle: 'dashed',
    borderRadius: 20,
    margin: 8,
  },
  bannerPlaceholderIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: C.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  bannerPlaceholderText: {
    fontFamily: F.bold,
    fontSize: 13,
    color: C.ink,
  },
  bannerPlaceholderSub: {
    fontFamily: F.regular,
    fontSize: 11,
    color: C.muted,
    marginTop: 2,
  },
  avatarRow: {
    alignItems: 'center',
    marginTop: -50,
  },
  avatarWrapper: {
    position: 'relative',
    shadowColor: C.ink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: C.surface,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: C.surface,
  },
  avatarInitialText: {
    fontFamily: F.extra,
    fontSize: 38,
    color: C.primary,
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: C.primary,
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: C.surface,
  },
  userInfoContainer: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  userNameText: {
    fontFamily: F.extra,
    fontSize: 18,
    color: C.ink,
    marginBottom: 2,
  },
  userHandleText: {
    fontFamily: F.bold,
    fontSize: 13,
    color: C.muted,
    marginBottom: 8,
  },
  memberTag: {
    backgroundColor: '#F5F2EB',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 100,
  },
  memberTagText: {
    fontFamily: F.bold,
    fontSize: 12,
    color: C.ink,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#E8F5E9',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  infoText: {
    flex: 1,
    fontFamily: F.medium,
    fontSize: 13,
    color: C.ink,
    lineHeight: 19,
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: C.bg,
    borderTopWidth: 1,
    borderTopColor: C.outline,
    gap: 8,
  },
  primaryButton: {
    backgroundColor: C.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 100,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    fontFamily: F.extra,
    fontSize: 16,
    color: '#FFFFFF',
  },
  skipButton: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipButtonText: {
    fontFamily: F.bold,
    fontSize: 14,
    color: C.muted,
  },
});
