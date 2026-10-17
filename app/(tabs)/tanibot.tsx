import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, FlatList, Keyboard, KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
import { useNotification } from '../../components/NotificationContext';
import { ChatMessage, getTanibotHistory, clearTanibotHistory, sendTanibotMessage } from '../../services/api';

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

const TypingIndicator = () => {
  const [fadeAnim] = useState(() => new Animated.Value(0.3));
  
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 0.3, duration: 600, useNativeDriver: true })
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [fadeAnim]);

  return (
    <Animated.View style={[styles.bubbleWrapperLeft, { marginTop: 8, opacity: fadeAnim }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Image
          source={require('../../assets/images/navbar/chatbot.svg')}
          style={[styles.messageBotAvatar, { marginBottom: 0 }]}
          contentFit="contain"
        />
        <View style={[styles.bubbleBot, { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 12, paddingHorizontal: 16 }]}>
          <ActivityIndicator size="small" color="#5C5A4F" />
          <Text style={[styles.bubbleText, styles.textBot, { fontStyle: 'italic', color: '#5C5A4F' }]}>
            TaniBot sedang merangkai kata...
          </Text>
        </View>
      </View>
    </Animated.View>
  );
};


const formatMarkdown = (text: string) => {
  if (!text || typeof text !== 'string') return null;
  
  // 1. Bersihkan bullet point markdown agar rapi menjadi simbol '• '
  let cleanText = text;
  // Tangani kasus '* **Judul:**' atau '- **Judul:**' -> '• **Judul:**'
  cleanText = cleanText.replace(/^\s*[*-]\s+\*\*(.*?)\*\*/gm, '• **$1**');
  // Tangani kasus typo model AI tanpa spasi '*Judul:**' -> '• **Judul:**'
  cleanText = cleanText.replace(/^\*([^*\n]+?)\*\*/gm, (match, p1) => {
    const title = p1.replace(/:+$/, '');
    return `• **${title}:**`;
  });
  // Tangani bullet biasa '* ' atau '- ' di awal baris (tidak diikuti asterisk lain)
  cleanText = cleanText.replace(/^\s*[*-](?!\*)\s+/gm, '• ');

  // 2. Split teks berdasarkan penanda bold (**...**) dan italic (*...*)
  const parts = cleanText.split(/(\*\*.*?\*\*|\*[^*\n*]+\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      return (
        <Text key={index} style={{ fontFamily: 'Nunito_800ExtraBold', color: '#1c1c17' }}>
          {part.slice(2, -2)}
        </Text>
      );
    } else if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return (
        <Text key={index} style={{ fontStyle: 'italic', color: '#1c1c17' }}>
          {part.slice(1, -1)}
        </Text>
      );
    }
    return <Text key={index}>{part}</Text>;
  });
};


const ChatMessageItem = memo(({ item }: { item: ChatMessage }) => {
  const isUser = item.role === "USER";
  return (
    <View style={[styles.bubbleWrapper, isUser ? styles.bubbleWrapperRight : styles.bubbleWrapperLeft]}>
      {!isUser ? (
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8 }}>
          <Image
            source={require('../../assets/images/navbar/chatbot.svg')}
            style={styles.messageBotAvatar}
            contentFit="contain"
          />
          <View style={{ flexShrink: 1 }}>
            <View style={[styles.bubble, styles.bubbleBot]}>
              <Text style={[styles.bubbleText, styles.textBot]}>
                {formatMarkdown(item.message)}
              </Text>
            </View>
            <Text style={styles.timeText}>{getRelativeTime(item.createdAt)}</Text>
          </View>
        </View>
      ) : (
        <View style={{ alignSelf: 'flex-end' }}>
          <View style={[styles.bubble, styles.bubbleUser]}>
            <Text style={[styles.bubbleText, styles.textUser]}>
              {formatMarkdown(item.message)}
            </Text>
          </View>
          <Text style={[styles.timeText, { textAlign: 'right' }]}>{getRelativeTime(item.createdAt)}</Text>
        </View>
      )}
    </View>
  );
});

