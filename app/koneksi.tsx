import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router, useFocusEffect, Stack } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { getUserFollowers, getUserFollowing, PublicUserProfile } from '../services/api';

const C = {
  primary: "#3FA86B",
  bg: "#FBF8F0",
  surface: "#FFFFFF",
  ink: "#123924",
  muted: "#5C5A4F",
  outline: "#E5E2DB",
  primaryLight: "#E8F7EE",
};

const F = {
  regular: "Nunito_400Regular",
  medium: "Nunito_500Medium",
  bold: "Nunito_700Bold",
  extra: "Nunito_800ExtraBold",
};

const shadowSubtle = {
  shadowColor: C.ink,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.05,
  shadowRadius: 8,
  elevation: 1,
};

export default function KoneksiScreen() {
  const { userId, initialTab, username } = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState<"followers" | "following">((initialTab as "followers" | "following") || "followers");
  
  const [followers, setFollowers] = useState<PublicUserProfile[]>([]);
  const [following, setFollowing] = useState<PublicUserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const id = parseInt(userId as string);
      const [followersData, followingData] = await Promise.all([
        getUserFollowers(id),
        getUserFollowing(id)
      ]);
      setFollowers(followersData);
      setFollowing(followingData);
    } catch (error) {
      console.error("Gagal memuat koneksi:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (userId) {
        fetchData();
      }
    }, [userId])
  );

  const displayData = activeTab === "followers" ? followers : following;

  const renderItem = ({ item }: { item: PublicUserProfile }) => {
    const nameFallback = item.nama || "Petani";
    const initial = nameFallback.charAt(0).toUpperCase();

    return (
      <Pressable 
        style={({ pressed }) => [styles.userCard, pressed && { opacity: 0.8 }]}
        onPress={() => router.push({ pathname: "/profil-pengguna", params: { username: item.username } } as any)}
      >
        {item.avatarUrl ? (
          <Image source={{ uri: item.avatarUrl }} style={styles.avatar} contentFit="cover" />
        ) : (
          <View style={[styles.avatar, styles.avatarFallback]}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
        )}
        <View style={styles.userInfo}>
          <Text style={styles.name} numberOfLines={1}>{nameFallback}</Text>
          {item.username ? (
            <Text style={styles.username}>@{item.username}</Text>
          ) : null}
        </View>
        <MaterialIcons name="chevron-right" size={24} color={C.outline} />
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <Stack.Screen options={{ headerShown: false }} />
      {/* HEADER */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={10}>
          <MaterialIcons name="arrow-back" size={24} color={C.ink} />
        </Pressable>
        <Text style={styles.headerTitle}>{username || ""}</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* TABS */}
      <View style={styles.tabsContainer}>
        <Pressable 
          style={[styles.tabBtn, activeTab === "followers" && styles.tabBtnActive]} 
          onPress={() => setActiveTab("followers")}
        >
          <Text style={[styles.tabText, activeTab === "followers" && styles.tabTextActive]}>
            {followers.length} Pengikut
          </Text>
        </Pressable>
        <Pressable 
          style={[styles.tabBtn, activeTab === "following" && styles.tabBtnActive]} 
          onPress={() => setActiveTab("following")}
        >
          <Text style={[styles.tabText, activeTab === "following" && styles.tabTextActive]}>
            {following.length} Mengikuti
          </Text>
        </Pressable>
      </View>

      {/* LIST */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={C.primary} />
        </View>
      ) : (
        <FlatList
          data={displayData}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialIcons name="group-off" size={48} color={C.outline} />
              <Text style={styles.emptyText}>
                {activeTab === "followers" ? "Belum ada pengikut." : "Belum mengikuti siapapun."}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: C.surface,
    borderBottomWidth: 1,
    borderBottomColor: C.outline,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontFamily: F.extra, color: C.ink },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: C.surface,
    borderBottomWidth: 1,
    borderBottomColor: C.outline,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabBtnActive: {
    borderBottomColor: C.primary,
  },
  tabText: {
    fontFamily: F.bold,
    fontSize: 14,
    color: C.muted,
  },
  tabTextActive: {
    color: C.primary,
  },
  listContent: {
    paddingTop: 8,
    paddingBottom: 120,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: C.surface,
    borderBottomWidth: 1,
    borderBottomColor: C.outline,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  avatarFallback: {
    backgroundColor: C.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: C.primary,
    fontFamily: F.extra,
    fontSize: 18,
  },
  userInfo: {
    flex: 1,
  },
  name: {
    fontFamily: F.bold,
    fontSize: 15,
    color: C.ink,
  },
  username: {
    fontFamily: F.medium,
    fontSize: 13,
    color: C.muted,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 64,
  },
  emptyText: {
    marginTop: 16,
    fontFamily: F.medium,
    fontSize: 15,
    color: C.muted,
  }
});
