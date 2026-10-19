/* eslint-disable react-hooks/immutability */
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

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
  onBeforeStepChange?: (currentStepIndex: number, nextStepIndex: number) => Promise<void> | void;
  onStepChange?: (stepIndex: number, step?: CoachMarkStep) => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BUBBLE_WIDTH = SCREEN_WIDTH - 48; // 24px padding on sides

export default function CoachMarkOverlay({
  visible,
  steps,
  onFinish,
  onSkip,
  onBeforeStepChange,
  onStepChange,
}: CoachMarkOverlayProps) {
  const [currentStepIndex, setCurrentStepIndex] = React.useState(0);
  const [showConfirmSkip, setShowConfirmSkip] = React.useState(false);
  const [isTransitioning, setIsTransitioning] = React.useState(false);

  const currentX = useSharedValue(0);
  const currentY = useSharedValue(0);
  const currentW = useSharedValue(0);
  const currentH = useSharedValue(0);
  const currentR = useSharedValue(0);
  const opacity = useSharedValue(0);

  const stepsRef = React.useRef(steps);
  stepsRef.current = steps;

  const prevVisibleRef = React.useRef(false);

  // Initialize values and reset step to 0 whenever overlay becomes visible
  useEffect(() => {
    if (visible) {
      if (!prevVisibleRef.current) {
        prevVisibleRef.current = true;
        setCurrentStepIndex(0);
        setShowConfirmSkip(false);
        setIsTransitioning(false);

        if (steps.length > 0) {
          const step = steps[0];
          currentX.value = withTiming(step.rect.x - 8, { duration: 200 });
          currentY.value = withTiming(step.rect.y - 8, { duration: 200 });
          currentW.value = withTiming(step.rect.width + 16, { duration: 200 });
          currentH.value = withTiming(step.rect.height + 16, { duration: 200 });
          currentR.value = withTiming(step.borderRadius || 12, { duration: 200 });
        }
      }
      opacity.value = withTiming(1, { duration: 200 });
    } else {
      if (prevVisibleRef.current) {
        prevVisibleRef.current = false;
        setCurrentStepIndex(0);
        setShowConfirmSkip(false);
        setIsTransitioning(false);
        opacity.value = withTiming(0, { duration: 200 });
      }
    }
  }, [visible, steps, currentX, currentY, currentW, currentH, currentR, opacity]);

  // Update target coordinates when step changes or when step rect is dynamically updated
  useEffect(() => {
    if (visible && steps[currentStepIndex]) {
      const step = steps[currentStepIndex];
      // Transisi halus 200ms tanpa pantulan berlebih
      currentX.value = withTiming(step.rect.x - 8, { duration: 200 });
      currentY.value = withTiming(step.rect.y - 8, { duration: 200 });
      currentW.value = withTiming(step.rect.width + 16, { duration: 200 });
      currentH.value = withTiming(step.rect.height + 16, { duration: 200 });
      currentR.value = withTiming(step.borderRadius || 12, { duration: 200 });
    }
  }, [currentStepIndex, visible, steps, currentX, currentY, currentW, currentH, currentR]);

  const B = 2000; // Huge border thickness
  const maskStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    top: currentY.value - B,
    left: currentX.value - B,
    width: currentW.value + 2 * B,
    height: currentH.value + 2 * B,
    borderWidth: B,
    borderColor: 'rgba(18,57,36,0.75)',
    borderRadius: currentR.value + B }));
  const borderHighlightStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    left: currentX.value - 2,
    top: currentY.value - 2,
    width: currentW.value + 4,
    height: currentH.value + 4,
    borderRadius: currentR.value + 2,
    borderWidth: 0,
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
      top: withTiming(safeY, { duration: 200 }),
      width: BUBBLE_WIDTH,
      opacity: opacity.value };
  });

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    flex: 1 }));

  if (!visible || steps.length === 0) return null;

  const currentStep = steps[currentStepIndex];
  const isLastStep = currentStepIndex === steps.length - 1;

  const handleNext = async () => {
    if (isTransitioning) return;
    if (isLastStep) {
      onFinish();
    } else {
      setIsTransitioning(true);
      try {
        const nextIndex = currentStepIndex + 1;
        if (onBeforeStepChange) {
          const changePromise = Promise.resolve(onBeforeStepChange(currentStepIndex, nextIndex));
          const timeoutPromise = new Promise<void>((resolve) => setTimeout(resolve, 1500));
          await Promise.race([changePromise, timeoutPromise]);
        }
        const latestStep = stepsRef.current[nextIndex] || steps[nextIndex];
        onStepChange?.(nextIndex, latestStep);
        setCurrentStepIndex(nextIndex);
      } catch (err) {
        console.warn("CoachMark transition error:", err);
      } finally {
        setIsTransitioning(false);
      }
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
                  isTransitioning && { opacity: 0.7 },
                  pressed && !isTransitioning && { transform: [{ scale: 0.98 }] }
                ]}
                onPress={handleNext}
                disabled={isTransitioning}
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
            <View style={{ width: '100%', backgroundColor: '#FFFFFF', borderRadius: 24, borderWidth: 0,  padding: 24 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
                <MaterialIcons name="help-outline" size={24} color="#3FA86B" />
                <Text style={{ fontFamily: 'Nunito_800ExtraBold', fontSize: 20, color: '#123924', textAlign: 'center' }}>
                  Yakin Ingin Melewati Panduan?
                </Text>
              </View>
              <Text style={{ fontFamily: 'Nunito_500Medium', fontSize: 14, color: '#5C5A4F', textAlign: 'center', marginBottom: 24 }}>
                Panduan ini hanya sebentar dan akan membantu kamu merawat tanaman dengan lebih optimal.
              </Text>
              
              <View style={{ gap: 12 }}>
                <Pressable
                  onPress={() => setShowConfirmSkip(false)}
                  style={({ pressed }) => [{
                    backgroundColor: '#3FA86B', paddingVertical: 14, borderRadius: 999, borderWidth: 0,  alignItems: 'center'
                  }, pressed && { transform: [{ translateY: 2 }] }]}
                >
                  <Text style={{ fontFamily: 'Nunito_800ExtraBold', fontSize: 16, color: '#FFFFFF' }}>Lanjutkan Panduan</Text>
                </Pressable>
                
                <Pressable
                  onPress={() => { setShowConfirmSkip(false); onSkip(); }}
                  style={{ paddingVertical: 14, alignItems: 'center' }}
                >
                  <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: 16, color: '#FF6B5C' }}>Ya, Lewati Saja</Text>
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
    borderRadius: 20 },
  bubbleContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 0,
    
    padding: 20 },
  bubbleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12 },
  stepBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 0,
    borderColor: '#3FA86B' },
  stepBadgeText: {
    color: '#3FA86B',
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 12 },
  bubbleTitle: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 16,
    color: '#123924',
    flex: 1 },
  bubbleDesc: {
    fontFamily: 'Nunito_500Medium',
    fontSize: 14,
    color: '#5C5A4F',
    lineHeight: 20,
    marginBottom: 20 },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center' },
  skipButton: {
    paddingVertical: 8,
    paddingHorizontal: 12 },
  skipText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: '#5C5A4F' },
  nextButton: {
    backgroundColor: '#3FA86B',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 999,
    borderWidth: 0,
    
    shadowColor: "#123924", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 14, elevation: 4 },
  nextText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 14,
    color: '#FFFFFF' } });
