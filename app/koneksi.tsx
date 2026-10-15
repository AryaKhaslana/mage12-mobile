import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  RefreshControl,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router, useFocusEffect, Stack } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { getUserFollowers, getUserFollowing, PublicUserProfile } from '../services/api';
import { useNotification } from '../components/NotificationContext';

const C = {
  primary: "#3FA86B",
  bg: "#FBF8F0",
  surface: "#FFFFFF",
  container: "#F1EEE6",
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

const connectionCache = new Map<number, { followers: PublicUserProfile[]; following: PublicUserProfile[] }>();

const SkeletonCard = () => {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.85,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View style={[styles.skeletonCard, { opacity }, shadowSubtle]}>
      <View style={styles.skeletonAvatar} />
      <View style={styles.skeletonContent}>
        <View style={styles.skeletonLineShort} />
        <View style={styles.skeletonLineSub} />
      </View>
    </Animated.View>
  );
};

interface UserRowItemProps {
  item: PublicUserProfile;
  onPress: (item: PublicUserProfile) => void;
}

const UserRowItem = React.memo(function UserRowItem({ item, onPress }: UserRowItemProps) {
  const nameFallback = item.nama || "Petani";
  const initial = nameFallback.charAt(0).toUpperCase();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.userCard,
        shadowSubtle,
        pressed && styles.pressedCard,
      ]}
      onPress={() => onPress(item)}
    >
      {item.avatarUrl ? (
        <Image
          source={{ uri: item.avatarUrl }}
          style={styles.avatar}
          contentFit="cover"
          cachePolicy="memory-disk"
          transition={150}
        />
      ) : (
        <View style={[styles.avatar, styles.avatarFallback]}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
      )}
      <View style={styles.userInfo}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>{nameFallback}</Text>
          {item.level ? (
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>Lv.{item.level}</Text>
            </View>
          ) : null}
        </View>
        {item.username ? (
          <Text style={styles.username}>@{item.username.replace(/^@+/, '')}</Text>
        ) : null}
      </View>
      <MaterialIcons name="chevron-right" size={22} color={C.outline} />
    </Pressable>
  );
});

