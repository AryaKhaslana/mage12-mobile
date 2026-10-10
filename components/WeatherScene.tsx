import React, { useEffect } from 'react';
import { View, Dimensions, StyleSheet } from 'react-native';
import Svg, { Rect, Circle, Path, G, LinearGradient, Stop, Defs } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming, Easing } from 'react-native-reanimated';

const SCENE_HEIGHT = 280;

export default function WeatherScene({ weatherCondition, isNight }: { weatherCondition: string, isNight?: boolean }) {
  const { width } = Dimensions.get('window');

  // Animations
  const mascotY = useSharedValue(0);
  const cloudX = useSharedValue(0);

  useEffect(() => {
    // Mascot bounce
    mascotY.value = withRepeat(
      withSequence(
        withTiming(-12, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        withTiming(12, { duration: 1200, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Clouds drifting
    cloudX.value = withRepeat(
      withTiming(-width, { duration: 25000, easing: Easing.linear }),
      -1,
      false
    );
  }, [width]);

  const mascotStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: mascotY.value }]
  }));
  const cloudStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: cloudX.value }]
  }));

  // Handle both Indonesian ("HUJAN", "BERAWAN", "CERAH") and English ("RAIN", "CLOUDS", "CLEAR")
  const cond = (weatherCondition || '').trim().toUpperCase();
  const isRain = cond.includes('HUJAN') || cond.includes('GERIMIS') || cond === 'RAIN' || cond.includes('RAIN') || cond === 'DRIZZLE' || cond.includes('THUNDER');
  const isCloudy = !isRain && (cond.includes('BERAWAN') || cond.includes('AWAN') || cond.includes('MENDUNG') || cond === 'CLOUDS' || cond.includes('CLOUD') || cond === 'OVERCAST');
  const isClear = !isRain && !isCloudy;

  // Dynamic colors
  const skyTop = isNight ? '#091530' : isRain ? '#607D8B' : isCloudy ? '#78909C' : '#64B5F6';
  const skyBottom = isNight ? (isRain ? '#37474F' : '#1A237E') : isRain ? '#90A4AE' : isCloudy ? '#B0BEC5' : '#BBDEFB';
  const hillBack = isNight ? '#1E392A' : isRain ? '#81C784' : isCloudy ? '#81C784' : '#A5D6A7';
  const hillFront = isNight ? '#142E20' : isRain ? '#4CAF50' : isCloudy ? '#4CAF50' : '#81C784';

  return (
    <View style={styles.container}>
      <Svg width={width} height={SCENE_HEIGHT}>
        <Defs>
          <LinearGradient id="sky" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor={skyTop} />
            <Stop offset="100%" stopColor={skyBottom} />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width={width} height={SCENE_HEIGHT} fill="url(#sky)" />

        {/* Stars if night and not raining */}
        {isNight && !isRain && (
          <G fill="#FFFFFF" opacity="0.6">
            <Circle cx={width * 0.2} cy="40" r="1.5" />
            <Circle cx={width * 0.8} cy="70" r="2" />
            <Circle cx={width * 0.5} cy="30" r="1" />
            <Circle cx={width * 0.9} cy="20" r="1.5" />
          </G>
        )}

        {/* Hills */}
        <Path d={`M -50,180 Q ${width * 0.25},110 ${width * 0.6},170 T ${width + 50},140 L ${width + 50},${SCENE_HEIGHT} L -50,${SCENE_HEIGHT} Z`} fill={hillBack} opacity={0.8} />
        <Path d={`M -50,220 Q ${width * 0.4},150 ${width + 50},210 L ${width + 50},${SCENE_HEIGHT} L -50,${SCENE_HEIGHT} Z`} fill={hillFront} />
        
        {/* Soft blend to bottom sheet */}
        <Path d={`M -20,260 Q ${width / 2},240 ${width + 20},270 L ${width + 20},${SCENE_HEIGHT} L -20,${SCENE_HEIGHT} Z`} fill="#FBF8F1" />
      </Svg>

      {/* Drifting Background Clouds */}
      {!isRain && (
        <Animated.View style={[styles.layer, cloudStyle, { top: 30, opacity: isNight ? 0.2 : isCloudy ? 0.85 : 0.4 }]}>
          <Svg width={width * 2} height="100">
            <G fill="#FFFFFF">
              <Circle cx="50" cy="40" r="25" />
              <Circle cx="80" cy="30" r="35" />
              <Circle cx="120" cy="45" r="25" />
              
              <Circle cx={width + 50} cy="50" r="20" />
              <Circle cx={width + 90} cy="40" r="30" />
              <Circle cx={width + 120} cy="55" r="20" />
            </G>
          </Svg>
        </Animated.View>
      )}

      {/* Cute Mascot */}
      <Animated.View style={[styles.mascotWrapper, mascotStyle]}>
        <Svg width="160" height="160" viewBox="0 0 160 160">
          {isRain ? (
            // Cute Rain Cloud (HUJAN / RAIN)
            <G>
              <Path d="M40,90 A30,30 0 0,1 40,30 A40,40 0 0,1 110,25 A35,35 0 0,1 120,90 Z" fill={isNight ? "#546E7A" : "#90A4AE"} />
              {/* Rain drops */}
              <Path d="M50,100 L45,115 M80,105 L75,120 M110,95 L105,110" stroke="#64B5F6" strokeWidth="4" strokeLinecap="round" />
              {/* Face */}
              <Circle cx="65" cy="65" r="4" fill="#1B4332" />
              <Circle cx="95" cy="65" r="4" fill="#1B4332" />
              <Path d="M75,70 Q80,75 85,70" fill="none" stroke="#1B4332" strokeWidth="3" strokeLinecap="round" />
              {/* Blush */}
              <Circle cx="55" cy="70" r="5" fill="#FF8A65" opacity={0.5} />
              <Circle cx="105" cy="70" r="5" fill="#FF8A65" opacity={0.5} />
            </G>
          ) : isNight ? (
            // Cute Moon (Night when not raining)
            <G>
              <Path d="M100,20 A50,50 0 1,0 130,100 A60,60 0 1,1 100,20 Z" fill="#FFE082" />
              {/* Sleeping face */}
              <Path d="M60,65 Q65,70 70,65" fill="none" stroke="#5C5A4F" strokeWidth="3" strokeLinecap="round" />
              <Path d="M85,65 Q90,70 95,65" fill="none" stroke="#5C5A4F" strokeWidth="3" strokeLinecap="round" />
            </G>
          ) : isCloudy ? (
            // Cute Fluffy Cloud (BERAWAN / CLOUDS)
            <G>
              <Path d="M40,90 A30,30 0 0,1 40,30 A40,40 0 0,1 110,25 A35,35 0 0,1 120,90 Z" fill="#FFFFFF" stroke="#CFD8DC" strokeWidth="2.5" />
              {/* Face */}
              <Circle cx="65" cy="65" r="4" fill="#5C5A4F" />
              <Circle cx="95" cy="65" r="4" fill="#5C5A4F" />
              <Path d="M75,70 Q80,76 85,70" fill="none" stroke="#5C5A4F" strokeWidth="3" strokeLinecap="round" />
              {/* Blush */}
              <Circle cx="55" cy="70" r="5" fill="#FFAB91" opacity={0.6} />
              <Circle cx="105" cy="70" r="5" fill="#FFAB91" opacity={0.6} />
            </G>
          ) : (
            // Cute Sun (CERAH / CLEAR)
            <G>
              {/* Sun rays (soft) */}
              <Circle cx="80" cy="80" r="65" fill="#FFF59D" opacity={0.4} />
              <Circle cx="80" cy="80" r="55" fill="#FFF176" opacity={0.7} />
              <Circle cx="80" cy="80" r="45" fill="#FFD54F" />
              {/* Face */}
              <Circle cx="68" cy="75" r="4" fill="#5C5A4F" />
              <Circle cx="92" cy="75" r="4" fill="#5C5A4F" />
              <Path d="M75,82 Q80,88 85,82" fill="none" stroke="#5C5A4F" strokeWidth="3" strokeLinecap="round" />
              {/* Blush */}
              <Circle cx="58" cy="82" r="5" fill="#FF8A65" opacity={0.5} />
              <Circle cx="102" cy="82" r="5" fill="#FF8A65" opacity={0.5} />
            </G>
          )}
        </Svg>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: SCENE_HEIGHT,
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 0,
  },
  layer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  mascotWrapper: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 20,
    zIndex: 5,
  }
});
