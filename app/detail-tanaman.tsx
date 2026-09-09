import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, Image, ActivityIndicator, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import api, { TanamanDetail, LogAktivitas, getTanamanById, getLogsByTanaman, createLog } from '../services/api';
import * as ImagePicker from 'expo-image-picker';

const FALLBACK_HERO = 'https://lh3.googleusercontent.com/aida-public/AOSwzR6X7y3O2Q2_0uXwFhK8TQKf0vFvP4o7SjYdJ9k-h-5E8tV8D2Q3g0K_b8QkLp6g5zZ9n3nK2N8k5L0g-v4c0r9r6p2y2J5b8w';
const FALLBACK_THUMB = 'https://lh3.googleusercontent.com/aida-public/AB6AXuAK72N9bfUnTDR_qxCQtZfhdGFtdZeRDYs-OsNC2lUxmLLI86pKo2ugpOTvGWWwZL9sOkbzXCmRvMwHqent34F7rwvgUHge8_BFG9hN7iYc902WRQsddbBhE_9RiOVhij3iicG_BjbjGLfbqAgjgG9U9a64_nAsnjBQH2_AoUiMWgVBpRNDZeugVxjpYWAoqgIcNd6whl3ktEPbbtfIzxtMOHeRnbZXGuogESuoFy2lwMymfV81rGAUhA';

const formatDate = (isoString: string) => {
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) + ', ' + 
         date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace(':', '.');
};

