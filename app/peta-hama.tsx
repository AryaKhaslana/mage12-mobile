import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, ScrollView, Alert } from 'react-native';
// import MapView, { Circle } from 'react-native-maps';
import { WebView } from 'react-native-webview';
import { router, useFocusEffect, Stack } from 'expo-router';
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
  const [isError, setIsError] = useState(false);
  const [data, setData] = useState<HeatmapResponse | null>(null);

  const fetchHeatmap = async (selectedFilter: string) => {
    setIsLoading(true);
    setIsError(false);
    try {
      // Endpoint sesuai kontrak, bbox opsional di sini (kalau required bisa ditambah seperti patch sebelumnya, tapi fallback aman)
      // Workaround: Kalau filter "semua", kita kirim hama kosong atau tetap "semua" (kita coba hapus hama param kalau dia "semua" buat nge-trigger default backend)
      const hamaParam = selectedFilter === 'semua' ? '' : selectedFilter;
      const response = await api.get(`/heatmap?hama=${hamaParam}&bbox=-7.45,112.60,-7.20,112.80`);
      if (response.data && response.data.status === 'success') {
        setData(response.data.data);
      }
    } catch (error: any) {
      console.error(error);
      setIsError(true);
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

  const filters = ["semua", "kutu-putih", "wereng", "ulat"];
  const filterLabels: Record<string, string> = {
    "semua": "Semua Hama",
    "kutu-putih": "Kutu Putih",
    "wereng": "Wereng",
    "ulat": "Ulat"
  };

  const cells = data?.cells || [];

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <style>
        body { margin: 0; padding: 0; background: #FBF8F0; }
        #map { width: 100vw; height: 100vh; }
        .legend {
          background: white;
          padding: 10px;
          border-radius: 12px;
          box-shadow: 4px 4px 0px #123924;
          position: absolute;
          bottom: 20px;
          right: 20px;
          z-index: 1000;
          font-family: 'Arial', sans-serif;
          font-size: 12px;
          border: 3px solid #123924;
        }
        .gradient-bar {
          width: 120px;
          height: 12px;
          background: linear-gradient(to right, blue, lime, yellow, orange, red);
          margin: 6px 0;
          border-radius: 4px;
          border: 1px solid #123924;
        }
        .legend-labels {
          display: flex;
          justify-content: space-between;
          font-weight: 800;
          color: #123924;
        }
      </style>
    </head>
    <body>
      <div id="map"></div>
      
      <div class="legend">
        <div style="font-weight: 800; color: #123924; margin-bottom: 4px;">Intensitas Hama</div>
        <div class="gradient-bar"></div>
        <div class="legend-labels">
          <span>Sedikit</span>
          <span>Parah</span>
        </div>
      </div>

      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <script src="https://unpkg.com/leaflet.heat@0.2.0/dist/leaflet-heat.js"></script>
      <script>
        const map = L.map('map', { zoomControl: false }).setView([-7.35, 112.73], 11);
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap'
        }).addTo(map);

        const dataPoints = ${JSON.stringify(cells.map(c => [c.lat, c.lng, c.weight]))};
        
        if (dataPoints.length > 0) {
          L.heatLayer(dataPoints, {
            radius: 30,
            blur: 20,
            maxZoom: 15,
            max: 10,
            gradient: { 0.2: 'blue', 0.4: 'lime', 0.6: 'yellow', 0.8: 'orange', 1.0: 'red' }
          }).addTo(map);
        }
      </script>
    </body>
    </html>
  `;

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
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
        {isError ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Gagal memuat peta wabah 😢</Text>
            <Pressable onPress={() => fetchHeatmap(filter)} style={styles.retryBtn}>
              <Text style={styles.retryText}>Coba Lagi</Text>
            </Pressable>
          </View>
        ) : (
          <WebView 
            source={{ html: htmlContent }} 
            originWhitelist={['*']}
            style={styles.map}
            scrollEnabled={false}
            bounces={false}
          />
        )}
        
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#3FA86B" />
          </View>
        )}
        
        {!isLoading && !isError && cells.length === 0 && (
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
     
     
    backgroundColor: '#FFECEB' 
  },
  backBtn: {
    backgroundColor: '#FFFFFF',
    padding: 8,
    borderRadius: 100,
    borderWidth: 0,
    
    shadowColor: "#123924", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 14, elevation: 4,
    marginRight: 16
  },
  btnPressed: {
    shadowColor: "#123924", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
    transform: [{ scale: 0.98 }]
  },
  title: { fontFamily: 'Nunito_800ExtraBold', fontSize: 20, color: '#123924', marginBottom: 4 },
  subtitle: { fontFamily: 'Nunito_500Medium', fontSize: 12, color: '#5C5A4F', lineHeight: 18 },
  statsContainer: {
    padding: 24,
    paddingBottom: 16,
     
    
    backgroundColor: '#FFFFFF'
  },
  statsCard: {
    backgroundColor: '#FFB627',
    padding: 16,
    borderRadius: 16,
    borderWidth: 0,
    
    shadowColor: "#123924", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 14, elevation: 4,
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
    borderWidth: 0,
    
    shadowColor: "#123924", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 14, elevation: 4 },
  filterChipActive: {
    backgroundColor: '#3FA86B' },
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
    top: 24,
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 100,
    borderWidth: 0,
    
    shadowColor: "#123924", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 14, elevation: 4 },
  emptyText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 14,
    color: '#123924'
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24
  },
  errorText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 16,
    color: '#123924',
    marginBottom: 16
  },
  retryBtn: {
    backgroundColor: '#FFB627',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 100,
    borderWidth: 0,
    
    shadowColor: "#123924", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 14, elevation: 4 },
  retryText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 14,
    color: '#123924'
  }
});
