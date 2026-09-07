import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function DashboardScreen() {
  const [task1Done, setTask1Done] = useState(false);
  const [task2Done, setTask2Done] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <MaterialIcons name="person" size={24} color="#5C5A4F" />
          </View>
          <View>
            <Text style={styles.greeting}>Halo, Fatih</Text>
            <Text style={styles.subtitle}>Yuk cek tanamanmu hari ini</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.notifButton}>
          <MaterialIcons name="notifications" size={24} color="#123924" />
          <View style={styles.notifBadge} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        
        {/* STREAK HERO CARD (Clay Element) */}
        <TouchableOpacity style={styles.heroCard} activeOpacity={0.9}>
          <View style={styles.fireIconContainer}>
            <MaterialIcons name="local-fire-department" size={28} color="#FFFFFF" />
          </View>
          <View style={styles.heroTextContainer}>
            <Text style={styles.heroTitle}>12 hari streak!</Text>
            <Text style={styles.heroSubtitle}>Kamu lagi on fire, jangan putus ya</Text>
          </View>
          <MaterialIcons name="chevron-right" size={28} color="rgba(255,255,255,0.8)" />
        </TouchableOpacity>

        {/* REMINDER LIST (Neobrutalist Framed) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hari ini</Text>
          
          {/* Task 1 */}
          <TouchableOpacity style={styles.taskCard} activeOpacity={0.8}>
            <View style={[styles.taskIconBox, { backgroundColor: '#FF6B5C' }]}>
              <MaterialIcons name="water-drop" size={24} color="#FFFFFF" />
            </View>
            <View style={styles.taskInfo}>
              <Text style={styles.taskName}>Cabai Rawit</Text>
              <Text style={[styles.taskStatus, { color: '#FF6B5C' }]}>Perlu disiram, 2 jam lagi</Text>
            </View>
            <TouchableOpacity 
              style={[styles.checkbox, task1Done && styles.checkboxDoneCoral]} 
              onPress={() => setTask1Done(!task1Done)}
            >
              {task1Done && <MaterialIcons name="check" size={16} color="#FFFFFF" />}
            </TouchableOpacity>
          </TouchableOpacity>

          {/* Task 2 */}
          <TouchableOpacity style={styles.taskCard} activeOpacity={0.8}>
            <View style={[styles.taskIconBox, { backgroundColor: '#FFB627' }]}>
              <MaterialIcons name="science" size={24} color="#123924" />
            </View>
            <View style={styles.taskInfo}>
              <Text style={styles.taskName}>Tomat Ceri</Text>
              <Text style={styles.taskStatus}>Perlu dipupuk hari ini</Text>
            </View>
            <TouchableOpacity 
              style={[styles.checkbox, task2Done && styles.checkboxDoneAmber]} 
              onPress={() => setTask2Done(!task2Done)}
            >
              {task2Done && <MaterialIcons name="check" size={16} color="#FFFFFF" />}
            </TouchableOpacity>
          </TouchableOpacity>
        </View>

        {/* YOUR PLANTS SECTION (Horizontal Scroll) */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Tanaman kamu</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>Lihat semua</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
            {/* Plant Card 1 */}
            <TouchableOpacity style={styles.plantCard} activeOpacity={0.9}>
              <Image 
                source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCe81rgdi1boYtclLjGnzTqDDm6iBy74ue3T529nruGw4g8QQrCCd87H7HXKCEk7T5s5XX7ebvZCgibjsSS6pfno_nBeO54rYcubm9B02j0IermpbjDXXc1I9W3vntj6FWOQkJ9UuTq-jqvSc8JCgXbw9gcquKLlzEsCljN1qs5Cikw3lU6X1j9tCRNGb_Oas6qOrA_9abfs1ClEV6oLMXl4zoNuVb55jBw6xbvVyEt1Lf0V1qfjOf4pQ' }} 
                style={styles.plantImagePlaceholder} 
              />
              <View style={styles.plantCardBody}>
                <Text style={styles.plantName} numberOfLines={1}>Cabai Rawit</Text>
                <View style={[styles.badge, { backgroundColor: '#3FA86B' }]}>
                  <Text style={[styles.badgeText, { color: '#FFFFFF' }]}>Sehat</Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* Plant Card 2 */}
            <TouchableOpacity style={styles.plantCard} activeOpacity={0.9}>
              <Image 
                source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA5M9Uyy29Nd0g8LyRrFsw-htYKOG-KEIo_xugFw8P5JpbySu5Tifnrh5Po2hhMbtXAiliDgVwt2X_VCCDI0yCbowj6GOETkTtB_JQCH_XiJvRDUmzxq7hyN1-KOWZDaxdBVApM05OOCztm4boYt2ofr3YNulVIybQxLLWogLtP-w-6S5zQlDBoHmADK57ehIn0TUNozvVqsL8TVztvIuVSdTvWCAKvQR8ri2Tyiv562WKYld5nvccCJA' }} 
                style={styles.plantImagePlaceholder} 
              />
              <View style={styles.plantCardBody}>
                <Text style={styles.plantName} numberOfLines={1}>Tomat Ceri</Text>
                <View style={[styles.badge, { backgroundColor: '#FFB627' }]}>
                  <Text style={[styles.badgeText, { color: '#123924' }]}>Bunga</Text>
                </View>
              </View>
            </TouchableOpacity>
          </ScrollView>
        </View>

      </ScrollView>
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
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FBF8F0',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#123924',
    alignItems: 'center',
    justifyContent: 'center',
  },
  greeting: {
    fontSize: 20,
    fontWeight: '800',
    color: '#00522c',
  },
  subtitle: {
    fontSize: 12,
    color: '#5C5A4F',
    fontWeight: '500',
  },
  notifButton: {
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
  notifBadge: {
    position: 'absolute',
    top: 6,
    right: 8,
    width: 10,
    height: 10,
    backgroundColor: '#FF6B5C',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#123924',
  },
  heroCard: {
    backgroundColor: '#1F5C3D',
    borderRadius: 28,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: '#123924',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 6,
  },
  fireIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFB627',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#00522c',
    marginBottom: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#3FA86B',
  },
  taskCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#123924',
    borderRadius: 20,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#123924',
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
  },
  taskIconBox: {
    width: 48,
    height: 48,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#123924',
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskInfo: {
    flex: 1,
    marginLeft: 12,
  },
  taskName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#123924',
    marginBottom: 4,
  },
  taskStatus: {
    fontSize: 11,
    color: '#5C5A4F',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#123924',
    backgroundColor: '#FFFFFF',
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxDoneCoral: {
    backgroundColor: '#FF6B5C',
  },
  checkboxDoneAmber: {
    backgroundColor: '#FFB627',
  },
  horizontalScroll: {
    gap: 16,
    paddingBottom: 8,
  },
  plantCard: {
    width: 140,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#123924',
    borderRadius: 20,
    overflow: 'hidden',
    marginRight: 16,
    shadowColor: '#123924',
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
  },
  plantImagePlaceholder: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#96d4ad',
  },
  plantCardBody: {
    padding: 12,
  },
  plantName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#123924',
    marginBottom: 8,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: '#123924',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  }
});