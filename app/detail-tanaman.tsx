import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import * as SecureStore from "expo-secure-store";
import { useCallback, useMemo, useState, useEffect } from 'react';
import { ActivityIndicator, Alert, Animated, Modal, Pressable, ScrollView, Share, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNotification } from '../components/NotificationContext';
import PlantIllustration from '../components/PlantIllustration';
import { LogAktivitas, TanamanDetail, createCommunityPost, createLog, deleteTanaman, getLogsByTanaman, getTanamanById, harvestTanaman, updateTanaman } from '../services/api';

const JENIS_TANAMAN_ENUM = [
  "Padi", "Jagung", "Singkong", "Ubi Jalar", "Kedelai", "Kacang Tanah", 
  "Tomat", "Cabai Merah", "Cabai Rawit", "Bawang Merah", "Bawang Putih", 
  "Kubis", "Kangkung", "Bayam", "Terong", "Timun", "Labu Siam", "Wortel", 
  "Kentang", "Pisang",
];

const FALLBACK_THUMB = 'https://lh3.googleusercontent.com/aida-public/AB6AXuAK72N9bfUnTDR_qxCQtZfhdGFtdZeRDYs-OsNC2lUxmLLI86pKo2ugpOTvGWWwZL9sOkbzXCmRvMwHqent34F7rwvgUHge8_BFG9hN7iYc902WRQsddbBhE_9RiOVhij3iicG_BjbjGLfbqAgjgG9U9a64_nAsnjBQH2_AoUiMWgVBpRNDZeugVxjpYWAoqgIcNd6whl3ktEPbbtfIzxtMOHeRnbZXGuogESuoFy2lwMymfV81rGAUhA';

const formatDate = (isoString: string) => {
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) + ', ' + 
         date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace(':', '.');
};

const DetailTanamanSkeleton = () => {
  const [fadeAnim] = useState(() => new Animated.Value(0.4));

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 0.4, duration: 800, useNativeDriver: true })
      ])
    ).start();
  }, [fadeAnim]);

  return (
    <Animated.View style={{ flex: 1, opacity: fadeAnim, padding: 20, gap: 24 }}>
      <View style={{ alignItems: 'center', gap: 12, marginTop: 20 }}>
        <View style={{ width: 120, height: 120, borderRadius: 60, backgroundColor: '#E8E5DA', borderWidth: 0 }} />
        <View style={{ width: 150, height: 28, borderRadius: 14, backgroundColor: '#E8E5DA' }} />
        <View style={{ width: 100, height: 18, borderRadius: 9, backgroundColor: '#E8E5DA' }} />
      </View>
      <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
        <View style={{ flex: 1, height: 80, borderRadius: 20, backgroundColor: '#E8E5DA', borderWidth: 0 }} />
        <View style={{ flex: 1, height: 80, borderRadius: 20, backgroundColor: '#E8E5DA', borderWidth: 0 }} />
      </View>
      <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
        <View style={{ flex: 1, height: 56, borderRadius: 28, backgroundColor: '#E8E5DA', borderWidth: 0 }} />
        <View style={{ flex: 1, height: 56, borderRadius: 28, backgroundColor: '#E8E5DA', borderWidth: 0 }} />
      </View>
    </Animated.View>
  );
};

