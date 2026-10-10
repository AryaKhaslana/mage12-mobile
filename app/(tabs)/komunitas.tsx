import {
  useCallback,
  useEffect,
  useRef,
  useState
} from "react";
import {
  KeyboardAvoidingView,
  ScrollView, Platform,
  ActivityIndicator,
  Animated,
  FlatList,
  Image,
  Alert, Modal,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
  Share,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router, useFocusEffect } from "expo-router";
import * as SecureStore from "expo-secure-store";
import {
  createCommunityPost,
  getCommunityPosts, getMyCommunityPosts, toggleCommunityLike, deleteCommunityPost
} from "../../services/api";

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

import { useNotification } from "../../components/NotificationContext";

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

const DUMMY_POSTS: PostType[] = [
  {
    id: "1",
    authorName: "Budi Santoso",
    streak: 12,
    timeText: "2 jam yang lalu",
    avatarUrl: "",
    postImageUrl:
      "https://images.unsplash.com/photo-1592424001806-0361361c4627?auto=format&fit=crop&w=800&q=80",
    tipe: "UPDATE",
    judul: "Panen Tomat Pertama!",
    isi: "Alhamdulillah setelah 3 bulan akhirnya tomat yang ditanam di halaman belakang bisa dipanen. Rasanya manis banget!",
    lokasiNama: "Surabaya",
    tags: "Tomat, Panen",
  },
  {
    id: "2",
    authorName: "Siti Rahma",
    streak: 5,
    timeText: "5 jam yang lalu",
    avatarUrl: "",
    tipe: "TANYA",
    judul: "Daun Menguning, Kenapa Ya?",
    isi: "Halo semua, ada yang tau kenapa daun tanaman cabai saya tiba-tiba menguning dan rontok? Padahal rutin disiram.",
    lokasiNama: "Sidoarjo",
    tags: "Cabai, Hama",
  },
  {
    id: "3",
    authorName: "Agus Pratama",
    streak: 20,
    timeText: "1 hari yang lalu",
    avatarUrl: "",
    postImageUrl:
      "https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?auto=format&fit=crop&w=800&q=80",
    tipe: "BARTER",
    judul: "Barter Bibit Kangkung",
    isi: "Saya punya kelebihan bibit kangkung nih, ada yang mau barter sama bibit bayam cabut?",
    lokasiNama: "Jakarta",
    tags: "Bibit, Barter",
  },
  {
    id: "4",
    authorName: "Dewi Lestari",
    streak: 8,
    timeText: "2 hari yang lalu",
    avatarUrl: "",
    tipe: "DONASI",
    judul: "Berbagi Pupuk Kompos",
    isi: "Saya bikin pupuk kompos sendiri dan lumayan banyak sisanya. Buat yang di sekitar Malang, boleh ambil gratis ke rumah ya.",
    lokasiNama: "Malang",
    tags: "Pupuk, Gratis",
  },
  {
    id: "5",
    authorName: "Rudi Heryanto",
    streak: 15,
    timeText: "3 hari yang lalu",
    avatarUrl: "",
    postImageUrl:
      "https://images.unsplash.com/photo-1622383563227-04401ab4e5ea?auto=format&fit=crop&w=800&q=80",
    tipe: "UPDATE",
    judul: "Sistem Hidroponik Sederhana",
    isi: "Baru selesai setup hidroponik pakai pipa bekas. Semoga lancar tanam seladanya!",
    lokasiNama: "Bandung",
    tags: "Hidroponik, Selada",
  },
];

