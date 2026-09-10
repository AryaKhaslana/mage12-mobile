import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNotification } from "../../components/NotificationContext";
import api from "../../services/api";

const FALLBACK_THUMB =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAK72N9bfUnTDR_qxCQtZfhdGFtdZeRDYs-OsNC2lUxmLLI86pKo2ugpOTvGWWwZL9sOkbzXCmRvMwHqent34F7rwvgUHge8_BFG9hN7iYc902WRQsddbBhE_9RiOVhij3iicG_BjbjGLfbqAgjgG9U9a64_nAsnjBQH2_AoUiMWgVBpRNDZeugVxjpYWAoqgIcNd6whl3ktEPbbtfIzxtMOHeRnbZXGuogESuoFy2lwMymfV81rGAUhA";

const EmptyHint = ({
  icon,
  title,
  subtitle,
  ctaText,
  onCtaPress,
}: {
  icon: any;
  title: string;
  subtitle: string;
  ctaText?: string;
  onCtaPress?: () => void;
}) => (
  <View
    style={{
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 24,
      paddingHorizontal: 16,
    }}
  >
    <MaterialIcons
      name={icon}
      size={40}
      color="#bdcabd"
      style={{ marginBottom: 12 }}
    />
    <Text
      style={{
        fontSize: 14,
        fontFamily: "Nunito_700Bold",
        color: "#123924",
        textAlign: "center",
        marginBottom: 4,
      }}
    >
      {title}
    </Text>
    <Text
      style={{
        fontSize: 12,
        fontFamily: "Nunito_500Medium",
        color: "#5C5A4F",
        textAlign: "center",
      }}
    >
      {subtitle}
    </Text>
    {ctaText && onCtaPress && (
      <Pressable
        onPress={onCtaPress}
        style={{
          marginTop: 16,
          backgroundColor: "#3FA86B",
          paddingHorizontal: 16,
          paddingVertical: 8,
          borderRadius: 100,
          borderWidth: 2,
          borderColor: "#123924",
        }}
      >
        <Text
          style={{
            color: "#FFFFFF",
            fontSize: 12,
            fontFamily: "Nunito_700Bold",
          }}
        >
          {ctaText}
        </Text>
      </Pressable>
    )}
  </View>
);

