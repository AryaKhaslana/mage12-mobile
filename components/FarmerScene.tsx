import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useEffect } from 'react';
import { Dimensions, StyleSheet, Text, View, Pressable } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import Svg, { Circle, Defs, G, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');
const SCENE_HEIGHT = 280;

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
  onProfilePress,
}: FarmerSceneProps) {
  const cloudOffset = useSharedValue(0);

  useEffect(() => {
    // Slow drifting clouds
    cloudOffset.value = withRepeat(
      withTiming(width * 0.15, { duration: 12000, easing: Easing.linear }),
      -1,
      true
    );
  }, []);

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

  const isNight = hour >= 18 || hour < 6;
  const isRaining = weatherCondition?.toLowerCase().includes('hujan');

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

  const renderWeather = () => {
    if (weatherCondition?.toLowerCase().includes('hujan')) {
      return (
        <Pressable style={styles.weatherBox} onPress={() => router.push('/cuaca')}>
          <Feather name="cloud-rain" size={16} color="#4A90E2" />
          <Text style={styles.tempText}>{temperature}°C</Text>
        </Pressable>
      );
    } else if (weatherCondition?.toLowerCase().includes('berawan')) {
      return (
        <Pressable style={styles.weatherBox} onPress={() => router.push('/cuaca')}>
          <Feather name="cloud" size={16} color="#8F9B94" />
          <Text style={styles.tempText}>{temperature}°C</Text>
        </Pressable>
      );
    }
    return (
      <Pressable style={styles.weatherBox} onPress={() => router.push('/cuaca')}>
        <Feather name={isNight ? "moon" : "sun"} size={16} color={isNight ? "#90A4AE" : "#FFB627"} />
        <Text style={styles.tempText}>{temperature}°C</Text>
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
          <G x="30" y="30" opacity={isNight ? 0.2 : 0.8} fill="#FFFFFF">
            <Circle cx="20" cy="20" r="14" />
            <Circle cx="40" cy="12" r="20" />
            <Circle cx="65" cy="22" r="16" />
            <Circle cx="42" cy="28" r="15" />
          </G>
          
          {/* Cloud 2 (Smaller, full fluffy) */}
          <G x="230" y="10" opacity={isNight ? 0.1 : 0.5} fill="#FFFFFF">
            <Circle cx="15" cy="15" r="10" />
            <Circle cx="30" cy="10" r="14" />
            <Circle cx="45" cy="18" r="12" />
            <Circle cx="30" cy="22" r="11" />
          </G>
        </Svg>
      </Animated.View>

    </View>
  );
}

const styles = StyleSheet.create({
  sceneContainer: {
    width: '100%',
    height: SCENE_HEIGHT,
    position: 'relative',
    backgroundColor: '#FBF8F1',
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
    backgroundColor: 'rgba(255,255,255,0.8)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
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
});
