import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator, Animated,
    FlatList,
    Modal,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import ErrorState from "../../components/ErrorState";
import { useNotification } from "../../components/NotificationContext";
import { getPlantImage } from "../../constants/plantImages";
import api, { TanamanDetail } from "../../services/api";

const JENIS_TANAMAN_ENUM = [
  "Tomat",
  "Cabai Rawit",
  "Cabai Merah",
  "Bawang Merah",
  "Bawang Putih",
  "Terong",
  "Timun",
  "Bayam",
  "Kangkung",
  "Pakcoy",
  "Selada",
  "Sawi Hijau",
  "Kale",
  "Daun Bawang",
  "Seledri",
  "Kemangi",
  "Jahe",
  "Kunyit",
  "Melon", 
  "Stroberi"
];

const PlantGridSkeleton = () => {
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
    <Animated.View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', opacity: fadeAnim }}>
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <View key={i} style={{ width: '48%', backgroundColor: '#FFFFFF', borderRadius: 24, borderWidth: 0,  marginBottom: 16, overflow: 'hidden' }}>
          <View style={{ width: '100%', height: 100, backgroundColor: '#E8E5DA',  }} />
          <View style={{ padding: 12, gap: 6 }}>
            <View style={{ width: '80%', height: 14, borderRadius: 7, backgroundColor: '#E8E5DA' }} />
            <View style={{ width: '90%', height: 10, borderRadius: 5, backgroundColor: '#E8E5DA' }} />
            <View style={{ width: '60%', height: 20, borderRadius: 10, backgroundColor: '#E8E5DA', marginTop: 4 }} />
          </View>
        </View>
      ))}
    </Animated.View>
  );
};


