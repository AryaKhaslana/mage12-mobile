import { MaterialIcons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { TextInput } from "react-native";
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
  const [nickname, setNickname] = useState("");
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
        nickname: nickname || undefined,
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
                <Pressable
                  key={filter}
                  style={({ pressed }) => [
                    styles.filterChip,
                    activeFilter === filter
                      ? styles.filterChipActive
                      : styles.filterChipInactive,
                    pressed && { opacity: 0.8 },
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
                </Pressable>
              ))}
            </ScrollView>
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
                const hariKe = Math.floor((Date.now() - new Date(tanaman.tanggalTanam).getTime()) / 86400000) + 1;
                let bgColor = "#E8F5E9";
                let borderColor = "#3FA86B";
                let textColor = "#123924";
                let statusText = "Aman";
                
                if (tanaman.statusPenyiraman === "PERLU_SIRAM") {
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

                return (
                  <Pressable
                    key={tanaman.id}
                    style={({ pressed }) => [
                      styles.card,
                      pressed && styles.pressedShadow4,
                    ]}
                    onPress={() => router.push({ pathname: "/detail-tanaman", params: { id: tanaman.id } })}
                  >
                    <View
                      style={[
                        styles.imageContainer,
                        { alignItems: "center", justifyContent: "center" },
                      ]}
                    >
                      <MaterialIcons name="local-florist" size={48} color="#123924" />
                    </View>
                    <View style={styles.cardBody}>
                      <Text style={styles.cardTitle} numberOfLines={1}>
                        {tanaman.nickname || tanaman.jenisTanaman}
                      </Text>
                      <Text style={styles.cardSubtitle}>Skor: {tanaman.predictiveScore} • Panen: {tanaman.sisaHariPanen}hr</Text>
                      <View style={styles.cardFooter}>
                        <View
                          style={[
                            styles.badge,
                            {
                              backgroundColor: bgColor,
                              borderColor: borderColor,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.badgeText,
                              { color: textColor },
                            ]}
                          >
                            {statusText}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}
        </ScrollView>

        {/* FAB */}
        <Pressable
          style={({ pressed }) => [
            styles.fab,
            pressed && styles.pressedShadow4,
          ]}
          onPress={() => setModalVisible(true)}
        >
          <MaterialIcons name="add" size={32} color="#FFFFFF" />
        </Pressable>

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
    paddingBottom: 100,
  },

  // State tertekan Neobrutalism
  pressedShadow4: {
    boxShadow: "0px 0px 0px #123924",
    shadowOffset: { width: 0, height: 0 },
    elevation: 0,
    transform: [{ translateX: 4 }, { translateY: 4 }],
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: "Nunito_800ExtraBold",
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
    borderRadius: 24,
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
    fontFamily: "Nunito_700Bold",
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
    gap: 12,
  },
  card: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "#123924",
    overflow: "hidden",
    marginBottom: 8,
    boxShadow: "4px 4px 0px #123924",
    shadowColor: "#123924",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
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
    fontFamily: "Nunito_700Bold",
    color: "#123924",
    marginBottom: 4,
  },
  cardSubtitle: {
    fontFamily: "Nunito_500Medium",
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
    fontFamily: "Nunito_700Bold",
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
    boxShadow: "4px 4px 0px #123924",
    shadowColor: "#123924",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
    zIndex: 50,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: "Nunito_700Bold",
    color: "#123924",
    marginTop: 16,
    marginBottom: 4,
  },
  emptySubText: {
    fontFamily: "Nunito_500Medium",
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
    fontFamily: "Nunito_800ExtraBold",
    color: "#123924",
  },
  textInput: {
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#123924",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: "Nunito_700Bold",
    color: "#123924",
    marginBottom: 20,
  },
  modalLabel: {
    fontSize: 14,
    fontFamily: "Nunito_700Bold",
    color: "#5C5A4F",
    marginBottom: 12,
  },
  pickerContainer: {
    maxHeight: 250,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: "#123924",
    borderRadius: 30,
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
    fontFamily: "Nunito_700Bold",
    color: "#123924",
  },
  pickerItemTextActive: {
    color: "#FFFFFF",
  },
  submitButton: {
    backgroundColor: "#1F5C3D",
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#123924",
    boxShadow: "4px 4px 0px #123924",
    shadowColor: "#123924",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Nunito_700Bold",
  },
});