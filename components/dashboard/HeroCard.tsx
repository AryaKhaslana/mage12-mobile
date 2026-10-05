import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';

export default function HeroCard({ streak, onPress }: { streak: number, onPress: () => void }) {
  const isZero = streak === 0;
  
  return (
    <Pressable 
      onPress={onPress}
      style={({ pressed }) => [
        styles.cardContainer,
        pressed && { transform: [{ scale: 0.98 }] }
      ]}
    >
      <View style={styles.card}>
        <View style={[StyleSheet.absoluteFill, { borderRadius: 24, overflow: 'hidden' }]}>
          <Svg width="100%" height="100%">
            <Defs>
              <LinearGradient id="heroGrad" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0" stopColor={isZero ? "#F6F3EB" : "#1F5C3D"} />
                <Stop offset="1" stopColor={isZero ? "#E8E5DA" : "#123924"} />
              </LinearGradient>
            </Defs>
            <Rect x="0" y="0" width="100%" height="100%" fill="url(#heroGrad)" rx="24" ry="24" />
          </Svg>
        </View>

        <View style={[styles.iconBox, { backgroundColor: '#FFB627' }]}>
          <MaterialIcons name="local-fire-department" size={28} color="#FFFFFF" />
        </View>
        
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: isZero ? '#123924' : '#FFFFFF' }]}>
            {isZero ? "Mulai Perjalananmu!" : "Kamu lagi on fire!"}
          </Text>
          <Text style={[styles.subtitle, { color: isZero ? '#5C5A4F' : 'rgba(255,255,255,0.75)' }]}>
            {isZero 
              ? "Siram tanamanmu hari ini untuk mulai streak."
              : "Pertahankan streak-mu dengan nyiram hari ini."}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    marginHorizontal: 24,
    marginTop: 16,
    shadowColor: '#123924',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  },
  card: {
    borderRadius: 24,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  textContainer: {
    flex: 1,
    marginLeft: 16,
    zIndex: 1,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Nunito_800ExtraBold',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: 'Nunito_500Medium',
  },
});
