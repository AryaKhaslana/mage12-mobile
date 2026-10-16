import * as SecureStore from "expo-secure-store";
import React, { useCallback, useState, useEffect, useRef } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, RefreshControl, FlatList, StyleSheet, Text, View, Animated } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from "expo-image";
import { router, useFocusEffect } from 'expo-router';
import Svg, { Circle, Defs, LinearGradient, RadialGradient, Rect, Stop } from "react-native-svg";
import api, { Achievement, AchievementResponse, getAchievements, getUserCommunityPosts, CommunityPost, toggleCommunityLike, logoutUser, registerOnLogout } from '../../services/api';
import { getRelativeTime } from "../../utils/format";
import { useNotification } from '../../components/NotificationContext';
import { getPlantImage } from '../../constants/plantImages';

interface ProfileMemoryCache {
  user: any;
  tanaman: any[];
  posts: CommunityPost[];
  achievements: AchievementResponse | null;
  riwayat: any[];
}

let memoryProfileCache: ProfileMemoryCache | null = null;
registerOnLogout(() => {
  memoryProfileCache = null;
});

// ===== Design tokens (sesuai design.md + mockup profil) =====
const C = {
  primary: "#3FA86B",
  primaryDark: "#1F5C3D",
  primaryLight: "#E8F7EE",
  bg: "#FBF8F0",
  surface: "#FFFFFF",
  container: "#F1EEE6",
  ink: "#123924",
  muted: "#5C5A4F",
  outline: "#E5E2DB",
  teal: "#2E9E8C",
  tealLight: "#E6F6F4",
  amber: "#FFB627",
  amberLight: "#FFF8E6",
  amberText: "#8A5A00",
  coral: "#FF6B5C",
  coralLight: "#FFECEB",
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
const shadowCard = {
  shadowColor: C.ink,
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.08,
  shadowRadius: 24,
  elevation: 4,
};

// ===== Helpers =====
const getRankTitle = (level: number) => {
  if (level >= 10) return "Dewa Tani";
  if (level >= 8) return "Sultan Hidroponik";
  if (level >= 4) return "Juragan Panen";
  if (level >= 2) return "Tangan Dingin";
  return "Petani Balkon";
};

const getAchievementIcon = (kode: string) => {
  if (kode === "panen_pertama" || kode === "panen_lima") return "agriculture";
  if (kode === "panen_sepuluh") return "emoji-events";
  if (kode === "kolektor") return "eco";
  if (kode === "streak_tujuh") return "local-fire-department";
  if (kode === "streak_tigapuluh") return "whatshot";
  return "military-tech";
};

const BotanicBanner = () => (
  <View style={[styles.banner, shadowCard]}>
    <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
      <Defs>
        <LinearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={C.primaryDark} />
          <Stop offset="1" stopColor={C.primary} />
        </LinearGradient>
        <RadialGradient id="glow" cx="100%" cy="0%" r="75%">
          <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.28" />
          <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="blob" cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.16" />
          <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Rect width="100%" height="100%" fill="url(#bg)" />
      <Rect width="100%" height="100%" fill="url(#glow)" />
      <Circle cx="20" cy="120" r="70" fill="url(#blob)" />
    </Svg>
  </View>
);

const SkeletonBlock = ({ style }: { style: any }) => {
  const [fade] = useState(() => new Animated.Value(0.4));
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(fade, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(fade, { toValue: 0.4, duration: 800, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [fade]);
  return <Animated.View style={[{ backgroundColor: "#E8E5DA", opacity: fade }, style]} />;
};

const POST_BADGE: Record<string, { label: string; bg: string; fg: string; border: string }> = {
  pertanyaan: { label: "Diskusi", bg: C.primaryLight, fg: C.primaryDark, border: C.primary },
  progress_update: { label: "Tips & Trik", bg: C.amberLight, fg: C.amberText, border: "rgba(255,182,39,0.5)" },
  panen_surplus: { label: "Pamer Kebun", bg: C.tealLight, fg: C.teal, border: "rgba(46,158,140,0.3)" },
};

const EmptyState = ({ icon, title, subtitle }: { icon: any; title: string; subtitle: string }) => (
  <View style={styles.emptyCard}>
    <View style={styles.emptyIcon}>
      <MaterialIcons name={icon} size={32} color={C.primaryDark} />
    </View>
    <Text style={styles.emptyTitle}>{title}</Text>
    <Text style={styles.emptySub}>{subtitle}</Text>
  </View>
);

export default function ProfilScreen() {
  const insets = useSafeAreaInsets();
  const { showNotification } = useNotification();

  const [userData, setUserData] = useState<any>(() => memoryProfileCache ? memoryProfileCache.user : null);
  const [tanamanList, setTanamanList] = useState<any[]>(() => memoryProfileCache ? memoryProfileCache.tanaman : []);
  const [achievementsData, setAchievementsData] = useState<AchievementResponse | null>(() => memoryProfileCache ? memoryProfileCache.achievements : null);
  const [isLoading, setIsLoading] = useState(() => !memoryProfileCache?.user);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [showRiwayatPanen, setShowRiwayatPanen] = useState(false);
  const [isLoadingRiwayat, setIsLoadingRiwayat] = useState(false);
  const [riwayatPanen, setRiwayatPanen] = useState<any[]>(() => memoryProfileCache ? memoryProfileCache.riwayat : []);

  const [showBurgerMenu, setShowBurgerMenu] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState<"postingan" | "koleksi">("postingan");
  const [posts, setPosts] = useState<CommunityPost[]>(() => memoryProfileCache ? memoryProfileCache.posts : []);
  const [isLoadingPosts, setIsLoadingPosts] = useState(() => !memoryProfileCache?.posts?.length);
  const [likes, setLikes] = useState<Record<number, { liked: boolean; count: number }>>({});

  // Modal Pencapaian Neoclay
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);

  // Stale Closure Prevention & Anti-Spam Refs
  const userDataRef = useRef<any>(null);
  const hasPostsRef = useRef<boolean>(false);
  const isFetchingRef = useRef<boolean>(false);
  const likeLockRef = useRef<Record<number, boolean>>({});

  useEffect(() => {
    userDataRef.current = userData;
  }, [userData]);

  useEffect(() => {
    hasPostsRef.current = posts.length > 0;
  }, [posts.length]);

  // Fast Cache-First Loader: 0ms render dari local storage
  useEffect(() => {
    const loadCache = async () => {
      try {
        const [cachedUser, cachedTanaman, cachedPosts, cachedAch, cachedRiwayat] = await Promise.all([
          SecureStore.getItemAsync("userData"),
          AsyncStorage.getItem("dashboard_tanaman"),
          AsyncStorage.getItem("profile_posts_cache"),
          AsyncStorage.getItem("profile_achievements_cache"),
          AsyncStorage.getItem("profile_riwayat_cache"),
        ]);

        const parsedUser = cachedUser ? JSON.parse(cachedUser) : null;
        const parsedTanaman = cachedTanaman ? JSON.parse(cachedTanaman) : [];
        const parsedPosts: CommunityPost[] = cachedPosts ? JSON.parse(cachedPosts) : [];
        const parsedAch = cachedAch ? JSON.parse(cachedAch) : null;
        const parsedRiwayat = cachedRiwayat ? JSON.parse(cachedRiwayat) : [];

        if (parsedUser) {
          setUserData(parsedUser);
          userDataRef.current = parsedUser;
          setIsLoading(false);
        }
        if (parsedTanaman.length > 0) {
          setTanamanList(parsedTanaman);
        }
        if (parsedPosts.length > 0) {
          setPosts(parsedPosts);
          hasPostsRef.current = true;
          const initialLikes: Record<number, { liked: boolean; count: number }> = {};
          parsedPosts.forEach((p) => {
            initialLikes[p.id] = { liked: !!p.isLiked, count: p.jumlahLike ?? 0 };
          });
          setLikes(initialLikes);
          setIsLoadingPosts(false);
        }
        if (parsedAch) {
          setAchievementsData(parsedAch);
        }
        if (parsedRiwayat.length > 0) {
          setRiwayatPanen(parsedRiwayat);
        }

        memoryProfileCache = {
          user: parsedUser || memoryProfileCache?.user,
          tanaman: parsedTanaman.length > 0 ? parsedTanaman : (memoryProfileCache?.tanaman || []),
          posts: parsedPosts.length > 0 ? parsedPosts : (memoryProfileCache?.posts || []),
          achievements: parsedAch || memoryProfileCache?.achievements,
          riwayat: parsedRiwayat.length > 0 ? parsedRiwayat : (memoryProfileCache?.riwayat || []),
        };
      } catch (e) {
        console.warn("Failed reading profile cache:", e);
      }
    };
    loadCache();
  }, []);

  const fetchAllData = useCallback(async (isRefresh = false) => {
    if (isFetchingRef.current && !isRefresh) return;
    isFetchingRef.current = true;

    if (isRefresh) {
      setIsRefreshing(true);
    } else if (!userDataRef.current) {
      setIsLoading(true);
    }
    if (!hasPostsRef.current) {
      setIsLoadingPosts(true);
    }

    try {
      // 1. Tentukan target username seawal mungkin dari ref atau SecureStore
      let targetUsername = userDataRef.current?.username;
      if (!targetUsername) {
        try {
          const cached = await SecureStore.getItemAsync("userData");
          if (cached) {
            targetUsername = JSON.parse(cached).username;
          }
        } catch {}
      }

      // 2. Fetch postingan user secara PARALEL
      const fetchPostsAsync = async (uName: string) => {
        try {
          const postsRes = await getUserCommunityPosts(uName, 1, 20);
          if (postsRes?.data) {
            setPosts(postsRes.data);
            hasPostsRef.current = postsRes.data.length > 0;
            if (memoryProfileCache) memoryProfileCache.posts = postsRes.data;
            AsyncStorage.setItem("profile_posts_cache", JSON.stringify(postsRes.data)).catch(() => {});
            const initialLikes: Record<number, { liked: boolean; count: number }> = {};
            postsRes.data.forEach((p: CommunityPost) => {
              initialLikes[p.id] = { liked: !!p.isLiked, count: p.jumlahLike ?? 0 };
            });
            setLikes(initialLikes);
          }
        } catch (err) {
          console.warn("Error fetching user posts:", err);
        } finally {
          setIsLoadingPosts(false);
        }
      };

      let postsPromise = targetUsername ? fetchPostsAsync(targetUsername) : null;

      // 3. Panggil API User, Tanaman, dan Achievements secara paralel
      const [userRes, tanamanRes, achRes] = await Promise.all([
        api.get("/user/me").catch((err) => { console.error("Error fetch user:", err); return null; }),
        api.get("/tanaman").catch((err) => { console.error("Error fetch tanaman:", err); return null; }),
        getAchievements().catch((err) => { console.error("Error fetch achievements:", err); return null; })
      ]);

      if (userRes?.data?.data) {
        const freshUser = userRes.data.data;
        setUserData(freshUser);
        userDataRef.current = freshUser;
        if (memoryProfileCache) memoryProfileCache.user = freshUser;
        SecureStore.setItemAsync("userData", JSON.stringify(freshUser)).catch(console.error);
        setIsLoading(false);

        // Jika tadi belum punya target username atau username berubah, fetch sekarang
        if (!postsPromise || freshUser.username !== targetUsername) {
          postsPromise = fetchPostsAsync(freshUser.username);
        }
      } else {
        if (!isRefresh && !userDataRef.current) {
          showNotification("Gagal Memuat Profil", "Gagal memuat data profil kamu.", "error");
        }
      }

      if (tanamanRes?.data?.data) {
        setTanamanList(tanamanRes.data.data);
        if (memoryProfileCache) memoryProfileCache.tanaman = tanamanRes.data.data;
        AsyncStorage.setItem("dashboard_tanaman", JSON.stringify(tanamanRes.data.data)).catch(() => {});
      }
      if (achRes) {
        setAchievementsData(achRes);
        if (memoryProfileCache) memoryProfileCache.achievements = achRes;
        AsyncStorage.setItem("profile_achievements_cache", JSON.stringify(achRes)).catch(() => {});
      }

      // Tunggu posts selesai jika masih diproses
      if (postsPromise) await postsPromise;
    } catch (error) {
      console.error("Gagal mengambil data profil:", error);
      showNotification("Error", "Terjadi kesalahan saat memuat profil.", "error");
    } finally {
      setIsLoading(false);
      setIsLoadingPosts(false);
      setIsRefreshing(false);
      isFetchingRef.current = false;
    }
  }, [showNotification]);

  useFocusEffect(
    useCallback(() => {
      // 0ms instant sync dari local cache saat kembali dari edit profil / screen lain
      const syncFocusCache = async () => {
        try {
          const [cachedUser, cachedTanaman] = await Promise.all([
            SecureStore.getItemAsync("userData"),
            AsyncStorage.getItem("dashboard_tanaman"),
          ]);
          if (cachedUser) {
            const parsed = JSON.parse(cachedUser);
            setUserData(parsed);
            userDataRef.current = parsed;
            setIsLoading(false);
          }
          if (cachedTanaman) {
            setTanamanList(JSON.parse(cachedTanaman));
          }
        } catch (e) {
          console.warn("Failed syncing focus cache in profile:", e);
        }
      };

      syncFocusCache();
      fetchAllData();
      return () => {};
    }, [fetchAllData])
  );

  const onRefresh = () => {
    fetchAllData(true);
  };

  const handleLike = async (postId: number) => {
    if (likeLockRef.current[postId]) return;
    likeLockRef.current[postId] = true;

    const currentLike = likes[postId] || { liked: false, count: 0 };
    const nextLiked = !currentLike.liked;
    const nextCount = currentLike.liked ? Math.max(0, currentLike.count - 1) : currentLike.count + 1;

    setLikes((prev) => ({
      ...prev,
      [postId]: {
        liked: nextLiked,
        count: nextCount,
      },
    }));

    try {
      const result = await toggleCommunityLike(postId);
      setLikes((prev) => ({
        ...prev,
        [postId]: { liked: result.liked, count: result.jumlahLike },
      }));
    } catch (e) {
      console.error("Error toggle like:", e);
      setLikes((prev) => ({
        ...prev,
        [postId]: currentLike,
      }));
      showNotification("Gagal", "Gagal menyukai postingan.", "error");
    } finally {
      setTimeout(() => {
        likeLockRef.current[postId] = false;
      }, 300);
    }
  };

  const fetchRiwayatPanen = async () => {
    if (riwayatPanen.length === 0) {
      setIsLoadingRiwayat(true);
    }
    try {
      const res = await api.get("/tanaman/riwayat");
      const data = res.data?.data || res.data || [];
      setRiwayatPanen(data);
      AsyncStorage.setItem("profile_riwayat_cache", JSON.stringify(data)).catch(() => {});
    } catch (err) {
      console.error("Gagal ambil riwayat panen", err);
    } finally {
      setIsLoadingRiwayat(false);
    }
  };

  const nameFallback = userData?.nama || "Petani";
  const avatarUrl = userData?.avatarUrl;
  const username = userData?.username;
  const initial = nameFallback.charAt(0).toUpperCase();
  const level = userData?.level || 1;
  const streak = userData?.streak || 0;
  const tanamanCount = tanamanList.length;
  const followerCount = userData?.jumlahPengikut ?? 0;
  const mengikutiCount = userData?.jumlahMengikuti ?? 0;
  const memberSince = userData?.createdAt ? new Date(userData.createdAt).getFullYear() : null;

  const navigateToDetail = (post: CommunityPost) => {
    const enrichedPost = {
      ...post,
      user_nama: post.user_nama || post.author?.nama || nameFallback,
      userAvatar: post.userAvatar || post.author?.avatarUrl || avatarUrl,
      username: post.username || post.author?.username || username,
      isOwner: true,
      isLiked: likes[post.id]?.liked ?? !!post.isLiked,
      jumlahLike: likes[post.id]?.count ?? post.jumlahLike ?? 0,
    };

    router.push({
      pathname: "/detail-komunitas",
      params: {
        id: post.id,
        initialData: JSON.stringify(enrichedPost),
        initialPost: JSON.stringify(enrichedPost),
      },
    } as any);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      {/* APP BAR */}
      <View style={styles.appBar}>
        <Pressable
          accessibilityLabel="Edit Profil"
          onPress={() => router.push("/edit-profil")}
          style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
        >
          <MaterialIcons name="edit" size={20} color={C.ink} />
        </Pressable>
        <View style={{ alignItems: "center", flex: 1 }}>
          <Text style={styles.appBarOverline}>PROFIL SAYA</Text>
          <Text style={styles.appBarTitle} numberOfLines={1}>{username ? `@${username}` : nameFallback}</Text>
        </View>
        <Pressable
          accessibilityLabel="Menu"
          onPress={() => setShowBurgerMenu(true)}
          style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
        >
          <MaterialIcons name="menu" size={20} color={C.ink} />
        </Pressable>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={[C.primary]} tintColor={C.primary} />}
      >
        {/* BANNER */}
        {userData?.bannerUrl ? (
          <Image source={{ uri: userData.bannerUrl }} style={[styles.banner, shadowCard]} contentFit="cover" cachePolicy="memory-disk" />
        ) : (
          <BotanicBanner />
        )}

        {/* AVATAR + RANK BADGE */}
        <View style={styles.avatarRow}>
          <View>
            <View style={[styles.avatarFrame, shadowCard]}>
              {avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={styles.avatarImage} contentFit="cover" cachePolicy="memory-disk" />
              ) : (
                <View style={[styles.avatarImage, { backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' }]}>
                  <Text style={{ color: "#FFFFFF", fontFamily: F.extra, fontSize: 34 }}>{initial}</Text>
                </View>
              )}
            </View>
            <View style={styles.onlineDot} />
          </View>
          <View style={[styles.rankBadge, shadowSubtle]}>
            <MaterialIcons name="verified" size={16} color={C.amber} />
            <Text style={styles.rankText}>{getRankTitle(level)} • Lv.{level}</Text>
          </View>
        </View>

        {/* USER INFO */}
        <View style={{ marginTop: 14, paddingHorizontal: 4 }}>
          <View style={{ flexDirection: "row", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
            <Text style={styles.name}>{nameFallback}</Text>
            {username ? <Text style={styles.username}>@{username}</Text> : null}
          </View>
          {isLoading && !userData ? (
            <View style={{ gap: 6, marginTop: 10 }}>
              <SkeletonBlock style={{ height: 12, borderRadius: 6, width: "100%" }} />
              <SkeletonBlock style={{ height: 12, borderRadius: 6, width: "70%" }} />
            </View>
          ) : (
            <Text style={[styles.bio, !userData?.bio && { fontStyle: "italic" }]}>
              {userData?.bio || "Belum ada bio"}
              {memberSince ? ` | Anggota sejak ${memberSince}.` : ""}
            </Text>
          )}
        </View>

        {/* STATS */}
        <View style={[styles.statsCard, shadowSubtle]}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{tanamanCount}</Text>
            <Text style={styles.statLabel}>Tanaman</Text>
          </View>
          <View style={styles.statDivider} />
          <Pressable 
            style={styles.statItem} 
            onPress={() => router.push({ pathname: "/koneksi", params: { userId: userData?.id, username: username || nameFallback, initialTab: "followers" } } as any)}
          >
            <Text style={[styles.statValue, { color: C.primary }]}>{followerCount}</Text>
            <Text style={styles.statLabel}>Pengikut</Text>
          </Pressable>
          <View style={styles.statDivider} />
          <Pressable 
            style={styles.statItem}
            onPress={() => router.push({ pathname: "/koneksi", params: { userId: userData?.id, username: username || nameFallback, initialTab: "following" } } as any)}
          >
            <Text style={styles.statValue}>{mengikutiCount}</Text>
            <Text style={styles.statLabel}>Mengikuti</Text>
          </Pressable>
        </View>

        {/* STREAK CARD */}
        <View style={[styles.streakCard, shadowCard, { backgroundColor: streak > 0 ? C.coral : "#9CA3AF" }]}>
          <View style={styles.streakBlob} />
          <View style={{ flexDirection: "row", alignItems: "center", gap: 14, flex: 1 }}>
            <View style={styles.streakIcon}>
              <MaterialIcons name="local-fire-department" size={24} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.streakOverline}>RAWAT KONSISTEN</Text>
              <Text style={styles.streakTitle} numberOfLines={1}>
                {streak > 0 ? `Streak ${streak} Hari Tanpa Henti` : "Belum ada streak aktif"}
              </Text>
            </View>
          </View>
          <View style={styles.streakPill}>
            <Text style={styles.streakPillText}>{streak > 0 ? "Aktif" : "Istirahat"}</Text>
          </View>
        </View>

        {/* TABS */}
        <View style={styles.tabs}>
          <Pressable onPress={() => setActiveTab("postingan")} style={[styles.tabBtn, activeTab === "postingan" && [styles.tabBtnActive, shadowSubtle]]}>
            <Text style={[styles.tabText, activeTab === "postingan" && styles.tabTextActive]}>Postingan</Text>
          </Pressable>
          <Pressable onPress={() => setActiveTab("koleksi")} style={[styles.tabBtn, activeTab === "koleksi" && [styles.tabBtnActive, shadowSubtle]]}>
            <Text style={[styles.tabText, activeTab === "koleksi" && styles.tabTextActive]}>Koleksi & Prestasi</Text>
          </Pressable>
        </View>

        {/* CONTENT */}
        {activeTab === "postingan" ? (
          <View style={{ marginTop: 16, gap: 14 }}>
            {isLoadingPosts && posts.length === 0 ? (
              [1, 2].map((i) => <SkeletonBlock key={i} style={{ height: 150, borderRadius: 20 }} />)
            ) : posts.length === 0 ? (
              <View style={{ marginTop: 24 }}>
                <EmptyState icon="forum" title="Belum ada postingan" subtitle="Kamu belum pernah berbagi cerita di komunitas." />
              </View>
            ) : (
              posts.map((post) => {
                const badge = POST_BADGE[post.tipePost];
                const like = likes[post.id] ?? { liked: false, count: 0 };
                return (
                  <View key={post.id} style={[styles.postCard, shadowSubtle]}>
                    <View style={styles.postHeader}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flex: 1 }}>
                        <View style={styles.postAvatarRing}>
                          {avatarUrl ? (
                            <Image source={{ uri: avatarUrl }} style={{ width: 34, height: 34, borderRadius: 17 }} contentFit="cover" cachePolicy="memory-disk" />
                          ) : (
                            <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' }}>
                              <Text style={{ color: "#FFFFFF", fontFamily: F.extra, fontSize: 14 }}>{initial}</Text>
                            </View>
                          )}
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.postAuthor} numberOfLines={1}>{nameFallback}</Text>
                          <Text style={styles.postTime}>{getRelativeTime(post.createdAt)}</Text>
                        </View>
                      </View>
                      {badge ? (
                        <View style={[styles.postBadge, { backgroundColor: badge.bg, borderColor: badge.border }]}>
                          <Text style={[styles.postBadgeText, { color: badge.fg }]}>{badge.label}</Text>
                        </View>
                      ) : null}
                    </View>

                    <Pressable
                      onPress={() => navigateToDetail(post)}
                      style={({ pressed }) => pressed && { opacity: 0.85 }}
                    >
                      {post.judul ? <Text style={styles.postTitle}>{post.judul}</Text> : null}
                      <Text style={styles.postBody}>{post.deskripsi}</Text>
                      {post.fotoUrl ? (
                        <Image source={{ uri: post.fotoUrl }} style={styles.postImage} contentFit="cover" cachePolicy="memory-disk" transition={200} />
                      ) : null}
                    </Pressable>

                    <View style={styles.postActions}>
                      <Pressable onPress={() => handleLike(post.id)} style={styles.postAction} hitSlop={8}>
                        <MaterialIcons name={like.liked ? "favorite" : "favorite-border"} size={18} color={like.liked ? C.coral : C.muted} />
                        <Text style={[styles.postActionText, like.liked && { color: C.coral }]}>{like.count} suka</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => navigateToDetail(post)}
                        style={styles.postAction}
                        hitSlop={8}
                      >
                        <MaterialIcons name="chat-bubble-outline" size={18} color={C.muted} />
                        <Text style={styles.postActionText}>{post.jumlahKomentar ?? 0} tanggapan</Text>
                      </Pressable>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        ) : (
          <View style={{ marginTop: 20 }}>
            {/* RIWAYAT PANEN BUTTON */}
            <Pressable 
              style={({pressed}) => [styles.riwayatBtn, shadowSubtle, pressed && { transform: [{scale: 0.98}]}]}
              onPress={() => {
                setShowRiwayatPanen(true);
                fetchRiwayatPanen();
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={styles.riwayatIconBg}>
                  <MaterialIcons name="emoji-events" size={24} color={C.primary} />
                </View>
                <View>
                  <Text style={styles.riwayatTitle}>Riwayat Panen</Text>
                  <Text style={styles.riwayatSub}>Lihat pencapaian kebunmu</Text>
                </View>
              </View>
              <MaterialIcons name="chevron-right" size={28} color="#FFFFFF" />
            </Pressable>

            {/* TANAMAN KAMU */}
            <View style={[styles.sectionHeaderRow, { marginTop: 24 }]}>
              <Text style={styles.sectionTitle}>Tanaman Kamu</Text>
              <Pressable onPress={() => router.push("/(tabs)/tanaman")}>
                <Text style={styles.seeAllText}>Lihat semua</Text>
              </Pressable>
            </View>
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
              {tanamanList.slice(0, 5).map((t) => (
                <Pressable 
                  key={t.id}
                  style={({ pressed }) => [styles.plantCard, shadowSubtle, pressed && { transform: [{ scale: 0.96 }] }]}
                  onPress={() => router.push({ pathname: "/detail-tanaman", params: { id: t.id } } as any)}
                >
                  <View style={[styles.plantBlock, { overflow: 'hidden' }]}>
                    {t.logTerakhir?.fotoUrl ? (
                      <Image 
                        source={{ uri: t.logTerakhir.fotoUrl }} 
                        placeholder={getPlantImage(t.jenisTanaman)}
                        style={{ width: '100%', height: '100%' }} 
                        contentFit="cover"
                        cachePolicy="memory-disk"
                        transition={200}
                      />
                    ) : (
                      <Image 
                        source={getPlantImage(t.jenisTanaman)} 
                        style={{ width: '100%', height: '100%' }} 
                        contentFit="cover"
                        transition={200}
                      />
                    )}
                  </View>
                  <View style={styles.plantNameContainer}>
                    <Text style={styles.plantName} numberOfLines={1}>
                      {t.nickname || t.jenisTanaman}
                    </Text>
                  </View>
                </Pressable>
              ))}

              <Pressable 
                style={({ pressed }) => [styles.plantAddCard, shadowSubtle, pressed && { transform: [{ scale: 0.96 }] }]}
                onPress={() => router.push({ pathname: "/(tabs)/tanaman", params: { openModal: "true" } } as any)}
              >
                <View style={styles.plantAddIcon}>
                  <MaterialIcons name="add" size={24} color={C.ink} />
                </View>
                <Text style={styles.plantAddText}>Tambah</Text>
              </Pressable>
            </ScrollView>

            {/* PENCAPAIAN */}
            <Text style={[styles.sectionTitle, { marginTop: 24, marginBottom: 12 }]}>Pencapaian</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
              {achievementsData?.achievements ? achievementsData.achievements.map((ach: Achievement, index: number) => {
                const bgColors = [C.amber, C.primary, C.coral];
                const bgColor = bgColors[index % bgColors.length];
                const iconName = getAchievementIcon(ach.kode);

                return (
                  <Pressable 
                    key={ach.kode}
                    onPress={() => {
                      setSelectedAchievement(ach);
                    }}
                    style={({ pressed }) => [
                      ach.tercapai ? [styles.achievementIcon, { backgroundColor: bgColor }, shadowSubtle] : styles.achievementIconLocked,
                      pressed && ach.tercapai && { transform: [{ scale: 0.95 }] }
                    ]}
                  >
                    <MaterialIcons 
                      name={iconName as any} 
                      size={ach.tercapai ? 28 : 24} 
                      color={ach.tercapai ? "#FFFFFF" : C.muted} 
                    />
                  </Pressable>
                );
              }) : (
                [1, 2, 3, 4].map(i => (
                  <View key={i} style={[styles.achievementIconLocked, { backgroundColor: '#E8E5DA', opacity: 0.5 }]} />
                ))
              )}
            </ScrollView>
          </View>
        )}
      </ScrollView>

      {/* BURGER MENU MODAL */}
      <Modal visible={showBurgerMenu} transparent animationType="slide" onRequestClose={() => setShowBurgerMenu(false)}>
        <View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setShowBurgerMenu(false)} />
          <View style={styles.bottomSheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Menu Pengaturan</Text>
            
            <View style={styles.menuContainer}>
              <Pressable style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]} onPress={() => { setShowBurgerMenu(false); router.push("/edit-profil" as any); }}>
                <MaterialIcons name="person-outline" size={24} color={C.ink} />
                <Text style={styles.menuText}>Edit Profil</Text>
                <MaterialIcons name="chevron-right" size={24} color={C.outline} />
              </Pressable>
              
              <Pressable style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]} onPress={() => { setShowBurgerMenu(false); router.push("/pengaturan-notifikasi" as any); }}>
                <MaterialIcons name="notifications-none" size={24} color={C.ink} />
                <Text style={styles.menuText}>Pengaturan Notifikasi</Text>
                <MaterialIcons name="chevron-right" size={24} color={C.outline} />
              </Pressable>

              <Pressable style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]} onPress={() => { setShowBurgerMenu(false); setTimeout(() => setShowAbout(true), 300); }}>
                <MaterialIcons name="info-outline" size={24} color={C.ink} />
                <Text style={styles.menuText}>Tentang Aplikasi</Text>
                <MaterialIcons name="chevron-right" size={24} color={C.outline} />
              </Pressable>

              <Pressable style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]} onPress={() => { setShowBurgerMenu(false); router.push("/kebijakan-privasi" as any); }}>
                <MaterialIcons name="privacy-tip" size={24} color={C.ink} />
                <Text style={styles.menuText}>Kebijakan Privasi</Text>
                <MaterialIcons name="chevron-right" size={24} color={C.outline} />
              </Pressable>

              <Pressable style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]} onPress={() => { setShowBurgerMenu(false); router.push("/ketentuan-layanan" as any); }}>
                <MaterialIcons name="gavel" size={24} color={C.ink} />
                <Text style={styles.menuText}>Ketentuan Layanan</Text>
                <MaterialIcons name="chevron-right" size={24} color={C.outline} />
              </Pressable>

              <Pressable style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed, { borderBottomWidth: 0 }]} onPress={() => { setShowBurgerMenu(false); router.push("/pusat-bantuan"); }}>
                <MaterialIcons name="help-outline" size={24} color={C.ink} />
                <Text style={styles.menuText}>Pusat Bantuan</Text>
                <MaterialIcons name="chevron-right" size={24} color={C.outline} />
              </Pressable>
            </View>

            <Pressable 
              style={({ pressed }) => [styles.logoutButton, shadowSubtle, pressed && { transform: [{ scale: 0.98 }] }]}
              onPress={() => { setShowBurgerMenu(false); setTimeout(() => setShowLogoutConfirm(true), 300); }}
            >
              <MaterialIcons name="logout" size={20} color={C.coral} />
              <Text style={styles.logoutText}>Keluar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* LOGOUT CONFIRM MODAL */}
      <Modal visible={showLogoutConfirm} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <View style={{ backgroundColor: C.surface, padding: 24, borderRadius: 24, ...shadowCard, width: '100%', alignItems: 'center' }}>
            <MaterialIcons name="logout" size={48} color={C.coral} style={{ marginBottom: 12 }} />
            <Text style={{ fontFamily: F.extra, fontSize: 24, color: C.ink, marginBottom: 8, textAlign: 'center' }}>Konfirmasi Keluar</Text>
            <Text style={{ fontFamily: F.medium, fontSize: 16, color: C.muted, textAlign: 'center', marginBottom: 24, lineHeight: 24 }}>
              Apakah kamu yakin ingin keluar? Kamu perlu masuk kembali untuk mengakses akunmu.
            </Text>
            
            <View style={{ flexDirection: 'row', width: '100%', gap: 12 }}>
              <Pressable 
                onPress={() => setShowLogoutConfirm(false)}
                style={({ pressed }) => [{ flex: 1, backgroundColor: C.bg, paddingVertical: 14, borderRadius: 100, alignItems: 'center', ...shadowSubtle }, pressed && { transform: [{ scale: 0.98 }] }]}
              >
                <Text style={{ fontFamily: F.extra, fontSize: 16, color: C.ink }}>Batal</Text>
              </Pressable>
              
              <Pressable 
                onPress={async () => {
                  setShowLogoutConfirm(false);
                  try {
                    await AsyncStorage.multiRemove([
                      "dashboard_weather",
                      "dashboard_tanaman",
                      "profile_posts_cache",
                      "profile_achievements_cache",
                      "profile_riwayat_cache",
                      "tanibot_history",
                    ]);
                  } catch (e) {
                    console.warn("Failed clearing cache on logout:", e);
                  }
                  await logoutUser();
                }}
                style={({ pressed }) => [{ flex: 1, backgroundColor: C.coral, paddingVertical: 14, borderRadius: 100, alignItems: 'center', ...shadowSubtle }, pressed && { transform: [{ scale: 0.98 }] }]}
              >
                <Text style={{ fontFamily: F.extra, fontSize: 16, color: "#FFFFFF" }}>Keluar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* ABOUT MODAL */}
      <Modal visible={showAbout} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <View style={{ backgroundColor: C.bg, padding: 24, borderRadius: 24, ...shadowCard, width: '100%', alignItems: 'center' }}>
            <MaterialIcons name="eco" size={48} color={C.primary} style={{ marginBottom: 12 }} />
            <Text style={{ fontFamily: F.extra, fontSize: 24, color: C.ink, marginBottom: 4 }}>TaniSync</Text>
            <Text style={{ fontFamily: F.medium, fontSize: 14, color: C.muted, marginBottom: 16 }}>Versi 1.0.0</Text>
            
            <Text style={{ fontFamily: F.medium, fontSize: 14, color: C.ink, textAlign: 'center', marginBottom: 24, lineHeight: 22 }}>
              Aplikasi pendamping bertani kaum urban. TaniSync membantu kamu merawat tanaman dengan mudah dan menyenangkan. Dibuat untuk Project MAGE.
            </Text>
            
            <Pressable 
              onPress={() => setShowAbout(false)}
              style={({ pressed }) => [{ backgroundColor: C.primary, paddingVertical: 12, paddingHorizontal: 32, borderRadius: 100, ...shadowSubtle }, pressed && { transform: [{ scale: 0.98 }] }]}
            >
              <Text style={{ fontFamily: F.extra, fontSize: 16, color: "#FFFFFF" }}>Tutup</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* MODAL RIWAYAT PANEN */}
      <Modal visible={showRiwayatPanen} animationType="slide" transparent={false}>
        <View style={{ flex: 1, backgroundColor: C.bg }}>
          {/* HEADER */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingBottom: 16, paddingTop: 16 + insets.top, backgroundColor: C.coral }}>
            <View>
              <Text style={{ fontFamily: F.extra, fontSize: 24, color: "#FFFFFF" }}>Piala Panen</Text>
              <Text style={{ fontFamily: F.bold, fontSize: 14, color: C.coralLight }}>Tanaman yang sukses kamu rawat!</Text>
            </View>
            <Pressable onPress={() => setShowRiwayatPanen(false)} style={{ backgroundColor: C.coralLight, padding: 8, borderRadius: 100, ...shadowSubtle }}>
              <MaterialIcons name="close" size={24} color={C.coral} />
            </Pressable>
          </View>

          {/* LIST */}
          {isLoadingRiwayat ? (
            <ActivityIndicator size="large" color={C.primary} style={{ marginTop: 40 }} />
          ) : (
            <FlatList
              data={riwayatPanen}
              keyExtractor={(item, index) => (item.id || index).toString()}
              contentContainerStyle={{ padding: 24, paddingBottom: 120 }}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={{ alignItems: 'center', marginTop: 80 }}>
                  <MaterialIcons name="eco" size={80} color={C.outline} />
                  <Text style={{ fontFamily: F.extra, fontSize: 20, color: C.muted, marginTop: 16, textAlign: 'center' }}>Belum ada panen</Text>
                  <Text style={{ fontFamily: F.medium, fontSize: 14, color: "#a09d91", textAlign: 'center', marginTop: 8, paddingHorizontal: 24 }}>Rawat tanamanmu sampai waktunya panen buat nambah piala di sini!</Text>
                </View>
              }
              renderItem={({ item }) => (
                <View style={{ flexDirection: 'row', backgroundColor: C.surface, borderRadius: 20, padding: 16, marginBottom: 16, ...shadowSubtle, alignItems: 'center' }}>
                  <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: C.primaryLight, alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
                    <MaterialIcons name="workspace-premium" size={32} color={C.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: F.extra, fontSize: 18, color: C.ink }}>{item.nickname || item.jenisTanaman}</Text>
                    <Text style={{ fontFamily: F.bold, fontSize: 14, color: C.primary }}>{item.jenisTanaman}</Text>
                    <Text style={{ fontFamily: F.medium, fontSize: 12, color: C.muted, marginTop: 4 }}>Ditanam: {new Date(item.tanggalTanam).toLocaleDateString('id-ID')} • Dipanen: {item.tanggalPanen ? new Date(item.tanggalPanen).toLocaleDateString('id-ID') : 'Hari ini'}</Text>
                  </View>
                </View>
              )}
            />
          )}
        </View>
      </Modal>

      {/* MODAL PENCAPAIAN NEOCLAY */}
      <Modal visible={!!selectedAchievement} transparent animationType="fade" onRequestClose={() => setSelectedAchievement(null)}>
        <View style={styles.modalBackdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setSelectedAchievement(null)} />
          <View style={[styles.neoclayModalCard, shadowCard]}>
            {selectedAchievement && (() => {
              const iconName = getAchievementIcon(selectedAchievement.kode);
              const pct = Math.min(100, Math.round((selectedAchievement.progress / selectedAchievement.target) * 100));
              const isDone = selectedAchievement.tercapai;

              return (
                <>
                  <View style={[styles.achModalIconWrapper, isDone ? { backgroundColor: C.amberLight, borderColor: C.amber } : { backgroundColor: C.container, borderColor: C.outline }]}>
                    <MaterialIcons
                      name={iconName as any}
                      size={44}
                      color={isDone ? C.amberText : C.muted}
                    />
                  </View>

                  <Text style={styles.achModalTitle}>{selectedAchievement.judul}</Text>
                  <Text style={styles.achModalDesc}>{selectedAchievement.deskripsi}</Text>

                  {/* PROGRESS BAR CONTAINER */}
                  <View style={styles.achProgressCard}>
                    <View style={styles.achProgressHeader}>
                      <Text style={styles.achProgressLabel}>Kemajuan Target</Text>
                      <Text style={[styles.achProgressPct, isDone && { color: C.primary }]}>
                        {isDone ? "Tercapai" : `${pct}%`}
                      </Text>
                    </View>

                    <View style={styles.achProgressBarTrack}>
                      <View style={[styles.achProgressBarFill, { width: `${pct}%`, backgroundColor: isDone ? C.amber : C.primary }]} />
                    </View>

                    <View style={styles.achProgressFooter}>
                      <Text style={styles.achProgressCount}>
                        {selectedAchievement.progress} dari {selectedAchievement.target}
                      </Text>
                      <View style={[styles.achStatusBadge, isDone ? { backgroundColor: C.primaryLight } : { backgroundColor: C.container }]}>
                        <MaterialIcons
                          name={isDone ? "check-circle" : "hourglass-empty"}
                          size={14}
                          color={isDone ? C.primary : C.muted}
                        />
                        <Text style={[styles.achStatusText, isDone ? { color: C.primaryDark } : { color: C.muted }]}>
                          {isDone ? "Selesai" : `${Math.max(0, selectedAchievement.target - selectedAchievement.progress)} lagi`}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* ACTION BUTTON */}
                  <Pressable
                    onPress={() => setSelectedAchievement(null)}
                    style={({ pressed }) => [
                      styles.achModalCloseBtn,
                      shadowSubtle,
                      pressed && { transform: [{ scale: 0.98 }] },
                    ]}
                  >
                    <Text style={styles.achModalCloseText}>Tutup</Text>
                  </Pressable>
                </>
              );
            })()}
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: C.bg },
  scrollContent: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 120 },
  pressed: { backgroundColor: C.container, transform: [{ scale: 0.95 }] },

  // App bar
  appBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: C.bg,
    borderBottomWidth: 1,
    borderBottomColor: C.outline,
    gap: 12,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.outline,
    alignItems: "center",
    justifyContent: "center",
    ...shadowSubtle,
  },
  appBarOverline: { fontSize: 11, fontFamily: F.bold, color: C.muted, letterSpacing: 1 },
  appBarTitle: { fontSize: 14, fontFamily: F.extra, color: C.ink },

  // Banner + avatar
  banner: { width: "100%", height: 128, borderRadius: 20, overflow: "hidden", backgroundColor: C.primaryDark },
  avatarRow: { marginTop: -48, flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", paddingHorizontal: 8 },
  avatarFrame: {
    width: 96,
    height: 96,
    borderRadius: 20,
    backgroundColor: C.surface,
    padding: 4,
    borderWidth: 1,
    borderColor: C.outline,
  },
  avatarImage: { width: "100%", height: "100%", borderRadius: 16 },
  onlineDot: {
    position: "absolute",
    bottom: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: C.primary,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  rankBadge: {
    marginBottom: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: C.amberLight,
    borderWidth: 1,
    borderColor: "rgba(255,182,39,0.6)",
  },
  rankText: { fontSize: 12, fontFamily: F.extra, color: C.amberText },

  // Info
  name: { fontSize: 24, fontFamily: F.extra, color: C.ink, letterSpacing: -0.3 },
  username: { fontSize: 12, fontFamily: F.medium, color: C.muted },
  bio: { fontSize: 14, fontFamily: F.regular, color: C.muted, marginTop: 8, lineHeight: 22 },

  // Stats
  statsCard: {
    marginTop: 20,
    backgroundColor: C.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.outline,
    paddingVertical: 16,
    flexDirection: "row",
  },
  statItem: { flex: 1, alignItems: "center" },
  statDivider: { width: 1, backgroundColor: C.outline },
  statValue: { fontSize: 18, fontFamily: F.extra, color: C.ink },
  statLabel: { fontSize: 11, fontFamily: F.medium, color: C.muted, marginTop: 2 },

  // Streak
  streakCard: {
    marginTop: 16,
    padding: 16,
    borderRadius: 20,
    backgroundColor: C.primaryDark,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    overflow: "hidden",
    gap: 10,
  },
  streakBlob: {
    position: "absolute",
    right: -30,
    top: -30,
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  streakIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  streakOverline: { fontSize: 11, fontFamily: F.extra, color: "#FFFFFF", letterSpacing: 1, opacity: 0.9 },
  streakTitle: { fontSize: 14, fontFamily: F.bold, color: "#FFFFFF", marginTop: 1 },
  streakPill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  streakPillText: { fontSize: 11, fontFamily: F.bold, color: "#FFFFFF" },

  // Tabs
  tabs: {
    marginTop: 24,
    padding: 4,
    borderRadius: 14,
    backgroundColor: C.container,
    borderWidth: 1,
    borderColor: C.outline,
    flexDirection: "row",
    gap: 4,
  },
  tabBtn: { flex: 1, paddingVertical: 9, borderRadius: 10, alignItems: "center" },
  tabBtnActive: { backgroundColor: C.surface },
  tabText: { fontSize: 12, fontFamily: F.bold, color: C.muted },
  tabTextActive: { color: C.primaryDark, fontFamily: F.extra },

  // Post card
  postCard: {
    backgroundColor: C.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.outline,
    padding: 16,
    gap: 12,
  },
  postHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  postAvatarRing: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(63,168,107,0.35)",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  postAuthor: { fontSize: 12, fontFamily: F.extra, color: C.ink },
  postTime: { fontSize: 11, fontFamily: F.regular, color: C.muted },
  postBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999, borderWidth: 1 },
  postBadgeText: { fontSize: 11, fontFamily: F.bold },
  postTitle: { fontSize: 15, fontFamily: F.extra, color: C.ink, marginBottom: 4 },
  postBody: { fontSize: 14, fontFamily: F.medium, color: C.ink, lineHeight: 22 },
  postImage: { width: "100%", height: 180, borderRadius: 14, marginTop: 10 },
  postActions: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: C.outline,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  postAction: { flexDirection: "row", alignItems: "center", gap: 6 },
  postActionText: { fontSize: 12, fontFamily: F.medium, color: C.muted },

  // Section
  sectionTitle: { fontSize: 18, fontFamily: F.extra, color: C.ink },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  seeAllText: { fontSize: 12, fontFamily: F.bold, color: C.primary },
  horizontalScroll: { gap: 14, paddingBottom: 8 },

  // Riwayat Panen Btn
  riwayatBtn: {
    backgroundColor: C.primary,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  riwayatIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    alignItems: 'center',
    justifyContent: 'center',
  },
  riwayatTitle: { fontFamily: F.extra, fontSize: 16, color: "#FFFFFF" },
  riwayatSub: { fontFamily: F.bold, fontSize: 12, color: "rgba(255,255,255,0.8)" },

  // Achievements
  achievementIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  achievementIconLocked: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: C.container,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.7,
    marginTop: 6,
  },

  // Plants
  plantCard: {
    width: 100,
    backgroundColor: C.surface,
    borderRadius: 16,
    alignItems: 'center',
    overflow: 'hidden',
  },
  plantBlock: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: C.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plantNameContainer: { padding: 8, width: '100%', alignItems: 'center' },
  plantName: { fontSize: 12, fontFamily: F.bold, color: C.ink },
  plantAddCard: {
    width: 100,
    minHeight: 120,
    backgroundColor: C.surface,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  plantAddIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.outline,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  plantAddText: { fontSize: 12, fontFamily: F.bold, color: C.ink },

  // Empty
  emptyCard: {
    backgroundColor: C.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.outline,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  emptyIcon: { width: 60, height: 60, borderRadius: 18, backgroundColor: C.primaryLight, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  emptyTitle: { fontSize: 16, fontFamily: F.extra, color: C.ink },
  emptySub: { fontSize: 13, fontFamily: F.medium, color: C.muted, textAlign: "center", marginTop: 4 },

  // Bottom Sheet Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: C.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: C.outline,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  sheetTitle: {
    fontSize: 20,
    fontFamily: F.extra,
    color: C.ink,
    marginBottom: 16,
    textAlign: 'center',
  },

  // Menu List inside Burger
  menuContainer: {
    backgroundColor: C.bg,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: C.outline,
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: C.outline,
  },
  menuItemPressed: {
    backgroundColor: C.container,
  },
  menuText: {
    flex: 1,
    fontSize: 15,
    marginLeft: 16,
    fontFamily: F.bold,
    color: C.ink,
  },
  logoutButton: {
    backgroundColor: C.coralLight,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  logoutText: {
    fontSize: 15,
    fontFamily: F.extra,
    color: C.coral,
  },

  // Modal Pencapaian Neoclay
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(18, 57, 36, 0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  neoclayModalCard: {
    width: "100%",
    backgroundColor: C.surface,
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: C.outline,
    padding: 24,
    alignItems: "center",
  },
  achModalIconWrapper: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  achModalTitle: {
    fontSize: 20,
    fontFamily: F.extra,
    color: C.ink,
    textAlign: "center",
    marginBottom: 8,
  },
  achModalDesc: {
    fontSize: 14,
    fontFamily: F.medium,
    color: C.muted,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  achProgressCard: {
    width: "100%",
    backgroundColor: C.bg,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.outline,
    padding: 16,
    marginBottom: 20,
  },
  achProgressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  achProgressLabel: {
    fontSize: 12,
    fontFamily: F.bold,
    color: C.ink,
  },
  achProgressPct: {
    fontSize: 13,
    fontFamily: F.extra,
    color: C.amberText,
  },
  achProgressBarTrack: {
    height: 10,
    backgroundColor: "#E8E5DA",
    borderRadius: 5,
    overflow: "hidden",
    marginBottom: 10,
  },
  achProgressBarFill: {
    height: "100%",
    borderRadius: 5,
  },
  achProgressFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  achProgressCount: {
    fontSize: 12,
    fontFamily: F.medium,
    color: C.muted,
  },
  achStatusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  achStatusText: {
    fontSize: 11,
    fontFamily: F.bold,
  },
  achModalCloseBtn: {
    width: "100%",
    backgroundColor: C.primary,
    paddingVertical: 14,
    borderRadius: 100,
    alignItems: "center",
  },
  achModalCloseText: {
    fontSize: 16,
    fontFamily: F.extra,
    color: "#FFFFFF",
  },
});
