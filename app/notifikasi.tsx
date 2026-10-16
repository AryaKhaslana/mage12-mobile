import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
  Animated as RNAnimated,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  registerOnLogout,
} from '../services/api';
import { getRelativeTime } from '../utils/format';

const NOTIF_CACHE_KEY = 'notifications_cache_v1';

interface CachedNotifs {
  notifications: any[];
  unreadCount: number;
  savedAt: number;
}

let memoryNotificationsCache: CachedNotifs | null = null;
registerOnLogout(() => {
  memoryNotificationsCache = null;
});

const NotificationSkeleton = () => {
  const [pulseAnim] = useState(() => new RNAnimated.Value(0.4));

  useEffect(() => {
    const loop = RNAnimated.loop(
      RNAnimated.sequence([
        RNAnimated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        RNAnimated.timing(pulseAnim, {
          toValue: 0.4,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulseAnim]);

  return (
    <RNAnimated.View style={[styles.skeletonContainer, { opacity: pulseAnim }]}>
      {[1, 2, 3, 4].map((item) => (
        <View key={item} style={styles.skeletonCard}>
          <View style={styles.skeletonIcon} />
          <View style={styles.skeletonContent}>
            <View style={styles.skeletonHeader}>
              <View style={styles.skeletonTitle} />
              <View style={styles.skeletonTime} />
            </View>
            <View style={styles.skeletonDescLine1} />
            <View style={styles.skeletonDescLine2} />
          </View>
        </View>
      ))}
    </RNAnimated.View>
  );
};

export default function NotifikasiScreen() {
  const [notifications, setNotifications] = useState<any[]>(() => {
    return memoryNotificationsCache ? memoryNotificationsCache.notifications : [];
  });
  const [unreadCount, setUnreadCount] = useState<number>(() => {
    return memoryNotificationsCache ? memoryNotificationsCache.unreadCount : 0;
  });
  const [isLoading, setIsLoading] = useState<boolean>(() => {
    return memoryNotificationsCache ? false : true;
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  const isFetchingRef = useRef(false);

  const saveToCache = useCallback(async (data: any[], unread: number) => {
    memoryNotificationsCache = {
      notifications: data,
      unreadCount: unread,
      savedAt: Date.now(),
    };
    try {
      await AsyncStorage.setItem(
        NOTIF_CACHE_KEY,
        JSON.stringify(memoryNotificationsCache)
      );
    } catch (e) {
      console.warn('Gagal menyimpan cache notifikasi:', e);
    }
  }, []);

  const syncNotifications = useCallback(
    async (isSilent = false, isRefresh = false) => {
      if (isFetchingRef.current) return;
      isFetchingRef.current = true;

      if (isRefresh) {
        setIsRefreshing(true);
      } else if (!isSilent) {
        setIsLoading(true);
      }

      try {
        const res = await getMyNotifications(1, 50);
        const data = res.data || [];
        const unread = data.filter((n: any) => !n.isRead).length;

        setNotifications(data);
        setUnreadCount(unread);
        saveToCache(data, unread);
      } catch (error) {
        console.error('Gagal mengambil notifikasi:', error);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
        isFetchingRef.current = false;
      }
    },
    [saveToCache]
  );

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      let hasCache = false;

      if (memoryNotificationsCache) {
        hasCache = true;
      } else {
        try {
          const cachedStr = await AsyncStorage.getItem(NOTIF_CACHE_KEY);
          if (cachedStr && isMounted) {
            const parsed: CachedNotifs = JSON.parse(cachedStr);
            if (Array.isArray(parsed.notifications)) {
              memoryNotificationsCache = parsed;
              setNotifications(parsed.notifications);
              setUnreadCount(parsed.unreadCount || 0);
              setIsLoading(false);
              hasCache = true;
            }
          }
        } catch (e) {
          console.warn('Gagal membaca cache notifikasi:', e);
        }
      }

      if (isMounted) {
        syncNotifications(hasCache, false);
      }
    };

    init();

    return () => {
      isMounted = false;
    };
  }, [syncNotifications]);

  const handleMarkAllRead = async () => {
    if (unreadCount === 0) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const prevNotifications = notifications;
    const prevUnreadCount = unreadCount;

    const updated = notifications.map((n) => ({ ...n, isRead: true }));
    setNotifications(updated);
    setUnreadCount(0);
    saveToCache(updated, 0);

    try {
      await markAllNotificationsAsRead();
    } catch (e) {
      console.error('Rollback markAllNotificationsAsRead:', e);
      setNotifications(prevNotifications);
      setUnreadCount(prevUnreadCount);
      saveToCache(prevNotifications, prevUnreadCount);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handlePressCard = async (notif: any) => {
    if (!notif.isRead) {
      const prevNotifications = notifications;
      const prevUnreadCount = unreadCount;

      const updated = notifications.map((n) =>
        n.id === notif.id ? { ...n, isRead: true } : n
      );
      const newUnread = Math.max(0, prevUnreadCount - 1);

      setNotifications(updated);
      setUnreadCount(newUnread);
      saveToCache(updated, newUnread);

      markNotificationAsRead(notif.id).catch((e) => {
        console.error('Rollback markNotificationAsRead:', e);
        setNotifications(prevNotifications);
        setUnreadCount(prevUnreadCount);
        saveToCache(prevNotifications, prevUnreadCount);
      });
    }

    if (notif.type === 'WATERING') {
      router.push('/(tabs)/tanaman');
    } else if (notif.type === 'ACHIEVEMENT') {
      router.push('/(tabs)/profil');
    } else if (notif.type === 'SOCIAL') {
      router.push('/(tabs)/komunitas');
    }
  };

  const renderIcon = (type: string) => {
    switch (type) {
      case 'WATERING':
        return { name: 'water-drop', color: '#FF6B5C', bg: 'rgba(255, 107, 92, 0.15)' };
      case 'ACHIEVEMENT':
        return { name: 'emoji-events', color: '#3FA86B', bg: 'rgba(63, 168, 107, 0.15)' };
      case 'SOCIAL':
        return { name: 'person', color: '#FFB627', bg: 'rgba(255, 182, 39, 0.15)' };
      default:
        return { name: 'notifications', color: '#3FA86B', bg: 'rgba(63, 168, 107, 0.15)' };
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Custom App Bar */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
          hitSlop={8}
          accessibilityLabel="Kembali"
        >
          <MaterialIcons name="arrow-back" size={24} color="#123924" />
        </Pressable>

        <Text style={styles.headerTitle}>Notifikasi</Text>

        <Pressable
          onPress={handleMarkAllRead}
          disabled={unreadCount === 0}
          style={({ pressed }) => [
            styles.headerActionBtn,
            pressed && unreadCount > 0 && styles.pressed,
            unreadCount === 0 && { opacity: 0.35 },
          ]}
          hitSlop={8}
          accessibilityLabel="Tandai semua dibaca"
        >
          <Text style={styles.headerAction}>Tandai Dibaca</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => syncNotifications(false, true)}
            colors={['#3FA86B']}
            tintColor="#3FA86B"
          />
        }
      >
        {isLoading ? (
          <NotificationSkeleton />
        ) : notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="notifications-off" size={48} color="#123924" />
            <Text style={styles.emptyText}>Belum ada notifikasi.</Text>
          </View>
        ) : (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>TERBARU</Text>
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadCount} Baru</Text>
                </View>
              )}
            </View>

            {notifications.map((notif) => {
              const iconDef = renderIcon(notif.type);
              return (
                <Pressable
                  key={notif.id}
                  onPress={() => handlePressCard(notif)}
                  style={({ pressed }) => [
                    styles.card,
                    notif.isRead ? styles.cardRead : styles.cardUnread,
                    pressed && styles.cardPressed,
                  ]}
                >
                  <View
                    style={[
                      styles.iconContainer,
                      { backgroundColor: notif.isRead ? iconDef.bg : iconDef.color },
                    ]}
                  >
                    <MaterialIcons
                      name={iconDef.name as any}
                      size={22}
                      color={notif.isRead ? iconDef.color : '#FFFFFF'}
                    />
                  </View>
                  <View style={styles.cardContent}>
                    <View style={styles.cardHeader}>
                      <Text
                        style={notif.isRead ? styles.cardTitleRead : styles.cardTitle}
                        numberOfLines={1}
                      >
                        {notif.title}
                      </Text>
                      <Text style={styles.cardTime}>{getRelativeTime(notif.createdAt)}</Text>
                    </View>
                    <Text style={styles.cardDesc}>{notif.message}</Text>
                  </View>
                  {!notif.isRead && (
                    <View style={[styles.unreadDot, { backgroundColor: iconDef.color }]} />
                  )}
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FBF8F0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FBF8F0',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(18, 57, 36, 0.08)',
    zIndex: 10,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(18, 57, 36, 0.12)',
    shadowColor: '#123924',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
  headerTitle: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 18,
    color: '#123924',
  },
  headerActionBtn: {
    paddingVertical: 8,
    paddingHorizontal: 4,
    minWidth: 44,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  headerAction: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 12,
    color: '#3FA86B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
    gap: 24,
  },
  skeletonContainer: {
    gap: 12,
  },
  skeletonCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: 'rgba(18, 57, 36, 0.08)',
  },
  skeletonIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#EAE7DD',
  },
  skeletonContent: {
    flex: 1,
    gap: 8,
  },
  skeletonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skeletonTitle: {
    width: '55%',
    height: 14,
    borderRadius: 6,
    backgroundColor: '#DFDBD0',
  },
  skeletonTime: {
    width: 48,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#EAE7DD',
  },
  skeletonDescLine1: {
    width: '90%',
    height: 12,
    borderRadius: 6,
    backgroundColor: '#EAE7DD',
  },
  skeletonDescLine2: {
    width: '65%',
    height: 12,
    borderRadius: 6,
    backgroundColor: '#EAE7DD',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
    opacity: 0.5,
  },
  emptyText: {
    marginTop: 12,
    fontFamily: 'Nunito_700Bold',
    fontSize: 15,
    color: '#123924',
  },
  section: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 12,
    color: '#5C5A4F',
    letterSpacing: 1,
  },
  badge: {
    backgroundColor: 'rgba(63, 168, 107, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  badgeText: {
    fontFamily: 'Nunito_500Medium',
    fontSize: 11,
    color: '#3FA86B',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: 'rgba(18, 57, 36, 0.08)',
  },
  cardUnread: {
    shadowColor: '#123924',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 3,
  },
  cardRead: {
    shadowColor: '#123924',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
    opacity: 0.85,
  },
  cardPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    flex: 1,
    gap: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 14,
    color: '#123924',
    flex: 1,
  },
  cardTitleRead: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: '#123924',
    flex: 1,
  },
  cardTime: {
    fontFamily: 'Nunito_500Medium',
    fontSize: 12,
    color: '#5C5A4F',
  },
  cardDesc: {
    fontFamily: 'Nunito_500Medium',
    fontSize: 12,
    color: '#5C5A4F',
    lineHeight: 18,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    alignSelf: 'center',
  },
});
