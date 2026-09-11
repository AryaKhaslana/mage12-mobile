import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Switch, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
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
        const savedEnabled = await SecureStore.getItemAsync('notifEnabled');
        const savedTimeStr = await SecureStore.getItemAsync('notifTime');
        
        if (savedTimeStr) {
          const parsedTime = JSON.parse(savedTimeStr);
          const foundTime = TIME_OPTIONS.find(t => t.hour === parsedTime.hour && t.minute === parsedTime.minute);
          if (foundTime) {
            setSelectedTime(foundTime);
          }
        }

        if (savedEnabled === 'true') {
          const granted = await registerForPushNotificationsAsync();
          if (granted && savedTimeStr) {
            const t = JSON.parse(savedTimeStr);
            setIsEnabled(true);
            await scheduleDailyPlantReminder(t.hour, t.minute);
          } else {
            setIsEnabled(false);
            await SecureStore.setItemAsync('notifEnabled', 'false');
          }
        }
      } catch (error) {
        console.error("Failed to load notification settings", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    try {
      loadSettings();
    } catch (e) {
      console.error("Critical failure during loadSettings", e);
    }
  }, []);

  const handleToggle = async (value: boolean) => {
    try {
      setIsEnabled(value);
      await SecureStore.setItemAsync('notifEnabled', value ? 'true' : 'false');
      
      if (value) {
        const granted = await registerForPushNotificationsAsync();
        if (granted) {
          await scheduleDailyPlantReminder(selectedTime.hour, selectedTime.minute);
          showNotification("Sukses", "Reminder aktif! 🌱");
        } else {
          Alert.alert("Izin Ditolak", "Izin notifikasi ditolak — aktifkan dari pengaturan HP");
          setIsEnabled(false);
          await SecureStore.setItemAsync('notifEnabled', 'false');
        }
      } else {
        await cancelAllPlantReminders();
        showNotification("Dimatikan", "Reminder dimatikan");
      }
    } catch (e) {
      console.error(e);
      setIsEnabled(!value);
      Alert.alert("Gagal", "Tidak bisa mengatur reminder. Coba lagi.");
    }
  };

  const handleTimeSelect = async (timeOption: typeof TIME_OPTIONS[0]) => {
    const previousTime = selectedTime;
    try {
      setSelectedTime(timeOption);
      await SecureStore.setItemAsync('notifTime', JSON.stringify({ hour: timeOption.hour, minute: timeOption.minute }));
      
      if (isEnabled) {
        await scheduleDailyPlantReminder(timeOption.hour, timeOption.minute);
        showNotification("Diupdate", `Reminder diatur ke jam ${timeOption.label}`);
      }
    } catch (e) {
      console.error(e);
      setSelectedTime(previousTime);
      Alert.alert("Gagal", "Tidak bisa mengatur reminder. Coba lagi.");
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
        <Pressable onPress={() => router.back()} style={{ marginRight: 16 }} hitSlop={10}>
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
            TaniSync akan mengingatkanmu setiap hari untuk merawat tanamanmu 🌱
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FBF8F0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#E8E5DA',
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Nunito_800ExtraBold',
    color: '#123924',
  },
  content: {
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#123924',
    borderRadius: 24,
    padding: 20,
    boxShadow: '4px 4px 0px #123924',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  toggleLabel: {
    fontSize: 16,
    fontFamily: 'Nunito_700Bold',
    color: '#123924',
  },
  timeSelectionContainer: {
    marginTop: 8,
    marginBottom: 16,
  },
  timeLabel: {
    fontSize: 14,
    fontFamily: 'Nunito_700Bold',
    color: '#5C5A4F',
    marginBottom: 12,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#123924',
    borderRadius: 100,
  },
  chipSelected: {
    backgroundColor: '#3FA86B',
  },
  chipText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: '#123924',
  },
  chipTextSelected: {
    color: '#FFFFFF',
  },
  descriptionText: {
    fontSize: 12,
    fontFamily: 'Nunito_500Medium',
    color: '#5C5A4F',
    marginTop: 8,
    lineHeight: 18,
  }
});
