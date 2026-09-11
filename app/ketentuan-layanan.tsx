import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import PolicySection from '../components/PolicySection';

export default function KetentuanLayananScreen() {
  const today = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* HEADER */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={{ marginRight: 16 }} hitSlop={10}>
          <MaterialIcons name="arrow-back" size={24} color="#123924" />
        </Pressable>
        <Text style={styles.headerTitle}>Ketentuan Layanan</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.subtitle}>Terakhir diperbarui: {today}</Text>

          <PolicySection 
            title="Sifat Informasi" 
            body="TaniSync adalah aplikasi pendamping pertanian untuk edukasi & produktivitas; informasi (termasuk jawaban TaniBot dan prakiraan cuaca) bersifat panduan, bukan jaminan hasil — keputusan akhir tetap di tangan pengguna." 
          />
          <PolicySection 
            title="Tanggung Jawab Pengguna" 
            body="Pengguna bertanggung jawab atas konten yang dipublikasikan di komunitas; konten yang melanggar (SARA, pornografi, pelecehan) dapat dihapus oleh pengembang." 
          />
          <PolicySection 
            title="Penggunaan Wajar" 
            body="Gunakan aplikasi secara wajar; fitur TaniBot memiliki batas jumlah pertanyaan (rate limit) untuk menjaga kualitas layanan." 
          />
          <PolicySection 
            title="Pembaruan Ketentuan" 
            body="Ketentuan ini dapat diperbarui; perubahan diumumkan melalui pembaruan aplikasi." 
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
