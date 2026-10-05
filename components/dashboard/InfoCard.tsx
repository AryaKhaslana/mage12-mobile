import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function InfoCard({ onPress }: { onPress: () => void }) {
  return (
    <Pressable 
      style={({ pressed }) => [
        styles.card,
        pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] }
      ]} 
      onPress={onPress}
    >
      <View style={styles.iconBox}>
        <MaterialIcons name="map" size={24} color="#52A875" />
      </View>
      <View style={styles.info}>
        <Text style={styles.title}>Peta Wabah Hama</Text>
        <Text style={styles.subtitle}>Pantau kondisi sekitar kebunmu</Text>
      </View>
      <MaterialIcons name="chevron-right" size={24} color="#8F9B94" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#1B4332',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#E5F5EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontFamily: 'Nunito_800ExtraBold',
    color: '#1B4332',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: 'Nunito_500Medium',
    color: '#5C5A4F',
  }
});
