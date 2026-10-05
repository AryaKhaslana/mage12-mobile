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
          style={{ width: 170, height: 170 }}
          contentFit="contain"
        />
      </Animated.View>

      {/* Cloud Layers (U-Shape Valley of Clouds sitting at the bottom) */}
      <View style={styles.cloudWrapper}>
        <Svg width={width} height="200" style={{ position: 'absolute', bottom: 0 }}>
          
          {/* Layer 1 (Back) */}
          <Path d={`M 0,40 Q ${width/2},140 ${width},40 L ${width},200 L 0,200 Z`} fill="#E5F5EB" />
          <Circle cx={0} cy={40} r={40} fill="#E5F5EB" />
          <Circle cx={width*0.25} cy={90} r={55} fill="#E5F5EB" />
          <Circle cx={width*0.5} cy={140} r={65} fill="#E5F5EB" />
          <Circle cx={width*0.75} cy={90} r={55} fill="#E5F5EB" />
          <Circle cx={width} cy={40} r={40} fill="#E5F5EB" />

          {/* Layer 2 (Middle) */}
          <Path d={`M 0,60 Q ${width/2},160 ${width},60 L ${width},200 L 0,200 Z`} fill="#F0FAF4" />
          <Circle cx={0} cy={60} r={35} fill="#F0FAF4" />
          <Circle cx={width*0.25} cy={110} r={50} fill="#F0FAF4" />
          <Circle cx={width*0.5} cy={160} r={60} fill="#F0FAF4" />
          <Circle cx={width*0.75} cy={110} r={50} fill="#F0FAF4" />
          <Circle cx={width} cy={60} r={35} fill="#F0FAF4" />

          {/* Layer 3 (Front, matching cream background) */}
          <Path d={`M 0,80 Q ${width/2},180 ${width},80 L ${width},200 L 0,200 Z`} fill="#FBF8F1" />
          <Circle cx={0} cy={80} r={30} fill="#FBF8F1" />
          <Circle cx={width*0.25} cy={130} r={45} fill="#FBF8F1" />
          <Circle cx={width*0.5} cy={180} r={55} fill="#FBF8F1" />
          <Circle cx={width*0.75} cy={130} r={45} fill="#FBF8F1" />
          <Circle cx={width} cy={80} r={30} fill="#FBF8F1" />

        </Svg>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    height: 320, // Reduced height since text is moved to ScrollView
    width: '100%',
    position: 'relative',
    backgroundColor: '#DFF3E6', 
  },
  mascotContainer: {
    position: 'absolute',
    bottom: 80, // Peeking from the bottom center valley
    width: '100%',
    alignItems: 'center',
    zIndex: 1,
  },
  cloudWrapper: {
    position: 'absolute',
    bottom: 0, 
    width: '100%',
    height: 200,
    zIndex: 2,
  },
});
