import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Pressable, ActivityIndicator } from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing
} from 'react-native-reanimated';
import api from '../services/api';

// Colors dari design.md
const COLORS = {
  primary: "#3FA86B",
  secondary: "#1F5C3D",
  ink: "#123924",
  amber: "#FFB627",
  coral: "#FF6B5C",
  teal: "#2E9E8C",
  neutral: "#FBF8F0",
  surface: "#FFFFFF",
  onPrimary: "#FFFFFF",
  onNeutral: "#26251F",
  muted: "#5C5A4F"
};

export default function CuacaScreen() {
  const [weatherData, setWeatherData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Animasi Mascot (Floating)
  const translateY = useSharedValue(0);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await api.get('/weather/today');
        if (response.data?.status === 'success') {
          setWeatherData(response.data.data);
        }
      } catch (error) {
        console.error("Gagal load cuaca:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchWeather();

    translateY.value = withRepeat(
      withSequence(
        withTiming(-10, { duration: 750, easing: Easing.inOut(Easing.ease) }),
        withTiming(10, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 750, easing: Easing.inOut(Easing.ease) })
      ),
      -1, // Infinite
      true // Reverse
    );
  }, []);

  const mascotAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }]
    };
  });

  if (isLoading || !weatherData) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.neutral }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen 
        options={{ 
          title: "Cuaca Kebun", 
          headerShown: true,
          headerStyle: { backgroundColor: COLORS.neutral },
          headerTintColor: COLORS.ink,
          headerTitleStyle: { fontWeight: '800' },
          headerShadowVisible: false,
          headerLeft: () => (
            <Pressable onPress={() => router.back()} style={{ marginLeft: 16 }}>
              <Ionicons name="arrow-back" size={24} color={COLORS.ink} />
            </Pressable>
          )
        }} 
      />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* 1. HEADER & INFO UTAMA */}
        <View style={styles.headerContainer}>
          <View style={styles.locationRow}>
            <Ionicons name="location" size={24} color={COLORS.coral} />
            <Text style={styles.cityName}>{weatherData.city}</Text>
          </View>
          <View style={styles.tempContainer}>
            <Text style={styles.temperature}>{weatherData.suhu}°</Text>
            <View style={styles.conditionBadge}>
              <Text style={styles.conditionText}>{weatherData.kondisi}</Text>
            </View>
          </View>
        </View>

        {/* 2. ANIMASI MASKOT (Reanimated) */}
        <View style={styles.mascotContainer}>
          <Animated.Image 
            source={{ uri: 'https://api.dicebear.com/7.x/bottts/png?seed=TaniSync&backgroundColor=FBF8F0' }}
            style={[styles.mascotImage, mascotAnimatedStyle]}
          />
        </View>

        {/* 3. KARTU KEPUTUSAN SIRAM (Action Card) */}
        <View style={[
          styles.actionCard, 
          { backgroundColor: weatherData.pop >= 40 ? COLORS.coral : COLORS.primary }
        ]}>
          <View style={styles.actionIconContainer}>
            <Text style={styles.actionIcon}>{weatherData.pop >= 40 ? '🚫💧' : '💧'}</Text>
          </View>
          <View style={styles.actionTextContainer}>
            <Text style={[styles.actionTitle, { color: weatherData.pop >= 40 ? COLORS.surface : COLORS.onPrimary }]}>
              {weatherData.pop >= 40 ? "Tunda Siram Hari Ini!" : "Waktunya Menyiram!"}
            </Text>
            {weatherData.pop >= 40 && (
              <Text style={styles.actionSubtext}>
                Cuaca diprediksi hujan, cegah akar busuk!
              </Text>
            )}
          </View>
        </View>

        {/* 4. GRID METRIK AGRIKULTUR (2x2) */}
        <Text style={styles.sectionTitle}>Metrik Agrikultur</Text>
        <View style={styles.gridContainer}>
          {/* Item 1: PoP */}
          <View style={styles.metricCard}>
            <View style={[styles.metricIconBox, { backgroundColor: '#E3F2FD' }]}>
              <Ionicons name="rainy" size={24} color="#1E88E5" />
            </View>
            <Text style={styles.metricValue}>{weatherData.pop}%</Text>
            <Text style={styles.metricLabel}>Peluang Hujan</Text>
          </View>

          {/* Item 2: Humidity */}
          <View style={styles.metricCard}>
            <View style={[styles.metricIconBox, { backgroundColor: '#E0F7FA' }]}>
              <Ionicons name="water" size={24} color="#00ACC1" />
            </View>
            <Text style={styles.metricValue}>{weatherData.humidity}%</Text>
            <Text style={styles.metricLabel}>Kelembaban</Text>
          </View>

          {/* Item 3: Wind */}
          <View style={styles.metricCard}>
            <View style={[styles.metricIconBox, { backgroundColor: '#F3E5F5' }]}>
              <Ionicons name="leaf" size={24} color="#8E24AA" />
            </View>
            <Text style={styles.metricValue}>{weatherData.windSpeed} m/s</Text>
            <Text style={styles.metricLabel}>Kecepatan Angin</Text>
          </View>

          {/* Item 4: UVI */}
          <View style={styles.metricCard}>
            <View style={[styles.metricIconBox, { backgroundColor: '#FFF3E0' }]}>
              <Ionicons name="sunny" size={24} color="#F4511E" />
            </View>
            <Text style={styles.metricValue}>{weatherData.uvi}</Text>
            <Text style={styles.metricLabel}>Indeks UV</Text>
          </View>
        </View>

        {/* 5. PRAKIRAAN 3 HARI KE DEPAN */}
        <Text style={styles.sectionTitle}>Prakiraan 3 Hari</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.forecastScroll}>
          {(weatherData.forecast3Days || []).map((item: any) => (
            <View key={item.id} style={styles.forecastCard}>
              <Text style={styles.forecastDay}>{item.day}</Text>
              <Ionicons name={item.icon as any} size={32} color={COLORS.ink} style={styles.forecastIcon} />
              <Text style={styles.forecastTemp}>{item.temp}°</Text>
              <View style={styles.forecastPopContainer}>
                <Ionicons name="water" size={12} color={COLORS.primary} />
                <Text style={styles.forecastPop}>{item.pop}%</Text>
              </View>
            </View>
          ))}
        </ScrollView>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.neutral,
  },
  container: {
    padding: 20,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  cityName: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.ink,
  },
  tempContainer: {
    alignItems: 'center',
  },
  temperature: {
    fontSize: 72,
    fontWeight: '900',
    color: COLORS.ink,
    lineHeight: 80,
  },
  conditionBadge: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: COLORS.ink,
    marginTop: -4,
  },
  conditionText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.ink,
  },
  mascotContainer: {
    backgroundColor: COLORS.neutral,
    borderWidth: 2,
    borderColor: COLORS.ink,
    borderRadius: 24, // rounded-xl
    width: '100%',
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    // Solid Neobrutalism Shadow
    shadowColor: COLORS.ink,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
  mascotImage: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.ink,
    marginBottom: 32,
    gap: 16,
    // Solid Neobrutalism Shadow
    shadowColor: COLORS.ink,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: COLORS.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIcon: {
    fontSize: 24,
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  actionSubtext: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.surface,
    opacity: 0.9,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.ink,
    marginBottom: 16,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  metricCard: {
    width: '48%',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: COLORS.ink,
    alignItems: 'flex-start',
    marginBottom: 16,
    // Solid Neobrutalism Shadow
    shadowColor: COLORS.ink,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  metricIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: COLORS.ink,
  },
  metricValue: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.ink,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.muted,
  },
  forecastScroll: {
    paddingBottom: 8,
    paddingRight: 20,
  },
  forecastCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: COLORS.ink,
    alignItems: 'center',
    width: 100,
    // Solid Neobrutalism Shadow
    shadowColor: COLORS.ink,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
    marginRight: 16,
  },
  forecastDay: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.ink,
    marginBottom: 8,
  },
  forecastIcon: {
    marginBottom: 8,
  },
  forecastTemp: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.ink,
    marginBottom: 8,
  },
  forecastPopContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.neutral,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.ink,
  },
  forecastPop: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.ink,
  }
});
