import React, { useEffect } from 'react';
import { View, Text, Dimensions, StyleSheet } from 'react-native';
import Svg, { Circle, Rect } from 'react-native-svg';
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
  // Mascot breathing
  const scale = useSharedValue(1);
  // Mascot hiding
  const translateY = useSharedValue(0);

  useEffect(() => {
    // Breathing animation
    scale.value = withRepeat(
      withSequence(
        withTiming(1.03, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1, // infinite
      true // reverse
    );
  }, []);

  useEffect(() => {
    // Hide behind clouds when typing password
    if (isPasswordFocused) {
      translateY.value = withTiming(90, { duration: 300, easing: Easing.inOut(Easing.ease) });
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
          style={{ width: 190, height: 190 }}
          contentFit="contain"
        />
      </Animated.View>

      {/* Cloud Layers */}
      <View style={styles.cloudWrapper}>
        <Svg width={width} height="120" style={{ position: 'absolute', bottom: 0 }}>
          {/* Layer 1 (Back, opacity 40%) */}
          <Circle cx={width * 0.15} cy={80} r={40} fill="#DFF3E6" opacity={0.4} />
          <Circle cx={width * 0.50} cy={70} r={60} fill="#DFF3E6" opacity={0.4} />
          <Circle cx={width * 0.85} cy={80} r={45} fill="#DFF3E6" opacity={0.4} />
          <Rect x={0} y={80} width={width} height={40} fill="#DFF3E6" opacity={0.4} />
          
          {/* Layer 2 (Middle, opacity 70%) */}
          <Circle cx={width * 0.25} cy={90} r={35} fill="#DFF3E6" opacity={0.7} />
          <Circle cx={width * 0.65} cy={85} r={50} fill="#DFF3E6" opacity={0.7} />
          <Circle cx={width * 0.95} cy={95} r={35} fill="#DFF3E6" opacity={0.7} />
          <Rect x={0} y={90} width={width} height={30} fill="#DFF3E6" opacity={0.7} />

          {/* Layer 3 (Front, Solid matching background) */}
          <Circle cx={width * 0.05} cy={110} r={30} fill="#FBF8F1" />
          <Circle cx={width * 0.35} cy={105} r={40} fill="#FBF8F1" />
          <Circle cx={width * 0.75} cy={100} r={50} fill="#FBF8F1" />
          <Circle cx={width * 1.00} cy={110} r={35} fill="#FBF8F1" />
          <Rect x={0} y={105} width={width} height={15} fill="#FBF8F1" />
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
    height: 360,
    width: '100%',
    position: 'relative',
    backgroundColor: '#FFFFFF', // Clean background at the very top
  },
  mascotContainer: {
    position: 'absolute',
    bottom: 50, // Peeking over the clouds
    width: '100%',
    alignItems: 'center',
    zIndex: 1,
  },
  cloudWrapper: {
    position: 'absolute',
    bottom: 30, // Pushed up slightly so the text drops naturally into FBF8F1
    width: '100%',
    height: 120,
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