const ChatSkeleton = () => {
  const [fadeAnim] = useState(() => new Animated.Value(0.4));

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 0.4, duration: 800, useNativeDriver: true })
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [fadeAnim]);

  return (
    <Animated.View style={{ padding: 20, gap: 16, opacity: fadeAnim }}>
      <View style={[styles.bubbleBot, { width: 200, height: 60, backgroundColor: '#E8E5DA', borderColor: '#E8E5DA' }]} />
      <View style={[styles.bubbleUser, { width: 160, height: 50, backgroundColor: '#E8E5DA', alignSelf: 'flex-end' }]} />
      <View style={[styles.bubbleBot, { width: 240, height: 80, backgroundColor: '#E8E5DA', borderColor: '#E8E5DA' }]} />
    </Animated.View>
  );
};

const generateLocalBotResponse = (prompt: string): string => {
  const query = prompt.toLowerCase();

  if (
    query.includes("hama") ||
    query.includes("kutu") ||
    query.includes("ulat") ||
    query.includes("jamur") ||
    query.includes("penyakit") ||
    query.includes("semut") ||
    query.includes("belalang")
  ) {
    return (
      "Berdasarkan analisis botani TaniBot, serangan hama umum pada tanaman urban (seperti kutu putih, ulat grayak, atau kutu daun) dapat ditangani dengan langkah berikut:\n\n" +
      "• **Semprotan Pestisida Nabati:** Campurkan 1 liter air dengan 5 ml minyak nimba (neem oil) atau ekstrak bawang putih serta 2 tetes sabun cuci piring lembut sebagai perekat. Semprotkan merata ke balik daun pada pagi hari.\n" +
      "• **Isolasi Tanaman:** Jauhkan tanaman yang terinfeksi dari tanaman sehat lain agar kutu atau ulat tidak menyebar.\n" +
      "• **Pembersihan Manual:** Bersihkan daun yang terkena koloni kutu dengan kapas yang dibasahi air sabun hangat atau pangkas daun yang rusak parah."
    );
  }

  if (
    query.includes("siram") ||
    query.includes("air") ||
    query.includes("lembab") ||
    query.includes("kering") ||
    query.includes("frekuensi")
  ) {
    return (
      "Mengenai panduan pengaturan penyiraman tanaman di kebun Anda:\n\n" +
      "• **Metode Uji Jari:** Masukkan jari sedalam 2-3 cm ke dalam media tanam. Siram hanya jika tanah terasa kering di kedalaman tersebut.\n" +
      "• **Waktu Terbaik:** Lakukan penyiraman pada pagi hari (pukul 06.00-08.00) agar daun lekas mengering saat matahari naik dan mencegah timbulnya jamur akar.\n" +
      "• **Drainase:** Pastikan lubang pot lancar dan air tidak menggenang di piringan pot untuk menghindari busuk akar (root rot)."
    );
  }

  if (
    query.includes("pupuk") ||
    query.includes("nutrisi") ||
    query.includes("npk") ||
    query.includes("ab mix") ||
    query.includes("kompos")
  ) {
    return (
      "Panduan pemupukan dan nutrisi tanaman:\n\n" +
      "• **Fase Vegetatif (Daun & Tunas):** Berikan pupuk berkadar Nitrogen (N) tinggi seperti NPK 16-16-16 dosis ringan (1/2 sendok teh per liter air) setiap 1-2 minggu sekali atau kompos matang di permukaan media.\n" +
      "• **Sistem Hidroponik:** Jaga kepekatan larutan AB Mix pada rentang 800-1200 PPM sesuai jenis tanaman sayur (seperti selada atau pakcoy) dan periksa pH larutan di kisaran 5.5 - 6.5.\n" +
      "• **Fase Generatif (Bunga & Buah):** Tingkatkan unsur Fosfor (P) dan Kalium (K) saat tanaman mulai membentuk kuncup bunga."
    );
  }

  if (
    query.includes("kuning") ||
    query.includes("layu") ||
    query.includes("rontok") ||
    query.includes("bercak") ||
    query.includes("klorosis")
  ) {
    return (
      "Penyebab dan penanganan daun kuning atau layu:\n\n" +
      "• **Kelebihan Air (Overwatering):** Daun menguning merata dan terasa lembek biasanya menandakan tanah terlalu basah atau drainase mampet. Kurangi frekuensi siram dan longgarkan media tanam.\n" +
      "• **Defisiensi Nutrisi:** Daun bawah menguning dengan tulang daun tetap hijau umumnya tanda kekurangan Nitrogen atau Zat Besi. Berikan pupuk organik cair atau NPK seimbang.\n" +
      "• **Kurang Sinar Matahari:** Tanaman terlihat kurus meninggi (etiolasi) dan daun pucat. Pindahkan pot ke area yang terkena sinar matahari minimal 4-6 jam sehari."
    );
  }

  if (
    query.includes("panen") ||
    query.includes("petik") ||
    query.includes("kematangan")
  ) {
    return (
      "Panduan waktu dan teknik panen tanaman:\n\n" +
      "• **Sayuran Daun (Bayam, Kangkung, Selada):** Panen dapat dilakukan pada umur 25-35 hari setelah tanam. Cabut bersama akar atau potong pangkal batang 2-3 cm dari tanah agar bisa tumbuh kembali (regrowth).\n" +
      "• **Sayuran Buah (Cabai, Tomat):** Petik saat buah sudah 80-90% matang berwarna cerah beserta tangkainya di pagi hari agar kesegaran bertahan lama.\n" +
      "• **Catatan Perawatan:** Setelah panen, segera berikan nutrisi atau gemburkan kembali media tanam untuk siklus tanam berikutnya."
    );
  }

  if (
    query.includes("hidroponik") ||
    query.includes("rakit apung") ||
    query.includes("nft") ||
    query.includes("wick")
  ) {
    return (
      "Panduan instalasi dan pemeliharaan hidroponik:\n\n" +
      "• **Kontrol Suhu Air:** Pastikan suhu tandon air nutrisi tidak melebihi 28 derajat Celcius agar penyerapan oksigen akar tetap maksimal.\n" +
      "• **Kebersihan Tandon:** Kuras dan bersihkan tandon nutrisi setiap 10-14 hari sekali guna menghindari lumut dan penumpukan garam mineral.\n" +
      "• **Sirkulasi Oksigen:** Pastikan aerator atau pompa mengalirkan air dengan lancar agar akar tidak mengalami hipoksia."
    );
  }

  return (
    "Halo! Saya TaniBot siap membantu kebun urban Anda.\n\n" +
    "Berikut adalah prinsip utama perawatan kebun sehat:\n" +
    "• **Pencahayaan:** Pastikan tanaman mendapatkan sinar matahari langsung atau tidak langsung minimal 4-6 jam setiap hari.\n" +
    "• **Kelembapan Tanah:** Siram tanaman secukupnya ketika lapisan atas tanah mulai mengering, hindari genangan air berlebih.\n" +
    "• **Sirkulasi Udara:** Berikan jarak antar-pot agar sirkulasi udara baik dan mencegah kelembapan tinggi pemicu jamur.\n\n" +
    "Silakan tanyakan hal spesifik seputar hama, nutrisi pupuk, teknik hidroponik, atau panduan panen tanaman Anda!"
  );
};

