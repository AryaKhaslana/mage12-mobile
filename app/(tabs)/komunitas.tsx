import React, {
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import * as Location from "expo-location";
import {
  KeyboardAvoidingView,
  ScrollView, Platform,
  ActivityIndicator,
  Animated,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
  Share,
} from "react-native";
import { Image } from "expo-image";
import * as Haptics from "expo-haptics";
import { SafeAreaView } from "react-native-safe-area-context";

import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createCommunityPost,
  getCommunityPosts, getMyCommunityPosts, toggleCommunityLike, deleteCommunityPost,
  registerOnLogout, clearInFlightRequests
} from "../../services/api";
import { useNotification } from "../../components/NotificationContext";
import ErrorState from "../../components/ErrorState";

interface CommunityMemoryCache {
  posts: any[];
  likes: Record<number, { liked: boolean; count: number }>;
  savedAt: number;
}

let memoryCommunityCache: CommunityMemoryCache | null = null;
registerOnLogout(() => {
  memoryCommunityCache = null;
});

const EmptyHint = ({
  icon,
  title,
  subtitle,
  ctaText,
  onCtaPress,
}: {
  icon: any;
  title: string;
  subtitle: string;
  ctaText?: string;
  onCtaPress?: () => void;
}) => (
  <View
    style={{
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 40,
      paddingHorizontal: 20,
    }}
  >
    <MaterialIcons
      name={icon}
      size={56}
      color="#bdcabd"
      style={{ marginBottom: 16 }}
    />
    <Text
      style={{
        fontSize: 16,
        fontFamily: "Nunito_700Bold",
        color: "#123924",
        textAlign: "center",
        marginBottom: 8,
      }}
    >
      {title}
    </Text>
    <Text
      style={{
        fontSize: 14,
        fontFamily: "Nunito_500Medium",
        color: "#5C5A4F",
        textAlign: "center",
      }}
    >
      {subtitle}
    </Text>
    {ctaText && onCtaPress && (
      <Pressable
        onPress={onCtaPress}
        style={({ pressed }) => [
          {
            marginTop: 24,
            backgroundColor: "#3FA86B",
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 100,
            borderWidth: 0,
            shadowColor: "#123924",
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.08,
            shadowRadius: 14,
            elevation: 4,
          },
          pressed && { opacity: 0.8 },
        ]}
      >
        <Text style={{ fontFamily: "Nunito_800ExtraBold", color: "#FFFFFF" }}>
          {ctaText}
        </Text>
      </Pressable>
    )}
  </View>
);

export interface PostType {
  id: string | number;
  authorName: string;
  streak: number;
  timeText: string;
  avatarUrl: string;
  postImageUrl?: string | null;
  tipe: "UPDATE" | "TANYA" | "BARTER" | "DONASI";
  judul: string;
  isi: string;
  lokasiNama: string;
  tags: string;
}


const INDONESIAN_LOCATIONS = [
  { name: "Jakarta Pusat", lat: -6.1805, lng: 106.8284 },
  { name: "Jakarta Selatan", lat: -6.2615, lng: 106.8106 },
  { name: "Jakarta Barat", lat: -6.1683, lng: 106.7588 },
  { name: "Jakarta Timur", lat: -6.2250, lng: 106.9004 },
  { name: "Jakarta Utara", lat: -6.1214, lng: 106.8771 },
  { name: "Bogor", lat: -6.5971, lng: 106.7915 },
  { name: "Depok", lat: -6.4025, lng: 106.7942 },
  { name: "Tangerang", lat: -6.1702, lng: 106.6403 },
  { name: "Tangerang Selatan", lat: -6.2886, lng: 106.7179 },
  { name: "Bekasi", lat: -6.2383, lng: 106.9756 },
  { name: "Bandung", lat: -6.9175, lng: 107.6191 },
  { name: "Semarang", lat: -6.9667, lng: 110.4167 },
  { name: "Yogyakarta", lat: -7.7956, lng: 110.3695 },
  { name: "Surabaya", lat: -7.2504, lng: 112.7688 },
  { name: "Sidoarjo", lat: -7.4478, lng: 112.7183 },
  { name: "Malang", lat: -7.9797, lng: 112.6304 },
  { name: "Medan", lat: 3.5952, lng: 98.6722 },
  { name: "Palembang", lat: -2.9909, lng: 104.7566 },
  { name: "Makassar", lat: -5.1477, lng: 119.4327 },
  { name: "Denpasar", lat: -8.6705, lng: 115.2126 },
  { name: "Balikpapan", lat: -1.2379, lng: 116.8529 }
];

const PostSkeleton = () => {
  const [fadeAnim] = useState(() => new Animated.Value(0.3));
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [fadeAnim]);
  return (
    <Animated.View
      style={[styles.postCard, { opacity: fadeAnim, marginBottom: 16 }]}
    >
      <View style={styles.postHeader}>
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: "#E8E5DA",
          }}
        />
        <View style={{ flex: 1, gap: 4 }}>
          <View
            style={{
              width: 120,
              height: 10,
              borderRadius: 5,
              backgroundColor: "#E8E5DA",
            }}
          />
          <View
            style={{
              width: 60,
              height: 10,
              borderRadius: 5,
              backgroundColor: "#E8E5DA",
            }}
          />
        </View>
        <View
          style={{
            width: 90,
            height: 20,
            borderRadius: 100,
            backgroundColor: "#E8E5DA",
          }}
        />
      </View>
      <View style={{ gap: 6, marginBottom: 12 }}>
        <View
          style={{
            width: "100%",
            height: 12,
            borderRadius: 6,
            backgroundColor: "#E8E5DA",
          }}
        />
        <View
          style={{
            width: "100%",
            height: 12,
            borderRadius: 6,
            backgroundColor: "#E8E5DA",
          }}
        />
        <View
          style={{
            width: "60%",
            height: 12,
            borderRadius: 6,
            backgroundColor: "#E8E5DA",
          }}
        />
      </View>
      <View
        style={{
          width: "100%",
          aspectRatio: 4 / 3,
          borderRadius: 16,
          backgroundColor: "#E8E5DA",
        }}
      />
    </Animated.View>
  );
};

