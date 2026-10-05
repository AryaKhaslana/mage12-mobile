import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';

export default function StatCard({ userData, tanamanCount, onBadgePress }: { userData: any, tanamanCount: number, onBadgePress: () => void }) {
  return (
    <View style={styles.card}>
      <View style={styles.item}>
        <View style={[styles.iconBox, { backgroundColor: '#E5F5EB' }]}>
          <MaterialIcons name="eco" size={24} color="#3FA86B" />
        </View>
        <View>
          <Text style={styles.value}>{tanamanCount}</Text>
          <Text style={styles.label}>Tanaman</Text>
        </View>
      </View>
      
      <View style={styles.divider} />
      
      <View style={styles.item}>
        <View style={[styles.iconBox, { backgroundColor: '#FFF0ED' }]}>
          <MaterialIcons name="local-fire-department" size={24} color="#FF6B5C" />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View>
            <Text style={styles.value}>{userData?.streak || 0}</Text>
            <Text style={styles.label}>Streak</Text>
          </View>
          
          {/* Badge Streak Freeze */}
          {(userData?.pelindung_streak !== undefined && userData.pelindung_streak > 0) && (
            <Pressable 
              onPress={onBadgePress}
              style={({ pressed }) => [
                styles.badge,
                pressed && { transform: [{ scale: 0.9 }] }
              ]}
            >
              <Ionicons name="umbrella" size={14} color="#FFFFFF" />
              <Text style={styles.badgeText}>x{userData.pelindung_streak}</Text>
            </Pressable>
          )}
        </View>
      </View>
      
      <View style={styles.divider} />
      
      <View style={styles.item}>
        <View style={[styles.iconBox, { backgroundColor: '#FFF9E6' }]}>
          <MaterialIcons name="star" size={24} color="#FFB627" />
        </View>
        <View>
          <Text style={styles.value}>{userData?.level || 1}</Text>
          <Text style={styles.label}>Level</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginTop: -32, // Overlaps the bottom of the FarmerScene
    marginHorizontal: 24,
    shadowColor: '#1B4332',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 4,
    zIndex: 10,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontSize: 20,
    fontFamily: 'Nunito_800ExtraBold',
    color: '#1B4332',
    lineHeight: 24,
  },
  label: {
    fontSize: 12,
    fontFamily: 'Nunito_500Medium',
    color: '#5C5A4F',
  },
  divider: {
    width: 1,
    height: '100%',
    backgroundColor: '#CFE8D8',
    marginHorizontal: 4,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFB627',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
    gap: 2,
  },
  badgeText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 12,
    color: '#FFFFFF',
  }
});
