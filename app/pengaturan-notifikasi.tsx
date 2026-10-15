import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Switch, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import * as Haptics from 'expo-haptics';
import api from '../services/api';
import { useNotification } from '../components/NotificationContext';
import { registerForPushNotificationsAsync, scheduleDailyPlantReminder, cancelAllPlantReminders } from '../services/notificationService';

const TIME_OPTIONS = [
  { label: '06:00', hour: 6, minute: 0 },
  { label: '07:00', hour: 7, minute: 0 },
  { label: '08:00', hour: 8, minute: 0 },
  { label: '16:00', hour: 16, minute: 0 },
  { label: '17:00', hour: 17, minute: 0 },
  { label: '18:00', hour: 18, minute: 0 },
];

export default function PengaturanNotifikasiScreen() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [selectedTime, setSelectedTime] = useState(TIME_OPTIONS[1]); // default 07:00
  const [isLoading, setIsLoading] = useState(true);
  
  const { showNotification } = useNotification();

  useEffect(() => {
    const loadSettings = async () => {
      try {
        let jamNotifBackend: string | null = null;
        const storedUserData = await SecureStore.getItemAsync('userData');
        if (storedUserData) {
          try {
            const parsedUser = JSON.parse(storedUserData);
            jamNotifBackend = parsedUser.jamNotif || null;
          } catch {}
        }

        const savedEnabled = await SecureStore.getItemAsync('notifEnabled');
        const savedTimeStr = await SecureStore.getItemAsync('notifTime');
        
        let matchedTime = null;
        if (jamNotifBackend) {
          matchedTime = TIME_OPTIONS.find(t => t.label === jamNotifBackend);
        } else if (savedTimeStr) {
          try {
            const parsedTime = JSON.parse(savedTimeStr);
            matchedTime = TIME_OPTIONS.find(t => t.hour === parsedTime.hour && t.minute === parsedTime.minute);
          } catch {}
        }

        if (matchedTime) {
          setSelectedTime(matchedTime);
        }

        const shouldEnable = jamNotifBackend !== null || savedEnabled === 'true';
        setIsEnabled(shouldEnable);

        // 0ms instant display - reveal UI immediately after reading SecureStore
        setIsLoading(false);

        // Run permission verification and schedule refresh in the background non-blocking
        if (shouldEnable) {
          const targetTime = matchedTime || selectedTime;
          registerForPushNotificationsAsync().then((granted) => {
            if (granted) {
              scheduleDailyPlantReminder(targetTime.hour, targetTime.minute).catch(() => {});
            } else {
              setIsEnabled(false);
              SecureStore.setItemAsync('notifEnabled', 'false').catch(() => {});
            }
          }).catch(() => {});
        }
      } catch (error) {
        console.error("Failed to load notification settings", error);
        setIsLoading(false);
      }
    };
    
    loadSettings();
  }, []);

  const handleToggle = async (value: boolean) => {
    Haptics.selectionAsync().catch(() => {});
    try {
      setIsEnabled(value);
      await SecureStore.setItemAsync('notifEnabled', value ? 'true' : 'false');
      
      if (value) {
        const granted = await registerForPushNotificationsAsync();
        if (granted) {
          await scheduleDailyPlantReminder(selectedTime.hour, selectedTime.minute);
          await api.put('/user/setting-notif', { jamNotif: selectedTime.label });
          const storedUser = await SecureStore.getItemAsync('userData');
          if (storedUser) {
            try {
              const u = JSON.parse(storedUser);
              u.jamNotif = selectedTime.label;
              await SecureStore.setItemAsync('userData', JSON.stringify(u));
            } catch {}
          }
          showNotification("Berhasil", "Pengingat harian berhasil diaktifkan!", "success");
        } else {
          showNotification("Izin Notifikasi Ditolak", "Silakan aktifkan izin notifikasi melalui pengaturan perangkat kamu untuk menerima pengingat harian.", "error");
          setIsEnabled(false);
          await SecureStore.setItemAsync('notifEnabled', 'false');
        }
      } else {
        await api.put('/user/setting-notif', { jamNotif: null });
        const storedUser = await SecureStore.getItemAsync('userData');
        if (storedUser) {
          try {
            const u = JSON.parse(storedUser);
            u.jamNotif = null;
            await SecureStore.setItemAsync('userData', JSON.stringify(u));
          } catch {}
        }
        await cancelAllPlantReminders();
        showNotification("Dinonaktifkan", "Pengingat harian telah dinonaktifkan.", "success");
      }
    } catch (e) {
      console.error(e);
      setIsEnabled(!value);
      showNotification("Gagal", "Tidak dapat memperbarui pengaturan pengingat. Silakan coba lagi.", "error");
    }
  };

  const handleTimeSelect = async (timeOption: typeof TIME_OPTIONS[0]) => {
    Haptics.selectionAsync().catch(() => {});
    const previousTime = selectedTime;
    try {
      setSelectedTime(timeOption);
      await SecureStore.setItemAsync('notifTime', JSON.stringify({ hour: timeOption.hour, minute: timeOption.minute }));
      
      await api.put('/user/setting-notif', { jamNotif: timeOption.label });
      const storedUser = await SecureStore.getItemAsync('userData');
      if (storedUser) {
        try {
          const u = JSON.parse(storedUser);
          u.jamNotif = timeOption.label;
          await SecureStore.setItemAsync('userData', JSON.stringify(u));
        } catch {}
      }
      
      if (isEnabled) {
        await scheduleDailyPlantReminder(timeOption.hour, timeOption.minute);
        showNotification("Berhasil Diperbarui", `Pengingat diatur untuk pukul ${timeOption.label}`, "success");
      }
    } catch (e) {
      console.error(e);
      setSelectedTime(previousTime);
      showNotification("Gagal", "Tidak dapat mengubah waktu pengingat. Silakan coba lagi.", "error");
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator size="large" color="#3FA86B" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* HEADER */}
      <View style={styles.header}>
        <Pressable 
          onPress={() => {
            Haptics.selectionAsync().catch(() => {});
            router.back();
          }} 
          style={{ marginRight: 16 }} 
          hitSlop={10}
        >
          <MaterialIcons name="arrow-back" size={24} color="#123924" />
        </Pressable>
        <Text style={styles.headerTitle}>Pengaturan Notifikasi</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Reminder Harian</Text>
            <Switch
              trackColor={{ false: "#E8E5DA", true: "#3FA86B" }}
              thumbColor={isEnabled ? "#FFFFFF" : "#f4f3f4"}
              ios_backgroundColor="#E8E5DA"
              onValueChange={handleToggle}
              value={isEnabled}
            />
          </View>
          
          {isEnabled && (
            <View style={styles.timeSelectionContainer}>
              <Text style={styles.timeLabel}>Pilih Waktu</Text>
              <View style={styles.chipsContainer}>
                {TIME_OPTIONS.map((time) => {
                  const isSelected = selectedTime.hour === time.hour && selectedTime.minute === time.minute;
                  return (
                    <Pressable
                      key={time.label}
                      style={[
                        styles.chip,
                        isSelected && styles.chipSelected
                      ]}
                      onPress={() => handleTimeSelect(time)}
                    >
                      <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                        {time.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          )}

          <Text style={styles.descriptionText}>
            TaniSync akan mengingatkanmu setiap hari untuk merawat tanamanmu 
          </Text>
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FBF8F0' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E5DA',
    backgroundColor: '#FFFFFF' },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Nunito_800ExtraBold',
    color: '#123924' },
  content: {
    padding: 20 },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 0,
    
    borderRadius: 24,
    padding: 20,
    shadowColor: "#123924", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 14, elevation: 4 },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16 },
  toggleLabel: {
    fontSize: 16,
    fontFamily: 'Nunito_700Bold',
    color: '#123924' },
  timeSelectionContainer: {
    marginTop: 8,
    marginBottom: 16 },
  timeLabel: {
    fontSize: 14,
    fontFamily: 'Nunito_700Bold',
    color: '#5C5A4F',
    marginBottom: 12 },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8 },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#FBF8F0',
    borderWidth: 1.5,
    borderColor: '#E8E5DA',
    borderRadius: 100 },
  chipSelected: {
    backgroundColor: '#3FA86B',
    borderColor: '#3FA86B' },
  chipText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: '#123924' },
  chipTextSelected: {
    color: '#FFFFFF' },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    
    borderBottomColor: '#E8E5DA' },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12 },
  menuText: {
    fontSize: 16,
    fontFamily: 'Nunito_700Bold',
    color: '#123924' },
  descriptionText: {
    fontSize: 12,
    fontFamily: 'Nunito_500Medium',
    color: '#5C5A4F',
    marginTop: 8,
    lineHeight: 18 }
});
