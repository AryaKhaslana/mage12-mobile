import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import * as SecureStore from "expo-secure-store";
import { useCallback, useMemo, useState , useEffect, useRef } from 'react';
import { ActivityIndicator, Alert, Animated, Modal, Pressable, ScrollView, Share, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNotification } from '../components/NotificationContext';
import { LogAktivitas, TanamanDetail, createCommunityPost, createLog, deleteTanaman, getLogsByTanaman, getTanamanById, harvestTanaman, updateTanaman } from '../services/api';




const FALLBACK_HERO = 'https://lh3.googleusercontent.com/aida-public/AOSwzR6X7y3O2Q2_0uXwFhK8TQKf0vFvP4o7SjYdJ9k-h-5E8tV8D2Q3g0K_b8QkLp6g5zZ9n3nK2N8k5L0g-v4c0r9r6p2y2J5b8w';

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
  const fadeAnim = useRef(new Animated.Value(0.4)).current;

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
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPlayingMemory, setIsPlayingMemory] = useState(false);
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
      Alert.alert("Gagal", e.response?.data?.message || "Gagal mengupdate tanaman.");
    } finally {
      setIsSavingEdit(false);
    }
  };

  const fetchData = async () => {
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

  const photoLogsAsc = useMemo(() => {
    return logs.filter(l => !!l.fotoUrl).map(l => l.fotoUrl as string).reverse();
  }, [logs]);

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
    return logs.some(l => new Date(l.createdAt).toDateString() === today);
  }, [logs]);


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
      Alert.alert("Gagal", e.response?.data?.message || "Gagal memanen.");
    }
  };

  
  const handleShareCertificate = async () => {
    setIsPosting(true);
    try {
      const localHariKe = tanaman ? Math.floor((Date.now() - new Date(tanaman.tanggalTanam || Date.now()).getTime()) / 86400000) + 1 : 0;
      const formData = new FormData();
      formData.append("tipePost", "panen_surplus");
      formData.append("deskripsi", `Tanaman ${tanaman?.nickname || tanaman?.jenisTanaman} resmi dipanen! Total dirawat ${localHariKe} hari dengan skor ${tanaman?.predictiveScore}. Panen raya nih bosku! `);
      
      await createCommunityPost(formData);
      Alert.alert("Mantap!", "Raport panen lu udah mejeng di Komunitas radius 2km! ");
      setShowCertificate(false);
      router.back();
    } catch (e: any) {
      Alert.alert("Gagal Pamer", e.response?.data?.message || "Koneksi lagi ngambek.");
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
        quality: 0.7 });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        
        Alert.alert("Validasi Foto", "Yakin mau kirim foto ini?", [
          { text: "Batal", style: "cancel" },
          { text: "Kirim", onPress: async () => {
              setIsSubmitting(true);
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

  const hariKe = Math.floor((Date.now() - new Date(tanaman.tanggalTanam || Date.now()).getTime()) / 86400000) + 1;
  const estPanenDate = new Date(new Date(tanaman.tanggalTanam || Date.now()).getTime() + ((tanaman.daysToHarvest || 0) * 86400000));
  const estPanenString = isNaN(estPanenDate.getTime()) ? '-' : estPanenDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  const handleShare = async () => {
    try {
      const shareMessage = ` Pamer Progres TaniSync! \n\nGue udah ngerawat ${tanaman?.nickname || tanaman?.jenisTanaman} selama ${hariKe} hari!\nStatus kesehatannya dapet skor ${tanaman?.predictiveScore}/100! \n\nSisa ${tanaman?.sisaHariPanen} hari lagi menuju panen! Yuk buruan mulai kebun lu sendiri di TaniSync! `;
      await Share.share({
        message: shareMessage,
        title: "Pamer Progres TaniSync" });
    } catch (error) {
      console.error(error);
    }
  };

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

  if (sudahValidasiHariIni) {
    badgeBgColor = "#E8F5E9";
    badgeBorderColor = "#3FA86B";
    badgeTextColor = "#123924";
    badgeText = "Sudah Disiram Hari Ini ";
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
            <Image source={{ uri: isPlayingMemory ? photoLogsAsc[memoryIndex] : latestPhotoUrl }} style={styles.heroImage} />
            
            {/* Memory overlay text */}
            {isPlayingMemory && (
              <View style={{ position: 'absolute', top: 16, right: 16, backgroundColor: 'rgba(18, 57, 36, 0.7)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 16 }}>
                <Text style={{ color: '#FFFFFF', fontFamily: 'Nunito_700Bold', fontSize: 12 }}>
                  Memori {memoryIndex + 1}/{photoLogsAsc.length}
                </Text>
              </View>
            )}
          </View>
          
          <TouchableOpacity style={styles.floatingCamButton} onPress={handleValidasiPhoto} disabled={isSubmitting}>
            <MaterialIcons name="photo-camera" size={24} color="#123924" />
          </TouchableOpacity>
          
          {photoLogsAsc.length > 1 && (
            <TouchableOpacity 
              style={[styles.floatingCamButton, { right: undefined, left: 24, backgroundColor: isPlayingMemory ? '#FF6B5C' : '#3FA86B' }]} 
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
              <MaterialIcons name={isPlayingMemory ? "stop" : "play-arrow"} size={24} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>

        {/* TITLE SECTION */}
        <View style={styles.titleSection}>
          <Text style={styles.plantTitle}>{tanaman.nickname ?? tanaman?.jenisTanaman}</Text>
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
                <Text style={styles.harvestActionBtnText}>Panen! </Text>
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
            <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: 14, color: '#123924', textAlign: 'center', backgroundColor: '#E3F5EC', padding: 16, borderRadius: 16, borderWidth: 0, borderColor: '#3FA86B' }}>
              Penyiraman ditunda karena sistem mendeteksi hujan lebat hari ini! 🌧️ Streak kamu aman!
            </Text>
          ) : (
            tanaman.statusPenyiraman !== "SUDAH_DISIRAM" && (
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
      {(isSubmitting || isHarvesting) && (
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
            <Text style={{ fontFamily: 'Nunito_800ExtraBold', fontSize: 24, color: '#123924', textAlign: 'center', marginBottom: 8 }}>Panen Tanaman Ini? </Text>
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
            
            <View style={{ backgroundColor: '#FFB627', paddingVertical: 24, paddingHorizontal: 20, alignItems: 'center', borderBottomWidth: 4 }}>
              <Text style={{ fontFamily: 'Nunito_800ExtraBold', fontSize: 24, color: '#123924', textAlign: 'center' }}>Sertifikat Lulus Panen </Text>
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
                  {isPosting ? "Menerbitkan..." : "Pamer ke Komunitas "}
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
    borderBottomWidth: 2,
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
    borderBottomWidth: 1,
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
  iconButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFFFFF', borderWidth: 0,  alignItems: 'center', justifyContent: 'center', elevation: 4 },
  heroSection: { marginHorizontal: 20, position: 'relative', marginBottom: 16 },
  imageWrapper: { width: '100%', aspectRatio: 1, borderRadius: 20, borderWidth: 0,  overflow: 'hidden', backgroundColor: '#96d4ad', elevation: 4 },
  heroImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  floatingCamButton: { position: 'absolute', bottom: -16, right: 24, width: 48, height: 48, borderRadius: 24, backgroundColor: '#FFFFFF', borderWidth: 0,  alignItems: 'center', justifyContent: 'center', elevation: 5, zIndex: 10 },
  titleSection: { paddingHorizontal: 20, marginBottom: 20 },
  plantTitle: { fontSize: 24, fontWeight: '800', color: '#1F5C3D', marginBottom: 4 },
  plantSubtitle: { fontSize: 12, color: '#5C5A4F' },
  harvestCard: { marginHorizontal: 20, backgroundColor: '#1F5C3D', borderRadius: 28, padding: 24, flexDirection: 'row', alignItems: 'center', marginBottom: 24, shadowColor: '#123924', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 6 },
  harvestIconCircle: { width: 64, height: 64, borderRadius: 32, borderWidth: 0, borderColor: '#FFB627', borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' },
  harvestTextContainer: { marginLeft: 16, flex: 1 },
  harvestTitle: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
  harvestSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 4 },

  harvestActionBtn: {
    backgroundColor: '#FFB627',
    borderWidth: 0,
    
    borderRadius: 30,
    minHeight: 60,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4 },
  harvestActionBtnText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 20,
    color: '#123924' },

  actionRow: { flexDirection: 'row', gap: 16, paddingHorizontal: 20, marginBottom: 20 },
  actionBtn: { flex: 1, minHeight: 56, borderRadius: 999, borderWidth: 0,  alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12, elevation: 3 },
  btnWhite: { backgroundColor: '#FFFFFF' },
  btnGreen: { backgroundColor: '#3FA86B' },
  btnWhiteText: { fontSize: 12, fontWeight: '700', color: '#123924', textAlign: 'center' },
  btnGreenText: { fontSize: 12, fontWeight: '700', color: '#FFFFFF', textAlign: 'center' },
  historySection: { paddingHorizontal: 20 },
  historySectionTitle: { fontSize: 16, fontWeight: '700', color: '#1F5C3D', marginBottom: 12 },
  historyItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: '#123924' },
  historyImage: { width: 40, height: 40, borderRadius: 8, borderWidth: 0,  marginRight: 12, backgroundColor: '#e5e2db' },
  historyTextCol: { flex: 1 },
  historyTitle: { fontSize: 12, fontWeight: '700', color: '#123924' },
  historySubtitle: { fontSize: 11, color: '#5C5A4F', marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 0 },
  badgeText: { fontSize: 10, fontWeight: "800" },
  toast: { position: 'absolute', top: 20, left: 20, right: 20, backgroundColor: '#FFB627', padding: 16, borderRadius: 12, zIndex: 50, elevation: 10, borderWidth: 0 },
  toastText: { color: '#123924', fontWeight: '800', textAlign: 'center' },
  loadingOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(18,57,36,0.6)', justifyContent: 'center', alignItems: 'center', zIndex: 100 },
  emptyState: { alignItems: 'center', paddingVertical: 32, opacity: 0.7 },
  emptyText: { fontSize: 14, color: '#5C5A4F', fontWeight: '600' }
});
