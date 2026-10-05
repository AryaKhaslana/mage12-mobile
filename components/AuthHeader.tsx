import React, { useEffect } from 'react';
import { View, Dimensions, StyleSheet } from 'react-native';
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
}

export default function AuthHeader({ isPasswordFocused }: AuthHeaderProps) {
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

  return (
    <View style={styles.headerContainer}>
      {/* Decorative Sparkles */}
      <View style={{ position: 'absolute', top: 60, left: 40, width: 20, height: 20, borderRadius: 10, backgroundColor: '#52A875', opacity: 0.2 }} />
      <View style={{ position: 'absolute', top: 40, right: 60, width: 14, height: 14, borderRadius: 7, backgroundColor: '#3FA96B', opacity: 0.3 }} />

      {/* Mascot Layer (Behind Clouds) */}
      <Animated.View style={[styles.mascotContainer, mascotStyle]}>
        <Image
          source={require("../assets/images/icontampilanawal/seedling-ngintip.svg")}
          style={{ width: 200, height: 200 }}
          contentFit="contain"
        />
      </Animated.View>

      {/* Cloud Layers (U-Shape Valley of Clouds sitting at the bottom) */}
      <View style={styles.cloudWrapper}>
        <Svg width={width} height="240" style={{ position: 'absolute', bottom: 0 }}>
          {/* Layer 1 (Back) */}
          <Path d={`M 0,50 Q ${width*0.6},180 ${width},40 L ${width},240 L 0,240 Z`} fill="#BFE3CD" />
          <Circle cx={width*-0.1} cy={50} r={60} fill="#BFE3CD" />
          <Circle cx={width*0.2} cy={70} r={70} fill="#BFE3CD" />
          <Circle cx={width*0.4} cy={120} r={55} fill="#BFE3CD" />
          <Circle cx={width*0.55} cy={150} r={80} fill="#BFE3CD" />
          <Circle cx={width*0.8} cy={110} r={50} fill="#BFE3CD" />
          <Circle cx={width*1.1} cy={60} r={75} fill="#BFE3CD" />

          {/* Layer 2 (Middle) */}
          <Path d={`M 0,80 Q ${width*0.45},200 ${width},70 L ${width},240 L 0,240 Z`} fill="#D6EFE0" />
          <Circle cx={width*-0.05} cy={90} r={45} fill="#D6EFE0" />
          <Circle cx={width*0.1} cy={120} r={65} fill="#D6EFE0" />
          <Circle cx={width*0.35} cy={160} r={55} fill="#D6EFE0" />
          <Circle cx={width*0.5} cy={185} r={65} fill="#D6EFE0" />
          <Circle cx={width*0.7} cy={150} r={80} fill="#D6EFE0" />
          <Circle cx={width*0.9} cy={110} r={45} fill="#D6EFE0" />
          <Circle cx={width*1.05} cy={80} r={55} fill="#D6EFE0" />

          {/* Layer 3 (Front, matching cream background) */}
          <Path d={`M 0,110 Q ${width*0.4},220 ${width},100 L ${width},240 L 0,240 Z`} fill="#FBF8F1" />
          <Circle cx={width*-0.05} cy={110} r={50} fill="#FBF8F1" />
          <Circle cx={width*0.15} cy={150} r={45} fill="#FBF8F1" />
          <Circle cx={width*0.3} cy={180} r={60} fill="#FBF8F1" />
          <Circle cx={width*0.5} cy={205} r={50} fill="#FBF8F1" />
          <Circle cx={width*0.65} cy={180} r={75} fill="#FBF8F1" />
          <Circle cx={width*0.85} cy={130} r={55} fill="#FBF8F1" />
          <Circle cx={width*1.05} cy={100} r={60} fill="#FBF8F1" />
        </Svg>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    height: 380, // Reduced height since text is moved to ScrollView
    width: '100%',
    position: 'relative',
    backgroundColor: '#DFF3E6', 
  },
  mascotContainer: {
    position: 'absolute',
    bottom: 110, // Peeking from the bottom center valley
    width: '100%',
    alignItems: 'center',
    zIndex: 1,
    shadowColor: "#1B4332", 
    shadowOffset: { width: 0, height: 12 }, 
    shadowOpacity: 0.2, 
    shadowRadius: 16, 
    elevation: 10,
  },
  cloudWrapper: {
    position: 'absolute',
    bottom: 0, 
    width: '100%',
    height: 240,
    zIndex: 2,
  },
});
