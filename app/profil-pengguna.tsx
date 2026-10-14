import { getRelativeTime } from "../utils/format";
import { MaterialIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Pressable,
  RefreshControl,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle, Defs, LinearGradient, RadialGradient, Rect, Stop } from "react-native-svg";

import { useNotification } from "../components/NotificationContext";
import PlantIllustration from "../components/PlantIllustration";
import {
  CommunityPost,
  getPublicUserProfile,
  getUserCommunityPosts,
  getUserPublicTanaman,
  PublicUserProfile,
  TanamanDetail,
  toggleCommunityLike,
  toggleFollowUser,
} from "../services/api";

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

const shadowFloat = {
  shadowColor: C.primary,
  shadowOffset: { width: 0, height: 12 },
  shadowOpacity: 0.35,
  shadowRadius: 24,
  elevation: 6,
};

// In-memory module-level cache for public profiles (0ms reload)
interface PublicProfileCacheEntry {
  profile: PublicUserProfile | null;
  posts: CommunityPost[];
  plants: TanamanDetail[];
  savedAt: number;
}

const publicProfileCache = new Map<string, PublicProfileCacheEntry>();

// ===== Helpers =====
const getRankTitle = (level: number) => {
  if (level >= 10) return "Dewa Tani";
  if (level >= 8) return "Sultan Hidroponik";
  if (level >= 4) return "Juragan Panen";
  if (level >= 2) return "Tangan Dingin";
  return "Petani Balkon";
};

