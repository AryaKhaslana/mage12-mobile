import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    Image,
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const faqs = [
  {
    id: 1,
    question: 'Bagaimana cara mendapatkan dan menaikkan Level?',
    answer: 'Kamu bisa menaikkan level dengan mengumpulkan EXP. EXP didapatkan setiap kali kamu rajin menyiram tanaman sesuai jadwal dan menyelesaikan tugas harian di Dashboard.',
  },
  {
    id: 2,
    question: 'Apa fungsi dari ☔ Pelindung Streak?',
    answer: 'Pelindung Streak berfungsi menyelamatkan rekor beruntun (Streak) kamu agar api tidak padam jika kamu lupa menyiram tanaman dalam satu hari. Pelindung ini sangat berharga dan bisa didapatkan saat naik level!',
  },
  {
    id: 3,
    question: 'Bagaimana cara kerja Smart Watering & Prediksi Cuaca?',
    answer: 'Sistem TaniSync akan secara otomatis mendeteksi jika akan turun hujan lebat di area lahanmu hari ini. Jika iya, status penyiraman akan berubah menjadi "Ditunda Hujan" untuk menghemat air dan mencegah tanaman kelebihan air (overwatering).',
  },
  {
    id: 4,
    question: 'Bagaimana cara menggunakan Peta Wabah Hama Lokal?',
    answer: 'Buka menu Peta Hama, aplikasi akan mendeteksi lokasimu menggunakan GPS dan menampilkan potensi risiko serangan hama di sekitar area lahanmu secara real-time. Semakin merah zonanya, semakin waspada kamu harus menjaga tanamanmu!',
  }
];