export default function TanamanScreen() {
  const { showNotification } = useNotification();
  const [activeFilter, setActiveFilter] = useState("Semua");
  const filters = ["Semua", "Perlu Disiram", "Sudah Disiram"];
  const [tanamanList, setTanamanList] = useState<TanamanDetail[]>([]);
  const tanamanListRef = useRef<TanamanDetail[]>([]);
  tanamanListRef.current = tanamanList;

  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTanaman, setSelectedTanaman] = useState(JENIS_TANAMAN_ENUM[0]);
  const [nickname, setNickname] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const params = useLocalSearchParams();

  // 0ms instant render from cache
  useEffect(() => {
    const loadCache = async () => {
      try {
        const cached = await AsyncStorage.getItem("dashboard_tanaman");
        if (cached) {
          const parsed: TanamanDetail[] = JSON.parse(cached);
          if (parsed && Array.isArray(parsed) && parsed.length > 0) {
            setTanamanList(parsed);
            tanamanListRef.current = parsed;
            setIsLoading(false);
          }
        }
      } catch (e) {
        // non-fatal
      }
    };
    loadCache();
  }, []);

  useEffect(() => {
    if (params.openModal === 'true') {
      const timer = setTimeout(() => {
        setModalVisible(true);
        router.setParams({ openModal: '' });
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [params.openModal]);
  const fetchTanaman = useCallback(async (isManualRefresh = false) => {
    // Gunakan tanamanListRef.current untuk menghindari stale closure
    if (tanamanListRef.current.length === 0) {
      setIsLoading(true);
      setIsError(false);
    } else if (isManualRefresh) {
      setIsRefreshing(true);
    }
    // Jika bukan manual refresh dan list sudah ada, fetch berjalan SILENT (tanpa skeleton / kedipan)
    try {
      const response = await api.get("/tanaman");
      if (response.data?.status === "success") {
        const data = response.data.data;
        setTanamanList(data);
        tanamanListRef.current = data;
        AsyncStorage.setItem("dashboard_tanaman", JSON.stringify(data)).catch(() => {});
      }
    } catch (error: any) {
      console.error("Error get tanaman:", error);
      if (tanamanListRef.current.length === 0) {
        setIsError(true);
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      // Baca cache instan 0ms kalau habis nyiram/edit/hapus dari DetailTanamanModal
      AsyncStorage.getItem("dashboard_tanaman")
        .then((cached) => {
          if (cached) {
            const parsed: TanamanDetail[] = JSON.parse(cached);
            setTanamanList(parsed);
            tanamanListRef.current = parsed;
            setIsLoading(false);
          }
        })
        .catch(() => {});

      fetchTanaman(false);
    }, [fetchTanaman])
  );

  const handleTambahTanaman = async () => {
    setIsSubmitting(true);
    try {
      const response = await api.post("/tanaman", {
        jenisTanaman: selectedTanaman,
        nickname: nickname || undefined });
      if (response.data?.status === "success") {
        const newTanaman = response.data.data;
        showNotification(
          "Berhasil!",
          response.data.message || "Tanaman berhasil ditambahkan ke kebun kamu!",
          "success"
        );
        setModalVisible(false);
        setNickname("");
        
        // Instant state & cache prepend: tidak perlu nunggu GET /tanaman ulang
        if (newTanaman) {
          const updated = [newTanaman, ...tanamanListRef.current];
          setTanamanList(updated);
          tanamanListRef.current = updated;
          AsyncStorage.setItem("dashboard_tanaman", JSON.stringify(updated)).catch(() => {});
        } else {
          fetchTanaman();
        }
      }
    } catch (error: any) {
      console.error("Error tambah tanaman:", error);
      showNotification(
        "Gagal Menambahkan",
        error.response?.data?.message || "Terjadi kesalahan saat menambahkan tanaman, silakan coba lagi.",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };



  const filteredList = tanamanList.filter((tanaman) => {
    const sudahValidasiHariIni = (tanaman.logTerakhir && new Date(tanaman.logTerakhir.createdAt).toDateString() === new Date().toDateString()) || tanaman.statusPenyiraman === "SUDAH_DISIRAM";
    
    if (activeFilter === "Perlu Disiram")
      return tanaman.statusPenyiraman !== "DITUNDA_HUJAN" && !sudahValidasiHariIni;
    if (activeFilter === "Sudah Disiram")
      return sudahValidasiHariIni;
    
    return true;
  });

  const renderHeader = () => (
    <>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tanaman Kamu</Text>
      </View>
      <View style={styles.filterSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterScrollContent}
        >
          {filters.map((filter) => (
            <Pressable
              key={filter}
              style={({ pressed }) => [
                styles.filterChip,
                activeFilter === filter ? styles.filterChipActive : styles.filterChipInactive,
                pressed && { opacity: 0.8 },
              ]}
              onPress={() => setActiveFilter(filter)}
            >
              <Text style={[
                  styles.filterChipText,
                  activeFilter === filter ? styles.filterChipTextActive : styles.filterChipTextInactive,
                ]}
              >
                {filter}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    </>
  );

  const renderItem = ({ item: tanaman }: { item: TanamanDetail }) => {
    let bgColor = "#E8F5E9";
    let borderColor = "#3FA86B";
    let textColor = "#1B5E20";
    let statusText = "Aman";
    let iconName: keyof typeof MaterialIcons.glyphMap = "check-circle";
    
    if ((tanaman.sisaHariPanen ?? 999) <= 0) {
      bgColor = "#FFF9E6";
      borderColor = "#FFB627";
      textColor = "#B45309";
      statusText = "Siap Panen";
      iconName = "event-available";
    } else if (tanaman.statusPenyiraman === "PERLU_SIRAM") {
      bgColor = "#FFECEB";
      borderColor = "#FF6B5C";
      textColor = "#D32F2F";
      statusText = "Perlu Disiram";
      iconName = "water-drop";
    } else if (tanaman.statusPenyiraman === "DITUNDA_HUJAN") {
      bgColor = "#FFF9E6";
      borderColor = "#FFB627";
      textColor = "#B45309";
      statusText = "Ditunda Hujan";
      iconName = "cloud";
    } else if (tanaman.statusPenyiraman === "SUDAH_DISIRAM") {
      bgColor = "#E8F5E9";
      borderColor = "#3FA86B";
      textColor = "#1B5E20";
      statusText = "Sudah Disiram";
      iconName = "check-circle";
    }
    
    const sudahValidasiHariIni = (tanaman.logTerakhir && new Date(tanaman.logTerakhir.createdAt).toDateString() === new Date().toDateString()) || tanaman.statusPenyiraman === "SUDAH_DISIRAM";
    if (sudahValidasiHariIni && (tanaman.sisaHariPanen ?? 999) > 0) {
      bgColor = "#E8F5E9";
      borderColor = "#3FA86B";
      textColor = "#1B5E20";
      statusText = "Sudah Disiram";
      iconName = "check-circle";
    }

    return (
      <Pressable
        style={({ pressed }) => [
          styles.card,
          pressed && styles.pressedShadow4,
        ]}
        onPress={() => router.push({ pathname: "/detail-tanaman", params: { id: tanaman.id } })}
      >
        <View style={[styles.imageContainer, { overflow: 'hidden' }]}>
          {tanaman.logTerakhir?.fotoUrl ? (
            <Image 
              source={{ uri: tanaman.logTerakhir.fotoUrl }} 
              placeholder={getPlantImage(tanaman.jenisTanaman)}
              style={{ width: '100%', height: '100%' }} 
              contentFit="cover"
              transition={200}
            />
          ) : (
            <Image 
              source={getPlantImage(tanaman.jenisTanaman)} 
              style={{ width: '100%', height: '100%' }} 
              contentFit="cover"
              transition={200}
            />
          )}
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {tanaman.nickname || tanaman.jenisTanaman}
          </Text>
          <Text style={styles.cardSubtitle}>Skor {tanaman.predictiveScore ?? 0} • Panen {tanaman.sisaHariPanen ?? 0} hari</Text>
          <View style={styles.cardFooter}>
            <View style={[styles.badge, { backgroundColor: bgColor, borderColor: borderColor, flexDirection: 'row', alignItems: 'center' }]}>
              <MaterialIcons name={iconName} size={11} color={textColor} style={{ marginRight: 3 }} />
              <Text style={[styles.badgeText, { color: textColor }]}>
                {statusText}
              </Text>
            </View>
          </View>
        </View>
      </Pressable>
    );
  };

  const renderEmpty = () => {
    if (isLoading) return <PlantGridSkeleton />;
    if (isError) return <ErrorState onRetry={() => fetchTanaman(true)} />;
    return (
      <View style={styles.emptyState}>
        <MaterialIcons name="eco" size={64} color="#bdcabd" />
        <Text style={styles.emptyText}>Belum ada tanaman.</Text>
        <Text style={styles.emptySubText}>
          Tekan + untuk menanam sekarang!
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <FlatList
          data={isLoading || isError ? [] : filteredList}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          numColumns={2}
          columnWrapperStyle={styles.gridContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl
              colors={["#3FA86B"]}
              refreshing={isRefreshing}
              onRefresh={() => fetchTanaman(true)}
            />
          }
        />
              </View>
        
      {/* FAB */}
      <Pressable
        style={({ pressed }) => [
          styles.fab,
          pressed && styles.fabPressed,
        ]}
        onPress={() => {
          setModalVisible(true);
        }}
        accessibilityLabel="Tanam Baru"
      >
        <MaterialIcons name="add" size={32} color="#FFFFFF" />
      </Pressable>

      <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Tanam Baru</Text>
                <Pressable onPress={() => setModalVisible(false)}>
                  <MaterialIcons name="close" size={24} color="#123924" />
                </Pressable>
              </View>
              <Text style={styles.modalLabel}>Nama Panggilan (Opsional)</Text>
              <TextInput 
                style={styles.textInput}
                placeholder="Misal: Tomat Si Jago"
                value={nickname}
                onChangeText={setNickname}
                placeholderTextColor="#a09d91"
              />
              <Text style={styles.modalLabel}>Pilih Jenis Tanaman</Text>
              <ScrollView style={styles.pickerContainer}>
                {JENIS_TANAMAN_ENUM.map((jenis) => (
                  <Pressable
                    key={jenis}
                    style={({ pressed }) => [
                      styles.pickerItem,
                      selectedTanaman === jenis && styles.pickerItemActive,
                      pressed && { opacity: 0.75 },
                    ]}
                    onPress={() => setSelectedTanaman(jenis)}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                      <Image
                        source={getPlantImage(jenis)}
                        style={{ width: 28, height: 28, borderRadius: 14 }}
                        contentFit="cover"
                      />
                      <Text
                        style={[
                          styles.pickerItemText,
                          selectedTanaman === jenis &&
                            styles.pickerItemTextActive,
                        ]}
                      >
                        {jenis}
                      </Text>
                    </View>
                    {selectedTanaman === jenis && (
                      <MaterialIcons
                        name="check-circle"
                        size={20}
                        color="#FFFFFF"
                      />
                    )}
                  </Pressable>
                ))}
              </ScrollView>
              <Pressable
                style={({ pressed }) => [
                  styles.submitButton,
                  pressed && !isSubmitting && styles.pressedShadow4,
                ]}
                onPress={handleTambahTanaman}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitButtonText}>Tanam Sekarang!</Text>
                )}
              </Pressable>
            </View>
          </View>
        </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FBF8F0" },
  container: {
    flex: 1,
    position: "relative" },
  scrollContent: {
    paddingBottom: 140,
    paddingHorizontal: 20,
    paddingTop: 24 },

  // State tertekan Neobrutalism
  pressedShadow4: {
    shadowColor: "#123924", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
    
    
    transform: [{ scale: 0.98 }] },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24 },
  headerTitle: {
    fontSize: 22,
    fontFamily: "Nunito_800ExtraBold",
    color: "#1F5C3D" },
  filterSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24 },
  filterScroll: {
    flex: 1 },
  filterScrollContent: {
    gap: 8 },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 24,
    borderWidth: 0 },
  filterChipActive: {
    backgroundColor: "#3FA86B" },
  filterChipInactive: {
    backgroundColor: "#FFFFFF" },
  filterChipText: {
    fontSize: 12,
    fontFamily: "Nunito_700Bold" },
  filterChipTextActive: {
    color: "#FFFFFF" },
  filterChipTextInactive: {
    color: "#3e4a40" },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12 },
  card: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    borderWidth: 0,
    
    overflow: "hidden",
    marginBottom: 8,
    shadowColor: "#123924", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 14, elevation: 4 },
  imageContainer: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: "#F1F8F5" },
  cardBody: {
    padding: 12,
    flex: 1 },
  cardTitle: {
    fontSize: 14,
    fontFamily: "Nunito_700Bold",
    color: "#123924",
    marginBottom: 4 },
  cardSubtitle: {
    fontFamily: "Nunito_500Medium",
    fontSize: 11,
    color: "#5C5A4F",
    marginBottom: 12 },
  cardFooter: {
    marginTop: "auto",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between" },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 100,
    borderWidth: 0 },
  badgeText: {
    fontSize: 9,
    fontFamily: "Nunito_700Bold" },
  fab: {
    position: "absolute",
    bottom: 120,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#3FA86B",
    borderWidth: 0,
    
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#123924", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 14, elevation: 4,
    zIndex: 50 },
  fabPressed: {
    transform: [{ scale: 0.94 }],
    opacity: 0.9,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60 },
  emptyText: {
    fontSize: 16,
    fontFamily: "Nunito_700Bold",
    color: "#123924",
    marginTop: 16,
    marginBottom: 4 },
  emptySubText: {
    fontFamily: "Nunito_500Medium",
    fontSize: 14,
    color: "#5C5A4F" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(18, 57, 36, 0.5)",
    justifyContent: "flex-end" },
  modalContent: {
    backgroundColor: "#FBF8F0",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 0,
    
    borderBottomWidth: 0,
    padding: 24,
    maxHeight: "80%" },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20 },
  modalTitle: {
    fontSize: 20,
    fontFamily: "Nunito_800ExtraBold",
    color: "#123924" },
  textInput: {
    backgroundColor: "#FFFFFF",
    borderWidth: 0,
    
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: "Nunito_700Bold",
    color: "#123924",
    marginBottom: 20 },
  modalLabel: {
    fontSize: 14,
    fontFamily: "Nunito_700Bold",
    color: "#5C5A4F",
    marginBottom: 12 },
  pickerContainer: {
    maxHeight: 250,
    marginBottom: 24,
    borderWidth: 0,
    
    borderRadius: 30,
    backgroundColor: "#FFFFFF",
    padding: 8 },
  pickerItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 8,
    marginBottom: 4 },
  pickerItemActive: {
    backgroundColor: "#3FA86B" },
  pickerItemText: {
    fontSize: 14,
    fontFamily: "Nunito_700Bold",
    color: "#123924" },
  pickerItemTextActive: {
    color: "#FFFFFF" },
  submitButton: {
    backgroundColor: "#1F5C3D",
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 0,
    
    shadowColor: "#123924", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 14, elevation: 4 },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Nunito_700Bold" } });