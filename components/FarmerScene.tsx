import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, {
  Circle,
  Defs,
  Ellipse,
  G,
  Line,
  LinearGradient,
  Path,
  Rect,
  Stop,
} from 'react-native-svg';

const SCENE_HEIGHT = 285;
const RAIN_BOUNDS_HEIGHT = 212; // Dibatas agar tidak menabrak StatCard di bawahnya

interface FarmerSceneProps {
  userName: string;
  avatarUrl?: string;
  weatherCondition: string;
  temperature: number;
  farmerState?: 'needsWatering' | 'allClear' | 'raining';
  onProfilePress?: () => void;
}

export default function FarmerScene({
  userName,
  avatarUrl,
  weatherCondition,
  temperature = 28,
  farmerState = 'allClear',
  onProfilePress,
}: FarmerSceneProps) {
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const [containerWidth, setContainerWidth] = useState(0);
  const screenWidth = Dimensions.get('screen').width;
  const width = Math.max(containerWidth, windowWidth, screenWidth);

  const cloudOffset = useSharedValue(0);
  const sunPulse = useSharedValue(1);

  // Raindrop animation values (3 layers for depth & parallax)
  const rainAnim1 = useSharedValue(-RAIN_BOUNDS_HEIGHT);
  const rainAnim2 = useSharedValue(-RAIN_BOUNDS_HEIGHT);
  const rainAnim3 = useSharedValue(-RAIN_BOUNDS_HEIGHT);
  const splashAnim = useSharedValue(0);

  useEffect(() => {
    cloudOffset.value = withRepeat(
      withTiming(width * 0.14, { duration: 14000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );

    sunPulse.value = withRepeat(
      withSequence(
        withTiming(1.12, { duration: 2200, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.96, { duration: 2200, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    return () => {
      cancelAnimation(cloudOffset);
      cancelAnimation(sunPulse);
    };
  }, [cloudOffset, sunPulse, width]);

  const cloudAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: cloudOffset.value }],
  }));

  const sunPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: sunPulse.value }],
  }));

  // Greeting & Time of Day Logic
  const hour = new Date().getHours();
  let greeting = 'Selamat pagi';
  if (hour >= 11 && hour < 15) greeting = 'Selamat siang';
  else if (hour >= 15 && hour < 18) greeting = 'Selamat sore';
  else if (hour >= 18 || hour < 4) greeting = 'Selamat malam';

  // Tampilkan hingga 2 kata pertama nama pengguna agar lebih proporsional & personal
  const displayName = useMemo(() => {
    if (!userName) return 'Sobat Tani';
    const words = userName.trim().split(/\s+/);
    return words.length > 1 ? `${words[0]} ${words[1]}` : words[0];
  }, [userName]);

  const [demoRain, setDemoRain] = useState<boolean | null>(null);

  const isNight = hour >= 18 || hour < 6;
  const isSunset = !isNight && hour >= 15 && hour < 18;
  const isRaining =
    demoRain !== null
      ? demoRain
      : weatherCondition?.toLowerCase().includes('hujan') ||
        weatherCondition?.toLowerCase().includes('rain') ||
        weatherCondition?.toLowerCase().includes('gerimis') ||
        weatherCondition?.toLowerCase().includes('drizzle') ||
        weatherCondition?.toLowerCase().includes('storm') ||
        farmerState === 'raining';

  useEffect(() => {
    if (isRaining) {
      rainAnim1.value = -RAIN_BOUNDS_HEIGHT;
      rainAnim1.value = withRepeat(
        withTiming(0, { duration: 720, easing: Easing.linear }),
        -1,
        false
      );

      rainAnim2.value = -RAIN_BOUNDS_HEIGHT;
      rainAnim2.value = withRepeat(
        withTiming(0, { duration: 1020, easing: Easing.linear }),
        -1,
        false
      );

      rainAnim3.value = -RAIN_BOUNDS_HEIGHT;
      rainAnim3.value = withRepeat(
        withTiming(0, { duration: 1320, easing: Easing.linear }),
        -1,
        false
      );

      splashAnim.value = 0;
      splashAnim.value = withRepeat(
        withTiming(1, { duration: 820, easing: Easing.linear }),
        -1,
        false
      );
    } else {
      cancelAnimation(rainAnim1);
      cancelAnimation(rainAnim2);
      cancelAnimation(rainAnim3);
      cancelAnimation(splashAnim);
      rainAnim1.value = -RAIN_BOUNDS_HEIGHT;
      rainAnim2.value = -RAIN_BOUNDS_HEIGHT;
      rainAnim3.value = -RAIN_BOUNDS_HEIGHT;
      splashAnim.value = 0;
    }

    return () => {
      cancelAnimation(rainAnim1);
      cancelAnimation(rainAnim2);
      cancelAnimation(rainAnim3);
      cancelAnimation(splashAnim);
    };
  }, [isRaining, rainAnim1, rainAnim2, rainAnim3, splashAnim]);

  const rainStyle1 = useAnimatedStyle(() => ({
    transform: [{ translateY: rainAnim1.value }],
  }));

  const rainStyle2 = useAnimatedStyle(() => ({
    transform: [{ translateY: rainAnim2.value }],
  }));

  const rainStyle3 = useAnimatedStyle(() => ({
    transform: [{ translateY: rainAnim3.value }],
  }));

  const splashStyle = useAnimatedStyle(() => ({
    opacity: 1 - splashAnim.value,
    transform: [{ scale: 0.5 + splashAnim.value * 0.75 }],
  }));

  // Deterministic raindrop positions
  const layer1Drops = useMemo(() => {
    const drops = [];
    const count = 16;
    for (let i = 0; i < count; i++) {
      const x = ((i + 0.3) / count) * width;
      const y = (i * 37) % RAIN_BOUNDS_HEIGHT;
      const len = 14 + (i % 4);
      drops.push({ x, y, len });
    }
    return drops;
  }, [width]);

  const layer2Drops = useMemo(() => {
    const drops = [];
    const count = 18;
    for (let i = 0; i < count; i++) {
      const x = ((i + 0.75) / count) * width;
      const y = (i * 47 + 25) % RAIN_BOUNDS_HEIGHT;
      const len = 11 + (i % 3);
      drops.push({ x, y, len });
    }
    return drops;
  }, [width]);

  const layer3Drops = useMemo(() => {
    const drops = [];
    const count = 14;
    for (let i = 0; i < count; i++) {
      const x = ((i + 0.15) / count) * width;
      const y = (i * 59 + 50) % RAIN_BOUNDS_HEIGHT;
      const len = 8 + (i % 3);
      drops.push({ x, y, len });
    }
    return drops;
  }, [width]);

  const splashPoints = useMemo(
    () => [
      { x: width * 0.18, y: 192 },
      { x: width * 0.38, y: 182 },
      { x: width * 0.62, y: 186 },
      { x: width * 0.82, y: 196 },
    ],
    [width]
  );

  // Dynamic Palette Berdasarkan Waktu & Cuaca
  let skyColor1 = '#CBEFE0';
  let skyColor2 = '#E9F7EF';
  let skyColor3 = '#FBF8F1';

  let farHillColor = '#A3D9BE';
  let midHillColor = '#BAE6CE';
  let nearHillColor = '#D4F0E0';

  if (isRaining) {
    skyColor1 = '#546E7A';
    skyColor2 = '#90A4AE';
    skyColor3 = '#CFD8DC';
    farHillColor = '#789B90';
    midHillColor = '#8EB0A5';
    nearHillColor = '#B0C9C0';
  } else if (isNight) {
    skyColor1 = '#0F172A';
    skyColor2 = '#1E293B';
    skyColor3 = '#334155';
    farHillColor = '#1E3A34';
    midHillColor = '#26463E';
    nearHillColor = '#2E564C';
  } else if (isSunset) {
    skyColor1 = '#F59E0B';
    skyColor2 = '#FDE68A';
    skyColor3 = '#FEF3C7';
    farHillColor = '#94C9A9';
    midHillColor = '#B2DFBD';
    nearHillColor = '#D2F0D9';
  }

  // Reaktivitas Tanah & Tanaman berdasarkan farmerState
  const isSoilMoist = isRaining || farmerState === 'allClear';
  const soilColor = isSoilMoist ? '#4E342E' : '#8D6E63'; // Gelap subur vs Cokelat kering
  const soilHighlight = isSoilMoist ? '#3E2723' : '#795548';

  const toggleDemoRain = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    setDemoRain((prev) => (prev === null ? !isRaining : !prev));
  };

  const renderWeatherPill = () => {
    let iconName: keyof typeof Feather.glyphMap = isNight ? 'moon' : 'sun';
    let iconColor = isNight ? '#FDE047' : '#F59E0B';

    if (isRaining) {
      iconName = 'cloud-rain';
      iconColor = '#2563EB';
    } else if (weatherCondition?.toLowerCase().includes('berawan')) {
      iconName = 'cloud';
      iconColor = '#64748B';
    }

    const weatherLabel =
      demoRain !== null
        ? 'Mode Demo'
        : isRaining
        ? 'Hujan'
        : weatherCondition?.toLowerCase().includes('berawan')
        ? 'Berawan'
        : isNight
        ? 'Malam'
        : 'Cerah';

    return (
      <Pressable
        style={({ pressed }) => [
          styles.weatherBox,
          pressed && { transform: [{ scale: 0.96 }], opacity: 0.9 },
        ]}
        onPress={() => router.push('/cuaca')}
        onLongPress={toggleDemoRain}
        delayLongPress={400}
      >
        <View style={[styles.weatherIconCircle, { backgroundColor: `${iconColor}18` }]}>
          <Feather name={iconName} size={15} color={iconColor} />
        </View>
        <View>
          <Text style={styles.tempValueText}>{temperature}°C</Text>
          <Text style={styles.weatherSubLabel}>{weatherLabel}</Text>
        </View>
      </Pressable>
    );
  };

  const useLightText = isNight || isRaining;

  return (
    <View
      style={styles.sceneContainer}
      onLayout={(e) => {
        const w = e.nativeEvent.layout.width;
        if (w > 0 && w !== containerWidth) {
          setContainerWidth(w);
        }
      }}
    >
      {/* 1. PULSING SUN / MOON HALO LAYER (60FPS UI THREAD) */}
      {!isRaining && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.celestialWrapper,
            { left: width * 0.72, top: Math.max(28, insets.top + 8) },
            sunPulseStyle,
          ]}
        >
          <Svg width={96} height={96} viewBox="0 0 96 96">
            {isNight ? (
              <>
                <Circle cx="48" cy="48" r="42" fill="#F8FAFC" opacity={0.08} />
                <Circle cx="48" cy="48" r="30" fill="#F8FAFC" opacity={0.16} />
                <Circle cx="48" cy="48" r="20" fill="#FEF9C3" opacity={0.95} />
                <Circle cx="42" cy="43" r="3.5" fill="#E2E8F0" opacity={0.45} />
                <Circle cx="53" cy="52" r="2.5" fill="#E2E8F0" opacity={0.45} />
              </>
            ) : (
              <>
                <Circle cx="48" cy="48" r="44" fill="#FEF08A" opacity={0.28} />
                <Circle cx="48" cy="48" r="33" fill="#FDE047" opacity={0.45} />
                <Circle cx="48" cy="48" r="22" fill="#FACC15" />
              </>
            )}
          </Svg>
        </Animated.View>
      )}

      {/* 2. MAIN BOTANICAL LANDSCAPE SVG */}
      <View style={[StyleSheet.absoluteFill, { width: '100%', overflow: 'hidden' }]}>
        <Svg width="100%" height={SCENE_HEIGHT}>
          <Defs>
            <LinearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={skyColor1} stopOpacity="1" />
              <Stop offset="0.62" stopColor={skyColor2} stopOpacity="1" />
              <Stop offset="1" stopColor={skyColor3} stopOpacity="1" />
            </LinearGradient>
            <LinearGradient id="boxWoodGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#FFFBEB" />
              <Stop offset="1" stopColor="#E6D5B8" />
            </LinearGradient>
          </Defs>

          {/* Sky Background */}
          <Rect x="-50" y="0" width={width + 100} height={SCENE_HEIGHT} fill="url(#skyGrad)" />

          {/* Night Stars */}
          {isNight && !isRaining && (
            <G opacity={0.85}>
              <Circle cx={width * 0.12} cy={34} r={1.5} fill="#FEF9C3" />
              <Circle cx={width * 0.28} cy={52} r={2} fill="#FFFFFF" />
              <Circle cx={width * 0.45} cy={28} r={1.4} fill="#FEF08A" />
              <Circle cx={width * 0.62} cy={44} r={1.8} fill="#FFFFFF" />
              <Circle cx={width * 0.88} cy={36} r={1.5} fill="#FEF9C3" />
            </G>
          )}

          {/* Far Mountain / Rolling Hills */}
          <Path
            d={`M -50,162 Q ${width * 0.22},98 ${width * 0.52},138 T ${width + 100},118 L ${
              width + 100
            },${SCENE_HEIGHT} L -50,${SCENE_HEIGHT} Z`}
            fill={farHillColor}
            opacity={0.75}
          />

          {/* Mid Rolling Hills */}
          <Path
            d={`M -50,182 Q ${width * 0.32},122 ${width * 0.78},176 T ${width + 100},156 L ${
              width + 100
            },${SCENE_HEIGHT} L -50,${SCENE_HEIGHT} Z`}
            fill={midHillColor}
            opacity={0.9}
          />

          {/* Twin Bio-Dome Smart Greenhouse Complex on Left Hill */}
          <G x={width * 0.05} y={124}>
            {/* Ground Shadow underneath the complex */}
            <Ellipse cx="52" cy="40" rx="52" ry="6" fill="#123924" opacity={isNight ? 0.35 : 0.12} />

            {/* Connecting Glass Skywalk / Corridor between domes */}
            <Rect
              x="42"
              y="22"
              width="24"
              height="14"
              rx="3"
              fill={isNight ? '#0284C7' : isRaining ? '#38BDF8' : '#BAE6FD'}
              opacity={isNight ? 0.6 : 0.85}
              stroke="#0369A1"
              strokeWidth="1"
            />
            {/* Corridor ribs and floor base */}
            <Line x1="48" y1="22" x2="48" y2="36" stroke="#0284C7" strokeWidth="1" opacity={0.6} />
            <Line x1="54" y1="22" x2="54" y2="36" stroke="#0284C7" strokeWidth="1" opacity={0.6} />
            <Line x1="60" y1="22" x2="60" y2="36" stroke="#0284C7" strokeWidth="1" opacity={0.6} />
            <Rect x="40" y="34" width="28" height="4" rx="1.5" fill="#0369A1" />

            {/* === DOME 1 (Primary / Left Bio-Dome) === */}
            <G x="0" y="0">
              {/* Interior Grow-Light Aura at Night/Rain */}
              {(isNight || isRaining) && (
                <Ellipse
                  cx="25"
                  cy="20"
                  rx="18"
                  ry="14"
                  fill={isNight ? '#34D399' : '#38BDF8'}
                  opacity={isNight ? 0.55 : 0.35}
                />
              )}

              {/* Hydroponic Vertical Towers / Silhouettes inside Dome 1 */}
              <G opacity={isNight ? 0.75 : 0.45}>
                <Rect x="14" y="16" width="3" height="18" rx="1" fill="#047857" />
                <Circle cx="13" cy="20" r="3" fill="#10B981" />
                <Circle cx="17" cy="24" r="2.5" fill="#34D399" />
                <Circle cx="13" cy="28" r="3" fill="#10B981" />

                <Rect x="24" y="10" width="3" height="24" rx="1" fill="#047857" />
                <Circle cx="23" cy="14" r="3.5" fill="#34D399" />
                <Circle cx="27" cy="19" r="3" fill="#10B981" />
                <Circle cx="23" cy="24" r="3.5" fill="#34D399" />
                <Circle cx="27" cy="29" r="3" fill="#10B981" />

                <Rect x="34" y="16" width="3" height="18" rx="1" fill="#047857" />
                <Circle cx="37" cy="20" r="3" fill="#10B981" />
                <Circle cx="33" cy="25" r="2.5" fill="#34D399" />
                <Circle cx="37" cy="29" r="3" fill="#10B981" />
              </G>

              {/* Glass Dome 1 Shell */}
              <Path
                d="M 2,36 Q 25,2 48,36 Z"
                fill={isNight ? '#38BDF8' : isSunset ? '#FDE68A' : '#E0F2FE'}
                opacity={isNight ? 0.45 : 0.75}
                stroke="#0284C7"
                strokeWidth="1.4"
              />

              {/* Geodesic Ribs & Struts */}
              <Path
                d="M 12,36 Q 25,10 38,36"
                stroke="#0284C7"
                strokeWidth="1"
                fill="none"
                opacity={0.65}
              />
              <Line x1="25" y1="2" x2="25" y2="36" stroke="#0284C7" strokeWidth="1.2" opacity={0.65} />
              <Line x1="7" y1="22" x2="43" y2="22" stroke="#0284C7" strokeWidth="0.9" opacity={0.5} />

              {/* Specular Glass Sun Glare */}
              {!isNight && !isRaining && (
                <Path
                  d="M 10,26 Q 22,6 30,12"
                  stroke="#FFFFFF"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  fill="none"
                  opacity={0.7}
                />
              )}

              {/* Foundation Perimeter Base */}
              <Rect x="0" y="34" width="50" height="6" rx="2" fill="#0369A1" opacity={0.9} />
              <Rect x="1" y="38" width="48" height="2" fill="#0C4A6E" />
            </G>

            {/* === DOME 2 (Secondary / Right Bio-Dome Pod) === */}
            <G x="62" y="8">
              {/* Interior Glow at Night/Rain */}
              {(isNight || isRaining) && (
                <Ellipse
                  cx="20"
                  cy="17"
                  rx="14"
                  ry="11"
                  fill={isNight ? '#34D399' : '#38BDF8'}
                  opacity={isNight ? 0.5 : 0.3}
                />
              )}

              {/* Hydroponic Trays inside Dome 2 */}
              <G opacity={isNight ? 0.7 : 0.45}>
                <Rect x="12" y="14" width="2.5" height="15" rx="1" fill="#047857" />
                <Circle cx="11" cy="18" r="2.5" fill="#34D399" />
                <Circle cx="15" cy="22" r="2.5" fill="#10B981" />

                <Rect x="22" y="10" width="2.5" height="19" rx="1" fill="#047857" />
                <Circle cx="21" cy="14" r="3" fill="#10B981" />
                <Circle cx="25" cy="19" r="2.5" fill="#34D399" />
                <Circle cx="21" cy="24" r="3" fill="#10B981" />
              </G>

              {/* Glass Dome 2 Shell */}
              <Path
                d="M 2,30 Q 20,4 38,30 Z"
                fill={isNight ? '#38BDF8' : isSunset ? '#FDE68A' : '#E0F2FE'}
                opacity={isNight ? 0.45 : 0.75}
                stroke="#0284C7"
                strokeWidth="1.3"
              />

              {/* Geodesic Ribs */}
              <Path
                d="M 10,30 Q 20,10 30,30"
                stroke="#0284C7"
                strokeWidth="0.9"
                fill="none"
                opacity={0.65}
              />
              <Line x1="20" y1="4" x2="20" y2="30" stroke="#0284C7" strokeWidth="1.1" opacity={0.65} />
              <Line x1="6" y1="18" x2="34" y2="18" stroke="#0284C7" strokeWidth="0.8" opacity={0.5} />

              {/* Specular Reflection */}
              {!isNight && !isRaining && (
                <Path
                  d="M 8,20 Q 16,8 24,12"
                  stroke="#FFFFFF"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  fill="none"
                  opacity={0.65}
                />
              )}

              {/* Foundation Base Dome 2 */}
              <Rect x="0" y="28" width="40" height="6" rx="2" fill="#0369A1" opacity={0.9} />
              <Rect x="1" y="32" width="38" height="2" fill="#0C4A6E" />
            </G>

            {/* Solar Panel & Sensor Antenna on Left Ridge */}
            <G x="-14" y="26">
              {/* Stand */}
              <Line x1="6" y1="12" x2="6" y2="16" stroke="#475569" strokeWidth="1.5" />
              {/* Tilted Solar Panel */}
              <Rect
                x="0"
                y="6"
                width="14"
                height="7"
                rx="1"
                fill="#1E3A8A"
                stroke="#60A5FA"
                strokeWidth="0.8"
                transform="rotate(-15 7 9)"
              />
              {/* Solar cell grid line */}
              <Line
                x1="7"
                y1="6"
                x2="7"
                y2="13"
                stroke="#93C5FD"
                strokeWidth="0.5"
                transform="rotate(-15 7 9)"
              />

              {/* IoT Sensor Light Beacon */}
              <Line x1="-3" y1="4" x2="-3" y2="15" stroke="#64748B" strokeWidth="1" />
              <Circle
                cx="-3"
                cy="3"
                r="1.8"
                fill={isNight || isRaining ? '#22C55E' : '#38BDF8'}
              />
            </G>
          </G>

          {/* Barn, Silo & Windmill on Right-Center Hill */}
          <G x={width * 0.55} y={102}>
            {/* Silo */}
            <Rect x="62" y="32" width="16" height="42" fill="#E2E8F0" />
            <Rect x="62" y="32" width="5" height="42" fill="#F8FAFC" />
            <Path d="M 62,32 Q 70,9 78,32 Z" fill="#94A3B8" />

            {/* Barn Body */}
            <Rect x="10" y="38" width="55" height="36" fill="#DC2626" rx="2" />
            {/* Barn Roof Gambrel */}
            <Path d="M 4,43 L 22,18 L 37,10 L 53,18 L 71,43 Z" fill="#991B1B" />
            <Path d="M 8,43 L 24,20 L 37,13 L 51,20 L 67,43" stroke="#FEE2E2" strokeWidth="1.5" fill="none" />

            {/* Barn Door (Glows warm at night/rain!) */}
            <Rect
              x="28"
              y="52"
              width="18"
              height="22"
              rx="2"
              fill={isNight || isRaining ? '#FDE047' : '#FFFFFF'}
            />
            <Path
              d="M 28,52 L 46,74 M 46,52 L 28,74"
              stroke={isNight || isRaining ? '#CA8A04' : '#DC2626'}
              strokeWidth="1.5"
            />

            {/* Barn Hayloft Window */}
            <Circle
              cx="37"
              cy="30"
              r="5"
              fill={isNight || isRaining ? '#FEF08A' : '#FFFFFF'}
              stroke="#7F1D1D"
              strokeWidth="1.2"
            />
          </G>

          {/* Lush Cypress & Round Trees on the Right */}
          <G x={width * 0.81} y={146}>
            <Rect x="12" y="20" width="5" height="16" fill="#5D4037" rx="2" />
            <Circle cx="14.5" cy="14" r="13" fill="#2E7D32" />
            <Circle cx="11" cy="11" r="9" fill="#4CAF50" />
          </G>
          <G x={width * 0.89} y={156}>
            <Rect x="9" y="15" width="4" height="14" fill="#5D4037" rx="1.5" />
            <Circle cx="11" cy="12" r="10" fill="#1B5E20" />
            <Circle cx="9" cy="10" r="6.5" fill="#388E3C" />
          </G>

          {/* Foreground Pasture Hill */}
          <Path
            d={`M -50,210 Q ${width * 0.42},152 ${width + 100},202 L ${
              width + 100
            },${SCENE_HEIGHT} L -50,${SCENE_HEIGHT} Z`}
            fill={nearHillColor}
          />

          {/* 3. RAISED BEDS (KOTAK PERKEBUNAN REAKTIF TERHADAP FARMERSTATE) */}
          <G x={(width - 256) / 2} y={168}>
            {/* === BOX 1 (KIRI: KEBUN TOMAT) === */}
            <G x="0" y="24">
              {/* Shadow bawah kotak */}
              <Rect x="2" y="34" width="72" height="8" rx="4" fill="#123924" opacity={0.12} />
              {/* Wooden Planter Box */}
              <Rect x="0" y="6" width="72" height="32" rx="8" fill="#D7C097" stroke="#8D6E63" strokeWidth="1.2" />
              <Rect x="0" y="0" width="72" height="16" rx="6" fill="url(#boxWoodGrad)" stroke="#A1887F" strokeWidth="1" />
              {/* Soil Layer */}
              <Rect x="6" y="4" width="60" height="16" rx="5" fill={soilColor} />
              <Ellipse cx="36" cy="12" rx="26" ry="5" fill={soilHighlight} opacity={0.45} />

              {/* Tanaman Tomat Berlapis */}
              {[18, 36, 54].map((cx, idx) => (
                <G key={`tomato-${idx}`} x={cx} y={10}>
                  {/* Daun Kiri & Kanan */}
                  <Path d="M 0,4 C -6,2 -10,-4 -4,-6 C -1,-5 0,0 0,4 Z" fill="#2E7D32" />
                  <Path d="M 0,4 C 6,2 10,-4 4,-6 C 1,-5 0,0 0,4 Z" fill="#43A047" />
                  <Path d="M 0,5 Q 0,-6 0,-9" stroke="#1B5E20" strokeWidth="2.2" strokeLinecap="round" />
                  {/* Buah Tomat Merah (Muncul cerah saat terawat / hujan) */}
                  <Circle
                    cx="-3"
                    cy="-2"
                    r={farmerState === 'needsWatering' ? 2.2 : 3.2}
                    fill={farmerState === 'needsWatering' ? '#F59E0B' : '#EF4444'}
                  />
                  <Circle
                    cx="3.5"
                    cy="-4"
                    r={farmerState === 'needsWatering' ? 1.8 : 2.6}
                    fill={farmerState === 'needsWatering' ? '#FBBF24' : '#DC2626'}
                  />
                </G>
              ))}
            </G>

            {/* === BOX 2 (TENGAH: TUNAS MUDA / SAYUR HIJAU) === */}
            <G x="92" y="14">
              <Rect x="2" y="34" width="72" height="8" rx="4" fill="#123924" opacity={0.12} />
              <Rect x="0" y="6" width="72" height="32" rx="8" fill="#D7C097" stroke="#8D6E63" strokeWidth="1.2" />
              <Rect x="0" y="0" width="72" height="16" rx="6" fill="url(#boxWoodGrad)" stroke="#A1887F" strokeWidth="1" />
              <Rect x="6" y="4" width="60" height="16" rx="5" fill={soilColor} />
              <Ellipse cx="36" cy="12" rx="26" ry="5" fill={soilHighlight} opacity={0.45} />

              {/* Tunas Daun Mekar */}
              {[18, 36, 54].map((cx, idx) => (
                <G key={`sprout-${idx}`} x={cx} y={12}>
                  <Path
                    d="M 0,2 Q -2,-8 -8,-9 Q -4,-2 0,2 Z"
                    fill="#16A34A"
                    stroke="#14532D"
                    strokeWidth="0.8"
                  />
                  <Path
                    d="M 0,2 Q 2,-9 8,-10 Q 4,-2 0,2 Z"
                    fill="#4ADE80"
                    stroke="#15803D"
                    strokeWidth="0.8"
                  />
                  {/* Indikator Tetes Air Kecil jika Needs Watering, atau Kilau Emas jika All Clear */}
                  {farmerState === 'needsWatering' && !isRaining && idx === 1 && (
                    <Path
                      d="M 0,-18 C -2,-15 -3,-13 -3,-11 C -3,-9.3 -1.7,-8 0,-8 C 1.7,-8 3,-9.3 3,-11 C 3,-13 2,-15 0,-18 Z"
                      fill="#38BDF8"
                    />
                  )}
                  {farmerState === 'allClear' && !isRaining && (
                    <Circle cx="0" cy="-14" r="2" fill="#FACC15" />
                  )}
                </G>
              ))}
            </G>

            {/* === BOX 3 (KANAN: SELADA / KUBIS) === */}
            <G x="184" y="24">
              <Rect x="2" y="34" width="72" height="8" rx="4" fill="#123924" opacity={0.12} />
              <Rect x="0" y="6" width="72" height="32" rx="8" fill="#D7C097" stroke="#8D6E63" strokeWidth="1.2" />
              <Rect x="0" y="0" width="72" height="16" rx="6" fill="url(#boxWoodGrad)" stroke="#A1887F" strokeWidth="1" />
              <Rect x="6" y="4" width="60" height="16" rx="5" fill={soilColor} />
              <Ellipse cx="36" cy="12" rx="26" ry="5" fill={soilHighlight} opacity={0.45} />

              {/* Roset Daun Selada */}
              {[18, 36, 54].map((cx, idx) => (
                <G key={`lettuce-${idx}`} x={cx} y={10}>
                  <Circle cx="-3" cy="0" r="5.5" fill="#65A30D" />
                  <Circle cx="3" cy="0" r="5.5" fill="#84CC16" />
                  <Circle cx="0" cy="-2.5" r="5" fill="#A3E635" />
                  <Circle cx="0" cy="-1.5" r="2.5" fill="#ECFCCB" opacity={0.7} />
                </G>
              ))}
            </G>
          </G>

          {/* Night / Rain Atmospheric Tint Overlay */}
          {(isNight || isRaining) && (
            <Rect
              x="-50"
              y="0"
              width={width + 100}
              height={SCENE_HEIGHT}
              fill="#091526"
              opacity={isNight ? 0.24 : 0.08}
            />
          )}

          {/* Front Foreground Blend (Menyatu mulus dengan warna background #FBF8F1 Beranda) */}
          <Path
            d={`M -50,246 Q ${width / 2},220 ${width + 100},246 L ${
              width + 100
            },${SCENE_HEIGHT} L -50,${SCENE_HEIGHT} Z`}
            fill="#FBF8F1"
          />
        </Svg>
      </View>

      {/* 4. DRIFTING FLUFFY CLOUDS */}
      <Animated.View pointerEvents="none" style={[styles.cloudLayer, cloudAnimatedStyle]}>
        <Svg width={width + 200} height={105}>
          <G
            x="24"
            y="28"
            opacity={isNight ? 0.22 : isRaining ? 0.88 : 0.82}
            fill={isRaining ? '#90A4AE' : '#FFFFFF'}
          >
            <Circle cx="20" cy="22" r="14" />
            <Circle cx="42" cy="14" r="20" />
            <Circle cx="66" cy="22" r="15" />
            <Rect x="18" y="20" width="50" height="16" rx="8" />
          </G>

          <G
            x="235"
            y="12"
            opacity={isNight ? 0.14 : isRaining ? 0.72 : 0.58}
            fill={isRaining ? '#B0BEC5' : '#FFFFFF'}
          >
            <Circle cx="15" cy="16" r="10" />
            <Circle cx="30" cy="10" r="14" />
            <Circle cx="46" cy="17" r="11" />
            <Rect x="14" y="14" width="33" height="13" rx="6" />
          </G>
        </Svg>
      </Animated.View>

      {/* 5. PARALLAX RAINDROPS & SPLASH LAYER */}
      {isRaining && (
        <View style={styles.rainContainer} pointerEvents="none">
          <Animated.View style={[StyleSheet.absoluteFill, rainStyle3]}>
            <Svg width="100%" height={RAIN_BOUNDS_HEIGHT * 2}>
              {layer3Drops.map((d, i) => (
                <G key={`l3-${i}`}>
                  <Line
                    x1={d.x}
                    y1={d.y}
                    x2={d.x - 2}
                    y2={d.y + d.len}
                    stroke="#E0F2FE"
                    strokeWidth={1}
                    strokeLinecap="round"
                    opacity={0.45}
                  />
                  <Line
                    x1={d.x}
                    y1={d.y + RAIN_BOUNDS_HEIGHT}
                    x2={d.x - 2}
                    y2={d.y + d.len + RAIN_BOUNDS_HEIGHT}
                    stroke="#E0F2FE"
                    strokeWidth={1}
                    strokeLinecap="round"
                    opacity={0.45}
                  />
                </G>
              ))}
            </Svg>
          </Animated.View>

          <Animated.View style={[StyleSheet.absoluteFill, rainStyle2]}>
            <Svg width="100%" height={RAIN_BOUNDS_HEIGHT * 2}>
              {layer2Drops.map((d, i) => (
                <G key={`l2-${i}`}>
                  <Line
                    x1={d.x}
                    y1={d.y}
                    x2={d.x - 3}
                    y2={d.y + d.len}
                    stroke="#BAE6FD"
                    strokeWidth={1.3}
                    strokeLinecap="round"
                    opacity={0.7}
                  />
                  <Line
                    x1={d.x}
                    y1={d.y + RAIN_BOUNDS_HEIGHT}
                    x2={d.x - 3}
                    y2={d.y + d.len + RAIN_BOUNDS_HEIGHT}
                    stroke="#BAE6FD"
                    strokeWidth={1.3}
                    strokeLinecap="round"
                    opacity={0.7}
                  />
                </G>
              ))}
            </Svg>
          </Animated.View>

          <Animated.View style={[StyleSheet.absoluteFill, rainStyle1]}>
            <Svg width="100%" height={RAIN_BOUNDS_HEIGHT * 2}>
              {layer1Drops.map((d, i) => (
                <G key={`l1-${i}`}>
                  <Line
                    x1={d.x}
                    y1={d.y}
                    x2={d.x - 4}
                    y2={d.y + d.len}
                    stroke="#7DD3FC"
                    strokeWidth={1.7}
                    strokeLinecap="round"
                    opacity={0.9}
                  />
                  <Line
                    x1={d.x}
                    y1={d.y + RAIN_BOUNDS_HEIGHT}
                    x2={d.x - 4}
                    y2={d.y + d.len + RAIN_BOUNDS_HEIGHT}
                    stroke="#7DD3FC"
                    strokeWidth={1.7}
                    strokeLinecap="round"
                    opacity={0.9}
                  />
                </G>
              ))}
            </Svg>
          </Animated.View>

          <Animated.View style={[StyleSheet.absoluteFill, splashStyle]}>
            <Svg width="100%" height={RAIN_BOUNDS_HEIGHT}>
              {splashPoints.map((p, i) => (
                <Ellipse
                  key={`splash-${i}`}
                  cx={p.x}
                  cy={p.y}
                  rx={6.5}
                  ry={2.5}
                  stroke="#BAE6FD"
                  strokeWidth={1.3}
                  fill="none"
                  opacity={0.75}
                />
              ))}
            </Svg>
          </Animated.View>
        </View>
      )}

      {/* 6. TOP BAR (SAFE-AREA AWARE) */}
      <View style={[styles.topBar, { top: Math.max(40, insets.top + 10) }]}>
        <View style={styles.topBarMainRow}>
          <Pressable
            onPress={onProfilePress}
            style={({ pressed }) => [
              styles.greetingWrapper,
              pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
            ]}
          >
            <View style={styles.avatar}>
              {avatarUrl ? (
                <Image
                  source={{ uri: avatarUrl }}
                  style={styles.avatarImg}
                  contentFit="cover"
                  cachePolicy="memory-disk"
                />
              ) : (
                <Feather name="user" size={20} color="#3FA86B" />
              )}
              <View style={styles.avatarOnlineDot} />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={[styles.greetingOverline, useLightText && { color: '#E2E8F0' }]}
                numberOfLines={1}
              >
                {greeting.toUpperCase()}
              </Text>
              <Text
                style={[styles.greetingText, useLightText && { color: '#FFFFFF' }]}
                numberOfLines={1}
              >
                {displayName}!
              </Text>
            </View>
          </Pressable>

          {renderWeatherPill()}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sceneContainer: {
    width: '100%',
    height: SCENE_HEIGHT,
    position: 'relative',
    backgroundColor: '#FBF8F1',
    overflow: 'hidden',
  },
  celestialWrapper: {
    position: 'absolute',
    width: 96,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  topBar: {
    position: 'absolute',
    left: 20,
    right: 20,
    zIndex: 10,
  },
  topBarMainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greetingWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#123924',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  avatarOnlineDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#3FA86B',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  greetingOverline: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 10,
    letterSpacing: 0.8,
    color: '#2D4A3E',
    opacity: 0.85,
  },
  greetingText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 21,
    color: '#123924',
    flexShrink: 1,
    marginTop: -2,
  },
  weatherBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    gap: 8,
    shadowColor: '#123924',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
  },
  weatherIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tempValueText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 13,
    color: '#123924',
    lineHeight: 15,
  },
  weatherSubLabel: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 10,
    color: '#5C5A4F',
    lineHeight: 12,
  },
  cloudLayer: {
    position: 'absolute',
    top: 38,
    left: -20,
    width: '100%',
    zIndex: 2,
  },
  rainContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: RAIN_BOUNDS_HEIGHT,
    overflow: 'hidden',
    zIndex: 3,
  },
});
