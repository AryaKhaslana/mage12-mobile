import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useEffect, useMemo, useState } from 'react';
import * as Haptics from 'expo-haptics';
import { Dimensions, StyleSheet, Text, View, Pressable } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, Ellipse, G, Line, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');
const SCENE_HEIGHT = 280;
const RAIN_BOUNDS_HEIGHT = 210; // Hujan dibatasi sampai y=210 agar tidak tumpah ke card (StatCard mulai di y=248)

interface FarmerSceneProps {
  userName: string;
  avatarUrl?: string;
  weatherCondition: string;
  temperature: number;
  farmerState: 'needsWatering' | 'allClear' | 'raining';
  onProfilePress?: () => void;
}

export default function FarmerScene({
  userName,
  avatarUrl,
  weatherCondition,
  temperature,
  farmerState,
  onProfilePress,
}: FarmerSceneProps) {
  const cloudOffset = useSharedValue(0);

  // Raindrop animation values (3 layers for depth & parallax)
  const rainAnim1 = useSharedValue(-SCENE_HEIGHT);
  const rainAnim2 = useSharedValue(-SCENE_HEIGHT);
  const rainAnim3 = useSharedValue(-SCENE_HEIGHT);
  const splashAnim = useSharedValue(0);

  useEffect(() => {
    // Slow drifting clouds
    cloudOffset.value = withRepeat(
      withTiming(width * 0.15, { duration: 12000, easing: Easing.linear }),
      -1,
      true
    );

    return () => {
      cancelAnimation(cloudOffset);
    };
  }, [cloudOffset]);

  const cloudAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: cloudOffset.value }]
  }));

  // Greeting Logic
  const hour = new Date().getHours();
  let greeting = 'Selamat pagi';
  if (hour >= 12 && hour < 15) greeting = 'Selamat siang';
  else if (hour >= 15 && hour < 18) greeting = 'Selamat sore';
  else if (hour >= 18) greeting = 'Selamat malam';

  const firstName = userName ? userName.split(' ')[0] : 'Sobat';

  const [demoRain, setDemoRain] = useState<boolean | null>(null);

  const isNight = hour >= 18 || hour < 6;
  const isRaining =
    demoRain !== null
      ? demoRain
      : (weatherCondition?.toLowerCase().includes('hujan') ||
        weatherCondition?.toLowerCase().includes('rain') ||
        weatherCondition?.toLowerCase().includes('gerimis') ||
        weatherCondition?.toLowerCase().includes('drizzle') ||
        weatherCondition?.toLowerCase().includes('storm') ||
        farmerState === 'raining');

  useEffect(() => {
    if (isRaining) {
      rainAnim1.value = -RAIN_BOUNDS_HEIGHT;
      rainAnim1.value = withRepeat(
        withTiming(0, { duration: 750, easing: Easing.linear }),
        -1,
        false
      );

      rainAnim2.value = -RAIN_BOUNDS_HEIGHT;
      rainAnim2.value = withRepeat(
        withTiming(0, { duration: 1050, easing: Easing.linear }),
        -1,
        false
      );

      rainAnim3.value = -RAIN_BOUNDS_HEIGHT;
      rainAnim3.value = withRepeat(
        withTiming(0, { duration: 1350, easing: Easing.linear }),
        -1,
        false
      );

      splashAnim.value = 0;
      splashAnim.value = withRepeat(
        withTiming(1, { duration: 850, easing: Easing.linear }),
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
    transform: [{ scale: 0.5 + splashAnim.value * 0.7 }],
  }));

  // Memoized deterministic raindrop positions across scene width (bounded by RAIN_BOUNDS_HEIGHT)
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
  }, []);

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
  }, []);

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
  }, []);

  const splashPoints = useMemo(() => [
    { x: width * 0.18, y: 190 },
    { x: width * 0.38, y: 180 },
    { x: width * 0.62, y: 185 },
    { x: width * 0.82, y: 195 },
  ], []);

  let skyColor1 = '#DFF3E6';
  let skyColor2 = '#FBF8F1';

  if (isRaining) {
    skyColor1 = '#78909C';
    skyColor2 = '#CFD8DC';
  } else if (isNight) {
    skyColor1 = '#1A237E';
    skyColor2 = '#3949AB';
  } else if (hour >= 15 && hour < 18) {
    skyColor1 = '#FFB74D';
    skyColor2 = '#FFE082';
  }

  const toggleDemoRain = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    setDemoRain((prev) => (prev === null ? !isRaining : !prev));
  };

  const renderWeather = () => {
    if (isRaining) {
      return (
        <Pressable
          style={styles.weatherBox}
          onPress={() => router.push('/cuaca')}
          onLongPress={toggleDemoRain}
          delayLongPress={400}
        >
          <Feather name="cloud-rain" size={16} color="#4A90E2" />
          <Text style={styles.tempText}>Cuaca: {temperature}°C</Text>
        </Pressable>
      );
    } else if (weatherCondition?.toLowerCase().includes('berawan')) {
      return (
        <Pressable
          style={styles.weatherBox}
          onPress={() => router.push('/cuaca')}
          onLongPress={toggleDemoRain}
          delayLongPress={400}
        >
          <Feather name="cloud" size={16} color="#8F9B94" />
          <Text style={styles.tempText}>Cuaca: {temperature}°C</Text>
        </Pressable>
      );
    }
    return (
      <Pressable
        style={styles.weatherBox}
        onPress={() => router.push('/cuaca')}
        onLongPress={toggleDemoRain}
        delayLongPress={400}
      >
        <Feather name={isNight ? "moon" : "sun"} size={16} color={isNight ? "#90A4AE" : "#FFB627"} />
        <Text style={styles.tempText}>Cuaca: {temperature}°C</Text>
      </Pressable>
    );
  };

  return (
    <View style={styles.sceneContainer}>
      <View style={StyleSheet.absoluteFill}>
        <Svg width={width} height={SCENE_HEIGHT}>
          <Defs>
            <LinearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={skyColor1} stopOpacity="1" />
              <Stop offset="1" stopColor={skyColor2} stopOpacity="1" />
            </LinearGradient>
          </Defs>
          {/* Sky background */}
          <Rect x="0" y="0" width={width} height={SCENE_HEIGHT} fill="url(#skyGrad)" />

          {/* Sun / Moon */}
          {!isRaining && (
            <G x={width * 0.7} y={40}>
              {isNight ? (
                <>
                  <Circle cx="40" cy="40" r="36" fill="#FFFFFF" opacity={0.1} />
                  <Circle cx="40" cy="40" r="24" fill="#F4F6F0" opacity={0.9} />
                </>
              ) : (
                <>
                  <Circle cx="40" cy="40" r="48" fill="#FFEB3B" opacity={0.2} />
                  <Circle cx="40" cy="40" r="32" fill="#FFC107" opacity={0.8} />
                </>
              )}
            </G>
          )}

          {/* Distant Rolling Hills (Smooth curves instead of sharp lines) */}
          <Path d={`M -50,160 Q ${width * 0.2},100 ${width * 0.5},140 T ${width + 50},120 L ${width + 50},${SCENE_HEIGHT} L -50,${SCENE_HEIGHT} Z`} fill="#B2D8C6" opacity={0.6} />

          <Path d={`M -50,180 Q ${width * 0.3},120 ${width * 0.8},180 T ${width + 50},160 L ${width + 50},${SCENE_HEIGHT} L -50,${SCENE_HEIGHT} Z`} fill="#C8EAD4" opacity={0.8} />

          {/* Barn and Silo (Using G tag to position correctly inside SVG) */}
          <G x={width * 0.55} y={105}>
            {/* Silo */}
            <Rect x="60" y="35" width="16" height="40" fill="#E0E0E0" />
            <Path d="M 60,35 Q 68,10 76,35 Z" fill="#9E9E9E" />
            {/* Barn Body */}
            <Rect x="10" y="40" width="55" height="35" fill="#E53935" />
            {/* Barn Roof */}
            <Path d="M 5,45 L 37,10 L 70,45 Z" fill="#B71C1C" />
            {/* Barn Door */}
            <Rect x="30" y="55" width="15" height="20" fill="#FFFFFF" />
            {/* Barn Window */}
            <Circle cx="37" cy="30" r="4" fill="#FFFFFF" />
          </G>

          {/* Trees on the right */}
          <G x={width * 0.8} y={150}>
            <Rect x="12" y="20" width="5" height="15" fill="#795548" />
            <Path d="M 14,0 Q -2,0 -2,15 Q -2,30 14,30 Q 30,30 30,15 Q 30,0 14,0 Z" fill="#4CAF50" />
          </G>
          <G x={width * 0.88} y={160}>
            <Rect x="10" y="15" width="4" height="12" fill="#795548" />
            <Path d="M 12,2 Q 0,2 0,14 Q 0,25 12,25 Q 24,25 24,14 Q 24,2 12,2 Z" fill="#388E3C" />
          </G>

          {/* Mid Hill */}
          <Path d={`M -50,210 Q ${width * 0.4},150 ${width + 50},200 L ${width + 50},${SCENE_HEIGHT} L -50,${SCENE_HEIGHT} Z`} fill="#DDF1E3" />

          {/* Raised Beds (Kotak Perkebunan / Pot Panjang) */}
          <G x={(width - 250) / 2} y={170}>
            {/* Box 1 (Kiri) */}
            <G x="0" y="25">
              {/* Outer Box (Cream) */}
              <Rect x="0" y="0" width="70" height="40" fill="#FFF8E7" rx="8" />
              <Rect x="0" y="8" width="70" height="32" fill="#E8DCC0" rx="8" />
              {/* Soil (Brown) */}
              <Rect x="6" y="6" width="58" height="24" fill="#795548" rx="4" />
              {/* Crops */}
              <Circle cx="18" cy="18" r="6" fill="#4CAF50" />
              <Circle cx="35" cy="18" r="6" fill="#4CAF50" />
              <Circle cx="52" cy="18" r="6" fill="#4CAF50" />
            </G>

            {/* Box 2 (Tengah - Agak naik dikit ngikutin bukit) */}
            <G x="90" y="15">
              <Rect x="0" y="0" width="70" height="40" fill="#FFF8E7" rx="8" />
              <Rect x="0" y="8" width="70" height="32" fill="#E8DCC0" rx="8" />
              <Rect x="6" y="6" width="58" height="24" fill="#6D4C41" rx="4" />
              {/* Crops (Sprouts) */}
              <Path d="M 18,22 Q 18,12 24,12 Q 18,12 12,12" stroke="#81C784" strokeWidth="4" strokeLinecap="round" fill="none" />
              <Path d="M 35,22 Q 35,12 41,12 Q 35,12 29,12" stroke="#81C784" strokeWidth="4" strokeLinecap="round" fill="none" />
              <Path d="M 52,22 Q 52,12 58,12 Q 52,12 46,12" stroke="#81C784" strokeWidth="4" strokeLinecap="round" fill="none" />
            </G>

            {/* Box 3 (Kanan) */}
            <G x="180" y="25">
              <Rect x="0" y="0" width="70" height="40" fill="#FFF8E7" rx="8" />
              <Rect x="0" y="8" width="70" height="32" fill="#E8DCC0" rx="8" />
              <Rect x="6" y="6" width="58" height="24" fill="#795548" rx="4" />
              {/* Crops */}
              <Circle cx="18" cy="18" r="6" fill="#8BC34A" />
              <Circle cx="35" cy="18" r="6" fill="#8BC34A" />
              <Circle cx="52" cy="18" r="6" fill="#8BC34A" />
            </G>
          </G>

          {/* Night/Rain Overlay for scene elements */}
          {(isNight || isRaining) && (
            <Rect x="0" y="0" width={width} height={SCENE_HEIGHT} fill="#091530" opacity={isNight ? 0.3 : 0.1} />
          )}

          {/* Front Foreground (Cream color matching background to blend perfectly) */}
          <Path d={`M -20,245 Q ${width / 2},220 ${width + 20},255 L ${width + 20},${SCENE_HEIGHT} L -20,${SCENE_HEIGHT} Z`} fill="#FBF8F1" />
        </Svg>
      </View>

      {/* Top Bar (Greeting & Weather) */}
      <View style={styles.topBar}>
        <Pressable onPress={onProfilePress} style={styles.greetingWrapper}>
          <View style={styles.avatar}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={{ width: '100%', height: '100%', borderRadius: 20 }} contentFit="cover" />
            ) : (
              <Feather name="user" size={20} color="#3FA96B" />
            )}
          </View>
          <Text style={[styles.greetingText, isNight && { color: '#FFFFFF' }]} numberOfLines={1}>
            {greeting}, {firstName}!
          </Text>
        </Pressable>
        {renderWeather()}
      </View>

      {/* Drifting Clouds */}
      <Animated.View style={[styles.cloudLayer, cloudAnimatedStyle]}>
        <Svg width={width + 200} height={100}>
          {/* Cloud 1 (Bigger, full fluffy) */}
          <G x="30" y="30" opacity={isNight ? 0.2 : (isRaining ? 0.9 : 0.8)} fill={isRaining ? "#B0BEC5" : "#FFFFFF"}>
            <Circle cx="20" cy="20" r="14" />
            <Circle cx="40" cy="12" r="20" />
            <Circle cx="65" cy="22" r="16" />
            <Circle cx="42" cy="28" r="15" />
          </G>
          
          {/* Cloud 2 (Smaller, full fluffy) */}
          <G x="230" y="10" opacity={isNight ? 0.1 : (isRaining ? 0.7 : 0.5)} fill={isRaining ? "#CFD8DC" : "#FFFFFF"}>
            <Circle cx="15" cy="15" r="10" />
            <Circle cx="30" cy="10" r="14" />
            <Circle cx="45" cy="18" r="12" />
            <Circle cx="30" cy="22" r="11" />
          </G>
        </Svg>
      </Animated.View>

      {/* Raindrops Animation Layer */}
      {isRaining && (
        <View style={styles.rainContainer} pointerEvents="none">
          {/* Layer 3: Distant / misty raindrops */}
          <Animated.View style={[StyleSheet.absoluteFill, rainStyle3]}>
            <Svg width={width} height={RAIN_BOUNDS_HEIGHT * 2}>
              {layer3Drops.map((d, i) => (
                <G key={`l3-${i}`}>
                  <Line x1={d.x} y1={d.y} x2={d.x - 2} y2={d.y + d.len} stroke="#C4E1F8" strokeWidth={1} strokeLinecap="round" opacity={0.4} />
                  <Line x1={d.x} y1={d.y + RAIN_BOUNDS_HEIGHT} x2={d.x - 2} y2={d.y + d.len + RAIN_BOUNDS_HEIGHT} stroke="#C4E1F8" strokeWidth={1} strokeLinecap="round" opacity={0.4} />
                </G>
              ))}
            </Svg>
          </Animated.View>

          {/* Layer 2: Midground raindrops */}
          <Animated.View style={[StyleSheet.absoluteFill, rainStyle2]}>
            <Svg width={width} height={RAIN_BOUNDS_HEIGHT * 2}>
              {layer2Drops.map((d, i) => (
                <G key={`l2-${i}`}>
                  <Line x1={d.x} y1={d.y} x2={d.x - 3} y2={d.y + d.len} stroke="#A0CBEF" strokeWidth={1.3} strokeLinecap="round" opacity={0.65} />
                  <Line x1={d.x} y1={d.y + RAIN_BOUNDS_HEIGHT} x2={d.x - 3} y2={d.y + d.len + RAIN_BOUNDS_HEIGHT} stroke="#A0CBEF" strokeWidth={1.3} strokeLinecap="round" opacity={0.65} />
                </G>
              ))}
            </Svg>
          </Animated.View>

          {/* Layer 1: Foreground raindrops */}
          <Animated.View style={[StyleSheet.absoluteFill, rainStyle1]}>
            <Svg width={width} height={RAIN_BOUNDS_HEIGHT * 2}>
              {layer1Drops.map((d, i) => (
                <G key={`l1-${i}`}>
                  <Line x1={d.x} y1={d.y} x2={d.x - 4} y2={d.y + d.len} stroke="#85BEE9" strokeWidth={1.7} strokeLinecap="round" opacity={0.85} />
                  <Line x1={d.x} y1={d.y + RAIN_BOUNDS_HEIGHT} x2={d.x - 4} y2={d.y + d.len + RAIN_BOUNDS_HEIGHT} stroke="#85BEE9" strokeWidth={1.7} strokeLinecap="round" opacity={0.85} />
                </G>
              ))}
            </Svg>
          </Animated.View>

          {/* Splash ripples hitting the ground */}
          <Animated.View style={[StyleSheet.absoluteFill, splashStyle]}>
            <Svg width={width} height={RAIN_BOUNDS_HEIGHT}>
              {splashPoints.map((p, i) => (
                <Ellipse
                  key={`splash-${i}`}
                  cx={p.x}
                  cy={p.y}
                  rx={6}
                  ry={2.5}
                  stroke="#90CAF9"
                  strokeWidth={1.2}
                  fill="none"
                  opacity={0.6}
                />
              ))}
            </Svg>
          </Animated.View>
        </View>
      )}

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
  topBar: {
    position: 'absolute',
    top: 48,
    left: 24,
    right: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  greetingWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 16,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    shadowColor: '#1B4332',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  greetingText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 20,
    color: '#1B4332',
    flexShrink: 1,
  },
  weatherBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
    shadowColor: '#1B4332',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F3E5F5'
  },
  tempText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: '#5C5A4F',
  },
  cloudLayer: {
    position: 'absolute',
    top: 40,
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
    zIndex: 1,
  },
});
