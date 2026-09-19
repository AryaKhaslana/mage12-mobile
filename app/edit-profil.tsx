import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, ScrollView, Image, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import api, { updateProfile } from '../services/api';
import { useNotification } from '../components/NotificationContext';

export default function EditProfilScreen() {
  const [initialData, setInitialData] = useState<any>(null);
  const [nama, setNama] = useState('');
  const [username, setUsername] = useState('');
  const [noHp, setNoHp] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  
  const [fotoBaru, setFotoBaru] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const { showNotification } = useNotification();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/user/me");
        const user = res.data.data;
        setInitialData(user);
        setNama(user.nama || '');
        setUsername(user.username || '');
        setNoHp(user.noHp || '');
        setBio(user.bio || '');
        setAvatarUrl(user.avatarUrl || null);
      } catch (error) {
        console.error("Failed to fetch user data", error);
        Alert.alert("Error", "Gagal memuat data profil.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, []);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Izin Ditolak', 'TaniSync butuh izin akses galeri buat ganti avatar broskie.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setFotoBaru(result.assets[0]);
    }
  };

  const handleSave = async () => {
    if (!nama.trim()) {
      Alert.alert("Validasi", "Nama tidak boleh kosong broskie!");
      return;
    }

    setIsSaving(true);
    try {
      const formData = new FormData();
      
      // Append only changed fields
      if (nama !== initialData.nama) formData.append("nama", nama);
      if (username !== (initialData.username || '')) formData.append("username", username);
      if (noHp !== (initialData.noHp || '')) formData.append("noHp", noHp);
      if (bio !== (initialData.bio || '')) formData.append("bio", bio);
      
      if (fotoBaru) {
        formData.append("avatar", {
          uri: fotoBaru.uri,
          name: "avatar.jpg",
          type: "image/jpeg"
        } as any);
      }

      await updateProfile(formData);
      
      showNotification("Sukses", "Profil berhasil diupdate!");
      router.back();
    } catch (error: any) {
      console.error(error);
      Alert.alert("Gagal", error.response?.data?.message || "Gagal menyimpan profil.");
    } finally {
      setIsSaving(false);
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={{ marginRight: 16 }} hitSlop={10}>
            <MaterialIcons name="arrow-back" size={24} color="#123924" />
          </Pressable>
          <Text style={styles.headerTitle}>Edit Profil</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>
            {/* AVATAR */}
            <View style={styles.avatarSection}>
              <Pressable onPress={pickImage} style={({ pressed }) => [styles.avatarContainer, pressed && { opacity: 0.8 }]}>
                {displayAvatarUri ? (
                  <Image source={{ uri: displayAvatarUri }} style={styles.avatarImage} />
                ) : (
                  <Text style={styles.avatarInitials}>
                    {nama.charAt(0).toUpperCase() || 'P'}
                  </Text>
                )}
                <View style={styles.avatarEditBadge}>
                  <MaterialIcons name="camera-alt" size={14} color="#FFFFFF" />
                </View>
              </Pressable>
              <Text style={styles.avatarHint}>Tap untuk ganti foto</Text>
            </View>

            {/* FORM FIELDS */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nama Lengkap *</Text>
              <TextInput
                style={styles.inputField}
                value={nama}
                onChangeText={setNama}
                placeholder="Masukkan nama"
                placeholderTextColor="#a09d91"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Username</Text>
              <TextInput
                style={styles.inputField}
                value={username}
                onChangeText={setUsername}
                placeholder="Masukkan username"
                placeholderTextColor="#a09d91"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nomor HP</Text>
              <TextInput
                style={styles.inputField}
                value={noHp}
                onChangeText={setNoHp}
                placeholder="08xxxxxxxxxx"
                placeholderTextColor="#a09d91"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Bio Singkat</Text>
              <TextInput
                style={[styles.inputField, { height: 80, paddingTop: 12 }]}
                value={bio}
                onChangeText={setBio}
                placeholder="Ceritakan sedikit tentang dirimu..."
                placeholderTextColor="#a09d91"
                multiline
                textAlignVertical="top"
              />
            </View>
          </View>
        </ScrollView>

        {/* BOTTOM ACTION */}
        <View style={styles.bottomBar}>
          <Pressable 
            style={[styles.saveButton, isSaving && { opacity: 0.7 }]}
            onPress={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color="#123924" />
            ) : (
              <>
                <MaterialIcons name="save" size={20} color="#123924" />
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
    backgroundColor: '#FBF8F0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#E8E5DA',
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Nunito_800ExtraBold',
    color: '#123924',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#123924',
    borderRadius: 24,
    padding: 20,
    boxShadow: '4px 4px 0px #123924',
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#3FA86B',
    borderWidth: 2,
    borderColor: '#123924',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 48,
    resizeMode: 'cover',
  },
  avatarInitials: {
    fontSize: 40,
    fontFamily: 'Nunito_800ExtraBold',
    color: '#FFFFFF',
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#123924',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  avatarHint: {
    marginTop: 8,
    fontSize: 12,
    fontFamily: 'Nunito_500Medium',
    color: '#5C5A4F',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: 'Nunito_700Bold',
    color: '#123924',
    marginBottom: 8,
  },
  inputField: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#123924',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    fontFamily: 'Nunito_500Medium',
    fontSize: 14,
    color: '#123924',
  },
  bottomBar: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 2,
    borderTopColor: '#E8E5DA',
  },
  saveButton: {
    backgroundColor: '#3FA86B',
    borderWidth: 2,
    borderColor: '#123924',
    borderRadius: 100,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '2px 2px 0px #123924',
    gap: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: 'Nunito_800ExtraBold',
    color: '#123924',
  }
});