const PostSkeleton = () => {
  const fadeAnim = useRef(new Animated.Value(0.3)).current;
  useEffect(() => {
    Animated.loop(
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
    ).start();
  }, []);
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

export default function KomunitasScreen() {
  const { showNotification } = useNotification();

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const [posts, setPosts] = useState<any[]>([]);
  const [likes, setLikes] = useState<Record<number, { liked: boolean; count: number }>>({});
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isError, setIsError] = useState(false);
  const [activeTab, setActiveTab] = useState<"terbaru" | "terdekat">("terbaru");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [userFilter, setUserFilter] = useState<"semua" | "saya">("semua");


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

  const fetchPosts = async (pageNum = 1, shouldRefresh = false) => {
    try {
      setIsError(false);
      if (shouldRefresh) setIsRefreshing(true);
      const userDataStr = await SecureStore.getItemAsync("userData");
      if (userDataStr) {
        setCurrentUser(JSON.parse(userDataStr));
      }
      let lat = undefined;
      let lng = undefined;

      if (activeTab === "terdekat" && userDataStr) {
        const user = JSON.parse(userDataStr);
        if (user.latitude && user.longitude) {
          lat = user.latitude;
          lng = user.longitude;
        } else {
          showNotification(
            "Lokasi Kosong",
            "Lengkapi lokasi di profil dulu broskie!",
            "error",
          );
          setIsLoading(false);
          setIsRefreshing(false);
          return;
        }
      }

      let response;
      if (userFilter === "saya") {
        response = await getMyCommunityPosts(pageNum, 10);
      } else {
        response = await getCommunityPosts(lat, lng, pageNum, 10, debouncedSearch);
      }

      const newPosts = response.data;
      if (shouldRefresh || pageNum === 1) {
        setPosts(newPosts);
        const newLikes: Record<number, { liked: boolean; count: number }> = {};
        newPosts.forEach((p: any) => {
          newLikes[p.id] = { liked: !!p.isLiked, count: p.jumlahLike ?? 0 };
        });
        setLikes(newLikes);
      } else {
        setPosts((prev) => [...prev, ...newPosts]);
        setLikes((prev) => {
          const next = { ...prev };
          newPosts.forEach((p: any) => {
            next[p.id] = { liked: !!p.isLiked, count: p.jumlahLike ?? 0 };
          });
          return next;
        });
      }

      setHasMore(response.meta.halamanSekarang < response.meta.totalHalaman);
      setPage(pageNum);
    } catch (error) {
      console.error(error);
      setIsError(true);
      showNotification("Error", "Gagal memuat feed", "error");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    fetchPosts(1, false);
  }, [activeTab, debouncedSearch, userFilter]);

  const handleDeletePost = (postId: number) => {
    Alert.alert(
      "Hapus Postingan",
      "Yakin mau hapus postingan ini? Nggak bisa dikembalikan lho.",
      [
        { text: "Batal", style: "cancel" },
        { 
          text: "Hapus", 
          style: "destructive",
          onPress: async () => {
            try {
              await deleteCommunityPost(postId);
              showNotification("Berhasil", "Postingan dihapus.", "success");
              fetchPosts(1, true);
            } catch (e: any) {
              showNotification("Gagal", "Gagal hapus postingan", "error");
            }
          }
        }
      ]
    );
  };

  const handleLike = async (postId: number) => {
    try {
      setLikes((prev) => {
        const curr = prev[postId] || { liked: false, count: 0 };
        return {
          ...prev,
          [postId]: {
            liked: !curr.liked,
            count: curr.liked ? Math.max(0, curr.count - 1) : curr.count + 1,
          },
        };
      });
      const result = await toggleCommunityLike(postId);
      setLikes((prev) => ({
        ...prev,
        [postId]: { liked: result.liked, count: result.jumlahLike },
      }));
    } catch (e) {
      console.error(e);
    }
  };

  const handlePickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled) {
      setFoto(result.assets[0]);
    }
  };

  const handleSubmitPost = async () => {
    if (!deskripsi.trim()) {
      showNotification("Error", "Isi belum diisi broskie", "error");
      return;
    }
    setIsSubmitting(true);
    try {
      const formData = new FormData();

      formData.append("deskripsi", deskripsi);
      formData.append("tipe", tipePost);
      if (judul) formData.append("judul", judul);
      if (lokasiNama) formData.append("lokasiNama", lokasiNama);
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
      showNotification("Mantap!", "Berhasil posting broskie!", "success");
      setIsModalVisible(false);
      setJudul("");
      setLokasiNama("");
      setLokasiLat(null);
      setLokasiLng(null);
      setDeskripsi("");
      setFoto(null);

      fetchPosts(1, true); // Refresh feed
    } catch (e: any) {
      console.error(e);
      showNotification(
        "Gagal",
        e.response?.data?.message || "Gagal posting",
        "error",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRefresh = async () => {
    await fetchPosts(1, true);
  };

  const handleLoadMore = () => {
    if (!isLoading && !isRefreshing && hasMore) {
      fetchPosts(page + 1, false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Komunitas</Text>
          <Text style={styles.headerSubtitle}>
            Tempat nongkrongnya petani digital 🌱
          </Text>
          
          <View style={{ flexDirection: "row", marginTop: 16, marginBottom: 20, gap: 12 }}>
            <View style={{ flex: 1, height: 52, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', paddingHorizontal: 16, borderRadius: 20, borderWidth: 0, shadowColor: "#123924", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.05, shadowRadius: 14, elevation: 4 }}>
              <MaterialIcons name="search" size={24} color="#5C5A4F" />
              <TextInput style={{ flex: 1, marginLeft: 8, height: '100%', fontFamily: 'Nunito_700Bold', fontSize: 16, color: '#123924', paddingVertical: 0 }} placeholder="Cari username, lokasi..." placeholderTextColor="#5C5A4F" value={searchQuery} onChangeText={setSearchQuery} />
            </View>
            <Pressable onPress={() => setIsFilterModalVisible(true)} style={({ pressed }) => [{ backgroundColor: '#FFFFFF', width: 52, height: 52, borderRadius: 20, alignItems: 'center', justifyContent: 'center', shadowColor: "#123924", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.05, shadowRadius: 14, elevation: 4 }, pressed && { opacity: 0.7 }]}>
              <MaterialIcons name="tune" size={24} color="#123924" />
            </Pressable>
          </View>
        </View>

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
              <View style={{ paddingVertical: 40, alignItems: "center" }}>
                <ActivityIndicator size="large" color="#3FA86B" />
                <Text style={{ marginTop: 12, fontFamily: "Nunito_500Medium", color: "#5C5A4F" }}>Memuat postingan...</Text>
              </View>
            ) : isError ? (
              <EmptyHint
                icon="wifi-off"
                title="Tidak ada koneksi internet"
                subtitle="Periksa koneksi internetmu lalu coba lagi."
                ctaText="Coba Lagi"
                onCtaPress={handleRefresh}
              />
            ) : (
              <EmptyHint
                icon="groups"
                title="Postingan tidak ditemukan"
                subtitle="Coba cari dengan kata kunci lain."
              />
            )
          }
          renderItem={({ item }: { item: any }) => {
            let badgeBg = "#E8E5DA";
            let badgeColor = "#123924";
            let labelTipe = "INFO";
            if (item.tipePost === "progress_update") {
              badgeBg = "#E8F5E9";
              badgeColor = "#3FA86B";
              labelTipe = "UPDATE";
            } else if (item.tipePost === "pertanyaan") {
              badgeBg = "#FFECEB";
              badgeColor = "#FF6B5C";
              labelTipe = "TANYA";
            } else if (item.tipePost === "panen_surplus") {
              badgeBg = "#E3F2FD";
              badgeColor = "#1E88E5";
              labelTipe = "PANEN";
            }

            return (
              <View style={styles.postCard}>
                <View style={styles.postHeader}>
                  <Pressable
                    onPress={() => {
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
                    }}
                    style={({ pressed }) => [
                      { flex: 1, flexDirection: "row", alignItems: "center", gap: 12 },
                      pressed && { opacity: 0.7 },
                    ]}
                  >
                  <View style={styles.avatarContainer}>
                    <Text
                      style={{
                        fontFamily: "Nunito_800ExtraBold",
                        color: "#FFFFFF",
                      }}
                    >
                      {(item.author?.nama || item.user_nama || "?")
                        .charAt(0)
                        .toUpperCase()}
                    </Text>
                  </View>
                  <View style={{ flex: 1, gap: 2 }}>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: "Nunito_800ExtraBold",
                          color: "#123924",
                          fontSize: 16,
                        }}
                        numberOfLines={1}
                      >
                        {item.author?.nama || item.user_nama}
                      </Text>
                      <Text
                        style={{
                          fontFamily: "Nunito_800ExtraBold",
                          fontSize: 10,
                          color: "#3FA86B",
                          backgroundColor: "#E8F5E9",
                          paddingHorizontal: 6,
                          paddingVertical: 2,
                          borderRadius: 6,
                          overflow: "hidden",
                        }}
                      >
                        #{item.lokasiNama}
                      </Text>
                    </View>
                    <Text
                      style={{
                        fontFamily: "Nunito_500Medium",
                        color: "#5C5A4F",
                        fontSize: 12,
                      }}
                    >
                      {new Date(item.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                  </Pressable>

                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <View
                      style={{
                        backgroundColor: badgeBg,
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: badgeColor,
                        shadowColor: badgeColor,
                        shadowOffset: { width: 2, height: 2 },
                        shadowOpacity: 1,
                        shadowRadius: 0,
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: "Nunito_800ExtraBold",
                          fontSize: 10,
                          color: badgeColor,
                        }}
                      >
                        {labelTipe}
                      </Text>
                    </View>
                  </View>
                </View>

                <Pressable
                  onPress={() =>
                    router.push({
                      pathname: "/detail-komunitas",
                      params: { id: item.id },
                    } as any)
                  }
                  style={({ pressed }) => [pressed && { opacity: 0.8 }]}
                >
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
                  {item.tags && (
                    <Text
                      style={{
                        fontFamily: "Nunito_700Bold",
                        color: "#3FA86B",
                        marginBottom: 12,
                      }}
                    >
                      {item.lokasiNama ? `#${item.lokasiNama}` : ""}
                    </Text>
                  )}
                  {item.fotoUrl ? (
                    <Image
                      source={{ uri: item.fotoUrl }}
                      style={{
                        width: "100%",
                        height: 200,
                        borderRadius: 12,
                        marginBottom: 12,
                        resizeMode: "cover",
                      }}
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
                    onPress={() => handleLike(item.id)}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <MaterialIcons
                      name={likes[item.id]?.liked ? "favorite" : "favorite-border"}
                      size={24}
                      color={likes[item.id]?.liked ? "#FF6B5C" : "#123924"}
                    />
                    <Text
                      style={{ fontFamily: "Nunito_700Bold", color: likes[item.id]?.liked ? "#FF6B5C" : "#123924" }}
                    >
                      {likes[item.id]?.count ?? 0}
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => router.push({ pathname: "/detail-komunitas", params: { id: item.id } } as any)}
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
                    <Text
                      style={{ fontFamily: "Nunito_700Bold", color: "#123924" }}
                    >
                      {item.jumlahKomentar ?? 0}
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={async () => {
                      try {
                        await Share.share({
                          message: `Lihat postingan ini dari ${item.author?.nama || item.user_nama || "Petani"}: ${item.judul}`,
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

                  {(item.author?.id === currentUser?.id || item.user_id === currentUser?.id || item.userId === currentUser?.id) && (
                    <Pressable
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      onPress={() => handleDeletePost(item.id)}
                    >
                      <MaterialIcons name="delete-outline" size={24} color="#FF6B5C" />
                    </Pressable>
                  )}
                </View>
              </View>
            );
          }}
        />
      </View>

      <Pressable
        style={({ pressed }) => [styles.fab, pressed && { opacity: 0.8 }]}
        onPress={() => setIsModalVisible(true)}
      >
        <MaterialIcons name="add" size={28} color="#FFFFFF" />
      </Pressable>

      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => !isSubmitting && setIsModalVisible(false)}
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
                onPress={() => !isSubmitting && setIsModalVisible(false)}
              >
                <MaterialIcons name="close" size={20} color="#123924" />
              </Pressable>
            </View>

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
                <Image source={{ uri: foto.uri }} style={styles.clayPreviewImage} />
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
                onChangeText={setDeskripsi}
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

            {userFilter === 'semua' && (
              <>
                <Text style={{ fontFamily: 'Nunito_800ExtraBold', color: '#123924', marginBottom: 12, fontSize: 14 }}>Urutkan</Text>
                <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
                  <Pressable onPress={() => setActiveTab('terbaru')} style={[{ flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 24 }, activeTab === 'terbaru' ? { backgroundColor: '#FFB627' } : { backgroundColor: '#FFFFFF' }]}>
                    <Text style={{ fontFamily: 'Nunito_800ExtraBold', color: '#123924' }}>Terbaru</Text>
                  </Pressable>
                  <Pressable onPress={() => setActiveTab('terdekat')} style={[{ flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 24 }, activeTab === 'terdekat' ? { backgroundColor: '#FFB627' } : { backgroundColor: '#FFFFFF' }]}>
                    <Text style={{ fontFamily: 'Nunito_800ExtraBold', color: '#123924' }}>Terdekat</Text>
                  </Pressable>
                </View>
              </>
            )}

            <Pressable onPress={() => { setIsFilterModalVisible(false); fetchPosts(1, true); }} style={{ backgroundColor: '#123924', paddingVertical: 16, borderRadius: 24, alignItems: 'center', marginTop: 12 }}>
              <Text style={{ fontFamily: 'Nunito_800ExtraBold', color: '#FFFFFF', fontSize: 16 }}>Terapkan Filter</Text>
            </Pressable>

          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FBF8F0" },
  container: { flex: 1 },
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
  clayPreviewImage: { width: "100%", height: "100%", resizeMode: "cover" },
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
});
