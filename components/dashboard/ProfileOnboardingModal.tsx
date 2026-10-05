import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, Pressable, ActivityIndicator, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';

interface ProfileOnboardingModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSuccess: (newUsername: string) => void;
}

export default function ProfileOnboardingModal({ isVisible, onClose, onSuccess }: ProfileOnboardingModalProps) {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async () => {
    if (!username.trim()) {
      setErrorMsg('Username kaga boleh kosong broskie!');
      return;
    }
    
    setIsLoading(true);
    setErrorMsg('');
    try {
      // Normalisasi (sama kayak di backend, biar rapi)
      const cleanUsername = username.toLowerCase().replace(/\s+/g, '').replace(/^@/, '');
      
      await api.put('/user/me', { username: cleanUsername });
      onSuccess(cleanUsername);
    } catch (error: any) {
      if (error.response?.status === 409) {
        setErrorMsg('Username udah dipake orang lain, cari nama lain yak!');
      } else {
        setErrorMsg(error.response?.data?.message || 'Gagal nyimpen username, coba lagi deh.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal visible={isVisible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.overlay}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
          >
            <View style={styles.card}>
              
              <View style={styles.iconCircle}>
                <Ionicons name="at-outline" size={32} color="#3FA96B" />
              </View>

              <Text style={styles.title}>Bikin Username Dulu Yuk!</Text>
              <Text style={styles.subtitle}>
                Biar temen-temen di Komunitas gampang nemuin profil lu. (Bisa diganti nanti)
              </Text>

              <View style={styles.inputContainer}>
                <Ionicons name="at-outline" size={20} color="#A0AAB5" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="username_keren"
                  placeholderTextColor="#A0AAB5"
                  value={username}
                  onChangeText={(text) => {
                    setUsername(text);
                    setErrorMsg('');
                  }}
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
                onPress={onClose}
                disabled={isLoading}
              >
                <Text style={styles.skipButtonText}>Lewati Dulu (Skip)</Text>
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
    backgroundColor: 'rgba(26, 35, 126, 0.4)', // Soft navy overlay
    justifyContent: 'center',
    padding: 24,
  },
  container: {
    width: '100%',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#3FA96B',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
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
    fontSize: 20,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7FAFC',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    width: '100%',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#2D3748',
  },
  errorText: {
    color: '#E53E3E',
    fontSize: 12,
    marginBottom: 16,
    textAlign: 'center',
    alignSelf: 'stretch',
  },
  submitButton: {
    backgroundColor: '#3FA96B',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginBottom: 12,
    shadowColor: '#3FA96B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonPressed: {
    backgroundColor: '#35905B',
    transform: [{ scale: 0.98 }],
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  skipButton: {
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    borderRadius: 16,
  },
  skipButtonPressed: {
    backgroundColor: '#F7FAFC',
  },
  skipButtonText: {
    color: '#A0AAB5',
    fontSize: 14,
    fontWeight: '600',
  },
});
