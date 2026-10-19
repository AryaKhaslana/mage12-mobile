import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Switch, ActivityIndicator, Modal, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';
import api, { registerOnLogout } from '../services/api';
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

let memoryNotifSettings: { isEnabled: boolean; selectedTime: typeof TIME_OPTIONS[0] } | null = null;
registerOnLogout(() => {
  memoryNotifSettings = null;
});

export default function PengaturanNotifikasiScreen() {
  const [isEnabled, setIsEnabled] = useState(() => memoryNotifSettings ? memoryNotifSettings.isEnabled : false);
  const [selectedTime, setSelectedTime] = useState(() => memoryNotifSettings ? memoryNotifSettings.selectedTime : TIME_OPTIONS[1]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  
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

        const targetTime = matchedTime || selectedTime;
        memoryNotifSettings = { isEnabled: shouldEnable, selectedTime: targetTime };

        // Verifikasi izin yang sudah ada tanpa memunculkan pop-up izin mendadak di mount
        if (shouldEnable) {
          const targetTime = matchedTime || selectedTime;
          Notifications.getPermissionsAsync().then(({ status }) => {
            if (status === 'granted') {
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
      if (memoryNotifSettings) {
        memoryNotifSettings.isEnabled = value;
      }
      await SecureStore.setItemAsync('notifEnabled', value ? 'true' : 'false');
      
      if (value) {
        const { status: existingStatus, canAskAgain } = await Notifications.getPermissionsAsync().catch(() => ({ status: 'undetermined' as Notifications.PermissionStatus, canAskAgain: true }));
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
          if (canAskAgain) {
            const perm = await Notifications.requestPermissionsAsync().catch(() => ({ status: 'denied' as Notifications.PermissionStatus, canAskAgain: false }));
            finalStatus = perm.status;
          }
        }

        if (finalStatus === 'granted') {
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
          showNotification("Pengingat Aktif", `Pengingat harian berhasil diaktifkan untuk pukul ${selectedTime.label}.`, "success");
        } else {
          setIsEnabled(false);
          if (memoryNotifSettings) {
            memoryNotifSettings.isEnabled = false;
          }
          await SecureStore.setItemAsync('notifEnabled', 'false');

          if (!canAskAgain) {
            setShowPermissionModal(true);
          } else {
            showNotification(
              "Izin Notifikasi Ditolak",
              "Silakan aktifkan izin notifikasi melalui pengaturan perangkat kamu untuk menerima pengingat harian.",
              "error"
            );
          }
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
        showNotification("Pengingat Nonaktif", "Pengingat harian telah dinonaktifkan.", "info");
      }
    } catch (e) {
      console.error(e);
      setIsEnabled(!value);
      if (memoryNotifSettings) {
        memoryNotifSettings.isEnabled = !value;
      }
      showNotification("Gagal", "Tidak dapat memperbarui pengaturan pengingat. Silakan coba lagi.", "error");
    }
  };

  const handleTimeSelect = async (timeOption: typeof TIME_OPTIONS[0]) => {
    Haptics.selectionAsync().catch(() => {});
    const previousTime = selectedTime;
    try {
      setSelectedTime(timeOption);
      if (memoryNotifSettings) {
        memoryNotifSettings.selectedTime = timeOption;
      }
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
        showNotification("Jadwal Tersimpan", `Pengingat harian berhasil diatur untuk pukul ${timeOption.label}.`, "success");
      }
    } catch (e) {
      console.error(e);
      setSelectedTime(previousTime);
      if (memoryNotifSettings) {
        memoryNotifSettings.selectedTime = previousTime;
      }
      showNotification("Gagal", "Tidak dapat mengubah waktu pengingat. Silakan coba lagi.", "error");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* HEADER */}
      <View style={styles.header}>
        <Pressable 
          onPress={() => router.back()} 
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

      {/* MODAL PANDUAN PENGATURAN IZIN NOTIFIKASI */}
      <Modal
        visible={showPermissionModal}
        transparent
        animationType="fade"
        statusBarTranslucent={true}
        onRequestClose={() => setShowPermissionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.permissionModalCard}>
            <View style={styles.modalIconContainer}>
              <MaterialIcons name="notifications-off" size={32} color="#FF6B5C" />
            </View>
            <Text style={styles.modalAlertTitle}>Izin Notifikasi Dinonaktifkan</Text>
            <Text style={styles.modalAlertSubtitle}>
              Kamu sebelumnya menonaktifkan izin notifikasi untuk TaniSync. Agar pengingat perawatan tanaman dapat berbunyi tepat waktu, aktifkan izin notifikasi di Pengaturan HP kamu.
            </Text>
            <View style={styles.modalButtonCol}>
              <Pressable
                style={({ pressed }) => [styles.settingsPrimaryBtn, pressed && styles.btnPressed]}
                onPress={() => {
                  setShowPermissionModal(false);
                  Linking.openSettings();
                }}
              >
                <Text style={styles.settingsPrimaryBtnText}>Buka Pengaturan HP</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.settingsSecondaryBtn, pressed && styles.btnPressed]}
                onPress={() => setShowPermissionModal(false)}
              >
                <Text style={styles.settingsSecondaryBtnText}>Nanti Saja</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(18, 57, 36, 0.6)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  permissionModalCard: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    shadowColor: "#123924",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  modalIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FFECEB",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  modalAlertTitle: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 18,
    color: "#123924",
    textAlign: "center",
    marginBottom: 8,
  },
  modalAlertSubtitle: {
    fontFamily: "Nunito_500Medium",
    fontSize: 14,
    color: "#5C5A4F",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  modalButtonCol: {
    width: "100%",
    gap: 10,
  },
  settingsPrimaryBtn: {
    width: "100%",
    backgroundColor: "#3FA86B",
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
  },
  settingsPrimaryBtnText: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 15,
    color: "#FFFFFF",
  },
  settingsSecondaryBtn: {
    width: "100%",
    backgroundColor: "#FBF8F0",
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E8E5DA",
  },
  settingsSecondaryBtnText: {
    fontFamily: "Nunito_700Bold",
    fontSize: 15,
    color: "#5C5A4F",
  },
  btnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
});
