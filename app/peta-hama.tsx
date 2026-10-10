import React, { useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, ScrollView } from 'react-native';
import { WebView } from 'react-native-webview';
import { router, useFocusEffect, Stack } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import * as Location from 'expo-location';
import api from '../services/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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

const DEFAULT_COORDS = { lat: -7.4664, lng: 112.7248 };

export default function PetaHamaScreen() {
  const [filter, setFilter] = useState("semua");
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [data, setData] = useState<HeatmapResponse | null>(null);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number }>(DEFAULT_COORDS);
  const [mapRevision, setMapRevision] = useState(0);

  const insets = useSafeAreaInsets();
  const filterRef = useRef(filter);
  filterRef.current = filter;

  const resolveUserCoordinates = async (): Promise<{ lat: number; lng: number }> => {
    let resolvedLat: number | null = null;
    let resolvedLng: number | null = null;

    // 1. Cek stored coordinates di SecureStore
    try {
      const rawUserData = await SecureStore.getItemAsync("userData");
      if (rawUserData) {
        const parsed = JSON.parse(rawUserData);
        if (parsed.latitude != null && parsed.longitude != null) {
          const lat = parseFloat(parsed.latitude);
          const lng = parseFloat(parsed.longitude);
          if (!isNaN(lat) && !isNaN(lng)) {
            resolvedLat = lat;
            resolvedLng = lng;
          }
        }
      }
    } catch (err) {
      console.warn("Gagal membaca koordinat tersimpan:", err);
    }

    // 2. Cek GPS terkini jika izin tersedia (dengan timeout 4 detik agar tidak hang)
    try {
      let { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted') {
        const permission = await Location.requestForegroundPermissionsAsync();
        status = permission.status;
      }
      if (status === 'granted') {
        const locPromise = Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 4000));
        const loc = await Promise.race([locPromise, timeoutPromise]);
        if (loc?.coords) {
          resolvedLat = loc.coords.latitude;
          resolvedLng = loc.coords.longitude;
        }
      }
    } catch (err) {
      console.warn("Gagal mendapatkan koordinat GPS:", err);
    }

    return {
      lat: resolvedLat !== null ? resolvedLat : DEFAULT_COORDS.lat,
      lng: resolvedLng !== null ? resolvedLng : DEFAULT_COORDS.lng
    };
  };

  const fetchHeatmap = async (selectedFilter: string, targetCoords?: { lat: number; lng: number }) => {
    setIsLoading(true);
    setIsError(false);
    try {
      const coords = targetCoords || userCoords;
      const hamaParam = selectedFilter === 'semua' ? '' : selectedFilter;
      const minLat = (coords.lat - 0.35).toFixed(4);
      const minLng = (coords.lng - 0.35).toFixed(4);
      const maxLat = (coords.lat + 0.35).toFixed(4);
      const maxLng = (coords.lng + 0.35).toFixed(4);
      const bboxParam = `${minLat},${minLng},${maxLat},${maxLng}`;
      const response = await api.get(`/heatmap?hama=${hamaParam}&bbox=${bboxParam}`);
      if (response.data && response.data.status === 'success') {
        setData(response.data.data);
        setMapRevision(prev => prev + 1);
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
      let isMounted = true;
      (async () => {
        const coords = await resolveUserCoordinates();
        if (isMounted) {
          setUserCoords(coords);
          fetchHeatmap(filterRef.current, coords);
        }
      })();
      return () => {
        isMounted = false;
      };
    }, [])
  );

  const handleFilterChange = (newFilter: string) => {
    if (newFilter === filter) return;
    setFilter(newFilter);
    fetchHeatmap(newFilter, userCoords);
  };

  const filters = ["semua", "kutu-putih", "wereng", "ulat"];
  const filterLabels: Record<string, string> = {
    "semua": "Semua Hama",
    "kutu-putih": "Kutu Putih",
    "wereng": "Wereng",
    "ulat": "Ulat"
  };

  const cells = (data?.cells || []).filter(c => typeof c.lat === 'number' && typeof c.lng === 'number' && !isNaN(c.lat) && !isNaN(c.lng));

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
        const map = L.map('map', { zoomControl: false }).setView([${userCoords.lat}, ${userCoords.lng}], 12);
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap'
        }).addTo(map);

        // Marker lokasi user
        const userIcon = L.divIcon({
          className: 'custom-user-marker',
          html: '<div style="background-color: #3FA86B; width: 14px; height: 14px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 6px rgba(0,0,0,0.35);"></div>',
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        });
        L.marker([${userCoords.lat}, ${userCoords.lng}], { icon: userIcon }).addTo(map).bindPopup('Lokasi Kamu');

        const dataPoints = ${JSON.stringify(cells.map(c => [c.lat, c.lng, c.weight || 1]))};
        
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
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      {/* HEADER */}
      <View style={[styles.header, { paddingTop: 16 + insets.top }]}>
        <Pressable onPress={() => router.back()} style={({pressed}) => [styles.backBtn, pressed && styles.btnPressed]}>
          <MaterialIcons name="arrow-back" size={24} color="#123924" />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>🗺️ Peta Wabah Hama</Text>
          <Text style={styles.subtitle}>Pantauan real-time laporan wabah hama di sekitarmu</Text>
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
            <Pressable onPress={() => fetchHeatmap(filter, userCoords)} style={styles.retryBtn}>
              <Text style={styles.retryText}>Coba Lagi</Text>
            </Pressable>
          </View>
        ) : (
          <WebView 
            key={`map-${userCoords.lat}-${userCoords.lng}-${filter}-${mapRevision}`}
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
    </View>
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
    shadowColor: "#123924",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
    marginRight: 16
  },
  btnPressed: {
    shadowColor: "#123924",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
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
    shadowColor: "#123924",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
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
    shadowColor: "#123924",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4
  },
  filterChipActive: {
    backgroundColor: '#3FA86B'
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
    top: 24,
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 100,
    borderWidth: 0,
    shadowColor: "#123924",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4
  },
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
    shadowColor: "#123924",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4
  },
  retryText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 14,
    color: '#123924'
  }
});
