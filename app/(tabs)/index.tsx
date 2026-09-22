import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import Svg, { Path } from "react-native-svg";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import CoachMarkOverlay, { CoachMarkStep } from "../../components/CoachMarkOverlay";
import ErrorState from "../../components/ErrorState";
import { useNotification } from "../../components/NotificationContext";
import api from "../../services/api";
import { checkTutorialFinished, markTutorialFinished } from "../../utils/tutorial";
const FALLBACK_THUMB =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAK72N9bfUnTDR_qxCQtZfhdGFtdZeRDYs-OsNC2lUxmLLI86pKo2ugpOTvGWWwZL9sOkbzXCmRvMwHqent34F7rwvgUHge8_BFG9hN7iYc902WRQsddbBhE_9RiOVhij3iicG_BjbjGLfbqAgjgG9U9a64_nAsnjBQH2_AoUiMWgVBpRNDZeugVxjpYWAoqgIcNd6whl3ktEPbbtfIzxtMOHeRnbZXGuogESuoFy2lwMymfV81rGAUhA";

import { forwardRef } from 'react';

const EmptyHint = forwardRef<View, {
  icon?: any;
  imageSource?: any;
  title: string;
  subtitle: string;
  ctaText?: string;
  onCtaPress?: () => void;
}>(({
  icon,
  imageSource,
  title,
  subtitle,
  ctaText,
  onCtaPress,
}, ref) => (
  <View
    ref={ref}
    style={{
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 24,
      paddingHorizontal: 16,
    }}
  >
    {imageSource ? (
      <Image 
        source={imageSource} 
        style={{ width: 120, height: 120, marginBottom: 12, resizeMode: 'contain' }} 
      />
    ) : (
      <MaterialIcons
        name={icon}
        size={40}
        color="#bdcabd"
        style={{ marginBottom: 12 }}
      />
    )}
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
));



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



const HomeSkeleton = () => {
  const fadeAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 0.4, duration: 800, useNativeDriver: true })
      ])
    ).start();
  }, [fadeAnim]);

  const boxStyles = { backgroundColor: '#E8E5DA', borderWidth: 2, borderColor: '#123924', boxShadow: "4px 4px 0px #123924" };
  const pillStyles = { backgroundColor: '#E8E5DA', borderWidth: 2, borderColor: '#123924', boxShadow: "2px 2px 0px #123924" };

  return (
    <Animated.View style={{ opacity: fadeAnim, paddingHorizontal: 20, paddingTop: 0, paddingBottom: 40 }}>
      {/* STAT STRIP SKELETON */}
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 24 }}>
        <View style={[{ flex: 1, height: 34, borderRadius: 100 }, pillStyles]} />
        <View style={[{ flex: 1, height: 34, borderRadius: 100 }, pillStyles]} />
      </View>

      {/* HERO CARD SKELETON */}
      <View style={[{ width: '100%', height: 85, borderRadius: 28, marginBottom: 32 }, boxStyles]} />

      {/* TUGAS HARI INI SKELETON */}
      <View style={{ width: 100, height: 20, borderRadius: 10, backgroundColor: '#E8E5DA', marginBottom: 16 }} />
      <View style={[{ width: '100%', height: 76, borderRadius: 24, marginBottom: 12 }, boxStyles]} />
      <View style={[{ width: '100%', height: 76, borderRadius: 24, marginBottom: 32 }, boxStyles]} />

      {/* KEBUNKU SKELETON */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <View style={{ width: 100, height: 20, borderRadius: 10, backgroundColor: '#E8E5DA' }} />
        <View style={{ width: 60, height: 16, borderRadius: 8, backgroundColor: '#E8E5DA' }} />
      </View>
      <View style={{ flexDirection: 'row', gap: 16 }}>
        <View style={[{ width: 140, height: 200, borderRadius: 24 }, boxStyles]} />
        <View style={[{ width: 140, height: 200, borderRadius: 24 }, boxStyles]} />
      </View>
    </Animated.View>
  );
};

