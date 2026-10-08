import re

filepath = '/mnt/06F6460AF645FA87/Project_MAGE/mage12-mobile/app/notifikasi.tsx'
with open(filepath, 'r') as f:
    content = f.read()

# Replace static UI with dynamic fetch
old_imports = """import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';"""

new_imports = """import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image, ActivityIndicator, RefreshControl } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getMyNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../services/api';
import { getRelativeTime } from '../utils/format';"""

content = content.replace(old_imports, new_imports)

old_body_start = """export default function NotifikasiScreen() {
  return ("""

new_body_start = """export default function NotifikasiScreen() {
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

  return ("""

content = content.replace(old_body_start, new_body_start)

# Replace the static views inside ScrollView with dynamic mapping
content = re.sub(
    r'<ScrollView contentContainerStyle=\{styles\.scrollContent\} showsVerticalScrollIndicator=\{false\}>.*?</ScrollView>',
    r"""<ScrollView 
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
      </ScrollView>""",
    content,
    flags=re.DOTALL
)

# Connect "Tandai Dibaca" button
content = content.replace(
    '<Pressable style={({ pressed }) => [pressed && styles.pressed]}>',
    '<Pressable onPress={handleMarkAllRead} style={({ pressed }) => [pressed && styles.pressed]}>'
)

with open(filepath, 'w') as f:
    f.write(content)
print("Updated notifikasi UI with dynamic data!")