export default function DetailTanamanModal() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const tanamanId = Number(id);

  const [tanaman, setTanaman] = useState<TanamanDetail | null>(null);
  const [logs, setLogs] = useState<LogAktivitas[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchData = async () => {
    if (!tanamanId) return;
    try {
      setIsLoading(true);
      const [tanamanData, logsData] = await Promise.all([
        getTanamanById(tanamanId),
        getLogsByTanaman(tanamanId)
      ]);
      setTanaman(tanamanData);
      setLogs(logsData);
    } catch (e: any) {
      Alert.alert("Gagal", e.response?.data?.message || "Gagal memuat data tanaman");
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [tanamanId])
  );

  const latestPhotoUrl = useMemo(() => {
    const photoLog = logs.find(l => l.fotoUrl);
    return photoLog?.fotoUrl || FALLBACK_HERO;
  }, [logs]);

  const handleValidasiButton = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await createLog({ tanamanId, tipeValidasi: "button_only" });
      setToastMessage(`Tanaman dapet +1 poin! Streak: ${res.streak} hari 🔥`);
      setTimeout(() => setToastMessage(null), 4000);
      fetchData();
    } catch (e: any) {
      Alert.alert("Gagal", e.response?.data?.message || "Gagal validasi");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleValidasiPhoto = async () => {
    if (isSubmitting) return;
    
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Izin Kamera Ditolak", "TaniSync butuh izin kamera untuk memvalidasi tanamanmu broskie!");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        
        Alert.alert("Validasi Foto", "Yakin mau kirim foto ini?", [
          { text: "Batal", style: "cancel" },
          { text: "Kirim", onPress: async () => {
              setIsSubmitting(true);
              try {
                const res = await createLog({ tanamanId, tipeValidasi: "photo", fotoUri: uri });
                setToastMessage(`Keren! +5 poin! Streak: ${res.streak} hari 🔥`);
                setTimeout(() => setToastMessage(null), 4000);
                fetchData();
              } catch (e: any) {
                Alert.alert("Gagal", e.response?.data?.message || "Gagal upload foto");
              } finally {
                setIsSubmitting(false);
              }
          }}
        ]);
      }
    } catch (e: any) {
      setIsSubmitting(false);
      Alert.alert("Gagal", e?.message || "Gagal membuka kamera");
    }
  };

  if (isLoading && !tanaman) {
    return (
      <SafeAreaView style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#1F5C3D" />
      </SafeAreaView>
    );
  }

  if (!tanaman) return null;

  const hariKe = Math.floor((Date.now() - new Date(tanaman.tanggalTanam || Date.now()).getTime()) / 86400000) + 1;
  const estPanenDate = new Date(new Date(tanaman.tanggalTanam || Date.now()).getTime() + ((tanaman.daysToHarvest || 0) * 86400000));
  const estPanenString = isNaN(estPanenDate.getTime()) ? '-' : estPanenDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  let badgeBgColor = "#E8F5E9";
  let badgeBorderColor = "#3FA86B";
  let badgeTextColor = "#123924";
  let badgeText = "Aman";
  if (tanaman.statusPenyiraman === "PERLU_SIRAM") {
    badgeBgColor = "#FFECEB";
    badgeBorderColor = "#FF6B5C";
    badgeTextColor = "#FF6B5C";
    badgeText = "Perlu Disiram";
  } else if (tanaman.statusPenyiraman === "DITUNDA_HUJAN") {
    badgeBgColor = "#FFF9E6";
    badgeBorderColor = "#FFB627";
    badgeTextColor = "#FFB627";
    badgeText = "Ditunda Hujan";
  } else if (tanaman.statusPenyiraman === "SUDAH_DISIRAM") {
    badgeText = "Sudah Disiram";
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {toastMessage && (
          <View style={styles.toast}>
            <Text style={styles.toastText}>{toastMessage}</Text>
          </View>
        )}

        {/* TOP BAR */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color="#123924" />
          </TouchableOpacity>
        </View>

        {/* HERO SECTION */}
        <View style={styles.heroSection}>
          <View style={styles.imageWrapper}>
            <Image source={{ uri: latestPhotoUrl }} style={styles.heroImage} />
          </View>
          <TouchableOpacity style={styles.floatingCamButton} onPress={handleValidasiPhoto} disabled={isSubmitting}>
            <MaterialIcons name="photo-camera" size={24} color="#123924" />
          </TouchableOpacity>
        </View>

        {/* TITLE SECTION */}
        <View style={styles.titleSection}>
          <Text style={styles.plantTitle}>{tanaman.nickname ?? tanaman.jenisTanaman}</Text>
          <Text style={styles.plantSubtitle}>Ditanam sejak {hariKe} hari lalu</Text>
          
          <View style={[styles.badge, { backgroundColor: badgeBgColor, borderColor: badgeBorderColor, marginTop: 8, alignSelf: 'flex-start' }]}>
            <Text style={[styles.badgeText, { color: badgeTextColor }]}>{badgeText}</Text>
          </View>
        </View>

        {/* HARVEST CARD */}
        <View style={styles.harvestCard}>
          <View style={styles.harvestIconCircle}>
            <MaterialIcons name="stars" size={32} color="#FFB627" />
          </View>
          <View style={styles.harvestTextContainer}>
            <Text style={styles.harvestTitle}>Estimasi Panen</Text>
            <Text style={styles.harvestSubtitle}>Sisa {tanaman.sisaHariPanen || 0} hari lagi ({estPanenString})</Text>
          </View>
        </View>

        {/* ACTION BUTTONS (Sesuai mockup tapi dimodif buat Konfirmasi Disiram) */}
        {tanaman.statusPenyiraman !== "SUDAH_DISIRAM" && (
          <View style={styles.actionRow}>
            <TouchableOpacity style={[styles.actionBtn, styles.btnWhite]} onPress={handleValidasiButton} disabled={isSubmitting}>
              {isSubmitting ? <ActivityIndicator color="#123924" /> : <Text style={styles.btnWhiteText}>Konfirmasi{`\n`}Disiram</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, styles.btnGreen]} onPress={handleValidasiPhoto} disabled={isSubmitting}>
              {isSubmitting ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.btnGreenText}>Foto &{`\n`}Validasi</Text>}
            </TouchableOpacity>
          </View>
        )}

        {/* HISTORY SECTION */}
        <View style={styles.historySection}>
          <Text style={styles.historySectionTitle}>Riwayat Perawatan</Text>
          
          {logs.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="history" size={48} color="#a09d91" style={{marginBottom: 8}}/>
              <Text style={styles.emptyText}>Belum ada jurnal perawatan</Text>
            </View>
          ) : (
            logs.map((log, index) => (
              <View key={log.id} style={[styles.historyItem, index === logs.length - 1 && { borderBottomWidth: 0 }]}>
                {log.tipeValidasi === 'photo' ? (
                  <Image source={{ uri: log.fotoUrl || FALLBACK_THUMB }} style={styles.historyImage} />
                ) : (
                  <View style={[styles.historyImage, { justifyContent: 'center', alignItems: 'center' }]}>
                    <MaterialIcons name="check-circle" size={24} color="#3FA86B" />
                  </View>
                )}
                
                <View style={styles.historyTextCol}>
                  <Text style={styles.historyTitle}>{log.tipeValidasi === 'photo' ? 'Validasi Foto' : 'Konfirmasi Penyiraman'}</Text>
                  <Text style={styles.historySubtitle}>{formatDate(log.createdAt)}</Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
      {isSubmitting && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#FFFFFF" />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FBF8F0' },
  scrollContent: { paddingBottom: 40 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 16, marginBottom: 16 },
  iconButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: '#123924', alignItems: 'center', justifyContent: 'center', shadowColor: '#123924', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 1, shadowRadius: 0, elevation: 4 },
  heroSection: { marginHorizontal: 20, position: 'relative', marginBottom: 16 },
  imageWrapper: { width: '100%', aspectRatio: 1, borderRadius: 20, borderWidth: 2, borderColor: '#123924', overflow: 'hidden', backgroundColor: '#96d4ad', shadowColor: '#123924', shadowOffset: { width: 3, height: 3 }, shadowOpacity: 1, shadowRadius: 0, elevation: 4 },
  heroImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  floatingCamButton: { position: 'absolute', bottom: -16, right: 24, width: 48, height: 48, borderRadius: 24, backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: '#123924', alignItems: 'center', justifyContent: 'center', shadowColor: '#123924', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 1, shadowRadius: 0, elevation: 5, zIndex: 10 },
  titleSection: { paddingHorizontal: 20, marginBottom: 20 },
  plantTitle: { fontSize: 24, fontWeight: '800', color: '#1F5C3D', marginBottom: 4 },
  plantSubtitle: { fontSize: 12, color: '#5C5A4F' },
  harvestCard: { marginHorizontal: 20, backgroundColor: '#1F5C3D', borderRadius: 28, padding: 24, flexDirection: 'row', alignItems: 'center', marginBottom: 24, shadowColor: '#123924', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 6 },
  harvestIconCircle: { width: 64, height: 64, borderRadius: 32, borderWidth: 4, borderColor: '#FFB627', borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' },
  harvestTextContainer: { marginLeft: 16, flex: 1 },
  harvestTitle: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
  harvestSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 4 },
  actionRow: { flexDirection: 'row', gap: 16, paddingHorizontal: 20, marginBottom: 20 },
  actionBtn: { flex: 1, minHeight: 56, borderRadius: 999, borderWidth: 2, borderColor: '#123924', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12, shadowColor: '#123924', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 1, shadowRadius: 0, elevation: 3 },
  btnWhite: { backgroundColor: '#FFFFFF' },
  btnGreen: { backgroundColor: '#3FA86B' },
  btnWhiteText: { fontSize: 12, fontWeight: '700', color: '#123924', textAlign: 'center' },
  btnGreenText: { fontSize: 12, fontWeight: '700', color: '#FFFFFF', textAlign: 'center' },
  historySection: { paddingHorizontal: 20 },
  historySectionTitle: { fontSize: 16, fontWeight: '700', color: '#1F5C3D', marginBottom: 12 },
  historyItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: '#123924' },
  historyImage: { width: 40, height: 40, borderRadius: 8, borderWidth: 2, borderColor: '#123924', marginRight: 12, backgroundColor: '#e5e2db' },
  historyTextCol: { flex: 1 },
  historyTitle: { fontSize: 12, fontWeight: '700', color: '#123924' },
  historySubtitle: { fontSize: 11, color: '#5C5A4F', marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1 },
  badgeText: { fontSize: 10, fontWeight: "800" },
  toast: { position: 'absolute', top: 20, left: 20, right: 20, backgroundColor: '#FFB627', padding: 16, borderRadius: 12, zIndex: 50, elevation: 10, borderWidth: 2, borderColor: '#123924', shadowColor: '#123924', shadowOffset: {width:4, height:4}, shadowOpacity: 1, shadowRadius: 0 },
  toastText: { color: '#123924', fontWeight: '800', textAlign: 'center' },
  loadingOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(18,57,36,0.6)', justifyContent: 'center', alignItems: 'center', zIndex: 100 },
  emptyState: { alignItems: 'center', paddingVertical: 32, opacity: 0.7 },
  emptyText: { fontSize: 14, color: '#5C5A4F', fontWeight: '600' }
});