export default function DetailTanamanModal() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const tanamanId = Number(id);

  const [tanaman, setTanaman] = useState<TanamanDetail | null>(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editNickname, setEditNickname] = useState("");
  const [editJenis, setEditJenis] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const { showNotification } = useNotification();

  const [logs, setLogs] = useState<LogAktivitas[]>([]);
  const [showAllLogs, setShowAllLogs] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isPlayingMemory, setIsPlayingMemory] = useState(false);

  useEffect(() => {
    // 0ms instant display from cache
    const loadCachedTanaman = async () => {
      try {
        const cached = await AsyncStorage.getItem("dashboard_tanaman");
        if (cached) {
          const list: TanamanDetail[] = JSON.parse(cached);
          const found = list.find((t) => t.id === tanamanId);
          if (found) {
            setTanaman(found);
            setIsLoading(false);
          }
        }
      } catch (e) {
        // non-fatal
      }
    };
    if (tanamanId) {
      loadCachedTanaman();
    }
  }, [tanamanId]);
  const [memoryIndex, setMemoryIndex] = useState(0);
  const [isHarvesting, setIsHarvesting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);
  const [showHarvestConfirm, setShowHarvestConfirm] = useState(false);
  const [isPosting, setIsPosting] = useState(false);

  
  const handleOpenEdit = () => {
    if (tanaman) {
      setEditNickname(tanaman.nickname || "");
      setEditJenis(tanaman.jenisTanaman);
      setIsEditModalVisible(true);
    }
  };

  const handleEditSave = async () => {
    setIsSavingEdit(true);
    try {
      await updateTanaman(Number(id), {
        nickname: editNickname || undefined,
        jenisTanaman: editJenis });
      showNotification("Sukses", "Tanaman berhasil diupdate!");
      setIsEditModalVisible(false);
      fetchData(); // refetch to update UI
    } catch (e: any) {
      showNotification("Gagal", e.response?.data?.message || "Gagal mengupdate tanaman.", "error");
    } finally {
      setIsSavingEdit(false);
    }
  };

  const fetchData = useCallback(async () => {
    if (!tanamanId) return;
    try {
      // Tidak set isLoading(true) di sini karena state awal sudah true.
      // Jika refresh dari useFocusEffect, fetch berjalan silently di background (tanpa loading berulang).
      const [tanamanData, logsData] = await Promise.all([
        getTanamanById(tanamanId),
        getLogsByTanaman(tanamanId)
      ]);
      setTanaman(tanamanData);
      setLogs(logsData);
    } catch (e: any) {
      showNotification("Gagal", e.response?.data?.message || "Gagal memuat data tanaman", "error");
      router.back();
    } finally {
      setIsLoading(false);
    }
  }, [tanamanId, showNotification, router]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const latestPhotoUrl = useMemo(() => {
    const photoLog = logs.find(l => l.fotoUrl);
    return photoLog?.fotoUrl || null;
  }, [logs]);

  const photoLogsAsc = useMemo(() => {
    return logs.filter(l => !!l.fotoUrl).map(l => l.fotoUrl as string).reverse();
  }, [logs]);

  const wateringCount = useMemo(() => logs.filter(l => l.tipeValidasi !== 'photo').length, [logs]);
  const photoCount = useMemo(() => logs.filter(l => l.tipeValidasi === 'photo').length, [logs]);
  const displayedLogs = useMemo(() => showAllLogs ? logs : logs.slice(0, 3), [logs, showAllLogs]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isPlayingMemory && photoLogsAsc.length > 1) {
      interval = setInterval(() => {
        setMemoryIndex(prev => {
          if (prev >= photoLogsAsc.length - 1) {
            setIsPlayingMemory(false);
            return 0;
          }
          return prev + 1;
        });
      }, 300);
    }
    return () => clearInterval(interval);
  }, [isPlayingMemory, photoLogsAsc]);

  const sudahValidasiHariIni = useMemo(() => {
    const today = new Date().toDateString();
    return logs.some(l => new Date(l.createdAt).toDateString() === today) || tanaman?.statusPenyiraman === 'SUDAH_DISIRAM';
  }, [logs, tanaman?.statusPenyiraman]);


  const handleHarvest = () => {
    setShowHarvestConfirm(true);
  };

  const confirmHarvest = async () => {
    setShowHarvestConfirm(false);
    setIsHarvesting(true);
    try {
      const res = await harvestTanaman(tanamanId);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      const d = res.data || res;
      if (d.levelUp) {
        showNotification("Berhasil", `LEVEL UP! Tanaman berhasil dipanen!`, "success");
      } else {
        showNotification("Berhasil", `Panen berhasil! +${d.expDidapat} EXP`, "success");
      }
      // Update global cache manually so Dashboard gets the new EXP
      const cached = await SecureStore.getItemAsync("userData");
      if (cached) {
        const parsed = JSON.parse(cached);
        parsed.exp = d.expSekarang;
        parsed.level = d.level;
        await SecureStore.setItemAsync("userData", JSON.stringify(parsed));
      }
      
      setShowCertificate(true);
      setIsHarvesting(false);
    } catch (e: any) {
      setIsHarvesting(false);
      showNotification("Gagal", e.response?.data?.message || "Gagal memanen.", "error");
    }
  };

  
  const handleShareCertificate = async () => {
    setIsPosting(true);
    try {
      const localHariKe = tanaman ? Math.floor((Date.now() - new Date(tanaman.tanggalTanam || Date.now()).getTime()) / 86400000) + 1 : 0;
      const formData = new FormData();
      formData.append("tipe", "PANEN");
      formData.append("deskripsi", `Tanaman ${tanaman?.nickname || tanaman?.jenisTanaman} resmi dipanen! Total dirawat ${localHariKe} hari dengan skor ${tanaman?.predictiveScore}. Panen raya dari kebun TaniSync.`);

      const cached = await SecureStore.getItemAsync("userData");
      if (cached) {
        try {
          const u = JSON.parse(cached);
          if (u.latitude != null && u.longitude != null) {
            formData.append("latitude", String(u.latitude));
            formData.append("longitude", String(u.longitude));
          }
          if (u.kota || u.kabupaten) {
            formData.append("lokasiNama", u.kota || u.kabupaten);
          }
        } catch {}
      }

      if (photoLogsAsc && photoLogsAsc.length > 0) {
        const lastPhoto = photoLogsAsc[photoLogsAsc.length - 1];
        if (lastPhoto) {
          formData.append("fotoUrl", lastPhoto);
        }
      }
      
      await createCommunityPost(formData);
      showNotification("Berhasil Dibagikan!", "Laporan panen kamu telah dipublikasikan ke Komunitas di sekitar radius 2km!", "success");
      setShowCertificate(false);
      router.back();
    } catch (e: any) {
      showNotification("Gagal Membagikan", e.response?.data?.message || "Terjadi gangguan koneksi, silakan coba lagi.", "error");
    } finally {
      setIsPosting(false);
    }
  };

  const handleDeleteTanaman = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteTanaman(tanamanId);
      setShowDeleteConfirm(false);
      showNotification("Terhapus", "Tanaman berhasil dihapus permanen!", "success");
      setTimeout(() => router.back(), 300);
    } catch (e: any) {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
      showNotification("Gagal", e.response?.data?.message || "Gagal menghapus tanaman", "error");
    }
  };

  const handleValidasiButton = async () => {
    if (isSubmitting) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const optimisticLog: LogAktivitas = {
      id: Date.now(),
      userId: tanaman?.userId ?? 0,
      tanamanId,
      tipeValidasi: "button_only",
      fotoUrl: null,
      createdAt: new Date().toISOString()
    };

    const optimisticLogTerakhir = {
      id: optimisticLog.id,
      tipeValidasi: "button_only",
      fotoUrl: null,
      createdAt: optimisticLog.createdAt
    };

    // Optimistic UI Update: Langsung ubah state lokal tanaman & logs biar instan 0ms
    setTanaman((prev: any) => prev ? {
      ...prev,
      statusPenyiraman: 'SUDAH_DISIRAM',
      logTerakhir: optimisticLogTerakhir
    } : prev);

    setLogs(prev => [optimisticLog, ...prev]);

    // Update local cache asynchronously
    AsyncStorage.getItem("dashboard_tanaman").then(cached => {
      if (cached) {
        try {
          const list: TanamanDetail[] = JSON.parse(cached);
          const idx = list.findIndex(t => t.id === tanamanId);
          if (idx !== -1) {
            list[idx].statusPenyiraman = 'SUDAH_DISIRAM';
            list[idx].logTerakhir = optimisticLogTerakhir;
            AsyncStorage.setItem("dashboard_tanaman", JSON.stringify(list)).catch(() => {});
          }
        } catch {}
      }
    }).catch(() => {});

    setIsSubmitting(true);
    try {
      const res = await createLog({ tanamanId, tipeValidasi: "button_only" });
      if (res.levelUp) {
        setToastMessage(`LEVEL UP! Level ${res.level}`);
      } else {
        setToastMessage(`Mantap! +${res.expDidapat} EXP! Streak: ${res.streak} hari`);
      }
      const cached = await SecureStore.getItemAsync("userData");
      if (cached) {
        const parsed = JSON.parse(cached);
        parsed.exp = res.expSekarang;
        parsed.level = res.level;
        parsed.streak = res.streak;
        await SecureStore.setItemAsync("userData", JSON.stringify(parsed));
      }
      setTimeout(() => setToastMessage(null), 4000);
      
      // Update background data
      fetchData();
    } catch (e: any) {
      showNotification("Gagal", e.response?.data?.message || "Gagal validasi", "error");
      // Revert state if failed
      fetchData();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleValidasiPhoto = async () => {
    if (isSubmitting || isUploadingPhoto) return;
    
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        showNotification("Izin Ditolak", "TaniSync membutuhkan izin kamera untuk memvalidasi foto tanaman kamu.", "error");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7 });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        
        Alert.alert("Validasi Foto", "Apakah kamu yakin ingin mengirim foto ini?", [
          { text: "Batal", style: "cancel" },
          { text: "Kirim", onPress: async () => {
              setIsSubmitting(true);
              setIsUploadingPhoto(true);
              try {
                const res = await createLog({ tanamanId, tipeValidasi: "photo", fotoUri: uri });
                if (res.levelUp) {
                  setToastMessage(`LEVEL UP! Level ${res.level}`);
                } else {
                  setToastMessage(`Mantap! +${res.expDidapat} EXP! Streak: ${res.streak} hari`);
                }
                const cached = await SecureStore.getItemAsync("userData");
                if (cached) {
                  const parsed = JSON.parse(cached);
                  parsed.exp = res.expSekarang;
                  parsed.level = res.level;
                  parsed.streak = res.streak;
                  await SecureStore.setItemAsync("userData", JSON.stringify(parsed));
                }
                setTimeout(() => setToastMessage(null), 4000);
                fetchData();
              } catch (e: any) {
                showNotification("Gagal", e.response?.data?.message || "Gagal upload foto", "error");
              } finally {
                setIsSubmitting(false);
                setIsUploadingPhoto(false);
              }
          }}
        ]);
      }
    } catch (e: any) {
      setIsSubmitting(false);
      setIsUploadingPhoto(false);
      showNotification("Gagal", e?.message || "Gagal membuka kamera", "error");
    }
  };

  const [currentTimestamp] = useState(() => Date.now());

  const { hariKe, estPanenString } = useMemo(() => {
    if (!tanaman) return { hariKe: 0, estPanenString: '-' };
    const plantDate = new Date(tanaman.tanggalTanam || currentTimestamp).getTime();
    const h = Math.floor((currentTimestamp - plantDate) / 86400000) + 1;
    const est = new Date(plantDate + ((tanaman.daysToHarvest || 0) * 86400000));
    return {
      hariKe: h,
      estPanenString: isNaN(est.getTime()) ? '-' : est.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    };
  }, [tanaman, currentTimestamp]);

  if (isLoading && !tanaman) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={{ marginRight: 16 }}>
            <MaterialIcons name="arrow-back" size={24} color="#123924" />
          </Pressable>
          <Text style={styles.headerTitle}>Detail Tanaman</Text>
        </View>
        <DetailTanamanSkeleton />
      </SafeAreaView>
    );
  }

  if (!tanaman) return null;
  const totalDays = tanaman.daysToHarvest || 30;
  const remainingDays = Math.max(0, tanaman.sisaHariPanen ?? 0);
  const elapsedDays = Math.max(0, totalDays - remainingDays);
  const progressPercent = Math.min(100, Math.max(0, Math.round((elapsedDays / totalDays) * 100)));

  const handleShare = async () => {
    try {
      const shareMessage = `Progres Tanaman TaniSync\n\nSaya sedang merawat ${tanaman?.nickname || tanaman?.jenisTanaman} selama ${hariKe} hari.\nStatus kesehatan tanaman mencapai skor ${tanaman?.predictiveScore}/100.\n\nTersisa ${tanaman?.sisaHariPanen} hari lagi menuju panen. Mari mulai kebun kamu sendiri di TaniSync!`;
      await Share.share({
        message: shareMessage,
        title: "Bagikan Progres Tanaman TaniSync" });
    } catch (error) {
      console.error(error);
    }
  };

  let badgeBgColor = "#E8F5E9";
  let badgeBorderColor = "#3FA86B";
  let badgeTextColor = "#1B5E20";
  let badgeText = "Aman";
  let badgeIcon: keyof typeof MaterialIcons.glyphMap = "check-circle";

  if (tanaman.statusPenyiraman === "PERLU_SIRAM") {
    badgeBgColor = "#FFECEB";
    badgeBorderColor = "#FF6B5C";
    badgeTextColor = "#D32F2F";
    badgeText = "Perlu Disiram";
    badgeIcon = "water-drop";
  } else if (tanaman.statusPenyiraman === "DITUNDA_HUJAN") {
    badgeBgColor = "#FFF9E6";
    badgeBorderColor = "#FFB627";
    badgeTextColor = "#B45309";
    badgeText = "Ditunda Hujan";
    badgeIcon = "cloud";
  } else if (tanaman.statusPenyiraman === "SUDAH_DISIRAM") {
    badgeBgColor = "#E8F5E9";
    badgeBorderColor = "#3FA86B";
    badgeTextColor = "#1B5E20";
    badgeText = "Sudah Disiram";
    badgeIcon = "check-circle";
  }

  if (sudahValidasiHariIni) {
    badgeBgColor = "#E8F5E9";
    badgeBorderColor = "#3FA86B";
    badgeTextColor = "#1B5E20";
    badgeText = "Sudah Disiram";
    badgeIcon = "check-circle";
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
          <TouchableOpacity style={styles.iconButton} onPress={() => router.back()} disabled={isDeleting}>
            <MaterialIcons name="arrow-back" size={24} color="#123924" />
          </TouchableOpacity>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity style={[styles.iconButton, { backgroundColor: '#E3F5EC' }]} onPress={handleOpenEdit}>
              <MaterialIcons name="edit" size={20} color="#123924" />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.iconButton, { backgroundColor: '#FFB627' }]} onPress={handleShare}>
              <MaterialIcons name="share" size={24} color="#123924" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={handleDeleteTanaman} disabled={isDeleting}>
              {isDeleting ? (
                <ActivityIndicator size="small" color="#FF6B5C" />
              ) : (
                <MaterialIcons name="delete-outline" size={24} color="#FF6B5C" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* HERO SECTION */}
        <View style={styles.heroSection}>
          <View style={styles.imageWrapper}>
            {isPlayingMemory ? (
              <Image source={{ uri: photoLogsAsc[memoryIndex] }} style={styles.heroImage} />
            ) : latestPhotoUrl ? (
              <Image source={{ uri: latestPhotoUrl }} style={styles.heroImage} />
            ) : (
              <PlantIllustration 
                jenisTanaman={tanaman?.jenisTanaman} 
                size={110} 
                style={styles.heroImage} 
              />
            )}
            
            {/* Memory overlay text */}
            {isPlayingMemory && (
              <View style={{ position: 'absolute', top: 16, right: 16, backgroundColor: 'rgba(18, 57, 36, 0.7)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 16 }}>
                <Text style={{ color: '#FFFFFF', fontFamily: 'Nunito_700Bold', fontSize: 12 }}>
                  Memori {memoryIndex + 1}/{photoLogsAsc.length}
                </Text>
              </View>
            )}
          </View>
          
          <TouchableOpacity 
            style={[styles.floatingCamButton, sudahValidasiHariIni && { opacity: 0.5 }]} 
            onPress={() => {
              if (sudahValidasiHariIni) {
                showNotification("Informasi", "Tanaman ini sudah disiram hari ini.", "info");
              } else {
                handleValidasiPhoto();
              }
            }} 
            disabled={isSubmitting || isUploadingPhoto}
          >
            <MaterialIcons name="photo-camera" size={22} color="#123924" />
          </TouchableOpacity>
          
          {photoLogsAsc.length > 1 && (
            <TouchableOpacity 
              style={[styles.floatingCamButton, { right: undefined, left: 12, backgroundColor: isPlayingMemory ? '#FF6B5C' : '#3FA86B' }]} 
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                if (!isPlayingMemory) {
                  setMemoryIndex(0);
                  setIsPlayingMemory(true);
                } else {
                  setIsPlayingMemory(false);
                }
              }}
            >
              <MaterialIcons name={isPlayingMemory ? "stop" : "play-arrow"} size={22} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>

        {/* TITLE & BADGE HEADER */}
        <View style={styles.titleSection}>
          <View style={styles.titleTopRow}>
            <View style={styles.titleLeftCol}>
              <Text style={styles.plantTitle} numberOfLines={1}>
                {tanaman.nickname ?? tanaman.jenisTanaman}
              </Text>
              <TouchableOpacity 
                style={styles.editTitleBtn}
                onPress={handleOpenEdit}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <MaterialIcons name="edit" size={15} color="#7D7A6E" />
              </TouchableOpacity>
            </View>
            <View style={[styles.badge, { backgroundColor: badgeBgColor, borderColor: badgeBorderColor }]}>
              <MaterialIcons name={badgeIcon} size={13} color={badgeTextColor} style={{ marginRight: 4 }} />
              <Text style={[styles.badgeText, { color: badgeTextColor }]}>{badgeText}</Text>
            </View>
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <MaterialIcons name="eco" size={14} color="#3FA86B" style={{ marginRight: 4 }} />
              <Text style={styles.metaText}>{tanaman.jenisTanaman}</Text>
            </View>
            <Text style={styles.metaDot}>•</Text>
            <View style={styles.metaItem}>
              <MaterialIcons name="calendar-today" size={13} color="#7D7A6E" style={{ marginRight: 4 }} />
              <Text style={styles.metaText}>Hari ke-{hariKe}</Text>
            </View>
            <Text style={styles.metaDot}>•</Text>
            <View style={styles.metaItem}>
              <MaterialIcons name="verified" size={13} color="#FFB627" style={{ marginRight: 4 }} />
              <Text style={styles.metaText}>Skor {tanaman.predictiveScore ?? 0}</Text>
            </View>
          </View>
        </View>

        {/* HARVEST ESTIMATION CARD */}
        <View style={styles.harvestCard}>
          <View style={styles.harvestTopRow}>
            <View style={styles.harvestLeft}>
              <View style={styles.harvestIconPill}>
                <MaterialIcons name="event-available" size={18} color="#FFB627" />
              </View>
              <View style={styles.harvestInfoCol}>
                <Text style={styles.harvestLabel}>ESTIMASI PANEN</Text>
                <Text style={styles.harvestCountdown} numberOfLines={1}>
                  {remainingDays <= 0 ? "Siap Dipanen Sekarang" : `Sisa ${remainingDays} Hari Lagi`}
                </Text>
              </View>
            </View>

            <View style={styles.harvestRight}>
              <Text style={styles.harvestDateText}>{estPanenString}</Text>
              <Text style={styles.harvestPercentText}>{progressPercent}% Tumbuh</Text>
            </View>
          </View>

          <View style={styles.harvestProgressBarTrack}>
            <View style={[styles.harvestProgressBarFill, { width: `${progressPercent}%` }]} />
          </View>
        </View>


        {tanaman.sisaHariPanen <= 0 && (
          <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
            <TouchableOpacity 
              style={styles.harvestActionBtn} 
              onPress={handleHarvest} 
              disabled={isHarvesting}
            >
              {isHarvesting ? (
                <ActivityIndicator color="#123924" />
              ) : (
                <Text style={styles.harvestActionBtnText}>Panen!</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* ACTION BUTTONS (Sesuai mockup tapi dimodif buat Konfirmasi Disiram) */}
        {(tanaman.sisaHariPanen ?? 999) > 0 && (
          sudahValidasiHariIni ? (
            <Text style={{ fontSize: 12, color: '#5C5A4F', textAlign: 'center', marginBottom: 20 }}>
              Tanaman ini sudah divalidasi hari ini, balik lagi besok ya!
            </Text>
          ) : tanaman.statusPenyiraman === "DITUNDA_HUJAN" ? (
            <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: 14, color: '#123924', textAlign: 'center', backgroundColor: '#E3F5EC', padding: 16, borderRadius: 16, borderWidth: 0, borderColor: '#3FA86B', marginHorizontal: 20, marginBottom: 20 }}>
              Penyiraman ditunda karena sistem mendeteksi cuaca hujan lebat hari ini! Streak kamu aman!
            </Text>
          ) : (
            true && (
              <View style={styles.actionRow}>
                <TouchableOpacity style={[styles.actionBtn, styles.btnWhite]} onPress={handleValidasiButton} disabled={isSubmitting}>
                  {isSubmitting ? <ActivityIndicator color="#123924" /> : <Text style={styles.btnWhiteText}>Konfirmasi{`\n`}Disiram</Text>}
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, styles.btnGreen]} onPress={handleValidasiPhoto} disabled={isSubmitting}>
                  {isSubmitting ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.btnGreenText}>Foto &{`\n`}Validasi</Text>}
                </TouchableOpacity>
              </View>
            )
          )
        )}

        {/* HISTORY SECTION */}
        <View style={styles.historySection}>
          <View style={styles.historyHeaderRow}>
            <Text style={styles.historySectionTitle}>Riwayat Perawatan</Text>
            {logs.length > 0 && (
              <View style={styles.historySummaryChips}>
                <View style={styles.summaryChip}>
                  <MaterialIcons name="water-drop" size={12} color="#1F5C3D" style={{ marginRight: 3 }} />
                  <Text style={styles.summaryChipText}>{wateringCount}x Disiram</Text>
                </View>
                {photoCount > 0 && (
                  <View style={styles.summaryChip}>
                    <MaterialIcons name="photo-camera" size={12} color="#1F5C3D" style={{ marginRight: 3 }} />
                    <Text style={styles.summaryChipText}>{photoCount}x Jurnal</Text>
                  </View>
                )}
              </View>
            )}
          </View>
          
          {logs.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="history" size={40} color="#a09d91" style={{ marginBottom: 6 }}/>
              <Text style={styles.emptyText}>Belum ada jurnal perawatan</Text>
            </View>
          ) : (
            <>
              {displayedLogs.map((log, index) => (
                <View 
                  key={log.id} 
                  style={[
                    styles.historyItem, 
                    index === displayedLogs.length - 1 && (!(!showAllLogs && logs.length > 3)) && { borderBottomWidth: 0 }
                  ]}
                >
                  {log.tipeValidasi === 'photo' ? (
                    <Image source={{ uri: log.fotoUrl || FALLBACK_THUMB }} style={styles.historyImage} />
                  ) : (
                    <View style={[styles.historyImage, styles.historyIconPlaceholder]}>
                      <MaterialIcons name="check-circle" size={22} color="#3FA86B" />
                    </View>
                  )}
                  
                  <View style={styles.historyTextCol}>
                    <Text style={styles.historyTitle}>{log.tipeValidasi === 'photo' ? 'Validasi Foto' : 'Konfirmasi Penyiraman'}</Text>
                    <Text style={styles.historySubtitle}>{formatDate(log.createdAt)}</Text>
                  </View>
                </View>
              ))}

              {logs.length > 3 && (
                <TouchableOpacity 
                  style={styles.toggleLogsButton}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setShowAllLogs(prev => !prev);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.toggleLogsText}>
                    {showAllLogs ? "Tampilkan Lebih Sedikit" : `Lihat Semua Riwayat (${logs.length})`}
                  </Text>
                  <MaterialIcons 
                    name={showAllLogs ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
                    size={18} 
                    color="#1F5C3D" 
                  />
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </ScrollView>
      {(isUploadingPhoto || isHarvesting) && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#FFFFFF" />
        </View>
      )}
    
      

    
      {/* EDIT MODAL */}
      <Modal visible={isEditModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Tanaman</Text>
              <Pressable onPress={() => setIsEditModalVisible(false)} disabled={isSavingEdit}>
                <MaterialIcons name="close" size={24} color="#123924" />
              </Pressable>
            </View>

            <Text style={styles.modalLabel}>Panggilan Kesayangan (Opsional)</Text>
            <TextInput
              style={styles.modalInput}
              value={editNickname}
              onChangeText={setEditNickname}
              placeholder="Nickname tanaman"
              placeholderTextColor="#a09d91"
            />

            <Text style={styles.modalLabel}>Pilih Jenis Tanaman</Text>
            <ScrollView style={styles.pickerContainer}>
              {JENIS_TANAMAN_ENUM.map((jenis) => (
                <Pressable
                  key={jenis}
                  style={({ pressed }) => [
                    styles.pickerItem,
                    editJenis === jenis && styles.pickerItemActive,
                    pressed && { opacity: 0.75 },
                  ]}
                  onPress={() => setEditJenis(jenis)}
                >
                  <Text
                    style={[
                      styles.pickerItemText,
                      editJenis === jenis && styles.pickerItemTextActive,
                    ]}
                  >
                    {jenis}
                  </Text>
                  {editJenis === jenis && (
                    <MaterialIcons name="check-circle" size={20} color="#FFFFFF" />
                  )}
                </Pressable>
              ))}
            </ScrollView>

            <Pressable
              style={({ pressed }) => [
                styles.submitButton,
                pressed && !isSavingEdit && { opacity: 0.8 },
              ]}
              onPress={handleEditSave}
              disabled={isSavingEdit}
            >
              {isSavingEdit ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>Simpan Perubahan</Text>
              )}
            </Pressable>
          </View>
        </View>
      </Modal>

      
      <Modal visible={showDeleteConfirm} animationType="fade" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(28, 28, 59, 0.7)', justifyContent: 'center', padding: 24 }}>
          <View style={{ backgroundColor: '#FBF8F0', borderRadius: 24, padding: 24, borderWidth: 0,  shadowColor: "#123924", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 14, elevation: 4, alignItems: 'center' }}>
            <Image source={require("../assets/images/icontampilanawal/seedling-ngantuk.svg")} style={{ width: 120, height: 120, marginBottom: 16, resizeMode: 'contain' }} />
            <Text style={{ fontFamily: 'Nunito_800ExtraBold', fontSize: 24, color: '#123924', textAlign: 'center', marginBottom: 8 }}>Hapus Tanaman?</Text>
            <Text style={{ fontFamily: 'Nunito_500Medium', fontSize: 14, color: '#5C5A4F', textAlign: 'center', marginBottom: 24 }}>
              Tanaman ini beserta seluruh riwayat jurnalnya akan dihapus permanen dan tidak bisa dikembalikan.
            </Text>
            <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
              <TouchableOpacity style={{ flex: 1, padding: 16, borderRadius: 16, borderWidth: 0,  alignItems: 'center' }} onPress={() => setShowDeleteConfirm(false)}>
                <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: 16, color: '#123924' }}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ flex: 1, padding: 16, borderRadius: 16, backgroundColor: '#FF4C4C', borderWidth: 0,  alignItems: 'center' }} onPress={confirmDelete} disabled={isDeleting}>
                {isDeleting ? <ActivityIndicator color="#FFFFFF" /> : <Text style={{ fontFamily: 'Nunito_800ExtraBold', fontSize: 16, color: '#FFFFFF' }}>Hapus</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showHarvestConfirm} animationType="fade" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(28, 28, 59, 0.7)', justifyContent: 'center', padding: 24 }}>
          <View style={{ backgroundColor: '#FBF8F0', borderRadius: 24, padding: 24, borderWidth: 0,  shadowColor: "#123924", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 14, elevation: 4, alignItems: 'center' }}>
            <Image source={require("../assets/images/icontampilanawal/seedling-lompat.svg")} style={{ width: 120, height: 120, marginBottom: 16, resizeMode: 'contain' }} />
            <Text style={{ fontFamily: 'Nunito_800ExtraBold', fontSize: 24, color: '#123924', textAlign: 'center', marginBottom: 8 }}>Panen Tanaman Ini?</Text>
            <Text style={{ fontFamily: 'Nunito_500Medium', fontSize: 14, color: '#5C5A4F', textAlign: 'center', marginBottom: 24 }}>
              Perjuanganmu merawat {tanaman?.nickname || tanaman?.jenisTanaman} sudah selesai! Tanaman ini akan dicatat di riwayat panenmu.
            </Text>
            <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
              <TouchableOpacity style={{ flex: 1, padding: 16, borderRadius: 16, borderWidth: 0,  alignItems: 'center' }} onPress={() => setShowHarvestConfirm(false)}>
                <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: 16, color: '#123924' }}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ flex: 1, padding: 16, borderRadius: 16, backgroundColor: '#FFB627', borderWidth: 0,  alignItems: 'center' }} onPress={confirmHarvest}>
                <Text style={{ fontFamily: 'Nunito_800ExtraBold', fontSize: 16, color: '#123924' }}>Panen!</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showCertificate} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(28, 28, 59, 0.95)', justifyContent: 'center', padding: 24 }}>
          <View style={{ backgroundColor: '#FBF8F0', borderRadius: 24, overflow: 'hidden', borderWidth: 0, borderColor: '#FFB627', paddingBottom: 24, shadowColor: '#FFB627', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 8 }}>
            
            <View style={{ backgroundColor: '#FFB627', paddingVertical: 24, paddingHorizontal: 20, alignItems: 'center', }}>
              <Text style={{ fontFamily: 'Nunito_800ExtraBold', fontSize: 24, color: '#123924', textAlign: 'center' }}>Sertifikat Lulus Panen</Text>
            </View>

            <View style={{ padding: 24, alignItems: 'center' }}>
              <Text style={{ fontFamily: 'Nunito_800ExtraBold', fontSize: 20, color: '#123924', marginBottom: 8, textAlign: 'center' }}>
                {tanaman?.nickname || tanaman?.jenisTanaman} Resmi Dipanen!
              </Text>
              
              <View style={{ flexDirection: 'row', gap: 16, marginTop: 16, width: '100%' }}>
                <View style={{ flex: 1, backgroundColor: '#E8F5E9', padding: 16, borderRadius: 16, borderWidth: 0, borderColor: '#3FA86B', alignItems: 'center' }}>
                  <Text style={{ fontFamily: 'Nunito_800ExtraBold', fontSize: 24, color: '#3FA86B' }}>{hariKe}</Text>
                  <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: 12, color: '#123924', marginTop: 4 }}>Hari Dirawat</Text>
                </View>
                <View style={{ flex: 1, backgroundColor: '#FFE5E3', padding: 16, borderRadius: 16, borderWidth: 0, borderColor: '#FF6B5C', alignItems: 'center' }}>
                  <Text style={{ fontFamily: 'Nunito_800ExtraBold', fontSize: 24, color: '#FF6B5C' }}>{tanaman?.predictiveScore || 0}</Text>
                  <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: 12, color: '#123924', marginTop: 4 }}>Total Skor</Text>
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: 8, marginTop: 24 }}>
                {photoLogsAsc.slice(0, 3).map((url, i) => (
                  <View key={i} style={{ width: 80, height: 80, borderRadius: 12, borderWidth: 0,  overflow: 'hidden', transform: [{ rotate: i === 1 ? '5deg' : '-5deg' }] }}>
                    <Image source={{ uri: url }} style={{ width: '100%', height: '100%' }} />
                  </View>
                ))}
                {photoLogsAsc.length === 0 && (
                  <View style={{ padding: 12, alignItems: 'center', opacity: 0.6 }}>
                    <MaterialIcons name="camera-alt" size={32} color="#123924" />
                    <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: 12, color: '#123924' }}>Gak ada foto memori</Text>
                  </View>
                )}
              </View>
            </View>

            <View style={{ paddingHorizontal: 24, gap: 12 }}>
              <TouchableOpacity 
                style={{ backgroundColor: '#123924', padding: 16, borderRadius: 16, alignItems: 'center', borderWidth: 0,  shadowColor: '#3FA86B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 }}
                onPress={handleShareCertificate}
                disabled={isPosting}
              >
                <Text style={{ fontFamily: 'Nunito_800ExtraBold', fontSize: 16, color: '#FFFFFF' }}>
                  {isPosting ? "Menerbitkan..." : "Pamer ke Komunitas"}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={{ backgroundColor: 'transparent', padding: 16, borderRadius: 16, alignItems: 'center' }}
                onPress={() => {
                  setShowCertificate(false);
                  router.back();
                }}
              >
                <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: 16, color: '#5C5A4F' }}>Kembali ke Kebun</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    
    borderBottomColor: '#E8E5DA' },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Nunito_800ExtraBold',
    color: '#123924' },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: '#FBF8F0',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    borderWidth: 0,
    
    maxHeight: '80%' },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20 },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Nunito_800ExtraBold',
    color: '#123924' },
  modalLabel: {
    fontSize: 14,
    fontFamily: 'Nunito_700Bold',
    color: '#123924',
    marginBottom: 8,
    marginTop: 16 },
  modalInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 0,
    
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: 'Nunito_500Medium',
    color: '#123924' },
  pickerContainer: {
    maxHeight: 200,
    backgroundColor: '#FFFFFF',
    borderWidth: 0,
    
    borderRadius: 16,
    marginBottom: 24 },
  pickerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    
    borderBottomColor: '#E8E5DA' },
  pickerItemActive: {
    backgroundColor: '#3FA86B' },
  pickerItemText: {
    fontSize: 14,
    fontFamily: 'Nunito_500Medium',
    color: '#123924' },
  pickerItemTextActive: {
    color: '#FFFFFF',
    fontFamily: 'Nunito_700Bold' },
  submitButton: {
    backgroundColor: '#3FA86B',
    paddingVertical: 16,
    borderRadius: 100,
    alignItems: 'center',
    borderWidth: 0,
    
    shadowColor: "#123924", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 14, elevation: 4 },
  submitButtonText: {
    fontSize: 16,
    fontFamily: 'Nunito_800ExtraBold',
    color: '#123924' },
  safeArea: { flex: 1, backgroundColor: '#FBF8F0' },
  scrollContent: { paddingBottom: 40 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 16, marginBottom: 16 },
  iconButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFFFFF', borderWidth: 0, alignItems: 'center', justifyContent: 'center', elevation: 4 },
  heroSection: { marginHorizontal: 20, position: 'relative', marginBottom: 20 },
  imageWrapper: { width: '100%', aspectRatio: 1, borderRadius: 20, borderWidth: 0,  overflow: 'hidden', backgroundColor: '#96d4ad', elevation: 4 },
  heroImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  floatingCamButton: { 
    position: 'absolute', 
    bottom: 12, 
    right: 12, 
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    backgroundColor: '#FFFFFF', 
    borderWidth: 0,  
    alignItems: 'center', 
    justifyContent: 'center', 
    elevation: 4, 
    shadowColor: "#123924",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    zIndex: 10 
  },
  titleSection: { 
    paddingHorizontal: 20, 
    marginBottom: 16,
  },
  titleTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  titleLeftCol: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  plantTitle: { 
    fontSize: 22, 
    fontFamily: 'Nunito_800ExtraBold', 
    color: '#123924', 
    flexShrink: 1,
  },
  editTitleBtn: {
    padding: 4,
    borderRadius: 8,
    backgroundColor: '#ECEAE2',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    fontFamily: 'Nunito_600SemiBold',
    color: '#5C5A4F',
  },
  metaDot: {
    fontSize: 12,
    color: '#B0ADA0',
    marginHorizontal: 2,
  },
  badge: { 
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10, 
    paddingVertical: 4, 
    borderRadius: 12, 
    borderWidth: 1,
  },
  badgeText: { 
    fontSize: 11, 
    fontFamily: 'Nunito_700Bold',
  },

  harvestCard: { 
    marginHorizontal: 20, 
    backgroundColor: '#1F5C3D', 
    borderRadius: 20, 
    padding: 16, 
    marginBottom: 20, 
    shadowColor: '#123924', 
    shadowOffset: { width: 0, height: 6 }, 
    shadowOpacity: 0.12, 
    shadowRadius: 12, 
    elevation: 4,
  },
  harvestTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  harvestLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  harvestIconPill: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 182, 39, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  harvestInfoCol: {
    flex: 1,
  },
  harvestLabel: {
    fontSize: 10,
    fontFamily: 'Nunito_700Bold',
    color: 'rgba(255, 255, 255, 0.7)',
    letterSpacing: 0.5,
  },
  harvestCountdown: {
    fontSize: 14,
    fontFamily: 'Nunito_800ExtraBold',
    color: '#FFFFFF',
    marginTop: 1,
  },
  harvestRight: {
    alignItems: 'flex-end',
  },
  harvestDateText: {
    fontSize: 11,
    fontFamily: 'Nunito_600SemiBold',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  harvestPercentText: {
    fontSize: 11,
    fontFamily: 'Nunito_800ExtraBold',
    color: '#FFB627',
    marginTop: 1,
  },
  harvestProgressBarTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    marginTop: 12,
    overflow: 'hidden',
  },
  harvestProgressBarFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: '#3FA86B',
  },

  harvestActionBtn: {
    backgroundColor: '#FFB627',
    borderWidth: 0,
    borderRadius: 30,
    minHeight: 60,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  harvestActionBtnText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 20,
    color: '#123924',
  },

  actionRow: { flexDirection: 'row', gap: 16, paddingHorizontal: 20, marginBottom: 20 },
  actionBtn: { flex: 1, minHeight: 56, borderRadius: 999, borderWidth: 0,  alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12, elevation: 3 },
  btnWhite: { backgroundColor: '#FFFFFF' },
  btnGreen: { backgroundColor: '#3FA86B' },
  btnWhiteText: { fontSize: 12, fontWeight: '700', color: '#123924', textAlign: 'center' },
  btnGreenText: { fontSize: 12, fontWeight: '700', color: '#FFFFFF', textAlign: 'center' },

  historySection: { 
    paddingHorizontal: 20,
    marginTop: 4,
  },
  historyHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  historySectionTitle: { 
    fontSize: 16, 
    fontFamily: 'Nunito_800ExtraBold', 
    color: '#123924',
  },
  historySummaryChips: {
    flexDirection: 'row',
    gap: 8,
  },
  summaryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  summaryChipText: {
    fontSize: 11,
    fontFamily: 'Nunito_700Bold',
    color: '#1F5C3D',
  },
  historyItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E5DA',
  },
  historyImage: { 
    width: 42, 
    height: 42, 
    borderRadius: 10, 
    marginRight: 12, 
    backgroundColor: '#e5e2db',
  },
  historyIconPlaceholder: {
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: '#F0F5F2',
    borderWidth: 1,
    borderColor: '#E1EBE5',
  },
  historyTextCol: { flex: 1 },
  historyTitle: { 
    fontSize: 13, 
    fontFamily: 'Nunito_700Bold', 
    color: '#123924',
  },
  historySubtitle: { 
    fontSize: 11, 
    fontFamily: 'Nunito_500Medium',
    color: '#7D7A6E', 
    marginTop: 2,
  },
  toggleLogsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    marginTop: 8,
    borderRadius: 12,
    backgroundColor: '#EAE7DD',
    gap: 4,
  },
  toggleLogsText: {
    fontSize: 12,
    fontFamily: 'Nunito_700Bold',
    color: '#1F5C3D',
  },

  toast: { position: 'absolute', top: 20, left: 20, right: 20, backgroundColor: '#FFB627', padding: 16, borderRadius: 12, zIndex: 50, elevation: 10, borderWidth: 0 },
  toastText: { color: '#123924', fontWeight: '800', textAlign: 'center' },
  loadingOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(18,57,36,0.6)', justifyContent: 'center', alignItems: 'center', zIndex: 100 },
  emptyState: { alignItems: 'center', paddingVertical: 32, opacity: 0.7 },
  emptyText: { fontSize: 14, color: '#5C5A4F', fontWeight: '600' }
});
