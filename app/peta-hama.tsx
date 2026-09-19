import React, { useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, ScrollView, Alert } from 'react-native';
import MapView, { Circle } from 'react-native-maps';
import { router, useFocusEffect } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import api from '../services/api';
import { SafeAreaView } from 'react-native-safe-area-context';

interface HeatmapCell {
  lat: number;
  lng: number;
  weight: number;
}

interface HeatmapResponse {
  hama: string;
  total_laporan: number;
  cells?: HeatmapCell[];
}

export default function PetaHamaScreen() {
  const [filter, setFilter] = useState("semua");
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<HeatmapResponse | null>(null);
  
  // Default Region: Surabaya - Sidoarjo
  const defaultRegion = {
    latitude: -7.35,
    longitude: 112.73,
    latitudeDelta: 0.4,
    longitudeDelta: 0.4,
  };

  const fetchHeatmap = async (selectedFilter: string) => {
    setIsLoading(true);
    try {
      const response = await api.get(`/heatmap?hama=${selectedFilter}`);
      if (response.data && response.data.status === 'success') {
        setData(response.data.data);
      }
    } catch (error: any) {
      console.error(error);
      Alert.alert("Gagal Memuat Peta", "Terjadi kesalahan saat mengambil data wabah hama.");
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchHeatmap(filter);
    }, [])
  );

  const handleFilterChange = (newFilter: string) => {
    if (newFilter === filter) return;
    setFilter(newFilter);
    fetchHeatmap(newFilter);
  };

  const getHeatColor = (weight: number) => {
    if (weight >= 5) return { fill: 'rgba(220, 38, 38, 0.45)', stroke: 'rgba(220, 38, 38, 0.8)' }; // Red
    if (weight >= 3) return { fill: 'rgba(249, 115, 22, 0.45)', stroke: 'rgba(249, 115, 22, 0.8)' }; // Orange
    return { fill: 'rgba(250, 204, 21, 0.45)', stroke: 'rgba(250, 204, 21, 0.8)' }; // Yellow
  };

  const filters = ["semua", "kutu-putih", "wereng", "ulat"];
  const filterLabels: Record<string, string> = {
    "semua": "Semua Hama",
    "kutu-putih": "Kutu Putih",
    "wereng": "Wereng",
    "ulat": "Ulat"
  };

  const cells = data?.cells || [];

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={({pressed}) => [styles.backBtn, pressed && styles.btnPressed]}>
          <MaterialIcons name="arrow-back" size={24} color="#123924" />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>🗺️ Peta Wabah Hama</Text>
          <Text style={styles.subtitle}>Pantauan real-time laporan petani di Surabaya & Sidoarjo</Text>
        </View>
      </View>

      {/* STATS CARD & FILTERS */}
      <View style={styles.statsContainer}>
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>🔥 {data?.total_laporan || 0} Laporan Wabah Aktif</Text>
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {filters.map((f) => (
            <Pressable 
              key={f} 
              onPress={() => handleFilterChange(f)}
              style={({pressed}) => [
                styles.filterChip, 
                filter === f && styles.filterChipActive,
                pressed && styles.btnPressed
              ]}
            >
              <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
                {filterLabels[f]}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* MAP VIEW */}
      <View style={styles.mapContainer}>
        <MapView 
          style={styles.map} 
          initialRegion={defaultRegion}
          provider="google"
        >
          {cells.map((cell, index) => {
            const colors = getHeatColor(cell.weight);
            return (
              <Circle
                key={index}
                center={{ latitude: cell.lat, longitude: cell.lng }}
                radius={1500 + (cell.weight * 500)}
                fillColor={colors.fill}
                strokeColor={colors.stroke}
                strokeWidth={2}
              />
            );
          })}
        </MapView>
        
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#3FA86B" />
          </View>
        )}
        
        {!isLoading && cells.length === 0 && (
          <View style={styles.emptyOverlay}>
            <Text style={styles.emptyText}>Belum ada laporan di area ini 🌱</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FBF8F0' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 24, 
    borderBottomWidth: 4, 
    borderColor: '#123924', 
    backgroundColor: '#FFECEB' 
  },
  backBtn: {
    backgroundColor: '#FFFFFF',
    padding: 8,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: '#123924',
    boxShadow: '2px 2px 0px #123924',
    marginRight: 16
  },
  btnPressed: {
    boxShadow: '0px 0px 0px #123924',
    transform: [{ translateX: 2 }, { translateY: 2 }]
  },
  title: { fontFamily: 'Nunito_800ExtraBold', fontSize: 20, color: '#123924', marginBottom: 4 },
  subtitle: { fontFamily: 'Nunito_500Medium', fontSize: 12, color: '#5C5A4F', lineHeight: 18 },
  statsContainer: {
    padding: 24,
    paddingBottom: 16,
    borderBottomWidth: 4, 
    borderColor: '#123924',
    backgroundColor: '#FFFFFF'
  },
  statsCard: {
    backgroundColor: '#FFB627',
    padding: 16,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#123924',
    boxShadow: '4px 4px 0px #123924',
    alignItems: 'center',
    marginBottom: 20
  },
  statsTitle: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 18,
    color: '#123924'
  },
  filterScroll: { gap: 12, paddingRight: 24 },
  filterChip: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: '#123924',
    boxShadow: '2px 2px 0px #123924',
  },
  filterChipActive: {
    backgroundColor: '#3FA86B',
  },
  filterText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: '#5C5A4F'
  },
  filterTextActive: {
    color: '#FFFFFF'
  },
  mapContainer: {
    flex: 1,
    position: 'relative'
  },
  map: {
    width: '100%',
    height: '100%'
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  emptyOverlay: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: '#123924',
    boxShadow: '4px 4px 0px #123924',
  },
  emptyText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 14,
    color: '#123924'
  }
});
