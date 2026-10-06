import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function HarvestCard({ task }: { task: any }) {
  const progress = task.sisaHariPanen ? Math.max(0, 1 - (task.sisaHariPanen / 30)) : 0; // Assuming 30 days total for visual
  
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconBox}>
          <MaterialIcons name="grass" size={24} color="#3FA96B" />
        </View>
        <Text style={styles.title}>{task.nickname || task.jenisTanaman}</Text>
      </View>
      
      <View style={styles.daysRow}>
        <Text style={styles.daysNumber}>{task.sisaHariPanen || 0}</Text>
        <Text style={styles.daysLabel}>hari lagi</Text>
      </View>
      
      <View style={styles.progressBg}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 200,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    marginRight: 16,
    shadowColor: '#1B4332',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#E5F5EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 15,
    fontFamily: 'Nunito_800ExtraBold',
    color: '#1B4332',
    flex: 1,
  },
  daysRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
    gap: 4,
  },
  daysNumber: {
    fontSize: 32,
    fontFamily: 'Nunito_800ExtraBold',
    color: '#3FA96B',
  },
  daysLabel: {
    fontSize: 14,
    fontFamily: 'Nunito_700Bold',
    color: '#5C5A4F',
  },
  progressBg: {
    height: 8,
    backgroundColor: '#F0FAF4',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3FA96B',
    borderRadius: 4,
  }
});
