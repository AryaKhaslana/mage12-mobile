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
  Modal,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router, useFocusEffect } from "expo-router";
import * as SecureStore from "expo-secure-store";
import {
  createCommunityPost,
  getCommunityPosts, getMyCommunityPosts
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
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"terbaru" | "terdekat">("terbaru");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [userFilter, setUserFilter] = useState<"semua" | "saya">("semua");


  // Form State
  const [tipePost, setTipePost] = useState<
    "progress_update" | "panen_surplus" | "pertanyaan"
  >("progress_update");
  const [judul, setJudul] = useState("");
  const [lokasiNama, setLokasiNama] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [foto, setFoto] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPosts = async (pageNum = 1, shouldRefresh = false) => {
    try {
      if (shouldRefresh) setIsRefreshing(true);
      const userDataStr = await SecureStore.getItemAsync("userData");
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

      if (shouldRefresh || pageNum === 1) {
        setPosts(response.data);
      } else {
        setPosts((prev) => [...prev, ...response.data]);
      }

      setHasMore(response.meta.halamanSekarang < response.meta.totalHalaman);
      setPage(pageNum);
    } catch (error) {
      console.error(error);
      showNotification("Error", "Gagal memuat feed", "error");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      fetchPosts(1, false);
    }, [activeTab, debouncedSearch]),
  );

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
      formData.append("tipePost", tipePost);
      formData.append("deskripsi", deskripsi);
      if (judul) formData.append("judul", judul);
      if (lokasiNama) formData.append("lokasiNama", lokasiNama);

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
      setDeskripsi("");
      setFoto(null);
      setTipePost("progress_update");
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
          
          <View style={{ flexDirection: "row", marginTop: 16, gap: 12 }}>
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 12, borderRadius: 20, borderWidth: 0, shadowColor: "#123924", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.05, shadowRadius: 14, elevation: 4 }}>
              <MaterialIcons name="search" size={24} color="#5C5A4F" />
              <TextInput style={{ flex: 1, marginLeft: 8, fontFamily: 'Nunito_700Bold', fontSize: 16, color: '#123924' }} placeholder="Cari postingan, lokasi..." placeholderTextColor="#5C5A4F" value={searchQuery} onChangeText={setSearchQuery} />
            </View>
            <Pressable onPress={() => setIsFilterModalVisible(true)} style={({ pressed }) => [{ backgroundColor: '#FFB627', width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center', shadowColor: "#123924", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 14, elevation: 4 }, pressed && { opacity: 0.7 }]}>
              <MaterialIcons name="tune" size={24} color="#123924" />
            </Pressable>
          </View>
        </View>

        <FlatList
          data={posts}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.scrollContent}
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
            <EmptyHint
              icon="groups"
              title="Postingan tidak ditemukan"
              subtitle="Coba cari dengan kata kunci lain."
            />
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
                  <View style={styles.avatarContainer}>
                    <Text
                      style={{
                        fontFamily: "Nunito_800ExtraBold",
                        color: "#FFFFFF",
                      }}
                    >
                      {item.author?.nama ||
                        item.user_nama.charAt(0).toUpperCase()}
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
                    gap: 16,
                    marginTop: 4,
                  }}
                >
                  <Pressable
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <MaterialIcons
                      name="favorite-border"
                      size={24}
                      color="#123924"
                    />
                    <Text
                      style={{ fontFamily: "Nunito_700Bold", color: "#123924" }}
                    >
                      0
                    </Text>
                  </Pressable>
                  <Pressable
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
                      0
                    </Text>
                  </Pressable>
                  <Pressable
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <MaterialIcons name="share" size={24} color="#123924" />
                  </Pressable>
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
                <Text style={styles.modalTitle}>Mau bahas apa? </Text>
                <Text style={styles.modalSubtitle}>
                  Bagikan ceritamu ke petani lain!
                </Text>
              </View>
              <Pressable
                style={styles.closeModalButton}
                onPress={() => !isSubmitting && setIsModalVisible(false)}
              >
                <MaterialIcons name="close" size={20} color="#123924" />
              </Pressable>
            </View>

            {/* 1. UPLOAD FOTO (PINDAH KE ATAS) */}
            {!foto ? (
              <Pressable
                style={({ pressed }) => [
                  styles.photoDashedButton,
                  pressed && { backgroundColor: "#F4F6F0" },
                  { marginBottom: 20 },
                ]}
                onPress={handlePickImage}
              >
                <View style={styles.photoIconWrapper}>
                  <MaterialIcons name="add-a-photo" size={24} color="#123924" />
                </View>
                <Text style={styles.photoDashedText}>
                  Tambahin foto biar makin asik!
                </Text>
              </Pressable>
            ) : (
              <View style={[styles.previewContainer, { marginBottom: 20 }]}>
                <Image source={{ uri: foto.uri }} style={styles.previewImage} />
                <Pressable
                  style={styles.removePhotoButton}
                  onPress={() => setFoto(null)}
                >
                  <MaterialIcons name="close" size={16} color="#FFFFFF" />
                </Pressable>
              </View>
            )}

            {/* 2. CHIPS KATEGORI (TAGAR) */}
            <Text
              style={{
                fontFamily: "Nunito_800ExtraBold",
                color: "#123924",
                marginBottom: 8,
                fontSize: 14,
              }}
            >
              Pilih Kategori / Tagar *
            </Text>
            <View style={styles.chipRow}>
              {[
                { label: "Progress ", value: "progress_update" },
                { label: "Panen Surplus ", value: "panen_surplus" },
                { label: "Pertanyaan 🤔", value: "pertanyaan" },
              ].map((chip) => (
                <Pressable
                  key={chip.value}
                  style={[
                    styles.chip,
                    tipePost === chip.value
                      ? styles.chipActive
                      : styles.chipInactive,
                  ]}
                  onPress={() => setTipePost(chip.value as any)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      tipePost === chip.value
                        ? styles.chipTextActive
                        : styles.chipTextInactive,
                    ]}
                  >
                    {chip.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* 3. INPUT FORM DENGAN LABEL JELAS */}
            <View style={{ gap: 16, marginBottom: 24 }}>
              {/* DESKRIPSI UTAMA */}
              <View>
                <Text
                  style={{
                    fontFamily: "Nunito_800ExtraBold",
                    color: "#123924",
                    marginBottom: 8,
                    fontSize: 14,
                  }}
                >
                  Cerita / Pertanyaanmu *
                </Text>
                <View style={[styles.inputContainer, { marginBottom: 0 }]}>
                  <TextInput
                    style={styles.textInput}
                    multiline
                    placeholder="Ceritakan progres panenmu, atau tanya sesuatu..."
                    placeholderTextColor="#bdcabd"
                    value={deskripsi}
                    onChangeText={setDeskripsi}
                    maxLength={500}
                  />
                  <Text style={styles.counterText}>{deskripsi.length}/500</Text>
                </View>
              </View>

              {/* JUDUL */}
              <View>
                <Text
                  style={{
                    fontFamily: "Nunito_800ExtraBold",
                    color: "#123924",
                    marginBottom: 8,
                    fontSize: 14,
                  }}
                >
                  Judul Postingan (Opsional)
                </Text>
                <TextInput
                  style={{ fontFamily: 'Nunito_500Medium', fontSize: 16, color: '#123924', paddingHorizontal: 16, backgroundColor: '#FFFFFF', borderRadius: 16, height: 52 }}
                  placeholder="Misal: Panen Tomat Hari Ini!"
                  placeholderTextColor="#bdcabd"
                  value={judul}
                  onChangeText={setJudul}
                />
              </View>

              {/* LOKASI */}
              <View>
                <Text
                  style={{
                    fontFamily: "Nunito_800ExtraBold",
                    color: "#123924",
                    marginBottom: 8,
                    fontSize: 14,
                  }}
                >
                  Lokasi / Daerah (Opsional)
                </Text>
                <TextInput
                  style={{ fontFamily: 'Nunito_500Medium', fontSize: 16, color: '#123924', paddingHorizontal: 16, backgroundColor: '#FFFFFF', borderRadius: 16, height: 52 }}
                  placeholder="Misal: Surabaya Timur..."
                  placeholderTextColor="#bdcabd"
                  value={lokasiNama}
                  onChangeText={setLokasiNama}
                />
              </View>
            </View>

            <Pressable
              style={styles.submitButton}
              onPress={handleSubmitPost}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>Kirim Sekarang </Text>
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

            <Pressable onPress={() => setIsFilterModalVisible(false)} style={{ backgroundColor: '#123924', paddingVertical: 16, borderRadius: 24, alignItems: 'center', marginTop: 12 }}>
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
  closeModalButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E8E5DA",
    alignItems: "center",
    justifyContent: "center",
  },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 20 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 100,
    borderWidth: 2,
  },
  chipActive: { backgroundColor: "#3FA86B", borderColor: "#3FA86B" },
  chipInactive: { backgroundColor: "transparent", borderColor: "transparent" },
  chipText: { fontSize: 14, fontFamily: "Nunito_700Bold" },
  chipTextActive: { color: "#FFFFFF" },
  chipTextInactive: { color: "#5C5A4F" },
  inputContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    borderWidth: 0,
    marginBottom: 16,
    height: 120,
  },
  textInput: {
    flex: 1,
    fontFamily: "Nunito_500Medium",
    fontSize: 16,
    color: "#123924",
    textAlignVertical: "top",
  },
  counterText: {
    fontFamily: "Nunito_700Bold",
    fontSize: 12,
    color: "#5C5A4F",
    textAlign: "right",
    marginTop: 8,
  },
  photoDashedButton: {
    borderWidth: 2,
    borderColor: "transparent",
    borderStyle: "dashed",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    gap: 12,
    marginBottom: 24,
  },
  photoIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#E8E5DA",
    alignItems: "center",
    justifyContent: "center",
  },
  photoDashedText: {
    fontFamily: "Nunito_700Bold",
    fontSize: 16,
    color: "#5C5A4F",
  },
  previewContainer: {
    width: "100%",
    height: 200,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 24,
    borderWidth: 0,
  },
  previewImage: { width: "100%", height: "100%", resizeMode: "cover" },
  removePhotoButton: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FF6B5C",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 0,
  },
  submitButton: {
    backgroundColor: "#123924",
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: "center",
  },
  submitButtonText: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 16,
    color: "#FFFFFF",
  },
});
