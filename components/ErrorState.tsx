import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface ErrorStateProps {
  onRetry: () => void;
  title?: string;
  subtitle?: string;
  icon?: keyof typeof MaterialIcons.glyphMap;
}

export default function ErrorState({ 
  onRetry, 
  title = "Sinyal Hilang Ditelan Bumi 🌍", 
  subtitle = "Koneksi internetmu lagi ngambek nih broskie. Cek kuota atau WiFi, trus coba lagi ya!",
  icon = "wifi-off"
}: ErrorStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrapper}>
        <MaterialIcons name={icon} size={64} color="#FF6B5C" />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      
      <Pressable 
        style={({ pressed }) => [
          styles.retryBtn,
          pressed && styles.pressedShadow
        ]}
        onPress={onRetry}
      >
        <MaterialIcons name="refresh" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
        <Text style={styles.retryText}>Coba Lagi</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: '#FBF8F0',
  },
  iconWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFE5E3',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#123924',
    marginBottom: 24,
    boxShadow: '4px 4px 0px #123924',
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
    borderWidth: 2,
    borderColor: '#123924',
    boxShadow: '4px 4px 0px #123924',
  },
  retryText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  pressedShadow: {
    boxShadow: '0px 0px 0px #123924',
    transform: [{ translateX: 4 }, { translateY: 4 }],
  }
});
