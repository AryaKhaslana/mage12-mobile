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
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import Svg, { Circle, Ellipse, G, Path, Rect } from "react-native-svg";
import api from "../services/api";

const { width } = Dimensions.get("window");

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

  // Animation Shared Values
  const screenOpacity = useSharedValue(1);

  // Aura Matahari / Sun Glow
  const sunGlowScale = useSharedValue(0.6);
  const sunGlowOpacity = useSharedValue(0);

  // Benih (Seed)
  const seedY = useSharedValue(-80);
  const seedRotation = useSharedValue(-40);
  const seedScale = useSharedValue(0.3);
  const seedOpacity = useSharedValue(0);

  // Tetesan Embun (Dew Drop) & Riak Air
  const dropY = useSharedValue(-50);
  const dropScaleY = useSharedValue(1.4);
  const dropOpacity = useSharedValue(0);
  const ripple1Scale = useSharedValue(0.2);
  const ripple1Opacity = useSharedValue(0);
  const ripple2Scale = useSharedValue(0.1);
  const ripple2Opacity = useSharedValue(0);

  // Pertumbuhan Tunas & Daun
  const stemHeight = useSharedValue(0);
  const stemCurve = useSharedValue(0);
  const leafLeftScale = useSharedValue(0);
  const leafLeftRotate = useSharedValue(-45);
  const leafRightScale = useSharedValue(0);
  const leafRightRotate = useSharedValue(45);

  // Partikel Emas / Pollen Sparkles
  const pollenY = useSharedValue(0);
  const pollenOpacity = useSharedValue(0);
  const pollenScale = useSharedValue(0);

  // Brand Header & Progress
  const brandOpacity = useSharedValue(0);
  const brandTranslateY = useSharedValue(20);
  const progressValue = useSharedValue(0);

  // 1. Eksekusi Background Setup & Silent Warmup
  useEffect(() => {
    let isMounted = true;

    const setupSession = async () => {
      const nextRoute = await resolveInitialRoute();
      if (isMounted) {
        targetRouteRef.current = nextRoute;
      }

      // Silent Preload jika targetnya adalah Beranda
      if (nextRoute === "/(tabs)") {
        try {
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
        } catch {
          // Preload fail-safe
        }
      }
    };

    setupSession();

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Sequence Animasi 100x Lebih Keren
  useEffect(() => {
    // AURA MATAHARI HANGAT
    sunGlowOpacity.value = withTiming(0.45, { duration: 600 });
    sunGlowScale.value = withSpring(1.1, { damping: 14, stiffness: 60 });

    // FASE 1: BENIH JATUH BERPUTAR DENGAN HAPTIC (0.0s - 0.4s)
    seedOpacity.value = withTiming(1, { duration: 150 });
    seedRotation.value = withSpring(0, { damping: 9, stiffness: 100 });
    seedScale.value = withSpring(1, { damping: 9, stiffness: 120 });
    seedY.value = withSpring(0, { damping: 8, stiffness: 110 }, (done) => {
      if (done) {
        runOnJS(triggerLightHaptic)();
      }
    });

    // FASE 2: TETESAN EMBUN JATUH & RIAK AIR GANDA (0.35s - 0.8s)
    dropOpacity.value = withDelay(380, withTiming(1, { duration: 100 }));
    dropScaleY.value = withDelay(380, withTiming(1.2, { duration: 280 }));
    dropY.value = withDelay(
      380,
      withTiming(0, { duration: 300, easing: Easing.in(Easing.cubic) }, (done) => {
        if (done) {
          dropOpacity.value = withTiming(0, { duration: 60 });
          // Riak 1
          ripple1Scale.value = withTiming(2.4, { duration: 450, easing: Easing.out(Easing.ease) });
          ripple1Opacity.value = withSequence(
            withTiming(0.9, { duration: 60 }),
            withTiming(0, { duration: 390 })
          );
          // Riak 2 (Konsentris bertahap)
          ripple2Scale.value = withDelay(80, withTiming(2.8, { duration: 480, easing: Easing.out(Easing.ease) }));
          ripple2Opacity.value = withDelay(
            80,
            withSequence(withTiming(0.6, { duration: 60 }), withTiming(0, { duration: 420 }))
          );
        }
      })
    );

    const timer1 = setTimeout(() => {
      setStatusText("Menyerap nutrisi embun...");
      setDisplayPercent(35);
    }, 450);

    // FASE 3: TUNAS TUMBUH & DAUN MEKAR ELASTIS (0.75s - 1.35s)
    stemHeight.value = withDelay(750, withSpring(1, { damping: 10, stiffness: 90 }));
    stemCurve.value = withDelay(750, withSequence(withTiming(1, { duration: 300 }), withTiming(0, { duration: 250 })));

    leafLeftScale.value = withDelay(900, withSpring(1, { damping: 8, stiffness: 120 }));
    leafLeftRotate.value = withDelay(900, withSpring(0, { damping: 8, stiffness: 120 }));

    leafRightScale.value = withDelay(1000, withSpring(1, { damping: 8, stiffness: 120 }));
    leafRightRotate.value = withDelay(1000, withSpring(0, { damping: 8, stiffness: 120 }));

    // Partikel Emas / Pollen naik ke atas
    pollenOpacity.value = withDelay(1050, withSequence(withTiming(1, { duration: 200 }), withTiming(0, { duration: 450 })));
    pollenScale.value = withDelay(1050, withSpring(1.2, { damping: 8, stiffness: 140 }));
    pollenY.value = withDelay(1050, withTiming(-35, { duration: 600, easing: Easing.out(Easing.cubic) }, (done) => {
      if (done) {
        runOnJS(triggerMediumHaptic)();
      }
    }));

    const timer2 = setTimeout(() => {
      setStatusText("Tunas mekar segar...");
      setDisplayPercent(75);
    }, 950);

    // FASE 4: BRAND LOGO ELEGAN & SULUR PROGRESS BAR MERAMBAT (0.8s - 1.8s)
    brandOpacity.value = withDelay(850, withTiming(1, { duration: 400 }));
    brandTranslateY.value = withDelay(850, withSpring(0, { damping: 12, stiffness: 110 }));

    progressValue.value = withDelay(
      300,
      withTiming(1, { duration: 1500, easing: Easing.bezier(0.2, 0.8, 0.25, 1) }, (completed) => {
        if (completed) {
          runOnJS(setStatusText)("Selamat datang di TaniSync!");
          runOnJS(setDisplayPercent)(100);

          // FADE OUT HALUS MENUJU RUTE TUJUAN
          screenOpacity.value = withDelay(
            220,
            withTiming(0, { duration: 280, easing: Easing.out(Easing.ease) }, (fadeDone) => {
              if (fadeDone) {
                runOnJS(navigateToFinalRoute)();
              }
            })
          );
        }
      })
    );

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
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

  // Animated Styles
  const screenStyle = useAnimatedStyle(() => ({
    opacity: screenOpacity.value,
  }));

  const sunGlowStyle = useAnimatedStyle(() => ({
    opacity: sunGlowOpacity.value,
    transform: [{ scale: sunGlowScale.value }],
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

  const stemStyle = useAnimatedStyle(() => ({
    transform: [
      { scaleY: stemHeight.value },
      { skewX: `${interpolate(stemCurve.value, [0, 1], [0, 4])}deg` },
    ],
  }));

  const leafLeftStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: leafLeftScale.value },
      { rotate: `${leafLeftRotate.value}deg` },
    ],
  }));

  const leafRightStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: leafRightScale.value },
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

  const brandStyle = useAnimatedStyle(() => ({
    opacity: brandOpacity.value,
    transform: [{ translateY: brandTranslateY.value }],
  }));

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressValue.value * 100}%`,
  }));

  return (
    <Animated.View style={[styles.container, screenStyle]}>
      {/* 1. STAGE ANIMASI TUMBUH KEMBANG */}
      <View style={styles.stageContainer}>
        {/* Aura Matahari Lembut */}
        <Animated.View style={[styles.sunGlow, sunGlowStyle]}>
          <Svg width={180} height={180} viewBox="0 0 180 180">
            <Circle cx="90" cy="90" r="75" fill="#FEF08A" opacity={0.35} />
            <Circle cx="90" cy="90" r="50" fill="#FDE047" opacity={0.45} />
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
            <Ellipse cx="8.5" cy="16" rx="2" ry="4" fill="#FFFFFF" opacity={0.7} />
          </Svg>
        </Animated.View>

        {/* Riak Air Ganda (Double Ripple) */}
        <Animated.View style={[styles.rippleRing, styles.ripplePrimary, ripple1Style]} />
        <Animated.View style={[styles.rippleRing, styles.rippleSecondary, ripple2Style]} />

        {/* Biji Benih Cokelat Emas */}
        <Animated.View style={[styles.seedView, seedStyle]}>
          <Svg width={30} height={30} viewBox="0 0 30 30">
            <Path
              d="M15 4 C10 11 7 20 12 25 C16 28 23 26 25 20 C27 15 21 7 15 4 Z"
              fill="#92400E"
              stroke="#451A03"
              strokeWidth={1.8}
            />
            {/* Garis tekstur benih berkilau */}
            <Path
              d="M14 9 Q18 16 16 22"
              stroke="#FDE68A"
              strokeWidth={1.8}
              strokeLinecap="round"
              fill="none"
              opacity={0.85}
            />
          </Svg>
        </Animated.View>

        {/* Tanaman Mekar */}
        <View style={styles.plantContainer}>
          {/* Batang Lengkung Segar */}
          <Animated.View style={[styles.stemWrapper, stemStyle]}>
            <Svg width={14} height={48} viewBox="0 0 14 48">
              <Path
                d="M7 48 Q5 24 7 2"
                stroke="#15803D"
                strokeWidth={5}
                strokeLinecap="round"
                fill="none"
              />
              <Path
                d="M7 48 Q6 24 7 4"
                stroke="#22C55E"
                strokeWidth={2}
                strokeLinecap="round"
                fill="none"
                opacity={0.7}
              />
            </Svg>
          </Animated.View>

          {/* Daun Kiri (Hijau Zamrud dengan urat daun) */}
          <Animated.View style={[styles.leafLeft, leafLeftStyle]}>
            <Svg width={34} height={24} viewBox="0 0 34 24">
              <Path
                d="M32 22 C20 20 6 13 2 4 C11 2 24 8 32 22 Z"
                fill="#16A34A"
                stroke="#14532D"
                strokeWidth={1.8}
              />
              <Path
                d="M30 20 C22 16 14 11 8 6"
                stroke="#4ADE80"
                strokeWidth={1.2}
                fill="none"
                opacity={0.8}
              />
            </Svg>
          </Animated.View>

          {/* Daun Kanan (Hijau Cerah Segar) */}
          <Animated.View style={[styles.leafRight, leafRightStyle]}>
            <Svg width={36} height={26} viewBox="0 0 36 26">
              <Path
                d="M2 24 C14 22 28 15 33 4 C24 2 10 9 2 24 Z"
                fill="#22C55E"
                stroke="#15803D"
                strokeWidth={1.8}
              />
              <Path
                d="M4 22 C13 18 22 12 28 6"
                stroke="#BBF7D0"
                strokeWidth={1.2}
                fill="none"
                opacity={0.8}
              />
            </Svg>
          </Animated.View>

          {/* Partikel Emas / Pollen Sparkles yang Melayang */}
          <Animated.View style={[styles.pollenCluster, pollenStyle]}>
            <Svg width={70} height={50} viewBox="0 0 70 50">
              <Circle cx="15" cy="12" r="3.2" fill="#FBBF24" />
              <Circle cx="55" cy="10" r="2.8" fill="#F59E0B" />
              <Circle cx="35" cy="4" r="3" fill="#FDE047" />
              <Circle cx="24" cy="22" r="2" fill="#FCD34D" />
              <Circle cx="46" cy="18" r="2" fill="#FDE68A" />
            </Svg>
          </Animated.View>
        </View>

        {/* Gundukan Tanah Subur (Layered Neobrutalism Earth) */}
        <View style={styles.soilLayer}>
          <Svg width={180} height={42} viewBox="0 0 180 42">
            {/* Dasar Tanah Cokelat Tua */}
            <Path
              d="M8 32 Q90 10 172 32 L172 42 L8 42 Z"
              fill="#5F370E"
              stroke="#123924"
              strokeWidth={2}
            />
            {/* Lapisan Tanah Subur */}
            <Path
              d="M10 30 Q90 12 170 30 L170 36 L10 36 Z"
              fill="#854D0E"
            />
            {/* Garis Rumput Hijau */}
            <Path
              d="M14 28 Q90 11 166 28"
              stroke="#16A34A"
              strokeWidth={3.5}
              strokeLinecap="round"
              fill="none"
            />
          </Svg>
        </View>
      </View>

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
          <Animated.View style={[styles.progressCapsuleFill, progressStyle]} />
        </View>

        <View style={styles.progressInfoRow}>
          <Text style={styles.statusLabel}>{statusText}</Text>
          <Text style={styles.percentText}>{displayPercent}%</Text>
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
    top: -10,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  dewDrop: {
    position: "absolute",
    bottom: 44,
    zIndex: 10,
  },
  rippleRing: {
    position: "absolute",
    bottom: 24,
    width: 34,
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
    zIndex: 6,
  },
  plantContainer: {
    position: "absolute",
    bottom: 25,
    alignItems: "center",
    justifyContent: "flex-end",
    width: 110,
    height: 90,
    zIndex: 7,
  },
  stemWrapper: {
    transformOrigin: "bottom center",
  },
  leafLeft: {
    position: "absolute",
    left: 14,
    top: 18,
    transformOrigin: "bottom right",
  },
  leafRight: {
    position: "absolute",
    right: 14,
    top: 16,
    transformOrigin: "bottom left",
  },
  pollenCluster: {
    position: "absolute",
    top: -8,
    alignItems: "center",
    justifyContent: "center",
  },
  soilLayer: {
    alignItems: "center",
    zIndex: 5,
  },
  brandContainer: {
    alignItems: "center",
    marginTop: 24,
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
    height: 11,
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
});
