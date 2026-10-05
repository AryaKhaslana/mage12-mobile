import React, { useEffect } from 'react';
import { View, Text, Dimensions, StyleSheet } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withRepeat, 
  withSequence, 
  Easing 
} from 'react-native-reanimated';
import { Image } from 'expo-image';

const { width } = Dimensions.get('window');

interface AuthHeaderProps {
  isPasswordFocused: boolean;
  title: string;
  subtitle: string;
}

export default function AuthHeader({ isPasswordFocused, title, subtitle }: AuthHeaderProps) {
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.03, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1, 
      true 
    );
  }, []);

  useEffect(() => {
    if (isPasswordFocused) {
      translateY.value = withTiming(80, { duration: 300, easing: Easing.inOut(Easing.ease) });
    } else {
      translateY.value = withTiming(0, { duration: 300, easing: Easing.inOut(Easing.ease) });
    }
  }, [isPasswordFocused]);

  const mascotStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { translateY: translateY.value }
      ]
    };
  });

  // To make the clouds curve in a U-shape (arch downwards), we use a base curved path
  // and add circles along the curve to keep the "cloud" bumpy texture!
  // We'll use 3 layers of clouds, transitioning from Soft Green to Cream.

  return (
    <View style={styles.headerContainer}>
      {/* Decorative Sparkles */}
      <View style={{ position: 'absolute', top: 60, left: 40, width: 20, height: 20, borderRadius: 10, backgroundColor: '#52A875', opacity: 0.2 }} />
      <View style={{ position: 'absolute', top: 40, right: 60, width: 14, height: 14, borderRadius: 7, backgroundColor: '#3FA96B', opacity: 0.3 }} />

      {/* Mascot Layer (Behind Clouds) */}
      <Animated.View style={[styles.mascotContainer, mascotStyle]}>
        <Image
          source={require("../assets/images/icontampilanawal/seedling-ngintip.svg")}
          style={{ width: 180, height: 180 }}
          contentFit="contain"
        />
      </Animated.View>

      {/* Cloud Layers */}
      <View style={styles.cloudWrapper}>
        <Svg width={width} height="240" style={{ position: 'absolute', bottom: 0 }}>
          
          {/* Layer 1 (Back) */}
          <Path d={`M -20,100 Q ${width/2},220 ${width+20},100 L ${width+20},240 L -20,240 Z`} fill="#E5F5EB" opacity={0.8} />
          <Circle cx={width * 0.1} cy={130} r={45} fill="#E5F5EB" opacity={0.8} />
          <Circle cx={width * 0.3} cy={155} r={65} fill="#E5F5EB" opacity={0.8} />
          <Circle cx={width * 0.7} cy={160} r={75} fill="#E5F5EB" opacity={0.8} />
          <Circle cx={width * 0.9} cy={120} r={55} fill="#E5F5EB" opacity={0.8} />

          {/* Layer 2 (Middle) */}
          <Path d={`M -20,130 Q ${width/2},240 ${width+20},130 L ${width+20},240 L -20,240 Z`} fill="#F0FAF4" opacity={0.9} />
          <Circle cx={width * 0.2} cy={165} r={55} fill="#F0FAF4" opacity={0.9} />
          <Circle cx={width * 0.5} cy={195} r={70} fill="#F0FAF4" opacity={0.9} />
          <Circle cx={width * 0.8} cy={175} r={60} fill="#F0FAF4" opacity={0.9} />

          {/* Layer 3 (Front, matching cream background) */}
          <Path d={`M -20,160 Q ${width/2},260 ${width+20},160 L ${width+20},240 L -20,240 Z`} fill="#FBF8F1" />
          <Circle cx={width * 0.15} cy={190} r={45} fill="#FBF8F1" />
          <Circle cx={width * 0.45} cy={220} r={60} fill="#FBF8F1" />
          <Circle cx={width * 0.85} cy={195} r={55} fill="#FBF8F1" />
          <Circle cx={width * 1.05} cy={165} r={40} fill="#FBF8F1" />
        </Svg>
      </View>

      {/* Text Container */}
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    height: 380,
    width: '100%',
    position: 'relative',
    backgroundColor: '#DFF3E6', // Full Soft Green Background as requested
  },
  mascotContainer: {
    position: 'absolute',
    bottom: 90, // Adjusted so it peeks out above the deeper curve
    width: '100%',
    alignItems: 'center',
    zIndex: 1,
  },
  cloudWrapper: {
    position: 'absolute',
    bottom: 40, // Increased to make room for the deep U-shape curve
    width: '100%',
    height: 240,
    zIndex: 2,
  },
  textContainer: {
    position: 'absolute',
    bottom: 0, 
    width: '100%',
    alignItems: 'center',
    zIndex: 3,
  },
  title: {
    fontSize: 28,
    fontFamily: "Nunito_800ExtraBold",
    color: "#1B4332",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: "Nunito_500Medium",
    color: "#5C5A4F",
  },
});
