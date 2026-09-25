import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, Image, Pressable, ActivityIndicator, Animated, FlatList, TextInput, Alert, KeyboardAvoidingView, Platform, Keyboard, Modal, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import api, { getCommunityPostDetail, getCommunityComments, addCommunityComment, deleteCommunityComment, toggleCommunityLike, deleteCommunityPost, CommunityPostDetail, CommunityComment } from '../services/api';
import * as SecureStore from 'expo-secure-store';
import { useNotification } from '../components/NotificationContext';

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

const EmptyHint = ({ icon, title, subtitle, ctaText, onCtaPress }: any) => (
  <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 40, paddingHorizontal: 20 }}>
    <MaterialIcons name={icon} size={64} color="#a09d91" style={{ marginBottom: 16 }} />
    <Text style={{ fontSize: 18, fontFamily: 'Nunito_700Bold', color: '#123924', marginBottom: 8, textAlign: 'center' }}>{title}</Text>
    <Text style={{ fontSize: 14, fontFamily: 'Nunito_500Medium', color: '#5C5A4F', textAlign: 'center', marginBottom: 24, lineHeight: 22 }}>{subtitle}</Text>
    {ctaText && onCtaPress && (
      <Pressable onPress={onCtaPress} style={{ backgroundColor: '#3FA86B', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 100 }}>
        <Text style={{ color: '#FFFFFF', fontFamily: 'Nunito_700Bold', fontSize: 14 }}>{ctaText}</Text>
      </Pressable>
    )}
  </View>
);


const DetailKomunitasSkeleton = () => {
  const fadeAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 0.4, duration: 800, useNativeDriver: true })
      ])
    ).start();
  }, [fadeAnim]);

  return (
    <Animated.View style={{ flex: 1, opacity: fadeAnim, padding: 20 }}>
      {/* User Info */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: '#E8E5DA' }} />
        <View style={{ gap: 4 }}>
          <View style={{ width: 140, height: 16, borderRadius: 8, backgroundColor: '#E8E5DA' }} />
          <View style={{ width: 80, height: 12, borderRadius: 6, backgroundColor: '#E8E5DA' }} />
        </View>
      </View>
      
      {/* Content Text */}
      <View style={{ gap: 8, marginBottom: 16 }}>
        <View style={{ width: '100%', height: 14, borderRadius: 7, backgroundColor: '#E8E5DA' }} />
        <View style={{ width: '100%', height: 14, borderRadius: 7, backgroundColor: '#E8E5DA' }} />
        <View style={{ width: '60%', height: 14, borderRadius: 7, backgroundColor: '#E8E5DA' }} />
      </View>

      {/* Image Block */}
      <View style={{ width: '100%', aspectRatio: 4/3, borderRadius: 16, backgroundColor: '#E8E5DA', marginBottom: 24 }} />
      
      {/* Comments Skeleton */}
      <View style={{ gap: 16 }}>
        <View style={{ width: 100, height: 16, borderRadius: 8, backgroundColor: '#E8E5DA' }} />
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#E8E5DA' }} />
          <View style={{ flex: 1, height: 60, borderRadius: 12, backgroundColor: '#E8E5DA' }} />
        </View>
      </View>
    </Animated.View>
  );
};

