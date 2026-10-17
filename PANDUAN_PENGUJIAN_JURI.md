# PANDUAN PENGUJIAN CEPAT JURI (QUICK-START GUIDE)
**Aplikasi:** TaniSync — Smart Urban Farming Ecosystem  
**Kompetisi:** Multimedia and Game Event (MAGE) 12 — Institut Teknologi Sepuluh Nopember (ITS)  
**Kategori:** Application Development (AppDev)  
**Tim Pengembang:** SMK Telkom Sidoarjo  

---

## 1. AKUN DEMO SIAP UJI (RECOMMENDED)
Agar Dewan Juri dapat langsung menguji seluruh fitur aplikasi secara utuh tanpa perlu membuat data dari nol (termasuk riwayat tanaman, status *Streak* aktif, *Timelapse Memori* multi-hari, dan *Feed Komunitas* lokal), kami telah menyiapkan akun resmi yang sudah terisi data:

* **Email:** `demo@tanisync.com`
* **Password:** `tanisync123`
* **Nama Akun:** Sari Agraria (`@saridemo`)
* **Level:** Level 4 (Petani Teladan — 380 EXP)
* **Streak Aktif:** 12 Hari Beruntun (Kalender Keaktifan Penuh)
* **Pelindung Streak:** 3x (Proteksi Maksimal)
* **Lokasi Kebun:** Sidoarjo / Surabaya, Jawa Timur

*(Catatan: Dewan Juri juga dipersilakan mendaftar akun baru dari awal melalui menu **Daftar Akun** untuk menguji alur onboarding dan setup profil).*

---

## 2. LIMA SKENARIO FITUR UNGGULAN YANG WAJIB DICOBA

### A. Beranda Interaktif & Otomasi Cuaca Pintar (Smart Weather Watering)
1. Buka tab **Beranda (Home)**. Perhatikan ilustrasi *Farmer Scene* di bagian atas layar yang menyesuaikan waktu secara *real-time* (Pagi, Siang, Sore, atau Malam) serta kondisi cuaca lokasi terkini.
2. **Fitur Simulasi Cuaca / Hujan (Khusus Pengujian Juri):**
   * Untuk menguji bagaimana sistem merespons cuaca hujan tanpa harus menunggu turun hujan asli, **tekan dan tahan (long-press selama 1 detik)** pada kotak indikator cuaca di pojok kanan atas Beranda.
   * Langit akan berubah mendung, animasi rintik hujan akan turun, dan jadwal penyiraman pada kartu tanaman otomatis beralih ke status **"Ditunda Hujan"** guna mencegah pembusukan akar akibat kelebihan air (*overwatering*).
   * Tekan dan tahan kembali indikator cuaca untuk mengembalikan ke mode cuaca normal.

### B. Gamifikasi Kebun, Daily Streak, & Pelindung Streak
1. **Penyiraman Cepat & EXP Instan:**
   * Pada bagian **Tugas Hari Ini** di Beranda, perhatikan tanaman **Tomat Cherry Rooftop** yang berstatus *Perlu Siram*.
   * Tekan tombol centang hijau untuk melakukan validasi penyiraman. Efek haptic dan notifikasi instan akan muncul, serta poin EXP akun bertambah seketika (*Optimistic UI*).
2. **Peta Perjalanan Tani & Heatmap 28 Hari:**
   * Ketuk kartu **Streak / Level** di Beranda.
   * Layar modal gamifikasi akan menampilkan kalender *Heatmap* keaktifan 28 hari terakhir, status **3x Pelindung Streak** (menyelamatkan api streak agar tidak padam jika terlewat satu hari), dan rincian perolehan badge prestasi.