export default function DashboardScreen() {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 4 && hour < 10) return "Selamat pagi";
    if (hour >= 10 && hour < 15) return "Selamat siang";
    if (hour >= 15 && hour < 18) return "Selamat sore";
    return "Selamat malam";
  };
  const [userData, setUserData] = useState<any>(null);
  const [showGamification, setShowGamification] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialSteps, setTutorialSteps] = useState<CoachMarkStep[]>([]);
  const [needsTutorial, setNeedsTutorial] = useState(false);

  const step1Ref = useRef<View>(null);
  const step2Ref = useRef<View>(null);
  const step3Ref = useRef<View>(null);
  const step4Ref = useRef<View>(null);
  
  const insets = useSafeAreaInsets();
  
  const [tanamanList, setTanamanList] = useState<any[]>([]);
  const [weather, setWeather] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showBadgeInfo, setShowBadgeInfo] = useState(false);
  const [showRestorePopup, setShowRestorePopup] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const { showNotification } = useNotification();

  useEffect(() => {
    if (userData && !isLoading) {
      checkTutorialFinished().then((finished) => {
        if (!finished) {
          // Jika user sudah punya EXP atau tanaman, berarti ini user lama (existing user)
          // Kita anggap mereka sudah mengerti dan lewati tutorial
          const isNewUser = (userData.exp || 0) === 0 && tanamanList.length === 0;
          
          if (isNewUser) {
            setNeedsTutorial(true);
          } else {
            markTutorialFinished();
          }
        }
      });
    }
  }, [userData, isLoading, tanamanList.length]);

  useEffect(() => {
    if (needsTutorial && !isLoading) {
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        if (attempts > 10) {
          clearInterval(interval);
          return;
        }

        const measurePromises = [
          new Promise<any>((resolve) => {
            if (!step1Ref.current) return resolve(null);
            step1Ref.current.measureInWindow((x, y, w, h) => resolve(w > 0 ? {x, y, w, h} : null));
          }),
          new Promise<any>((resolve) => {
            if (!step2Ref.current) return resolve(null);
            step2Ref.current.measureInWindow((x, y, w, h) => resolve(w > 0 ? {x, y, w, h} : null));
          }),
          new Promise<any>((resolve) => {
            if (!step3Ref.current) return resolve(null);
            step3Ref.current.measureInWindow((x, y, w, h) => resolve(w > 0 ? {x, y, w, h} : null));
          }),
          new Promise<any>((resolve) => {
            if (!step4Ref.current) return resolve(null);
            step4Ref.current.measureInWindow((x, y, w, h) => resolve(w > 0 ? {x, y, w, h} : null));
          }),
        ];

        Promise.all(measurePromises).then((results) => {
          if (results.every(r => r !== null)) {
            clearInterval(interval);
            const { width: windowWidth, height: windowHeight } = Dimensions.get('window');
            const tabBarHeight = 64 + insets.bottom;

            const steps: CoachMarkStep[] = [
              {
                rect: { x: results[0].x, y: results[0].y, width: results[0].w, height: results[0].h },
                title: "Streak Belajar",
                description: "Lihat seberapa konsisten kamu merawat tanaman tiap harinya. Pertahankan streak-mu!",
                borderRadius: 24,
              },
              {
                rect: { x: results[1].x, y: results[1].y, width: results[1].w, height: results[1].h },
                title: "Tugas Hari Ini",
                description: "Semua tanaman yang butuh perhatianmu hari ini akan muncul di sini.",
                borderRadius: 24,
              },
              {
                rect: { x: results[2].x, y: results[2].y, width: results[2].w, height: results[2].h },
                title: "Tandai Selesai",
                description: "Tekan tombol ini setelah menyiram tanaman untuk mencatat log dan dapatkan EXP!",
                borderRadius: 16, // Or whatever the checkbox radius is
              },
              {
                rect: { x: results[3].x, y: results[3].y, width: results[3].w, height: results[3].h },
                title: "Kebunku",
                description: "Lihat koleksi semua tanamanmu dan pantau statusnya di sini.",
                borderRadius: 24,
              },
              {
                rect: { 
                  x: 0, 
                  y: windowHeight - tabBarHeight, 
                  width: windowWidth, 
                  height: tabBarHeight 
                },
                title: "Navigasi Utama",
                description: "Pindah ke halaman lain seperti Tanaman, ChatBot, atau Komunitas lewat menu ini.",
                borderRadius: 0,
              },
            ];
            setTutorialSteps(steps);
            setShowTutorial(true);
            setNeedsTutorial(false); // Stop trying
          }
        });
      }, 500);

      return () => clearInterval(interval);
    }
  }, [needsTutorial, isLoading]);

  // Check Pelindung Streak Pop-up
  useEffect(() => {
    const checkPopup = async () => {
      if (userData && userData.streak === 0 && userData.pelindung_streak && userData.pelindung_streak >= 1) {
        try {
          const todayStr = new Date().toISOString().split('T')[0];
          const key = `pelindung_popup_shown_${todayStr}`;
          const hasShown = await AsyncStorage.getItem(key);
          if (!hasShown) {
            setShowRestorePopup(true);
          }
        } catch (e) {
          console.error(e);
        }
      }
    };
    checkPopup();
  }, [userData]);

  const handleRestoreStreak = async () => {
    setIsRestoring(true);
    try {
      const response = await api.post("/user/restore-streak");
      if (response.data) {
        const { pelindung_streak, streak } = response.data;
        setUserData((prev: any) => {
          if (!prev) return prev;
          const updated = { ...prev, pelindung_streak, streak };
          SecureStore.setItemAsync("userData", JSON.stringify(updated)).catch(console.error);
          return updated;
        });
        
        const todayStr = new Date().toISOString().split('T')[0];
        const key = `pelindung_popup_shown_${todayStr}`;
        await AsyncStorage.setItem(key, 'true');
        
        setShowRestorePopup(false);
        showNotification("Apinya Nyala Lagi! 🔥", "Jangan lupa siram hari ini ya!", "success");
      }
    } catch (e: any) {
      const msg = e.response?.data?.message || "Gagal memulihkan streak, coba lagi nanti.";
      showNotification("Error", msg, "error");
    } finally {
      setIsRestoring(false);
    }
  };

  const handleIgnoreRestore = async () => {
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const key = `pelindung_popup_shown_${todayStr}`;
      await AsyncStorage.setItem(key, 'true');
    } catch (e) {
      console.error(e);
    }
    setShowRestorePopup(false);
  };

  // SWR Cache Loader - Only runs ONCE on mount
  useEffect(() => {
    const initApp = async () => {
      const token = await SecureStore.getItemAsync("userToken");
      if (!token) return;
      try {
        const cachedUser = await SecureStore.getItemAsync("userData");
        const cachedTanaman = await AsyncStorage.getItem("dashboard_tanaman");
        const cachedWeather = await AsyncStorage.getItem("dashboard_weather");
        
        let hasCache = false;
        if (cachedUser) { setUserData(JSON.parse(cachedUser)); hasCache = true; }
        if (cachedTanaman) { setTanamanList(JSON.parse(cachedTanaman)); hasCache = true; }
        if (cachedWeather) {
          const parsed = JSON.parse(cachedWeather);
          if (parsed.savedAt && Date.now() - parsed.savedAt < 3 * 60 * 60 * 1000) {
            setWeather(parsed.data);
            hasCache = true;
          }
        }
        if (hasCache) setIsLoading(false);
      } catch (e) {
        console.log("Cache read error:", e);
      }
    };
    initApp();
  }, []);

  // Data Fetcher - Runs on focus
  useFocusEffect(
    useCallback(() => {
      const checkAuthAndFetch = async () => {
        const token = await SecureStore.getItemAsync("userToken");
        if (!token) {
          router.replace("/(auth)/login");
          return;
        }
        
        // Sync local cache first (in case detail screen updated EXP/Level)
        const cachedUser = await SecureStore.getItemAsync("userData");
        if (cachedUser) {
          const parsed = JSON.parse(cachedUser);
          setUserData((prev: any) => prev ? { ...prev, exp: parsed.exp, level: parsed.level, streak: parsed.streak } : parsed);
        }

        fetchDashboardData();
      };
      checkAuthAndFetch();
    }, [])
  );

  const fetchDashboardData = async () => {
    if (tanamanList.length === 0 && !userData) {
      setIsLoading(true);
      setIsError(false);
    } else {
      setIsRefreshing(true);
    }
    try {
      const [meRes, tanamanRes, weatherRes] = await Promise.all([
        api.get("/user/me").catch((e) => {
          if (e.response && e.response.status === 404) return null;
          throw e;
        }),
        api.get("/tanaman"),
        api.get("/weather/today").catch(() => null),
      ]);
      if (meRes?.data?.data) {
        setUserData((prev: any) => {
          let merged = meRes.data.data;
          if (prev) {
            merged = {
              ...prev,
              ...meRes.data.data,
              exp: meRes.data.data.exp !== undefined ? meRes.data.data.exp : prev.exp,
              level: meRes.data.data.level !== undefined ? meRes.data.data.level : prev.level
            };
          }
          SecureStore.setItemAsync("userData", JSON.stringify(merged)).catch(console.error);
          return merged;
        });
      }
      if (tanamanRes?.data?.data) {
        setTanamanList(tanamanRes.data.data);
        AsyncStorage.setItem("dashboard_tanaman", JSON.stringify(tanamanRes.data.data)).catch(() => {});
      }
      if (weatherRes?.data?.data) {
        const weatherData = weatherRes.data.data;
        setWeather(weatherData);
        AsyncStorage.setItem("dashboard_weather", JSON.stringify({ data: weatherData, savedAt: Date.now() })).catch(() => {});

        // Check rain notification
        if (weatherData.kondisi === "HUJAN" && weatherData.prediksiHujanHariIni) {
          try {
            const todayStr = new Date().toDateString();
            const lastNotified = await AsyncStorage.getItem("last_rain_notified");
            if (lastNotified !== todayStr) {
              showNotification(
                "☔ Hujan Diprediksi!",
                "Penyiraman tanaman ditunda sistem hari ini. Nikmati hujannya, petani! 🌧️",
                "info"
              );
              await AsyncStorage.setItem("last_rain_notified", todayStr);
            }
          } catch (err) {
            console.error("Failed to check or set rain notif flag", err);
          }
        }
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
        const d = response.data.data;
        setUserData((prev: any) => prev ? { 
          ...prev, 
          exp: d.expSekarang !== undefined ? d.expSekarang : (prev.exp || 0) + (d.expDidapat || 0), 
          level: d.level !== undefined ? d.level : prev.level, 
          streak: d.streak !== undefined ? d.streak : prev.streak 
        } : prev);
        if (d.levelUp) {
          showNotification(
            "Mantap!",
            `LEVEL UP! Level ${d.level}`,
            "success",
          );
        } else {
          showNotification(
            "Mantap!",
            `+${d.expDidapat} EXP! Streak: ${d.streak} hari`,
            "success",
          );
        }
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

  // isLoading check handled inside return to preserve Header

  const reminders = [...tanamanList]
    .filter((t) => {
      const sudahValidasiHariIni =
        t.logTerakhir &&
        new Date(t.logTerakhir.createdAt).toDateString() ===
          new Date().toDateString();
      if (t.statusPenyiraman === "PERLU_SIRAM" && !sudahValidasiHariIni)
        return true;
      if ((t.sisaHariPanen ?? 999) <= 7) return true;
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
      return (a.sisaHariPanen ?? 999) - (b.sisaHariPanen ?? 999);
    });

  const { width } = Dimensions.get('window');
  
  return (
    <SafeAreaView style={styles.safeArea} edges={["right", "bottom", "left"]}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[isLoading && { paddingHorizontal: 0, paddingTop: 0 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            colors={["#3FA86B"]}
            refreshing={isRefreshing}
            onRefresh={fetchDashboardData}
          />
        }
      >
      {/* HEADER BACKGROUND: Melengkung biasa */}
      {/* HEADER BACKGROUND: Mentok Atas */}
      <View style={{ position: 'absolute', top: 0, width: '100%', height: 180 + insets.top, backgroundColor: '#3FA86B', borderBottomLeftRadius: 48, borderBottomRightRadius: 48, borderBottomWidth: 4, borderColor: '#123924', zIndex: 0 }} />
      {/* HEADER */}
      <View style={[styles.header, { backgroundColor: 'transparent', paddingTop: 16 + insets.top }]}>
        <View style={styles.profileSection}>
          <Pressable 
            onLongPress={() => {
              setUserData((prev: any) => ({
                ...prev,
                level: 99,
                streak: 365,
                poin: 9999,
              }));
              showNotification("GOD MODE ACTIVATED 🚀", "Level 99, Streak 365! Siap bantai presentasi!", "success");
            }}
            style={({pressed}) => [styles.avatar, pressed && {opacity: 0.7}]}
          >
            {userData?.avatarUrl ? (
              <Image source={{ uri: userData.avatarUrl }} style={{ width: '100%', height: '100%', borderRadius: 24, resizeMode: 'cover' }} />
            ) : (
              <MaterialIcons name="person" size={24} color="#123924" />
            )}
          </Pressable>
          <View>
            <Pressable onLongPress={async () => {
              const { resetTutorial } = require('../../utils/tutorial');
              await resetTutorial();
              showNotification("Reset", "Tutorial Tour di-reset! Silakan restart atau reload (R).", "success");
            }}>
              <Text style={[styles.greeting, { color: '#123924' }]}>
                {getGreeting()}, {userData?.nama || "Petani"}
              </Text>
            </Pressable>
            <Text style={[styles.subtitle, { color: '#123924', fontFamily: 'Nunito_700Bold' }]}>Yuk, rawat kebunmu hari ini!</Text>
          </View>
        </View>
      </View>
        {/* Pembungkus konten stat & kebunku */}
        <View style={[styles.contentContainer, { paddingTop: 24 }]}>
        {isLoading ? (
          <HomeSkeleton />
        ) : isError ? (
          <ErrorState onRetry={fetchDashboardData} />
        ) : (
          <>
        {/* STAT STRIP */}
        <FadeInSlideUp delay={0}>
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
        </FadeInSlideUp>

        {/* STREAK HERO CARD */}
        <FadeInSlideUp delay={100}>
        <Pressable
          ref={step1Ref}
          style={({ pressed }) => [
            styles.heroCard,
            pressed && styles.pressedShadow4,
          ]}
          onPress={() => setShowGamification(true)}
        >
          {/* Faint Background Icon */}
          <MaterialIcons name="local-fire-department" size={100} color="rgba(255,255,255,0.08)" style={{ position: 'absolute', right: 0, top: 0, transform: [{ rotate: '15deg' }] }} />
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

          {userData?.pelindung_streak !== undefined && (
            <Pressable 
              style={({ pressed }) => [
                {
                  position: 'absolute',
                  top: -8,
                  right: -8,
                  backgroundColor: '#FFB627',
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 999,
                  borderWidth: 2,
                  borderColor: '#123924',
                  boxShadow: pressed ? '0px 0px 0px #123924' : '2px 2px 0px #123924',
                  transform: [{ rotate: '5deg' }, { translateX: pressed ? 2 : 0 }, { translateY: pressed ? 2 : 0 }],
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                  opacity: userData.pelindung_streak === 0 ? 0.5 : 1
                }
              ]}
              disabled={userData.pelindung_streak === 0}
              onPress={(e) => {
                e.stopPropagation();
                setShowBadgeInfo(true);
              }}
            >
              <Ionicons name="umbrella" size={14} color="#123924" />
              <Text style={{ fontFamily: 'Nunito_800ExtraBold', fontSize: 12, color: '#123924' }}>
                x{userData.pelindung_streak}
              </Text>
            </Pressable>
          )}

        </Pressable>

        {/* PETA WABAH HAMA CARD */}
        <Pressable
          style={({ pressed }) => [
            {
              backgroundColor: '#FFECEB',
              borderWidth: 2,
              borderColor: '#123924',
              borderRadius: 24,
              padding: 20,
              marginBottom: 32,
              flexDirection: 'row',
              alignItems: 'center',
              boxShadow: pressed ? '0px 0px 0px #123924' : '4px 4px 0px #123924',
              transform: pressed ? [{ translateX: 2 }, { translateY: 2 }] : [{ translateX: 0 }, { translateY: 0 }]
            }
          ]}
          onPress={() => router.push('/peta-hama' as any)}
        >
          <View style={{ backgroundColor: '#FF6B5C', padding: 12, borderRadius: 100, borderWidth: 2, borderColor: '#123924', marginRight: 16 }}>
            <MaterialIcons name="map" size={24} color="#FFFFFF" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: 'Nunito_800ExtraBold', fontSize: 16, color: '#123924', marginBottom: 4 }}>
              🗺️ Peta Wabah Hama
            </Text>
            <Text style={{ fontFamily: 'Nunito_500Medium', fontSize: 12, color: '#5C5A4F' }}>
              Cek area rawan hama di sekitarmu!
            </Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color="#123924" />
        </Pressable>

        {/* PANEN TERDEKAT CARD */}
        {(() => {
          const panenTerdekat =
            tanamanList.length > 0
              ? [...tanamanList].sort(
                  (a, b) => (a.sisaHariPanen ?? 999) - (b.sisaHariPanen ?? 999),
                )[0]
              : null;

          if (!panenTerdekat) return null;

          const hariKe =
            Math.floor(
              (Date.now() - new Date(panenTerdekat.tanggalTanam).getTime()) /
                86400000,
            ) + 1;
          const totalHari = hariKe + (panenTerdekat.sisaHariPanen ?? 999);
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
                PANEN TERDEKAT
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
                  {panenTerdekat.sisaHariPanen ?? 999}{" "}
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
        <View style={styles.section} ref={step2Ref}>
          <Text style={styles.sectionTitle}>Hari ini</Text>

          {/* WEATHER CARD */}
          {weather &&
            (() => {
              let bg = "#FFF9E6";
              let iconName = "wb-sunny";
              let iconColor = "#FFB627";
              let titleText = "Cerah hari ini, saatnya menyiram";

              if (weather.kondisi === "BERAWAN") {
                bg = "#F0F2F0";
                iconName = "cloud";
                iconColor = "#5C5A4F";
                titleText = "Langit berawan hari ini";
              } else if (weather.kondisi === "HUJAN") {
                bg = "#E3F2FD";
                iconName = "umbrella";
                iconColor = "#3FA86B";
                titleText = "Hujan diprediksi! Penyiraman ditunda ya";
              }

              return (
                <Pressable
                  onLongPress={() => {
                    setWeather({
                      suhu: 24.5,
                      kelembapan: 88,
                      kondisi: "HUJAN",
                      deskripsi: "Hujan Lebat (Simulasi)",
                      prediksiHujanHariIni: true
                    });
                    
                    const updatedList = tanamanList.map(t => {
                      if (t.statusPenyiraman === "PERLU_SIRAM") {
                        return { ...t, statusPenyiraman: "DITUNDA_HUJAN" };
                      }
                      return t;
                    });
                    setTanamanList(updatedList);
                    showNotification(
                      "☔ Simulasi Hujan Diaktifkan!",
                      "Sistem mendeteksi hujan lebat. Penyiraman ditunda!",
                      "info"
                    );
                  }}
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
                      gap: 8,
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
                </Pressable>
              );
            })()}

          {reminders.length === 0 ? (
            <EmptyHint
              ref={step3Ref}
              icon="emoji-emotions"
              title="Mantap! Semua tanaman aman hari ini"
              subtitle="Belum ada yang perlu disiram. Nikmati harimu, petani hebat!"
            />
          ) : (
            reminders.map((tanaman, index) => {
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
                        : `Masa panen tinggal ${tanaman.sisaHariPanen ?? 999} hari lagi!`}
                    </Text>
                  </View>
                  <View
                    ref={index === 0 ? step3Ref : undefined}
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
        <View style={styles.section} ref={step4Ref}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Tanaman kamu</Text>
          </View>
          {tanamanList.length === 0 ? (
            <EmptyHint
              imageSource={require("../../assets/images/icontampilanawal/seedling-menanam.png")}
              title="Kebunmu masih kosong nih"
              subtitle="Yuk mulai tanam tanaman pertamamu!"
              ctaText="Tanam Sekarang"
              onCtaPress={() => router.push("/(tabs)/tanaman")}
            />
          ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
          >
            {tanamanList.map((tanaman) => {
                const sudahValidasiHariIni =
                  tanaman.logTerakhir &&
                  new Date(tanaman.logTerakhir.createdAt).toDateString() ===
                    new Date().toDateString();
                const isSiapPanen = (tanaman.sisaHariPanen ?? 999) <= 0;
                const badgeBg = isSiapPanen
                  ? "#FFB627"
                  : sudahValidasiHariIni
                  ? "#3FA86B"
                  : tanaman.statusPenyiraman === "PERLU_SIRAM"
                    ? "#FFB627"
                    : "#3FA86B";
                const badgeTextCol = isSiapPanen
                  ? "#123924"
                  : sudahValidasiHariIni
                  ? "#FFFFFF"
                  : tanaman.statusPenyiraman === "PERLU_SIRAM"
                    ? "#123924"
                    : "#FFFFFF";
                const badgeText = isSiapPanen
                  ? "Siap Panen"
                  : sudahValidasiHariIni
                  ? "Sudah Disiram"
                  : `${tanaman.sisaHariPanen ?? 999} hari lagi`;

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
            }
          </ScrollView>
          )}
        
      <Modal visible={showGamification} animationType="slide" transparent={false}>
        <View style={{ flex: 1, backgroundColor: '#FBF8F0', paddingTop: 48 }}>
          {/* HEADER */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingBottom: 16, borderBottomWidth: 4, borderColor: '#123924', backgroundColor: '#FFB627' }}>
            <View>
              <Text style={{ fontFamily: 'Nunito_800ExtraBold', fontSize: 24, color: '#123924' }}>Peta Perjalanan Tani</Text>
              <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: 14, color: '#123924' }}>Lv.{userData?.level || 1} • {userData?.streak || 0} Streak</Text>
            </View>
            <TouchableOpacity onPress={() => setShowGamification(false)} style={{ backgroundColor: '#FFECEB', padding: 8, borderRadius: 100, borderWidth: 2, borderColor: '#123924', boxShadow: '2px 2px 0px #123924' }}>
              <MaterialIcons name="close" size={24} color="#123924" />
            </TouchableOpacity>
          </View>

          {/* ROADMAP SCROLL */}
          <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>
            
            {/* LEVEL PROGRESS */}
            <View style={{ backgroundColor: '#FFFFFF', padding: 16, borderRadius: 16, borderWidth: 2, borderColor: '#123924', boxShadow: '4px 4px 0px #123924', marginBottom: 24 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={{ fontFamily: 'Nunito_800ExtraBold', fontSize: 14, color: '#123924' }}>Level Progress</Text>
                <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: 12, color: '#3FA86B' }}>
                  {(userData?.exp || 0) % 100} / 100 EXP
                </Text>
              </View>
              <View style={{ height: 16, backgroundColor: '#E8F5E9', borderRadius: 8, borderWidth: 2, borderColor: '#123924', overflow: 'hidden' }}>
                <View style={{ width: `${(userData?.exp || 0) % 100}%`, height: '100%', backgroundColor: '#3FA86B', borderRightWidth: 2, borderColor: '#123924' }} />
              </View>
              <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: 10, color: '#5C5A4F', marginTop: 8, textAlign: 'center' }}>
                Naikin level dengan rajin panen dan jaga streak harian!
              </Text>
            </View>

            {/* HEATMAP STREAK */}
            <View style={{ backgroundColor: '#E8F5E9', padding: 16, borderRadius: 16, borderWidth: 2, borderColor: '#123924', marginBottom: 32 }}>
              <Text style={{ fontFamily: 'Nunito_800ExtraBold', fontSize: 14, color: '#123924', marginBottom: 12 }}>Aktivitas 28 Hari Terakhir</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
                {Array.from({ length: 28 }).map((_, i) => {
                  const isStreak = (27 - i) < (userData?.streak || 0);
                  return (
                    <View 
                      key={i} 
                      style={{ 
                        width: 24, height: 24, borderRadius: 6, 
                        backgroundColor: isStreak ? '#3FA86B' : 'rgba(28,57,36,0.1)',
                        borderWidth: isStreak ? 2 : 0,
                        borderColor: '#123924'
                      }} 
                    />
                  );
                })}
              </View>
            </View>

            <Text style={{ fontFamily: 'Nunito_800ExtraBold', fontSize: 18, color: '#123924', marginBottom: 16 }}>
              Peta Level Kamu
            </Text>

            <View style={{ paddingLeft: 16 }}>
              {/* VERTICAL LINE */}
              <View style={{ position: 'absolute', left: 40, top: 20, bottom: 20, width: 4, backgroundColor: '#123924' }} />

              {[
                { lvl: 10, title: "Dewa Tani", desc: "Legenda kebun kota" },
                { lvl: 8, title: "Sultan Hidroponik", desc: "Punya setup premium" },
                { lvl: 4, title: "Juragan Panen", desc: "Udah sering bagi-bagi hasil" },
                { lvl: 2, title: "Tangan Dingin", desc: "Mulai paham ritme tanaman" },
                { lvl: 1, title: "Petani Balkon", desc: "Baru mulai nyemai bibit" }
              ].map((item, idx) => {
                const userLvl = userData?.level || 1;
                const isPassed = userLvl >= item.lvl;
                const isCurrent = userLvl >= item.lvl && (idx === 0 || userLvl < [10, 8, 4, 2, 1][idx - 1]);
                
                return (
                  <View key={item.lvl} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 32 }}>
                    {/* NODE */}
                    <View style={{ 
                      width: 48, height: 48, borderRadius: 24, 
                      backgroundColor: isPassed ? '#3FA86B' : '#FFFFFF', 
                      borderWidth: 4, borderColor: '#123924', 
                      alignItems: 'center', justifyContent: 'center',
                      zIndex: 2,
                      boxShadow: isCurrent ? '4px 4px 0px #FFB627' : 'none'
                    }}>
                      <Text style={{ fontFamily: 'Nunito_800ExtraBold', fontSize: 16, color: isPassed ? '#FFFFFF' : '#123924' }}>
                        {item.lvl}
                      </Text>
                    </View>

                    {/* CARD */}
                    <View style={{ 
                      flex: 1, marginLeft: 16, padding: 16, 
                      backgroundColor: isPassed ? '#E8F5E9' : '#F5F5F5', 
                      borderRadius: 16, borderWidth: 2, borderColor: '#123924',
                      boxShadow: '4px 4px 0px #123924',
                      opacity: isPassed ? 1 : 0.6
                    }}>
                      <Text style={{ fontFamily: 'Nunito_800ExtraBold', fontSize: 16, color: '#123924' }}>{item.title}</Text>
                      <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: 12, color: '#5C5A4F', marginTop: 4 }}>{item.desc}</Text>
                      {isCurrent && (
                        <View style={{ marginTop: 12, backgroundColor: '#FFB627', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 8, alignSelf: 'flex-start', borderWidth: 1, borderColor: '#123924' }}>
                          <Text style={{ fontFamily: 'Nunito_800ExtraBold', fontSize: 10, color: '#123924' }}>POSISI KAMU SEKARANG</Text>
                        </View>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </View>
      </Modal>


    </View>
          </FadeInSlideUp>
          </>
        )}
        </View>
      </ScrollView>



      <CoachMarkOverlay
        visible={showTutorial}
        steps={tutorialSteps}
        onFinish={() => {
          setShowTutorial(false);
          markTutorialFinished();
        }}
        onSkip={() => {
          setShowTutorial(false);
          markTutorialFinished();
        }}
      />

      <Modal transparent visible={showBadgeInfo} animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <View style={{ width: '100%', backgroundColor: '#FFFFFF', borderRadius: 24, borderWidth: 3, borderColor: '#123924', padding: 24 }}>
            <Text style={{ fontFamily: 'Nunito_800ExtraBold', fontSize: 20, color: '#123924', textAlign: 'center', marginBottom: 12 }}>
              ☔ Pelindung Streak
            </Text>
            <Text style={{ fontFamily: 'Nunito_500Medium', fontSize: 16, color: '#5C5A4F', textAlign: 'center', marginBottom: 24, lineHeight: 24 }}>
              Nyalain lagi apimu kalau kamu lupa siram sehari. Dapet +1 tiap naik level!
            </Text>
            <Pressable
              onPress={() => setShowBadgeInfo(false)}
              style={({ pressed }) => [{
                backgroundColor: '#3FA86B', paddingVertical: 14, borderRadius: 999, borderWidth: 2, borderColor: '#123924', alignItems: 'center', boxShadow: '3px 3px 0px #123924'
              }, pressed && { transform: [{ translateY: 3 }, { translateX: 3 }], boxShadow: '0px 0px 0px #123924' }]}
            >
              <Text style={{ fontFamily: 'Nunito_800ExtraBold', fontSize: 16, color: '#FFFFFF' }}>Tutup</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal transparent visible={showRestorePopup} animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <View style={{ width: '100%', backgroundColor: '#FFFFFF', borderRadius: 24, borderWidth: 3, borderColor: '#123924', padding: 24 }}>
            <Text style={{ fontFamily: 'Nunito_800ExtraBold', fontSize: 24, color: '#123924', textAlign: 'center', marginBottom: 12 }}>
              Apinya Padam! 😱
            </Text>
            <Text style={{ fontFamily: 'Nunito_500Medium', fontSize: 16, color: '#5C5A4F', textAlign: 'center', marginBottom: 24, lineHeight: 24 }}>
              Kemarin kamu lupa siram tanaman ya? 😢 Tenang, kamu masih punya {userData?.pelindung_streak || 0} ☔ Pelindung. Mau pakai 1 buat nyalain apimu lagi?
            </Text>
            
            <View style={{ gap: 12 }}>
              <Pressable
                onPress={handleRestoreStreak}
                disabled={isRestoring}
                style={({ pressed }) => [{
                  backgroundColor: '#3FA86B', paddingVertical: 14, borderRadius: 999, borderWidth: 2, borderColor: '#123924', alignItems: 'center', boxShadow: '3px 3px 0px #123924'
                }, pressed && { transform: [{ translateY: 3 }, { translateX: 3 }], boxShadow: '0px 0px 0px #123924' }, isRestoring && { opacity: 0.7 }]}
              >
                {isRestoring ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={{ fontFamily: 'Nunito_800ExtraBold', fontSize: 16, color: '#FFFFFF' }}>☔ Pakai Pelindung</Text>
                )}
              </Pressable>
              
              <Pressable
                onPress={handleIgnoreRestore}
                disabled={isRestoring}
                style={{ paddingVertical: 14, alignItems: 'center' }}
              >
                <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: 16, color: '#FF6B5C' }}>Ikhlasin Aja</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

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
    width: 58,
    height: 58,
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
    fontSize: 14,
    color: "#5C5A4F",
    fontFamily: "Nunito_500Medium",
  },

  tanibotFab: {
    position: "absolute",
    bottom: 16,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#3FA86B",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#123924",
    boxShadow: "4px 4px 0px #123924",
    elevation: 8,
    zIndex: 50,
  },
  pressedFab: {
    boxShadow: "0px 0px 0px #123924",
    transform: [{ translateX: 4 }, { translateY: 4 }],
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