export default function TanibotScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const coordsRef = useRef<{ lat?: number; lng?: number }>({});
  const sendingLockRef = useRef(false);

  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSub = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow', () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide', () => setKeyboardVisible(false));
    return () => { showSub.remove(); hideSub.remove(); };
  }, []);

  // Cache user coordinates in memory once on mount
  useEffect(() => {
    SecureStore.getItemAsync("userData").then(userDataStr => {
      if (userDataStr) {
        try {
          const user = JSON.parse(userDataStr);
          coordsRef.current = { lat: user.latitude, lng: user.longitude };
        } catch {}
      }
    }).catch(() => {});
  }, []);

  // 0ms instant history load from AsyncStorage
  useEffect(() => {
    const loadCache = async () => {
      try {
        const cached = await AsyncStorage.getItem("tanibot_history");
        if (cached) {
          const parsed: ChatMessage[] = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMessages(parsed);
            setIsLoadingHistory(false);
          }
        }
      } catch {}
    };
    loadCache();
  }, []);

  // Fetch updated history from server in background
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await getTanibotHistory(1, 30);
        const data = res.data || [];
        const sorted = data.sort((a: ChatMessage, b: ChatMessage) => a.id - b.id);
        // Jangan timpa state jika user sudah terlanjur mengirim pesan baru!
        if (!sendingLockRef.current) {
          setMessages(sorted);
          AsyncStorage.setItem("tanibot_history", JSON.stringify(sorted)).catch(() => {});
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoadingHistory(false);
      }
    };
    fetchHistory();
  }, []);

  const { showNotification } = useNotification();
  const [showClearModal, setShowClearModal] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const handleClearHistory = () => {
    if (messages.length === 0) {
      showNotification("Informasi", "Belum ada riwayat percakapan untuk dihapus.", "info");
      return;
    }
    setShowClearModal(true);
  };

  const confirmClearHistory = async () => {
    setIsClearing(true);
    try {
      await clearTanibotHistory();
      setMessages([]);
      AsyncStorage.removeItem("tanibot_history").catch(() => {});
      setShowClearModal(false);
      showNotification("Berhasil", "Riwayat percakapan TaniBot berhasil dibersihkan.", "success");
    } catch (e: any) {
      console.error(e);
      showNotification("Gagal", e.response?.data?.message || "Gagal menghapus riwayat chat.", "error");
    } finally {
      setIsClearing(false);
    }
  };

  const handleSend = async (customText?: string) => {
    const rawText = typeof customText === 'string' ? customText : inputText;
    if (!rawText.trim() || sendingLockRef.current || isSending) return;
    
    sendingLockRef.current = true;
    setIsSending(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const textToSend = rawText.trim();
    const userMsg: ChatMessage = {
      id: Date.now(),
      role: "USER",
      message: textToSend,
      createdAt: new Date().toISOString()
    };
    
    setMessages(prev => {
      const next = [...prev, userMsg];
      AsyncStorage.setItem("tanibot_history", JSON.stringify(next)).catch(() => {});
      return next;
    });
    setInputText("");
    Keyboard.dismiss();
    
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      const { lat, lng } = coordsRef.current;
      const replyText = await sendTanibotMessage(textToSend, lat, lng);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      const botMsg: ChatMessage = {
        id: Date.now() + 1,
        role: "BOT",
        message: replyText,
        createdAt: new Date().toISOString()
      };
      setMessages(prev => {
        const next = [...prev, botMsg];
        AsyncStorage.setItem("tanibot_history", JSON.stringify(next)).catch(() => {});
        return next;
      });
    } catch (e: any) {
      console.warn("TaniBot API unreachable or rate-limited, switching to Smart Local Fallback:", e?.message);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const fallbackReply = generateLocalBotResponse(textToSend);
      const botMsg: ChatMessage = {
        id: Date.now() + 1,
        role: "BOT",
        message: fallbackReply,
        createdAt: new Date().toISOString()
      };
      setMessages(prev => {
        const next = [...prev, botMsg];
        AsyncStorage.setItem("tanibot_history", JSON.stringify(next)).catch(() => {});
        return next;
      });
    } finally {
      setIsSending(false);
      sendingLockRef.current = false;
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 150);
    }
  };

  const renderMessage = useCallback(({ item }: { item: ChatMessage }) => {
    return <ChatMessageItem item={item} />;
  }, []);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar style="dark" />
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.headerAvatarContainer}>
              <Image
                source={require('../../assets/images/navbar/chatbot.svg')}
                style={styles.headerAvatar}
                contentFit="contain"
              />
              <View style={styles.onlineBadge} />
            </View>
            <View>
              <Text style={styles.headerTitle}>TaniBot</Text>
              <Text style={styles.headerSubtitle}>Asisten cerdas tanaman kamu</Text>
            </View>
          </View>

          <Pressable 
            onPress={handleClearHistory}
            style={({ pressed }) => [{ padding: 8 }, pressed && { opacity: 0.7 }]}
          >
            <MaterialIcons name="delete-sweep" size={24} color="#FF6B5C" />
          </Pressable>
        </View>

        {/* CHAT AREA */}
        <View style={{ flex: 1, backgroundColor: '#FBF8F0' }}>
          {isLoadingHistory ? (
            <ChatSkeleton />
          ) : (
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={{ padding: 20 }}
              keyboardShouldPersistTaps="handled"
              onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
              ListEmptyComponent={
                <View>
                  <View style={styles.welcomeContainer}>
                    <View style={styles.welcomeIconWrapper}>
                      <Image
                        source={require('../../assets/images/icontampilanawal/seedling-halo.svg')}
                        style={styles.welcomeMascotImage}
                        contentFit="contain"
                      />
                    </View>
                    <Text style={styles.welcomeTitle}>Halo! Aku TaniBot</Text>
                    <Text style={styles.welcomeSubtitle}>
                      Asisten pintar pertanian kamu. Tanyakan apa saja seputar perawatan tanaman, jadwal panen, atau cuaca hari ini!
                    </Text>
                  </View>

                  <View style={styles.quickPromptSection}>
                    <View style={styles.quickPromptHeader}>
                      <MaterialIcons name="lightbulb-outline" size={16} color="#3FA86B" />
                      <Text style={styles.quickPromptLabel}>Coba tanyakan langsung:</Text>
                    </View>
                    <View style={styles.quickPromptChipsWrap}>
                      {[
                        "Apakah tanamanku perlu disiram hari ini?",
                        "Kapan tanamanku panen?",
                        "Apa tips merawat tanaman tomat?",
                      ].map((q, i) => (
                        <Pressable 
                          key={i}
                          onPress={() => handleSend(q)}
                          style={({ pressed }) => [
                            styles.quickPromptChip,
                            pressed && { opacity: 0.75, backgroundColor: '#D4EED8' }
                          ]}
                        >
                          <MaterialIcons name="chat-bubble-outline" size={14} color="#1F5C3D" style={{ marginRight: 6 }} />
                          <Text style={styles.quickPromptText}>{q}</Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                </View>
              }
              renderItem={renderMessage}
              ListFooterComponent={
                isSending ? (
                  <TypingIndicator />
                ) : null
              }
            />
          )}
        </View>

        {/* INPUT AREA */}
        <View style={[styles.inputArea, isKeyboardVisible && { paddingBottom: 16 }]}>
          <TextInput
            style={styles.inputField}
            placeholder="Tanya TaniBot..."
            placeholderTextColor="#a09d91"
            value={inputText}
            onChangeText={setInputText}
            maxLength={500}
            multiline
          />
          <Pressable 
            style={[styles.sendButton, (!inputText.trim() || isSending) && { opacity: 0.6 }]}
            onPress={() => handleSend()}
            disabled={!inputText.trim() || isSending}
          >
            <MaterialIcons name="send" size={20} color="#FFFFFF" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      {/* MODAL KONFIRMASI HAPUS RIWAYAT CHAT */}
      <Modal
        visible={showClearModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowClearModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Image
              source={require('../../assets/images/icontampilanawal/seedling-ngantuk.svg')}
              style={styles.modalMascot}
              contentFit="contain"
            />
            <Text style={styles.modalTitle}>Hapus Riwayat Chat?</Text>
            <Text style={styles.modalDesc}>
              Semua percakapan kamu dengan TaniBot akan dibersihkan dan tidak bisa dikembalikan.
            </Text>
            <View style={styles.modalButtonRow}>
              <Pressable
                style={({ pressed }) => [styles.modalBtnCancel, pressed && { opacity: 0.8 }]}
                onPress={() => setShowClearModal(false)}
                disabled={isClearing}
              >
                <Text style={styles.modalBtnCancelText}>Batal</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.modalBtnDelete, pressed && { opacity: 0.8 }]}
                onPress={confirmClearHistory}
                disabled={isClearing}
              >
                {isClearing ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.modalBtnDeleteText}>Hapus</Text>
                )}
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
    backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E5DA',
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Nunito_800ExtraBold',
    color: '#123924' },
  headerSubtitle: {
    fontSize: 12,
    fontFamily: 'Nunito_500Medium',
    color: '#5C5A4F' },
  welcomeContainer: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 0,
    shadowColor: "#123924", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 14, elevation: 4,
    marginBottom: 16,
    marginTop: 10 },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerAvatarContainer: {
    position: 'relative',
  },
  headerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E8F5E9',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#3FA86B',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  messageBotAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E8F5E9',
    marginBottom: 16,
  },
  welcomeIconWrapper: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 2.5,
    borderColor: '#C8E6C9',
  },
  welcomeMascotImage: {
    width: 76,
    height: 86,
  },
  welcomeTitle: {
    fontSize: 20,
    fontFamily: 'Nunito_800ExtraBold',
    color: '#123924',
    marginBottom: 8,
    textAlign: 'center' },
  welcomeSubtitle: {
    fontSize: 14,
    fontFamily: 'Nunito_500Medium',
    color: '#5C5A4F',
    textAlign: 'center',
    lineHeight: 22 },
  quickPromptSection: {
    marginTop: 4,
  },
  quickPromptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  quickPromptLabel: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 13,
    color: '#5C5A4F',
  },
  quickPromptChipsWrap: {
    gap: 8,
  },
  quickPromptChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: '#C8E6C9',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  quickPromptText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 13,
    color: '#123924',
    flexShrink: 1,
  },
  bubbleWrapper: {
    marginBottom: 20,
    maxWidth: '82%',
  },
  bubbleWrapperLeft: {
    alignSelf: 'flex-start' },
  bubbleWrapperRight: {
    alignSelf: 'flex-end' },
  bubble: {
    paddingHorizontal: 16,
    paddingVertical: 12 },
  bubbleUser: {
    backgroundColor: '#3FA86B',
    borderRadius: 18,
    borderBottomRightRadius: 4 },
  bubbleBot: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8E5DA',
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    shadowColor: '#123924',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  bubbleText: {
    fontSize: 14,
    fontFamily: 'Nunito_500Medium',
    lineHeight: 22 },
  textUser: {
    color: '#FFFFFF' },
  textBot: {
    color: '#1c1c17' },
  timeText: {
    fontSize: 10,
    fontFamily: 'Nunito_500Medium',
    color: '#a09d91',
    marginTop: 4,
    marginHorizontal: 4 },
  inputArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    paddingBottom: 110,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E8E5DA',
    gap: 12,
  },
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
    color: '#123924',
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3FA86B',
    borderWidth: 0,
    
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#123924", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 14, elevation: 4 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(18, 57, 36, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FBF8F0',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#123924',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  modalMascot: {
    width: 100,
    height: 100,
    marginBottom: 16,
  },
  modalTitle: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 22,
    color: '#123924',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalDesc: {
    fontFamily: 'Nunito_500Medium',
    fontSize: 14,
    color: '#5C5A4F',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  modalButtonRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalBtnCancel: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#E8E5DA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBtnCancelText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 15,
    color: '#123924',
  },
  modalBtnDelete: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#FF4C4C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBtnDeleteText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 15,
    color: '#FFFFFF',
  },
});
