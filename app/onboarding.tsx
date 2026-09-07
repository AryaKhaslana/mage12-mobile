import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewToken,
} from "react-native";
import Animated, {
  Extrapolation,
  FadeInDown,
  interpolate,
  interpolateColor,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

const slides = [
  {
    id: "1",
    title: "Kenalin, Si Tani!",
    description:
      "Dia sahabat kecil yang bakal nemenin kamu ngerawat tanaman, dari bibit sampai panen.",
    image: require("../assets/images/icontampilanawal/seedling-halo.png"),
  },
  {
    id: "2",
    title: "TaniSync itu apa sih?",
    description:
      "Aplikasi asisten urban farming yang bantu kamu nanem sayur sendiri di rumah — walau cuma punya balkon kecil sekalipun.",
    image: require("../assets/images/icontampilanawal/seedling-diam.png"),
  },
  {
    id: "3",
    title: "Gak akan lupa lagi",
    description:
      "Reminder otomatis kapan harus nyiram & mupuk, plus kumpulin streak tiap kali kamu rajin ngerawat tanaman.",
    image: require("../assets/images/icontampilanawal/seedling-diam.png"),
  },
  {
    id: "4",
    title: "Kecil tapi berdampak",
    description:
      "Setiap tanaman yang kamu rawat bantu ketahanan pangan mandiri di kotamu — kecil tapi nyata.",
    image: require("../assets/images/icontampilanawal/seedling-diam.png"),
  },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<Animated.FlatList<any>>(null);

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
  }, []);

  const animatedImageStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: breathingScale.value }],
    };
  });

  const animatedFloatingStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: floatingTranslateY.value }],
    };
  });

  const animatedFloatingStyleAlt = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: floatingTranslateYAlt.value }],
    };
  });

  // Scroll Animation for Pagination
  const scrollX = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((event) => {
    scrollX.value = event.contentOffset.x;
  });

  const viewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems[0]) {
        setCurrentIndex(viewableItems[0].index || 0);
      }
    },
  ).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const handleComplete = async () => {
    await AsyncStorage.setItem("hasSeenOnboarding", "true");
    router.replace("/(auth)/login");
  };

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
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
            <Animated.Image
              source={require("../assets/images/icontampilanawal/icon-gedung-chart.png")}
              style={styles.buildingChart}
              resizeMode="contain"
            />
          )}

          <Animated.Image
            source={item.image}
            style={[styles.image, item.id !== "4" && animatedImageStyle]}
            resizeMode="contain"
          />
          {item.id === "2" && (
            <Animated.Image
              source={require("../assets/images/icontampilanawal/icon-potkecil.png")}
              style={[styles.floatingPot, animatedFloatingStyle]}
              resizeMode="contain"
            />
          )}
          {item.id === "3" && (
            <>
              <Animated.Image
                source={require("../assets/images/icontampilanawal/icon-notifikasi.png")}
                style={[styles.floatingNotif, animatedFloatingStyle]}
                resizeMode="contain"
              />
              <Animated.Image
                source={require("../assets/images/icontampilanawal/icon-piala.png")}
                style={[styles.floatingPiala, animatedFloatingStyleAlt]}
                resizeMode="contain"
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
        onViewableItemsChanged={viewableItemsChanged}
        viewabilityConfig={viewConfig}
        renderItem={renderItem}
      />

      <View style={styles.footer}>
        {/* Pagination Dots */}
        <View style={styles.pagination}>
          {slides.map((_, index) => {
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

            return (
              <Animated.View
                key={index.toString()}
                style={[styles.dot, animatedDotStyle]}
              />
            );
          })}
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
          <TouchableOpacity
            style={styles.nextButton}
            onPress={handleNext}
            activeOpacity={0.9}
          >
            <MaterialIcons name="arrow-forward" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FBF8F0",
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 24,
    paddingTop: 16,
    height: 60,
  },
  skipText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#3FA86B", // Based on Neobrutalism typical accent, though user only said "Teks 'Lewati' di pojok kanan atas"
  },
  slide: {
    width,
    alignItems: "center",
    paddingTop: 60,
  },
  imageWrapper: {
    position: "relative",
    width: width * 0.7,
    height: width * 0.7,
    marginBottom: 60,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  buildingChart: {
    position: "absolute",
    bottom: -5,
    alignSelf: "center",
    width: width * 1.55,
    height: width * 0.70,
    zIndex: -1,
  },
  floatingPot: {
    position: "absolute",
    right: -120,
    top: "15%",
    width: 260,
    height: 260,
    zIndex: 10,
  },
  floatingNotif: {
    position: "absolute",
    left: -40,
    top: "5%",
    width: 120,
    height: 120,
    zIndex: 10,
  },
  floatingPiala: {
    position: "absolute",
    right: -50,
    top: "25%",
    width: 120,
    height: 120,
    zIndex: 10,
  },
  textContainer: {
    paddingHorizontal: 32,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#123924",
    marginBottom: 16,
    textAlign: "center",
  },
  description: {
    fontSize: 14,
    color: "#123924",
    textAlign: "center",
    lineHeight: 22,
    fontWeight: "500",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 40,
    height: 100,
  },
  pagination: {
    flexDirection: "row",
    alignItems: "center",
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#123924", // Neobrutalism border
  },
  nextButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#3FA86B",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#123924",
    shadowColor: "#123924",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
  },
  startButton: {
    height: 56,
    paddingHorizontal: 24,
    borderRadius: 28,
    backgroundColor: "#123924", // User specified background #123924
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#123924",
    shadowColor: "#123924",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
  },
  startButtonText: {
    color: "#FFFFFF", // User specified text putih
    fontSize: 16,
    fontWeight: "800",
  },
});
