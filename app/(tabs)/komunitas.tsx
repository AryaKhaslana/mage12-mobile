import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, FlatList, Image, Modal, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";

import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router, useFocusEffect } from 'expo-router';
import ErrorState from '../../components/ErrorState';
import api, { CommunityPost, deleteCommunityPost, getCommunityPosts } from '../../services/api';

const EmptyHint = ({ icon, title, subtitle, ctaText, onCtaPress }: { icon: any, title: string, subtitle: string, ctaText?: string, onCtaPress?: () => void }) => (
  <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 40, paddingHorizontal: 20 }}>
    <MaterialIcons name={icon} size={56} color="#bdcabd" style={{ marginBottom: 16 }} />
    <Text style={{ fontSize: 16, fontFamily: 'Nunito_700Bold', color: '#123924', textAlign: 'center', marginBottom: 8 }}>{title}</Text>
    <Text style={{ fontSize: 14, fontFamily: 'Nunito_500Medium', color: '#5C5A4F', textAlign: 'center' }}>{subtitle}</Text>
    {ctaText && onCtaPress && (
      <Pressable onPress={onCtaPress} style={({ pressed }) => [
        { marginTop: 24, backgroundColor: '#3FA86B', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 100, borderWidth: 2, borderColor: '#123924', boxShadow: "3px 3px 0px #123924" },
        pressed && { boxShadow: "0px 0px 0px #123924", transform: [{ translateX: 3 }, { translateY: 3 }] }
      ]}>
        <Text style={{ color: '#FFFFFF', fontSize: 14, fontFamily: 'Nunito_700Bold' }}>{ctaText}</Text>
      </Pressable>
    )}
  </View>
);

const getRelativeTime = (isoString: string) => {
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


const PostSkeleton = () => {
  const fadeAnim = useRef(new Animated.Value(0.45)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 0.45, duration: 800, useNativeDriver: true })
      ])
    ).start();
  }, [fadeAnim]);

  return (
    <Animated.View style={[{
      backgroundColor: '#FFFFFF',
      borderRadius: 24,
      borderWidth: 2,
      borderColor: '#123924',
      padding: 16,
      opacity: fadeAnim, 
      marginBottom: 16 
    }]}>
      <View style={styles.postHeader}>
        <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#E8E5DA' }} />
        <View style={{ flex: 1, gap: 4 }}>
          <View style={{ width: 120, height: 10, borderRadius: 5, backgroundColor: '#E8E5DA' }} />
          <View style={{ width: 60, height: 10, borderRadius: 5, backgroundColor: '#E8E5DA' }} />
        </View>
        <View style={{ width: 90, height: 20, borderRadius: 100, backgroundColor: '#E8E5DA' }} />
      </View>
      <View style={{ gap: 6, marginBottom: 12 }}>
        <View style={{ width: '100%', height: 12, borderRadius: 6, backgroundColor: '#E8E5DA' }} />
        <View style={{ width: '100%', height: 12, borderRadius: 6, backgroundColor: '#E8E5DA' }} />
        <View style={{ width: '60%', height: 12, borderRadius: 6, backgroundColor: '#E8E5DA' }} />
      </View>
      <View style={{ width: '100%', aspectRatio: 4/3, borderRadius: 16, backgroundColor: '#E8E5DA' }} />
    </Animated.View>
  );
};

