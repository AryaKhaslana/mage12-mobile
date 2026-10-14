import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useRef, useState } from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  interpolate,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import Svg, { Circle, Ellipse, G, Path, Rect } from "react-native-svg";
import api from "../services/api";

const { width } = Dimensions.get("window");

// 4 Indikator Milestone Fase Bertani (Nol Emoji)
const MILESTONES = [
  { label: "Semai", threshold: 0 },
  { label: "Nutrisi", threshold: 28 },
  { label: "Tunas", threshold: 62 },
  { label: "Kebun Siap", threshold: 92 },
];

// Helper resolusi rute awal dengan prioritas akun login
const resolveInitialRoute = async (): Promise<string> => {
  try {
    // 1. Cek User Token terlebih dahulu (prioritas utama)
    const userToken = await SecureStore.getItemAsync("userToken");
    if (userToken) {
      // User sudah login -> cek setup profil & lokasi
      const userDataStr = await SecureStore.getItemAsync("userData");
      if (userDataStr) {
        try {
          const userData = JSON.parse(userDataStr);
          if (!userData.username) return "/(auth)/profile-setup";
          if (!userData.latitude) return "/(auth)/location-setup";
        } catch {}
      }
      // Sudah lengkap -> langsung masuk Beranda Kebun
      return "/(tabs)";
    }

    // 2. Jika belum login, baru cek status onboarding
    const hasSeenOnboarding = await AsyncStorage.getItem("hasSeenOnboarding");
    if (hasSeenOnboarding === "true") {
      return "/(auth)/login";
    }

    // 3. User baru yang belum pernah buka app sama sekali
    return "/onboarding";
  } catch (e) {
    console.error("Gagal mendeteksi rute awal:", e);
    return "/(tabs)";
  }
};