### C. Jurnal Tanaman & Timelapse "Play Memori"
1. Masuk ke tab **Tanaman**, lalu ketuk kartu tanaman **Tomat Cherry Rooftop** untuk membuka halaman detail.
2. Perhatikan tombol **Play Memori** (tombol bulat hijau dengan ikon putar di pojok kiri atas foto tanaman).
3. Tekan tombol **Play Memori** tersebut:
   * Aplikasi akan memutar animasi *timelapse* Ken-Burns berdurasi 1.1 detik per foto yang menampilkan fase pertumbuhan tanaman dari hari ke-1 (penyemaian benih), hari ke-10 (tunas daun sejati), hari ke-20 (vegetatif pot), hari ke-28 (fase berbunga), hingga hari ke-35 (pembentukan buah tomat cherry muda).
   * Fitur ini mendemonstrasikan integrasi jurnal visual berbasis tanggal tanam nyata.

### D. Komunitas Hibrida (Nasional & Radar Lokal 2 KM)
1. Buka tab **Komunitas**.
2. **Tab Terdekat (Radius 2 KM):**
   * Ketuk tab **Terdekat (2 KM)** di bagian atas feed.
   * Sistem secara otomatis menghitung jarak spasial menggunakan formula Haversine berbasis GPS. Dewan Juri akan melihat postingan, surplus panen, dan diskusi dari pegiat urban farming di sekitar radius 2 KM dari kebun Sari Agraria.
3. **Tab Nasional:**
   * Beralih ke tab **Nasional** untuk melihat seluruh postingan komunitas dari berbagai kota di Indonesia.
   * Dewan Juri dapat mencoba menyukai postingan (*Like* instan), membuka detail postingan untuk membaca diskusi komentar antar-petani, maupun membuat postingan baru.

### E. Asisten AI Kontekstual "TaniBot" & Radar Wabah Hama
1. **TaniBot AI (Asisten Pakar Pertanian):**
   * Ketuk tombol maskot bulat di tengah navigasi bawah.
   * TaniBot ditenagai model bahasa Google Gemini AI yang telah terintegrasi dengan konteks kebun pengguna. Cobalah tanyakan kendala spesifik, misalnya:
     * *"Bagaimana cara merawat tanaman tomat cherry saya di musim hujan?"*
     * *"Berapa takaran nutrisi AB Mix yang pas untuk selada hidroponik?"*
   * TaniBot akan menjawab secara akurat, solutif, dan ramah sesuai tanaman yang sedang Anda rawat.
2. **Peta Persebaran Wabah Hama Lokal:**
   * Buka kartu **Peta Wabah Hama** dari Beranda atau tab Komunitas.
   * Peta berbasis Leaflet interaktif akan memusatkan tampilan pada radius kebun pengguna.
   * Gunakan tombol filter (**Semua Hama, Kutu Putih, Wereng, Ulat**) untuk melihat sebaran intensitas risiko serangan hama secara visual (lapisan *heatmap* berwarna biru, hijau, kuning, hingga merah).

---

## 3. SPESIFIKASI TEKNIS & INSTALASI APK
* **Paket Aplikasi:** Android APK (`.apk` yang disertakan di dalam berkas RAR pengumpulan Tahap 2).
* **Kompatibilitas Sistem:** Android 8.0 (Oreo / API Level 26) hingga Android 14+.
* **Arsitektur Performa:**
  * Didukung arsitektur *0ms Local Cache-First* sehingga aplikasi dapat berpindah layar secara instan tanpa layar putih (*blank screen*).
  * Dilengkapi pengaman *GPS Anti-Hang Fallback*: jika pengujian dilakukan di dalam gedung atau ruangan tertutup tanpa sinyal satelit, sistem otomatis beralih ke koordinat cadangan dalam waktu maksimal 3.5 detik.
* **Izin Perangkat yang Diperlukan:**
  * **Lokasi (GPS):** Untuk penentuan cuaca lokal, radar komunitas 2 KM, dan peta hama.
  * **Kamera & Galeri:** Untuk pengambilan foto jurnal tanaman dan unggah postingan komunitas.
  * **Notifikasi:** Untuk pengingat harian jadwal penyiraman kebun.

---

*Disusun dengan penuh dedikasi oleh Tim Pengembang TaniSync — SMK Telkom Sidoarjo untuk Penjurian Tahap 2 MAGE 12 ITS.*

