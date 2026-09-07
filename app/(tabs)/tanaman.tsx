import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function TanamanScreen() {
  const [activeFilter, setActiveFilter] = useState('Semua');
  const filters = ['Semua', 'Sayuran Daun', 'Sayuran Buah', 'Herbal'];
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {/* HEADER */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Tanaman Kamu</Text>
            <TouchableOpacity style={styles.searchButton}>
              <MaterialIcons name="search" size={24} color="#123924" />
            </TouchableOpacity>
          </View>

          {/* FILTERS */}
          <View style={styles.filterSection}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterScrollContent}>
              {filters.map((filter) => (
                <TouchableOpacity 
                  key={filter}
                  style={[
                    styles.filterChip, 
                    activeFilter === filter ? styles.filterChipActive : styles.filterChipInactive
                  ]}
                  onPress={() => setActiveFilter(filter)}
                >
                  <Text style={[
                    styles.filterChipText,
                    activeFilter === filter ? styles.filterChipTextActive : styles.filterChipTextInactive
                  ]}>
                    {filter}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.gridToggleButton}>
              <MaterialIcons name="grid-view" size={24} color="#123924" />
            </TouchableOpacity>
          </View>

          {/* PLANT GRID */}
          <View style={styles.gridContainer}>
            
            {/* Card 1 */}
            <TouchableOpacity style={styles.card} activeOpacity={0.9}>
              <View style={styles.imageContainer}>
                <Image 
                  source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBtM7FlFlJScHO9oCJe2itzfrwNhmdWYV1r4xw6CmgQoXGemEfGr3Gvc0HanP20Y7UHtTsE520T9Wb0U112C1lSjfX83UkKEsZqtcGWWvFeg5KDyI_3ZiiAmeXcAw9Cktik-ce-yYaw9ttr-WoBkmFbEBc6_ZmS3TWgAGiMoI04QJQWQFNDByLBiloH34k7XxvkHZ0kDBv41Q0oKfG0aaBjDUWmZJ5ax9KDKddHlUIvNaySMO_oxRK1aA' }} 
                  style={styles.cardImage} 
                />
                <View style={[styles.statusDot, { backgroundColor: '#3FA86B' }]} />
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle} numberOfLines={1}>Pakcoy Super</Text>
                <Text style={styles.cardSubtitle}>Hari ke-14</Text>
                <View style={[styles.badge, { backgroundColor: '#3FA86B' }]}>
                  <Text style={[styles.badgeText, { color: '#FFFFFF' }]}>Sehat</Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* Card 2 */}
            <TouchableOpacity style={styles.card} activeOpacity={0.9}>
              <View style={styles.imageContainer}>
                <Image 
                  source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCvE7Ekw_pmEeEE0ZubnU4B86Ql7_5bp83l7dZXR9VthK4kBpVFkFWbQUUWedIveMMfrHn6mqO6RdgS-UZWcGIrA2xODMYMjMnLZgaFPPcYQh4W1JOHodRWxYcQdS82ovHKMfF_qWJQK3GxhMMZiPtiYW1ZoiMnuaKK-yRIC7iUChUBU0pe6eVRQTaZuZRYcSJhJE0ZlAHxA4TevSEmwZzcRrUduOTivP1uaECIEnZ7oFy82kZ_29zQoA' }} 
                  style={styles.cardImage} 
                />
                <View style={[styles.statusDot, { backgroundColor: '#FF6B5C' }]} />
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle} numberOfLines={1}>Tomat Ceri</Text>
                <Text style={styles.cardSubtitle}>Hari ke-21</Text>
                <View style={[styles.badge, { backgroundColor: '#FF6B5C' }]}>
                  <Text style={[styles.badgeText, { color: '#FFFFFF' }]}>Perlu air</Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* Card 3 */}
            <TouchableOpacity style={styles.card} activeOpacity={0.9}>
              <View style={styles.imageContainer}>
                <Image 
                  source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCYk0JcyoWT0aAObyPxwi9crqP6tqs9lcrHTidI7il0PIDbVDPpuyV5WvZ76jCdYJK1uizLRqnyCFlBMGU83nJaV0Z5GWSlQE8TFoBb5gkiCZnvKEwys2kVV8NCHcbAhp2xRcKV7z0VgfRtCmdb3ouWOV5pAR0rvbXPzypUjjhtyua61vWCzXz1ci4hdg3LcrjC9At0U7aYZGBNCWJBy-7Z7Wcgp6bHZBqxw_QmsX7xf0J7GfNpOs8EHA' }} 
                  style={styles.cardImage} 
                />
                <View style={[styles.statusDot, { backgroundColor: '#3FA86B' }]} />
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle} numberOfLines={1}>Kale Nero</Text>
                <Text style={styles.cardSubtitle}>Hari ke-30</Text>
                <View style={[styles.badge, { backgroundColor: '#3FA86B' }]}>
                  <Text style={[styles.badgeText, { color: '#FFFFFF' }]}>Sehat</Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* Card 4 */}
            <TouchableOpacity style={styles.card} activeOpacity={0.9}>
              <View style={styles.imageContainer}>
                <Image 
                  source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDAn7f4DcrZCVYQAkfLObUQylIkLZEQmvGcDRv6K36Bw1JiqYHEIftPUnGAe7236KQyFWbNZGCGL7c8CXsdeVsWMB_fGybW_4_wzvWous1GstPFDAsvf8a8HyokIxetHc4b6dmsX--IOfZLmgDkqXrKhnCiC8Kv91xCpq-w1yl2-4B-wkZqux20VQAHItYRkpuV0xIWBiTK8_RAZv2guOoHu1zmRvGjfxczQF6P2GEfzp33fXQJFYhG3w' }} 
                  style={styles.cardImage} 
                />
                <View style={[styles.statusDot, { backgroundColor: '#FF6B5C' }]} />
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle} numberOfLines={1}>Basil Manis</Text>
                <Text style={styles.cardSubtitle}>Hari ke-18</Text>
                <View style={[styles.badge, { backgroundColor: '#FF6B5C' }]}>
                  <Text style={[styles.badgeText, { color: '#FFFFFF' }]}>Perlu air</Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* Card 5 (Harvested / Opacity 80) */}
            <TouchableOpacity style={[styles.card, { opacity: 0.8 }]} activeOpacity={0.9}>
              <View style={styles.imageContainer}>
                <Image 
                  source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBbZZfiEKpT8ERGZUkLN_wICDP4eUNNPYmlQrR8eBOG-1Q9J7nELuh8e1ELkKEqFjSY_w5DDnaAgo2B1wrYAi6cT35smSCdCqKtIA10uw3Ow-a_X3glzxLLJoqZCyu-QF4IKzhObv3c1d3LqXp0hoq3AVr9dKIOLA_EIUD8iuOKBGKYXOaZceqoukDLRn8eepg8p1MGePukTMn2e_MhryrBAGYgC69a6W9q1WlOgn4roT8slfYa7Ea4dw' }} 
                  style={styles.cardImage} 
                />
                <View style={[styles.statusDot, { backgroundColor: '#bdcabd' }]} />
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle} numberOfLines={1}>Selada Air</Text>
                <Text style={styles.cardSubtitle}>Panen Hari 45</Text>
                <View style={[styles.badge, { backgroundColor: '#bdcabd' }]}>
                  <Text style={[styles.badgeText, { color: '#1c1c17' }]}>Dipanen</Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* Card 6 */}
            <TouchableOpacity style={styles.card} activeOpacity={0.9}>
              <View style={styles.imageContainer}>
                <Image 
                  source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCjbVOHCu5rlT-rKqgknffT4V03AFBFgnfMYpjyQMVSnVgijs8GLVtWqG7kZETJw5Bx8d2NVfnHS5ZS9WCgCPX5MmWURcIe5FI9lqLvGJ3oBB-22ObxvDfSKwN0Zpr8TDB55_WBaZR0iUJYSk1SmjWq7yjLHxLNR8JRW-mvduwEvWdwHsL3SHNPbzKQOOc2eBey59eDEJx2fwfG_Ay7u62BdddLjj0yiCLYbD-1F7A_vF6SZxn1nNuwiQ' }} 
                  style={styles.cardImage} 
                />
                <View style={[styles.statusDot, { backgroundColor: '#3FA86B' }]} />
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle} numberOfLines={1}>Cabai Rawit</Text>
                <Text style={styles.cardSubtitle}>Hari ke-10</Text>
                <View style={[styles.badge, { backgroundColor: '#3FA86B' }]}>
                  <Text style={[styles.badgeText, { color: '#FFFFFF' }]}>Sehat</Text>
                </View>
              </View>
            </TouchableOpacity>

          </View>
        </ScrollView>

        {/* FAB (Floating Action Button) */}
        <TouchableOpacity style={styles.fab} activeOpacity={0.9}>
          <MaterialIcons name="add" size={32} color="#FFFFFF" />
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FBF8F0',
  },
  container: {
    flex: 1,
    position: 'relative',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 100, // Memberi ruang biar kartu bawah nggak ketutup FAB
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1F5C3D',
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#123924',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#123924',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  filterSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  filterScroll: {
    flex: 1,
    marginRight: 12,
  },
  filterScrollContent: {
    gap: 8,
    paddingBottom: 4,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#123924',
  },
  filterChipActive: {
    backgroundColor: '#3FA86B',
  },
  filterChipInactive: {
    backgroundColor: '#FFFFFF',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  filterChipTextInactive: {
    color: '#3e4a40',
  },
  gridToggleButton: {
    width: 40,
    height: 40,
    backgroundColor: '#FBF8F0',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#123924',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12, // Gap didukung di React Native versi baru (Expo)
  },
  card: {
    width: '48%', // Mengambil hampir setengah layar, sisa untuk gap
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#123924',
    overflow: 'hidden',
    marginBottom: 8,
    shadowColor: '#123924',
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#b1f1c8',
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  statusDot: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#123924',
  },
  cardBody: {
    padding: 12,
    flex: 1,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#123924',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 11,
    color: '#5C5A4F',
    marginBottom: 12,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: '#123924',
    marginTop: 'auto', // Mendorong badge ke bawah
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3FA86B',
    borderWidth: 2,
    borderColor: '#123924',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#123924',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
    zIndex: 50,
  }
});