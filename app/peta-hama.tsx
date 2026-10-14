import React, { useState, useCallback, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, ScrollView } from 'react-native';
import { WebView } from 'react-native-webview';
import { router, useFocusEffect, Stack } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

interface FilterItem {
  key: string;
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
}

const DEFAULT_COORDS = { lat: -7.4664, lng: 112.7248 };
const STORAGE_CACHE_KEY = 'peta_hama_cache_store';

const FILTERS: FilterItem[] = [
  { key: 'semua', label: 'Semua Hama', icon: 'apps' },
  { key: 'kutu-putih', label: 'Kutu Putih', icon: 'bug-report' },
  { key: 'wereng', label: 'Wereng', icon: 'pest-control' },
  { key: 'ulat', label: 'Ulat', icon: 'grass' }
];

const STATIC_MAP_HTML = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
    body, html { margin: 0; padding: 0; width: 100%; height: 100%; background: #F8FAF8; overflow: hidden; }
    #map { width: 100%; height: 100%; background: #F8FAF8; }

    /* Pulse Radar Marker */
    .user-pulse-icon {
      background: transparent !important;
      border: none !important;
    }
    .pulse-container {
      position: relative;
      width: 34px;
      height: 34px;
    }
    .pulse-ring {
      position: absolute;
      top: 0;
      left: 0;
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background-color: rgba(16, 185, 129, 0.35);
      animation: pulseRadar 2.2s infinite ease-out;
    }
    .pulse-dot {
      position: absolute;
      top: 10px;
      left: 10px;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background-color: #10B981;
      border: 2.5px solid #FFFFFF;
      box-shadow: 0 2px 8px rgba(18, 57, 36, 0.35);
    }
    @keyframes pulseRadar {
      0% {
        transform: scale(0.45);
        opacity: 1;
      }
      70% {
        transform: scale(1.65);
        opacity: 0.25;
      }
      100% {
        transform: scale(2.2);
        opacity: 0;
      }
    }

    /* Neoclay Glassmorphic Legend */
    .legend {
      background: rgba(255, 255, 255, 0.94);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      padding: 10px 14px;
      border-radius: 16px;
      box-shadow: 0 6px 20px rgba(18, 57, 36, 0.12);
      position: absolute;
      bottom: 24px;
      right: 16px;
      z-index: 1000;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      border: 1px solid rgba(18, 57, 36, 0.08);
      pointer-events: auto;
    }
    .legend-title {
      font-weight: 800;
      color: #123924;
      font-size: 10px;
      letter-spacing: 0.5px;
      margin-bottom: 5px;
      text-transform: uppercase;
    }
    .gradient-bar {
      width: 110px;
      height: 8px;
      background: linear-gradient(to right, #0284C7, #10B981, #FBBF24, #F97316, #EF4444);
      margin: 5px 0 6px 0;
      border-radius: 999px;
    }
    .legend-labels {
      display: flex;
      justify-content: space-between;
      font-weight: 700;
      color: #4B5563;
      font-size: 10px;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  
  <div class="legend">
    <div class="legend-title">Intensitas Wabah</div>
    <div class="gradient-bar"></div>
    <div class="legend-labels">
      <span>Rendah</span>
      <span>Tinggi</span>
    </div>
  </div>

  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script src="https://unpkg.com/leaflet.heat@0.2.0/dist/leaflet-heat.js"></script>
  <script>
    var map = null;
    var heatLayer = null;
    var userMarker = null;

    function initMap(centerLat, centerLng) {
      if (map) return;
      map = L.map('map', { zoomControl: false }).setView([centerLat, centerLng], 12);
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
      }).addTo(map);

      updateUserLocation(centerLat, centerLng, false);
    }

    function updateUserLocation(lat, lng, doPan) {
      if (!map) return;
      if (userMarker) {
        map.removeLayer(userMarker);
        userMarker = null;
      }
      var pulseIcon = L.divIcon({
        className: 'user-pulse-icon',
        html: '<div class="pulse-container"><div class="pulse-ring"></div><div class="pulse-dot"></div></div>',
        iconSize: [34, 34],
        iconAnchor: [17, 17]
      });
      userMarker = L.marker([lat, lng], { icon: pulseIcon }).addTo(map).bindPopup('Lokasi Kebun Kamu');
      if (doPan) {
        map.panTo([lat, lng]);
      }
    }

    function updateHeatmapData(points) {
      if (!map) return;
      if (heatLayer) {
        map.removeLayer(heatLayer);
        heatLayer = null;
      }
      if (points && points.length > 0) {
        heatLayer = L.heatLayer(points, {
          radius: 32,
          blur: 22,
          maxZoom: 15,
          max: 10,
          gradient: { 0.2: '#0284C7', 0.4: '#10B981', 0.6: '#FBBF24', 0.8: '#F97316', 1.0: '#EF4444' }
        }).addTo(map);
      }
    }

    function recenterMap(lat, lng) {
      if (map) {
        map.flyTo([lat, lng], 13, { duration: 1.0 });
      }
    }

    window.initMap = initMap;
    window.updateHeatmapData = updateHeatmapData;
    window.updateUserLocation = updateUserLocation;
    window.recenterMap = recenterMap;

    initMap(-7.4664, 112.7248);

    if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'MAP_READY' }));
    }
  </script>
