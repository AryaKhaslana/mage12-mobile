import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { clearInFlightRequests } from '../services/api';

interface ErrorStateProps {
  onRetry: () => void | Promise<any>;
  title?: string;
  subtitle?: string;
  icon?: keyof typeof MaterialIcons.glyphMap;
  isRetrying?: boolean;
}

export default function ErrorState({ 
  onRetry, 
  title = "Koneksi Internet Terputus", 
  subtitle = "Kami tidak dapat terhubung ke server. Silakan periksa koneksi data atau Wi-Fi kamu, lalu coba lagi.",
  icon = "wifi-off",
  isRetrying = false
}: ErrorStateProps) {
  const [internalLoading, setInternalLoading] = useState(false);
  const activeLoading = Boolean(isRetrying || internalLoading);

  const handleRetry = async () => {
    if (activeLoading) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    } catch {}

    clearInFlightRequests();

    if (onRetry) {
      try {
        setInternalLoading(true);
        await Promise.resolve(onRetry());
      } finally {
        setInternalLoading(false);
      }
    }
  };

  return (
    <ScrollView
      style={styles.scrollWrapper}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={activeLoading}
          onRefresh={handleRetry}
          colors={["#3FA86B"]}
          tintColor="#3FA86B"
        />
      }
    >
      <Image 
        source={require('../assets/images/icontampilanawal/seedling-ngantuk.svg')} 
        style={{ width: 140, height: 140, marginBottom: 24 }} 
        contentFit="contain"
      />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      
      <Pressable 
        style={({ pressed }) => [
          styles.retryBtn,
          activeLoading && { opacity: 0.8 },
          pressed && !activeLoading && styles.pressedShadow
        ]}
        onPress={handleRetry}
        disabled={activeLoading}
      >
        {activeLoading ? (
          <>
            <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.retryText}>Menghubungkan...</Text>
          </>
        ) : (
          <>
            <MaterialIcons name="refresh" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.retryText}>Coba Lagi</Text>
          </>
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollWrapper: {
    flex: 1,
    backgroundColor: '#FBF8F0',
  },
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingBottom: 60,
    backgroundColor: '#FBF8F0',
  },
  iconWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFE5E3',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0,
    marginBottom: 24,
    shadowColor: "#123924",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
  },
  title: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 22,
    color: '#123924',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontFamily: 'Nunito_500Medium',
    fontSize: 14,
    color: '#5C5A4F',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B5C',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 24,
    borderWidth: 0,
    shadowColor: "#123924",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
  },
  retryText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  pressedShadow: {
    shadowColor: "#123924",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
    transform: [{ scale: 0.98 }],
  },
});