export default function KoneksiScreen() {
  const { userId, initialTab, username } = useLocalSearchParams();
  const { showNotification } = useNotification();

  const numericId = Number(userId);
  const cached = !isNaN(numericId) && numericId > 0 ? connectionCache.get(numericId) : undefined;

  const [activeTab, setActiveTab] = useState<"followers" | "following">(
    (initialTab as "followers" | "following") || "followers"
  );
  const [followers, setFollowers] = useState<PublicUserProfile[]>(cached ? cached.followers : []);
  const [following, setFollowing] = useState<PublicUserProfile[]>(cached ? cached.following : []);
  const [isLoading, setIsLoading] = useState(!cached);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const hasLoadedRef = useRef(false);
  const isFetchingRef = useRef(false);

  const rawUsername = typeof username === "string" ? username : "";
  const normalizedTitle = rawUsername
    ? rawUsername.startsWith("@")
      ? rawUsername
      : `@${rawUsername}`
    : "Koneksi";

  const fetchData = useCallback(
    async (isSilent = false) => {
      if (!numericId || isNaN(numericId)) {
        setIsLoading(false);
        return;
      }
      if (isFetchingRef.current) return;
      isFetchingRef.current = true;

      if (!isSilent && !connectionCache.has(numericId)) {
        setIsLoading(true);
      }

      try {
        const [followersData, followingData] = await Promise.all([
          getUserFollowers(numericId),
          getUserFollowing(numericId),
        ]);
        const safeFollowers = followersData || [];
        const safeFollowing = followingData || [];
        setFollowers(safeFollowers);
        setFollowing(safeFollowing);
        connectionCache.set(numericId, {
          followers: safeFollowers,
          following: safeFollowing,
        });
        hasLoadedRef.current = true;
      } catch (error) {
        console.error("Gagal memuat koneksi:", error);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
        isFetchingRef.current = false;
      }
    },
    [numericId]
  );

  useFocusEffect(
    useCallback(() => {
      if (!numericId || isNaN(numericId)) {
        setIsLoading(false);
        return;
      }
      const isCachedOrLoaded = connectionCache.has(numericId) || hasLoadedRef.current;
      fetchData(isCachedOrLoaded);
    }, [numericId, fetchData])
  );

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchData(true);
  }, [fetchData]);

  const handleTabChange = (tab: "followers" | "following") => {
    if (tab !== activeTab) {
      Haptics.selectionAsync().catch(() => {});
      setActiveTab(tab);
    }
  };

  const handleUserPress = useCallback(
    (item: PublicUserProfile) => {
      const targetParam = item.username || (item.id ? String(item.id) : "");
      if (!targetParam) {
        showNotification("Profil Belum Siap", "Profil pengguna ini belum dapat diakses saat ini.", "info");
        return;
      }
      router.push({
        pathname: "/profil-pengguna",
        params: {
          username: targetParam,
          userId: item.id ? String(item.id) : undefined,
          nama: item.nama || "",
          avatarUrl: item.avatarUrl || "",
        },
      } as any);
    },
    [showNotification]
  );

  const displayData = activeTab === "followers" ? followers : following;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* APP BAR */}
      <View style={styles.appBar}>
        <Pressable
          accessibilityLabel="Kembali"
          onPress={() => (router.canGoBack() ? router.back() : router.replace("/(tabs)/profil"))}
          style={({ pressed }) => [styles.backBtn, pressed && styles.pressedBtn]}
        >
          <MaterialIcons name="arrow-back" size={20} color={C.ink} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerOverline}>JEJARING PETANI</Text>
          <Text style={styles.headerTitle} numberOfLines={1}>{normalizedTitle}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* SEGMENTED PILL TABS */}
      <View style={styles.tabsContainer}>
        <Pressable
          style={[styles.tabBtn, activeTab === "followers" && styles.tabBtnActive]}
          onPress={() => handleTabChange("followers")}
        >
          <Text style={[styles.tabText, activeTab === "followers" && styles.tabTextActive]}>
            {followers.length} Pengikut
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tabBtn, activeTab === "following" && styles.tabBtnActive]}
          onPress={() => handleTabChange("following")}
        >
          <Text style={[styles.tabText, activeTab === "following" && styles.tabTextActive]}>
            {following.length} Mengikuti
          </Text>
        </Pressable>
      </View>

      {/* CONTENT LIST */}
      {isLoading ? (
        <View style={styles.skeletonContainer}>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </View>
      ) : (
        <FlatList
          data={displayData}
          keyExtractor={(item, index) => (item.id ? item.id.toString() : `user-${index}`)}
          renderItem={({ item }) => <UserRowItem item={item} onPress={handleUserPress} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              colors={[C.primary]}
              tintColor={C.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={[styles.emptyIconBox, shadowSubtle]}>
                <MaterialIcons name="group-off" size={32} color={C.primary} />
              </View>
              <Text style={styles.emptyTitle}>
                {activeTab === "followers" ? "Belum Ada Pengikut" : "Belum Mengikuti"}
              </Text>
              <Text style={styles.emptyText}>
                {activeTab === "followers"
                  ? "Pengguna ini belum memiliki pengikut di jejaring tani."
                  : "Pengguna ini belum mengikuti petani lain di komunitas."}
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
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: C.bg,
    borderBottomWidth: 1,
    borderBottomColor: C.outline,
    gap: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.outline,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadowSubtle,
  },
  pressedBtn: {
    transform: [{ scale: 0.95 }],
    opacity: 0.85,
  },
  headerCenter: {
    alignItems: 'center',
    flex: 1,
  },
  headerOverline: {
    fontSize: 10,
    fontFamily: F.bold,
    color: C.muted,
    letterSpacing: 1,
  },
  headerTitle: {
    fontSize: 15,
    fontFamily: F.extra,
    color: C.ink,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: C.container,
    padding: 4,
    borderRadius: 14,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: C.outline,
    gap: 4,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabBtnActive: {
    backgroundColor: C.surface,
    ...shadowSubtle,
  },
  tabText: {
    fontFamily: F.bold,
    fontSize: 13,
    color: C.muted,
  },
  tabTextActive: {
    fontFamily: F.extra,
    color: C.ink,
  },
  listContent: {
    paddingTop: 6,
    paddingBottom: 48,
  },
  skeletonContainer: {
    paddingTop: 6,
  },
  skeletonCard: {
    backgroundColor: C.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.outline,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  skeletonAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: C.outline,
    marginRight: 12,
  },
  skeletonContent: {
    flex: 1,
    gap: 8,
  },
  skeletonLineShort: {
    height: 14,
    width: '55%',
    borderRadius: 7,
    backgroundColor: C.outline,
  },
  skeletonLineSub: {
    height: 12,
    width: '35%',
    borderRadius: 6,
    backgroundColor: C.outline,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 10,
    backgroundColor: C.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.outline,
  },
  pressedCard: {
    transform: [{ scale: 0.99 }],
    opacity: 0.9,
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
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  name: {
    fontFamily: F.bold,
    fontSize: 15,
    color: C.ink,
  },
  levelBadge: {
    backgroundColor: C.primaryLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(63, 168, 107, 0.2)',
    marginLeft: 6,
  },
  levelText: {
    fontFamily: F.bold,
    fontSize: 10,
    color: C.primary,
  },
  username: {
    fontFamily: F.medium,
    fontSize: 13,
    color: C.muted,
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 56,
    paddingHorizontal: 32,
  },
  emptyIconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.outline,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontFamily: F.extra,
    fontSize: 16,
    color: C.ink,
    marginBottom: 6,
  },
  emptyText: {
    fontFamily: F.medium,
    fontSize: 13,
    color: C.muted,
    textAlign: 'center',
    lineHeight: 18,
  },
});