export default function DashboardScreen() {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 4 && hour < 10) return "Selamat pagi";
    if (hour >= 10 && hour < 15) return "Selamat siang";
    if (hour >= 15 && hour < 18) return "Selamat sore";
    return "Selamat malam";
  };
  const [userData, setUserData] = useState<any>(null);
  const [tanamanList, setTanamanList] = useState<any[]>([]);
  const [weather, setWeather] = useState<any>(null);
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
      const [meRes, tanamanRes, weatherRes] = await Promise.all([
        api.get("/user/me").catch((err) => {
          console.log("Endpoint /user/me belum siap (404).");
          return null;
        }),
        api.get("/tanaman").catch((err) => {
          console.error("Gagal get tanaman:", err);
          return null;
        }),
        api.get("/weather/today").catch((err) => {
          console.log(
            "Weather fetch failed (normal if location unset):",
            err?.message,
          );
          return null;
        }),
      ]);
      if (meRes?.data?.data) {
        setUserData(meRes.data.data);
      }
      if (tanamanRes?.data?.data) {
        setTanamanList(tanamanRes.data.data);
      }
      if (weatherRes?.data?.data) {
        setWeather(weatherRes.data.data);
      } else {
        setWeather(null);
      }
    } catch (error: any) {
      console.error("Error fetching dashboard data:", error);
      showNotification(
        "Gagal Memuat Data",
        error.response?.data?.message ||
          "Terjadi kesalahan koneksi saat memuat dashboard.",
        "error",
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
          "success",
        );
        fetchDashboardData();
      }
    } catch (error: any) {
      console.error("Error logging activity:", error);
      showNotification(
        "Gagal Mencatat",
        error.response?.data?.message || "Terjadi kesalahan.",
        "error",
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

        {/* TANIBOT FAB */}
        <Pressable
          style={({ pressed }) => [
            styles.tanibotFab,
            pressed && { opacity: 0.8, transform: [{ scale: 0.95 }] },
          ]}
          onPress={() => router.push("/tanibot")}
        >
          <MaterialIcons name="smart-toy" size={28} color="#FFFFFF" />
        </Pressable>
      </SafeAreaView>
    );
  }

  const reminders = [...tanamanList]
    .filter((t) => {
      const sudahValidasiHariIni =
        t.logTerakhir &&
        new Date(t.logTerakhir.createdAt).toDateString() ===
          new Date().toDateString();
      if (t.statusPenyiraman === "PERLU_SIRAM" && !sudahValidasiHariIni)
        return true;
      if (t.sisaHariPanen <= 7) return true;
      return false;
    })
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
              {getGreeting()}, {userData?.nama || "Petani"}
            </Text>
            <Text style={styles.subtitle}>Yuk, rawat kebunmu hari ini! 🌱</Text>
          </View>
        </View>
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
        {/* STAT STRIP */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 24,
            gap: 8,
          }}
        >
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#FFFFFF",
              borderWidth: 2,
              borderColor: "#123924",
              borderRadius: 100,
              paddingVertical: 6,
              gap: 4,
              boxShadow: "2px 2px 0px #123924",
            }}
          >
            <MaterialIcons name="eco" size={16} color="#3FA86B" />
            <Text
              style={{
                fontFamily: "Nunito_700Bold",
                fontSize: 12,
                color: "#123924",
              }}
            >
              {tanamanList.length} Tanaman
            </Text>
          </View>
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#FFFFFF",
              borderWidth: 2,
              borderColor: "#123924",
              borderRadius: 100,
              paddingVertical: 6,
              gap: 4,
              boxShadow: "2px 2px 0px #123924",
            }}
          >
            <MaterialIcons
              name="local-fire-department"
              size={16}
              color="#FF6B5C"
            />
            <Text
              style={{
                fontFamily: "Nunito_700Bold",
                fontSize: 12,
                color: "#123924",
              }}
            >
              {userData?.streak || 0} Streak
            </Text>
          </View>
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#FFFFFF",
              borderWidth: 2,
              borderColor: "#123924",
              borderRadius: 100,
              paddingVertical: 6,
              gap: 4,
              boxShadow: "2px 2px 0px #123924",
            }}
          >
            <MaterialIcons name="star" size={16} color="#FFB627" />
            <Text
              style={{
                fontFamily: "Nunito_700Bold",
                fontSize: 12,
                color: "#123924",
              }}
            >
              Level {userData?.level || 1}
            </Text>
          </View>
        </View>

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

        {/* PANEN TERDEKAT CARD */}
        {(() => {
          const panenTerdekat =
            tanamanList.length > 0
              ? [...tanamanList].sort(
                  (a, b) => a.sisaHariPanen - b.sisaHariPanen,
                )[0]
              : null;

          if (!panenTerdekat) return null;

          const hariKe =
            Math.floor(
              (Date.now() - new Date(panenTerdekat.tanggalTanam).getTime()) /
                86400000,
            ) + 1;
          const totalHari = hariKe + panenTerdekat.sisaHariPanen;
          const persen = Math.min(100, Math.max(0, (hariKe / totalHari) * 100));

          return (
            <Pressable
              style={({ pressed }) => [
                {
                  backgroundColor: "#FFFFFF",
                  borderWidth: 2,
                  borderColor: "#123924",
                  borderRadius: 24,
                  padding: 16,
                  marginBottom: 16,
                  boxShadow: "4px 4px 0px #123924",
                },
                pressed && styles.pressedShadow4,
              ]}
              onPress={() =>
                router.push({
                  pathname: "/detail-tanaman",
                  params: { id: panenTerdekat.id },
                })
              }
            >
              <Text
                style={{
                  fontFamily: "Nunito_800ExtraBold",
                  fontSize: 12,
                  color: "#5C5A4F",
                  marginBottom: 4,
                }}
              >
                PANEN TERDEKAT 🌾
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "flex-end",
                  marginBottom: 12,
                }}
              >
                <Text
                  style={{
                    fontFamily: "Nunito_700Bold",
                    fontSize: 16,
                    color: "#123924",
                    flex: 1,
                  }}
                  numberOfLines={1}
                >
                  {panenTerdekat.nickname || panenTerdekat.jenisTanaman}
                </Text>
                <Text
                  style={{
                    fontFamily: "Nunito_800ExtraBold",
                    fontSize: 32,
                    color: "#1F5C3D",
                    lineHeight: 36,
                  }}
                >
                  {panenTerdekat.sisaHariPanen}{" "}
                  <Text style={{ fontSize: 14 }}>hari</Text>
                </Text>
              </View>
              <View
                style={{
                  backgroundColor: "#E8F5E9",
                  borderWidth: 2,
                  borderColor: "#123924",
                  borderRadius: 100,
                  height: 12,
                  width: "100%",
                  overflow: "hidden",
                }}
              >
                <View
                  style={{
                    backgroundColor: "#3FA86B",
                    width: `${persen}%`,
                    height: "100%",
                    borderRadius: 100,
                  }}
                />
              </View>
            </Pressable>
          );
        })()}

        {/* REMINDER LIST */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hari ini</Text>

          {/* WEATHER CARD */}
          {weather &&
            (() => {
              let bg = "#FFF9E6";
              let iconName = "wb-sunny";
              let iconColor = "#FFB627";
              let titleText = "Cerah hari ini, saatnya menyiram 🌞";

              if (weather.kondisi === "BERAWAN") {
                bg = "#F0F2F0";
                iconName = "cloud";
                iconColor = "#5C5A4F";
                titleText = "Langit berawan hari ini ☁️";
              } else if (weather.kondisi === "HUJAN") {
                bg = "#E3F2FD";
                iconName = "umbrella";
                iconColor = "#3FA86B";
                titleText = "Hujan diprediksi! Penyiraman ditunda ya ☔";
              }

              return (
                <View
                  style={{
                    backgroundColor: bg,
                    borderWidth: 2,
                    borderColor: "#123924",
                    borderRadius: 24,
                    padding: 16,
                    marginBottom: 16,
                    boxShadow: "4px 4px 0px #123924",
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 4,
                    }}
                  >
                    <MaterialIcons
                      name={iconName as any}
                      size={24}
                      color={iconColor}
                      style={{ marginRight: 8 }}
                    />
                    <Text
                      style={{
                        fontFamily: "Nunito_700Bold",
                        fontSize: 13,
                        color: "#123924",
                        flex: 1,
                      }}
                    >
                      {titleText}
                    </Text>
                  </View>
                  <Text
                    style={{
                      fontFamily: "Nunito_500Medium",
                      fontSize: 11,
                      color: "#5C5A4F",
                      marginLeft: 32,
                    }}
                  >
                    {weather.deskripsi} • {Math.round(weather.suhu)}°C
                  </Text>
                  {weather.prediksiHujanHariIni && (
                    <Text
                      style={{
                        fontFamily: "Nunito_500Medium",
                        fontStyle: "italic",
                        fontSize: 10,
                        color: "#5C5A4F",
                        marginLeft: 32,
                        marginTop: 4,
                      }}
                    >
                      Penyiraman beberapa tanaman mungkin ditunda sistem.
                    </Text>
                  )}
                </View>
              );
            })()}

          {reminders.length === 0 ? (
            <EmptyHint
              icon="emoji-emotions"
              title="Mantap! Semua tanaman aman hari ini"
              subtitle="Belum ada yang perlu disiram. Nikmati harimu, petani hebat!"
            />
          ) : (
            reminders.map((tanaman) => {
              const sudahValidasiHariIni =
                tanaman.logTerakhir &&
                new Date(tanaman.logTerakhir.createdAt).toDateString() ===
                  new Date().toDateString();
              const isPenyiraman =
                tanaman.statusPenyiraman === "PERLU_SIRAM" &&
                !sudahValidasiHariIni;

              return (
                <Pressable
                  key={tanaman.id}
                  style={({ pressed }) => [
                    styles.taskCard,
                    pressed && styles.pressedShadow4,
                  ]}
                  onPress={() => {
                    if (isPenyiraman) {
                      handleLogAktivitas(tanaman.id);
                    } else {
                      router.push({
                        pathname: "/detail-tanaman",
                        params: { id: tanaman.id },
                      });
                    }
                  }}
                >
                  <View
                    style={[
                      styles.taskIconBox,
                      { backgroundColor: isPenyiraman ? "#FF6B5C" : "#FFB627" },
                    ]}
                  >
                    <MaterialIcons
                      name={isPenyiraman ? "water-drop" : "eco"}
                      size={24}
                      color="#FFFFFF"
                    />
                  </View>
                  <View style={styles.taskInfo}>
                    <Text style={styles.taskName}>
                      {tanaman.nickname || tanaman.jenisTanaman}
                    </Text>
                    <Text
                      style={[
                        styles.taskStatus,
                        { color: isPenyiraman ? "#FF6B5C" : "#5C5A4F" },
                      ]}
                    >
                      {isPenyiraman
                        ? "Perlu disiram sekarang"
                        : `Masa panen tinggal ${tanaman.sisaHariPanen} hari lagi!`}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.checkbox,
                      !isPenyiraman && styles.checkboxDoneAmber,
                    ]}
                  >
                    {!isPenyiraman && (
                      <MaterialIcons name="check" size={16} color="#FFFFFF" />
                    )}
                  </View>
                </Pressable>
              );
            })
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
              <EmptyHint
                icon="local-florist"
                title="Kebunmu masih kosong nih 🌱"
                subtitle="Yuk mulai tanam tanaman pertamamu!"
                ctaText="Tanam Sekarang"
                onCtaPress={() => router.push("/(tabs)/tanaman")}
              />
            ) : (
              tanamanList.map((tanaman) => {
                const sudahValidasiHariIni =
                  tanaman.logTerakhir &&
                  new Date(tanaman.logTerakhir.createdAt).toDateString() ===
                    new Date().toDateString();
                const badgeBg = sudahValidasiHariIni
                  ? "#3FA86B"
                  : tanaman.statusPenyiraman === "PERLU_SIRAM"
                    ? "#FFB627"
                    : "#3FA86B";
                const badgeTextCol = sudahValidasiHariIni
                  ? "#FFFFFF"
                  : tanaman.statusPenyiraman === "PERLU_SIRAM"
                    ? "#123924"
                    : "#FFFFFF";
                const badgeText = sudahValidasiHariIni
                  ? "Sudah Disiram ✅"
                  : `${tanaman.sisaHariPanen} hari lagi`;

                return (
                  <Pressable
                    key={tanaman.id}
                    style={({ pressed }) => [
                      styles.plantCard,
                      pressed && styles.pressedShadow4,
                    ]}
                    onPress={() =>
                      router.push({
                        pathname: "/detail-tanaman",
                        params: { id: tanaman.id },
                      })
                    }
                  >
                    <View
                      style={[
                        styles.plantImagePlaceholder,
                        { overflow: "hidden" },
                      ]}
                    >
                      {tanaman.logTerakhir?.fotoUrl ? (
                        <Image
                          source={{ uri: tanaman.logTerakhir.fotoUrl }}
                          style={{
                            width: "100%",
                            height: "100%",
                            resizeMode: "cover",
                          }}
                        />
                      ) : (
                        <Image
                          source={{ uri: FALLBACK_THUMB }}
                          style={{
                            width: "100%",
                            height: "100%",
                            resizeMode: "cover",
                          }}
                        />
                      )}
                    </View>
                    <View style={styles.plantCardBody}>
                      <Text style={styles.plantName} numberOfLines={1}>
                        {tanaman.nickname || tanaman.jenisTanaman}
                      </Text>
                      <View
                        style={[styles.badge, { backgroundColor: badgeBg }]}
                      >
                        <Text
                          style={[styles.badgeText, { color: badgeTextCol }]}
                        >
                          {badgeText}
                        </Text>
                      </View>
                    </View>
                  </Pressable>
                );
              })
            )}
          </ScrollView>
        </View>
      </ScrollView>

      {/* TANIBOT FAB */}
      <Pressable
        style={({ pressed }) => [
          styles.tanibotFab,
          pressed && { opacity: 0.8, transform: [{ scale: 0.95 }] },
        ]}
        onPress={() => router.push("/tanibot")}
      >
        <MaterialIcons name="smart-toy" size={28} color="#FFFFFF" />
      </Pressable>
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
    fontSize: 18,
    fontFamily: "Nunito_800ExtraBold",
    color: "#00522c",
  },
  subtitle: {
    fontSize: 12,
    color: "#5C5A4F",
    fontFamily: "Nunito_500Medium",
  },

  tanibotFab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#123924",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#3FA86B",
    boxShadow: "4px 4px 0px #3FA86B",
    elevation: 8,
    zIndex: 100,
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
    fontSize: 16,
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
