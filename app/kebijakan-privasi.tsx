import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import PolicySection from '../components/PolicySection';

export default function KebijakanPrivasiScreen() {
  const today = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* HEADER */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={{ marginRight: 16 }} hitSlop={10}>
          <MaterialIcons name="arrow-back" size={24} color="#123924" />
        </Pressable>
        <Text style={styles.headerTitle}>Kebijakan Privasi</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.subtitle}>Terakhir diperbarui: {today}</Text>

          <PolicySection 
            title="Data yang Kami Kumpulkan" 
            body="Saat registrasi: nama, username, email, nomor HP. Saat menggunakan app: data lokasi (GPS, hanya jika Anda mengizinkan — untuk fitur prakiraan cuaca), data tanaman & jadwal penyiraman, jurnal & riwayat panen, foto avatar & postingan, riwayat percakapan dengan TaniBot." 
          />
          <PolicySection 
            title="Penggunaan Data" 
            body="Menjalankan fitur aplikasi (pengingat penyiraman, prakiraan cuaca, komunitas, gamifikasi) dan memberikan konteks personal pada jawaban TaniBot. Catatan penting: pertanyaan Anda beserta konteks tanaman dikirim ke layanan AI pihak ketiga (Google Gemini) untuk menghasilkan jawaban. Data cuaca diperoleh dari OpenWeather berdasarkan lokasi perangkat Anda." 
          />
          <PolicySection 
            title="Berbagi Data" 
            body="Kami tidak menjual data pribadi Anda. Data hanya dibagikan ke penyedia layanan yang diperlukan (layanan AI, layanan cuaca, penyimpanan gambar cloud) serta terlihat pengguna lain sebatas konten yang Anda publikasikan sendiri di komunitas (postingan, komentar, nama profil)." 
          />
          <PolicySection 
            title="Penyimpanan & Keamanan" 
            body="Data akun tersimpan di server yang aman; password disimpan dalam bentuk hash terenkripsi dan tidak dapat dibaca siapa pun. Preferensi notifikasi disimpan secara lokal di perangkat Anda." 
          />
          <PolicySection 
            title="Hak Anda" 
            body="Anda dapat menghapus tanaman, postingan, dan komentar kapan saja dari aplikasi; mematikan pengingat harian melalui pengaturan notifikasi; serta meminta penghapusan akun beserta seluruh datanya dengan menghubungi tim pengembang." 
          />
          <PolicySection 
            title="Kontak" 
            body="Sampaikan pertanyaan tentang kebijakan ini kepada tim pengembang TaniSync." 
          />
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
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#123924',
    borderRadius: 24,
    padding: 20,
    boxShadow: '4px 4px 0px #123924',
  },
  subtitle: {
    fontSize: 13,
    fontFamily: 'Nunito_500Medium',
    color: '#5C5A4F',
    marginBottom: 20,
    fontStyle: 'italic',
  }
});
