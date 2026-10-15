import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, Pressable, ActivityIndicator, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import * as Haptics from 'expo-haptics';
import { updateProfile } from '../../services/api';

interface ProfileOnboardingModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSuccess: (newUsername: string) => void;
}

export default function ProfileOnboardingModal({ isVisible, onClose, onSuccess }: ProfileOnboardingModalProps) {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const submitLockRef = useRef(false);

  const handleTextChange = (text: string) => {
    // Sanitasi input username secara real-time
    const clean = text
      .toLowerCase()
      .replace(/^@/, '')
      .replace(/\s+/g, '')
      .replace(/[^a-z0-9_.]/g, '');
    setUsername(clean);
    if (errorMsg) setErrorMsg('');
  };

  const handleSubmit = async () => {
    if (submitLockRef.current) return;

    const cleanUsername = username
      .toLowerCase()
      .replace(/^@/, '')
      .replace(/\s+/g, '')
      .replace(/[^a-z0-9_.]/g, '');

    if (!cleanUsername) {
      setErrorMsg('Username tidak boleh kosong.');
      return;
    }

    if (cleanUsername.length < 3) {
      setErrorMsg('Username minimal 3 karakter.');
      return;
    }

    submitLockRef.current = true;
    setIsLoading(true);
    setErrorMsg('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});

    try {
      const formData = new FormData();
      formData.append('username', cleanUsername);

      const updatedUser = await updateProfile(formData);

      // Simpan pembaruan ke SecureStore userData
      const storedStr = await SecureStore.getItemAsync('userData');
      const cached = storedStr ? JSON.parse(storedStr) : {};
      const merged = {
        ...cached,
        ...(updatedUser || {}),
        username: cleanUsername,
      };
      await SecureStore.setItemAsync('userData', JSON.stringify(merged));

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      onSuccess(cleanUsername);
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      if (error.response?.status === 409) {
        setErrorMsg('Username ini sudah digunakan, silakan pilih nama lain.');
      } else {
        setErrorMsg(error.response?.data?.message || 'Gagal menyimpan username, silakan coba lagi.');
      }
    } finally {
      setIsLoading(false);
      submitLockRef.current = false;
    }
  };

  const handleSkip = () => {
    if (isLoading) return;
    Haptics.selectionAsync().catch(() => {});
    onClose();
  };

  return (
    <Modal visible={isVisible} transparent animationType="fade" onRequestClose={handleSkip}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.overlay}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
          >
            <View style={styles.card}>
              
              <View style={styles.iconCircle}>
                <Ionicons name="at-outline" size={32} color="#3FA86B" />
              </View>

              <Text style={styles.title}>Buat Username Terlebih Dahulu</Text>
              <Text style={styles.subtitle}>
                Agar teman-teman di Komunitas dapat mengenali profil kamu dengan mudah. (Dapat diubah kapan saja)
              </Text>

              <View style={styles.inputContainer}>
                <Ionicons name="at-outline" size={20} color="#8F9B94" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="nama_pengguna"
                  placeholderTextColor="#8F9B94"
                  value={username}
                  onChangeText={handleTextChange}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

              <Pressable 
                style={({ pressed }) => [styles.submitButton, pressed && styles.submitButtonPressed]}
                onPress={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitButtonText}>Simpan Username</Text>
                )}
              </Pressable>

              <Pressable 
                style={({ pressed }) => [styles.skipButton, pressed && styles.skipButtonPressed]}
                onPress={handleSkip}
                disabled={isLoading}
              >
                <Text style={styles.skipButtonText}>Lewati untuk Sekarang</Text>
              </Pressable>

            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(18, 57, 36, 0.45)',
    justifyContent: 'center',
    padding: 24,
  },
  container: {
    width: '100%',
  },
  card: {
    backgroundColor: '#FBF8F0',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8E5DC',
    shadowColor: '#123924',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 20,
    color: '#123924',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Nunito_500Medium',
    fontSize: 14,
    color: '#5C5A4F',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    width: '100%',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E8E5DC',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 16,
    color: '#123924',
  },
  errorText: {
    fontFamily: 'Nunito_600SemiBold',
    color: '#DC2626',
    fontSize: 13,
    marginBottom: 16,
    textAlign: 'center',
    alignSelf: 'stretch',
  },
  submitButton: {
    backgroundColor: '#3FA86B',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginBottom: 12,
    shadowColor: '#3FA86B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonPressed: {
    backgroundColor: '#35905B',
    transform: [{ scale: 0.98 }],
  },
  submitButtonText: {
    fontFamily: 'Nunito_700Bold',
    color: '#FFFFFF',
    fontSize: 16,
  },
  skipButton: {
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    borderRadius: 16,
  },
  skipButtonPressed: {
    backgroundColor: 'rgba(18, 57, 36, 0.05)',
  },
  skipButtonText: {
    fontFamily: 'Nunito_600SemiBold',
    color: '#5C5A4F',
    fontSize: 14,
  },
});
