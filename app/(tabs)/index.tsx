import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
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
import ProfileOnboardingModal from "../../components/dashboard/ProfileOnboardingModal";
import CoachMarkOverlay, { CoachMarkStep } from "../../components/CoachMarkOverlay";
import ErrorState from "../../components/ErrorState";
import { useNotification } from "../../components/NotificationContext";
import api from "../../services/api";
import { checkTutorialFinished, markTutorialFinished } from "../../utils/tutorial";
const FALLBACK_THUMB =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAK72N9bfUnTDR_qxCQtZfhdGFtdZeRDYs-OsNC2lUxmLLI86pKo2ugpOTvGWWwZL9sOkbzXCmRvMwHqent34F7rwvgUHge8_BFG9hN7iYc902WRQsddbBhE_9RiOVhij3iicG_BjbjGLfbqAgjgG9U9a64_nAsnjBQH2_AoUiMWgVBpRNDZeugVxjpYWAoqgIcNd6whl3ktEPbbtfIzxtMOHeRnbZXGuogESuoFy2lwMymfV81rGAUhA";

import { forwardRef } from 'react';
import { Image } from 'expo-image';
import FarmerScene from '../../components/FarmerScene';
import StatCard from '../../components/dashboard/StatCard';
import TaskCard from '../../components/dashboard/TaskCard';
import HarvestCard from '../../components/dashboard/HarvestCard';
import InfoCard from '../../components/dashboard/InfoCard';
import HeroCard from '../../components/dashboard/HeroCard';


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
  onCtaPress }, ref) => (
  <View
    ref={ref}
    style={{
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 24,
      paddingHorizontal: 16 }}
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
        marginBottom: 4 }}
    >
      {title}
    </Text>
    <Text
      style={{
        fontSize: 12,
        fontFamily: "Nunito_500Medium",
        color: "#5C5A4F",
        textAlign: "center" }}
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
          borderRadius: 100 }}
      >
        <Text
          style={{
            color: "#FFFFFF",
            fontSize: 12,
            fontFamily: "Nunito_700Bold" }}
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

  const boxStyles = { backgroundColor: '#E8E5DA' };
  const pillStyles = { backgroundColor: '#E8E5DA' };

  return (
    <Animated.View style={{ opacity: fadeAnim, paddingBottom: 140 }}>
      {/* SCENE SKELETON */}
      <View style={{ width: '100%', height: 280, backgroundColor: '#E8E5DA' }} />

      {/* STAT CARD SKELETON (Overlaps scene) */}
      <View style={{ marginHorizontal: 24, marginTop: -32, height: 80, borderRadius: 24, backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 }} />

      {/* HERO CARD SKELETON */}
      <View style={{ marginHorizontal: 24, marginTop: 16, height: 80, borderRadius: 24, backgroundColor: '#E8E5DA' }} />

      {/* TUGAS HARI INI SKELETON */}
      <View style={{ paddingHorizontal: 24, marginTop: 32 }}>
        <View style={{ width: 100, height: 24, borderRadius: 12, backgroundColor: '#E8E5DA', marginBottom: 16 }} />
        <View style={{ width: '100%', height: 76, borderRadius: 24, backgroundColor: '#E8E5DA', marginBottom: 12 }} />
        <View style={{ width: '100%', height: 76, borderRadius: 24, backgroundColor: '#E8E5DA', marginBottom: 32 }} />
      </View>

      {/* PANEN TERDEKAT SKELETON */}
      <View style={{ paddingHorizontal: 24 }}>
        <View style={{ width: 120, height: 24, borderRadius: 12, backgroundColor: '#E8E5DA', marginBottom: 16 }} />
        <View style={{ flexDirection: 'row', gap: 16 }}>
          <View style={{ width: 140, height: 160, borderRadius: 24, backgroundColor: '#E8E5DA' }} />
          <View style={{ width: 140, height: 160, borderRadius: 24, backgroundColor: '#E8E5DA' }} />
        </View>
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
  const [showProfilePopup, setShowProfilePopup] = useState(false);
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
                borderRadius: 24 },
              {
                rect: { x: results[1].x, y: results[1].y, width: results[1].w, height: results[1].h },
                title: "Tugas Hari Ini",
                description: "Semua tanaman yang butuh perhatianmu hari ini akan muncul di sini.",
                borderRadius: 24 },
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
                borderRadius: 24 },
              {
                rect: { 
                  x: 0, 
                  y: windowHeight - tabBarHeight, 
                  width: windowWidth, 
                  height: tabBarHeight 
                },
                title: "Navigasi Utama",
                description: "Pindah ke halaman lain seperti Tanaman, ChatBot, atau Komunitas lewat menu ini.",
                borderRadius: 0 },
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
      if (userData && userData.streak === 0 && (userData.exp || 0) > 0 && userData.pelindung_streak && userData.pelindung_streak >= 1) {
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

  const fetchDashboardData = async (isManualRefresh = false) => {
    if (tanamanList.length === 0 && !userData) {
      setIsLoading(true);
      setIsError(false);
    } else if (isManualRefresh) {
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
        tipeValidasi: "button_only" });
      if (response.data?.status === "success") {
        const d = response.data.data;
        setUserData((prev: any) => {
          if (!prev) return prev;
          const updated = { 
            ...prev, 
            exp: d.expSekarang !== undefined ? d.expSekarang : (prev.exp || 0) + (d.expDidapat || 0), 
            level: d.level !== undefined ? d.level : prev.level, 
            streak: d.streak !== undefined ? d.streak : prev.streak 
          };
          SecureStore.setItemAsync("userData", JSON.stringify(updated)).catch(console.error);
          return updated;
        });
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

  const upcomingHarvests = [...tanamanList].sort((a, b) => (a.sisaHariPanen ?? 999) - (b.sisaHariPanen ?? 999));
  
  const hasWateringTask = reminders.some(t => {
      const sudahValidasiHariIni = t.logTerakhir && new Date(t.logTerakhir.createdAt).toDateString() === new Date().toDateString();
      return t.statusPenyiraman === "PERLU_SIRAM" && !sudahValidasiHariIni;
  });
  const farmerState = weather?.kondisi === "HUJAN" || weather?.prediksiHujanHariIni ? 'raining' : (hasWateringTask ? 'needsWatering' : 'allClear');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FBF8F1' }} edges={["right", "bottom", "left"]}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[isLoading && { paddingHorizontal: 0, paddingTop: 0 }, { paddingBottom: 140 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => fetchDashboardData(true)} />}
      >
        {isLoading ? (
          <View style={{ padding: 24 }}><HomeSkeleton /></View>
        ) : isError ? (
          <ErrorState onRetry={() => fetchDashboardData(true)} />
        ) : (
          <>
            {/* 1. Header Scene */}
            <FarmerScene 
              userName={userData?.nama || "Petani"}
              avatarUrl={userData?.avatarUrl}
              weatherCondition={weather?.kondisi || 'CERAH'}
              temperature={weather?.suhu ? Math.round(weather.suhu) : 28}
              farmerState={farmerState}
            />

            {/* 2. Stat Card (Overlaps Scene) */}
            <View style={{ zIndex: 10 }}>
              <StatCard 
                userData={userData} 
                tanamanCount={tanamanList.length} 
                onBadgePress={() => setShowBadgeInfo(true)} 
              />
            </View>

            {/* Streak Hero Card (Restored) */}
            <HeroCard 
              streak={userData?.streak || 0} 
              onPress={() => setShowGamification(true)} 
            />

            {/* 3. Tugas Hari Ini */}
            <View style={{ paddingHorizontal: 24, marginTop: 32 }} ref={step2Ref}>
              <Text style={{ fontSize: 18, fontFamily: 'Nunito_800ExtraBold', color: '#1B4332', marginBottom: 16 }}>Hari ini</Text>
              
              {reminders.length === 0 ? (
                <EmptyHint
                  ref={step3Ref}
                  icon="emoji-emotions"
                  title="Semua beres!"
                  subtitle="Belum ada yang perlu disiram. Nikmati harimu!"
                />
              ) : (
                reminders.map((tanaman) => {
                  const sudahValidasiHariIni = tanaman.logTerakhir && new Date(tanaman.logTerakhir.createdAt).toDateString() === new Date().toDateString();
                  const isWateringTask = tanaman.statusPenyiraman === "PERLU_SIRAM" && !sudahValidasiHariIni;

                  return (
                    <TaskCard 
                      key={tanaman.id}
                      task={tanaman}
                      isWateringTask={isWateringTask}
                      onTaskPress={() => {
                        if (isWateringTask) {
                          handleLogAktivitas(tanaman.id);
                        } else {
                          router.push({ pathname: "/detail-tanaman", params: { id: tanaman.id } });
                        }
                      }}
                    />
                  );
                })
              )}
            </View>

            {/* 4. Panen Terdekat */}
            {upcomingHarvests.length > 0 && (
              <View style={{ marginTop: 24, paddingLeft: 24 }}>
                <Text style={{ fontSize: 18, fontFamily: 'Nunito_800ExtraBold', color: '#1B4332', marginBottom: 16 }}>Panen Terdekat</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 24, paddingBottom: 16 }}>
                  {upcomingHarvests.map(tanaman => (
                    <Pressable key={tanaman.id} onPress={() => router.push({ pathname: "/detail-tanaman", params: { id: tanaman.id } })}>
                      <HarvestCard task={tanaman} />
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* 5. Info Peta Wabah */}
            <View style={{ paddingHorizontal: 24, marginTop: 8 }}>
              <InfoCard onPress={() => router.push("/peta-hama" as any)} />
            </View>
          </>
        )}
      </ScrollView>

            <Modal visible={showGamification} animationType="slide" transparent={false}>
        <View style={{ flex: 1, backgroundColor: '#FBF8F0' }}>
          {/* HEADER */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingBottom: 16, paddingTop: 16 + insets.top,  backgroundColor: '#FFB627' }}>
            <View>
              <Text style={{ fontFamily: 'Nunito_800ExtraBold', fontSize: 24, color: '#123924' }}>Peta Perjalanan Tani</Text>
              <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: 14, color: '#123924' }}>Lv.{userData?.level || 1} • {userData?.streak || 0} Streak</Text>
            </View>
            <TouchableOpacity onPress={() => setShowGamification(false)} style={{ backgroundColor: '#FFECEB', padding: 8, borderRadius: 100 }}>
              <MaterialIcons name="close" size={24} color="#123924" />
            </TouchableOpacity>
          </View>

          {/* ROADMAP SCROLL */}
          <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>
            
            {/* LEVEL PROGRESS */}
            <View style={{ backgroundColor: '#FFFFFF', padding: 16, borderRadius: 16, marginBottom: 24 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={{ fontFamily: 'Nunito_800ExtraBold', fontSize: 14, color: '#123924' }}>Level Progress</Text>
                <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: 12, color: '#3FA86B' }}>
                  {(userData?.exp || 0) % 100} / 100 EXP
                </Text>
              </View>
              <View style={{ height: 16, backgroundColor: '#E8F5E9', borderRadius: 8, overflow: 'hidden' }}>
                <View style={{ width: `${(userData?.exp || 0) % 100}%`, height: '100%', backgroundColor: '#3FA86B', }} />
              </View>
              <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: 10, color: '#5C5A4F', marginTop: 8, textAlign: 'center' }}>
                Naikin level dengan rajin panen dan jaga streak harian!
              </Text>
            </View>

            {/* HEATMAP STREAK */}
            <View style={{ backgroundColor: '#E8F5E9', padding: 16, borderRadius: 16, marginBottom: 32 }}>
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
                        borderWidth: isStreak ? 2 : 0 }} 
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
                      borderWidth: 4, alignItems: 'center', justifyContent: 'center',
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
                      borderRadius: 16, opacity: isPassed ? 1 : 0.6
                    }}>
                      <Text style={{ fontFamily: 'Nunito_800ExtraBold', fontSize: 16, color: '#123924' }}>{item.title}</Text>
                      <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: 12, color: '#5C5A4F', marginTop: 4 }}>{item.desc}</Text>
                      {isCurrent && (
                        <View style={{ marginTop: 12, backgroundColor: '#FFB627', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 8, alignSelf: 'flex-start' }}>
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

      <ProfileOnboardingModal 
        isVisible={showProfilePopup}
        onClose={() => setShowProfilePopup(false)}
        onSuccess={(newUsername: string) => {
          setShowProfilePopup(false);
          setUserData((prev: any) => prev ? { ...prev, username: newUsername } : prev);
          showNotification("Cakep!", "Username lu berhasil disimpen.", "success");
        }}
      />

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
          <View style={{ width: '100%', backgroundColor: '#FFFFFF', borderRadius: 24, borderWidth: 0, shadowColor: '#123924', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.15, shadowRadius: 32, elevation: 10, padding: 24 }}>
            <Text style={{ fontFamily: 'Nunito_800ExtraBold', fontSize: 20, color: '#123924', textAlign: 'center', marginBottom: 12 }}>
              ☔ Pelindung Streak
            </Text>
            <Text style={{ fontFamily: 'Nunito_500Medium', fontSize: 16, color: '#5C5A4F', textAlign: 'center', marginBottom: 24, lineHeight: 24 }}>
              Nyalain lagi apimu kalau kamu lupa siram sehari. Dapet +1 tiap naik level!
            </Text>
            <Pressable
              onPress={() => setShowBadgeInfo(false)}
              style={({ pressed }) => [{
                backgroundColor: '#3FA86B', paddingVertical: 14, borderRadius: 999, borderWidth: 0, alignItems: 'center', shadowColor: '#123924', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3
              }, pressed && { transform: [{ scale: 0.96 }], shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 }]}
            >
              <Text style={{ fontFamily: 'Nunito_800ExtraBold', fontSize: 16, color: '#FFFFFF' }}>Tutup</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal transparent visible={showRestorePopup} animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <View style={{ width: '100%', backgroundColor: '#FFFFFF', borderRadius: 24, borderWidth: 0, shadowColor: '#123924', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.15, shadowRadius: 32, elevation: 10, padding: 24 }}>
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
                  backgroundColor: '#3FA86B', paddingVertical: 14, borderRadius: 999, borderWidth: 0, alignItems: 'center', shadowColor: '#123924', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3
                }, pressed && { transform: [{ scale: 0.96 }], shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 }, isRestoring && { opacity: 0.7 }]}
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
    backgroundColor: "#FBF8F0" },
  container: {
    flex: 1 },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 140,
    paddingTop: 16 },

  // Style animasi neobrutalism saat ditekan -> Diubah jadi scale (Clay style)
  pressedShadow4: {
    transform: [{ scale: 0.98 }],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2 },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FBF8F0" },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12 },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    borderWidth: 0,
    shadowColor: "#123924",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    alignItems: "center",
    justifyContent: "center" },
  greeting: {
    fontSize: 18,
    fontFamily: "Nunito_800ExtraBold",
    color: "#00522c" },
  subtitle: {
    fontSize: 14,
    color: "#5C5A4F",
    fontFamily: "Nunito_500Medium" },

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
    borderWidth: 0,
    shadowColor: "#3FA86B",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    zIndex: 50 },
  pressedFab: {
    transform: [{ scale: 0.95 }],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4 },
  logoutButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    borderWidth: 0,
    shadowColor: "#123924",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    alignItems: "center",
    justifyContent: "center" },
  heroCard: {
    backgroundColor: "#1F5C3D",
    borderRadius: 28,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 32,
    shadowColor: "#123924",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 6 },
  fireIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFB627",
    alignItems: "center",
    justifyContent: "center" },
  heroTextContainer: {
    flex: 1,
    marginLeft: 12 },
  heroTitle: {
    fontSize: 16,
    fontFamily: "Nunito_800ExtraBold",
    color: "#FFFFFF",
    marginBottom: 4 },
  heroSubtitle: {
    fontFamily: "Nunito_500Medium",
    fontSize: 12,
    color: "rgba(255,255,255,0.75)" },
  section: {
    marginBottom: 32 },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Nunito_700Bold",
    color: "#00522c",
    marginBottom: 16 },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16 },
  taskCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 0,
    borderRadius: 24,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#123924",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3 },
  taskIconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    borderWidth: 0,
    backgroundColor: "#F6F3EB",
    alignItems: "center",
    justifyContent: "center" },
  taskInfo: {
    flex: 1,
    marginLeft: 12 },
  taskName: {
    fontSize: 13,
    fontFamily: "Nunito_700Bold",
    color: "#123924",
    marginBottom: 4 },
  taskStatus: {
    fontFamily: "Nunito_500Medium",
    fontSize: 11,
    color: "#5C5A4F" },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 0,
    backgroundColor: "#F1EEE6",
    marginRight: 8,
    alignItems: "center",
    justifyContent: "center" },
  checkboxDoneCoral: {
    backgroundColor: "#FF6B5C" },
  checkboxDoneAmber: {
    backgroundColor: "#FFB627" },
  horizontalScroll: {
    gap: 16,
    paddingBottom: 8 },
  plantCard: {
    width: 140,
    backgroundColor: "#FFFFFF",
    borderWidth: 0,
    borderRadius: 24,
    overflow: "hidden",
    marginRight: 16,
    shadowColor: "#123924",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4 },
  plantImagePlaceholder: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: "#96d4ad" },
  plantCardBody: {
    padding: 12 },
  plantName: {
    fontSize: 12,
    fontFamily: "Nunito_700Bold",
    color: "#123924",
    marginBottom: 8 },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 100 },
  badgeText: {
    fontSize: 10,
    fontFamily: "Nunito_700Bold" } });
