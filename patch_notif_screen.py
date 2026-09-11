import re

with open('app/pengaturan-notifikasi.tsx', 'r') as f:
    content = f.read()

# Replace handleToggle
old_toggle = """  const handleToggle = async (value: boolean) => {
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
  };"""

new_toggle = """  const handleToggle = async (value: boolean) => {
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
  };"""

content = content.replace(old_toggle, new_toggle)

# Replace handleTimeSelect
old_time = """  const handleTimeSelect = async (timeOption: typeof TIME_OPTIONS[0]) => {
    setSelectedTime(timeOption);
    await SecureStore.setItemAsync('notifTime', JSON.stringify({ hour: timeOption.hour, minute: timeOption.minute }));
    
    if (isEnabled) {
      await scheduleDailyPlantReminder(timeOption.hour, timeOption.minute);
      showNotification("Diupdate", `Reminder diatur ke jam ${timeOption.label}`);
    }
  };"""

new_time = """  const handleTimeSelect = async (timeOption: typeof TIME_OPTIONS[0]) => {
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
  };"""

content = content.replace(old_time, new_time)

# Replace useEffect
old_effect = """  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedEnabled = await SecureStore.getItemAsync('notifEnabled');
        const savedTimeStr = await SecureStore.getItemAsync('notifTime');
        
        if (savedEnabled === 'true') {
          setIsEnabled(true);
        }
        
        if (savedTimeStr) {
          const parsedTime = JSON.parse(savedTimeStr);
          const foundTime = TIME_OPTIONS.find(t => t.hour === parsedTime.hour && t.minute === parsedTime.minute);
          if (foundTime) {
            setSelectedTime(foundTime);
          }
        }
      } catch (error) {
        console.error("Failed to load notification settings", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSettings();
  }, []);"""

new_effect = """  useEffect(() => {
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
  }, []);"""

content = content.replace(old_effect, new_effect)

with open('app/pengaturan-notifikasi.tsx', 'w') as f:
    f.write(content)
