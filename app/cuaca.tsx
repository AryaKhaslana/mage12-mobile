import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Pressable, ActivityIndicator } from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import WeatherScene from '../components/WeatherScene';

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

  }, []);


  if (isLoading || !weatherData) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.neutral }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          headerShown: true,
          headerTransparent: true,
          headerTitle: "",
          headerLeft: () => (
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={COLORS.ink} />
            </Pressable>
          )
        }} 
      />
      
      {/* 1. WEATHER SCENE BACKGROUND */}
      <WeatherScene weatherCondition={weatherData.kondisi} isNight={new Date().getHours() > 18 || new Date().getHours() < 6} />

      {/* 2. HEADER INFO (Over Scene) */}
      <View style={styles.headerContainer}>
        <Text style={styles.cityName}>{weatherData.city}</Text>
        <Text style={styles.temperature}>{weatherData.suhu}°</Text>
        <View style={styles.conditionBadge}>
          <Text style={styles.conditionText}>{weatherData.kondisi}</Text>
        </View>
      </View>

      {/* 3. BOTTOM SHEET CONTENT */}
      <View style={styles.bottomSheet}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Action Card */}
          <View style={[
            styles.actionCard, 
            { backgroundColor: weatherData.pop >= 40 ? '#FFEFEA' : '#E8F5E9' }
          ]}>
            <View style={[styles.actionIconContainer, { backgroundColor: weatherData.pop >= 40 ? COLORS.coral : COLORS.primary }]}>
              <Text style={styles.actionIcon}>{weatherData.pop >= 40 ? '🚫' : '💧'}</Text>
            </View>
            <View style={styles.actionTextContainer}>
              <Text style={[styles.actionTitle, { color: weatherData.pop >= 40 ? COLORS.coral : COLORS.primary }]}>
                {weatherData.pop >= 40 ? "Tunda Siram Hari Ini" : "Aman Untuk Menyiram"}
              </Text>
              {weatherData.pop >= 40 && (
                <Text style={styles.actionSubtext}>
                  Cuaca diprediksi hujan, cegah akar busuk!
                </Text>
              )}
            </View>
          </View>

          {/* Metrics Grid */}
          <Text style={styles.sectionTitle}>Detail Cuaca</Text>
          <View style={styles.gridContainer}>
            <View style={styles.metricCard}>
              <View style={[styles.metricIconBox, { backgroundColor: '#E3F2FD' }]}>
                <Ionicons name="rainy" size={24} color="#1E88E5" />
              </View>
              <Text style={styles.metricValue}>{weatherData.pop}%</Text>
              <Text style={styles.metricLabel}>Peluang Hujan</Text>
            </View>
            <View style={styles.metricCard}>
              <View style={[styles.metricIconBox, { backgroundColor: '#E0F7FA' }]}>
                <Ionicons name="water" size={24} color="#00ACC1" />
              </View>
              <Text style={styles.metricValue}>{weatherData.humidity}%</Text>
              <Text style={styles.metricLabel}>Kelembaban</Text>
            </View>
            <View style={styles.metricCard}>
              <View style={[styles.metricIconBox, { backgroundColor: '#F3E5F5' }]}>
                <Ionicons name="leaf" size={24} color="#8E24AA" />
              </View>
              <Text style={styles.metricValue}>{weatherData.windSpeed} m/s</Text>
              <Text style={styles.metricLabel}>Kecepatan Angin</Text>
            </View>
            <View style={styles.metricCard}>
              <View style={[styles.metricIconBox, { backgroundColor: '#FFF3E0' }]}>
                <Ionicons name="sunny" size={24} color="#F4511E" />
              </View>
              <Text style={styles.metricValue}>{weatherData.uvi}</Text>
              <Text style={styles.metricLabel}>Indeks UV</Text>
            </View>
          </View>

          {/* 3 Day Forecast */}
          <Text style={styles.sectionTitle}>Prakiraan 3 Hari</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.forecastScroll}>
            {(weatherData.forecast3Days || []).map((item: any) => (
              <View key={item.id} style={styles.forecastCard}>
                <Text style={styles.forecastDay}>{item.day}</Text>
                <Ionicons name={item.icon as any} size={32} color={COLORS.ink} style={styles.forecastIcon} />
                <Text style={styles.forecastTemp}>{item.temp}°</Text>
                <View style={styles.forecastPopContainer}>
                  <Ionicons name="water" size={12} color="#1E88E5" />
                  <Text style={styles.forecastPop}>{item.pop}%</Text>
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
  backButton: {
    marginLeft: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContainer: {
    alignItems: 'center',
    marginTop: 60,
    zIndex: 10,
  },
  cityName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1B4332',
    textShadowColor: 'rgba(255,255,255,0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  temperature: {
    fontSize: 72,
    fontWeight: '900',
    color: '#1B4332',
    lineHeight: 80,
    textShadowColor: 'rgba(255,255,255,0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  conditionBadge: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 999,
    marginTop: -4,
    shadowColor: '#1B4332',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  conditionText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1B4332',
  },
  bottomSheet: {
    flex: 1,
    backgroundColor: '#FBF8F1',
    marginTop: 60,
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
    padding: 20,
    borderRadius: 24,
    marginBottom: 32,
    gap: 16,
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  actionSubtext: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.muted,
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
    borderRadius: 20,
    padding: 16,
    alignItems: 'flex-start',
    marginBottom: 16,
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
    fontWeight: '800',
    color: COLORS.ink,
    marginBottom: 2,
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '600',
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
    width: 100,
    shadowColor: '#1B4332',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginRight: 16,
  },
  forecastDay: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.muted,
    marginBottom: 8,
  },
  forecastIcon: {
    marginBottom: 8,
  },
  forecastTemp: {
    fontSize: 20,
    fontWeight: '800',
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
    fontWeight: '700',
    color: '#1E88E5',
  }
});
