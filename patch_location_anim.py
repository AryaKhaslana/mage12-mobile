import re

with open('app/(auth)/location-setup.tsx', 'r') as f:
    content = f.read()

# Add reanimated imports
if "react-native-reanimated" not in content:
    content = content.replace(
        'import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ActivityIndicator } from "react-native";',
        'import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ActivityIndicator } from "react-native";\nimport Animated, { useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming } from "react-native-reanimated";\nimport { useEffect } from "react";'
    )

# Add animations inside LocationSetupScreen
old_component_start = """export default function LocationSetupScreen() {
  const [isLoading, setIsLoading] = useState(false);"""

new_component_start = """export default function LocationSetupScreen() {
  const [isLoading, setIsLoading] = useState(false);
  
  // Animation values
  const breathingScale = useSharedValue(1);
  const floatingTranslateY = useSharedValue(0);

  useEffect(() => {
    breathingScale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1500 }),
        withTiming(1, { duration: 1500 })
      ),
      -1,
      true
    );
    floatingTranslateY.value = withRepeat(
      withSequence(
        withTiming(-10, { duration: 2000 }),
        withTiming(0, { duration: 2000 })
      ),
      -1,
      true
    );
  }, []);

  const animatedImageStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: breathingScale.value },
        { translateY: floatingTranslateY.value }
      ],
    };
  });"""

if "breathingScale" not in content:
    content = content.replace(old_component_start, new_component_start)

# Replace Image with Animated.Image
old_image = """        <View style={styles.iconContainer}>
          <Image 
            source={require("../../assets/images/icontampilanawal/seedling-meneropong.png")} 
            style={{ width: 340, height: 340 }} 
            resizeMode="contain" 
          />
        </View>"""

new_image = """        <View style={styles.iconContainer}>
          <Animated.Image 
            source={require("../../assets/images/icontampilanawal/seedling-meneropong.png")} 
            style={[{ width: 340, height: 340 }, animatedImageStyle]} 
            resizeMode="contain" 
          />
        </View>"""

content = content.replace(old_image, new_image)

with open('app/(auth)/location-setup.tsx', 'w') as f:
    f.write(content)
