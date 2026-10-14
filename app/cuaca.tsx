import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, RefreshControl } from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import WeatherScene from '../components/WeatherScene';

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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isError, setIsError] = useState(false);

  const insets = useSafeAreaInsets();
  const isFetchingRef = useRef<boolean>(false);

  const fetchWeather = useCallback(async (isSilent = false, isManualRefresh = false) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    if (isManualRefresh) {
      setIsRefreshing(true);
    } else if (!isSilent) {
      setIsLoading(true);
    }
    setIsError(false);

    try {
      const response = await api.get('/weather/today');
      if (response.data?.status === 'success' && response.data?.data) {
        const freshData = response.data.data;
        setWeatherData(freshData);
        AsyncStorage.setItem(
          'dashboard_weather',
          JSON.stringify({ data: freshData, savedAt: Date.now() })
        ).catch(() => {});
      } else {
        setWeatherData((prev: any) => {
          if (!prev) setIsError(true);
          return prev;
        });
      }
    } catch (error) {
      console.error('Gagal memuat cuaca:', error);
      setWeatherData((prev: any) => {
        if (!prev) setIsError(true);
        return prev;
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      isFetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const initWeather = async () => {
      try {
        const cached = await AsyncStorage.getItem('dashboard_weather');
        let hasValidCache = false;
        let cacheAge = Infinity;

        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            const data = parsed.data || parsed;
            if (data && isMounted) {
              setWeatherData(data);
              setIsLoading(false);
              hasValidCache = true;
            }
            if (parsed.savedAt) {
              cacheAge = Date.now() - parsed.savedAt;
            }
          } catch (e) {
            console.warn('Gagal parse cache cuaca:', e);
          }
        }

        const FIFTEEN_MINUTES = 15 * 60 * 1000;
        if (!hasValidCache) {
          await fetchWeather(false, false);
        } else if (cacheAge > FIFTEEN_MINUTES) {
          fetchWeather(true, false);
        }
      } catch (e) {
        console.warn('Gagal membaca cache dashboard_weather:', e);
        if (!weatherData) {
          fetchWeather(false, false);
        }
      }
    };

    initWeather();

    return () => {
      isMounted = false;
    };
  }, [fetchWeather]);

  const onRefresh = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    fetchWeather(true, true);
  }, [fetchWeather]);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const hour = new Date().getHours();
  const isNight = hour >= 18 || hour < 6;

  // LOADING STATE WITH VISIBLE BACK BUTTON
  if (isLoading && !weatherData) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <Pressable
          onPress={handleBack}
          style={({ pressed }) => [
            styles.absoluteBackButton,
            { top: insets.top + 12 },
            pressed && styles.btnPressed
          ]}
          accessibilityLabel="Kembali"
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.ink} />
        </Pressable>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Memuat Prakiraan Cuaca...</Text>
      </View>
    );
  }

  // ERROR STATE WITH RETRY AND BACK BUTTON
  if (isError && !weatherData) {
    return (
      <View style={[styles.container, styles.errorContainer, { paddingTop: insets.top + 20 }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <Pressable
          onPress={handleBack}
          style={({ pressed }) => [
            styles.absoluteBackButton,
            { top: insets.top + 12 },
            pressed && styles.btnPressed
          ]}
          accessibilityLabel="Kembali"
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.ink} />
        </Pressable>
        <Ionicons name="cloud-offline-outline" size={64} color={COLORS.muted} style={{ marginBottom: 16 }} />
        <Text style={styles.errorTitle}>Gagal Memuat Cuaca</Text>
        <Text style={styles.errorSubtitle}>
          Terjadi gangguan koneksi atau lokasi belum diatur. Silakan periksa kembali koneksi internet dan pengaturan lokasi kebun kamu.
        </Text>
        <Pressable
          onPress={() => fetchWeather(false, false)}
          style={({ pressed }) => [styles.retryButton, pressed && styles.btnPressed]}
        >
          <Text style={styles.retryButtonText}>Coba Lagi</Text>
        </Pressable>
      </View>
    );
  }

  const popVal = Number(weatherData?.pop) || 0;
  const isRainPredicted = Boolean(weatherData?.prediksiHujanHariIni) || popVal >= 60;

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* CUSTOM BACK BUTTON */}
      <Pressable
        onPress={handleBack}
        style={({ pressed }) => [
          styles.absoluteBackButton,
          { top: insets.top + 12 },
          pressed && styles.btnPressed
        ]}
        accessibilityLabel="Kembali"
      >
        <Ionicons name="arrow-back" size={24} color={COLORS.ink} />
      </Pressable>

      {/* 1. WEATHER SCENE BACKGROUND */}
      <WeatherScene
        weatherCondition={weatherData?.kondisi || 'Cerah'}
        isNight={isNight}
      />

      {/* 2. BOTTOM SHEET CONTENT */}
      <View style={styles.bottomSheet}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
        >
          {/* Header Info (Lokasi, Suhu, Kondisi) */}
          <View style={styles.headerContainer}>
            <View style={styles.cityRow}>
              <Ionicons name="location-sharp" size={18} color={COLORS.primary} />
              <Text style={styles.cityName}>{weatherData?.city || 'Kebun Anda'}</Text>
            </View>
            <Text style={styles.temperature}>
              {Math.round(Number(weatherData?.suhu) || 0)}°
            </Text>
            <View style={styles.conditionBadge}>
              <Text style={styles.conditionText}>
                {weatherData?.kondisi || 'Cerah'}
              </Text>
            </View>
          </View>

          {/* Action Card: Rekomendasi Bertani */}
          <View
            style={[
              styles.actionCard,
              {
                backgroundColor: isRainPredicted ? '#FEF3C7' : '#E8F5E9',
                borderColor: isRainPredicted ? '#FDE68A' : 'rgba(63, 168, 107, 0.25)',
                borderWidth: 1
              }
            ]}
          >
            <View
              style={[
                styles.actionIconContainer,
                { backgroundColor: isRainPredicted ? '#FDE68A' : '#C8E6C9' }
              ]}
            >
              <Ionicons
                name={isRainPredicted ? 'umbrella' : 'water'}
                size={24}
                color={isRainPredicted ? '#B45309' : '#1B4332'}
              />
            </View>
            <View style={styles.actionTextContainer}>
              <Text
                style={[
                  styles.actionTitle,
                  { color: isRainPredicted ? '#92400E' : '#1B4332' }
                ]}
              >
                {isRainPredicted
                  ? 'Penyiraman Ditunda Otomatis'
                  : 'Waktu Ideal untuk Menyiram'}
              </Text>
              <Text style={styles.actionSubtext}>
                {isRainPredicted
                  ? 'Potensi hujan tinggi hari ini. Penyiraman ditunda untuk menjaga kelembapan tanah dan mencegah pembusukan akar.'
                  : 'Kondisi cuaca bersahabat. Lakukan penyiraman rutin sesuai jadwal agar nutrisi terserap maksimal.'}
              </Text>
            </View>
          </View>

          {/* Metrics Grid */}
          <Text style={styles.sectionTitle}>Detail Cuaca</Text>
          <View style={styles.gridContainer}>
            <View style={styles.metricCard}>
              <View style={[styles.metricIconBox, { backgroundColor: '#E3F2FD' }]}>
                <Ionicons name="rainy" size={24} color="#1E88E5" />
              </View>
              <Text style={styles.metricValue}>
                {Math.round(Number(weatherData?.pop) || 0)}%
              </Text>
              <Text style={styles.metricLabel}>Peluang Hujan</Text>
            </View>
            <View style={styles.metricCard}>
              <View style={[styles.metricIconBox, { backgroundColor: '#E0F7FA' }]}>
                <Ionicons name="water" size={24} color="#00ACC1" />
              </View>
              <Text style={styles.metricValue}>
                {Math.round(Number(weatherData?.humidity) || 0)}%
              </Text>
              <Text style={styles.metricLabel}>Kelembaban</Text>
            </View>
            <View style={styles.metricCard}>
              <View style={[styles.metricIconBox, { backgroundColor: '#F3E5F5' }]}>
                <Ionicons name="leaf" size={24} color="#8E24AA" />
              </View>
              <Text style={styles.metricValue}>
                {Math.round(Number(weatherData?.windSpeed) || 0)} m/s
              </Text>
              <Text style={styles.metricLabel}>Kecepatan Angin</Text>
            </View>
            <View style={styles.metricCard}>
              <View style={[styles.metricIconBox, { backgroundColor: '#FFF3E0' }]}>
                <Ionicons name="sunny" size={24} color="#F4511E" />
              </View>
              <Text style={styles.metricValue}>
                {typeof weatherData?.uvi === 'number' ? weatherData.uvi : (weatherData?.uvi || 0)}
              </Text>
              <Text style={styles.metricLabel}>Indeks UV</Text>
            </View>
          </View>

          {/* 5 Day Forecast */}
          <Text style={styles.sectionTitle}>Prakiraan 5 Hari</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.forecastScroll}
          >
            {(weatherData?.forecast5Days || weatherData?.forecast3Days || []).map((item: any, index: number) => (
              <View key={item.id || item.day || index} style={styles.forecastCard}>
                <Text style={styles.forecastDay}>{item.day}</Text>
                <Ionicons
                  name={item.icon as any}
                  size={32}
                  color={COLORS.ink}
                  style={styles.forecastIcon}
                />
                <Text style={styles.forecastTemp}>
                  {Math.round(Number(item.temp) || 0)}°
                </Text>
                <View style={styles.forecastPopContainer}>
                  <Ionicons name="water" size={12} color="#1E88E5" />
                  <Text style={styles.forecastPop}>
                    {Math.round(Number(item.pop) || 0)}%
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>
          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.neutral,
  },
  absoluteBackButton: {
    position: 'absolute',
    left: 16,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99,
    borderWidth: 1,
    borderColor: 'rgba(18, 57, 36, 0.08)',
    shadowColor: '#123924',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  btnPressed: {
    transform: [{ scale: 0.95 }],
    opacity: 0.85
  },
  loadingText: {
    marginTop: 14,
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: COLORS.muted
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24
  },
  errorTitle: {
    fontSize: 18,
    fontFamily: 'Nunito_800ExtraBold',
    color: COLORS.ink,
    textAlign: 'center',
    marginBottom: 8
  },
  errorSubtitle: {
    fontSize: 14,
    fontFamily: 'Nunito_500Medium',
    color: COLORS.muted,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 100,
    shadowColor: '#123924',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Nunito_700Bold',
    fontSize: 14
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  cityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  cityName: {
    fontSize: 22,
    fontFamily: 'Nunito_800ExtraBold',
    color: '#1B4332',
  },
  temperature: {
    fontSize: 64,
    fontFamily: 'Nunito_800ExtraBold',
    color: '#1B4332',
    lineHeight: 72,
  },
  conditionBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 999,
    marginTop: 4,
    borderWidth: 1,
    borderColor: 'rgba(63, 168, 107, 0.25)',
  },
  conditionText: {
    fontSize: 15,
    fontFamily: 'Nunito_700Bold',
    color: '#1B4332',
  },
  bottomSheet: {
    flex: 1,
    backgroundColor: '#FBF8F1',
    marginTop: 210,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 10,
    zIndex: 10,
  },
  scrollContent: {
    padding: 24,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    marginBottom: 24,
    gap: 14,
    shadowColor: '#1B4332',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  actionIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 15,
    fontFamily: 'Nunito_800ExtraBold',
    marginBottom: 4,
  },
  actionSubtext: {
    fontSize: 12,
    fontFamily: 'Nunito_500Medium',
    color: COLORS.muted,
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Nunito_800ExtraBold',
    color: COLORS.ink,
    marginBottom: 16,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  metricCard: {
    width: '48%',
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 16,
    alignItems: 'flex-start',
    marginBottom: 14,
    shadowColor: '#1B4332',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  metricIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  metricValue: {
    fontSize: 20,
    fontFamily: 'Nunito_800ExtraBold',
    color: COLORS.ink,
    marginBottom: 2,
  },
  metricLabel: {
    fontSize: 12,
    fontFamily: 'Nunito_500Medium',
    color: COLORS.muted,
  },
  forecastScroll: {
    paddingBottom: 8,
    paddingRight: 20,
  },
  forecastCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    width: 104,
    shadowColor: '#1B4332',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginRight: 12,
  },
  forecastDay: {
    fontSize: 14,
    fontFamily: 'Nunito_700Bold',
    color: COLORS.muted,
    marginBottom: 8,
  },
  forecastIcon: {
    marginBottom: 8,
  },
  forecastTemp: {
    fontSize: 20,
    fontFamily: 'Nunito_800ExtraBold',
    color: COLORS.ink,
    marginBottom: 8,
  },
  forecastPopContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  forecastPop: {
    fontSize: 12,
    fontFamily: 'Nunito_700Bold',
    color: '#1E88E5',
  }
});
