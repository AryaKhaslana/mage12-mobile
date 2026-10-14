import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSequence } from 'react-native-reanimated';
import { Colors } from '../../constants/colors';

export default function TaskCard({ task, onTaskPress, isWateringTask, isWateredToday }: { task: any, onTaskPress: () => void, isWateringTask: boolean, isWateredToday?: boolean }) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const handlePress = () => {
    // If it's a watering task and not watered today, do a little check animation before firing the prop
    if (isWateringTask && !isWateredToday) {
      scale.value = withSequence(
        withTiming(0.9, { duration: 150 }),
        withTiming(1, { duration: 150 })
      );
    }
    
    // Slight delay to let animation play
    setTimeout(() => {
      onTaskPress();
    }, (isWateringTask && !isWateredToday) ? 200 : 0);
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
        <View style={[styles.iconBox, { backgroundColor: isWateringTask && !isWateredToday ? '#FFECE8' : Colors.primaryLight }]}>
          <MaterialIcons name={isWateringTask ? "water-drop" : "eco"} size={28} color={isWateringTask && !isWateredToday ? Colors.coral : Colors.primary} />
        </View>
        
        <View style={styles.info}>
          <Text style={styles.title}>{task.nickname || task.jenisTanaman}</Text>
          <Text style={[styles.status, { color: isWateringTask && !isWateredToday ? Colors.coral : Colors.primary }]}>
            {isWateringTask ? (isWateredToday ? "Sudah disiram hari ini" : "Perlu disiram hari ini") : "Pertumbuhan baik"}
          </Text>
        </View>

        {isWateringTask && (
          <View style={[styles.checkbox, isWateredToday && { borderColor: Colors.primary, backgroundColor: Colors.primary }]}>
            {isWateredToday ? (
              <MaterialIcons name="check" size={24} color="#FFFFFF" />
            ) : (
              <View style={styles.checkboxInner} />
            )}
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: Colors.ink,
    shadowColor: Colors.ink,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
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
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.ink,
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
    color: Colors.ink,
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
    borderColor: Colors.ink,
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