export default function DetailKomunitasScreen() {
  const { showNotification } = useNotification();
  const [postToDelete, setPostToDelete] = useState<number | null>(null);
  const [commentToDelete, setCommentToDelete] = useState<number | null>(null);
  const { id } = useLocalSearchParams();
  const postId = Number(id);

  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [post, setPost] = useState<CommunityPostDetail | null>(null);
  const [comments, setComments] = useState<CommunityComment[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  const [commentText, setCommentText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<number | null>(null);

  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const stored = await SecureStore.getItemAsync("userData");
        if (stored) {
          const p = JSON.parse(stored);
          if (p.id) setCurrentUserId(p.id);
        } else {
          const res = await api.get("/user/me").catch(() => null);
          if (res?.data?.data?.id) setCurrentUserId(res.data.data.id);
        }
      } catch(e) {}
    };
    fetchMe();
  }, []);

  const fetchDetail = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const data = await getCommunityPostDetail(postId);
      setPost(data);
      
      const comm = await getCommunityComments(postId, 1, 20);
      setComments(comm.data);
      setHasMore(comm.data.length >= 20);
      setPage(1);
    } catch (e) {
      console.error(e);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    if (postId) {
      fetchDetail();
    }
  }, [postId, fetchDetail]);

  const handleLoadMore = async () => {
    if (!hasMore || isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      const next = page + 1;
      const comm = await getCommunityComments(postId, next, 20);
      setComments(prev => [...prev, ...comm.data]);
      setHasMore(comm.data.length >= 20);
      setPage(next);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleToggleLike = async () => {
    if (!post || isLiking) return;
    const oldLiked = post.isLiked;
    const oldJumlah = post.jumlahLike;
    
    // Optimistic UI
    setPost({
      ...post,
      isLiked: !oldLiked,
      jumlahLike: oldLiked ? oldJumlah - 1 : oldJumlah + 1
    });

    setIsLiking(true);
    try {
      const res = await toggleCommunityLike(postId);
      // Ensure state matches backend truth
      setPost(prev => prev ? { ...prev, isLiked: res.liked, jumlahLike: res.jumlahLike } : null);
    } catch (e: any) {
      // Revert
      setPost(prev => prev ? { ...prev, isLiked: oldLiked, jumlahLike: oldJumlah } : null);
      showNotification("Gagal", e.response?.data?.message || "Gagal menyukai postingan.", "error");
    } finally {
      setIsLiking(false);
    }
  };

  const handleSendComment = async () => {
    if (!commentText.trim() || isSending || !post) return;
    setIsSending(true);
    try {
      const newComm = await addCommunityComment(postId, commentText.trim());
      setComments(prev => [...prev, newComm]);
      setCommentText("");
      setPost(prev => prev ? { ...prev, jumlahKomentar: prev.jumlahKomentar + 1 } : null);
      Keyboard.dismiss();
    } catch(e: any) {
      showNotification("Gagal", e.response?.data?.message || "Gagal mengirim komentar.", "error");
    } finally {
      setIsSending(false);
    }
  };

  const handleDeletePost = () => {
    if (!post) return;
    setPostToDelete(post.id);
  };

  const confirmDeletePost = async () => {
    if (!postToDelete) return;
    try {
      await deleteCommunityPost(postToDelete);
      setPostToDelete(null);
      showNotification("Terhapus", "Postingan berhasil dihapus permanen!", "success");
      setTimeout(() => router.back(), 300);
    } catch (e: any) {
      setPostToDelete(null);
      showNotification("Gagal", e.response?.data?.message || "Gagal menghapus postingan.", "error");
    }
  };

  const handleDeleteComment = (commentId: number) => {
    setCommentToDelete(commentId);
  };

  const confirmDeleteComment = async () => {
    if (!commentToDelete) return;
    setIsDeletingId(commentToDelete);
    try {
      await deleteCommunityComment(commentToDelete);
      setComments(prev => prev.filter(c => c.id !== commentToDelete));
      setPost(prev => prev ? { ...prev, jumlahKomentar: Math.max(0, prev.jumlahKomentar - 1) } : null);
      setCommentToDelete(null);
      showNotification("Terhapus", "Komentar berhasil dihapus!", "success");
    } catch (e: any) {
      setCommentToDelete(null);
      showNotification("Gagal", e.response?.data?.message || "Gagal menghapus komentar.", "error");
    } finally {
      setIsDeletingId(null);
    }
  };

  const renderHeader = () => {
    if (!post) return null;
    
    let badgeText = "";
    let badgeBg = "";
    let badgeColor = "";
    if (post.tipePost === "progress_update") {
      badgeText = "Progress ";
      badgeBg = "#E8F5E9";
      badgeColor = "#3FA86B";
    } else if (post.tipePost === "panen_surplus") {
      badgeText = "Panen Surplus ";
      badgeBg = "#FFF9E6";
      badgeColor = "#B8860B";
    } else if (post.tipePost === "pertanyaan") {
      badgeText = "Pertanyaan ❓";
      badgeBg = "#FFECEB";
      badgeColor = "#FF6B5C";
    }

    return (
      <View style={{ paddingBottom: 16 }}>
        <View style={styles.postCard}>
          <View style={styles.postHeader}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarInitials}>{post.user_nama?.charAt(0) || '?'.toUpperCase()}</Text>
            </View>
            <View style={styles.postMeta}>
              <Text style={styles.authorName}>{post.user_nama}</Text>
              <Text style={styles.timeText}>{getRelativeTime(post.createdAt)}</Text>
            </View>
            {badgeText ? (
              <View style={[styles.badge, { backgroundColor: badgeBg }]}>
                <Text style={[styles.badgeText, { color: badgeColor }]}>{badgeText}</Text>
              </View>
            ) : null}
            {post.isOwner && (
              <TouchableOpacity hitSlop={{top: 15, bottom: 15, left: 15, right: 15}} style={{ padding: 8, marginLeft: 8, zIndex: 10, elevation: 10 }} onPress={handleDeletePost}>
                <MaterialIcons name="delete" size={20} color="#FF4C4C" />
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.postCaption}>{post.deskripsi}</Text>

          {post.fotoUrl && (
            <View style={styles.postImageContainer}>
              <Image source={{ uri: post.fotoUrl }} style={styles.postImage} />
            </View>
          )}

          {/* ACTION BAR */}
          <View style={styles.actionBar}>
            <Pressable style={styles.actionButton} onPress={handleToggleLike}>
              <MaterialIcons name={post.isLiked ? "favorite" : "favorite-border"} size={22} color={post.isLiked ? "#FF6B5C" : "#5C5A4F"} />
              <Text style={[styles.actionText, post.isLiked && { color: "#FF6B5C" }]}>{post.jumlahLike}</Text>
            </Pressable>
            <Pressable style={styles.actionButton} onPress={() => inputRef.current?.focus()}>
              <MaterialIcons name="chat-bubble-outline" size={22} color="#5C5A4F" />
              <Text style={styles.actionText}>{post.jumlahKomentar}</Text>
            </Pressable>
          </View>
        </View>

        <Text style={styles.commentSectionTitle}>Komentar ({post.jumlahKomentar})</Text>
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={{ marginRight: 16 }}>
            <MaterialIcons name="arrow-back" size={24} color="#123924" />
          </Pressable>
          <Text style={styles.headerTitle}>Detail Postingan</Text>
        </View>
        <DetailKomunitasSkeleton />
      </SafeAreaView>
    );
  }

  if (isError || !post) {
    return (
      <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={{ marginRight: 16 }}>
            <MaterialIcons name="arrow-back" size={24} color="#123924" />
          </Pressable>
          <Text style={styles.headerTitle}>Detail Postingan</Text>
        </View>
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <EmptyHint
            icon="error-outline"
            title="Postingan tidak ditemukan"
            subtitle="Mungkin postingan ini sudah dihapus oleh pemiliknya."
            ctaText="Kembali ke Feed"
            onCtaPress={() => router.back()}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={{ marginRight: 16 }}>
            <MaterialIcons name="arrow-back" size={24} color="#123924" />
          </Pressable>
          <Text style={styles.headerTitle}>Detail Postingan</Text>
        </View>

        <FlatList
          data={comments}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.scrollContent}
          ListHeaderComponent={renderHeader}
          renderItem={({ item }) => (
            <View style={styles.commentItem}>
              <View style={[styles.avatarContainer, { width: 32, height: 32, borderRadius: 16 }]}>
                {item.userAvatar ? (
                  <Image source={{ uri: item.userAvatar }} style={{ width: '100%', height: '100%', borderRadius: 16 }} />
                ) : (
                  <Text style={[styles.avatarInitials, { fontSize: 14 }]}>{item.userNama.charAt(0).toUpperCase()}</Text>
                )}
              </View>
              <View style={styles.commentBubble}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Text style={styles.commentName}>{item.userNama}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={styles.commentTime}>{getRelativeTime(item.createdAt)}</Text>
                    {item.userId === currentUserId && (
                      <Pressable 
                        hitSlop={10} 
                        disabled={isDeletingId === item.id}
                        onPress={() => handleDeleteComment(item.id)}
                      >
                        {isDeletingId === item.id ? (
                          <ActivityIndicator size="small" color="#FF6B5C" />
                        ) : (
                          <MaterialIcons name="delete-outline" size={16} color="#FF6B5C" />
                        )}
                      </Pressable>
                    )}
                  </View>
                </View>
                <Text style={styles.commentText}>{item.teks}</Text>
              </View>
            </View>
          )}
          ListFooterComponent={
            hasMore ? (
              <Pressable style={styles.loadMoreBtn} onPress={handleLoadMore} disabled={isLoadingMore}>
                {isLoadingMore ? <ActivityIndicator color="#3FA86B" /> : <Text style={styles.loadMoreText}>Muat lagi</Text>}
              </Pressable>
            ) : null
          }
          ListEmptyComponent={
            <Text style={{ textAlign: 'center', color: '#5C5A4F', marginTop: 20, fontFamily: 'Nunito_500Medium' }}>Belum ada komentar.</Text>
          }
        />

        <View style={styles.inputArea}>
          <TextInput
            ref={inputRef}
            style={styles.inputField}
            placeholder="Tulis komentar..."
            placeholderTextColor="#bdcabd"
            value={commentText}
            onChangeText={setCommentText}
            maxLength={300}
            multiline
          />
          <Pressable 
            style={[styles.sendButton, (!commentText.trim() || isSending) && { opacity: 0.6 }]} 
            onPress={handleSendComment}
            disabled={!commentText.trim() || isSending}
          >
            {isSending ? <ActivityIndicator color="#FFFFFF" size="small" /> : <MaterialIcons name="send" size={20} color="#FFFFFF" />}
          </Pressable>
        </View>
        <Modal visible={!!postToDelete} animationType="fade" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(28, 28, 59, 0.7)', justifyContent: 'center', padding: 24 }}>
          <View style={{ backgroundColor: '#FBF8F0', borderRadius: 24, padding: 24, borderWidth: 0,  shadowColor: "#123924", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 14, elevation: 4, alignItems: 'center' }}>
            <Text style={{ fontFamily: 'Nunito_800ExtraBold', fontSize: 24, color: '#123924', textAlign: 'center', marginBottom: 8 }}>Hapus Postingan?</Text>
            <Text style={{ fontFamily: 'Nunito_500Medium', fontSize: 14, color: '#5C5A4F', textAlign: 'center', marginBottom: 24 }}>
              Postingan ini beserta semua komentarnya akan hilang permanen!
            </Text>
            <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
              <Pressable style={{ flex: 1, padding: 16, borderRadius: 16, borderWidth: 0,  alignItems: 'center' }} onPress={() => setPostToDelete(null)}>
                <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: 16, color: '#123924' }}>Batal</Text>
              </Pressable>
              <Pressable style={{ flex: 1, padding: 16, borderRadius: 16, backgroundColor: '#FF4C4C', borderWidth: 0,  alignItems: 'center' }} onPress={confirmDeletePost} disabled={isDeletingId !== null}>
                {isDeletingId !== null ? <ActivityIndicator color="#FFFFFF" /> : <Text style={{ fontFamily: 'Nunito_800ExtraBold', fontSize: 16, color: '#FFFFFF' }}>Hapus</Text>}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={!!commentToDelete} animationType="fade" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(28, 28, 59, 0.7)', justifyContent: 'center', padding: 24 }}>
          <View style={{ backgroundColor: '#FBF8F0', borderRadius: 24, padding: 24, borderWidth: 0,  shadowColor: "#123924", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 14, elevation: 4, alignItems: 'center' }}>
            <Text style={{ fontFamily: 'Nunito_800ExtraBold', fontSize: 24, color: '#123924', textAlign: 'center', marginBottom: 8 }}>Hapus Komentar?</Text>
            <Text style={{ fontFamily: 'Nunito_500Medium', fontSize: 14, color: '#5C5A4F', textAlign: 'center', marginBottom: 24 }}>
              Komentar ini akan dihapus permanen broskie.
            </Text>
            <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
              <Pressable style={{ flex: 1, padding: 16, borderRadius: 16, borderWidth: 0,  alignItems: 'center' }} onPress={() => setCommentToDelete(null)}>
                <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: 16, color: '#123924' }}>Batal</Text>
              </Pressable>
              <Pressable style={{ flex: 1, padding: 16, borderRadius: 16, backgroundColor: '#FF4C4C', borderWidth: 0,  alignItems: 'center' }} onPress={confirmDeleteComment} disabled={isDeletingId !== null}>
                {isDeletingId !== null ? <ActivityIndicator color="#FFFFFF" /> : <Text style={{ fontFamily: 'Nunito_800ExtraBold', fontSize: 16, color: '#FFFFFF' }}>Hapus</Text>}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FBF8F0' },
  container: {
    flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    
    borderBottomColor: '#E8E5DA' },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Nunito_800ExtraBold',
    color: '#123924' },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40 },
  postCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 0,
    
    padding: 16,
    shadowColor: "#123924", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 14, elevation: 4,
    marginBottom: 24 },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12 },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3FA86B',
    alignItems: 'center',
    justifyContent: 'center' },
  avatarInitials: {
    color: '#FFFFFF',
    fontFamily: 'Nunito_700Bold',
    fontSize: 16 },
  postMeta: {
    flex: 1 },
  authorName: {
    fontSize: 14,
    fontFamily: 'Nunito_700Bold',
    color: '#123924' },
  timeText: {
    fontSize: 10,
    color: '#5C5A4F',
    fontFamily: 'Nunito_500Medium' },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 100,
    borderWidth: 0 },
  badgeText: {
    fontSize: 10,
    fontFamily: 'Nunito_700Bold' },
  postCaption: {
    fontSize: 14,
    fontFamily: 'Nunito_500Medium',
    color: '#123924',
    lineHeight: 20,
    marginBottom: 16 },
  postImageContainer: {
    width: '100%',
    aspectRatio: 4/3,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 0 },
  postImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover' },
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    paddingTop: 12,
    
    borderTopColor: '#E8E5DA' },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6 },
  actionText: {
    fontSize: 14,
    fontFamily: 'Nunito_700Bold',
    color: '#5C5A4F' },
  commentSectionTitle: {
    fontSize: 16,
    fontFamily: 'Nunito_800ExtraBold',
    color: '#123924',
    marginBottom: 8 },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12 },
  commentBubble: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 0,
    
    padding: 12,
    shadowColor: "#123924", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 14, elevation: 4 },
  commentName: {
    fontSize: 13,
    fontFamily: 'Nunito_700Bold',
    color: '#123924',
    marginBottom: 4 },
  commentTime: {
    fontSize: 10,
    fontFamily: 'Nunito_500Medium',
    color: '#a09d91' },
  commentText: {
    fontSize: 14,
    fontFamily: 'Nunito_500Medium',
    color: '#123924',
    lineHeight: 20 },
  loadMoreBtn: {
    alignItems: 'center',
    paddingVertical: 12 },
  loadMoreText: {
    fontFamily: 'Nunito_700Bold',
    color: '#3FA86B' },
  inputArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    backgroundColor: '#FFFFFF',
    
    
    gap: 12 },
  inputField: {
    flex: 1,
    minHeight: 48,
    maxHeight: 120,
    backgroundColor: '#FBF8F0',
    borderWidth: 0,
    
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
    fontFamily: 'Nunito_500Medium',
    fontSize: 14,
    color: '#123924' },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3FA86B',
    borderWidth: 0,
    
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#123924", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 14, elevation: 4 }
});