export default function PusatBantuanScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(1);

  const filteredFaqs = faqs.filter(f => 
    f.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
    f.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <MaterialIcons name="arrow-back" size={20} color="#123924" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Image 
              source={require('../assets/images/icontampilanawal/seedling-halo.png')} 
              style={styles.headerLogo} 
            />
            <Text style={styles.headerTitle}>Pusat Bantuan</Text>
          </View>
        </View>
        <View style={[styles.profileImage, { backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: '#123924', alignItems: 'center', justifyContent: 'center' }]}>
          <MaterialIcons name="person" size={20} color="#123924" />
        </View>
      </View>

      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* HERO CARD */}
        <View style={styles.heroCard}>
          <View style={styles.heroContent}>
            <View style={styles.heroBadge}>
              <MaterialIcons name="arrow-back-ios" size={12} color="#3FA86B" style={{ marginLeft: 2 }} />
              <Text style={styles.heroBadgeText}>TaniCare 24/7</Text>
            </View>
            <Text style={styles.heroTitle}>Ada yang bisa kami bantu?</Text>
            <Text style={styles.heroSubtitle}>Cari solusi cepat atau tanyakan langsung pada tim TaniSync</Text>
          </View>
          <View style={styles.heroImageContainer}>
            <Image 
              source={require('../assets/images/icontampilanawal/seedling-halo.png')} 
              style={styles.heroImage} 
            />
          </View>
          <View style={styles.heroAmbientCircle} />
        </View>

        {/* SEARCH BAR */}
        <View style={styles.searchContainer}>
          <MaterialIcons name="search" size={22} color="#123924" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari kendala, panduan menyiram, sensor..."
            placeholderTextColor="#5C5A4F"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearBtn}>
              <MaterialIcons name="cancel" size={20} color="#5C5A4F" />
            </TouchableOpacity>
          )}
        </View>

        {/* QUICK CATEGORIES */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Kategori Bantuan</Text>
            <Text style={styles.sectionSubtitle}>4 Topik Utama</Text>
          </View>
          
          <View style={styles.gridContainer}>
            <TouchableOpacity style={styles.categoryCard} activeOpacity={0.8}>
              <View style={[styles.categoryIconBox, { backgroundColor: '#b1f1c8' }]}>
                <MaterialIcons name="eco" size={24} color="#123924" />
              </View>
              <Text style={styles.categoryTitle}>Perawatan Tanaman</Text>
              <Text style={styles.categoryDesc}>Nutrisi, jadwal siram & hama</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.categoryCard} activeOpacity={0.8}>
              <View style={[styles.categoryIconBox, { backgroundColor: 'rgba(255, 182, 39, 0.3)' }]}>
                <MaterialIcons name="notifications-active" size={24} color="#123924" />
              </View>
              <Text style={styles.categoryTitle}>Jadwal & Notifikasi</Text>
              <Text style={styles.categoryDesc}>Pengingat siram & panen</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.categoryCard} activeOpacity={0.8}>
              <View style={[styles.categoryIconBox, { backgroundColor: 'rgba(46, 158, 140, 0.2)' }]}>
                <MaterialIcons name="sensors" size={24} color="#123924" />
              </View>
              <Text style={styles.categoryTitle}>Sensor IoT</Text>
              <Text style={styles.categoryDesc}>Pairing wifi & kalibrasi</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.categoryCard} activeOpacity={0.8}>
              <View style={[styles.categoryIconBox, { backgroundColor: '#ffd9dc' }]}>
                <MaterialIcons name="group" size={24} color="#123924" />
              </View>
              <Text style={styles.categoryTitle}>Akun & Komunitas</Text>
              <Text style={styles.categoryDesc}>Poin, profil & feed sosial</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* FAQ SECTION */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Sering Ditanyakan (FAQ)</Text>
            <View style={styles.popularBadge}>
              <Text style={styles.popularBadgeText}>Populer</Text>
            </View>
          </View>

          <View style={styles.faqList}>
            {filteredFaqs.map((faq) => {
              const isExpanded = expandedId === faq.id;
              return (
                <View key={faq.id} style={styles.faqCard}>
                  <TouchableOpacity 
                    style={styles.faqToggle} 
                    onPress={() => setExpandedId(isExpanded ? null : faq.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.faqQuestion}>{faq.question}</Text>
                    <MaterialIcons 
                      name="expand-more" 
                      size={22} 
                      color="#123924" 
                      style={{ transform: [{ rotate: isExpanded ? '180deg' : '0deg' }] }}
                    />
                  </TouchableOpacity>
                  
                  {isExpanded && (
                    <View style={styles.faqContent}>
                      <View style={styles.faqDivider} />
                      <Text style={styles.faqAnswer}>{faq.answer}</Text>
                    </View>
                  )}
                </View>
              );
            })}
            
            {filteredFaqs.length === 0 && (
              <Text style={{ textAlign: 'center', marginTop: 20, fontFamily: 'Nunito_500Medium', color: '#5C5A4F' }}>
                Tidak ada hasil ditemukan
              </Text>
            )}
          </View>
        </View>

        {/* CONTACT SUPPORT */}
        <View style={styles.contactCard}>
          <View style={styles.contactHeader}>
            <View style={styles.contactIconBox}>
              <MaterialIcons name="headset-mic" size={28} color="#123924" />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactTitle}>Masih Butuh Bantuan?</Text>
              <Text style={styles.contactDesc}>Tim TaniSync siap mendampingi kebun urbanmu secara langsung.</Text>
              <View style={styles.contactHours}>
                <View style={styles.onlineDot} />
                <Text style={styles.contactHoursText}>Senin - Minggu: 08.00 - 20.00 WIB</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.contactButtons}>
            <TouchableOpacity 
              style={styles.waButton} 
              activeOpacity={0.8}
              onPress={() => Linking.openURL('https://wa.me/6281234567890?text=Halo%20TaniCare,%20saya%20butuh%20bantuan%20seputar%20TaniSync.')}
            >
              <MaterialIcons name="chat" size={20} color="#FFFFFF" />
              <Text style={styles.waButtonText}>Chat via WhatsApp</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.ticketButton} 
              activeOpacity={0.8}
              onPress={() => Linking.openURL('mailto:support@tanisync.id?subject=Tiket Pengaduan TaniSync&body=Halo tim TaniCare, saya ingin melaporkan masalah:')}
            >
              <MaterialIcons name="mail" size={20} color="#123924" />
              <Text style={styles.ticketButtonText}>Kirim Email Pengaduan</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    height: 64,
    backgroundColor: 'rgba(251, 248, 240, 0.85)',
    zIndex: 50,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#123924',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '3px 3px 0px #123924',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerLogo: {
    width: 32,
    height: 32,
    resizeMode: 'contain',
  },
  headerTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 20,
    color: '#123924',
  },
  profileImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
    gap: 24,
  },
  
  /* HERO CARD */
  heroCard: {
    backgroundColor: '#E3F5EC',
    borderRadius: 24,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    boxShadow: '0px 8px 20px rgba(18,57,36,0.12)',
  },
  heroContent: {
    flex: 1,
    gap: 4,
    zIndex: 10,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 100,
    alignSelf: 'flex-start',
    boxShadow: '0px 2px 8px rgba(18,57,36,0.08)',
    marginBottom: 4,
  },
  heroBadgeText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 11,
    color: '#123924',
  },
  heroTitle: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 20,
    color: '#123924',
  },
  heroSubtitle: {
    fontFamily: 'Nunito_500Medium',
    fontSize: 12,
    color: '#123924',
    opacity: 0.8,
  },
  heroImageContainer: {
    width: 80,
    height: 80,
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  heroAmbientCircle: {
    position: 'absolute',
    right: -24,
    bottom: -24,
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: '#D2EFE0',
    opacity: 0.6,
  },
  
  /* SEARCH BAR */
  searchContainer: {
    position: 'relative',
    justifyContent: 'center',
  },
  searchIcon: {
    position: 'absolute',
    left: 16,
    zIndex: 10,
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#123924',
    borderRadius: 16,
    paddingVertical: 14,
    paddingLeft: 48,
    paddingRight: 40,
    fontFamily: 'Nunito_500Medium',
    fontSize: 15,
    color: '#123924',
    boxShadow: '3px 3px 0px #123924',
  },
  clearBtn: {
    position: 'absolute',
    right: 14,
    zIndex: 10,
    padding: 4,
  },
  
  /* SECTIONS */
  section: {
    gap: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 18,
    color: '#123924',
  },
  sectionSubtitle: {
    fontFamily: 'Nunito_500Medium',
    fontSize: 12,
    color: '#5C5A4F',
  },
  
  /* CATEGORIES */
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  categoryCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#123924',
    padding: 16,
    boxShadow: '3px 3px 0px #123924',
  },
  categoryIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#123924',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  categoryTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 15,
    color: '#123924',
  },
  categoryDesc: {
    fontFamily: 'Nunito_500Medium',
    fontSize: 11,
    color: '#5C5A4F',
    marginTop: 2,
  },
  
  /* FAQ SECTION */
  popularBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: '#FFB627',
    borderRadius: 100,
    borderWidth: 2,
    borderColor: '#123924',
  },
  popularBadgeText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 11,
    color: '#123924',
  },
  faqList: {
    gap: 12,
  },
  faqCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#123924',
    boxShadow: '3px 3px 0px #123924',
    overflow: 'hidden',
  },
  faqToggle: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: 16,
    gap: 12,
  },
  faqQuestion: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 15,
    color: '#123924',
    flex: 1,
    lineHeight: 20,
  },
  faqContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  faqDivider: {
    height: 1,
    backgroundColor: '#f1eee6',
    marginBottom: 12,
  },
  faqAnswer: {
    fontFamily: 'Nunito_500Medium',
    fontSize: 15,
    color: '#5C5A4F',
    lineHeight: 24,
  },
  
  /* CONTACT SUPPORT */
  contactCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#123924',
    padding: 16,
    gap: 16,
    boxShadow: '4px 4px 0px #123924',
    marginBottom: 32,
  },
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  contactIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#b1f1c8',
    borderWidth: 2,
    borderColor: '#123924',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactInfo: {
    flex: 1,
  },
  contactTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 17,
    color: '#123924',
  },
  contactDesc: {
    fontFamily: 'Nunito_500Medium',
    fontSize: 12,
    color: '#5C5A4F',
    marginTop: 2,
  },
  contactHours: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  onlineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#3FA86B',
  },
  contactHoursText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 12,
    color: '#123924',
  },
  contactButtons: {
    gap: 12,
  },
  waButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#3FA86B',
    paddingVertical: 12,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: '#123924',
    boxShadow: '3px 3px 0px #123924',
  },
  waButtonText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 15,
    color: '#FFFFFF',
  },
  ticketButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: '#123924',
    boxShadow: '3px 3px 0px #123924',
  },
  ticketButtonText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: '#123924',
  }
});

