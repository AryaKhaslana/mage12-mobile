# 📄 Product Requirements Document (PRD)
**Project Name:** TaniSync
**Platform:** Mobile Application (Android & iOS)
**Team:** Ready Set Go (MAGE 12)

---

## 1. Project Overview & Vision
TaniSync adalah aplikasi asisten urban farming cerdas berbasis otomasi cuaca dan jurnal tanaman terintegrasi[cite: 2]. Proyek ini bertujuan untuk meningkatkan rasio keberhasilan *urban farming* di lahan terbatas dengan mengeliminasi *human error* (seperti *overwatering*) melalui integrasi data cuaca *real-time*[cite: 2]. Selain itu, TaniSync bervisi untuk membangun ekonomi sirkular lokal melalui ekosistem berbagi pangan (barter/donasi) antar warga kota[cite: 2].

## 2. Target Audience & Scope
**Target Pengguna:**
*   Milenial dan Gen Z Perkotaan (usia 18-35 tahun) yang tertarik dengan gaya hidup berkelanjutan[cite: 2].
*   Masyarakat aktif teknologi dan *smartphone*[cite: 2].
*   Warga perkotaan dengan mobilitas tinggi dan jadwal padat[cite: 2].

**Batasan Proyek (Out of Scope):**
*   TaniSync HANYA untuk skala rumah tangga (hidroponik, *polybag*, pot)[cite: 2].
*   TIDAK mendukung skala komersial/agribisnis[cite: 2].
*   Fitur komunitas dan barter dibatasi secara hiperlokal (radius 1-2 KM atau tingkat kecamatan/kabupaten)[cite: 2].

---

## 3. Core Features (MVP)

### A. Otomasi Adaptif Berbasis Cuaca
*   **Deskripsi:** Sistem pengingat jadwal penyiraman yang dinamis.
*   **Logika:** Mengecek probabilitas hujan harian menggunakan OpenWeatherMap API[cite: 2]. Jika diprediksi hujan saat jadwal penyiraman, sistem otomatis menunda/membatalkan notifikasi untuk menghemat air dan mencegah akar busuk[cite: 2].

### B. Jurnal Linimasa Visual & Validasi
*   **Deskripsi:** *User* wajib melakukan validasi penyiraman/perawatan dengan mengunggah foto *real-time* via kamera aplikasi[cite: 2].
*   **Output:** Foto akan tersusun secara kronologis menjadi jurnal pertumbuhan tanaman dari fase bibit hingga panen[cite: 2].

### C. Predictive Harvest Score & Gamifikasi
*   **Deskripsi:** Sistem penilaian kesehatan tanaman.
*   **Logika:** Algoritma mengkalkulasi skor berdasarkan konsistensi *user* (validasi foto = +5 poin, klik darurat = +1 poin) dikawinkan dengan variabel cuaca[cite: 2]. 
*   **Gamifikasi:** Dilengkapi dengan fitur *Streak* harian dan *Leveling* *user* untuk menjaga retensi[cite: 2].

### D. Location-Based Community Feed
*   **Deskripsi:** Ruang interaksi hiperlokal antar *urban farmer*[cite: 2].
*   **Fungsi:** Membagikan *update* tanaman, bertanya solusi, dan mendistribusikan surplus panen secara barter atau donasi (gratis)[cite: 2]. Tidak ada fitur transaksi uang/jual-beli komersial.

### E. TaniBot (AI Assistant)
*   **Deskripsi:** *Chatbot* berbasis Generative AI.
*   **Fungsi:** Mendiagnosis masalah agronomis, penyakit tanaman, dan memberikan rekomendasi penanganan secara instan di dalam aplikasi[cite: 2].

---

## 4. Key User Flows

**Flow 1: Inisialisasi Tanaman**
1. *User* masuk ke halaman Beranda -> Tambah Tanaman.
2. Memilih jenis tanaman (contoh: Cabai, Selada) dan input tanggal tanam[cite: 2].
3. Sistem menghitung *Days to Harvest* secara otomatis dan mengaktifkan penjadwalan *cron-job* harian[cite: 2].

**Flow 2: Daily Care (Perawatan Harian)**
1. Pagi hari, *Backend* mengecek API Cuaca[cite: 2].
2. Jika cerah: *User* menerima *Push Notification*[cite: 2].
3. *User* membuka notifikasi -> Mengambil foto tanaman -> Mendapatkan poin maksimal[cite: 2].
4. Jika diprediksi hujan: *User* menerima notifikasi penundaan penyiraman.

**Flow 3: Community Surplus Sharing**
1. Tanaman mencapai masa panen berlebih (surplus).
2. *User* membuka tab Komunitas -> Membuat *postingan* penawaran barter/donasi[cite: 2].
3. Sistem memfilter postingan agar hanya terlihat oleh *user* lain dalam radius terdekat[cite: 2].
4. Terjadi interaksi di kolom komentar antar warga.

---

## 5. Success Metrics
*   Berfungsinya notifikasi adaptif yang tersinkronisasi dengan cuaca.
*   Berhasilnya sistem menunda pengingat saat hujan.
*   Fitur radius pada *Community Feed* memfilter *post* dengan akurat.
*   Kelancaran validasi unggah foto ke *cloud storage* (Cloudinary) tanpa *lag*[cite: 2].