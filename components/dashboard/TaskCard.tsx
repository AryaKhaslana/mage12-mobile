import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
} from 'react-native-reanimated';
import { Colors } from '../../constants/colors';

interface TaskCardProps {
  task: {
    id: string;
    nickname?: string;
    jenisTanaman?: string;
    statusPenyiraman?: string;
    sisaHariPanen?: number;
    [key: string]: any;
  };
  onTaskPress: () => void;
  isWateringTask: boolean;
  isWateredToday?: boolean;
}

const TaskCard = React.memo(function TaskCard({
  task,
  onTaskPress,
  isWateringTask,
  isWateredToday = false
}: TaskCardProps) {
  const scale = useSharedValue(1);
  const checkScale = useSharedValue(isWateredToday ? 1 : 0.85);

  useEffect(() => {
    if (isWateredToday) {
      checkScale.value = withSequence(
        withTiming(0.65, { duration: 60 }),
        withSpring(1, { damping: 9, stiffness: 220 })
      );
    } else {
      checkScale.value = 1;
    }
  }, [isWateredToday, checkScale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const checkAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withTiming(0.96, { duration: 60 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 12, stiffness: 200 });
  };

  // Status & Priority Logic
  const isReadyToHarvest = typeof task.sisaHariPanen === 'number' && task.sisaHariPanen <= 0;
  const isDelayedRain = task.statusPenyiraman === 'DITUNDA_HUJAN' && !isWateredToday;
  const isNeedsWater = isWateringTask && !isWateredToday;

  let statusText = 'Pertumbuhan optimal';
  let statusColor: string = Colors.primary;
  let iconName: keyof typeof MaterialIcons.glyphMap = 'eco';
  let iconBgColor: string = Colors.primaryLight;
  let iconColor: string = Colors.primary;

  if (isReadyToHarvest) {
    statusText = 'Siap dipanen sekarang';
    statusColor = '#D97706';
    iconName = 'agriculture';
    iconBgColor = '#FEF3C7';
    iconColor = '#B45309';
  } else if (isDelayedRain) {
    statusText = 'Ditunda karena prakiraan hujan';
    statusColor = '#0284C7';
    iconName = 'thunderstorm';
    iconBgColor = '#E0F2FE';
    iconColor = '#0284C7';
  } else if (isWateredToday) {
    statusText = 'Sudah disiram hari ini • Ketuk untuk detail';
    statusColor = Colors.primary;
    iconName = 'water-drop';
    iconBgColor = Colors.primaryLight;
    iconColor = Colors.primary;
  } else if (isNeedsWater) {
    statusText = 'Perlu disiram hari ini';
    statusColor = Colors.coral;
    iconName = 'water-drop';
    iconBgColor = '#FFECE8';
    iconColor = Colors.coral;
  }

  // Display Name & Sub-details
  const titleText = task.nickname || task.jenisTanaman || 'Tanaman';
  const showSpeciesSubtitle = Boolean(task.nickname && task.jenisTanaman);
  const harvestRemainingDays = task.sisaHariPanen;
  let harvestText = '';
  if (typeof harvestRemainingDays === 'number') {
    if (harvestRemainingDays <= 0) {
      harvestText = 'Siap panen';
    } else {
      harvestText = `Panen ${harvestRemainingDays} hr lagi`;
    }
  }

  return (
    <Animated.View style={[styles.card, animatedStyle]}>
      <Pressable
        style={styles.inner}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onTaskPress}
      >
        <View style={[styles.iconBox, { backgroundColor: iconBgColor }]}>
          <MaterialIcons name={iconName} size={28} color={iconColor} />
        </View>

        <View style={styles.info}>
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={1}>{titleText}</Text>
          </View>

          {/* Sub-info if nickname or harvest remaining is available */}
          {(showSpeciesSubtitle || harvestText !== '') && (
            <Text style={styles.subInfo} numberOfLines={1}>
              {showSpeciesSubtitle ? task.jenisTanaman : ''}
              {showSpeciesSubtitle && harvestText !== '' ? ' • ' : ''}
              {harvestText}
            </Text>
          )}

          <Text style={[styles.status, { color: statusColor }]} numberOfLines={1}>
            {statusText}
          </Text>
        </View>

        {isWateringTask ? (
          <Animated.View
            style={[
              styles.checkbox,
              isWateredToday && styles.checkboxActive,
              checkAnimatedStyle
            ]}
          >
            {isWateredToday ? (
              <MaterialIcons name="check" size={24} color="#FFFFFF" />
            ) : (
              <View style={styles.checkboxInner} />
            )}
          </Animated.View>
        ) : (
          <View style={styles.actionArrowBox}>
            <MaterialIcons name="chevron-right" size={24} color="#1B4332" />
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
});

export default TaskCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    marginBottom: 16,
    shadowColor: '#1B4332',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  info: {
    flex: 1,
    marginRight: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Nunito_800ExtraBold',
    color: '#1B4332',
  },
  subInfo: {
    fontSize: 12,
    fontFamily: 'Nunito_600SemiBold',
    color: Colors.muted,
    marginBottom: 3,
  },
  status: {
    fontSize: 12,
    fontFamily: 'Nunito_700Bold',
  },
  checkbox: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    borderColor: '#FF8A65',
    backgroundColor: '#FFF0ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  checkboxInner: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
  },
  actionArrowBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
