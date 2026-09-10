import * as SecureStore from "expo-secure-store";
import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";

import { MaterialIcons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import api from '../../services/api';
import { Image } from "expo-image"; // use expo-image for avatars if they have it, or react-native Image

export default function ProfilScreen() {
  const [userData, setUserData] = useState<any>(null);
  const [tanamanList, setTanamanList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      const fetchData = async () => {
        setIsLoading(true);
        try {
          const [userRes, tanamanRes] = await Promise.all([
            api.get("/user/me").catch(() => null),
            api.get("/tanaman").catch(() => null)
          ]);

          if (isActive) {
            if (userRes?.data?.data) {
              setUserData(userRes.data.data);
            }
            if (tanamanRes?.data?.data) {
              setTanamanList(tanamanRes.data.data);
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

  const streak = userData?.streak || 0;
  const tanamanCount = tanamanList.length;
  const siapPanenCount = tanamanList.filter(t => t.sisaHariPanen <= 0).length;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* HEADER */}
        <View style={styles.headerBackground}>
          <Pressable 
            style={({ pressed }) => [
              styles.settingsButton,
              pressed && styles.pressedShadow2,
            ]}
          >
            <MaterialIcons name="settings" size={24} color="#123924" />
          </Pressable>

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
            <Text style={styles.profileName}>{nameFallback}</Text>
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
            onPress={() => Alert.alert("Segera hadir", "Fitur Edit Profil sedang dalam pengembangan.")}
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
          >
            <MaterialIcons name="info-outline" size={24} color="#123924" />
            <Text style={styles.menuText}>Informasi Akun</Text>
            <MaterialIcons name="chevron-right" size={24} color="rgba(18,57,36,0.5)" />
          </Pressable>

          <Pressable 
            style={({ pressed }) => [
              styles.menuItem, 
              { borderBottomWidth: 0 },
              pressed && styles.menuItemPressed,
            ]}
          >
            <MaterialIcons name="privacy-tip" size={24} color="#123924" />
            <Text style={styles.menuText}>Kebijakan Privasi</Text>
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
            router.replace("/(auth)/login");
          }}
        >
          <MaterialIcons name="logout" size={24} color="#FF6B5C" />
          <Text style={styles.logoutText}>Keluar</Text>
        </Pressable>

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
    boxShadow: '2px 2px 0px #123924',
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
  profileName: {
    fontSize: 20,
    fontFamily: 'Nunito_700Bold',
    color: '#FFFFFF',
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
