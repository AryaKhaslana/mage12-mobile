import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import api from "../../services/api";

import { useNotification } from "../../components/NotificationContext";

export default function DashboardScreen() {
  const [userData, setUserData] = useState<any>(null);
  const [tanamanList, setTanamanList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { showNotification } = useNotification();

  useEffect(() => {
    const checkAuthAndFetch = async () => {
      const token = await SecureStore.getItemAsync("userToken");
      if (!token) {
        router.replace("/(auth)/login");
        return;
      }
      fetchDashboardData();
    };
    checkAuthAndFetch();
  }, []);

  const fetchDashboardData = async () => {
    if (tanamanList.length === 0 && !userData) {
      setIsLoading(true);
    } else {
      setIsRefreshing(true);
    }
    try {
      const [meRes, tanamanRes] = await Promise.all([
        api.get("/user/me").catch((err) => {
          console.log("Endpoint /user/me belum siap (404).");
          return null;
        }),
        api.get("/tanaman").catch((err) => {
          console.error("Gagal get tanaman:", err);
          return null;
        }),
      ]);
      if (meRes?.data?.data) {
        setUserData(meRes.data.data);
      }
      if (tanamanRes?.data?.data) {
        setTanamanList(tanamanRes.data.data);
      }
    } catch (error: any) {
      console.error("Error fetching dashboard data:", error);
      showNotification(
        "Gagal Memuat Data",
        error.response?.data?.message ||
          "Terjadi kesalahan koneksi saat memuat dashboard.",
        "error"
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleLogAktivitas = async (tanamanId: number) => {
    try {
      const response = await api.post("/logs", {
        tanamanId,
        tipeValidasi: "button_only",
      });
      if (response.data?.status === "success") {
        showNotification(
          "Mantap!",
          `+${response.data.data.skorSaatIni} poin! Streak: ${response.data.data.streak} hari 🔥`,
          "success"
        );
        fetchDashboardData();
      }
    } catch (error: any) {
      console.error("Error logging activity:", error);
      showNotification(
        "Gagal Mencatat",
        error.response?.data?.message || "Terjadi kesalahan.",
        "error"
      );
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView
        style={[
          styles.safeArea,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color="#3FA86B" />
      </SafeAreaView>
    );
  }

  const reminders = [...tanamanList]
    .filter((t) => t.statusPenyiraman === "PERLU_SIRAM" || t.sisaHariPanen <= 7)
    .sort((a, b) => {
      if (
        a.statusPenyiraman === "PERLU_SIRAM" &&
        b.statusPenyiraman !== "PERLU_SIRAM"
      )
        return -1;
      if (
        a.statusPenyiraman !== "PERLU_SIRAM" &&
        b.statusPenyiraman === "PERLU_SIRAM"
      )
        return 1;
      return a.sisaHariPanen - b.sisaHariPanen;
    });

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <MaterialIcons name="person" size={24} color="#5C5A4F" />
          </View>
          <View>
            <Text style={styles.greeting}>
              Halo, {userData?.nama || "Petani"}
            </Text>
            <Text style={styles.subtitle}>Yuk cek tanamanmu hari ini</Text>
          </View>
        </View>

        {/* Logout Button dengan efek tekan */}
        <Pressable
          style={({ pressed }) => [
            styles.logoutButton,
            pressed && styles.pressedShadow4,
          ]}
          onPress={async () => {
            await SecureStore.deleteItemAsync("userToken");
            await SecureStore.deleteItemAsync("userData");
            await AsyncStorage.removeItem("hasSeenOnboarding");
            router.replace("/");
          }}
        >
          <MaterialIcons name="logout" size={24} color="#FF6B5C" />
        </Pressable>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            colors={["#3FA86B"]}
            refreshing={isRefreshing}
            onRefresh={fetchDashboardData}
          />
        }
      >
        {/* STREAK HERO CARD */}
        <Pressable
          style={({ pressed }) => [
            styles.heroCard,
            pressed && styles.pressedShadow4,
          ]}
        >
          <View style={styles.fireIconContainer}>
            <MaterialIcons
              name="local-fire-department"
              size={28}
              color="#FFFFFF"
            />
          </View>
          <View style={styles.heroTextContainer}>
            <Text style={styles.heroTitle}>
              {userData?.streak || 0} hari streak!
            </Text>
            <Text style={styles.heroSubtitle}>
              Kamu lagi on fire, jangan putus ya
            </Text>
          </View>
          <MaterialIcons
            name="chevron-right"
            size={28}
            color="rgba(255,255,255,0.8)"
          />
        </Pressable>

        {/* REMINDER LIST */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hari ini</Text>
          {reminders.length === 0 ? (
            <Text style={{ color: "#5C5A4F" }}>
              Mantap! Tidak ada pengingat mendesak hari ini.
            </Text>
          ) : (
            reminders.map((tanaman) => (
              <Pressable
                key={tanaman.id}
                style={({ pressed }) => [
                  styles.taskCard,
                  pressed && styles.pressedShadow4,
                  pressed && { opacity: 0.8, backgroundColor: "#F2F5F3" }
                ]}
                onPress={() => {
                  if (tanaman.statusPenyiraman === "PERLU_SIRAM") {
                    handleLogAktivitas(tanaman.id);
                  }
                }}
              >
                <View
                  style={[
                    styles.taskIconBox,
                    {
                      backgroundColor:
                        tanaman.statusPenyiraman === "PERLU_SIRAM"
                          ? "#FF6B5C"
                          : "#FFB627",
                    },
                  ]}
                >
                  <MaterialIcons
                    name={
                      tanaman.statusPenyiraman === "PERLU_SIRAM"
                        ? "water-drop"
                        : "eco"
                    }
                    size={24}
                    color={
                      tanaman.statusPenyiraman === "PERLU_SIRAM"
                        ? "#FFFFFF"
                        : "#123924"
                    }
                  />
                </View>
                <View style={styles.taskInfo}>
                  <Text style={styles.taskName}>{tanaman.jenisTanaman}</Text>
                  <Text
                    style={[
                      styles.taskStatus,
                      {
                        color:
                          tanaman.statusPenyiraman === "PERLU_SIRAM"
                            ? "#FF6B5C"
                            : "#5C5A4F",
                      },
                    ]}
                  >
                    {tanaman.statusPenyiraman === "PERLU_SIRAM"
                      ? "Perlu disiram sekarang"
                      : `Masa panen tinggal ${tanaman.sisaHariPanen} hari lagi!`}
                  </Text>
                </View>
                <View
                  style={[
                    styles.checkbox,
                    tanaman.statusPenyiraman !== "PERLU_SIRAM" &&
                      styles.checkboxDoneAmber,
                  ]}
                >
                  {tanaman.statusPenyiraman !== "PERLU_SIRAM" && (
                    <MaterialIcons name="check" size={16} color="#FFFFFF" />
                  )}
                </View>
              </Pressable>
            ))
          )}
        </View>

        {/* YOUR PLANTS SECTION */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Tanaman kamu</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
          >
            {tanamanList.length === 0 ? (
              <Text style={{ color: "#5C5A4F" }}>
                Belum ada tanaman. Yuk tambah!
              </Text>
            ) : (
              tanamanList.map((tanaman) => (
                <Pressable
                  key={tanaman.id}
                  style={({ pressed }) => [
                    styles.plantCard,
                    pressed && styles.pressedShadow4,
                  ]}
                  onPress={() => router.push("/detail-tanaman")}
                >
                  <View
                    style={[
                      styles.plantImagePlaceholder,
                      { alignItems: "center", justifyContent: "center" },
                    ]}
                  >
                    <MaterialIcons
                      color="#123924"
                      name="local-florist"
                      size={40}
                    />
                  </View>
                  <View style={styles.plantCardBody}>
                    <Text style={styles.plantName} numberOfLines={1}>
                      {tanaman.jenisTanaman}
                    </Text>
                    <View
                      style={[
                        styles.badge,
                        {
                          backgroundColor:
                            tanaman.statusPenyiraman === "PERLU_SIRAM"
                              ? "#FFB627"
                              : "#3FA86B",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.badgeText,
                          {
                            color:
                              tanaman.statusPenyiraman === "PERLU_SIRAM"
                                ? "#123924"
                                : "#FFFFFF",
                          },
                        ]}
                      >
                        {tanaman.sisaHariPanen} hari lagi
                      </Text>
                    </View>
                  </View>
                </Pressable>
              ))
            )}
          </ScrollView>
        </View>
      </ScrollView>

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
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 16,
  },

  // Style animasi neobrutalism saat ditekan
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FBF8F0",
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#123924",
    alignItems: "center",
    justifyContent: "center",
  },
  greeting: {
    fontSize: 20,
    fontFamily: "Nunito_800ExtraBold",
    color: "#00522c",
  },
  subtitle: {
    fontSize: 12,
    color: "#5C5A4F",
    fontFamily: "Nunito_500Medium",
  },
  logoutButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#123924",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "4px 4px 0px #123924",
  },
  heroCard: {
    backgroundColor: "#1F5C3D",
    borderRadius: 28,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 32,
    boxShadow: "4px 4px 0px #123924",
  },
  fireIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFB627",
    alignItems: "center",
    justifyContent: "center",
  },
  heroTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  heroTitle: {
    fontSize: 18,
    fontFamily: "Nunito_800ExtraBold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  heroSubtitle: {
    fontFamily: "Nunito_500Medium",
    fontSize: 12,
    color: "rgba(255,255,255,0.75)",
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Nunito_700Bold",
    color: "#00522c",
    marginBottom: 16,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  taskCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#123924",
    borderRadius: 24,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    boxShadow: "4px 4px 0px #123924",
  },
  taskIconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#123924",
    alignItems: "center",
    justifyContent: "center",
  },
  taskInfo: {
    flex: 1,
    marginLeft: 12,
  },
  taskName: {
    fontSize: 13,
    fontFamily: "Nunito_700Bold",
    color: "#123924",
    marginBottom: 4,
  },
  taskStatus: {
    fontFamily: "Nunito_500Medium",
    fontSize: 11,
    color: "#5C5A4F",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#123924",
    backgroundColor: "#FFFFFF",
    marginRight: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxDoneCoral: {
    backgroundColor: "#FF6B5C",
  },
  checkboxDoneAmber: {
    backgroundColor: "#FFB627",
  },
  horizontalScroll: {
    gap: 16,
    paddingBottom: 8,
  },
  plantCard: {
    width: 140,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#123924",
    borderRadius: 24,
    overflow: "hidden",
    marginRight: 16,
    boxShadow: "4px 4px 0px #123924",
  },
  plantImagePlaceholder: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: "#96d4ad",
  },
  plantCardBody: {
    padding: 12,
  },
  plantName: {
    fontSize: 12,
    fontFamily: "Nunito_700Bold",
    color: "#123924",
    marginBottom: 8,
  },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: "#123924",
  },
  badgeText: {
    fontSize: 10,
    fontFamily: "Nunito_700Bold",
  },
});