import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function DetailTanamanModal() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* TOP BAR */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color="#123924" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <MaterialIcons name="more-horiz" size={24} color="#123924" />
          </TouchableOpacity>
        </View>

        {/* HERO IMAGE SECTION */}
        <View style={styles.heroSection}>
          <View style={styles.imageWrapper}>
            <Image 
              source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBXRNtfl7XZseKxwR1dh8ALcVrpAHuCc5v2331cWym096aNEd9zGlNTT54xT_MENrv5ThkT0fJEp5FAHkYGbEHXTIjO9j5Z7qkd9DJAIaubfqYI8Y1A2USUIkUMMRos4aaTS-ZeFburAehutLZYWS56kJ4GeCYk462HIS58E9KjJg3wgejvKfbnpIQ1YO6Sxy-nEJw-kaJFcqaenff8a5H0avaYRMh16-9AX8e1b4-twWBhz-7e8LGtFg' }} 
              style={styles.heroImage} 
            />
          </View>
          <TouchableOpacity style={styles.floatingCamButton}>
            <MaterialIcons name="photo-camera" size={24} color="#123924" />
          </TouchableOpacity>
        </View>

        {/* TITLE SECTION */}
        <View style={styles.titleSection}>
          <Text style={styles.plantTitle}>Cabai Rawit</Text>
          <Text style={styles.plantSubtitle}>Ditanam sejak 14 hari lalu</Text>
        </View>

        {/* HARVEST ESTIMATION (Clay Card) */}
        <View style={styles.harvestCard}>
          <View style={styles.harvestIconCircle}>
            <MaterialIcons name="local-fire-department" size={24} color="#FFB627" />
          </View>
          <View style={styles.harvestTextContainer}>
            <Text style={styles.harvestTitle}>Estimasi Panen</Text>
            <Text style={styles.harvestSubtitle}>~2 minggu lagi</Text>
          </View>
        </View>

        {/* ACTION BUTTONS (Belum Siap / Sudah Dipanen) */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={[styles.actionBtn, styles.btnWhite]}>
            <Text style={styles.btnWhiteText}>Belum Siap,{'\n'}Ingatkan 3 Hari</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.btnGreen]}>
            <Text style={styles.btnGreenText}>Sudah{'\n'}Dipanen</Text>
          </TouchableOpacity>
        </View>

        {/* REMINDERS / SETTINGS */}
        <View style={styles.reminderCard}>
          
          {/* Penyiraman */}
          <View style={styles.reminderRow}>
            <View style={[styles.reminderIconBox, { backgroundColor: '#b1f1c8' }]}>
              <MaterialIcons name="water-drop" size={20} color="#123924" />
            </View>
            <View style={styles.reminderTextCol}>
              <Text style={styles.reminderTitle}>Penyiraman</Text>
              <Text style={styles.reminderSubtitle}>Setiap hari, 07.00</Text>
            </View>
            <View style={[styles.toggleTrack, { backgroundColor: '#b1f1c8' }]}>
              <View style={[styles.toggleThumb, { transform: [{ translateX: 24 }] }]} />
            </View>
          </View>

          <View style={styles.divider} />

          {/* Pemupukan */}
          <View style={styles.reminderRow}>
            <View style={[styles.reminderIconBox, { backgroundColor: '#ffd9dc' }]}>
              <MaterialIcons name="eco" size={20} color="#123924" />
            </View>
            <View style={styles.reminderTextCol}>
              <Text style={styles.reminderTitle}>Pemupukan</Text>
              <Text style={styles.reminderSubtitle}>Setiap 5 hari</Text>
            </View>
            <View style={[styles.toggleTrack, { backgroundColor: '#dcdad2' }]}>
              <View style={[styles.toggleThumb, { transform: [{ translateX: 2 }] }]} />
            </View>
          </View>

        </View>

        {/* BIG PHOTO BUTTON */}
        <TouchableOpacity style={styles.bigPhotoButton}>
          <MaterialIcons name="photo-camera" size={20} color="#FFFFFF" />
          <Text style={styles.bigPhotoText}>Foto & Konfirmasi Disiram</Text>
        </TouchableOpacity>

        {/* HISTORY */}
        <View style={styles.historySection}>
          <Text style={styles.historySectionTitle}>Riwayat perawatan</Text>
          
          {/* History 1 */}
          <View style={styles.historyItem}>
            <Image source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDxqsTaNRyGwtFsdPKKZUo5Xh9_TAb8NpRyDnTOwVlfVMxPryKy1j5DZLh5f7KnxsTbif_YAlFTIJUgoLeDmc9_D3rKOuyGAKAI0_pI3W8iguC56C-35immOSpLCukjuzXBGG2KhC0rANfSThGgtTv0TyNNpjBzVOjz9Ftm6ktNHe8q_991Fp_Lqz0fOFd9HTx36wOF0BlKwTvLqoOaqMBbfrhxFZCq-BX80efI8QmF62194Nd9GZ_jxQ' }} style={styles.historyImage} />
            <View style={styles.historyTextCol}>
              <Text style={styles.historyTitle}>Disiram</Text>
              <Text style={styles.historySubtitle}>Hari ini, 07:15</Text>
            </View>
          </View>

          {/* History 2 */}
          <View style={[styles.historyItem, { opacity: 0.6 }]}>
            <Image source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAK72N9bfUnTDR_qxCQtZfhdGFtdZeRDYs-OsNC2lUxmLLI86pKo2ugpOTvGWWwZL9sOkbzXCmRvMwHqent34F7rwvgUHge8_BFG9hN7iYc902WRQsddbBhE_9RiOVhij3iicG_BjbjGLfbqAgjgG9U9a64_nAsnjBQH2_AoUiMWgVBpRNDZeugVxjpYWAoqgIcNd6whl3ktEPbbtfIzxtMOHeRnbZXGuogESuoFy2lwMymfV81rGAUhA' }} style={styles.historyImage} />
            <View style={styles.historyTextCol}>
              <Text style={styles.historyTitle}>Diberi Pupuk</Text>
              <Text style={styles.historySubtitle}>Kemarin, 16:30</Text>
            </View>
          </View>

          {/* History 3 */}
          <View style={[styles.historyItem, { opacity: 0.6, borderBottomWidth: 0 }]}>
            <Image source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBzlz4_V_Bpw-gnQ_p5naZRf8BUI0AlHLbiqKW3W51wCd7UZYp38jJGzaNvZJGVQRbWAuuIvAWllIVrsJXImYeRxwUkAEhHsyiABfulZzvRXFE1LEWw6INvkiuuyG_xyQBd3RQZL7UVms7Yipt3t7KObJpGWoS8e4Ds4rzpTJQPnpklX0Ej39c3zfJGbFgCGAEppUCUmBzsJy-Oj5zNVBuiX2NZ4i24Gm1ooM5DnXF_LXKs7f6V9DRLyQ' }} style={styles.historyImage} />
            <View style={styles.historyTextCol}>
              <Text style={styles.historyTitle}>Ditanam</Text>
              <Text style={styles.historySubtitle}>14 hari lalu, 08:00</Text>
            </View>
          </View>
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
  scrollContent: {
    paddingBottom: 40,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    marginBottom: 16,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#123924',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#123924',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  heroSection: {
    marginHorizontal: 20,
    position: 'relative',
    marginBottom: 16,
  },
  imageWrapper: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#123924',
    overflow: 'hidden',
    backgroundColor: '#96d4ad',
    shadowColor: '#123924',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  floatingCamButton: {
    position: 'absolute',
    bottom: -16,
    right: 24,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#123924',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#123924',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
    zIndex: 10,
  },
  titleSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  plantTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1F5C3D',
    marginBottom: 4,
  },
  plantSubtitle: {
    fontSize: 12,
    color: '#5C5A4F',
  },
  harvestCard: {
    marginHorizontal: 20,
    backgroundColor: '#1F5C3D',
    borderRadius: 28,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#123924',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 6,
  },
  harvestIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 4,
    borderColor: '#FFB627',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  harvestTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  harvestTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  harvestSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 4,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 16,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  actionBtn: {
    flex: 1,
    minHeight: 56,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: '#123924',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    shadowColor: '#123924',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  btnWhite: {
    backgroundColor: '#FFFFFF',
  },
  btnGreen: {
    backgroundColor: '#3FA86B',
  },
  btnWhiteText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#123924',
    textAlign: 'center',
  },
  btnGreenText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  reminderCard: {
    marginHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#123924',
    padding: 16,
    marginBottom: 16,
    shadowColor: '#123924',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  reminderIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#123924',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  reminderTextCol: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#123924',
  },
  reminderSubtitle: {
    fontSize: 12,
    color: '#5C5A4F',
    marginTop: 2,
  },
  toggleTrack: {
    width: 48,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#123924',
    justifyContent: 'center',
  },
  toggleThumb: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#123924',
  },
  divider: {
    width: '100%',
    height: 2,
    backgroundColor: '#123924',
    my: 8,
  },
  bigPhotoButton: {
    marginHorizontal: 20,
    backgroundColor: '#1F5C3D',
    borderRadius: 999,
    borderWidth: 2,
    borderColor: '#123924',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginBottom: 32,
    gap: 8,
    shadowColor: '#123924',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
  },
  bigPhotoText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  historySection: {
    paddingHorizontal: 20,
  },
  historySectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F5C3D',
    marginBottom: 12,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#123924',
  },
  historyImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#123924',
    marginRight: 12,
    backgroundColor: '#e5e2db',
  },
  historyTextCol: {
    flex: 1,
  },
  historyTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#123924',
  },
  historySubtitle: {
    fontSize: 11,
    color: '#5C5A4F',
    marginTop: 2,
  },
});