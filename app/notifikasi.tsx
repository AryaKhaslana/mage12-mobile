import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function NotifikasiScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1, alignItems: 'flex-start' }}>
          <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
            <MaterialIcons name="arrow-back" size={20} color="#123924" />
          </Pressable>
        </View>
        
        <Text style={styles.headerTitle}>Notifikasi</Text>
        
        <View style={{ flex: 1, alignItems: 'flex-end' }}>
          <Pressable style={({ pressed }) => [pressed && styles.pressed]}>
            <Text style={styles.headerAction}>Tandai Dibaca</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Today Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>HARI INI</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>2 Baru</Text>
            </View>
          </View>

          {/* Unread Card 1 */}
          <Pressable style={({ pressed }) => [styles.card, styles.cardUnread, pressed && styles.cardPressed]}>
            <View style={[styles.iconContainer, { backgroundColor: '#FF6B5C' }]}>
              <MaterialIcons name="water-drop" size={22} color="#FFFFFF" />
            </View>
            <View style={styles.cardContent}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle} numberOfLines={1}>Waktunya Menyiram Tanaman</Text>
                <Text style={styles.cardTime}>07:00</Text>
              </View>
              <Text style={styles.cardDesc}>Cabai Rawit kamu haus nih. Yuk siram sekarang agar tetap segar!</Text>
            </View>
            <View style={[styles.unreadDot, { backgroundColor: '#FF6B5C' }]} />
          </Pressable>

          {/* Unread Card 2 */}
          <Pressable style={({ pressed }) => [styles.card, styles.cardUnread, pressed && styles.cardPressed]}>
            <View style={[styles.iconContainer, { backgroundColor: '#3FA86B' }]}>
              <MaterialIcons name="emoji-events" size={22} color="#FFFFFF" />
            </View>
            <View style={styles.cardContent}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle} numberOfLines={1}>Pencapaian Baru Terbuka</Text>
                <Text style={styles.cardTime}>08:15</Text>
              </View>
              <Text style={styles.cardDesc}>Hebat! Kamu mencapai 12 hari streak merawat tanaman!</Text>
            </View>
            <View style={[styles.unreadDot, { backgroundColor: '#3FA86B' }]} />
          </Pressable>

          {/* Read Card 1 */}
          <Pressable style={({ pressed }) => [styles.card, styles.cardRead, pressed && styles.cardPressed]}>
            <View style={[styles.iconContainer, { backgroundColor: '#FFB627' }]}>
              <MaterialIcons name="eco" size={22} color="#FFFFFF" />
            </View>
            <View style={styles.cardContent}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitleRead} numberOfLines={1}>Jadwal Pemupukan Rutin</Text>
                <Text style={styles.cardTime}>06:30</Text>
              </View>
              <Text style={styles.cardDesc}>Tomat Ceri sudah berhasil diberi pupuk organik.</Text>
            </View>
          </Pressable>
        </View>

        {/* Yesterday Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>KEMARIN</Text>
          </View>

          {/* Read Card 2 */}
          <Pressable style={({ pressed }) => [styles.card, styles.cardRead, pressed && styles.cardPressed]}>
            <View style={styles.avatarContainer}>
              <Image 
                source={{ uri: 'https://lh3.googleusercontent.com/aida/AEtjO1V-LpjJeBtKuHjtBhJi_lx5jI9sxXFp5GMpljjOJ8uiBp24dSIbOE9rAHLLPR51kDwpJJSqKLo6usKHt3urb2hXHKcn9IYw1PRyH_PITXAlQQ-lBoEZ_5YCPa-wkaGSK-Juo-hDl2j6skZyrqkLX3Bktr7WqvCrtxW0XOX8mMKRaDsmoRgnlkj7SDLrIBQXWbMP0tIWa0WuYT5utHobfCqZKnbZcja1rjLIS1hTL3uSwdc8E8qJ4OZ8Ytk' }} 
                style={styles.avatar} 
              />
              <View style={styles.avatarBadge}>
                <Text style={{ fontSize: 10 }}>🔥</Text>
              </View>
            </View>
            <View style={styles.cardContent}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitleRead} numberOfLines={1}>Budi Memberi Semangat</Text>
                <Text style={styles.cardTime}>Kemarin</Text>
              </View>
              <Text style={styles.cardDesc}>Budi kasih semangat di postingan pembaruan kebunmu!</Text>
            </View>
          </Pressable>

          {/* Read Card 3 */}
          <Pressable style={({ pressed }) => [styles.card, styles.cardRead, pressed && styles.cardPressed]}>
            <View style={[styles.iconContainer, { backgroundColor: 'rgba(63, 168, 107, 0.15)' }]}>
              <MaterialIcons name="check-circle" size={22} color="#3FA86B" />
            </View>
            <View style={styles.cardContent}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitleRead} numberOfLines={1}>Penyiraman Selesai</Text>
                <Text style={styles.cardTime}>Kemarin</Text>
              </View>
              <Text style={styles.cardDesc}>Semua tanaman sudah disiram dan segar kembali.</Text>
            </View>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FBF8F0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(251, 248, 240, 0.85)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(18, 57, 36, 0.08)',
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(18, 57, 36, 0.12)',
    shadowColor: '#123924',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
  headerTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 17,
    color: '#123924',
  },
  headerAction: {
    fontFamily: 'Nunito_700Bold', // approximating font-semibold
    fontSize: 12,
    color: '#3FA86B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
    gap: 24,
  },
  section: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 12,
    color: '#5C5A4F',
    letterSpacing: 1,
  },
  badge: {
    backgroundColor: 'rgba(63, 168, 107, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  badgeText: {
    fontFamily: 'Nunito_500Medium',
    fontSize: 11,
    color: '#3FA86B',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: 'rgba(18, 57, 36, 0.08)',
  },
  cardUnread: {
    shadowColor: '#123924',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 3,
  },
  cardRead: {
    shadowColor: '#123924',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
    opacity: 0.85,
  },
  cardPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarContainer: {
    width: 44,
    height: 44,
    position: 'relative',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(18, 57, 36, 0.1)',
  },
  avatarBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFB627',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    flex: 1,
    gap: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 14,
    color: '#123924',
    flex: 1,
  },
  cardTitleRead: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: '#123924',
    flex: 1,
  },
  cardTime: {
    fontFamily: 'Nunito_500Medium',
    fontSize: 12,
    color: '#5C5A4F',
  },
  cardDesc: {
    fontFamily: 'Nunito_500Medium',
    fontSize: 12,
    color: '#5C5A4F',
    lineHeight: 18,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    alignSelf: 'center',
  },
});
