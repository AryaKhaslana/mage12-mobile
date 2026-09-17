import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, Dimensions, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import Svg, { Defs, Mask, Rect } from 'react-native-svg';

export type CoachMarkStep = {
  rect: { x: number; y: number; width: number; height: number };
  title: string;
  description: string;
  borderRadius?: number;
};

interface CoachMarkOverlayProps {
  visible: boolean;
  steps: CoachMarkStep[];
  onFinish: () => void;
  onSkip: () => void;
}

const AnimatedRect = Animated.createAnimatedComponent(Rect);

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BUBBLE_WIDTH = SCREEN_WIDTH - 48; // 24px padding on sides

export default function CoachMarkOverlay({ visible, steps, onFinish, onSkip }: CoachMarkOverlayProps) {
  const [currentStepIndex, setCurrentStepIndex] = React.useState(0);
  const [showConfirmSkip, setShowConfirmSkip] = React.useState(false);

  const currentX = useSharedValue(0);
  const currentY = useSharedValue(0);
  const currentW = useSharedValue(0);
  const currentH = useSharedValue(0);
  const currentR = useSharedValue(0);
  const opacity = useSharedValue(0);

  // Initialize values when visible
  useEffect(() => {
    if (visible && steps.length > 0) {
      setCurrentStepIndex(0);
      const step = steps[0];
      currentX.value = step.rect.x;
      currentY.value = step.rect.y;
      currentW.value = step.rect.width;
      currentH.value = step.rect.height;
      currentR.value = step.borderRadius || 12;
      opacity.value = withTiming(1, { duration: 300 });
    } else {
      opacity.value = withTiming(0, { duration: 300 });
    }
  }, [visible, steps]);

  // Update target coordinates when step changes
  useEffect(() => {
    if (visible && steps[currentStepIndex]) {
      const step = steps[currentStepIndex];
      const config = { damping: 15, stiffness: 120 };
      // Tambah padding 8px biar ujungnya (border-radius) nggak motong teks/konten
      currentX.value = withSpring(step.rect.x - 8, config);
      currentY.value = withSpring(step.rect.y - 8, config);
      currentW.value = withSpring(step.rect.width + 16, config);
      currentH.value = withSpring(step.rect.height + 16, config);
      currentR.value = withSpring(step.borderRadius || 12, config);
    }
  }, [currentStepIndex, visible, steps]);

  const B = 2000; // Huge border thickness
  const maskStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    top: currentY.value - B,
    left: currentX.value - B,
    width: currentW.value + 2 * B,
    height: currentH.value + 2 * B,
    borderWidth: B,
    borderColor: 'rgba(18,57,36,0.75)',
    borderRadius: currentR.value + B,
  }));
  const borderHighlightStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    left: currentX.value - 2,
    top: currentY.value - 2,
    width: currentW.value + 4,
    height: currentH.value + 4,
    borderRadius: currentR.value + 2,
    borderWidth: 2,
    borderColor: '#3FA86B'
  }));

  const bubbleStyle = useAnimatedStyle(() => {
    // Determine whether to place bubble above or below the cutout
    const targetBottom = currentY.value + currentH.value;
    const targetTop = currentY.value;
    
    // If target is in lower half, bubble goes above. Otherwise below.
    // Adding some padding (16px) between cutout and bubble.
    const bubbleY = targetBottom + 200 > SCREEN_HEIGHT 
      ? targetTop - 16 - 150 // approximate bubble height
      : targetBottom + 16;
      
    // Prevent bubble from going off screen vertically
    const safeY = Math.max(48, Math.min(bubbleY, SCREEN_HEIGHT - 200));

    // For X, center horizontally relative to screen
    const bubbleX = 24;

    return {
      position: 'absolute',
      left: bubbleX,
      top: withSpring(safeY, { damping: 15, stiffness: 120 }),
      width: BUBBLE_WIDTH,
      opacity: opacity.value,
    };
  });

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    flex: 1,
  }));

  if (!visible || steps.length === 0) return null;

  const currentStep = steps[currentStepIndex];
  const isLastStep = currentStepIndex === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onFinish();
    } else {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  return (
    <Modal transparent visible={visible} animationType="none" statusBarTranslucent>
      <Animated.View style={[StyleSheet.absoluteFill, overlayStyle]}>
        {/* PURE VIEW OVERLAY FOR BETTER PERFORMANCE (HUGE BORDER TRICK) */}
        <Animated.View style={maskStyle} />
        <Animated.View style={borderHighlightStyle} />

        <Animated.View style={bubbleStyle}>
          {/* Hard shadow layer */}
          <View style={styles.bubbleShadow} />
          
          <View style={styles.bubbleContent}>
            <View style={styles.bubbleHeader}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>
                  {currentStepIndex + 1}/{steps.length}
                </Text>
              </View>
              <Text style={styles.bubbleTitle}>{currentStep?.title}</Text>
            </View>
            <Text style={styles.bubbleDesc}>{currentStep?.description}</Text>

            <View style={styles.footerRow}>
              <Pressable onPress={() => setShowConfirmSkip(true)} style={styles.skipButton}>
                <Text style={styles.skipText}>Lewati Tutorial</Text>
              </Pressable>
              
              <Pressable 
                style={({ pressed }) => [
                  styles.nextButton,
                  pressed && { transform: [{ translateX: 2 }, { translateY: 2 }] }
                ]}
                onPress={handleNext}
              >
                <Text style={styles.nextText}>
                  {isLastStep ? "Mengerti!" : "Lanjut"}
                </Text>
              </Pressable>
            </View>
          </View>
        </Animated.View>

        {/* NEOBRUTALISM SKIP CONFIRMATION MODAL */}
        <Modal transparent visible={showConfirmSkip} animationType="fade">
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
            <View style={{ width: '100%', backgroundColor: '#FFFFFF', borderRadius: 24, borderWidth: 3, borderColor: '#123924', padding: 24 }}>
              <Text style={{ fontFamily: 'Nunito_800ExtraBold', fontSize: 20, color: '#123924', textAlign: 'center', marginBottom: 8 }}>
                Yakin mau skip broskie? 🥺
              </Text>
              <Text style={{ fontFamily: 'Nunito_500Medium', fontSize: 14, color: '#5C5A4F', textAlign: 'center', marginBottom: 24 }}>
                Nanti kamu kebingungan lho pas ngurus tanaman. Bentar doang kok tutorialnya!
              </Text>
              
              <View style={{ gap: 12 }}>
                <Pressable
                  onPress={() => setShowConfirmSkip(false)}
                  style={({ pressed }) => [{
                    backgroundColor: '#3FA86B', paddingVertical: 14, borderRadius: 999, borderWidth: 2, borderColor: '#123924', alignItems: 'center'
                  }, pressed && { transform: [{ translateY: 2 }] }]}
                >
                  <Text style={{ fontFamily: 'Nunito_800ExtraBold', fontSize: 16, color: '#FFFFFF' }}>Lanjut Belajar</Text>
                </Pressable>
                
                <Pressable
                  onPress={() => { setShowConfirmSkip(false); onSkip(); }}
                  style={{ paddingVertical: 14, alignItems: 'center' }}
                >
                  <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: 16, color: '#FF6B5C' }}>Ya, Lewati Aja</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  bubbleShadow: {
    position: 'absolute',
    top: 3,
    left: 3,
    right: -3,
    bottom: -3,
    backgroundColor: '#123924',
    borderRadius: 20,
  },
  bubbleContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#123924',
    padding: 20,
  },
  bubbleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  stepBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3FA86B',
  },
  stepBadgeText: {
    color: '#3FA86B',
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 12,
  },
  bubbleTitle: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 16,
    color: '#123924',
    flex: 1,
  },
  bubbleDesc: {
    fontFamily: 'Nunito_500Medium',
    fontSize: 14,
    color: '#5C5A4F',
    lineHeight: 20,
    marginBottom: 20,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skipButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  skipText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: '#5C5A4F',
  },
  nextButton: {
    backgroundColor: '#3FA86B',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: '#123924',
    boxShadow: '2px 2px 0px #123924',
  },
  nextText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 14,
    color: '#FFFFFF',
  },
});
