import { MaterialIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Modal,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import api from "../../services/api";

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

export default function TanamanScreen() {
  const [activeFilter, setActiveFilter] = useState("Semua");
  const filters = ["Semua", "Perlu Disiram"];

  const [tanamanList, setTanamanList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTanaman, setSelectedTanaman] = useState(JENIS_TANAMAN_ENUM[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTanaman = async () => {
    if (tanamanList.length === 0) setIsLoading(true);
    else setIsRefreshing(true);

    try {
      const response = await api.get("/tanaman");
      if (response.data?.status === "success") {
        setTanamanList(response.data.data);
      }
    } catch (error: any) {
      console.error("Error get tanaman:", error);
      Alert.alert(
        "Gagal",
        error.response?.data?.message || "Tidak dapat memuat daftar tanaman",
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTanaman();
  }, []);

  const handleTambahTanaman = async () => {
    setIsSubmitting(true);
    try {
      // CONTRACT: body (JSON): { jenisTanaman: string }
      const response = await api.post("/tanaman", {
        jenisTanaman: selectedTanaman,
      });
      if (response.data?.status === "success") {
        Alert.alert(
          "Sukses",
          response.data.message || "Tanaman berhasil ditambahkan!",
        );
        setModalVisible(false);
        fetchTanaman();
      }
    } catch (error: any) {
      console.error("Error tambah tanaman:", error);
      Alert.alert(
        "Gagal",
        error.response?.data?.message || "Terjadi kesalahan.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSiram = async (tanamanId: number) => {
    try {
      // CONTRACT: POST /logs { tanamanId, tipeValidasi: "button_only" }
      const response = await api.post("/logs", {
        tanamanId,
        tipeValidasi: "button_only",
      });
      if (response.data?.status === "success") {
        const { skorSaatIni, streak } = response.data.data;
        Alert.alert(
          "Sukses Menyiram!",
          `+${skorSaatIni} poin! Streak: ${streak} hari 🔥`,
        );
        fetchTanaman();
      }
    } catch (error: any) {
      console.error("Error nyiram:", error);
      Alert.alert(
        "Gagal Menyiram",
        error.response?.data?.message || "Terjadi kesalahan.",
      );
    }
  };

  const filteredList = tanamanList.filter((tanaman) => {
    if (activeFilter === "Perlu Disiram")
      return tanaman.statusPenyiraman === "PERLU_SIRAM";
    return true;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              colors={["#3FA86B"]}
              refreshing={isRefreshing}
              onRefresh={fetchTanaman}
            />
          }
        >
          {/* HEADER */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Tanaman Kamu</Text>
            {/* Phantom UI removed */}
          </View>

          {/* FILTERS */}
          <View style={styles.filterSection}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.filterScroll}
              contentContainerStyle={styles.filterScrollContent}
            >
              {filters.map((filter) => (
                <TouchableOpacity
                  key={filter}
                  style={[
                    styles.filterChip,
                    activeFilter === filter
                      ? styles.filterChipActive
                      : styles.filterChipInactive,
                  ]}
                  onPress={() => setActiveFilter(filter)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      activeFilter === filter
                        ? styles.filterChipTextActive
                        : styles.filterChipTextInactive,
                    ]}
                  >
                    {filter}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            {/* Phantom UI (grid toggle) removed */}
          </View>

          {/* PLANT GRID */}
          {isLoading ? (
            <ActivityIndicator
              size="large"
              color="#3FA86B"
              style={{ marginTop: 50 }}
            />
          ) : filteredList.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="eco" size={64} color="#bdcabd" />
              <Text style={styles.emptyText}>Belum ada tanaman.</Text>
              <Text style={styles.emptySubText}>
                Tekan + untuk menanam sekarang!
              </Text>
            </View>
          ) : (
            <View style={styles.gridContainer}>
              {filteredList.map((tanaman) => {
                const hariKe =
                  Math.floor(
                    (Date.now() - new Date(tanaman.tanggalTanam).getTime()) /
                      86400000,
                  ) + 1;
                const isPerluSiram = tanaman.statusPenyiraman === "PERLU_SIRAM";

                return (
                  <View key={tanaman.id} style={styles.card}>
                    <View
                      style={[
                        styles.imageContainer,
                        { alignItems: "center", justifyContent: "center" },
                      ]}
                    >
                      <MaterialIcons
                        name="local-florist"
                        size={40}
                        color="#123924"
                      />
                    </View>
                    <View style={styles.cardBody}>
                      <Text style={styles.cardTitle} numberOfLines={1}>
                        {tanaman.jenisTanaman}
                      </Text>
                      <Text style={styles.cardSubtitle}>Hari ke-{hariKe}</Text>

                      <View style={styles.cardFooter}>
                        <View
                          style={[
                            styles.badge,
                            {
                              backgroundColor: isPerluSiram
                                ? "#FF6B5C"
                                : "#3FA86B",
                            },
                          ]}
                        >
                          <Text
                            style={[styles.badgeText, { color: "#FFFFFF" }]}
                          >
                            {isPerluSiram ? "Perlu Disiram" : "Aman"}
                          </Text>
                        </View>

                        {isPerluSiram && (
                          <TouchableOpacity
                            style={styles.waterButton}
                            onPress={() => handleSiram(tanaman.id)}
                          >
                            <MaterialIcons
                              name="water-drop"
                              size={20}
                              color="#FFFFFF"
                            />
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>

        {/* FAB (Floating Action Button) */}
        <TouchableOpacity
          style={styles.fab}
          activeOpacity={0.9}
          onPress={() => setModalVisible(true)}
        >
          <MaterialIcons name="add" size={32} color="#FFFFFF" />
        </TouchableOpacity>

        {/* MODAL TAMBAH TANAMAN */}
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
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <MaterialIcons name="close" size={24} color="#123924" />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalLabel}>Pilih Jenis Tanaman</Text>
              <ScrollView style={styles.pickerContainer}>
                {JENIS_TANAMAN_ENUM.map((jenis) => (
                  <TouchableOpacity
                    key={jenis}
                    style={[
                      styles.pickerItem,
                      selectedTanaman === jenis && styles.pickerItemActive,
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
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleTambahTanaman}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitButtonText}>Tanam Sekarang!</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FBF8F0",
  },
  container: {
    flex: 1,
    position: "relative",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 100, // Memberi ruang biar kartu bawah nggak ketutup FAB
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1F5C3D",
  },
  filterSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  filterScroll: {
    flex: 1,
  },
  filterScrollContent: {
    gap: 8,
    paddingBottom: 4,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#123924",
  },
  filterChipActive: {
    backgroundColor: "#3FA86B",
  },
  filterChipInactive: {
    backgroundColor: "#FFFFFF",
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: "700",
  },
  filterChipTextActive: {
    color: "#FFFFFF",
  },
  filterChipTextInactive: {
    color: "#3e4a40",
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12, // Gap didukung di React Native versi baru (Expo)
  },
  card: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#123924",
    overflow: "hidden",
    marginBottom: 8,
    shadowColor: "#123924",
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
  },
  imageContainer: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: "#b1f1c8",
  },
  cardBody: {
    padding: 12,
    flex: 1,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#123924",
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 11,
    color: "#5C5A4F",
    marginBottom: 12,
  },
  cardFooter: {
    marginTop: "auto",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: "#123924",
  },
  badgeText: {
    fontSize: 9,
    fontWeight: "700",
  },
  waterButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FF6B5C",
    borderWidth: 1,
    borderColor: "#123924",
    alignItems: "center",
    justifyContent: "center",
  },
  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#3FA86B",
    borderWidth: 2,
    borderColor: "#123924",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#123924",
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
    zIndex: 50,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#123924",
    marginTop: 16,
    marginBottom: 4,
  },
  emptySubText: {
    fontSize: 14,
    color: "#5C5A4F",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(18, 57, 36, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FBF8F0",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 2,
    borderColor: "#123924",
    borderBottomWidth: 0,
    padding: 24,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#123924",
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#5C5A4F",
    marginBottom: 12,
  },
  pickerContainer: {
    maxHeight: 250,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: "#123924",
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    padding: 8,
  },
  pickerItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  pickerItemActive: {
    backgroundColor: "#3FA86B",
  },
  pickerItemText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#123924",
  },
  pickerItemTextActive: {
    color: "#FFFFFF",
  },
  submitButton: {
    backgroundColor: "#1F5C3D",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#123924",
    shadowColor: "#123924",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
