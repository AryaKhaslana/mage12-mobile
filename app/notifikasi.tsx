import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image, ActivityIndicator, RefreshControl } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getMyNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../services/api';
import { getRelativeTime } from '../utils/format';

export default function NotifikasiScreen() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchNotifs = async () => {
    try {
      const res = await getMyNotifications(1, 50);
      setNotifications(res.data || []);
      setUnreadCount(res.meta?.unreadCount || 0);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleMarkAllRead = async () => {
    if (unreadCount === 0) return;
    try {
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      await markAllNotificationsAsRead();
    } catch (e) {
      console.error(e);
    }
  };

  const handlePressCard = async (notif: any) => {
    if (!notif.isRead) {
      try {
        setUnreadCount(prev => Math.max(0, prev - 1));
        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n));
        await markNotificationAsRead(notif.id);
      } catch (e) {
        console.error(e);
      }
    }
    // Optionally route to a screen based on notif.type
  };

  const renderIcon = (type: string) => {
    switch (type) {
      case 'WATERING': return { name: 'water-drop', color: '#FF6B5C', bg: 'rgba(255, 107, 92, 0.15)' };
      case 'ACHIEVEMENT': return { name: 'emoji-events', color: '#3FA86B', bg: 'rgba(63, 168, 107, 0.15)' };
      case 'SOCIAL': return { name: 'person', color: '#FFB627', bg: 'rgba(255, 182, 39, 0.15)' };
      default: return { name: 'notifications', color: '#3FA86B', bg: 'rgba(63, 168, 107, 0.15)' };
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      
      <Stack.Screen 
        options={{ 
          headerShown: true,
          title: 'Notifikasi',
          headerTitleAlign: 'center',
          headerTitleStyle: { fontFamily: 'Nunito_700Bold', fontSize: 17, color: '#123924' },
          headerStyle: { backgroundColor: '#FBF8F0' },
          headerShadowVisible: false,
          headerLeft: () => (
            <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.backButton, pressed && styles.pressed, { marginLeft: 16 }]}>
              <MaterialIcons name="arrow-back" size={24} color="#123924" />
            </Pressable>
          ),
          headerRight: () => (
            <Pressable onPress={handleMarkAllRead} style={({ pressed }) => [pressed && styles.pressed, { marginRight: 16 }]}>
              <Text style={styles.headerAction}>Tandai Dibaca</Text>
            </Pressable>
          )
        }} 
      />

      <ScrollView 
        contentContainerStyle={[styles.scrollContent, isLoading && { flex: 1, justifyContent: 'center' }]} 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => { setIsRefreshing(true); fetchNotifs(); }} colors={['#3FA86B']} />}
      >
        {isLoading ? (
          <ActivityIndicator size="large" color="#3FA86B" />
        ) : notifications.length === 0 ? (
          <View style={{ alignItems: 'center', marginTop: 40, opacity: 0.5 }}>
            <MaterialIcons name="notifications-off" size={48} color="#123924" />
            <Text style={{ marginTop: 12, fontFamily: 'Nunito_700Bold', color: '#123924' }}>Belum ada notifikasi.</Text>
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
                <Pressable key={notif.id} onPress={() => handlePressCard(notif)} style={({ pressed }) => [styles.card, notif.isRead ? styles.cardRead : styles.cardUnread, pressed && styles.cardPressed]}>
                  <View style={[styles.iconContainer, { backgroundColor: notif.isRead ? iconDef.bg : iconDef.color }]}>
                    <MaterialIcons name={iconDef.name as any} size={22} color={notif.isRead ? iconDef.color : "#FFFFFF"} />
                  </View>
                  <View style={styles.cardContent}>
                    <View style={styles.cardHeader}>
                      <Text style={notif.isRead ? styles.cardTitleRead : styles.cardTitle} numberOfLines={1}>{notif.title}</Text>
                      <Text style={styles.cardTime}>{getRelativeTime(notif.createdAt)}</Text>
                    </View>
                    <Text style={styles.cardDesc}>{notif.message}</Text>
                  </View>
                  {!notif.isRead && <View style={[styles.unreadDot, { backgroundColor: iconDef.color }]} />}
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
    paddingVertical: 16,
    backgroundColor: 'rgba(251, 248, 240, 0.85)',
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
    fontFamily: 'Nunito_700Bold',
    fontSize: 17,
    color: '#123924',
  },
  headerAction: {
    fontFamily: 'Nunito_700Bold', // approximating font-semibold
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
  avatarContainer: {
    width: 44,
    height: 44,
    position: 'relative',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(18, 57, 36, 0.1)',
  },
  avatarBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFB627',
    borderWidth: 2,
    borderColor: '#FFFFFF',
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