const getRelativeTime = (isoString: string) => {
  if (!isoString) return "";
  const date = new Date(isoString);
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 60) return `${Math.max(1, diffMins)} mnt lalu`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} jam lalu`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} hari lalu`;
  return date.toLocaleDateString("id-ID");
};

interface PostCardItemProps {
  item: any;
  currentUser: any;
  isLiked: boolean;
  likeCount: number;
  onLike: (id: number) => void;
  onDelete: (id: number) => void;
  onOpenDetail: (item: any) => void;
  onOpenProfile: (item: any) => void;
}

const PostCardItem = memo(
  ({
    item,
    currentUser,
    isLiked,
    likeCount,
    onLike,
    onDelete,
    onOpenDetail,
    onOpenProfile,
  }: PostCardItemProps) => {
    let badgeBg = "#E8E5DA";
    let badgeColor = "#123924";
    let labelTipe = "Info";

    if (item.tipePost === "progress_update") {
      badgeBg = "#E8F5E9";
      badgeColor = "#3FA86B";
      labelTipe = "Progress";
    } else if (item.tipePost === "pertanyaan") {
      badgeBg = "#FFECEB";
      badgeColor = "#FF6B5C";
      labelTipe = "Pertanyaan";
    } else if (item.tipePost === "panen_surplus") {
      badgeBg = "#FFF9E6";
      badgeColor = "#B8860B";
      labelTipe = "Panen Surplus";
    }

    const avatarUri = item.author?.avatarUrl || item.userAvatar || item.avatarUrl;
    const authorName = item.author?.nama || item.user_nama || "Petani";
    const isOwner = Boolean(
      currentUser?.id &&
        (item.author?.id === currentUser.id ||
          item.user_id === currentUser.id ||
          item.userId === currentUser.id)
    );

    return (
      <View style={styles.postCard}>
        <View style={styles.postHeader}>
          <Pressable
            onPress={() => onOpenProfile(item)}
            style={({ pressed }) => [
              { flex: 1, flexDirection: "row", alignItems: "center", gap: 12 },
              pressed && { opacity: 0.7 },
            ]}
          >
            <View style={styles.avatarContainer}>
              {avatarUri ? (
                <Image
                  source={{ uri: avatarUri }}
                  style={{ width: "100%", height: "100%", borderRadius: 20 }}
                  contentFit="cover"
                  cachePolicy="memory-disk"
                />
              ) : (
                <Text
                  style={{
                    fontFamily: "Nunito_800ExtraBold",
                    color: "#FFFFFF",
                    fontSize: 16,
                  }}
                >
                  {authorName.charAt(0).toUpperCase()}
                </Text>
              )}
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text
                style={{
                  fontFamily: "Nunito_800ExtraBold",
                  color: "#123924",
                  fontSize: 15,
                }}
                numberOfLines={1}
              >
                {authorName}
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Text
                  style={{
                    fontFamily: "Nunito_500Medium",
                    color: "#5C5A4F",
                    fontSize: 12,
                  }}
                >
                  {getRelativeTime(item.createdAt)}
                </Text>
                {item.lokasiNama ? (
                  <>
                    <Text
                      style={{
                        fontFamily: "Nunito_700Bold",
                        color: "#A09E91",
                        fontSize: 10,
                      }}
                    >
                      {"\u2022"}
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 2,
                        backgroundColor: "#E8F5E9",
                        paddingHorizontal: 6,
                        paddingVertical: 1.5,
                        borderRadius: 6,
                      }}
                    >
                      <MaterialIcons name="place" size={10} color="#3FA86B" />
                      <Text
                        style={{
                          fontFamily: "Nunito_800ExtraBold",
                          fontSize: 10,
                          color: "#3FA86B",
                        }}
                        numberOfLines={1}
                      >
                        {item.lokasiNama}
                      </Text>
                    </View>
                  </>
                ) : null}
              </View>
            </View>
          </Pressable>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <View
              style={{
                backgroundColor: badgeBg,
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 100,
                borderWidth: 0,
              }}
            >
              <Text
                style={{
                  fontFamily: "Nunito_800ExtraBold",
                  fontSize: 11,
                  color: badgeColor,
                }}
              >
                {labelTipe}
              </Text>
            </View>
          </View>
        </View>

        <Pressable
          onPress={() => onOpenDetail(item)}
          style={({ pressed }) => [pressed && { opacity: 0.85 }]}
        >
          {item.judul ? (
            <Text
              style={{
                fontFamily: "Nunito_800ExtraBold",
                color: "#123924",
                marginBottom: 4,
                fontSize: 16,
              }}
            >
              {item.judul}
            </Text>
          ) : null}
          <Text
            style={{
              fontFamily: "Nunito_500Medium",
              color: "#123924",
              fontSize: 14,
              marginBottom: 12,
              lineHeight: 22,
            }}
          >
            {item.deskripsi}
          </Text>
          {item.tags && item.tags !== `#${item.lokasiNama}` ? (
            <Text
              style={{
                fontFamily: "Nunito_700Bold",
                color: "#3FA86B",
                marginBottom: 12,
                fontSize: 13,
              }}
            >
              {item.tags}
            </Text>
          ) : null}
          {item.fotoUrl ? (
            <Image
              source={{ uri: item.fotoUrl }}
              style={{
                width: "100%",
                height: 200,
                borderRadius: 16,
                marginBottom: 12,
              }}
              contentFit="cover"
              cachePolicy="memory-disk"
            />
          ) : null}
        </Pressable>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 4,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
            <Pressable
              onPress={() => onLike(item.id)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
              }}
            >
              <MaterialIcons
                name={isLiked ? "favorite" : "favorite-border"}
                size={24}
                color={isLiked ? "#FF6B5C" : "#123924"}
              />
              <Text
                style={{
                  fontFamily: "Nunito_700Bold",
                  color: isLiked ? "#FF6B5C" : "#123924",
                }}
              >
                {likeCount}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => onOpenDetail(item)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
              }}
            >
              <MaterialIcons
                name="chat-bubble-outline"
                size={24}
                color="#123924"
              />
              <Text style={{ fontFamily: "Nunito_700Bold", color: "#123924" }}>
                {item.jumlahKomentar ?? 0}
              </Text>
            </Pressable>
            <Pressable
              onPress={async () => {
                try {
                  await Share.share({
                    message: `Lihat postingan ini dari ${authorName}: ${item.judul || item.deskripsi}`,
                  });
                } catch (error) {
                  console.error(error);
                }
              }}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
              }}
            >
              <MaterialIcons name="share" size={24} color="#123924" />
            </Pressable>
          </View>

          {isOwner && (
            <Pressable
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              onPress={() => onDelete(item.id)}
            >
              <MaterialIcons name="delete-outline" size={24} color="#FF6B5C" />
            </Pressable>
          )}
        </View>
      </View>
    );
  }
);

