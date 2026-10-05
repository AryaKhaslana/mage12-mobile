import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSequence, Easing } from 'react-native-reanimated';

export default function TaskCard({ task, onTaskPress, isWateringTask }: { task: any, onTaskPress: () => void, isWateringTask: boolean }) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const handlePress = () => {
    // If it's a watering task, do a little check animation before firing the prop
    if (isWateringTask) {
      scale.value = withSequence(
        withTiming(0.9, { duration: 150 }),
        withTiming(1, { duration: 150 })
      );
      // Optional: hide it
      // opacity.value = withTiming(0, { duration: 300 });
    }
    
    // Slight delay to let animation play
    setTimeout(() => {
      onTaskPress();
    }, 200);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.card, animatedStyle]}>
      <Pressable 
        style={({ pressed }) => [
          styles.inner,
          pressed && { opacity: 0.8 }
        ]} 
        onPress={handlePress}
      >
        <View style={[styles.iconBox, { backgroundColor: isWateringTask ? '#FFECE8' : '#E5F5EB' }]}>
          <MaterialIcons name={isWateringTask ? "water-drop" : "eco"} size={28} color={isWateringTask ? "#FF8A65" : "#3FA96B"} />
        </View>
        
        <View style={styles.info}>
          <Text style={styles.title}>{task.nama_tanaman}</Text>
          <Text style={[styles.status, { color: isWateringTask ? "#FF8A65" : "#3FA96B" }]}>
            {isWateringTask ? "Perlu disiram sekarang" : "Pertumbuhan baik"}
          </Text>
        </View>

        {isWateringTask && (
          <View style={styles.checkbox}>
            <View style={styles.checkboxInner} />
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    marginBottom: 16,
    shadowColor: '#1B4332',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Nunito_800ExtraBold',
    color: '#1B4332',
    marginBottom: 4,
  },
  status: {
    fontSize: 13,
    fontFamily: 'Nunito_700Bold',
  },
  checkbox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#FF8A65',
    backgroundColor: '#FFF0ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxInner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  }
});
