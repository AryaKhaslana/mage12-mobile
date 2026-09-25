import { MaterialIcons } from "@expo/vector-icons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState , useRef } from "react";
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
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import ErrorState from "../../components/ErrorState";
import { useNotification } from "../../components/NotificationContext";
import api, { TanamanDetail } from "../../services/api";



const FALLBACK_THUMB = "https://lh3.googleusercontent.com/aida-public/AB6AXuAK72N9bfUnTDR_qxCQtZfhdGFtdZeRDYs-OsNC2lUxmLLI86pKo2ugpOTvGWWwZL9sOkbzXCmRvMwHqent34F7rwvgUHge8_BFG9hN7iYc902WRQsddbBhE_9RiOVhij3iicG_BjbjGLfbqAgjgG9U9a64_nAsnjBQH2_AoUiMWgVBpRNDZeugVxjpYWAoqgIcNd6whl3ktEPbbtfIzxtMOHeRnbZXGuogESuoFy2lwMymfV81rGAUhA";

const JENIS_TANAMAN_ENUM = [
  "Padi",
  "Jagung",
  "Singkong",
  "Ubi Jalar",
  "Kedelai",
  "Kacang Tanah",
  "Tomat",
  "Cabai Merah",
  "Cabai Rawit",
  "Bawang Merah",
  "Bawang Putih",
  "Kubis",
  "Kangkung",
  "Bayam",
  "Terong",
  "Timun",
  "Labu Siam",
  "Wortel",
  "Kentang",
  "Pisang",
];

const PlantGridSkeleton = () => {
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

const FadeInSlideUp = ({ children, delay = 0, style }: any) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, delay, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, delay, useNativeDriver: true })
    ]).start();
  }, [fadeAnim, slideAnim]);
  return (
    <Animated.View style={[style, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      {children}
    </Animated.View>
  );
};

const BouncingFAB = ({ onPress, style, children }: any) => {
  const bounceAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, { toValue: -8, duration: 1500, useNativeDriver: true }),
        Animated.timing(bounceAnim, { toValue: 0, duration: 1500, useNativeDriver: true })
      ])
    ).start();
  }, []);
  return (
    <Animated.View style={[style, { transform: [{ translateY: bounceAnim }] }]}>
      <Pressable onPress={onPress} style={({ pressed }) => [
        { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', borderRadius: 100 },
        pressed && { opacity: 0.8 }
      ]}>
        {children}
      </Pressable>
    </Animated.View>
  );
};

export default function TanamanScreen() {
  const { showNotification } = useNotification();
  const [activeFilter, setActiveFilter] = useState("Semua");
  const filters = ["Semua", "Perlu Disiram"];
  const [tanamanList, setTanamanList] = useState<TanamanDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTanaman, setSelectedTanaman] = useState(JENIS_TANAMAN_ENUM[0]);
  const [nickname, setNickname] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (params.openModal === 'true') {
      setModalVisible(true);
      router.setParams({ openModal: '' });
    }
  }, [params.openModal]);

  const fetchTanaman = async (isManualRefresh = false) => {
    if (tanamanList.length === 0) {
      setIsLoading(true);
      setIsError(false);
    } else if (isManualRefresh) {
      setIsRefreshing(true);
    }
    // Jika bukan manual refresh dan list sudah ada, fetch berjalan SILENT (tanpa loading indicator apa pun)
    try {
      const response = await api.get("/tanaman");
      if (response.data?.status === "success") {
        setTanamanList(response.data.data);
      }
    } catch (error: any) {
      console.error("Error get tanaman:", error);
      if (tanamanList.length === 0) {
        setIsError(true);
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchTanaman();
    }, [])
  );

  const handleTambahTanaman = async () => {
    setIsSubmitting(true);
    try {
      const response = await api.post("/tanaman", {
        jenisTanaman: selectedTanaman,
        nickname: nickname || undefined });
      if (response.data?.status === "success") {
        showNotification(
          "Sukses",
          response.data.message || "Tanaman berhasil ditambahkan!",
          "success"
        );
        setModalVisible(false);
        fetchTanaman();
      }
    } catch (error: any) {
      console.error("Error tambah tanaman:", error);
      showNotification(
        "Gagal",
        error.response?.data?.message || "Terjadi kesalahan.",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };



  const filteredList = tanamanList.filter((tanaman) => {
    if (activeFilter === "Perlu Disiram")
      return tanaman.statusPenyiraman === "PERLU_SIRAM";
    return true;
  });

  const renderHeader = () => (
    <>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tanaman Kamu</Text>
      </View>
      <FadeInSlideUp delay={0}>
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
      </FadeInSlideUp>
    </>
  );

  const renderItem = ({ item: tanaman }: { item: TanamanDetail }) => {
    const hariKe = Math.floor((Date.now() - new Date(tanaman.tanggalTanam).getTime()) / 86400000) + 1;
    let bgColor = "#E8F5E9";
    let borderColor = "#3FA86B";
    let textColor = "#123924";
    let statusText = "Aman";
    
    if ((tanaman.sisaHariPanen ?? 999) <= 0) {
      bgColor = "#FFF9E6";
      borderColor = "#FFB627";
      textColor = "#FFB627";
      statusText = "Siap Panen 🌾";
    } else if (tanaman.statusPenyiraman === "PERLU_SIRAM") {
      bgColor = "#FFECEB";
      borderColor = "#FF6B5C";
      textColor = "#FF6B5C";
      statusText = "Perlu Disiram";
    } else if (tanaman.statusPenyiraman === "DITUNDA_HUJAN") {
      bgColor = "#FFF9E6";
      borderColor = "#FFB627";
      textColor = "#FFB627";
      statusText = "Ditunda Hujan";
    } else if (tanaman.statusPenyiraman === "SUDAH_DISIRAM") {
      statusText = "Sudah Disiram";
    }
    
    const sudahValidasiHariIni = tanaman.logTerakhir && new Date(tanaman.logTerakhir.createdAt).toDateString() === new Date().toDateString();
    if (sudahValidasiHariIni && (tanaman.sisaHariPanen ?? 999) > 0) {
      bgColor = "#E8F5E9";
      borderColor = "#3FA86B";
      textColor = "#123924";
      statusText = "Sudah Disiram Hari Ini 💧";
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
          <Image 
            source={{ uri: tanaman.logTerakhir?.fotoUrl || FALLBACK_THUMB }} 
            style={{ width: '100%', height: '100%' }} 
            contentFit="cover"
            transition={200}
          />
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {tanaman.nickname || tanaman.jenisTanaman}
          </Text>
          <Text style={styles.cardSubtitle}>Skor: {tanaman.predictiveScore} • Panen: {tanaman.sisaHariPanen}hr</Text>
          <View style={styles.cardFooter}>
            <View style={[styles.badge, { backgroundColor: bgColor, borderColor: borderColor }]}>
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
                    <Text
                      style={[
                        styles.pickerItemText,
                        selectedTanaman === jenis &&
                          styles.pickerItemTextActive,
                      ]}
                    >
                      {jenis}
                    </Text>
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
    backgroundColor: "#b1f1c8" },
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