const formatCount = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}jt`;
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return String(n);
};

const POST_BADGE: Record<string, { label: string; bg: string; fg: string; border: string }> = {
  progress_update: { label: "Update Kebun", bg: C.tealLight, fg: C.teal, border: "rgba(46,158,140,0.3)" },
  panen_surplus: { label: "Galeri Panen", bg: C.amberLight, fg: C.amberText, border: "rgba(255,182,39,0.6)" },
  pertanyaan: { label: "Pertanyaan", bg: C.coralLight, fg: C.coral, border: "rgba(255,107,92,0.35)" },
};

const getPlantStatus = (t: TanamanDetail) => {
  const sisa = t.sisaHariPanen ?? 999;
  if (sisa <= 0) return { label: "Siap Panen", bg: C.primary, fg: "#FFFFFF", tile: C.primaryLight, icon: "agriculture", iconColor: C.primary };
  if (sisa <= 7) return { label: `H-${sisa} Panen`, bg: C.primary, fg: "#FFFFFF", tile: C.primaryLight, icon: "eco", iconColor: C.primary };
  if (sisa <= 30) return { label: "Berbuah", bg: C.amber, fg: C.ink, tile: C.amberLight, icon: "local-florist", iconColor: C.amber };
  return { label: "Vegetatif", bg: C.surface, fg: C.ink, tile: C.tealLight, icon: "spa", iconColor: C.teal };
};

// ===== Sub components =====
const Avatar = ({ uri, name, size, radius }: { uri?: string | null; name: string; size: number; radius: number }) =>
  uri ? (
    <Image
      source={{ uri }}
      style={{ width: size, height: size, borderRadius: radius }}
      contentFit="cover"
      cachePolicy="memory-disk"
      transition={200}
    />
  ) : (
    <View style={{ width: size, height: size, borderRadius: radius, backgroundColor: C.primary, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ color: "#FFFFFF", fontFamily: F.extra, fontSize: size * 0.4 }}>{(name || "?").charAt(0).toUpperCase()}</Text>
    </View>
  );

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

// ===== Screen =====
export default function ProfilPenggunaScreen() {
  const { showNotification } = useNotification();
  const params = useLocalSearchParams<{ userId?: string; nama?: string; avatarUrl?: string; bannerUrl?: string; username?: string }>();
  const targetIdentifier = params.username || params.userId;

  const [profile, setProfile] = useState<PublicUserProfile | null>(null);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [plants, setPlants] = useState<TanamanDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"postingan" | "kebun">("postingan");

  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [isFollowBusy, setIsFollowBusy] = useState(false);

  const [likes, setLikes] = useState<Record<number, { liked: boolean; count: number }>>({});

  const followLockRef = useRef(false);
  const likeLockRef = useRef<Set<number>>(new Set());

  const fetchAll = useCallback(
    async (isSilent = false) => {
      if (!targetIdentifier) {
        setIsLoading(false);
        return;
      }
      if (!isSilent && !publicProfileCache.has(targetIdentifier)) {
        setIsLoading(true);
      }
      try {
        const [profRes, postRes, plantRes] = await Promise.all([
          getPublicUserProfile(targetIdentifier).catch(() => null),
          getUserCommunityPosts(targetIdentifier, 1, 20).catch(() => null),
          getUserPublicTanaman(targetIdentifier).catch(() => null),
        ]);

        if (profRes) {
          setProfile(profRes);
          setIsFollowing(Boolean(profRes.isFollowing));
          setFollowerCount(profRes.jumlahPengikut ?? 0);
        }
        const postList = postRes?.data ?? [];
        setPosts(postList);
        setLikes(
          Object.fromEntries(
            postList.map((p) => [p.id, { liked: Boolean(p.isLiked), count: p.jumlahLike ?? 0 }])
          )
        );
        const plantList = plantRes || [];
        if (plantRes) setPlants(plantList);

        publicProfileCache.set(targetIdentifier, {
          profile: profRes,
          posts: postList,
          plants: plantList,
          savedAt: Date.now(),
        });
      } catch (e) {
        console.error("Error fetching user profile:", e);
      } finally {
        setIsLoading(false);
      }
    },
    [targetIdentifier]
  );

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const stored = await SecureStore.getItemAsync("userData");
        const me = stored ? JSON.parse(stored) : null;
        if (
          (me?.username && targetIdentifier && me.username === targetIdentifier) ||
          (me?.id && targetIdentifier && String(me.id) === String(targetIdentifier))
        ) {
          router.replace("/(tabs)/profil");
          return;
        }
      } catch {}

      if (!targetIdentifier) {
        if (isMounted) setIsLoading(false);
        return;
      }

      if (publicProfileCache.has(targetIdentifier)) {
        const cached = publicProfileCache.get(targetIdentifier)!;
        if (isMounted) {
          setProfile(cached.profile);
          setPosts(cached.posts);
          setPlants(cached.plants);
          setIsFollowing(Boolean(cached.profile?.isFollowing));
          setFollowerCount(cached.profile?.jumlahPengikut ?? 0);
          setLikes(
            Object.fromEntries(
              cached.posts.map((p) => [p.id, { liked: Boolean(p.isLiked), count: p.jumlahLike ?? 0 }])
            )
          );
          setIsLoading(false);
        }
        await fetchAll(true);
      } else {
        if (isMounted) setIsLoading(true);
        await fetchAll(false);
        if (isMounted) setIsLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [targetIdentifier, fetchAll]);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await fetchAll(true);
    setIsRefreshing(false);
  };

  const handleTabChange = (tab: "postingan" | "kebun") => {
    if (tab !== activeTab) {
      setActiveTab(tab);
    }
  };

  // Fallback ke data dari postingan yang di-tap bila endpoint profil belum tersedia
  const nama = profile?.nama || params.nama || "Petani";
  const username = profile?.username || params.username || null;
  const avatarUrl = profile?.avatarUrl || params.avatarUrl || null;
  const level = profile?.level ?? 1;
  const streak = profile?.streak ?? 0;
  const tanamanCount = profile?.jumlahTanaman ?? plants.length;
  const mengikutiCount = profile?.jumlahMengikuti ?? 0;
  const memberSince = profile?.createdAt ? new Date(profile.createdAt).getFullYear() : null;
  const handle = username ? `@${username}` : nama;

  const handleToggleFollow = async () => {
    const targetUserId = profile?.id ?? (params.userId ? Number(params.userId) : null);
    if (!targetUserId || followLockRef.current) return;
    followLockRef.current = true;

    const prevFollowing = isFollowing;
    const prevCount = followerCount;
    const nextFollowing = !prevFollowing;

    // Optimistic UI Update
    setIsFollowing(nextFollowing);
    setFollowerCount(Math.max(0, prevCount + (prevFollowing ? -1 : 1)));
    setIsFollowBusy(true);

    try {
      const res = await toggleFollowUser(targetUserId);
      setIsFollowing(res.following);
      if (typeof res.jumlahPengikut === "number") {
        setFollowerCount(res.jumlahPengikut);
      }

      // Update in-memory profile cache
      if (targetIdentifier && publicProfileCache.has(targetIdentifier)) {
        const cached = publicProfileCache.get(targetIdentifier)!;
        if (cached.profile) {
          cached.profile.isFollowing = res.following;
          cached.profile.jumlahPengikut = res.jumlahPengikut;
        }
      }

      // Asynchronously synchronize current user's following count in SecureStore ("userData")
      (async () => {
        try {
          const rawUserData = await SecureStore.getItemAsync("userData");
          if (rawUserData) {
            const userObj = JSON.parse(rawUserData);
            const currentFollowing = Number(userObj.jumlahMengikuti) || 0;
            const updatedFollowing = res.following
              ? currentFollowing + 1
              : Math.max(0, currentFollowing - 1);
            userObj.jumlahMengikuti = updatedFollowing;
            await SecureStore.setItemAsync("userData", JSON.stringify(userObj));
          }
        } catch (err) {
          console.warn("Gagal sinkronisasi userData jumlahMengikuti:", err);
        }
      })();
    } catch {
      setIsFollowing(prevFollowing);
      setFollowerCount(prevCount);
      showNotification("Gagal", "Tidak dapat mengikuti pengguna saat ini, silakan coba beberapa saat lagi.", "error");
    } finally {
      setIsFollowBusy(false);
      followLockRef.current = false;
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Lihat kebun ${nama} (${handle}) di TaniSync!`,
      });
    } catch {}
  };

  const handleLike = async (postId: number) => {
    if (likeLockRef.current.has(postId)) return;
    likeLockRef.current.add(postId);

    const prev = likes[postId] ?? { liked: false, count: 0 };
    const next = { liked: !prev.liked, count: Math.max(0, prev.count + (prev.liked ? -1 : 1)) };
    setLikes((s) => ({ ...s, [postId]: next }));

    try {
      const res = await toggleCommunityLike(postId);
      setLikes((s) => ({ ...s, [postId]: { liked: res.liked, count: res.jumlahLike } }));
    } catch {
      setLikes((s) => ({ ...s, [postId]: prev }));
    } finally {
      likeLockRef.current.delete(postId);
    }
  };

  const handleOpenPostDetail = (post: CommunityPost) => {
    const like = likes[post.id] ?? { liked: Boolean(post.isLiked), count: post.jumlahLike ?? 0 };
    const enrichedPost = {
      ...post,
      user_nama: nama,
      userAvatar: avatarUrl,
      isLiked: like.liked,
      jumlahLike: like.count,
    };

    router.push({
      pathname: "/detail-komunitas",
      params: {
        id: post.id,
        initialPost: JSON.stringify(enrichedPost),
        initialData: JSON.stringify(enrichedPost),
      },
    } as any);
  };

  const publicPlants = useMemo(() => plants, [plants]);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      {/* TOP APP BAR */}
      <View style={styles.appBar}>
        <Pressable
          accessibilityLabel="Kembali"
          onPress={() => (router.canGoBack() ? router.back() : router.replace("/(tabs)/komunitas"))}
          style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
        >
          <MaterialIcons name="arrow-back" size={20} color={C.ink} />
        </Pressable>
        <View style={{ alignItems: "center", flex: 1 }}>
          <Text style={styles.appBarOverline}>PROFIL PETANI</Text>
          <Text style={styles.appBarTitle} numberOfLines={1}>{handle}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={[C.primary]} tintColor={C.primary} />}
      >
        {/* BANNER */}
        <View style={{ position: "relative" }}>
          {profile?.bannerUrl ? (
            <Image
              source={{ uri: profile.bannerUrl }}
              style={[styles.banner, shadowCard]}
              contentFit="cover"
              cachePolicy="memory-disk"
            />
          ) : params.bannerUrl ? (
            <Image
              source={{ uri: params.bannerUrl }}
              style={[styles.banner, shadowCard]}
              contentFit="cover"
              cachePolicy="memory-disk"
            />
          ) : (
            <BotanicBanner />
          )}

          {streak > 0 && (
            <View style={[styles.smallStreakBadge, shadowSubtle]}>
              <MaterialIcons name="local-fire-department" size={12} color={C.ink} />
              <Text style={styles.smallStreakText}>{streak} streak</Text>
            </View>
          )}
        </View>

        {/* AVATAR + RANK BADGE */}
        <View style={styles.avatarRow}>
          <View>
            <View style={[styles.avatarFrame, shadowCard]}>
              <Avatar uri={avatarUrl} name={nama} size={86} radius={14} />
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
            <Text style={styles.name}>{nama}</Text>
            {username ? <Text style={styles.username}>@{username}</Text> : null}
          </View>
          {isLoading && !profile ? (
            <View style={{ gap: 6, marginTop: 10 }}>
              <SkeletonBlock style={{ height: 12, borderRadius: 6, width: "100%" }} />
              <SkeletonBlock style={{ height: 12, borderRadius: 6, width: "70%" }} />
            </View>
          ) : (
            <Text style={[styles.bio, !profile?.bio && { fontStyle: "italic" }]}>
              {profile?.bio || "Belum ada bio"}
              {memberSince ? ` | Anggota Komunitas sejak ${memberSince}.` : ""}
            </Text>
          )}
        </View>

        {/* ACTION BUTTONS */}
        <View style={styles.actionRow}>
          <Pressable
            onPress={handleToggleFollow}
            style={({ pressed }) => [
              styles.followBtn,
              isFollowing ? [styles.followBtnActive, shadowSubtle] : shadowFloat,
              pressed && { transform: [{ scale: 0.98 }] },
            ]}
          >
            <MaterialIcons name={isFollowing ? "check" : "person-add"} size={18} color={isFollowing ? C.ink : "#FFFFFF"} />
            <Text style={[styles.followText, isFollowing && { color: C.ink }]}>{isFollowing ? "Mengikuti" : "Ikuti"}</Text>
          </Pressable>

          <Pressable
            accessibilityLabel="Bagikan Profil"
            onPress={handleShare}
            style={({ pressed }) => [styles.shareBtn, shadowSubtle, pressed && styles.pressed]}
          >
            <MaterialIcons name="share" size={18} color={C.muted} />
          </Pressable>
        </View>

        {!isLoading && !profile && !params.nama && (
          <View style={{ marginVertical: 24, padding: 24, alignItems: "center", backgroundColor: C.surface, borderRadius: 20 }}>
            <MaterialIcons name="person-off" size={48} color={C.muted} />
            <Text style={{ fontFamily: "Nunito_700Bold", fontSize: 16, color: C.ink, marginTop: 12 }}>Profil Tidak Ditemukan</Text>
            <Text style={{ fontFamily: "Nunito_500Medium", fontSize: 13, color: C.muted, textAlign: "center", marginTop: 4 }}>
              Profil ini belum tersedia atau pengguna belum mengatur profil publiknya.
            </Text>
          </View>
        )}

        {/* STATS */}
        <View style={[styles.statsCard, shadowSubtle]}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{formatCount(tanamanCount)}</Text>
            <Text style={styles.statLabel}>Tanaman</Text>
          </View>
          <View style={styles.statDivider} />
          <Pressable
            style={styles.statItem}
            onPress={() => profile?.id && router.push({ pathname: "/koneksi", params: { userId: profile.id, username: handle, initialTab: "followers" } } as any)}
          >
            <Text style={[styles.statValue, { color: C.primary }]}>{formatCount(followerCount)}</Text>
            <Text style={styles.statLabel}>Pengikut</Text>
          </Pressable>
          <View style={styles.statDivider} />
          <Pressable
            style={styles.statItem}
            onPress={() => profile?.id && router.push({ pathname: "/koneksi", params: { userId: profile.id, username: handle, initialTab: "following" } } as any)}
          >
            <Text style={styles.statValue}>{formatCount(mengikutiCount)}</Text>
            <Text style={styles.statLabel}>Mengikuti</Text>
          </Pressable>
        </View>

        {/* SEGMENTED TABS */}
        <View style={styles.tabs}>
          {(["postingan", "kebun"] as const).map((tab) => {
            const active = activeTab === tab;
            const label = tab === "postingan" ? `Postingan (${posts.length})` : `Kebunnya (${publicPlants.length} Publik)`;
            return (
              <Pressable
                key={tab}
                onPress={() => handleTabChange(tab)}
                style={[styles.tabBtn, active && [styles.tabBtnActive, shadowSubtle]]}
              >
                <Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* CONTENT */}
        {isLoading && posts.length === 0 && publicPlants.length === 0 ? (
          <View style={{ marginTop: 16, gap: 14 }}>
            {[1, 2].map((i) => (
              <SkeletonBlock key={i} style={{ height: 150, borderRadius: 20 }} />
            ))}
          </View>
        ) : activeTab === "postingan" ? (
          <View style={{ marginTop: 16, gap: 14 }}>
            {posts.length === 0 ? (
              <EmptyState icon="forum" title="Belum ada postingan" subtitle={`${nama} belum berbagi cerita kebun.`} />
            ) : (
              posts.map((post) => {
                const badge = POST_BADGE[post.tipePost];
                const like = likes[post.id] ?? { liked: false, count: 0 };
                return (
                  <View key={post.id} style={[styles.postCard, shadowSubtle]}>
                    <View style={styles.postHeader}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flex: 1 }}>
                        <View style={styles.postAvatarRing}>
                          <Avatar uri={avatarUrl} name={nama} size={34} radius={17} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.postAuthor} numberOfLines={1}>{nama}</Text>
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
                      onPress={() => handleOpenPostDetail(post)}
                      style={({ pressed }) => pressed && { opacity: 0.85 }}
                    >
                      {post.judul ? <Text style={styles.postTitle}>{post.judul}</Text> : null}
                      <Text style={styles.postBody}>{post.deskripsi}</Text>
                      {post.fotoUrl ? (
                        <Image
                          source={{ uri: post.fotoUrl }}
                          style={styles.postImage}
                          contentFit="cover"
                          cachePolicy="memory-disk"
                          transition={200}
                        />
                      ) : null}
                    </Pressable>

                    <View style={styles.postActions}>
                      <Pressable onPress={() => handleLike(post.id)} style={styles.postAction} hitSlop={8}>
                        <MaterialIcons name={like.liked ? "favorite" : "favorite-border"} size={18} color={like.liked ? C.coral : C.muted} />
                        <Text style={[styles.postActionText, like.liked && { color: C.coral }]}>{like.count} suka</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => handleOpenPostDetail(post)}
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
          <View style={styles.plantGrid}>
            {publicPlants.length === 0 ? (
              <View style={{ width: "100%" }}>
                <EmptyState icon="yard" title="Kebun masih sepi" subtitle="Belum ada tanaman publik yang dibagikan." />
              </View>
            ) : (
              publicPlants.map((t) => {
                const s = getPlantStatus(t);
                const plantPhoto = t.logTerakhir?.fotoUrl;
                return (
                  <View key={t.id} style={[styles.plantCard, shadowSubtle]}>
                    <View style={[styles.plantTile, { backgroundColor: s.tile }]}>
                      {plantPhoto ? (
                        <Image
                          source={{ uri: plantPhoto }}
                          style={StyleSheet.absoluteFill}
                          contentFit="cover"
                          cachePolicy="memory-disk"
                          transition={200}
                        />
                      ) : (
                        <PlantIllustration jenisTanaman={t.jenisTanaman} size={64} />
                      )}
                      <View style={[styles.plantStatus, { backgroundColor: s.bg }, s.bg === C.surface && { borderWidth: 1, borderColor: C.outline }]}>
                        <Text style={[styles.plantStatusText, { color: s.fg }]}>{s.label}</Text>
                      </View>
                    </View>
                    <Text style={styles.plantName} numberOfLines={1}>{t.nickname || t.jenisTanaman}</Text>
                    <Text style={styles.plantSub} numberOfLines={1}>{t.jenisTanaman}</Text>
                  </View>
                );
              })
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const EmptyState = ({ icon, title, subtitle }: { icon: any; title: string; subtitle: string }) => (
  <View style={[styles.emptyCard, shadowSubtle]}>
    <View style={styles.emptyIcon}>
      <MaterialIcons name={icon} size={30} color={C.primary} />
    </View>
    <Text style={styles.emptyTitle}>{title}</Text>
    <Text style={styles.emptySub}>{subtitle}</Text>
  </View>
);

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: C.bg },
  scrollContent: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 64 },
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
  smallStreakBadge: { position: "absolute", bottom: 12, right: 12, flexDirection: "row", alignItems: "center", backgroundColor: "#FFFFFF", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, gap: 4 },
  smallStreakText: { fontSize: 12, fontFamily: F.bold, color: C.ink },
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

  // Actions
  actionRow: { marginTop: 20, flexDirection: "row", alignItems: "center", gap: 10 },
  followBtn: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    backgroundColor: C.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: C.primary,
  },
  followBtnActive: { backgroundColor: C.surface, borderColor: C.outline },
  followText: { fontSize: 14, fontFamily: F.bold, color: "#FFFFFF" },
  shareBtn: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.outline,
    alignItems: "center",
    justifyContent: "center",
  },

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

  // Plant grid
  plantGrid: { marginTop: 16, flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 12 },
  plantCard: {
    width: "48.5%",
    backgroundColor: C.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.outline,
    padding: 12,
    gap: 2,
  },
  plantTile: { width: "100%", height: 96, borderRadius: 14, alignItems: "center", justifyContent: "center", marginBottom: 8, overflow: "hidden" },
  plantStatus: { position: "absolute", top: 8, right: 8, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  plantStatusText: { fontSize: 10, fontFamily: F.extra },
  plantName: { fontSize: 12, fontFamily: F.extra, color: C.ink },
  plantSub: { fontSize: 11, fontFamily: F.regular, color: C.muted },

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
});
