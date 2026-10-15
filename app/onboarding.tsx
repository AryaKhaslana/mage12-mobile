import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import * as Haptics from "expo-haptics";
import { Image as ExpoImage } from 'expo-image';
import { router } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    Dimensions,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ViewToken } from "react-native";

import Animated, {
    cancelAnimation,
    Extrapolation,
    FadeInDown,
    interpolate,
    interpolateColor,
    type SharedValue,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
const AnimatedExpoImage = Animated.createAnimatedComponent(ExpoImage);

const VIEW_CONFIG = { viewAreaCoveragePercentThreshold: 50 };

interface PaginationDotProps {
  index: number;
  scrollX: SharedValue<number>;
  width: number;
}

const PaginationDot = React.memo(({ index, scrollX, width }: PaginationDotProps) => {
  const animatedDotStyle = useAnimatedStyle(() => {
    const widthVal = interpolate(
      scrollX.value,
      [(index - 1) * width, index * width, (index + 1) * width],
      [8, 24, 8],
      Extrapolation.CLAMP,
    );
    const colorVal = interpolateColor(
      scrollX.value,
      [(index - 1) * width, index * width, (index + 1) * width],
      ["#D9D9D9", "#3FA86B", "#D9D9D9"],
    );
    return {
      width: widthVal,
      backgroundColor: colorVal,
    };
  });

  return <Animated.View style={[styles.dot, animatedDotStyle]} />;
});

const slides = [
  {
    id: "1",
    title: "Perkenalkan, Si Tani!",
    description:
      "Sahabat setia yang akan mendampingi kamu merawat tanaman, mulai dari benih hingga masa panen.",
    image: require("../assets/images/icontampilanawal/seedling-halo.svg") },
  {
    id: "2",
    title: "Mengenal TaniSync",
    description:
      "Asisten pertanian urban yang membantu kamu menanam sayuran sendiri di rumah, bahkan di ruang terbatas.",
    image: require("../assets/images/icontampilanawal/seedling-menanam.svg") },
  {
    id: "3",
    title: "Perawatan Lebih Terjadwal",
    description:
      "Pengingat otomatis untuk menyiram dan memupuk tanaman, serta bangun kebiasaan merawat kebun setiap hari.",
    image: require("../assets/images/icontampilanawal/seedling-lompat.svg") },
  {
    id: "4",
    title: "Langkah Kecil, Dampak Nyata",
    description:
      "Setiap tanaman yang kamu rawat berkontribusi nyata bagi ketahanan pangan mandiri di sekitarmu.",
    image: require("../assets/images/icontampilanawal/seedling-meneropong.svg") },
];
export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<Animated.FlatList<any>>(null);
  const completeLockRef = useRef(false);

  // Breathing Maskot Animation
  const breathingScale = useSharedValue(1);
  const floatingTranslateY = useSharedValue(0);
  const floatingTranslateYAlt = useSharedValue(0);

  useEffect(() => {
    breathingScale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1500 }),
        withTiming(1, { duration: 1500 }),
      ),
      -1,
      true,
    );
    floatingTranslateY.value = withRepeat(
      withSequence(
        withTiming(-15, { duration: 2000 }),
        withTiming(0, { duration: 2000 }),
      ),
      -1,
      true,
    );
    floatingTranslateYAlt.value = withRepeat(
      withSequence(
        withTiming(15, { duration: 1800 }),
        withTiming(0, { duration: 1800 }),
      ),
      -1,
      true,
    );

    return () => {
      cancelAnimation(breathingScale);
      cancelAnimation(floatingTranslateY);
      cancelAnimation(floatingTranslateYAlt);
    };
  }, []);

  const animatedImageStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: breathingScale.value }] };
  });
  const animatedFloatingStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: floatingTranslateY.value }] };
  });
  const animatedFloatingStyleAlt = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: floatingTranslateYAlt.value }] };
  });

  // Scroll Animation for Pagination
  const scrollX = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((event) => {
    scrollX.value = event.contentOffset.x;
  });
  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems[0]) {
        setCurrentIndex(viewableItems[0].index || 0);
      }
    },
    []
  );

  const handleComplete = async () => {
    if (completeLockRef.current) return;
    completeLockRef.current = true;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});

    try {
      await AsyncStorage.setItem("hasSeenOnboarding", "true");
      const token = await SecureStore.getItemAsync("userToken");
      if (token) {
        router.replace("/(tabs)");
      } else {
        router.replace("/(auth)/login");
      }
    } catch (e) {
      router.replace("/(auth)/login");
    }
  };

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      Haptics.selectionAsync().catch(() => {});
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      handleComplete();
    }
  };

  const renderItem = ({ item }: { item: (typeof slides)[0] }) => {
    return (
      <View style={styles.slide}>
        <View style={styles.imageWrapper}>
          {item.id === "4" && (
            <AnimatedExpoImage
              source={require("../assets/images/icontampilanawal/icon-gedung-chart.svg")}
              style={styles.buildingChart}
              contentFit="contain"
              cachePolicy="memory-disk"
            />
          )}
          <AnimatedExpoImage
            source={item.image}
            style={[styles.image, item.id !== "4" && animatedImageStyle]}
            contentFit="contain"
            cachePolicy="memory-disk"
          />
          {item.id === "2" && (
            <AnimatedExpoImage
              source={require("../assets/images/icontampilanawal/icon-potkecil.svg")}
              style={[styles.floatingPot, animatedFloatingStyle]}
              contentFit="contain"
              cachePolicy="memory-disk"
            />
          )}
          {item.id === "3" && (
            <>
              <AnimatedExpoImage
                source={require("../assets/images/icontampilanawal/icon-notifikasi.svg")}
                style={[styles.floatingNotif, animatedFloatingStyle]}
                contentFit="contain"
                cachePolicy="memory-disk"
              />
              <AnimatedExpoImage
                source={require("../assets/images/icontampilanawal/icon-piala.svg")}
                style={[styles.floatingPiala, animatedFloatingStyleAlt]}
                contentFit="contain"
                cachePolicy="memory-disk"
              />
            </>
          )}
        </View>
        <Animated.View
          entering={FadeInDown.duration(800).delay(200)}
          style={styles.textContainer}
        >
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description}>{item.description}</Text>
        </Animated.View>
      </View>
    );
  };
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleComplete}>
          <Text style={styles.skipText}>Lewati</Text>
        </TouchableOpacity>
      </View>
      <Animated.FlatList
        ref={flatListRef as any}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        keyExtractor={(item) => item.id}
        onScroll={onScroll}
        scrollEventThrottle={16}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={VIEW_CONFIG}
        renderItem={renderItem}
      />
      <View style={styles.footer}>
        {/* Pagination Dots */}
        <View style={styles.pagination}>
          {slides.map((_, index) => (
            <PaginationDot
              key={index.toString()}
              index={index}
              scrollX={scrollX}
              width={width}
            />
          ))}
        </View>
        {/* Buttons */}
        {currentIndex === slides.length - 1 ? (
          <TouchableOpacity
            style={styles.startButton}
            onPress={handleComplete}
            activeOpacity={0.9}
          >
            <Text style={styles.startButtonText}>Mulai Sekarang</Text>
          </TouchableOpacity>
        ) : (
          <Pressable
            style={({ pressed }) => [
              styles.nextButton,
              pressed && styles.pressedNextButton
            ]}
            onPress={handleNext}
          >
            <MaterialIcons name="arrow-forward" size={24} color="#FFFFFF" />
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FBF8F0" },
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 24,
    paddingTop: 16,
    height: 60 },
  skipText: {
    fontSize: 14,
    fontFamily: "Nunito_800ExtraBold",
    color: "#3FA86B" },
  slide: {
    width,
    alignItems: "center",
    paddingTop: 60 },
  imageWrapper: {
    position: "relative",
    width: width * 0.7,
    height: width * 0.7,
    marginBottom: 60 },
  image: {
    width: "100%",
    height: "100%" },
  buildingChart: {
    position: "absolute",
    bottom: -5,
    alignSelf: "center",
    width: width * 1.55,
    height: width * 0.7,
    zIndex: -1 },
  floatingPot: {
    position: "absolute",
    right: -120,
    top: "15%",
    width: 260,
    height: 260,
    zIndex: 10 },
  floatingNotif: {
    position: "absolute",
    left: -40,
    top: "5%",
    width: 130,
    height: 130,
    zIndex: 10 },
  floatingPiala: {
    position: "absolute",
    right: -50,
    top: "25%",
    width: 140,
    height: 140,
    zIndex: 10 },
  textContainer: {
    paddingHorizontal: 32,
    alignItems: "center" },
  title: {
    fontSize: 24,
    fontFamily: "Nunito_800ExtraBold",
    color: "#123924",
    marginBottom: 16,
    textAlign: "center" },
  description: {
    fontSize: 14,
    color: "#123924",
    textAlign: "center",
    lineHeight: 22,
    fontFamily: "Nunito_500Medium" },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 40,
    height: 100 },
  pagination: {
    flexDirection: "row",
    alignItems: "center" },
  dot: {
    height: 8,
    borderRadius: 4,
    marginRight: 8,
    borderWidth: 0,
     // Neobrutalism border
  },
  nextButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#3FA86B",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 0,
    
    shadowColor: "#123924", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 14, elevation: 4 },
  startButton: {
    height: 60,
    paddingHorizontal: 32,
    borderRadius: 30,
    backgroundColor: "#123924",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 0,
    
    shadowColor: "#123924", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 14, elevation: 4 },
  startButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Nunito_800ExtraBold" },
  pressedNextButton: {
    shadowColor: "#123924", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
    transform: [{ scale: 0.98 }] } });
