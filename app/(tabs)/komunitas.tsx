import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, SafeAreaView, Image, ActivityIndicator, RefreshControl } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import api from '../../services/api';
import { getCommunityPosts, CommunityPost } from '../../services/api';

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

export default function KomunitasScreen() {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [coords, setCoords] = useState<{ latitude: number, longitude: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const limit = 10;

  const fetchUserLocationAndPosts = async () => {
    setIsLoading(true);
    try {
      const meRes = await api.get("/user/me").catch(() => null);
      const lat = meRes?.data?.data?.latitude;
      const lon = meRes?.data?.data?.longitude;
      
      if (lat != null && lon != null) {
        setCoords({ latitude: lat, longitude: lon });
        const commRes = await getCommunityPosts(lat, lon, 1, limit).catch(() => null);
        if (commRes?.data) {
          setPosts(commRes.data);
          setPage(commRes.meta.halamanSekarang);
          setHasMore(commRes.data.length >= limit);
        } else {
          setPosts([]);
          setHasMore(false);
        }
      } else {
        setCoords(null);
      }
    } catch (e) {
      console.error(e);
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

  if (isLoading && !isRefreshing && posts.length === 0) {
    return (
      <SafeAreaView style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#3FA86B" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Komunitas</Text>
        </View>

        {!coords ? (
          <View style={{ flex: 1, justifyContent: 'center' }}>
            <EmptyHint
              icon="location-off"
              title="Lokasimu belum disetel 📍"
              subtitle="Komunitas butuh lokasimu buat nampilin postingan petani di sekitar."
              ctaText="Set Lokasi Sekarang"
              onCtaPress={() => router.push('/(tabs)/profil')}
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
                <EmptyHint
                  icon="groups"
                  title="Belum ada postingan di sekitarmu 🌾"
                  subtitle="Jadilah petani pertama yang berbagi di sini!"
                />
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
                <View style={styles.postCard}>
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
                </View>
              );
            }}
          />
        )}
      </View>
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
});
