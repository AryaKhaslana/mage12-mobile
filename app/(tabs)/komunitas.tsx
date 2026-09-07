import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function KomunitasScreen() {
  const [activeTab, setActiveTab] = useState('Terbaru');

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {/* HEADER */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Komunitas</Text>
            <TouchableOpacity style={styles.searchButton}>
              <MaterialIcons name="search" size={24} color="#123924" />
            </TouchableOpacity>
          </View>

          {/* TABS TOGGLE */}
          <View style={styles.tabContainer}>
            <TouchableOpacity 
              style={[styles.tabButton, activeTab === 'Terbaru' ? styles.tabActive : styles.tabInactive]}
              onPress={() => setActiveTab('Terbaru')}
            >
              <Text style={[styles.tabText, activeTab === 'Terbaru' ? styles.tabTextActive : styles.tabTextInactive]}>Terbaru</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.tabButton, activeTab === 'Terdekat' ? styles.tabActive : styles.tabInactive]}
              onPress={() => setActiveTab('Terdekat')}
            >
              <Text style={[styles.tabText, activeTab === 'Terdekat' ? styles.tabTextActive : styles.tabTextInactive]}>Terdekat</Text>
            </TouchableOpacity>
          </View>

          {/* FEED LIST */}
          <View style={styles.feedContainer}>
            
            {/* POST 1 (Fatih) */}
            <View style={styles.postCard}>
              {/* Post Header */}
              <View style={styles.postHeader}>
                <View style={styles.avatarContainer}>
                  <Image source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDMNyKkXQVH-96lmVRDApu0au4UNjpO6P1rk3kF8eL7T6qODKwBmtEGdXYCLun1L8OP-FSju7jPHolY6uExg-9N-zP49FWtJvWhf5dAAyAyrmeH07qDqW-ZTsIzPyVfBn0SiNe5NGg9c1jY7MiJLckIaULsHGbGuuiYDefmw6P2cM2ALin8NXP89nAI7Z2eukz62NZvsWbTpCCqNdG8x70U8xU1AuAhBRaaiekac9htmjcZVJRO3kq3yQ' }} style={styles.avatar} />
                </View>
                <View style={styles.postMeta}>
                  <View style={styles.nameRow}>
                    <Text style={styles.authorName}>Fatih</Text>
                    <View style={styles.streakBadge}>
                      <Text style={styles.streakText}>🔥 12</Text>
                    </View>
                  </View>
                  <Text style={styles.timeText}>2 jam lalu</Text>
                </View>
              </View>
              
              {/* Post Image */}
              <View style={styles.postImageContainer}>
                <Image source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA48RspILvxZZypZnlP8G-YYwS0D2C3IvmDeNwFSbm0JaWNvKoXxisLtqsKJ50IK3MlwyWipdT5CobNgGnMb8hfvN0-muw0PzcAA5hG9RbJunRoElZn7cLmfPS-EPrTTh3RuZZWoYRjS7NQfr-iLF2LXbMvuX4BiD8tq-VXVq8jYNOsp2rdczFyIaHvJUs4tUgMfHGxGiCGHyLf-pR_PMIq5_GRiGtRxukwerLeQ1K0cDGWerqpwqW59A' }} style={styles.postImage} />
              </View>

              {/* Post Text */}
              <Text style={styles.postCaption}>
                Cabai rawitku mulai merah-merah nih! Seneng banget akhirnya bisa panen sendiri di balkon.
              </Text>

              {/* Post Tags */}
              <View style={[styles.tagBadge, { backgroundColor: '#2E9E8C' }]}>
                <Text style={styles.tagText}>Hari ke-14 · Cabai Rawit</Text>
              </View>

              {/* Post Actions */}
              <View style={styles.actionRow}>
                <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#FF6B5C' }]}>
                  <MaterialIcons name="favorite" size={16} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <MaterialIcons name="chat-bubble" size={16} color="#123924" />
                </TouchableOpacity>
              </View>
            </View>

            {/* POST 2 (Budi) */}
            <View style={styles.postCard}>
              {/* Post Header */}
              <View style={styles.postHeader}>
                <View style={styles.avatarContainer}>
                  <Image source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAsctsztjTi8eV_cXIRVlOOZpdr4CjWW33lY52alMs6DRTvpaSvVyqgUr-zamCfvVk-ZaHv_FVAe16NqMWYVlJw9f8b6P_Wc6ZMni88Bf_4obLn4ZOelo-8aEz6Yv1I15P-IpbQeeNB0v8wNOLFdYYEa5IQUv2KIadb56bZR70dB7igSa8jgqsvIvsfpM-yo1XV34b7v1SXbzZmQJCjMGcOEWEuyBs0KScPg5371wK0mbJ_u09VICW02w' }} style={styles.avatar} />
                </View>
                <View style={styles.postMeta}>
                  <View style={styles.nameRow}>
                    <Text style={styles.authorName}>Budi</Text>
                    <View style={styles.streakBadge}>
                      <Text style={styles.streakText}>🔥 5</Text>
                    </View>
                  </View>
                  <Text style={styles.timeText}>5 jam lalu</Text>
                </View>
              </View>
              
              {/* Post Image */}
              <View style={styles.postImageContainer}>
                <Image source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCnAfEZVomKBI40ycKsqljttolfs2Iwvx9rv2tsgxay8nuYjjdvmRolsLqKAATqee85ASt7DQntviilxzcj6IR_pRZj5JIZ_sDeS9LdPlxhAEPOkcDcX1-qeeyOr40YtO_u9O3VICFzrZje6PZ9fVVxvWdx5_7h9m2qrW5z7SDV4v6ncKAASZpmipE1bcDdXKdoksCv7BRbXUKZH5c4suznJNnzJN523mctNc4F7fOyJgU2iqj0pM4YKQ' }} style={styles.postImage} />
              </View>

              {/* Post Text */}
              <Text style={styles.postCaption}>
                Daun baru monstera jandabolong akhirnya mekar sempurna. Pagi yang indah!
              </Text>

              {/* Post Tags */}
              <View style={[styles.tagBadge, { backgroundColor: '#2E9E8C' }]}>
                <Text style={styles.tagText}>Tanaman Hias · Monstera</Text>
              </View>

              {/* Post Actions */}
              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.actionButton}>
                  <MaterialIcons name="favorite-border" size={16} color="#123924" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <MaterialIcons name="chat-bubble-outline" size={16} color="#123924" />
                </TouchableOpacity>
              </View>
            </View>

          </View>
        </ScrollView>

        {/* LEFT FAB (Mascot / Assistant) */}
        <TouchableOpacity style={styles.leftFab} activeOpacity={0.9}>
          <View style={styles.mascotContainer}>
            <Image source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCTjpOOMGzAtXXTR7E78hS9yI72ZAtQLhgRDnMHEqp4UgwUbZIhFbvpbfav6sQkBELuAo1TXgv3kF-QZzF-zu10Cts5xWZANv_wWvv8jLBgSfsNeVHo0rmA_O_3mYQF6gGBxy27YMN61UgAI_KC2RSdflCFRqzkpVvNZVA3IeEK5M6xzG7GD3qFx0wHdjkb6Cwg-EQgEfkHbqZq6p-rA_E0rzZJDjxWVJblyVlYv4nXSijUmezM-ecGQA' }} style={styles.mascotImage} />
          </View>
          <View style={styles.mascotDot} />
        </TouchableOpacity>

        {/* RIGHT FAB (Camera) */}
        <TouchableOpacity style={styles.rightFab} activeOpacity={0.9}>
          <MaterialIcons name="photo-camera" size={28} color="#FFFFFF" />
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
    paddingTop: 16,
    paddingBottom: 120, // Ruang ekstra buat 2 tombol FAB di bawah
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#123924',
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    borderWidth: 2,
    borderColor: '#123924',
    padding: 4,
    marginBottom: 24,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 999,
    alignItems: 'center',
    borderWidth: 2,
  },
  tabActive: {
    backgroundColor: '#3FA86B',
    borderColor: '#123924',
  },
  tabInactive: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  tabTextInactive: {
    color: '#3e4a40',
  },
  feedContainer: {
    gap: 24,
  },
  postCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#123924',
    padding: 16,
    shadowColor: '#123924',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#123924',
    overflow: 'hidden',
    backgroundColor: '#e5e2db',
  },
  avatar: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  postMeta: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  authorName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#123924',
  },
  streakBadge: {
    backgroundColor: '#FFB627',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: '#123924',
  },
  streakText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#123924',
  },
  timeText: {
    fontSize: 11,
    color: '#3e4a40',
    marginTop: 2,
  },
  postImageContainer: {
    width: '100%',
    height: 192,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#123924',
    overflow: 'hidden',
    backgroundColor: '#e5e2db',
    marginBottom: 16,
  },
  postImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  postCaption: {
    fontSize: 15,
    lineHeight: 24,
    color: '#123924',
    marginBottom: 16,
  },
  tagBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: '#123924',
    marginBottom: 16,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#123924',
    alignItems: 'center',
    justifyContent: 'center',
  },
  leftFab: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2e6949',
    borderWidth: 2,
    borderColor: '#123924',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#123924',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
    zIndex: 50,
  },
  mascotContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FBF8F0',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  mascotImage: {
    width: 32,
    height: 32,
    resizeMode: 'contain',
  },
  mascotDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 16,
    height: 16,
    backgroundColor: '#FFB627',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#123924',
  },
  rightFab: {
    position: 'absolute',
    bottom: 24,
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
    elevation: 5,
    zIndex: 40,
  },
});