export default function IndexScreen() {
  const [statusText, setStatusText] = useState("Menabur benih harapan...");
  const [displayPercent, setDisplayPercent] = useState(0);

  // Gunakan Ref agar tidak terkena stale closure bug
  const targetRouteRef = useRef<string>("/(tabs)");
  const isNavigatingRef = useRef(false);
  const isSessionReadyRef = useRef(false);
  const hasTriggeredCompleteRef = useRef(false);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Animation Shared Values
  const screenOpacity = useSharedValue(1);
  const stageScale = useSharedValue(1);
  const bloomScale = useSharedValue(0.7);
  const bloomOpacity = useSharedValue(0);

  // Aura Matahari / Sun Glow
  const sunGlowScale = useSharedValue(0.65);
  const sunGlowOpacity = useSharedValue(0);

  // Tanah (Mound micro-bounce)
  const soilScaleY = useSharedValue(1);

  // Benih (Seed)
  const seedY = useSharedValue(-85);
  const seedRotation = useSharedValue(-40);
  const seedScale = useSharedValue(0.3);
  const seedOpacity = useSharedValue(0);

  // Tetesan Embun (Dew Drop) & Riak Air
  const dropY = useSharedValue(-60);
  const dropScaleY = useSharedValue(1.35);
  const dropScaleX = useSharedValue(0.85);
  const dropOpacity = useSharedValue(0);

  const ripple1Scale = useSharedValue(0.2);
  const ripple1Opacity = useSharedValue(0);
  const ripple2Scale = useSharedValue(0.1);
  const ripple2Opacity = useSharedValue(0);

  // Pertumbuhan Tunas & Daun
  const stemGrowth = useSharedValue(0);
  const stemSkew = useSharedValue(0);
  const leafScale = useSharedValue(0);
  const leafLeftRotate = useSharedValue(0);
  const leafRightRotate = useSharedValue(0);

  // Angin Sejuk Mengayun Tunas (Idle Breeze Sway)
  const breezeAngle = useSharedValue(0);

  // Partikel Emas / Pollen Sparkles
  const pollenY = useSharedValue(0);
  const pollenOpacity = useSharedValue(0);
  const pollenScale = useSharedValue(0);

  // Brand Header & Progress
  const brandOpacity = useSharedValue(0);
  const brandTranslateY = useSharedValue(18);
  const progressValue = useSharedValue(0);

  // 1. Eksekusi Background Setup & Silent Warmup (Smart Readiness Gate)
  useEffect(() => {
    let isMounted = true;

    const setupSession = async () => {
      try {
        const nextRoute = await resolveInitialRoute();
        if (isMounted) {
          targetRouteRef.current = nextRoute;
        }

        // Silent Preload jika targetnya adalah Beranda
        if (nextRoute === "/(tabs)") {
          const [weatherRes, tanamanRes] = await Promise.allSettled([
            api.get("/weather/today"),
            api.get("/tanaman"),
          ]);

          if (weatherRes.status === "fulfilled" && weatherRes.value?.data?.data) {
            await AsyncStorage.setItem(
              "dashboard_weather",
              JSON.stringify({ data: weatherRes.value.data.data, savedAt: Date.now() })
            );
          }
          if (tanamanRes.status === "fulfilled" && tanamanRes.value?.data?.data) {
            await AsyncStorage.setItem(
              "dashboard_tanaman",
              JSON.stringify(tanamanRes.value.data.data)
            );
          }
        }
      } catch (e) {
        console.error("Gagal mendeteksi rute awal atau preload:", e);
      } finally {
        if (isMounted) {
          isSessionReadyRef.current = true;
        }
      }
    };

    setupSession();

    return () => {
      isMounted = false;
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, []);

  const triggerLightHaptic = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
  };

  const triggerMediumHaptic = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
  };

  const navigateToFinalRoute = () => {
    if (isNavigatingRef.current) return;
    isNavigatingRef.current = true;
    const finalRoute = targetRouteRef.current || "/(tabs)";
    router.replace(finalRoute as any);
  };

  // Sinkronisasi 1:1 Persentase & Status Berdasarkan Nilai Progress Tunggal
  const updateProgressState = (pct: number) => {
    setDisplayPercent(pct);
    if (pct < 28) {
      setStatusText("Menabur benih harapan...");
    } else if (pct < 62) {
      setStatusText("Menyerap nutrisi embun...");
    } else if (pct < 92) {
      setStatusText("Tunas mekar segar...");
    } else if (pct < 100) {
      setStatusText("Menyiapkan kebun Anda...");
    } else {
      setStatusText("Selamat datang di TaniSync!");
    }
  };

  useAnimatedReaction(
    () => Math.min(100, Math.max(0, Math.round(progressValue.value * 100))),
    (currentPct, previousPct) => {
      if (currentPct !== previousPct) {
        runOnJS(updateProgressState)(currentPct);
      }
    }
  );

  // Transisi Keluar: Cincin Mekar (Bloom Ring), Stage Zoom-Through, dan Navigasi Halus
  const triggerCompletionEffect = () => {
    if (hasTriggeredCompleteRef.current) return;
    hasTriggeredCompleteRef.current = true;

    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}

    // Cincin Mekar Biomorphic
    bloomScale.value = withTiming(2.4, { duration: 420, easing: Easing.out(Easing.cubic) });
    bloomOpacity.value = withSequence(
      withTiming(0.75, { duration: 90 }),
      withTiming(0, { duration: 330 })
    );

    // Stage Zoom-Through Halus Masuk ke Beranda
    stageScale.value = withTiming(1.08, { duration: 360, easing: Easing.out(Easing.cubic) });

    // Fade Out Halus Layar
    screenOpacity.value = withDelay(
      180,
      withTiming(0, { duration: 260, easing: Easing.out(Easing.ease) }, (fadeDone) => {
        if (fadeDone) {
          runOnJS(navigateToFinalRoute)();
        }
      })
    );
  };

  const proceedToCompletion = () => {
    progressValue.value = withTiming(
      1,
      { duration: 320, easing: Easing.out(Easing.cubic) },
      (done) => {
        if (done) {
          runOnJS(triggerCompletionEffect)();
        }
      }
    );
  };

  const checkGateAndFinish = () => {
    if (isSessionReadyRef.current) {
      proceedToCompletion();
    } else {
      // Coasting perlahan di 88% - 93% sembari menunggu session siap
      progressValue.value = withTiming(0.93, { duration: 900, easing: Easing.linear });

      const startTime = Date.now();
      const MAX_WAIT_MS = 1400; // Maksimal batas waktu agar tidak pernah freeze

      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        if (isSessionReadyRef.current || elapsed >= MAX_WAIT_MS) {
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
          }
          proceedToCompletion();
        }
      }, 50);
    }
  };

  // 2. Koreografi Animasi Organik Terharmonisasi
  useEffect(() => {
    // AURA MATAHARI HANGAT (Fade-in lalu nafas halus berulang)
    sunGlowOpacity.value = withTiming(0.48, { duration: 650 });
    sunGlowScale.value = withSpring(1.08, { damping: 14, stiffness: 60 });
    sunGlowScale.value = withDelay(
      1100,
      withRepeat(
        withSequence(
          withTiming(1.18, { duration: 1600, easing: Easing.inOut(Easing.ease) }),
          withTiming(1.06, { duration: 1600, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      )
    );

    // FASE 1: BENIH JATUH BERPUTAR & MENDARAT DENGAN BOUNCE DI TANAH (0ms - 420ms)
    seedOpacity.value = withTiming(1, { duration: 150 });
    seedRotation.value = withSpring(0, { damping: 9, stiffness: 100 });
    seedScale.value = withSpring(1, { damping: 9, stiffness: 120 });
    seedY.value = withSpring(0, { damping: 8, stiffness: 110 }, (done) => {
      if (done) {
        runOnJS(triggerLightHaptic)();
      }
    });

    // Micro-squash pada tanah saat benih mendarat
    soilScaleY.value = withDelay(
      380,
      withSequence(
        withTiming(0.95, { duration: 60 }),
        withSpring(1.0, { damping: 9, stiffness: 120 })
      )
    );

    // FASE 2: TETESAN EMBUN JATUH TEPAT KE ATAS BENIH (420ms - 740ms)
    dropOpacity.value = withDelay(420, withTiming(1, { duration: 90 }));
    dropScaleY.value = withDelay(420, withTiming(1.28, { duration: 300 }));
    dropScaleX.value = withDelay(420, withTiming(0.85, { duration: 300 }));
    dropY.value = withDelay(
      420,
      withTiming(0, { duration: 320, easing: Easing.in(Easing.cubic) }, (done) => {
        if (done) {
          dropOpacity.value = withTiming(0, { duration: 40 });
          runOnJS(triggerLightHaptic)();

          // Benih menyerap air embun: membesar sedikit lalu meresap ke dalam tanah
          seedScale.value = withSequence(
            withTiming(1.18, { duration: 70 }),
            withTiming(0, { duration: 200, easing: Easing.in(Easing.ease) })
          );
          seedOpacity.value = withDelay(80, withTiming(0, { duration: 180 }));

          // Riak Air Konsentris Meluas di Permukaan Tanah
          ripple1Scale.value = withTiming(2.6, { duration: 480, easing: Easing.out(Easing.ease) });
          ripple1Opacity.value = withSequence(
            withTiming(0.85, { duration: 50 }),
            withTiming(0, { duration: 430 })
          );

          ripple2Scale.value = withDelay(
            70,
            withTiming(3.0, { duration: 500, easing: Easing.out(Easing.ease) })
          );
          ripple2Opacity.value = withDelay(
            70,
            withSequence(withTiming(0.55, { duration: 50 }), withTiming(0, { duration: 450 }))
          );
        }
      })
    );

    // FASE 3: TUNAS BERTUMBUH & DAUN MEKAR ELASTIS (740ms - 1300ms)
    stemGrowth.value = withDelay(740, withSpring(1, { damping: 11, stiffness: 95 }));
    stemSkew.value = withDelay(
      740,
      withSequence(withTiming(1, { duration: 280 }), withTiming(0, { duration: 240 }))
    );

    // Daun mekar elastis tepat saat batang mencapai puncak
    leafScale.value = withDelay(940, withSpring(1, { damping: 9, stiffness: 125 }));
    leafLeftRotate.value = withDelay(940, withSpring(-36, { damping: 8, stiffness: 115 }));
    leafRightRotate.value = withDelay(940, withSpring(36, { damping: 8, stiffness: 115 }));

    // Partikel Emas / Pollen meledak lembut ke udara
    pollenOpacity.value = withDelay(
      980,
      withSequence(withTiming(1, { duration: 180 }), withTiming(0, { duration: 480 }))
    );
    pollenScale.value = withDelay(980, withSpring(1.25, { damping: 8, stiffness: 130 }));
    pollenY.value = withDelay(
      980,
      withTiming(-42, { duration: 640, easing: Easing.out(Easing.cubic) }, (done) => {
        if (done) {
          runOnJS(triggerMediumHaptic)();
        }
      })
    );

    // FASE 4: ANGIN SEJUK PAGI MENGAYUN TUNAS (1250ms onwards)
    breezeAngle.value = withDelay(
      1250,
      withRepeat(
        withSequence(
          withTiming(2.4, { duration: 1200, easing: Easing.inOut(Easing.quad) }),
          withTiming(-2.4, { duration: 1400, easing: Easing.inOut(Easing.quad) }),
          withTiming(0, { duration: 1100, easing: Easing.inOut(Easing.quad) })
        ),
        -1,
        true
      )
    );

    // FASE 5: BRAND IDENTITY SLIDE UP (650ms)
    brandOpacity.value = withDelay(650, withTiming(1, { duration: 450 }));
    brandTranslateY.value = withDelay(650, withSpring(0, { damping: 12, stiffness: 105 }));

    // FASE 6: SMART READINESS GATE PROGRESS (0% -> 88% -> 100%)
    progressValue.value = withDelay(
      220,
      withTiming(
        0.88,
        { duration: 1350, easing: Easing.bezier(0.25, 0.1, 0.25, 1) },
        (reachedGate) => {
          if (reachedGate) {
            runOnJS(checkGateAndFinish)();
          }
        }
      )
    );

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, []);

  // Animated Styles
  const screenStyle = useAnimatedStyle(() => ({
    opacity: screenOpacity.value,
  }));

  const sunGlowStyle = useAnimatedStyle(() => ({
    opacity: sunGlowOpacity.value,
    transform: [{ scale: sunGlowScale.value }],
  }));

  const soilStyle = useAnimatedStyle(() => ({
    transform: [{ scaleY: soilScaleY.value }],
  }));

  const seedStyle = useAnimatedStyle(() => ({
    opacity: seedOpacity.value,
    transform: [
      { translateY: seedY.value },
      { rotate: `${seedRotation.value}deg` },
      { scale: seedScale.value },
    ],
  }));

  const dropStyle = useAnimatedStyle(() => ({
    opacity: dropOpacity.value,
    transform: [
      { translateY: dropY.value },
      { scaleY: dropScaleY.value },
      { scaleX: dropScaleX.value },
    ],
  }));

  const ripple1Style = useAnimatedStyle(() => ({
    opacity: ripple1Opacity.value,
    transform: [{ scale: ripple1Scale.value }],
  }));

  const ripple2Style = useAnimatedStyle(() => ({
    opacity: ripple2Opacity.value,
    transform: [{ scale: ripple2Scale.value }],
  }));

  const sproutWaverStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${breezeAngle.value}deg` }],
  }));

  const stemStyle = useAnimatedStyle(() => ({
    transform: [
      { scaleY: stemGrowth.value },
      { skewX: `${interpolate(stemSkew.value, [0, 1], [0, 3.5])}deg` },
    ],
  }));

  const leafClusterStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(stemGrowth.value, [0, 1], [46, 0]) },
    ],
  }));

  const leafLeftStyle = useAnimatedStyle(() => ({
    opacity: interpolate(leafScale.value, [0, 0.15, 1], [0, 1, 1]),
    transform: [
      { scale: leafScale.value },
      { rotate: `${leafLeftRotate.value}deg` },
    ],
  }));

  const leafRightStyle = useAnimatedStyle(() => ({
    opacity: interpolate(leafScale.value, [0, 0.15, 1], [0, 1, 1]),
    transform: [
      { scale: leafScale.value },
      { rotate: `${leafRightRotate.value}deg` },
    ],
  }));

  const pollenStyle = useAnimatedStyle(() => ({
    opacity: pollenOpacity.value,
    transform: [
      { translateY: pollenY.value },
      { scale: pollenScale.value },
    ],
  }));

  const bloomStyle = useAnimatedStyle(() => ({
    opacity: bloomOpacity.value,
    transform: [{ scale: bloomScale.value }],
  }));

  const stageStyle = useAnimatedStyle(() => ({
    transform: [{ scale: stageScale.value }],
  }));

  const brandStyle = useAnimatedStyle(() => ({
    opacity: brandOpacity.value,
    transform: [{ translateY: brandTranslateY.value }],
  }));

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressValue.value * 100}%`,
  }));

  return (
    <Animated.View style={[styles.container, screenStyle]}>
      {/* 1. STAGE ANIMASI TUMBUH KEMBANG (DENGAN ZOOM-THROUGH HALUS) */}
      <Animated.View style={[styles.stageContainer, stageStyle]}>
        {/* Cincin Mekar (Bloom Ring) saat 100% Siap */}
        <Animated.View style={[styles.bloomRing, bloomStyle]} pointerEvents="none">
          <Svg width={240} height={240} viewBox="0 0 240 240">
            <Circle cx="120" cy="120" r="92" stroke="#3FA86B" strokeWidth={3} fill="none" opacity={0.65} />
            <Circle cx="120" cy="120" r="70" stroke="#86EFAC" strokeWidth={2} fill="none" opacity={0.45} />
          </Svg>
        </Animated.View>

        {/* Aura Matahari Lembut */}
        <Animated.View style={[styles.sunGlow, sunGlowStyle]}>
          <Svg width={200} height={200} viewBox="0 0 200 200">
            <Circle cx="100" cy="100" r="88" fill="#FEF08A" opacity={0.25} />
            <Circle cx="100" cy="100" r="62" fill="#FDE047" opacity={0.35} />
            <Circle cx="100" cy="100" r="40" fill="#FACC15" opacity={0.45} />
          </Svg>
        </Animated.View>

        {/* Tetesan Embun Biru Segar */}
        <Animated.View style={[styles.dewDrop, dropStyle]}>
          <Svg width={22} height={26} viewBox="0 0 22 26">
            <Path
              d="M11 2 C9 7 5 13 5 18 C5 22 7.8 24.5 11 24.5 C14.2 24.5 17 22 17 18 C17 13 13 7 11 2 Z"
              fill="#0EA5E9"
            />
            {/* Kilau putih pada tetesan air */}
            <Ellipse cx="8.5" cy="16" rx="2" ry="4" fill="#FFFFFF" opacity={0.75} />
          </Svg>
        </Animated.View>

        {/* Riak Air Ganda (Double Ripple) */}
        <Animated.View style={[styles.rippleRing, styles.ripplePrimary, ripple1Style]} />
        <Animated.View style={[styles.rippleRing, styles.rippleSecondary, ripple2Style]} />

        {/* Biji Benih Cokelat Emas */}
        <Animated.View style={[styles.seedView, seedStyle]}>
          <Svg width={28} height={28} viewBox="0 0 28 28">
            <Path
              d="M14 3 C9 9 6 18 11 23 C15 26 21 24 23 19 C25 14 20 6 14 3 Z"
              fill="#854D0E"
              stroke="#451A03"
              strokeWidth={1.8}
            />
            {/* Garis tekstur kilau benih */}
            <Path
              d="M13 8 Q17 14 15 20"
              stroke="#FDE68A"
              strokeWidth={1.8}
              strokeLinecap="round"
              fill="none"
              opacity={0.85}
            />
          </Svg>
        </Animated.View>

        {/* Tanaman Mekar & Mengayun Sejuk */}
        <View style={styles.plantContainer}>
          <Animated.View style={[styles.sproutWaver, sproutWaverStyle]}>
            {/* Batang Lengkung Segar */}
            <Animated.View style={[styles.stemWrapper, stemStyle]}>
              <Svg width={16} height={52} viewBox="0 0 16 52">
                <Path
                  d="M8 52 Q6 26 8 2"
                  stroke="#15803D"
                  strokeWidth={5}
                  strokeLinecap="round"
                  fill="none"
                />
                <Path
                  d="M8 52 Q7 26 8 4"
                  stroke="#22C55E"
                  strokeWidth={2}
                  strokeLinecap="round"
                  fill="none"
                  opacity={0.8}
                />
              </Svg>
            </Animated.View>

            {/* Klaster Daun yang Terangkat Naik Bersama Pucuk Batang */}
            <Animated.View style={[styles.leafCluster, leafClusterStyle]}>
              {/* Daun Kiri (Hijau Zamrud dengan urat daun cerah) */}
              <Animated.View style={[styles.leafLeft, leafLeftStyle]}>
                <Svg width={36} height={26} viewBox="0 0 36 26">
                  <Path
                    d="M34 24 C22 22 6 15 2 4 C12 2 26 8 34 24 Z"
                    fill="#16A34A"
                    stroke="#14532D"
                    strokeWidth={1.8}
                  />
                  <Path
                    d="M32 22 C24 17 15 12 8 6"
                    stroke="#4ADE80"
                    strokeWidth={1.4}
                    strokeLinecap="round"
                    fill="none"
                    opacity={0.85}
                  />
                </Svg>
              </Animated.View>

              {/* Daun Kanan (Hijau Cerah Segar) */}
              <Animated.View style={[styles.leafRight, leafRightStyle]}>
                <Svg width={38} height={28} viewBox="0 0 38 28">
                  <Path
                    d="M2 26 C15 24 30 16 35 4 C25 2 11 9 2 26 Z"
                    fill="#22C55E"
                    stroke="#15803D"
                    strokeWidth={1.8}
                  />
                  <Path
                    d="M4 24 C14 20 24 13 30 6"
                    stroke="#BBF7D0"
                    strokeWidth={1.4}
                    strokeLinecap="round"
                    fill="none"
                    opacity={0.85}
                  />
                </Svg>
              </Animated.View>

              {/* Partikel Emas / Pollen Sparkles Melayang di Atas Pucuk */}
              <Animated.View style={[styles.pollenCluster, pollenStyle]}>
                <Svg width={74} height={52} viewBox="0 0 74 52">
                  <Circle cx="16" cy="14" r="3.2" fill="#FBBF24" />
                  <Circle cx="58" cy="12" r="2.8" fill="#F59E0B" />
                  <Circle cx="37" cy="5" r="3.2" fill="#FDE047" />
                  <Circle cx="25" cy="24" r="2.2" fill="#FCD34D" />
                  <Circle cx="49" cy="20" r="2.2" fill="#FDE68A" />
                  <Circle cx="37" cy="40" r="1.8" fill="#F59E0B" />
                </Svg>
              </Animated.View>
            </Animated.View>
          </Animated.View>
        </View>

        {/* Gundukan Tanah Subur (Layered Neobrutalism Earth) */}
        <Animated.View style={[styles.soilLayer, soilStyle]}>
          <Svg width={200} height={46} viewBox="0 0 200 46">
            {/* Dasar Tanah Cokelat Gelap */}
            <Path
              d="M10 34 Q100 12 190 34 L190 46 L10 46 Z"
              fill="#451A03"
              stroke="#123924"
              strokeWidth={2}
            />
            {/* Lapisan Humus Subur */}
            <Path
              d="M12 32 Q100 14 188 32 L188 40 L12 40 Z"
              fill="#78350F"
            />
            {/* Garis Rumput Segar */}
            <Path
              d="M16 30 Q100 13 184 30"
              stroke="#16A34A"
              strokeWidth={3.5}
              strokeLinecap="round"
              fill="none"
            />
            {/* Tunas Rumput Halus di Sisi Kiri */}
            <Path
              d="M36 28 Q38 21 42 26"
              stroke="#22C55E"
              strokeWidth={1.8}
              strokeLinecap="round"
              fill="none"
            />
            {/* Tunas Rumput Halus di Sisi Kanan */}
            <Path
              d="M158 28 Q161 21 164 26"
              stroke="#22C55E"
              strokeWidth={1.8}
              strokeLinecap="round"
              fill="none"
            />
          </Svg>
        </Animated.View>
      </Animated.View>

      {/* 2. BRAND IDENTITAS TANISYNC (MURNI TIPOGRAFI, NO EMOJI) */}
      <Animated.View style={[styles.brandContainer, brandStyle]}>
        <View style={styles.brandTitleRow}>
          <Text style={styles.brandTitle}>TaniSync</Text>
          <View style={styles.titleDot} />
        </View>
        <Text style={styles.brandSubtitle}>SMART FARMING & WEATHER PLATFORM</Text>
      </Animated.View>

      {/* 3. CAPSULE PROGRESS BAR & STATUS */}
      <View style={styles.progressSection}>
        <View style={styles.progressCapsuleTrack}>
          <Animated.View style={[styles.progressCapsuleFill, progressStyle]}>
            <View style={styles.capsuleGloss} />
          </Animated.View>
        </View>

        <View style={styles.progressInfoRow}>
          <Text style={styles.statusLabel}>{statusText}</Text>
          <Text style={styles.percentText}>{displayPercent}%</Text>
        </View>

        {/* 4 INDIKATOR MILESTONE FASE BERTANI */}
        <View style={styles.milestoneRow}>
          {MILESTONES.map((m, idx) => {
            const isPassed = displayPercent >= m.threshold;
            const isCurrent =
              isPassed &&
              (idx === MILESTONES.length - 1 || displayPercent < MILESTONES[idx + 1].threshold);

            return (
              <View key={m.label} style={styles.milestoneItem}>
                <View
                  style={[
                    styles.milestoneDot,
                    isPassed && styles.milestoneDotPassed,
                    isCurrent && styles.milestoneDotCurrent,
                  ]}
                />
                <Text
                  style={[
                    styles.milestoneText,
                    isPassed && styles.milestoneTextPassed,
                    isCurrent && styles.milestoneTextCurrent,
                  ]}
                >
                  {m.label}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FBF8F0", // Warm cream Neobrutalism khas TaniSync
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 28,
  },
  stageContainer: {
    width: 220,
    height: 190,
    alignItems: "center",
    justifyContent: "flex-end",
    position: "relative",
  },
  sunGlow: {
    position: "absolute",
    top: -15,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  dewDrop: {
    position: "absolute",
    bottom: 24,
    alignItems: "center",
    zIndex: 10,
  },
  rippleRing: {
    position: "absolute",
    bottom: 22,
    width: 38,
    height: 18,
    borderRadius: 18,
    borderWidth: 2,
    zIndex: 4,
  },
  ripplePrimary: {
    borderColor: "#0EA5E9",
  },
  rippleSecondary: {
    borderColor: "#38BDF8",
  },
  seedView: {
    position: "absolute",
    bottom: 24,
    alignItems: "center",
    zIndex: 6,
  },
  plantContainer: {
    position: "absolute",
    bottom: 24,
    alignItems: "center",
    justifyContent: "flex-end",
    width: 120,
    height: 94,
    zIndex: 8,
  },
  sproutWaver: {
    alignItems: "center",
    justifyContent: "flex-end",
    width: 120,
    height: 94,
    transformOrigin: "bottom center",
  },
  stemWrapper: {
    position: "absolute",
    bottom: 0,
    alignItems: "center",
    transformOrigin: "bottom center",
  },
  leafCluster: {
    position: "absolute",
    bottom: 42,
    width: 110,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
  },
  leafLeft: {
    position: "absolute",
    right: "50%",
    bottom: 4,
    transformOrigin: "bottom right",
  },
  leafRight: {
    position: "absolute",
    left: "50%",
    bottom: 4,
    transformOrigin: "bottom left",
  },
  pollenCluster: {
    position: "absolute",
    top: -24,
    alignItems: "center",
    justifyContent: "center",
  },
  soilLayer: {
    alignItems: "center",
    zIndex: 5,
    transformOrigin: "bottom center",
  },
  brandContainer: {
    alignItems: "center",
    marginTop: 26,
    marginBottom: 32,
  },
  brandTitleRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 3,
  },
  brandTitle: {
    fontSize: 34,
    fontFamily: "Nunito_800ExtraBold",
    color: "#123924", // Dark Forest Green
    letterSpacing: -0.6,
  },
  titleDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#3FA86B", // Dot aksen hijau cerah
    marginBottom: 4,
  },
  brandSubtitle: {
    fontSize: 11,
    fontFamily: "Nunito_700Bold",
    color: "#52796F",
    letterSpacing: 1.5,
    marginTop: 4,
  },
  progressSection: {
    width: width * 0.72,
    maxWidth: 260,
    alignItems: "center",
  },
  progressCapsuleTrack: {
    width: "100%",
    height: 12,
    backgroundColor: "#E8E5DA",
    borderRadius: 14,
    borderWidth: 1.8,
    borderColor: "#123924",
    overflow: "hidden",
    shadowColor: "#123924",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  progressCapsuleFill: {
    height: "100%",
    backgroundColor: "#3FA86B", // Fresh Agriculture Green
    borderRadius: 10,
    overflow: "hidden",
  },
  capsuleGloss: {
    height: 3,
    backgroundColor: "#86EFAC",
    opacity: 0.65,
    borderRadius: 2,
    marginHorizontal: 3,
    marginTop: 1.5,
  },
  progressInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginTop: 10,
  },
  statusLabel: {
    fontSize: 12,
    fontFamily: "Nunito_500Medium",
    color: "#2D4A3E",
  },
  percentText: {
    fontSize: 12,
    fontFamily: "Nunito_800ExtraBold",
    color: "#123924",
  },
  bloomRing: {
    position: "absolute",
    bottom: -15,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  milestoneRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginTop: 14,
    paddingHorizontal: 2,
  },
  milestoneItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  milestoneDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#D8D5CB",
  },
  milestoneDotPassed: {
    backgroundColor: "#3FA86B",
  },
  milestoneDotCurrent: {
    backgroundColor: "#16A34A",
    transform: [{ scale: 1.3 }],
  },
  milestoneText: {
    fontSize: 10,
    fontFamily: "Nunito_700Bold",
    color: "#8C897E",
  },
  milestoneTextPassed: {
    color: "#2D4A3E",
  },
  milestoneTextCurrent: {
    fontFamily: "Nunito_800ExtraBold",
    color: "#123924",
  },
});
