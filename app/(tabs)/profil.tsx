import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function ProfilScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* HEADER SECTION */}
        <View style={styles.headerBackground}>
          <TouchableOpacity style={styles.settingsButton}>
            <MaterialIcons name="settings" size={20} color="#3FA86B" />
          </TouchableOpacity>
          
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarContainer}>
              <Image 
                source={{ uri: 'https://lh3.googleusercontent.com/aida/AEtjO1V-LpjJeBtKuHjtBhJi_lx5jI9sxXFp5GMpljjOJ8uiBp24dSIbOE9rAHLLPR51kDwpJJSqKLo6usKHt3urb2hXHKcn9IYw1PRyH_PITXAlQQ-lBoEZ_5YCPa-wkaGSK-Juo-hDl2j6skZyrqkLX3Bktr7WqvCrtxW0XOX8mMKRaDsmoRgnlkj7SDLrIBQXWbMP0tIWa0WuYT5utHobfCqZKnbZcja1rjLIS1hTL3uSwdc8E8qJ4OZ8Ytk' }} 
                style={styles.avatarImage} 
              />
            </View>
            <View style={styles.editBadge}>
              <MaterialIcons name="edit" size={14} color="#123924" />
            </View>
          </View>

          <Text style={styles.profileName}>Fatih</Text>
          <Text style={styles.profileDate}>Bergabung sejak Maret 2026</Text>
        </View>

        {/* STATS GRID (Overlapping Header) */}
        <View style={styles.statsContainer}>
          <View style={[styles.statBox, { backgroundColor: '#FFB627' }]}>
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Streak{'\n'}hari</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: '#3FA86B' }]}>
            <Text style={[styles.statValue, { color: '#FFFFFF' }]}>8</Text>
            <Text style={[styles.statLabel, { color: '#FFFFFF' }]}>Tanaman{'\n'}dirawat</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: '#FF6B5C' }]}>
            <Text style={[styles.statValue, { color: '#FFFFFF' }]}>3</Text>
            <Text style={[styles.statLabel, { color: '#FFFFFF' }]}>Panen{'\n'}selesai</Text>
          </View>
        </View>

        {/* PENCAPAIAN */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pencapaian</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
            <View style={[styles.achievementIcon, { backgroundColor: '#FFB627' }]}>
              <MaterialIcons name="star" size={24} color="#1c1c17" />
            </View>
            <View style={[styles.achievementIcon, { backgroundColor: '#3FA86B' }]}>
              <MaterialIcons name="eco" size={24} color="#ffffff" />
            </View>
            <View style={[styles.achievementIcon, { backgroundColor: '#FF6B5C' }]}>
              <MaterialIcons name="local-fire-department" size={24} color="#ffffff" />
            </View>
            <View style={[styles.achievementIconLocked]}>
              <MaterialIcons name="lock" size={24} color="#5C5A4F" />
            </View>
            <View style={[styles.achievementIconLocked]}>
              <MaterialIcons name="lock" size={24} color="#5C5A4F" />
            </View>
          </ScrollView>
        </View>

        {/* TANAMAN KAMU */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Tanaman kamu</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>Lihat semua</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
            <TouchableOpacity style={styles.plantCard}>
              <Image source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAeBxTiUwwoTMgudjdj9PgQFtJidP2AK_vUsPxq8JxhUJEvxl1WgL7kLgk3B2bdwFyiZZBkuKQX_gYrP0z8weq2eU3nrEYxeJQ8WfmHIoTPDB2vmgkolUodiL6sroD_MeeZ6eqhzyEPnBAvNWJY7K99COxjwejErEXbTnUDbSipCdkZL6Pd_gwVaxHX4Eu-ekt3GktqcnPmtKrsMldGUirnLdVFlmcNAWPGz08B0CyexMI-X8OBU5pqog' }} style={styles.plantImage} />
              <View style={styles.plantNameContainer}>
                <Text style={styles.plantName} numberOfLines={1}>Sukulen</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.plantCard}>
              <Image source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBnD8FioRmbr32_6GQPHPLUq4X97BPqsICXIY6WWF_uiONFKNAAgw5FlRWutAxqhGTM32ZiJ-YEYAH81STF8kODn5oe3HGFFfrbqedghhVzVo-6OI5FyLM8y5E5DughXujTJVaD_DJBmGx6xrRtTr_vNI92KTzYsF6nGpjL5SwiMIWFeM7u35ObrPEs2YZ9xsfbgwTnh9oExxBY6vPmb94YXOZ3xURilwA3eEjb-2pB9ui_r8qC-MgzKg' }} style={styles.plantImage} />
              <View style={styles.plantNameContainer}>
                <Text style={styles.plantName} numberOfLines={1}>Kemangi</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.plantCard}>
              <Image source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD8Jf2gXXX6KbW3vgROOwPkba2eZWB01adI92JMLc5umMr27ILRKijHEIUjnWwhONyGePL-8AvzUQZsPRCcAr_vVwZTdcBYQEutpIY7t45QLoqs37Q7MiAStHOwPIBvAHCEYwdifuNzcs3oDdFBVKaNMceNU_7U0mwH3pSs6IxmQw8ZogNWNow-FFX5T5l5aP-eaz9uvBQFvPJGL29A-obPSSG56MjhmyTz9WzWu5yCC3Vtq9YtFnpNIQ' }} style={styles.plantImage} />
              <View style={styles.plantNameContainer}>
                <Text style={styles.plantName} numberOfLines={1}>Tomat</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.plantAddCard}>
              <View style={styles.plantAddIcon}>
                <MaterialIcons name="add" size={24} color="#123924" />
              </View>
              <Text style={styles.plantAddText}>Tambah</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* MENU LIST */}
        <View style={styles.menuContainer}>
          <TouchableOpacity style={styles.menuItem}>
            <MaterialIcons name="person" size={24} color="#123924" />
            <Text style={styles.menuText}>Edit Profil</Text>
            <MaterialIcons name="chevron-right" size={24} color="rgba(18,57,36,0.5)" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <MaterialIcons name="notifications" size={24} color="#123924" />
            <Text style={styles.menuText}>Pengaturan Notifikasi</Text>
            <MaterialIcons name="chevron-right" size={24} color="rgba(18,57,36,0.5)" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <MaterialIcons name="help" size={24} color="#123924" />
            <Text style={styles.menuText}>Bantuan & Dukungan</Text>
            <MaterialIcons name="chevron-right" size={24} color="rgba(18,57,36,0.5)" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <MaterialIcons name="info" size={24} color="#123924" />
            <Text style={styles.menuText}>Informasi Akun</Text>
            <MaterialIcons name="chevron-right" size={24} color="rgba(18,57,36,0.5)" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.menuItem, { borderBottomWidth: 0 }]}>
            <MaterialIcons name="privacy-tip" size={24} color="#123924" />
            <Text style={styles.menuText}>Kebijakan Privasi</Text>
            <MaterialIcons name="chevron-right" size={24} color="rgba(18,57,36,0.5)" />
          </TouchableOpacity>
        </View>

        {/* LOGOUT BUTTON */}
        <TouchableOpacity style={styles.logoutButton}>
          <MaterialIcons name="logout" size={24} color="#FF6B5C" />
          <Text style={styles.logoutText}>Keluar</Text>
        </TouchableOpacity>

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
  headerBackground: {
    backgroundColor: '#1F5C3D',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 60,
    paddingHorizontal: 20,
    position: 'relative',
  },
  settingsButton: {
    position: 'absolute',
    top: 40,
    right: 20,
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
  avatarWrapper: {
    position: 'relative',
    marginTop: 8,
    marginBottom: 12,
  },
  avatarContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 3,
    borderColor: '#123924',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  editBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFB627',
    borderWidth: 2,
    borderColor: '#123924',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#123924',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  profileDate: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: -40, // Menarik container ke atas header
    zIndex: 10,
    gap: 12,
  },
  statBox: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#123924',
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#123924',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#123924',
  },
  statLabel: {
    fontSize: 12,
    color: '#123924',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 16,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#3FA86B',
    marginBottom: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#3FA86B',
    textDecorationLine: 'underline',
  },
  horizontalScroll: {
    gap: 16,
    paddingBottom: 8,
  },
  achievementIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#123924',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#123924',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  achievementIconLocked: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FBF8F0',
    borderWidth: 2,
    borderColor: '#123924',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.7,
    marginTop: 6, // Biar center secara vertikal dengan icon yang lebih besar
  },
  plantCard: {
    width: 90,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#123924',
    borderRadius: 16,
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#123924',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  plantImage: {
    width: '100%',
    aspectRatio: 1,
    borderBottomWidth: 2,
    borderBottomColor: '#123924',
  },
  plantNameContainer: {
    padding: 8,
    width: '100%',
    alignItems: 'center',
  },
  plantName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1c1c17',
  },
  plantAddCard: {
    width: 90,
    minHeight: 120,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#123924',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    shadowColor: '#123924',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  plantAddIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#123924',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  plantAddText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#123924',
  },
  menuContainer: {
    marginHorizontal: 20,
    marginTop: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#123924',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#123924',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#123924',
  },
  menuText: {
    flex: 1,
    fontSize: 15,
    marginLeft: 16,
    color: '#1c1c17',
  },
  logoutButton: {
    marginHorizontal: 20,
    marginTop: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#123924',
    borderRadius: 999,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#123924',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FF6B5C',
  }
});