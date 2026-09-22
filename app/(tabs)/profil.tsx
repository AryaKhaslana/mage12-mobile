import * as SecureStore from "expo-secure-store";
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from "expo-image"; // use expo-image for avatars if they have it, or react-native Image
import { router, useFocusEffect } from 'expo-router';
import api, { Achievement, AchievementResponse, getAchievements } from '../../services/api';

export default function ProfilScreen() {
  const insets = useSafeAreaInsets();
  const getRankTitle = (level: number) => {
    if (level >= 8) return "Sultan Hidroponik ";
    if (level >= 4) return "Juragan Panen ";
    return "Petani Balkon ";
  };
  const [showAbout, setShowAbout] = React.useState(false);
  const [showRiwayatPanen, setShowRiwayatPanen] = React.useState(false);
  const [riwayatPanen, setRiwayatPanen] = React.useState<any[]>([]);
  const [isLoadingRiwayat, setIsLoadingRiwayat] = React.useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [tanamanList, setTanamanList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [achievementsData, setAchievementsData] = useState<AchievementResponse | null>(null);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      const fetchData = async () => {
        if (!userData) {
          setIsLoading(true);
        }
        try {
          const [userRes, tanamanRes, achRes] = await Promise.all([
            api.get("/user/me").catch(() => null),
            api.get("/tanaman").catch(() => null),
            getAchievements().catch(() => null)
          ]);

          if (isActive) {
            if (userRes?.data?.data) {
              setUserData(userRes.data.data);
            }
            if (tanamanRes?.data?.data) {
              setTanamanList(tanamanRes.data.data);
            }
            if (achRes) {
              setAchievementsData(achRes);
            }
          }
        } catch (error) {
          console.error("Gagal mengambil data profil:", error);
        } finally {
          if (isActive) setIsLoading(false);
        }
      };

      fetchData();
      return () => { isActive = false; };
    }, [])
  );

  const nameFallback = userData?.nama || "Petani";
  const avatarUrl = userData?.avatarUrl;
  const initial = nameFallback.charAt(0).toUpperCase();

    const fetchRiwayatPanen = async () => {
    setIsLoadingRiwayat(true);
    try {
      const res = await api.get("/tanaman/riwayat");
      if (res.data?.data) {
        setRiwayatPanen(res.data.data);
      } else if (res.data) {
        setRiwayatPanen(res.data);
      }
    } catch (err) {
      console.error("Gagal ambil riwayat panen", err);
    } finally {
      setIsLoadingRiwayat(false);
    }
  };

  const streak = userData?.streak || 0;
  const tanamanCount = tanamanList.length;
  const siapPanenCount = tanamanList.filter(t => t.sisaHariPanen <= 0).length;

  return (
    <SafeAreaView style={styles.safeArea} edges={["right", "bottom", "left"]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* HEADER */}
        <View style={[styles.headerBackground, { paddingTop: 40 + insets.top }]}>


          <View style={styles.avatarWrapper}>
            <View style={styles.avatarContainer}>
              {avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
              ) : (
                <View style={[styles.avatarImage, { backgroundColor: '#3FA86B', alignItems: 'center', justifyContent: 'center' }]}>
                  <Text style={styles.avatarInitials}>{initial}</Text>
                </View>
              )}
            </View>
            <View style={styles.editBadge}>
              <MaterialIcons name="edit" size={14} color="#123924" />
            </View>
          </View>

          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.profileName}>{nameFallback}</Text>
                <View style={{ backgroundColor: '#FFB627', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, borderWidth: 1, borderColor: '#123924' }}>
                  <Text style={{ fontSize: 10, fontFamily: 'Nunito_800ExtraBold', color: '#123924' }}>Lv.{userData?.level || 1}</Text>
                </View>
              </View>
              {userData?.username && (
                <Text style={styles.profileUsername}>@{userData.username}</Text>
              )}
              
              <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8F5E9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: '#3FA86B', alignSelf: 'center', marginTop: 4, marginBottom: 8 }}>
                <Text style={{ fontSize: 12, fontFamily: 'Nunito_700Bold', color: '#123924' }}>{getRankTitle(userData?.level || 1)}</Text>
              </View>
              
              {userData?.bio ? (
                <Text style={styles.profileBio} numberOfLines={3}>{userData.bio}</Text>
              ) : (
                <Text style={styles.profileBioEmpty}>Belum ada bio ✍️</Text>
              )}
            </>
          )}
        </View>

        {/* STAT BOXES (OVERLAPPING HEADER) */}
        <View style={styles.statsContainer}>
          <View style={[styles.statBox, { backgroundColor: '#FFB627' }]}>
            <Text style={styles.statValue}>{streak}</Text>
            <Text style={styles.statLabel}>Streak</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: '#3FA86B' }]}>
            <Text style={[styles.statValue, { color: '#FFFFFF' }]}>{tanamanCount}</Text>
            <Text style={[styles.statLabel, { color: '#FFFFFF' }]}>Tanaman dirawat</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: '#FF6B5C' }]}>
            <Text style={[styles.statValue, { color: '#FFFFFF' }]}>{siapPanenCount}</Text>
            <Text style={[styles.statLabel, { color: '#FFFFFF' }]}>Siap panen</Text>
          </View>
        </View>

        
        {/* PENCAPAIAN */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pencapaian</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
            {achievementsData?.achievements ? achievementsData.achievements.map((ach: Achievement, index: number) => {
              const bgColors = ["#FFB627", "#3FA86B", "#FF6B5C"];
              const bgColor = bgColors[index % bgColors.length];
              
              let iconName = "star";
              if (ach.kode === "panen_pertama" || ach.kode === "panen_lima") iconName = "agriculture";
              else if (ach.kode === "panen_sepuluh") iconName = "emoji-events";
              else if (ach.kode === "kolektor") iconName = "eco";
              else if (ach.kode === "streak_tujuh") iconName = "local-fire-department";
              else if (ach.kode === "streak_tigapuluh") iconName = "whatshot";

              return (
                <Pressable 
                  key={ach.kode}
                  onPress={() => {
                    Alert.alert(
                      ach.judul,
                      `${ach.deskripsi}\n\nProgress: ${ach.tercapai ? "Tercapai! " : `${ach.progress}/${ach.target}`}`
                    );
                  }}
                  style={({ pressed }) => [
                    ach.tercapai ? [styles.achievementIcon, { backgroundColor: bgColor }] : styles.achievementIconLocked,
                    pressed && ach.tercapai && styles.pressedShadow2
                  ]}
                >
                  <MaterialIcons 
                    name={iconName as any} 
                    size={ach.tercapai ? 28 : 24} 
                    color={ach.tercapai ? "#FFFFFF" : "#5C5A4F"} 
                  />
                </Pressable>
              );
            }) : (
              // Skeleton loading for achievements
              [1, 2, 3, 4].map(i => (
                <View key={i} style={[styles.achievementIconLocked, { backgroundColor: '#E8E5DA', opacity: 0.5 }]} />
              ))
            )}
          </ScrollView>
        </View>

        {/* TANAMAN KAMU */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Tanaman kamu</Text>
            <Pressable onPress={() => router.push("/(tabs)/tanaman")}>
              <Text style={styles.seeAllText}>Lihat semua</Text>
            </Pressable>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
            {tanamanList.slice(0, 5).map((t) => (
              <Pressable 
                key={t.id}
                style={({ pressed }) => [
                  styles.plantCard,
                  pressed && styles.pressedShadow2,
                ]}
                onPress={() => router.push({ pathname: "/detail-tanaman", params: { id: t.id } } as any)}
              >
                <View style={styles.plantBlock}>
                  <MaterialIcons name="eco" size={28} color="#3FA86B" />
                </View>
                <View style={styles.plantNameContainer}>
                  <Text style={styles.plantName} numberOfLines={1}>
                    {t.nickname || t.jenisTanaman}
                  </Text>
                </View>
              </Pressable>
            ))}

            {/* KARTU TAMBAH (Selalu ada di akhir) */}
            <Pressable 
              style={({ pressed }) => [
                styles.plantAddCard,
                pressed && styles.pressedShadow2,
              ]}
              onPress={() => router.push("/(tabs)/tanaman")}
            >
              <View style={styles.plantAddIcon}>
                <MaterialIcons name="add" size={24} color="#123924" />
              </View>
              <Text style={styles.plantAddText}>Tambah</Text>
            </Pressable>
          </ScrollView>
        </View>

        {/* MENU LIST */}
        <View style={styles.menuContainer}>
          <Pressable 
            style={({ pressed }) => [
              styles.menuItem, 
              pressed && styles.menuItemPressed,
            ]}
            onPress={() => router.push("/edit-profil" as any)}
          >
            <MaterialIcons name="person-outline" size={24} color="#123924" />
            <Text style={styles.menuText}>Edit Profil</Text>
            <MaterialIcons name="chevron-right" size={24} color="rgba(18,57,36,0.5)" />
          </Pressable>
          
          <Pressable 
            style={({ pressed }) => [
              styles.menuItem, 
              pressed && styles.menuItemPressed,
            ]}
            onPress={() => router.push("/pengaturan-notifikasi" as any)}
          >
            <MaterialIcons name="notifications-none" size={24} color="#123924" />
            <Text style={styles.menuText}>Pengaturan Notifikasi</Text>
            <MaterialIcons name="chevron-right" size={24} color="rgba(18,57,36,0.5)" />
          </Pressable>


          <Pressable 
            style={({ pressed }) => [
              styles.menuItem, 
              pressed && styles.menuItemPressed,
            ]}
            onPress={() => setShowAbout(true)}
          >
            <MaterialIcons name="info-outline" size={24} color="#123924" />
            <Text style={styles.menuText}>Tentang Aplikasi</Text>
            <MaterialIcons name="chevron-right" size={24} color="rgba(18,57,36,0.5)" />
          </Pressable>


          <Pressable 
            style={({ pressed }) => [
              styles.menuItem, 
              pressed && styles.menuItemPressed,
            ]}
            onPress={() => router.push("/kebijakan-privasi" as any)}
          >
            <MaterialIcons name="privacy-tip" size={24} color="#123924" />
            <Text style={styles.menuText}>Kebijakan Privasi</Text>
            <MaterialIcons name="chevron-right" size={24} color="rgba(18,57,36,0.5)" />
          </Pressable>

          <Pressable 
            style={({ pressed }) => [
              styles.menuItem, 
              pressed && styles.menuItemPressed,
            ]}
            onPress={() => router.push("/ketentuan-layanan" as any)}
          >
            <MaterialIcons name="gavel" size={24} color="#123924" />
            <Text style={styles.menuText}>Ketentuan Layanan</Text>
            <MaterialIcons name="chevron-right" size={24} color="rgba(18,57,36,0.5)" />
          </Pressable>

          <Pressable 
            style={({ pressed }) => [
              styles.menuItem, 
              pressed && styles.menuItemPressed,
              { borderBottomWidth: 0 } // Last item has no border
            ]}
            onPress={() => router.push("/pusat-bantuan")}
          >
            <MaterialIcons name="help-outline" size={24} color="#123924" />
            <Text style={styles.menuText}>Pusat Bantuan</Text>
            <MaterialIcons name="chevron-right" size={24} color="rgba(18,57,36,0.5)" />
          </Pressable>
        </View>

        
        {/* LOGOUT BUTTON */}
        <Pressable 
          style={({ pressed }) => [
            styles.logoutButton,
            pressed && styles.pressedShadow3,
          ]}
          onPress={async () => {
            await SecureStore.deleteItemAsync("userToken");
            await SecureStore.deleteItemAsync("userData");
            await AsyncStorage.removeItem("dashboard_weather");
            await AsyncStorage.removeItem("dashboard_tanaman");
            router.replace("/(auth)/login");
          }}
        >
          <MaterialIcons name="logout" size={24} color="#FF6B5C" />
          <Text style={styles.logoutText}>Keluar</Text>
        </Pressable>

        {/* ABOUT MODAL */}
        <Modal visible={showAbout} transparent animationType="fade">
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
            <View style={{ backgroundColor: '#FBF8F0', padding: 24, borderRadius: 24, borderWidth: 2, borderColor: '#123924', boxShadow: '4px 4px 0px #123924', width: '100%', alignItems: 'center' }}>
              <MaterialIcons name="eco" size={48} color="#3FA86B" style={{ marginBottom: 12 }} />
              <Text style={{ fontFamily: 'Nunito_800ExtraBold', fontSize: 24, color: '#123924', marginBottom: 4 }}>TaniSync</Text>
              <Text style={{ fontFamily: 'Nunito_500Medium', fontSize: 14, color: '#5C5A4F', marginBottom: 16 }}>Versi 1.0.0</Text>
              
              <Text style={{ fontFamily: 'Nunito_500Medium', fontSize: 14, color: '#123924', textAlign: 'center', marginBottom: 24, lineHeight: 22 }}>
                Aplikasi teman bertani kaum urban. TaniSync membantumu merawat tanaman dengan mudah dan menyenangkan. Dibuat untuk Project MAGE .
              </Text>
              
              <Pressable 
                onPress={() => setShowAbout(false)}
                style={({ pressed }) => [{ backgroundColor: '#3FA86B', paddingVertical: 12, paddingHorizontal: 32, borderRadius: 100, borderWidth: 2, borderColor: '#123924', boxShadow: '2px 2px 0px #123924' }, pressed && { boxShadow: '0px 0px 0px #123924', transform: [{translateX: 2}, {translateY: 2}] }]}
              >
                <Text style={{ fontFamily: 'Nunito_800ExtraBold', fontSize: 16, color: '#123924' }}>Tutup</Text>
              </Pressable>
            </View>
          </View>
        </Modal>


      </ScrollView>
    
      {/* MODAL RIWAYAT PANEN */}
      <Modal visible={showRiwayatPanen} animationType="slide" transparent={false}>
        <View style={{ flex: 1, backgroundColor: '#FBF8F0', paddingTop: 48 }}>
          {/* HEADER */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingBottom: 16, borderBottomWidth: 4, borderColor: '#123924', backgroundColor: '#FF7D6B' }}>
            <View>
              <Text style={{ fontFamily: 'Nunito_800ExtraBold', fontSize: 24, color: '#123924' }}>Piala Panen 🏆</Text>
              <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: 14, color: '#123924' }}>Tanaman yang sukses kamu rawat!</Text>
            </View>
            <Pressable onPress={() => setShowRiwayatPanen(false)} style={{ backgroundColor: '#FFECEB', padding: 8, borderRadius: 100, borderWidth: 2, borderColor: '#123924', boxShadow: '2px 2px 0px #123924' }}>
              <MaterialIcons name="close" size={24} color="#123924" />
            </Pressable>
          </View>

          {/* LIST */}
          <ScrollView contentContainerStyle={{ padding: 24 }}>
            {isLoadingRiwayat ? (
              <ActivityIndicator size="large" color="#3FA86B" style={{ marginTop: 40 }} />
            ) : riwayatPanen.length === 0 ? (
              <View style={{ alignItems: 'center', marginTop: 80 }}>
                <MaterialIcons name="eco" size={80} color="#E8E5DA" />
                <Text style={{ fontFamily: 'Nunito_800ExtraBold', fontSize: 20, color: '#5C5A4F', marginTop: 16, textAlign: 'center' }}>Belum ada panen</Text>
                <Text style={{ fontFamily: 'Nunito_500Medium', fontSize: 14, color: '#a09d91', textAlign: 'center', marginTop: 8, paddingHorizontal: 24 }}>Rawat tanamanmu sampai waktunya panen buat nambah piala di sini!</Text>
              </View>
            ) : (
              riwayatPanen.map((item, index) => (
                <View key={item.id || index} style={{ flexDirection: 'row', backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: '#123924', borderRadius: 20, padding: 16, marginBottom: 16, boxShadow: '4px 4px 0px #123924', alignItems: 'center' }}>
                  <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: '#E3F5EC', borderWidth: 2, borderColor: '#3FA86B', alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
                    <Text style={{ fontSize: 32 }}>✨</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: 'Nunito_800ExtraBold', fontSize: 18, color: '#123924' }}>{item.nickname || item.jenisTanaman}</Text>
                    <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: 14, color: '#3FA86B' }}>{item.jenisTanaman}</Text>
                    <Text style={{ fontFamily: 'Nunito_500Medium', fontSize: 12, color: '#5C5A4F', marginTop: 4 }}>Ditanam: {new Date(item.tanggalTanam).toLocaleDateString('id-ID')} • Dipanen: {item.tanggalPanen ? new Date(item.tanggalPanen).toLocaleDateString('id-ID') : 'Hari ini'}</Text>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </Modal>

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

  // State tertekan Neobrutalism
  pressedShadow2: {
    boxShadow: '0px 0px 0px #123924',
    shadowOffset: { width: 0, height: 0 },
    elevation: 0,
    transform: [{ translateX: 2 }, { translateY: 2 }],
  },
  pressedShadow3: {
    boxShadow: '0px 0px 0px #123924',
    shadowOffset: { width: 0, height: 0 },
    elevation: 0,
    transform: [{ translateX: 3 }, { translateY: 3 }],
  },
  menuItemPressed: {
    backgroundColor: '#f1eee6',
  },

  headerBackground: {
    backgroundColor: '#1F5C3D',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 72,
    paddingHorizontal: 20,
    position: 'relative',
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
  avatarInitials: {
    fontSize: 32,
    fontFamily: 'Nunito_700Bold',
    color: '#FFFFFF',
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
    boxShadow: '2px 2px 0px #123924',
    shadowColor: '#123924',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  profileLevel: {
    fontSize: 12,
    fontFamily: 'Nunito_500Medium',
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
  },
  achievementIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#123924',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '2px 2px 0px #123924',
    elevation: 3,
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
    marginTop: 6,
  },
  profileName: {
    fontSize: 20,
    fontFamily: 'Nunito_700Bold',
    color: '#FFFFFF',
  },
  profileUsername: {
    fontSize: 13,
    fontFamily: 'Nunito_700Bold',
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 4,
  },
  profileBio: {
    fontSize: 12,
    fontFamily: 'Nunito_500Medium',
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 4,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  profileBioEmpty: {
    fontSize: 12,
    fontFamily: 'Nunito_500Medium',
    color: 'rgba(255, 255, 255, 0.7)',
    fontStyle: 'italic',
    marginTop: 4,
    opacity: 0.8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: -40,
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
    boxShadow: '3px 3px 0px #123924',
    shadowColor: '#123924',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  statValue: {
    fontSize: 20,
    fontFamily: 'Nunito_700Bold',
    color: '#123924',
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Nunito_500Medium',
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
    fontFamily: 'Nunito_700Bold',
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
    fontFamily: 'Nunito_500Medium',
    color: '#3FA86B',
    textDecorationLine: 'underline',
  },
  horizontalScroll: {
    gap: 16,
    paddingBottom: 8,
  },
  plantCard: {
    width: 90,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#123924',
    borderRadius: 16,
    alignItems: 'center',
    overflow: 'hidden',
    boxShadow: '2px 2px 0px #123924',
    shadowColor: '#123924',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  plantBlock: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
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
    fontFamily: 'Nunito_500Medium',
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
    boxShadow: '2px 2px 0px #123924',
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
    fontFamily: 'Nunito_500Medium',
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
    boxShadow: '3px 3px 0px #123924',
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
    fontFamily: 'Nunito_700Bold',
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
    boxShadow: '3px 3px 0px #123924',
    shadowColor: '#123924',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  logoutText: {
    fontSize: 15,
    fontFamily: 'Nunito_800ExtraBold',
    color: '#FF6B5C',
  }
});
