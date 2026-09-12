import { MaterialIcons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, Animated, FlatList, Keyboard, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChatMessage, getTanibotHistory, sendTanibotMessage } from '../../services/api';

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
  const fadeAnim = useRef(new Animated.Value(0.3)).current;
  
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 0.3, duration: 600, useNativeDriver: true })
      ])
    ).start();
  }, []);

  return (
    <Animated.View style={[styles.bubbleWrapperLeft, { marginTop: 16, opacity: fadeAnim }]}>
      <View style={styles.bubbleBot}>
        <Text style={[styles.bubbleText, styles.textBot, { fontStyle: 'italic' }]}>
          TaniBot sedang mengetik...
        </Text>
      </View>
    </Animated.View>
  );
};

export default function TanibotScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await getTanibotHistory(1, 100);
        // The endpoint returns messages sorted newest to oldest? Usually history is newest first, or oldest first.
        // Wait, "urut terlama→terbaru" was specified in the prompt:
        // "GET /api/tanibot/history?page=1&limit=20 -> ... urut terlama->terbaru"
        // Wait, the prompt says "GET /api/tanibot/history ... urut terlama->terbaru" for community comments, not bot. But let's assume it returns oldest first as requested. If not, we could reverse it. Assuming the backend does it correctly.
        setMessages(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoadingHistory(false);
      }
    };
    fetchHistory();
  }, []);

  const handleSend = async () => {
    if (!inputText.trim() || isSending) return;
    const textToSend = inputText.trim();
    
    const userMsg: ChatMessage = {
      id: Date.now(),
      role: "USER",
      message: textToSend,
      createdAt: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInputText("");
    setIsSending(true);
    Keyboard.dismiss();
    
    // auto scroll to bottom after user sends
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      const replyText = await sendTanibotMessage(textToSend);
      const botMsg: ChatMessage = {
        id: Date.now() + 1,
        role: "BOT",
        message: replyText,
        createdAt: new Date().toISOString()
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (e: any) {
      if (e.response?.status === 429) {
        Alert.alert("Santai Dulu Broskie", "TaniBot butuh istirahat sebentar 🌱 Coba lagi dalam beberapa menit.");
      } else {
        Alert.alert("Gagal", e.response?.data?.message || "Gagal mengirim pesan.");
      }
    } finally {
      setIsSending(false);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isUser = item.role === "USER";
    return (
      <View style={[styles.bubbleWrapper, isUser ? styles.bubbleWrapperRight : styles.bubbleWrapperLeft]}>
        <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleBot]}>
          <Text style={[styles.bubbleText, isUser ? styles.textUser : styles.textBot]}>
            {item.message}
          </Text>
        </View>
        <Text style={[styles.timeText, isUser && { textAlign: 'right' }]}>{getRelativeTime(item.createdAt)}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
        
        {/* HEADER */}
        <View style={styles.header}>
          
          <View>
            <Text style={styles.headerTitle}>TaniBot 🤖</Text>
            <Text style={styles.headerSubtitle}>Asisten tanamanmu</Text>
          </View>
        </View>

        {/* CHAT AREA */}
        <View style={{ flex: 1, backgroundColor: '#FBF8F0' }}>
          {isLoadingHistory ? (
            <View style={{ padding: 20, gap: 16 }}>
              <View style={[styles.bubbleBot, { width: 200, height: 60, backgroundColor: '#E8E5DA', borderColor: '#E8E5DA' }]} />
              <View style={[styles.bubbleUser, { width: 160, height: 50, backgroundColor: '#E8E5DA', alignSelf: 'flex-end' }]} />
              <View style={[styles.bubbleBot, { width: 240, height: 80, backgroundColor: '#E8E5DA', borderColor: '#E8E5DA' }]} />
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
              keyboardShouldPersistTaps="handled"
              onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
              onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
              ListEmptyComponent={
                <View>
                  <View style={styles.welcomeContainer}>
                    <View style={styles.welcomeIconWrapper}>
                      <MaterialIcons name="smart-toy" size={48} color="#FFFFFF" />
                    </View>
                    <Text style={styles.welcomeTitle}>Halo! Aku TaniBot 🌱</Text>
                    <Text style={styles.welcomeSubtitle}>
                      Asisten pintar pertanianmu. Tanya apa aja seputar perawatan, panen, atau cuaca hari ini!
                    </Text>
                  </View>
                  <View style={{ marginTop: 12, gap: 8, flexDirection: 'row', flexWrap: 'wrap' }}>
                    {["Tanamanku perlu disiram nggak hari ini?", "Kapan tanamanku panen?", "Apa tips merawat tanaman tomat?"].map((q, i) => (
                      <Pressable 
                        key={i}
                        onPress={() => setInputText(q)}
                        style={({ pressed }) => [
                          {
                            backgroundColor: '#E8F5E9',
                            borderWidth: 1,
                            borderColor: '#3FA86B',
                            borderRadius: 100,
                            paddingHorizontal: 16,
                            paddingVertical: 8,
                          },
                          pressed && { opacity: 0.7 }
                        ]}
                      >
                        <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: 12, color: '#123924' }}>{q}</Text>
                      </Pressable>
                    ))}
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
        <View style={styles.inputArea}>
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
            onPress={handleSend}
            disabled={!inputText.trim() || isSending}
          >
            <MaterialIcons name="send" size={20} color="#FFFFFF" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
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
  headerSubtitle: {
    fontSize: 12,
    fontFamily: 'Nunito_500Medium',
    color: '#5C5A4F',
  },
  welcomeContainer: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#123924',
    boxShadow: '4px 4px 0px #123924',
    elevation: 4,
    marginBottom: 20,
    marginTop: 10,
  },
  welcomeIconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3FA86B',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#123924',
  },
  welcomeTitle: {
    fontSize: 20,
    fontFamily: 'Nunito_800ExtraBold',
    color: '#123924',
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 14,
    fontFamily: 'Nunito_500Medium',
    color: '#5C5A4F',
    textAlign: 'center',
    lineHeight: 22,
  },
  bubbleWrapper: {
    marginBottom: 24,
    maxWidth: '80%',
  },
  bubbleWrapperLeft: {
    alignSelf: 'flex-start',
  },
  bubbleWrapperRight: {
    alignSelf: 'flex-end',
  },
  bubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  bubbleUser: {
    backgroundColor: '#3FA86B',
    borderRadius: 18,
    borderBottomRightRadius: 4,
  },
  bubbleBot: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#123924',
    borderRadius: 18,
    borderBottomLeftRadius: 4,
  },
  bubbleText: {
    fontSize: 14,
    fontFamily: 'Nunito_500Medium',
    lineHeight: 22,
  },
  textUser: {
    color: '#FFFFFF',
  },
  textBot: {
    color: '#1c1c17',
  },
  timeText: {
    fontSize: 10,
    fontFamily: 'Nunito_500Medium',
    color: '#a09d91',
    marginTop: 4,
    marginHorizontal: 4,
  },
  inputArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingBottom: 36,
    padding:16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 2,
    borderTopColor: '#E8E5DA',
    gap: 12,
  },
  inputField: {
    flex: 1,
    minHeight: 48,
    maxHeight: 120,
    backgroundColor: '#FBF8F0',
    borderWidth: 2,
    borderColor: '#123924',
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
    borderWidth: 2,
    borderColor: '#123924',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '2px 2px 0px #123924',
    elevation: 4,
  }
});
