import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView, 
  Image, 
  TextInput,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function PostDetailScreen() {
  const router = useRouter();
  const [comment, setComment] = useState('');

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color="#123924" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Postingan</Text>
          <TouchableOpacity style={styles.iconButton}>
            <MaterialIcons name="more-vert" size={24} color="#123924" />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {/* POSTER INFO */}
          <View style={styles.posterSection}>
            <View style={styles.avatarContainer}>
              <Image 
                source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAHpA2h9Xeksrx_zJsReBf4qHAt_4CwWnsHC3PSRliGBeizlEPeAf_T-NQncOxzs9V3MqSWBdu431MQiaCFxWqnjbElfaNtAF09T29JE1a0LUvnIhxLlSu77dxDjl7bkSdGGtxQJgdyVu4FVMfZ88p2R9z10xbbeD8Phw5GMCDOqgCfFRPXzl4IyMAFVjVAXp2CMzqZkzW6W2URnnoy7OmhdmlvjzeAGnRZxFwF_uJbJ4yNvy4hTXgTDg' }} 
                style={styles.avatarImage} 
              />
            </View>
            <View style={styles.posterInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.posterName}>Fatih</Text>
                <View style={styles.streakBadge}>
                  <Text style={styles.streakText}>🔥 12</Text>
                </View>
              </View>
              <Text style={styles.postTime}>2 jam lalu</Text>
            </View>
          </View>

          {/* MAIN CONTENT */}
          <View style={styles.mainContent}>
            <View style={styles.postImageContainer}>
              <Image 
                source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAYOf5nkjNIzXp5f_MmTZDxbPZO_X6aHeiP8-A4HffY9tZqI-LSpZPkQwF_LjvqnHc8OCwClPv1ZHtqV2mbf9N_YvNnsq1FOIBLiAWyVFWRlM_k5ktVRWm3PkPlVC_dG-GuqYlJ1wOCrc-PvgdHGd6YEgfgtKjPQgXyORq1KJ808IMA3HID2w1tN_QnUW-NL7bSv5Pb6RCqo0R8FiOC4Z4ZX3P-jNjBSyaXFobBK4J3iD2cuxyxcNEKpA' }} 
                style={styles.postImage} 
              />
            </View>
            
            <View style={styles.tagBadge}>
              <Text style={styles.tagText}>Hari ke-14 · Cabai Rawit</Text>
            </View>
            
            <Text style={styles.postText}>
              Cabai rawitku mulai merah-merah nih! Seneng banget akhirnya bisa panen sendiri di balkon. 🌱🌶️
            </Text>

            {/* REACTIONS */}
            <View style={styles.reactionRow}>
              <TouchableOpacity style={styles.reactionBtn}>
                <MaterialIcons name="favorite" size={24} color="#FF6B5C" />
                <Text style={styles.reactionText}>24</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.reactionBtn}>
                <MaterialIcons name="chat-bubble" size={24} color="#5C5A4F" />
                <Text style={styles.reactionText}>12</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.divider} />

          {/* COMMENTS SECTION */}
          <View style={styles.commentsSection}>
            <View style={styles.commentHeaderRow}>
              <Text style={styles.commentTitle}>Komentar</Text>
              <View style={styles.liveBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>LIVE</Text>
              </View>
            </View>

            {/* Comment 1 (New / Highlighted) */}
            <View style={[styles.commentCard, styles.commentCardHighlighted]}>
              <View style={styles.commentAvatarBox}>
                <Image source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAzD8vRKVP4qnyonmjKrDw0BsD3UEXgafQI-rR9HKMNAyEl0I1G0xIj9QRNkIwHS0iHZusaHxQ081EkdqJdzb-kiORr7HLlNCWSiPb6pfop10ozog_Hnk9xO1xmUux1ZOudfmvT5H3etVNEj392Qo9DetsmMQtbFngFDz3z8_TYp0wJ9wo42BhnO8GCPqy7in0dJd1YPKTVeQnOHl1lJ4yGdaVdG5-5FK9chnHY1UqUXtVFNi8QJYtFcA' }} style={styles.commentAvatar} />
              </View>
              <View style={styles.commentBody}>
                <View style={styles.commentNameRow}>
                  <View style={styles.commentNameLeft}>
                    <Text style={styles.commentName}>Budi_Tani</Text>
                    <Text style={styles.commentTime}>Baru saja</Text>
                  </View>
                  <TouchableOpacity>
                    <MaterialIcons name="favorite-border" size={20} color="#5C5A4F" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.commentText}>Wah, mantap mas! Pake pupuk apa tuh biar cepat merah?</Text>
              </View>
            </View>

            {/* Comment 2 */}
            <View style={styles.commentCard}>
              <View style={styles.commentAvatarBox}>
                <Image source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCNXYuoUg4Qn2xEyPk04NgX14FZudRjVohWmDFTr_0rieYvSkmWsqNKiwlAv3Z7T2fAFwoWDQkqgs3ENs8Zu2cdosbObAJj7R9od9ednlVnIdF_DRdMfwFAIoqcQbxYTvlOgRGFvVzsImvOTjN7fDEFtwo65n9a6FGGSwawQiJyYygN6V7R2hwbsXavMSmfOxleMust1VtcP7UOQ-4VUX3-n64CQbXMXZxjcS2NfjRw09KQW_gHZ5m9fg' }} style={styles.commentAvatar} />
              </View>
              <View style={styles.commentBody}>
                <View style={styles.commentNameRow}>
                  <View style={styles.commentNameLeft}>
                    <Text style={styles.commentName}>Sari_Daun</Text>
                    <Text style={styles.commentTime}>15 mnt lalu</Text>
                  </View>
                  <TouchableOpacity>
                    <MaterialIcons name="favorite" size={20} color="#FF6B5C" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.commentText}>Wah segar banget kelihatannya! Kalau ada sisa bibit bagi-bagi dong hehe.</Text>
              </View>
            </View>

            {/* Comment 3 (Initial Avatar) */}
            <View style={styles.commentCard}>
              <View style={[styles.commentAvatarBox, { backgroundColor: '#b1f1c8', justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ fontWeight: 'bold', color: '#34704f' }}>A</Text>
              </View>
              <View style={styles.commentBody}>
                <View style={styles.commentNameRow}>
                  <View style={styles.commentNameLeft}>
                    <Text style={styles.commentName}>Agus_G</Text>
                    <Text style={styles.commentTime}>1 jam lalu</Text>
                  </View>
                  <TouchableOpacity>
                    <MaterialIcons name="favorite-border" size={20} color="#5C5A4F" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.commentText}>Awas kena hama daun keriting mas, lagi musim nih.</Text>
              </View>
            </View>

          </View>
        </ScrollView>

        {/* BOTTOM INPUT BAR */}
        <View style={styles.bottomBar}>
          <View style={styles.inputContainer}>
            <TextInput 
              style={styles.textInput}
              placeholder="Tulis komentar..."
              placeholderTextColor="#5C5A4F"
              value={comment}
              onChangeText={setComment}
            />
          </View>
          <TouchableOpacity style={styles.sendButton} activeOpacity={0.8}>
            <MaterialIcons name="send" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fcf9f1',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 2,
    borderBottomColor: '#123924',
    paddingHorizontal: 16,
    paddingVertical: 12,
    zIndex: 50,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#123924',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#123924',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1c1c17',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    paddingBottom: 100, // Space for bottom bar
  },
  posterSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#123924',
    backgroundColor: '#ebe8e0',
    overflow: 'hidden',
    marginRight: 12,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  posterInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  posterName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1c1c17',
  },
  streakBadge: {
    backgroundColor: '#FFB627',
    borderWidth: 2,
    borderColor: '#123924',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  streakText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#123924',
  },
  postTime: {
    fontSize: 11,
    color: '#5C5A4F',
    marginTop: 2,
  },
  mainContent: {
    marginBottom: 16,
  },
  postImageContainer: {
    width: '100%',
    height: 256,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#123924',
    backgroundColor: '#ebe8e0',
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#123924',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  postImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  tagBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#2E9E8C',
    borderWidth: 2,
    borderColor: '#123924',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 12,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#ffffff',
  },
  postText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#1c1c17',
    marginBottom: 16,
  },
  reactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    paddingBottom: 16,
  },
  reactionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reactionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#123924',
  },
  divider: {
    width: '100%',
    height: 2,
    backgroundColor: '#123924',
    marginBottom: 16,
  },
  commentsSection: {
    gap: 12,
  },
  commentHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 4,
  },
  commentTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1c1c17',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#006d3c',
    borderWidth: 2,
    borderColor: '#123924',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 6,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  liveText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  commentCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#123924',
    padding: 16,
    gap: 12,
    shadowColor: '#123924',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  commentCardHighlighted: {
    borderLeftWidth: 6,
    borderLeftColor: '#006d3c',
  },
  commentAvatarBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#123924',
    overflow: 'hidden',
  },
  commentAvatar: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  commentBody: {
    flex: 1,
  },
  commentNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  commentNameLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  commentName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1c1c17',
  },
  commentTime: {
    fontSize: 11,
    color: '#5C5A4F',
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#1c1c17',
    marginTop: 4,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 2,
    borderTopColor: '#123924',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  inputContainer: {
    flex: 1,
  },
  textInput: {
    backgroundColor: '#fcf9f1',
    borderWidth: 2,
    borderColor: '#123924',
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#1c1c17',
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3fa86b',
    borderWidth: 2,
    borderColor: '#123924',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#123924',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  }
});