export default function KomunitasScreen() {
  const { showNotification } = useNotification();

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const [posts, setPosts] = useState<any[]>(() => memoryCommunityCache ? memoryCommunityCache.posts : []);
  const [likes, setLikes] = useState<Record<number, { liked: boolean; count: number }>>(() => memoryCommunityCache ? memoryCommunityCache.likes : {});
  const postsRef = useRef<any[]>(memoryCommunityCache ? memoryCommunityCache.posts : []);
  const likesRef = useRef<Record<number, { liked: boolean; count: number }>>(memoryCommunityCache ? memoryCommunityCache.likes : {});
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [isLoading, setIsLoading] = useState(() => !memoryCommunityCache);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isError, setIsError] = useState(false);
  const [activeTab, setActiveTab] = useState<"terbaru" | "terdekat">("terbaru");
  const [isGpsFallback, setIsGpsFallback] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalErrorText, setModalErrorText] = useState<string | null>(null);
  const likingPostIdsRef = useRef<Set<number>>(new Set());
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [userFilter, setUserFilter] = useState<"semua" | "saya">("semua");

  useEffect(() => {
    if (!memoryCommunityCache) {
      AsyncStorage.getItem("community_feed_cache_v1")
        .then((cachedStr) => {
          if (cachedStr) {
            try {
              const parsed: CommunityMemoryCache = JSON.parse(cachedStr);
              if (parsed?.posts?.length) {
                memoryCommunityCache = parsed;
                postsRef.current = parsed.posts;
                setPosts(parsed.posts);
                setLikes(parsed.likes || {});
                setIsLoading(false);
              }
            } catch {}
          }
        })
        .catch(() => {});
    }
  }, []);


  // Form State
  const [tipePost, setTipePost] = useState("PROGRESS");
  const [judul, setJudul] = useState("");
  const [lokasiNama, setLokasiNama] = useState("");
  const [lokasiLat, setLokasiLat] = useState<number | null>(null);
  const [lokasiLng, setLokasiLng] = useState<number | null>(null);
  const [filteredCities, setFilteredCities] = useState<typeof INDONESIAN_LOCATIONS>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLocationChange = (text: string) => {
    setLokasiNama(text);
    setLokasiLat(null);
    setLokasiLng(null);
    if (!text.trim()) {
      setShowDropdown(false);
      setFilteredCities([]);
      return;
    }
    const matches = INDONESIAN_LOCATIONS.filter(city => city.name.toLowerCase().includes(text.toLowerCase()));
    setFilteredCities(matches);
    setShowDropdown(true);
  };
  const [deskripsi, setDeskripsi] = useState("");
  const [cursorPos, setCursorPos] = useState({ start: 0, end: 0 });
  
  const DUMMY_HASHTAGS = [
    { tag: "#Panen", count: 120 },
    { tag: "#Pupuk", count: 85 },
    { tag: "#TanamanHias", count: 320 },
    { tag: "#Tomat", count: 45 },
    { tag: "#Hidroponik", count: 210 },
    { tag: "#Hama", count: 65 },
    { tag: "#PetaniMuda", count: 500 }
  ];

  const textBeforeCursor = deskripsi.substring(0, cursorPos.start);
  const tagMatch = textBeforeCursor.match(/(#[a-zA-Z0-9_]+)$/);
  const activeTagQuery = tagMatch ? tagMatch[1].toLowerCase() : null;
  const tagSuggestions = activeTagQuery ? DUMMY_HASHTAGS.filter(t => t.tag.toLowerCase().startsWith(activeTagQuery)) : [];

  const [foto, setFoto] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const fetchPosts = useCallback(async (pageNum = 1, shouldRefresh = false) => {
    try {
      setIsError(false);
      if (shouldRefresh) {
        clearInFlightRequests();
        setIsRefreshing(true);
      } else if (pageNum === 1 && postsRef.current.length === 0) {
        setIsLoading(true);
      }
      const userDataStr = await SecureStore.getItemAsync("userData");
      if (userDataStr) {
        setCurrentUser(JSON.parse(userDataStr));
      }
      let lat = undefined;
      let lng = undefined;

      if (activeTab === "terdekat") {
        let gpsActive = false;
        try {
          const servicesEnabled = await Location.hasServicesEnabledAsync();
          if (servicesEnabled) {
            let perm = await Location.getForegroundPermissionsAsync();
            if (perm.status !== "granted" && perm.canAskAgain) {
              perm = await Location.requestForegroundPermissionsAsync();
            }
            if (perm.status === "granted") {
              try {
                const curPos = await Location.getCurrentPositionAsync({
                  accuracy: Location.Accuracy.Balanced,
                });
                if (curPos?.coords) {
                  lat = curPos.coords.latitude;
                  lng = curPos.coords.longitude;
                  gpsActive = true;
                }
              } catch {
                // Gunakan koordinat kebun tersimpan jika pembacaan posisi terkendala
              }
            }
          }
        } catch {}

        if (userDataStr) {
          const user = JSON.parse(userDataStr);
          if (!lat || !lng) {
            if (user.latitude && user.longitude) {
              lat = user.latitude;
              lng = user.longitude;
            } else {
              showNotification(
                "Lokasi Belum Diatur",
                "Silakan lengkapi data lokasi pada profil kamu terlebih dahulu.",
                "info",
              );
              setIsLoading(false);
              setIsRefreshing(false);
              return;
            }
          }
        } else if (!lat || !lng) {
          showNotification(
            "Lokasi Belum Diatur",
            "Silakan lengkapi data lokasi pada profil kamu terlebih dahulu.",
            "info",
          );
          setIsLoading(false);
          setIsRefreshing(false);
          return;
        }

        if (!gpsActive) {
          setIsGpsFallback(true);
          if (pageNum === 1 || shouldRefresh) {
            showNotification(
              "Info Lokasi",
              "GPS perangkat sedang tidak aktif. Menampilkan komunitas di sekitar lokasi kebun tersimpanmu.",
              "info"
            );
          }
        } else {
          setIsGpsFallback(false);
        }
      } else {
        setIsGpsFallback(false);
      }

      let response;
      if (userFilter === "saya") {
        response = await getMyCommunityPosts(pageNum, 10);
      } else {
        response = await getCommunityPosts(lat, lng, pageNum, 10, debouncedSearch);
      }

      const newPosts = response.data;
      if (shouldRefresh || pageNum === 1) {
        postsRef.current = newPosts;
        setPosts(newPosts);
        const newLikes: Record<number, { liked: boolean; count: number }> = {};
        newPosts.forEach((p: any) => {
          newLikes[p.id] = { liked: !!p.isLiked, count: p.jumlahLike ?? 0 };
        });
        likesRef.current = newLikes;
        setLikes(newLikes);
        if (activeTab === "terbaru" && userFilter === "semua" && !debouncedSearch) {
          memoryCommunityCache = {
            posts: newPosts,
            likes: newLikes,
            savedAt: Date.now(),
          };
          AsyncStorage.setItem("community_feed_cache_v1", JSON.stringify(memoryCommunityCache)).catch(() => {});
        }
      } else {
        const combined = [...postsRef.current, ...newPosts];
        postsRef.current = combined;
        setPosts(combined);
        const nextLikes = { ...likesRef.current };
        newPosts.forEach((p: any) => {
          nextLikes[p.id] = { liked: !!p.isLiked, count: p.jumlahLike ?? 0 };
        });
        likesRef.current = nextLikes;
        setLikes(nextLikes);
      }

      setHasMore(response.meta.halamanSekarang < response.meta.totalHalaman);
      setPage(pageNum);
      setIsError(false);
    } catch (error) {
      console.error(error);
      if (postsRef.current.length === 0) {
        setIsError(true);
        if (shouldRefresh) {
          showNotification("Koneksi Sedang Istirahat", "Belum bisa memuat kabar komunitas saat ini. Pastikan koneksimu aktif lalu coba lagi ya!", "error");
        }
      } else {
        setIsError(false);
        if (shouldRefresh) {
          showNotification("Koneksi Kurang Stabil", "Menampilkan postingan komunitas tersimpan.", "info");
        }
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [activeTab, debouncedSearch, userFilter, showNotification]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPosts(1, false);
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchPosts]);

  const [postToDelete, setPostToDelete] = useState<number | null>(null);
  const [isDeletingPost, setIsDeletingPost] = useState(false);

  const handleDeletePost = useCallback((postId: number) => {
    setPostToDelete(postId);
  }, []);

  const confirmDeletePost = async () => {
    if (!postToDelete) return;
    const idToDelete = postToDelete;
    setPostToDelete(null);
    setIsDeletingPost(true);

    // Optimistic UI: remove immediately from list with haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const previousPosts = [...postsRef.current];
    const filtered = previousPosts.filter((p) => p.id !== idToDelete);
    postsRef.current = filtered;
    setPosts(filtered);

    try {
      await deleteCommunityPost(idToDelete);
      showNotification("Berhasil", "Postingan berhasil dihapus.", "success");
    } catch (err: any) {
      postsRef.current = previousPosts;
      setPosts(previousPosts);
      showNotification(
        "Gagal",
        err.response?.data?.message || "Gagal menghapus postingan.",
        "error"
      );
    } finally {
      setIsDeletingPost(false);
    }
  };

  const handleLike = useCallback(async (postId: number) => {
    if (likingPostIdsRef.current.has(postId)) {
      return;
    }
    likingPostIdsRef.current.add(postId);

    const current = likesRef.current[postId] || { liked: false, count: 0 };
    const optimisticLiked = !current.liked;
    const optimisticCount = current.liked ? Math.max(0, current.count - 1) : current.count + 1;
    const optimisticState = { liked: optimisticLiked, count: optimisticCount };

    likesRef.current[postId] = optimisticState;
    setLikes((prev) => ({
      ...prev,
      [postId]: optimisticState,
    }));

    try {
      const result = await toggleCommunityLike(postId);
      const resolvedState = { liked: result.liked, count: result.jumlahLike };
      likesRef.current[postId] = resolvedState;
      setLikes((prev) => ({
        ...prev,
        [postId]: resolvedState,
      }));
    } catch (e: any) {
      if (e?.response?.status === 409) {
        // Silent handle: status 409 Conflict diabaikan dan jangan me-revert state optimistic UI
      } else {
        console.error("Like toggle error:", e);
        likesRef.current[postId] = current;
        setLikes((prev) => ({
          ...prev,
          [postId]: current,
        }));
      }
    } finally {
      likingPostIdsRef.current.delete(postId);
    }
  }, []);

  const handleOpenProfile = useCallback((item: any) => {
    const uname = item.username || item.author?.username || item.user_username;
    const uid = item.author?.id || item.userId;
    const targetParam = uname || (uid ? String(uid) : "");
    if (!targetParam) return;
    router.push({
      pathname: "/profil-pengguna",
      params: {
        username: targetParam,
        userId: uid ? String(uid) : undefined,
        nama: item.author?.nama || item.user_nama || "",
        avatarUrl: item.author?.avatarUrl || item.userAvatar || "",
      },
    } as any);
  }, []);

  const handleOpenDetail = useCallback((item: any) => {
    router.push({
      pathname: "/detail-komunitas",
      params: {
        id: item.id,
        initialData: JSON.stringify(item),
      },
    } as any);
  }, []);

  const handlePickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.6,
    });
    if (!result.canceled) {
      setFoto(result.assets[0]);
      if (modalErrorText) setModalErrorText(null);
    }
  };

  const handleSubmitPost = async () => {
    if (isSubmitting) return;

    const cleanDeskripsi = deskripsi.trim();
    const cleanJudul = judul.trim();
    const cleanLokasi = lokasiNama.trim();

    if (!cleanDeskripsi) {
      setModalErrorText("Konten postingan tidak boleh kosong.");
      return;
    }
    setModalErrorText(null);
    setIsSubmitting(true);
    try {
      const formData = new FormData();

      formData.append("deskripsi", cleanDeskripsi);
      formData.append("tipe", tipePost);
      if (cleanJudul) formData.append("judul", cleanJudul);
      if (cleanLokasi) formData.append("lokasiNama", cleanLokasi);
      if (lokasiLat !== null) formData.append("latitude", lokasiLat.toString());
      if (lokasiLng !== null) formData.append("longitude", lokasiLng.toString());

      if (foto) {
        formData.append("foto", {
          uri: foto.uri,
          name: "photo.jpg",
          type: "image/jpeg",
        } as any);
      }

      await createCommunityPost(formData);
      showNotification("Berhasil!", "Postingan kamu berhasil dibagikan!", "success");
      setIsModalVisible(false);
      setModalErrorText(null);
      setJudul("");
      setLokasiNama("");
      setLokasiLat(null);
      setLokasiLng(null);
      setDeskripsi("");
      setFoto(null);

      fetchPosts(1, true); // Refresh feed
    } catch (e: any) {
      console.error(e);
      const errMsg = e.response?.data?.message || "Gagal mengunggah postingan, silakan coba lagi.";
      setModalErrorText(errMsg);
      showNotification(
        "Gagal Mengunggah",
        errMsg,
        "error",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRefresh = async () => {
    clearInFlightRequests();
    setIsError(false);
    await fetchPosts(1, true);
  };

  const handleLoadMore = () => {
    if (!isLoading && !isRefreshing && hasMore) {
      fetchPosts(page + 1, false);
    }
  };

  const renderPostItem = useCallback(({ item }: { item: any }) => (
    <PostCardItem
      item={item}
      currentUser={currentUser}
      isLiked={!!likes[item.id]?.liked}
      likeCount={likes[item.id]?.count ?? 0}
      onLike={handleLike}
      onDelete={handleDeletePost}
      onOpenDetail={handleOpenDetail}
      onOpenProfile={handleOpenProfile}
    />
  ), [currentUser, likes, handleLike, handleDeletePost, handleOpenDetail, handleOpenProfile]);

  if (isError && posts.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ErrorState onRetry={handleRefresh} isRetrying={isRefreshing} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Komunitas</Text>
          <Text style={styles.headerSubtitle}>
            Tempat nongkrongnya petani digital
          </Text>
          
          <View style={{ flexDirection: "row", marginTop: 16, marginBottom: 12, gap: 12 }}>
            <View style={{ flex: 1, height: 52, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', paddingHorizontal: 16, borderRadius: 20, borderWidth: 0, shadowColor: "#123924", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.05, shadowRadius: 14, elevation: 4 }}>
              <MaterialIcons name="search" size={24} color="#5C5A4F" />
              <TextInput style={{ flex: 1, marginLeft: 8, height: '100%', fontFamily: 'Nunito_700Bold', fontSize: 16, color: '#123924', paddingVertical: 0 }} placeholder="Cari username, lokasi..." placeholderTextColor="#5C5A4F" value={searchQuery} onChangeText={setSearchQuery} maxLength={100} />
            </View>
            <Pressable onPress={() => setIsFilterModalVisible(true)} style={({ pressed }) => [{ backgroundColor: '#FFFFFF', width: 52, height: 52, borderRadius: 20, alignItems: 'center', justifyContent: 'center', shadowColor: "#123924", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.05, shadowRadius: 14, elevation: 4 }, pressed && { opacity: 0.7 }]}>
              <MaterialIcons name="tune" size={24} color="#123924" />
            </Pressable>
          </View>

          {/* Segmented Control: Nasional vs Terdekat */}
          <View style={styles.segmentedContainer}>
            <Pressable
              onPress={() => {
                if (activeTab !== "terbaru") {
                  setIsGpsFallback(false);
                  setActiveTab("terbaru");
                }
              }}
              style={[
                styles.segmentTab,
                activeTab === "terbaru" && styles.segmentTabActive,
              ]}
            >
              <MaterialIcons
                name="public"
                size={18}
                color={activeTab === "terbaru" ? "#FFFFFF" : "#5C5A4F"}
                style={{ marginRight: 6 }}
              />
              <Text
                style={[
                  styles.segmentText,
                  activeTab === "terbaru" && styles.segmentTextActive,
                ]}
              >
                Nasional (Terbaru)
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                if (activeTab !== "terdekat") {
                  setActiveTab("terdekat");
                }
              }}
              style={[
                styles.segmentTab,
                activeTab === "terdekat" && styles.segmentTabActive,
              ]}
            >
              <MaterialIcons
                name="near-me"
                size={18}
                color={activeTab === "terdekat" ? "#FFFFFF" : "#5C5A4F"}
                style={{ marginRight: 6 }}
              />
              <Text
                style={[
                  styles.segmentText,
                  activeTab === "terdekat" && styles.segmentTextActive,
                ]}
              >
                Terdekat (2 KM)
              </Text>
            </Pressable>
          </View>
        </View>

        {activeTab === "terdekat" && isGpsFallback && (
          <View style={styles.gpsBanner}>
            <MaterialIcons name="location-off" size={18} color="#2D5A27" style={{ marginRight: 8 }} />
            <Text style={styles.gpsBannerText}>
              GPS perangkat sedang tidak aktif. Menampilkan komunitas di sekitar lokasi kebun tersimpanmu.
            </Text>
          </View>
        )}

        <FlatList
          data={posts}
          keyExtractor={(item, index) => item.id ? `${item.id}-${index}` : index.toString()}
          contentContainerStyle={styles.scrollContent}
          initialNumToRender={6}
          maxToRenderPerBatch={6}
          windowSize={7}
          removeClippedSubviews={Platform.OS === 'android'}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={["#3FA86B"]}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={
            isLoading ? (
              <View style={{ paddingVertical: 12 }}>
                <PostSkeleton />
                <PostSkeleton />
                <PostSkeleton />
              </View>
            ) : (
              <EmptyHint
                icon="groups"
                title="Postingan tidak ditemukan"
                subtitle="Coba cari dengan kata kunci lain."
              />
            )
          }
          renderItem={renderPostItem}
        />
      </View>

      <Pressable
        style={({ pressed }) => [styles.fab, pressed && { opacity: 0.8 }]}
        onPress={() => {
          setModalErrorText(null);
          setIsModalVisible(true);
        }}
      >
        <MaterialIcons name="add" size={28} color="#FFFFFF" />
      </Pressable>

      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        statusBarTranslucent={true}
        onRequestClose={() => {
          if (!isSubmitting) {
            setModalErrorText(null);
            setIsModalVisible(false);
          }
        }}
      >
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end' }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          <View style={styles.modalContent}>
            <View style={styles.modalDragIndicator} />
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Mau bahas apa?</Text>
                <Text style={styles.modalSubtitle}>
                  Bagikan ceritamu ke petani lain!
                </Text>
              </View>
              <Pressable
                style={({ pressed }) => [
                  styles.clayCloseButton,
                  pressed && styles.clayPressed,
                ]}
                onPress={() => {
                  if (!isSubmitting) {
                    setModalErrorText(null);
                    setIsModalVisible(false);
                  }
                }}
              >
                <MaterialIcons name="close" size={20} color="#123924" />
              </Pressable>
            </View>

            {/* Inline Alert Banner Neoclay */}
            {!!modalErrorText && (
              <View style={styles.modalInlineAlert}>
                <MaterialIcons name="error-outline" size={18} color="#D32F2F" style={{ marginRight: 8 }} />
                <Text style={styles.modalInlineAlertText}>{modalErrorText}</Text>
              </View>
            )}

            {/* 2. FOTO UPLOAD AREA */}
            {!foto ? (
              <Pressable
                style={({ pressed }) => [
                  styles.clayPhotoUpload,
                  pressed && styles.clayPressed,
                ]}
                onPress={handlePickImage}
              >
                <MaterialIcons name="camera-alt" size={32} color="#123924" style={{ marginBottom: 8 }} />
                <Text style={styles.clayPhotoText}>
                  Tambahin foto biar makin asik!
                </Text>
              </Pressable>
            ) : (
              <View style={styles.clayPreviewContainer}>
                <Image source={{ uri: foto.uri }} style={styles.clayPreviewImage} contentFit="cover" cachePolicy="memory-disk" />
                <Pressable
                  style={({ pressed }) => [
                    styles.clayRemovePhoto,
                    pressed && styles.clayPressed,
                  ]}
                  onPress={() => setFoto(null)}
                >
                  <MaterialIcons name="close" size={16} color="#123924" />
                </Pressable>
              </View>
            )}

            {/* 3. TIPE POSTINGAN */}
            <Text style={styles.clayLabel}>Tipe Postingan *</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 20 }}>
              {["PROGRESS", "TANYA", "PANEN"].map(type => (
                <Pressable
                  key={type}
                  onPress={() => setTipePost(type)}
                  style={{
                    flex: 1,
                    paddingVertical: 10,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: tipePost === type ? "#3FA86B" : "#E8E5DA",
                    backgroundColor: tipePost === type ? "#E8F5E9" : "#FFFFFF",
                    alignItems: "center"
                  }}
                >
                  <Text style={{ fontFamily: "Nunito_700Bold", color: tipePost === type ? "#123924" : "#5C5A4F", fontSize: 14 }}>
                    {type === "PROGRESS" ? "Update" : type === "TANYA" ? "Tanya" : "Panen"}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* 4. JUDUL POSTINGAN */}
            <Text style={styles.clayLabel}>Judul Postingan *</Text>
            <View style={{ marginBottom: 20 }}>
              <TextInput
                style={styles.clayInput}
                placeholder="Misal: Panen Tomat Hari Ini!"
                placeholderTextColor="#5C5A4F"
                value={judul}
                onChangeText={setJudul}
                maxLength={100}
              />
            </View>
            {/* 4. CERITA / DESKRIPSI */}
            <Text style={styles.clayLabel}>Cerita / Deskripsi *</Text>
            <View style={{ marginBottom: 20 }}>
              <TextInput
                style={[styles.clayInput, { minHeight: 100, textAlignVertical: "top" }]}
                multiline
                placeholder="Ceritakan progres panenmu, atau ketik # untuk tagar..."
                placeholderTextColor="#5C5A4F"
                value={deskripsi}
                onChangeText={(text) => {
                  setDeskripsi(text);
                  if (modalErrorText) setModalErrorText(null);
                }}
                onSelectionChange={(e) => setCursorPos(e.nativeEvent.selection)}
                maxLength={500}
              />
              <Text style={styles.clayCounterText}>{deskripsi.length}/500</Text>
            </View>

            {activeTagQuery && (
              <View style={{ backgroundColor: "#FFFFFF", borderRadius: 16, padding: 8, marginBottom: 20, shadowColor: "#123924", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 14, elevation: 4 }}>
                {tagSuggestions.length > 0 ? tagSuggestions.map(t => (
                  <Pressable key={t.tag} onPress={() => {
                    const before = deskripsi.substring(0, cursorPos.start - activeTagQuery.length);
                    const after = deskripsi.substring(cursorPos.start);
                    setDeskripsi(before + t.tag + " " + after);
                  }} style={({pressed}) => [{ padding: 12, borderBottomWidth: 1, borderBottomColor: "#F4F6F0", flexDirection: "row", justifyContent: "space-between" }, pressed && { backgroundColor: "#F4F6F0" }]}>
                    <Text style={{ fontFamily: "Nunito_700Bold", color: "#123924" }}>{t.tag}</Text>
                    <Text style={{ fontFamily: "Nunito_500Medium", color: "#5C5A4F" }}>{t.count} postingan</Text>
                  </Pressable>
                )) : (
                  <Pressable onPress={() => {
                    const before = deskripsi.substring(0, cursorPos.start - activeTagQuery.length);
                    const after = deskripsi.substring(cursorPos.start);
                    setDeskripsi(before + tagMatch?.[1] + " " + after);
                  }} style={({pressed}) => [{ padding: 12, flexDirection: "row", justifyContent: "space-between" }, pressed && { backgroundColor: "#F4F6F0" }]}>
                    <Text style={{ fontFamily: "Nunito_700Bold", color: "#123924" }}>{tagMatch?.[1]}</Text>
                    <Text style={{ fontFamily: "Nunito_500Medium", color: "#5C5A4F" }}>Tambah tagar baru</Text>
                  </Pressable>
                )}
              </View>
            )}
            {/* 5. LOKASI / DAERAH */}
            <Text style={[styles.clayLabel, { zIndex: -1 }]}>Lokasi / Daerah (Opsional)</Text>
            <View style={{ marginBottom: 24, zIndex: 50, position: 'relative' }}>
              <View style={styles.clayLocationInputContainer}>
                <MaterialIcons name="place" size={20} color="#123924" style={{ marginRight: 8 }} />
                <TextInput
                  style={{ flex: 1, fontFamily: "Nunito_700Bold", fontSize: 16, color: "#123924" }}
                  placeholder="Ketik lokasimu..."
                  placeholderTextColor="#5C5A4F"
                  value={lokasiNama}
                  onChangeText={handleLocationChange}
                  maxLength={80}
                  onFocus={() => {
                    if (lokasiNama && filteredCities.length === 0) {
                      handleLocationChange(lokasiNama);
                    } else if (filteredCities.length > 0) {
                      setShowDropdown(true);
                    }
                  }}
                />
                {lokasiNama.length > 0 && (
                  <Pressable
                    style={({ pressed }) => [
                      {
                        width: 24,
                        height: 24,
                        borderRadius: 12,
                        backgroundColor: "#123924",
                        alignItems: "center",
                        justifyContent: "center",
                      },
                      pressed && { opacity: 0.7 }
                    ]}
                    onPress={() => {
                      setLokasiNama("");
                      setShowDropdown(false);
                    }}
                  >
                    <MaterialIcons name="close" size={14} color="#FFFFFF" />
                  </Pressable>
                )}
              </View>

              {/* Autocomplete Dropdown */}
              {showDropdown && filteredCities.length > 0 && (
                <View style={{
                  position: 'absolute',
                  top: 60,
                  left: 0,
                  right: 0,
                  backgroundColor: '#FFFFFF',
                  borderRadius: 16,
                  maxHeight: 150,
                  shadowColor: "#123924", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 14, elevation: 4,
                  zIndex: 99
                }}>
                  <View style={{ borderRadius: 16, overflow: 'hidden', flex: 1 }}>
                    <ScrollView nestedScrollEnabled keyboardShouldPersistTaps="handled">
                    {filteredCities.map((city, index) => (
                      <Pressable
                        key={city.name}
                        style={({ pressed }) => [
                          {
                            paddingVertical: 12,
                            paddingHorizontal: 16,
                            borderBottomWidth: index < filteredCities.length - 1 ? 1 : 0,
                            borderBottomColor: "#E8E5DA",
                            backgroundColor: pressed ? "#F4F6F0" : "#FFFFFF"
                          }
                        ]}
                        onPress={() => {
                          setLokasiNama(city.name);
                          setLokasiLat(city.lat);
                          setLokasiLng(city.lng);
                          setShowDropdown(false);
                        }}
                      >
                        <Text style={{ fontFamily: "Nunito_700Bold", color: "#123924", fontSize: 16 }}>{city.name}</Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                  </View>
                </View>
              )}
            </View>

            {/* 8. SUBMIT BUTTON */}
            <Pressable
              style={({ pressed }) => [
                styles.claySubmitBtn,
                pressed && styles.clayPressed,
              ]}
              onPress={handleSubmitPost}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#123924" />
              ) : (
                <Text style={styles.claySubmitText}>Kirim Sekarang</Text>
              )}
            </Pressable>

          </View>
          </ScrollView>
        </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* FILTER MODAL */}
      <Modal visible={isFilterModalVisible} transparent={true} animationType="fade" onRequestClose={() => setIsFilterModalVisible(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: '#FBF8F0', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, paddingBottom: 40 }}>
            <View style={{ width: 48, height: 6, backgroundColor: '#bdcabd', borderRadius: 3, alignSelf: 'center', marginBottom: 24 }} />
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <Text style={{ fontFamily: 'Nunito_800ExtraBold', fontSize: 20, color: '#123924' }}>Filter Postingan</Text>
              <Pressable onPress={() => setIsFilterModalVisible(false)} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#E8E5DA', alignItems: 'center', justifyContent: 'center' }}>
                <MaterialIcons name="close" size={20} color="#123924" />
              </Pressable>
            </View>

            <Text style={{ fontFamily: 'Nunito_800ExtraBold', color: '#123924', marginBottom: 12, fontSize: 14 }}>Tampilkan</Text>
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
              <Pressable onPress={() => setUserFilter('semua')} style={[{ flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 24 }, userFilter === 'semua' ? { backgroundColor: '#3FA86B' } : { backgroundColor: '#FFFFFF' }]}>
                <Text style={{ fontFamily: 'Nunito_800ExtraBold', color: userFilter === 'semua' ? '#FFFFFF' : '#123924' }}>Semua Orang</Text>
              </Pressable>
              <Pressable onPress={() => setUserFilter('saya')} style={[{ flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 24 }, userFilter === 'saya' ? { backgroundColor: '#3FA86B' } : { backgroundColor: '#FFFFFF' }]}>
                <Text style={{ fontFamily: 'Nunito_800ExtraBold', color: userFilter === 'saya' ? '#FFFFFF' : '#123924' }}>Postingan Saya</Text>
              </Pressable>
            </View>

            <Pressable onPress={() => { setIsFilterModalVisible(false); fetchPosts(1, true); }} style={{ backgroundColor: '#123924', paddingVertical: 16, borderRadius: 24, alignItems: 'center', marginTop: 12 }}>
              <Text style={{ fontFamily: 'Nunito_800ExtraBold', color: '#FFFFFF', fontSize: 16 }}>Terapkan Filter</Text>
            </Pressable>

          </View>
        </View>
      </Modal>

      {/* MODAL KONFIRMASI HAPUS POSTINGAN */}
      <Modal
        visible={!!postToDelete}
        animationType="fade"
        transparent
        onRequestClose={() => setPostToDelete(null)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(18, 57, 36, 0.4)', justifyContent: 'center', padding: 24 }}>
          <View style={{ backgroundColor: '#FBF8F0', borderRadius: 24, padding: 24, borderWidth: 0, shadowColor: "#123924", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 14, elevation: 4, alignItems: 'center' }}>
            <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: '#FFECEB', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <MaterialIcons name="delete-outline" size={26} color="#FF6B5C" />
            </View>
            <Text style={{ fontFamily: 'Nunito_800ExtraBold', fontSize: 20, color: '#123924', textAlign: 'center', marginBottom: 8 }}>Hapus Postingan?</Text>
            <Text style={{ fontFamily: 'Nunito_500Medium', fontSize: 14, color: '#5C5A4F', textAlign: 'center', marginBottom: 24, lineHeight: 20 }}>
              Apakah kamu yakin ingin menghapus postingan ini? Tindakan ini tidak dapat dibatalkan.
            </Text>
            <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
              <Pressable
                style={({ pressed }) => [
                  { flex: 1, paddingVertical: 14, borderRadius: 16, backgroundColor: '#E8E5DA', alignItems: 'center' },
                  pressed && { opacity: 0.8 }
                ]}
                onPress={() => setPostToDelete(null)}
              >
                <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: 15, color: '#123924' }}>Batal</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  { flex: 1, paddingVertical: 14, borderRadius: 16, backgroundColor: '#FF6B5C', alignItems: 'center' },
                  pressed && { opacity: 0.8 }
                ]}
                onPress={confirmDeletePost}
                disabled={isDeletingPost}
              >
                {isDeletingPost ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={{ fontFamily: 'Nunito_800ExtraBold', fontSize: 15, color: '#FFFFFF' }}>Hapus</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FBF8F0" },
  container: { flex: 1 },
  segmentedContainer: {
    flexDirection: "row",
    backgroundColor: "#EDE9DF",
    borderRadius: 16,
    padding: 4,
    marginBottom: 4,
    gap: 4,
  },
  segmentTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 12,
  },
  segmentTabActive: {
    backgroundColor: "#3FA86B",
    shadowColor: "#123924",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  segmentText: {
    fontFamily: "Nunito_700Bold",
    fontSize: 13,
    color: "#5C5A4F",
  },
  segmentTextActive: {
    fontFamily: "Nunito_800ExtraBold",
    color: "#FFFFFF",
  },
  scrollContent: {
    paddingBottom: 140,
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 16,
  },
  header: { paddingHorizontal: 20, paddingTop: 24 },
  headerTitle: {
    fontSize: 32,
    fontFamily: "Nunito_800ExtraBold",
    color: "#123924",
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: "Nunito_500Medium",
    color: "#5C5A4F",
    marginTop: 4,
  },
  postCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    borderWidth: 0,
    padding: 16,
    shadowColor: "#123924",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#3FA86B",
    alignItems: "center",
    justifyContent: "center",
  },
  fab: {
    position: "absolute",
    bottom: 110,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#123924",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#123924",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(18, 57, 36, 0.4)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FBF8F0",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: 40,
    borderWidth: 0,
    shadowColor: "#123924",
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 16,
  },
  modalDragIndicator: {
    width: 48,
    height: 6,
    backgroundColor: "#bdcabd",
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 24,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: "Nunito_800ExtraBold",
    color: "#123924",
  },
  modalSubtitle: {
    fontSize: 14,
    fontFamily: "Nunito_500Medium",
    color: "#5C5A4F",
    marginTop: 2,
  },
  clayPressed: {
    transform: [{ scale: 0.98 }],
    shadowColor: "#123924",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  clayCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FBF8F0",
    alignItems: "center",
    justifyContent: "center",
  },
  clayPhotoUpload: {
    borderWidth: 2,
    borderColor: "#bdcabd",
    borderStyle: "dashed",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#123924", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 14, elevation: 4,
  },
  clayPhotoText: {
    fontFamily: "Nunito_700Bold",
    fontSize: 16,
    color: "#123924",
  },
  clayPreviewContainer: {
    width: "100%",
    height: 200,
    borderRadius: 16,
    borderWidth: 0,
    marginBottom: 20,
    overflow: "hidden",
    shadowColor: "#123924", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 14, elevation: 4,
  },
  clayPreviewImage: { width: "100%", height: "100%" },
  clayRemovePhoto: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FF6B5C",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#123924", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 14, elevation: 4,
  },
  clayLabel: {
    fontFamily: "Nunito_800ExtraBold",
    color: "#123924",
    marginBottom: 8,
    fontSize: 14,
  },
  clayChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 100,
    backgroundColor: "#FFFFFF",
    shadowColor: "#123924", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 14, elevation: 4,
  },
  clayChipActive: { backgroundColor: "#3FA86B" },
  clayChipText: { fontSize: 14, fontFamily: "Nunito_700Bold", color: "#123924" },
  clayChipTextActive: { color: "#FFFFFF" },
  clayInput: {
    fontFamily: "Nunito_500Medium",
    fontSize: 16,
    color: "#123924",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    shadowColor: "#123924", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 14, elevation: 4,
  },
  clayCounterText: {
    fontFamily: "Nunito_700Bold",
    fontSize: 12,
    color: "#5C5A4F",
    textAlign: "right",
    marginTop: 8,
  },
  clayTagChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    shadowColor: "#123924", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 14, elevation: 4,
  },
  clayTagText: {
    fontFamily: "Nunito_700Bold",
    color: "#123924",
    fontSize: 14,
  },
  clayLocationInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 100,
    paddingHorizontal: 16,
    height: 52,
    shadowColor: "#123924", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 14, elevation: 4,
  },
  clayLocationInput: {
    flex: 1,
    fontFamily: "Nunito_700Bold",
    fontSize: 16,
    color: "#123924",
  },
  clayLocationClear: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#E8E5DA",
    alignItems: "center",
    justifyContent: "center",
  },
  claySubmitBtn: {
    backgroundColor: "#3FA86B",
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#123924", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 14, elevation: 4,
  },
  claySubmitText: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 16,
    color: "#FFFFFF",
  },
  modalInlineAlert: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFECEB",
    borderWidth: 1,
    borderColor: "#FF6B5C",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 20,
  },
  modalInlineAlertText: {
    flex: 1,
    fontFamily: "Nunito_600SemiBold",
    fontSize: 13,
    color: "#D32F2F",
    lineHeight: 18,
  },
  gpsBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5E9",
    borderWidth: 1,
    borderColor: "#C8E6C9",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 8,
    marginBottom: 12,
  },
  gpsBannerText: {
    flex: 1,
    fontFamily: "Nunito_600SemiBold",
    fontSize: 12,
    color: "#2D5A27",
    lineHeight: 18,
  },
});