export default function KomunitasScreen() {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [isError, setIsError] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<number | null>(null);
  const [coords, setCoords] = useState<{ latitude: number, longitude: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const limit = 10;
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [tipePost, setTipePost] = useState<"progress_update" | "panen_surplus" | "pertanyaan">("progress_update");
  const [deskripsi, setDeskripsi] = useState("");
  const [foto, setFoto] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      Alert.alert("Error", "Deskripsi belum diisi");
      return;
    }
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("tipePost", tipePost);
      formData.append("deskripsi", deskripsi);
      if (foto) {
        formData.append("foto", {
          uri: foto.uri,
          name: "foto.jpg",
          type: "image/jpeg",
        } as any);
      }

      await api.post("/community", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      Alert.alert("Sukses", "Berhasil posting broskie!");
      setIsModalVisible(false);
      setDeskripsi("");
      setFoto(null);
      setTipePost("progress_update");
      handleRefresh();
    } catch (error: any) {
      const msg = error.response?.data?.message || "Gagal memposting.";
      if (msg.toLowerCase().includes("lokasi")) {
        Alert.alert("Lokasi belum lengkap", msg, [
          { text: "OK", onPress: () => router.push("/(auth)/location-setup") }
        ]);
      } else {
        Alert.alert("Gagal", msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchUserLocationAndPosts = async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const meRes = await api.get("/user/me").catch(() => null);
      const userData = meRes?.data?.data;
      if (userData?.id) {
        setCurrentUserId(userData.id);
      }
      const lat = userData?.latitude;
      const lon = userData?.longitude;
      
      if (lat != null && lon != null) {
        setCoords({ latitude: lat, longitude: lon });
        const commRes = await getCommunityPosts(lat, lon, 1, limit);
        setPosts(commRes.data);
        setPage(commRes.meta.halamanSekarang);
        setHasMore(commRes.data.length >= limit);
      } else {
        setCoords(null);
      }
    } catch (e) {
      console.error("Komunitas fetch error:", e);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchUserLocationAndPosts();
    }, [])
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      if (coords) {
        const commRes = await getCommunityPosts(coords.latitude, coords.longitude, 1, limit).catch(() => null);
        if (commRes?.data) {
          setPosts(commRes.data);
          setPage(commRes.meta.halamanSekarang);
          setHasMore(commRes.data.length >= limit);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLoadMore = async () => {
    if (!hasMore || isLoadingMore || !coords) return;
    setIsLoadingMore(true);
    try {
      const nextPage = page + 1;
      const commRes = await getCommunityPosts(coords.latitude, coords.longitude, nextPage, limit).catch(() => null);
      if (commRes?.data) {
        setPosts(prev => [...prev, ...commRes.data]);
        setPage(commRes.meta.halamanSekarang);
        setHasMore(commRes.data.length >= limit);
      } else {
        setHasMore(false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingMore(false);
    }
  };


  const handleDeletePost = (id: number) => {
    Alert.alert(
      "Hapus postingan ini?",
      "Postingan yang dihapus tidak bisa dikembalikan.",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: async () => {
            setIsDeletingId(id);
            try {
              await deleteCommunityPost(id);
              setPosts(prev => prev.filter(p => p.id !== id));
            } catch (error: any) {
              if (error.response?.status === 404) {
                // Already deleted
                setPosts(prev => prev.filter(p => p.id !== id));
              } else {
                Alert.alert("Gagal", error.response?.data?.message || "Gagal menghapus postingan.");
              }
            } finally {
              setIsDeletingId(null);
            }
          }
        }
      ]
    );
  };

  if (isLoading && !isRefreshing && posts.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Komunitas</Text>
            <Text style={styles.headerSubtitle}>Tempat nongkrongnya petani digital 🌱</Text>
          </View>
          <View style={styles.scrollContent}>
            <PostSkeleton />
            <PostSkeleton />
            <PostSkeleton />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
                <View style={styles.header}>
          <Text style={styles.headerTitle}>Komunitas</Text>
          <Text style={styles.headerSubtitle}>Tempat nongkrongnya petani digital 🌱</Text>
        </View>

        {!coords ? (
          <View style={{ flex: 1, justifyContent: 'center' }}>
            <EmptyHint
              icon="location-off"
              title="Lokasimu belum disetel 📍"
              subtitle="Komunitas butuh lokasimu buat nampilin postingan petani di sekitar."
              ctaText="Set Lokasi Sekarang"
              onCtaPress={() => router.push('/(auth)/location-setup')}
            />
          </View>
        ) : (
          <FlatList
            data={posts}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} colors={["#3FA86B"]} />
            }
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListEmptyComponent={
              !isLoading ? (
                isError ? (
                  <ErrorState onRetry={fetchUserLocationAndPosts} />
                ) : (
                  <EmptyHint
                    icon="groups"
                    title="Belum ada postingan di sekitarmu 🌾"
                    subtitle="Jadilah petani pertama yang berbagi di sini!"
                  />
                )
              ) : null
            }
            ListFooterComponent={
              isLoadingMore ? <ActivityIndicator size="small" color="#3FA86B" style={{ marginVertical: 16 }} /> : null
            }
            renderItem={({ item }) => {
              let badgeText = "";
              let badgeBg = "";
              let badgeColor = "";
              if (item.tipePost === "progress_update") {
                badgeText = "Progress 🌱";
                badgeBg = "#E8F5E9";
                badgeColor = "#3FA86B";
              } else if (item.tipePost === "panen_surplus") {
                badgeText = "Panen Surplus 🌾";
                badgeBg = "#FFF9E6";
                badgeColor = "#B8860B";
              } else if (item.tipePost === "pertanyaan") {
                badgeText = "Pertanyaan ❓";
                badgeBg = "#FFECEB";
                badgeColor = "#FF6B5C";
              }

              return (
                <Pressable 
                  style={({ pressed }) => [
                    styles.postCard,
                    pressed && { opacity: 0.9 } // slight feedback
                  ]}
                  onPress={() => router.push({ pathname: "/detail-komunitas", params: { id: item.id } } as any)}
                >
                  <View style={styles.postHeader}>
                    <View style={styles.avatarContainer}>
                      <Text style={styles.avatarInitials}>{item.user_nama.charAt(0).toUpperCase()}</Text>
                    </View>
                    <View style={styles.postMeta}>
                      <Text style={styles.authorName}>{item.user_nama}</Text>
                      <Text style={styles.timeText}>{getRelativeTime(item.createdAt)}</Text>
                    </View>
                    {badgeText ? (
                      <View style={[styles.badge, { backgroundColor: badgeBg }]}>
                        <Text style={[styles.badgeText, { color: badgeColor }]}>{badgeText}</Text>
                      </View>
                    ) : null}
                    {item.userId === currentUserId && (
                      <Pressable 
                        hitSlop={10}
                        style={{ marginLeft: 8 }}
                        disabled={isDeletingId === item.id}
                        onPress={() => handleDeletePost(item.id)}
                      >
                        {isDeletingId === item.id ? (
                          <ActivityIndicator size="small" color="#FF6B5C" />
                        ) : (
                          <MaterialIcons name="more-vert" size={18} color="#5C5A4F" />
                        )}
                      </Pressable>
                    )}
                  </View>

                  <Text style={styles.postCaption}>{item.deskripsi}</Text>

                  {item.fotoUrl && (
                    <View style={styles.postImageContainer}>
                      <Image source={{ uri: item.fotoUrl }} style={styles.postImage} />
                    </View>
                  )}

                  <View style={styles.locationRow}>
                    <MaterialIcons name="place" size={12} color="#5C5A4F" />
                    <Text style={styles.distanceText}>{item.distance.toFixed(1)} km</Text>
                  </View>
                </Pressable>
              );
            }}
          />
        )}
      </View>

        {coords && (
          <Pressable 
            style={({ pressed }) => [
              styles.fab,
              pressed && styles.pressedShadow4
            ]}
            onPress={() => setIsModalVisible(true)}
          >
            <MaterialIcons name="add" size={28} color="#FFFFFF" />
          </Pressable>
        )}

        <Modal
          visible={isModalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => !isSubmitting && setIsModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalDragIndicator} />
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>Mau bahas apa? 💬</Text>
                  <Text style={styles.modalSubtitle}>Bagikan ceritamu ke petani lain!</Text>
                </View>
                <Pressable 
                  style={styles.closeModalButton}
                  onPress={() => !isSubmitting && setIsModalVisible(false)}
                >
                  <MaterialIcons name="close" size={20} color="#123924" />
                </Pressable>
              </View>

              <View style={styles.chipRow}>
                {[
                  { label: "Progress 🌱", value: "progress_update" },
                  { label: "Panen Surplus 🌾", value: "panen_surplus" },
                  { label: "Pertanyaan ❓", value: "pertanyaan" }
                ].map(chip => (
                  <Pressable
                    key={chip.value}
                    style={[styles.chip, tipePost === chip.value ? styles.chipActive : styles.chipInactive]}
                    onPress={() => setTipePost(chip.value as any)}
                  >
                    <Text style={[styles.chipText, tipePost === chip.value ? styles.chipTextActive : styles.chipTextInactive]}>
                      {chip.label}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.textInput}
                  multiline
                  placeholder="Ceritakan panenmu, tanya sesuatu..."
                  placeholderTextColor="#bdcabd"
                  value={deskripsi}
                  onChangeText={setDeskripsi}
                  maxLength={500}
                />
                <Text style={styles.counterText}>{deskripsi.length}/500</Text>
              </View>

              {!foto ? (
                <Pressable 
                  style={({ pressed }) => [
                    styles.photoDashedButton,
                    pressed && { backgroundColor: '#F4F6F0' }
                  ]} 
                  onPress={handlePickImage}
                >
                  <View style={styles.photoIconWrapper}>
                    <MaterialIcons name="add-a-photo" size={24} color="#123924" />
                  </View>
                  <Text style={styles.photoDashedText}>Tambahin foto biar makin asik!</Text>
                </Pressable>
              ) : (
                <View style={styles.previewContainer}>
                  <Image source={{ uri: foto.uri }} style={styles.previewImage} />
                  <Pressable style={styles.removePhotoButton} onPress={() => setFoto(null)}>
                    <MaterialIcons name="close" size={16} color="#FFFFFF" />
                  </Pressable>
                </View>
              )}

              <Pressable 
                style={styles.submitButton}
                onPress={handleSubmitPost}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitButtonText}>Kirim Sekarang 🚀</Text>
                )}
              </Pressable>
            </View>
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
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 120,
    gap: 16,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 32,
    fontFamily: 'Nunito_800ExtraBold',
    color: '#123924',
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: 'Nunito_500Medium',
    color: '#5C5A4F',
    marginTop: 4,
  },
  postCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#123924',
    padding: 16,
    boxShadow: '4px 4px 0px #123924',
    elevation: 4,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3FA86B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    color: '#FFFFFF',
    fontFamily: 'Nunito_700Bold',
    fontSize: 16,
  },
  postMeta: {
    flex: 1,
  },
  authorName: {
    fontSize: 14,
    fontFamily: 'Nunito_700Bold',
    color: '#123924',
  },
  timeText: {
    fontSize: 10,
    color: '#5C5A4F',
    fontFamily: 'Nunito_500Medium',
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: '#123924',
  },
  badgeText: {
    fontSize: 10,
    fontFamily: 'Nunito_700Bold',
  },
  postCaption: {
    fontSize: 14,
    fontFamily: 'Nunito_500Medium',
    color: '#123924',
    lineHeight: 20,
    marginBottom: 12,
  },
  postImageContainer: {
    width: '100%',
    aspectRatio: 4/3,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
  },
  postImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: '#E8E5DA',
  },
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionText: {
    fontSize: 13,
    fontFamily: 'Nunito_700Bold',
    color: '#5C5A4F',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  distanceText: {
    fontSize: 10,
    color: '#5C5A4F',
    fontFamily: 'Nunito_500Medium',
  },
  fab: {
    position: 'absolute',
    bottom: 16,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#3FA86B',
    borderWidth: 2,
    borderColor: '#123924',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '4px 4px 0px #123924',
    elevation: 5,
    zIndex: 50,
  },
  pressedShadow4: {
    boxShadow: '0px 0px 0px #123924',
    transform: [{ translateX: 4 }, { translateY: 4 }],
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(18,57,36,0.5)',
    justifyContent: 'flex-end',
  },
  modalDragIndicator: {
    width: 48,
    height: 6,
    backgroundColor: '#bdcabd',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalContent: {
    backgroundColor: '#FBF8F0',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderWidth: 2,
    borderColor: '#123924',
    borderBottomWidth: 0,
    padding: 24,
    paddingTop: 16,
    maxHeight: '85%',
  },
  closeModalButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#123924',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '2px 2px 0px #123924',
  },
  modalSubtitle: {
    fontSize: 14,
    fontFamily: 'Nunito_500Medium',
    color: '#5C5A4F',
    marginTop: 2,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Nunito_800ExtraBold',
    color: '#123924',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: '#123924',
    boxShadow: '2px 2px 0px #123924',
  },
  chipActive: {
    backgroundColor: '#3FA86B',
  },
  chipInactive: {
    backgroundColor: '#FFFFFF',
  },
  chipText: {
    fontSize: 12,
    fontFamily: 'Nunito_700Bold',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  chipTextInactive: {
    color: '#3e4a40',
  },
  inputContainer: {
    marginBottom: 16,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#123924',
    borderRadius: 16,
    padding: 16,
    height: 120,
    fontFamily: 'Nunito_500Medium',
    fontSize: 14,
    color: '#123924',
    textAlignVertical: 'top',
    boxShadow: '4px 4px 0px #123924',
  },
  counterText: {
    fontFamily: 'Nunito_500Medium',
    fontSize: 10,
    color: '#5C5A4F',
    textAlign: 'right',
    marginTop: 4,
  },
  photoDashedButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#123924',
    borderStyle: 'dashed',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    boxShadow: '4px 4px 0px #123924',
  },
  photoIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E8F5E9',
    borderWidth: 2,
    borderColor: '#123924',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  photoDashedText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: '#123924',
  },
  previewContainer: {
    width: 120,
    aspectRatio: 4/3,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#123924',
    overflow: 'hidden',
    marginBottom: 24,
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removePhotoButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(18,57,36,0.7)',
    borderRadius: 12,
    padding: 4,
  },
  submitButton: {
    backgroundColor: '#1F5C3D',
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#123924',
    padding: 16,
    alignItems: 'center',
    boxShadow: '4px 4px 0px #123924',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 16,
  }
});