</body>
</html>
`;

export default function PetaHamaScreen() {
  const [filter, setFilter] = useState('semua');
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [data, setData] = useState<HeatmapResponse | null>(null);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number }>(DEFAULT_COORDS);

  const insets = useSafeAreaInsets();

  const webViewRef = useRef<WebView>(null);
  const isMapReadyRef = useRef<boolean>(false);
  const pendingPointsRef = useRef<HeatmapCell[] | null>(null);
  const pendingLocationRef = useRef<{ lat: number; lng: number } | null>(null);
  const cacheRef = useRef<Record<string, HeatmapResponse>>({});
  const filterRef = useRef<string>('semua');
  const userCoordsRef = useRef<{ lat: number; lng: number }>(DEFAULT_COORDS);

  const mapSource = useMemo(() => ({ html: STATIC_MAP_HTML }), []);

  const injectHeatmapPoints = (cells: HeatmapCell[]) => {
    const validCells = (cells || []).filter(
      c => typeof c.lat === 'number' && typeof c.lng === 'number' && !isNaN(c.lat) && !isNaN(c.lng)
    );
    if (!isMapReadyRef.current) {
      pendingPointsRef.current = validCells;
      return;
    }
    const points = validCells.map(c => [c.lat, c.lng, c.weight || 1]);
    const js = `if (window.updateHeatmapData) { window.updateHeatmapData(${JSON.stringify(points)}); } true;`;
    webViewRef.current?.injectJavaScript(js);
  };

  const injectUserLocation = (lat: number, lng: number, doPan = true) => {
    if (!isMapReadyRef.current) {
      pendingLocationRef.current = { lat, lng };
      return;
    }
    const js = `if (window.updateUserLocation) { window.updateUserLocation(${lat}, ${lng}, ${doPan}); } true;`;
    webViewRef.current?.injectJavaScript(js);
  };

  const onWebViewMessage = (event: any) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data);
      if (msg.type === 'MAP_READY') {
        isMapReadyRef.current = true;
        const targetCoords = pendingLocationRef.current || userCoordsRef.current;
        injectUserLocation(targetCoords.lat, targetCoords.lng, true);
        pendingLocationRef.current = null;

        const pointsToDraw = pendingPointsRef.current || data?.cells || [];
        injectHeatmapPoints(pointsToDraw);
        pendingPointsRef.current = null;
      }
    } catch {
      // Ignore non-json messages
    }
  };

  const resolveStoredCoordinates = async (): Promise<{ lat: number; lng: number } | null> => {
    try {
      const rawUserData = await SecureStore.getItemAsync('userData');
      if (rawUserData) {
        const parsed = JSON.parse(rawUserData);
        if (parsed.latitude != null && parsed.longitude != null) {
          const lat = parseFloat(parsed.latitude);
          const lng = parseFloat(parsed.longitude);
          if (!isNaN(lat) && !isNaN(lng)) {
            return { lat, lng };
          }
        }
      }
    } catch (err) {
      console.warn('Gagal membaca koordinat tersimpan:', err);
    }
    return null;
  };

  const syncGpsInBackground = async (currentLat: number, currentLng: number) => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status === 'granted') {
        const locPromise = Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        const timeoutPromise = new Promise<null>(resolve => setTimeout(() => resolve(null), 3500));
        const loc = await Promise.race([locPromise, timeoutPromise]);
        if (loc?.coords) {
          const freshLat = loc.coords.latitude;
          const freshLng = loc.coords.longitude;
          if (Math.abs(freshLat - currentLat) > 0.005 || Math.abs(freshLng - currentLng) > 0.005) {
            const freshCoords = { lat: freshLat, lng: freshLng };
            userCoordsRef.current = freshCoords;
            setUserCoords(freshCoords);
            injectUserLocation(freshLat, freshLng, false);
            fetchHeatmap(filterRef.current, freshCoords, true);
          }
        }
      }
    } catch {
      // Ignore background sync error
    }
  };

  const fetchHeatmap = async (
    selectedFilter: string,
    targetCoords?: { lat: number; lng: number },
    isSilent = false
  ) => {
    const coords = targetCoords || userCoordsRef.current;
    const hasCache = !!cacheRef.current[selectedFilter];

    if (!isSilent && !hasCache) {
      setIsLoading(true);
    }
    setIsError(false);

    try {
      const hamaParam = selectedFilter === 'semua' ? '' : selectedFilter;
      const minLat = (coords.lat - 0.35).toFixed(4);
      const minLng = (coords.lng - 0.35).toFixed(4);
      const maxLat = (coords.lat + 0.35).toFixed(4);
      const maxLng = (coords.lng + 0.35).toFixed(4);
      const bboxParam = `${minLat},${minLng},${maxLat},${maxLng}`;

      const response = await api.get(`/heatmap?hama=${hamaParam}&bbox=${bboxParam}`);
      if (response.data && response.data.status === 'success') {
        const resData: HeatmapResponse = response.data.data;
        cacheRef.current[selectedFilter] = resData;
        AsyncStorage.setItem(STORAGE_CACHE_KEY, JSON.stringify(cacheRef.current)).catch(() => {});

        if (filterRef.current === selectedFilter) {
          setData(resData);
          injectHeatmapPoints(resData.cells || []);
        }
      }
    } catch (error) {
      console.error('Fetch heatmap error:', error);
      if (!cacheRef.current[selectedFilter]) {
        setIsError(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      (async () => {
        // 1. Baca cache lokal 0ms dari AsyncStorage
        try {
          const cachedRaw = await AsyncStorage.getItem(STORAGE_CACHE_KEY);
          if (cachedRaw && isMounted) {
            const parsedCache: Record<string, HeatmapResponse> = JSON.parse(cachedRaw);
            cacheRef.current = parsedCache;
            if (parsedCache[filterRef.current]) {
              setData(parsedCache[filterRef.current]);
              injectHeatmapPoints(parsedCache[filterRef.current].cells || []);
            }
          }
        } catch (err) {
          console.warn('Gagal membaca cache lokal peta:', err);
        }

        // 2. Resolve koordinat instan dari SecureStore
        let coords = await resolveStoredCoordinates();
        if (!coords) {
          try {
            let { status } = await Location.getForegroundPermissionsAsync();
            if (status !== 'granted') {
              const permission = await Location.requestForegroundPermissionsAsync();
              status = permission.status;
            }
            if (status === 'granted') {
              const locPromise = Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
              const timeoutPromise = new Promise<null>(resolve => setTimeout(() => resolve(null), 3000));
              const loc = await Promise.race([locPromise, timeoutPromise]);
              if (loc?.coords) {
                coords = { lat: loc.coords.latitude, lng: loc.coords.longitude };
              }
            }
          } catch {
            // Ignore error
          }
        }

        const finalCoords = coords || DEFAULT_COORDS;
        if (isMounted) {
          userCoordsRef.current = finalCoords;
          setUserCoords(finalCoords);
          injectUserLocation(finalCoords.lat, finalCoords.lng, true);

          fetchHeatmap(filterRef.current, finalCoords, !!cacheRef.current[filterRef.current]);

          if (coords) {
            syncGpsInBackground(coords.lat, coords.lng);
          }
        }
      })();

      return () => {
        isMounted = false;
      };
    }, [])
  );

  const handleFilterChange = (newFilter: string) => {
    if (newFilter === filter) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFilter(newFilter);
    filterRef.current = newFilter;

    const cached = cacheRef.current[newFilter];
    if (cached) {
      setData(cached);
      setIsLoading(false);
      injectHeatmapPoints(cached.cells || []);
      fetchHeatmap(newFilter, userCoordsRef.current, true);
    } else {
      fetchHeatmap(newFilter, userCoordsRef.current, false);
    }
  };

  const handleRecenter = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const { lat, lng } = userCoordsRef.current;
    const js = `if (window.recenterMap) { window.recenterMap(${lat}, ${lng}); } true;`;
    webViewRef.current?.injectJavaScript(js);
  };

  const cells = (data?.cells || []).filter(
    c => typeof c.lat === 'number' && typeof c.lng === 'number' && !isNaN(c.lat) && !isNaN(c.lng)
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* HEADER */}
      <View style={[styles.header, { paddingTop: 14 + insets.top }]}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backBtn, pressed && styles.btnPressed]}
          accessibilityLabel="Kembali"
        >
          <MaterialIcons name="arrow-back" size={22} color="#123924" />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Peta Persebaran Hama</Text>
          <Text style={styles.subtitle}>Pantauan intensitas laporan wabah di sekitarmu</Text>
        </View>
      </View>

      {/* STATS BANNER & FILTERS */}
      <View style={styles.statsContainer}>
        <View style={styles.statsCard}>
          <View style={styles.statsIconWrapper}>
            <MaterialIcons name="warning-amber" size={20} color="#B45309" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.statsTitle}>
              {data?.total_laporan ?? 0} Laporan Wabah Terdeteksi
            </Text>
            <Text style={styles.statsSubtext}>
              Area radius 35 km dari kebun
            </Text>
          </View>
          <View style={styles.badgePill}>
            <Text style={styles.badgePillText}>Aktif</Text>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {FILTERS.map((item) => {
            const isActive = filter === item.key;
            return (
              <Pressable
                key={item.key}
                onPress={() => handleFilterChange(item.key)}
                style={({ pressed }) => [
                  styles.filterChip,
                  isActive && styles.filterChipActive,
                  pressed && styles.btnPressed
                ]}
              >
                <MaterialIcons
                  name={item.icon}
                  size={16}
                  color={isActive ? '#FFFFFF' : '#123924'}
                />
                <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* MAP VIEW */}
      <View style={styles.mapContainer}>
        {isError && !data ? (
          <View style={styles.errorContainer}>
            <MaterialIcons name="error-outline" size={36} color="#DC2626" style={{ marginBottom: 8 }} />
            <Text style={styles.errorText}>Gagal memuat peta sebaran hama</Text>
            <Pressable
              onPress={() => fetchHeatmap(filter, userCoords, false)}
              style={({ pressed }) => [styles.retryBtn, pressed && styles.btnPressed]}
            >
              <Text style={styles.retryText}>Coba Lagi</Text>
            </Pressable>
          </View>
        ) : (
          <WebView
            ref={webViewRef}
            key="static-peta-hama-webview"
            source={mapSource}
            originWhitelist={['*']}
            style={styles.map}
            scrollEnabled={false}
            bounces={false}
            onMessage={onWebViewMessage}
          />
        )}

        {/* Floating Recenter Button */}
        <Pressable
          onPress={handleRecenter}
          style={({ pressed }) => [styles.recenterBtn, pressed && styles.btnPressed]}
          accessibilityLabel="Pusatkan Lokasi Kebun"
        >
          <MaterialIcons name="my-location" size={18} color="#123924" />
          <Text style={styles.recenterText}>Kebun Saya</Text>
        </Pressable>

        {/* Floating Loading Pill */}
        {isLoading && (
          <View style={styles.floatingLoadingPill}>
            <ActivityIndicator size="small" color="#123924" />
            <Text style={styles.floatingLoadingText}>Memperbarui peta...</Text>
          </View>
        )}

        {/* Empty State Overlay */}
        {!isLoading && !isError && cells.length === 0 && (
          <View style={styles.emptyOverlay}>
            <MaterialIcons name="check-circle" size={16} color="#10B981" />
            <Text style={styles.emptyText}>Tidak ada laporan hama di area ini</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAF8'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(18, 57, 36, 0.06)'
  },
  backBtn: {
    backgroundColor: '#F3F4F6',
    padding: 8,
    borderRadius: 100,
    marginRight: 14
  },
  btnPressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.85
  },
  title: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 18,
    color: '#123924',
    marginBottom: 2
  },
  subtitle: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 12,
    color: '#6B7280'
  },
  statsContainer: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(18, 57, 36, 0.06)'
  },
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginBottom: 12,
    gap: 10
  },
  statsIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FDE68A',
    justifyContent: 'center',
    alignItems: 'center'
  },
  statsTitle: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 13,
    color: '#92400E'
  },
  statsSubtext: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 11,
    color: '#B45309'
  },
  badgePill: {
    backgroundColor: '#B45309',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 100
  },
  badgePillText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 10,
    color: '#FFFFFF'
  },
  filterScroll: {
    gap: 8,
    paddingRight: 20
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(18, 57, 36, 0.08)',
    shadowColor: '#123924',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    gap: 6
  },
  filterChipActive: {
    backgroundColor: '#1B4332',
    borderColor: '#1B4332',
    shadowColor: '#1B4332',
    shadowOpacity: 0.2
  },
  filterText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 13,
    color: '#123924'
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
  recenterBtn: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    zIndex: 1000,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(18, 57, 36, 0.08)',
    shadowColor: '#123924',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
    gap: 6
  },
  recenterText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 12,
    color: '#123924'
  },
  floatingLoadingPill: {
    position: 'absolute',
    top: 16,
    alignSelf: 'center',
    zIndex: 1000,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(18, 57, 36, 0.08)',
    shadowColor: '#123924',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
    gap: 8
  },
  floatingLoadingText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 12,
    color: '#123924'
  },
  emptyOverlay: {
    position: 'absolute',
    top: 16,
    alignSelf: 'center',
    zIndex: 999,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(18, 57, 36, 0.08)',
    shadowColor: '#123924',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
    gap: 8
  },
  emptyText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 12,
    color: '#123924'
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F8FAF8'
  },
  errorText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 15,
    color: '#123924',
    marginBottom: 16
  },
  retryBtn: {
    backgroundColor: '#1B4332',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 100,
    shadowColor: '#123924',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3
  },
  retryText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 14,
    color: '#FFFFFF'
  }
});
