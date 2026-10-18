# Master Roadmap Quality Control (QC) & Skenario Pengujian End-to-End — TaniSync (MAGE 12)

Dokumen ini disusun oleh Tim Senior Mobile QA/QC Engineer dan UI/UX Auditor sebagai standar operasional prosedur (SOP) pengujian menyeluruh sebelum melakukan Final Release Build APK standalone pada aplikasi **TaniSync**.

Pengujian dirancang mulai dari kondisi instalasi bersih (*fresh install*), alur normal (*happy path*), skenario batas (*boundary / negative test*), hingga uji ketahanan jaringan ekstrem (*stress test & offline-first*).

---

## 1. Skenario Pengujian Fungsional End-to-End (Happy Path & Negative Test)

### Modul 1: Splash Screen, Onboarding, Autentikasi, dan Setup Awal

#### TC-MOD1-01: Splash Screen & Resolusi Sesi Awal (index.tsx)
* **Aksi Uji (Happy Path):** Buka aplikasi dalam kondisi cold-start. Perhatikan animasi benih jatuh, tetesan embun, pemekaran tunas, dan teks persentase loading.
* **Ekspektasi:** Animasi berjalan halus pada 60 FPS di UI thread, durasi loading terkendali (maksimal 1400 ms), getaran haptik aktif saat selesai, dan langsung diarahkan ke layar yang tepat:
  * User belum pernah buka app: diarahkan ke `/onboarding`.
  * User sudah pernah onboarding tapi belum login: diarahkan ke `/(auth)/login`.
  * User sudah login lengkap: langsung diarahkan ke `/(tabs)` dalam 0ms.
  * User sudah login tapi profil/lokasi belum lengkap: diarahkan ke `/profile-setup` atau `/location-setup`.
* **Uji Kasus Negatif (Negative/Boundary Test):**
  * *Buka app saat koneksi internet mati total (Airplane mode on):* Splash screen tidak boleh freeze atau crash selamanya; timeout maksimal 1400 ms tetap harus melepaskan rute ke layar tujuan.
  * *Ketuk layar berulang kali secara agresif saat animasi berjalan:* Animasi tidak boleh terpotong atau memicu double-navigation.

#### TC-MOD1-02: Onboarding Slider (onboarding.tsx)
* **Aksi Uji (Happy Path):** Geser carousel onboarding dari slide 1 sampai 4. Tekan tombol "Lanjut" atau tombol "Lewati" di pojok kanan atas.
* **Ekspektasi:** Indikator dot aktif berpindah dengan animasi spring, ilustrasi maskot tampil presisi tanpa terpotong, dan menekan slide terakhir atau "Lewati" menyimpan flag `hasSeenOnboarding = true` di AsyncStorage lalu mengarahkan ke `/(auth)/login`.
* **Uji Kasus Negatif:**
  * *Swipe cepat bolak-balik antara slide 1 dan 4:* Index dot tidak boleh desinkronisasi atau crash.
  * *Tekan tombol hardware back Android di slide 1:* Aplikasi terminasi dengan wajar, tidak looping ke slide sebelumnya.

#### TC-MOD1-03: Registrasi Akun Baru (register.tsx)
* **Aksi Uji (Happy Path):** Isi form registrasi dengan data valid (Nama Lengkap, Username unik huruf kecil tanpa spasi, Email valid, Kata Sandi >= 6 karakter, Konfirmasi Kata Sandi cocok). Tekan tombol "Daftar & Lanjutkan".
* **Ekspektasi:** Preload GPS di background langsung menyertakan koordinat (0ms wait), akun berhasil dibuat di backend, token tersimpan di SecureStore, dan diarahkan ke setup profil/avatar.
* **Uji Kasus Negatif:**
  * *Ketik username dengan spasi atau huruf kapital:* Sanitasi real-time wajib otomatis menghapus spasi dan mengubahnya jadi huruf kecil.
  * *Input email dengan spasi bawaan autofill keyboard (misal: "user@gmail.com "):* Payload wajib di-trim otomatis sehingga tidak memicu error 400.
  * *Kata sandi dan konfirmasi kata sandi berbeda:* Muncul notifikasi error in-app "Kata sandi tidak cocok" dan submit lock mencegah request ke server.
  * *Spam double-tap pada tombol "Daftar & Lanjutkan":* `authLockRef` wajib menahan request kedua agar server tidak memproses registrasi ganda.

#### TC-MOD1-04: Login Email & Tombol Isi Cepat Demo (login.tsx)
* **Aksi Uji (Happy Path):** Masukkan email `demo@tanisync.com` dan kata sandi `tanisync123`. Tekan "Masuk".
* **Ekspektasi:** Form terkirim, token dan userData tersimpan di SecureStore, cache lama dibersihkan, dan diarahkan ke `/(tabs)` dalam 0ms.
* **Uji Kasus Negatif:**
  * *Input kata sandi salah:* Muncul toast error ramah dari NotificationContext, kolom kata sandi tidak mengosongkan email.
  * *Ketik kata sandi sangat panjang (> 50 karakter):* Teks kata sandi tidak boleh menabrak ikon mata (visibilitas password) karena sudah dilindungi `paddingRight: 52`.
  * *Spam klik tombol "Masuk" dan tombol "Masuk dengan Google" bersamaan:* State `isSubmitting` dan `isGoogleLoading` terpisah; tombol Google tidak boleh ikut berputar jika tombol Masuk yang ditekan.

#### TC-MOD1-05: Setup Profil, Avatar, dan Lokasi (profile-setup.tsx, avatar-setup.tsx, location-setup.tsx)
* **Aksi Uji (Happy Path):**
  * Sesi 1: Verifikasi nama dan username. Tekan "Lanjutkan".
  * Sesi 2: Pilih foto profil (1:1) dan banner kebun (16:9) via ImagePicker. Tekan "Simpan & Lanjut".
  * Sesi 3: Tekan "Gunakan Lokasi Saat Ini". GPS terdeteksi dan diarahkan ke `/(tabs)`.
* **Uji Kasus Negatif:**
  * *Tekan Lanjutkan di profile-setup tanpa mengubah data awal Google:* Sistem mendeteksi `initialUserRef` dan langsung skip ke avatar-setup (0ms) tanpa memanggil API PUT `/user/me`.
  * *Tolak izin akses galeri foto saat memilih avatar:* Aplikasi menampilkan pesan peringatan yang sopan tanpa crash.
  * *Pengujian di dalam gedung beton tebal (GPS satelit tidak terkunci):* Fungsi deteksi lokasi dilindungi timeout 3500ms dan tombol fallback "Gunakan Lokasi Default (Sidoarjo)" dapat ditekan agar tester tidak pernah terjebak selamanya.

---

### Modul 2: Beranda Dinamis, Cuaca Pintar, dan Gamifikasi

#### TC-MOD2-01: FarmerScene & Waktu Dinamis (FarmerScene.tsx)
* **Aksi Uji (Happy Path):** Buka tab Beranda pada rentang waktu berbeda (Pagi 06:00-11:00, Siang 11:00-15:00, Sore 15:00-18:00, Malam 18:00-06:00).
* **Ekspektasi:** Gradien langit, posisi matahari/bulan, dan aset visual petani berganti dinamis sesuai jam perangkat. Animasi awan melayang bergerak konstan tanpa stuttering di UI thread.
* **Uji Kasus Negatif:**
  * *Ubah jam sistem HP secara manual ke jam 23:59 lalu buka app:* FarmerScene otomatis menampilkan latar malam berbintang tanpa error NaN pada perhitungan jam.

#### TC-MOD2-02: Smart Weather Watering & Simulasi Hujan (Beranda & Easter Egg)
* **Aksi Uji (Happy Path):** Pada kartu cuaca di Beranda, lakukan long-press (tahan selama 400ms) pada indikator cuaca.
* **Ekspektasi:** Simulasi hujan aktif: langit berubah mendung, animasi rintik partikel hujan turun di atas kebun, status jadwal siram pada TaskCard berganti menjadi "Ditunda Hujan" untuk mencegah overwatering, dan EXP siram diamankan.
* **Uji Kasus Negatif:**
  * *Lakukan long-press kedua kali atau pull-to-refresh:* Tampilan cuaca kembali normal ke kondisi riil tanpa merusak data cuaca asli di local cache.

#### TC-MOD2-03: Tugas Harian & Konfirmasi Siram Instan 0ms (index.tsx)
* **Aksi Uji (Happy Path):** Pada daftar "Tugas Hari Ini", tekan ikon centang siram pada tanaman yang membutuhkan air.
* **Ekspektasi:** Haptic feedback bergetar instan (0ms), tombol berubah menjadi centang hijau "Sudah Disiram", angka streak menyala, dan bertambah +10 EXP secara optimistic di layar.
* **Uji Kasus Negatif:**
  * *Spam tap cepat (5 kali dalam 1 detik) pada tombol siram:* `processingWateringRef` mengunci eksekusi sehingga request API hanya dikirim tepat 1 kali.
  * *Matikan internet tepat saat menekan tombol siram:* State UI yang sudah tercentang otomatis melakukan rollback dengan elegan dan menampilkan notifikasi kegagalan jika sync server ditolak.

#### TC-MOD2-04: Modal Gamifikasi Level, Streak, dan Pelindung Streak
* **Aksi Uji (Happy Path):** Ketuk kartu Streak / Level di Beranda.
* **Ekspektasi:** Modal Neoclay terbuka menampilkan level saat ini, target EXP berikutnya, status Pelindung Streak (Shield aktif), dan kalender Heatmap keaktifan perawatan 28 hari terakhir.
* **Uji Kasus Negatif:**
  * *Simulasi streak terputus:* Tombol "Pulihkan Streak" memanggil API `/restore-streak`, mengurangi jumlah pelindung streak sebanyak 1, dan mengembalikan angka streak utuh tanpa reload aplikasi.

---

### Modul 3: Manajemen Kebun & Detail Tanaman

#### TC-MOD3-01: Tambah Tanaman Baru (tanaman.tsx)
* **Aksi Uji (Happy Path):** Buka tab Tanaman -> Tekan tombol "+" -> Pilih varietas tanaman (misal: Tomat Ceri) -> Isi nickname "Tomat Balkon" -> Tekan Simpan.
* **Ekspektasi:** Tanaman baru langsung disisipkan di posisi paling atas list (0ms cache prepend), modal tertutup, dan notifikasi sukses muncul.
* **Uji Kasus Negatif:**
  * *Ketik nickname lebih dari 30 karakter:* Input tertahan oleh batas `maxLength={30}`.
  * *Ketik hanya spasi kosong pada nickname:* Sistem fallback menggunakan jenis tanaman default sebagai nama tampilan.

#### TC-MOD3-02: Detail Tanaman, Edit, dan Silent Cache (detail-tanaman.tsx)
* **Aksi Uji (Happy Path):** Buka kartu tanaman -> Masuk ke layar Detail Tanaman.
* **Ekspektasi:** Foto tanaman, fase tumbuh (Bibit/Vegetatif/Generatif/Panen), sisa hari panen, dan riwayat jurnal perawatan termuat instan dari cache `dashboard_tanaman`.
* **Uji Kasus Negatif:**
  * *Buka detail tanaman saat koneksi internet terputus:* Layar dilarang keras memunculkan error toast merah atau menendang tester keluar (`router.back()`). Layar wajib tetap menampilkan data tanaman yang tersimpan di cache lokal.
  * *Buka modal Edit Tanaman -> langsung tekan Simpan tanpa mengubah data:* Modal langsung tertutup seketika (0ms) tanpa mengirim request HTTP ke server.

#### TC-MOD3-03: Validasi Foto Kamera Jurnal & Kompresi Optimal
* **Aksi Uji (Happy Path):** Di Detail Tanaman, tekan "Catat Jurnal Foto" -> Ambil foto daun dari kamera.
* **Ekspektasi:** Foto terambil, dikompresi otomatis pada kualitas `0.6` (ukuran file di bawah 500 KB), terunggah ke Cloudinary via FormData multipart, dan foto header tanaman langsung terbarui.
* **Uji Kasus Negatif:**
  * *Tolak izin akses kamera Android:* Dialog permission native meminta izin dengan teks bahasa Indonesia yang sopan; jika ditolak, app tidak crash.
  * *Kamera ditutup tanpa mengambil foto (cancel action):* Tidak ada error unhandled exception.

#### TC-MOD3-04: Animasi Timelapse Pertumbuhan "Play Memori"
* **Aksi Uji (Happy Path):** Pada tanaman yang memiliki lebih dari 1 foto jurnal (seperti akun demo), tekan tombol hijau "Play Memori".
* **Ekspektasi:** Animasi Ken-Burns aktif: foto berganti secara dramatis dengan interval 1,1 detik (1100 ms) per foto, teks keterangan hari bertambah, diakhiri dengan tombol ulangi.
* **Uji Kasus Negatif:**
  * *Tekan Play Memori pada tanaman yang baru memiliki 1 foto awal:* Animasi Ken-Burns zoom halus tetap berjalan pada foto tunggal tersebut sambil memberi info bahwa jurnal berikutnya akan memperpanjang timelapse, bukan tombol macet tanpa respons.

#### TC-MOD3-05: Siklus Panen & Sertifikat Lulus Panen
* **Aksi Uji (Happy Path):** Pada tanaman berumur matang, tekan tombol "Panen Tanaman" -> Konfirmasi di dialog.
* **Ekspektasi:** Modal "Sertifikat Lulus Panen" terbuka, menampilkan total hari rawat, perolehan EXP panen, tanaman terhapus dari daftar aktif, dan otomatis tercatat ke dalam Riwayat Panen.
* **Uji Kasus Negatif:**
  * *Tekan tombol "Bagikan ke Komunitas":* Modal tertutup, draft postingan baru di tab Komunitas otomatis terisi data kelulusan panen tanaman tersebut.

---

### Modul 4: Komunitas Hibrida & Interaksi Sosial

#### TC-MOD4-01: Feed Nasional vs Terdekat Radius 2 KM (komunitas.tsx)
* **Aksi Uji (Happy Path):**
  * Tab "Nasional (Terbaru)": Menampilkan postingan seluruh pengguna se-Indonesia.
  * Tab "Terdekat": Mengirim koordinat GPS user dan memfilter postingan yang berjarak <= 2.0 KM dari kebun user.
* **Ekspektasi:** Transisi tab mulus, jarak kilometer muncul di header postingan, dan pagination infinite scroll memuat 10 postingan berikutnya secara seamless saat discroll mendekati bawah (`onEndReached`).
* **Uji Kasus Negatif:**
  * *Beralih ke tab Terdekat saat GPS HP dimatikan:* Muncul prompt ramah meminta aktivasi lokasi tanpa memicu layar putih crash.

#### TC-MOD4-02: Buat Postingan, Validasi Form, dan Kompresi Galeri
* **Aksi Uji (Happy Path):** Tekan tombol pensil melayang (FAB) -> Pilih foto kebun dari galeri -> Tulis cerita perawatan -> Tekan "Kirim Postingan".
* **Ekspektasi:** Foto terkompresi pada rasio `0.6`, postingan muncul seketika di posisi teratas feed (optimistic prepend), dan memori feed diperbarui.
* **Uji Kasus Negatif:**
  * *Kirim postingan tanpa teks dan tanpa foto:* Tombol submit nonaktif atau muncul peringatan validasi bahwa konten tidak boleh kosong.
  * *Spam tap tombol Kirim berkali-kali saat upload berjalan:* `isSubmitting` mengunci tombol sehingga tidak terbit postingan duplikat.

#### TC-MOD4-03: Optimistic Like, Komentar, dan Kunjungan Profil
* **Aksi Uji (Happy Path):**
  * Tekan tombol hati (Like): Angka like langsung bertambah +1 dan ikon berubah merah dalam 0ms.
  * Buka postingan -> Kirim komentar: Komentar langsung masuk ke daftar.
  * Ketuk avatar atau username penulis: Membuka layar `profil-pengguna.tsx`.
* **Uji Kasus Negatif:**
  * *Tap tombol Like 10 kali secara cepat (spamming):* Debounce dan state lock mencegah lonjakan hitungan like ganjil/genap yang berantakan.
  * *Buka profil pengguna lain yang memiliki tanaman sudah dipanen:* Verifikasi bahwa tanaman yang sudah dipanen TIDAK bocor ke daftar tanaman publik pengguna tersebut.

---

### Modul 5: TaniBot AI Assistant (Chatbot Pertanian 24/7)

#### TC-MOD5-01: Konsultasi Pertanian Kontekstual (tanibot.tsx)
* **Aksi Uji (Happy Path):** Buka tab TaniBot -> Pilih salah satu *Quick Prompt Chip* (misal: "Hama kutu putih") atau ketik pertanyaan bebas -> Tekan kirim.
* **Ekspektasi:** Bubble chat user langsung muncul di kanan, indikator mengetik biomorphic animasi muncul di kiri, lalu dibalas oleh AI Gemini dalam format Markdown rapi (bullet point `•` bersih, teks tebal tanpa simbol asterisk mentah `***`). AI mengetahui konteks tanaman yang sedang dirawat user di kebunnya.
* **Uji Kasus Negatif:**
  * *Kirim pesan hanya spasi kosong:* Tombol kirim tidak aktif.
  * *Kirim pesan panjang saat keyboard Android terbuka:* `KeyboardAvoidingView` menjaga input bar tetap melayang di atas keyboard tanpa memotong pesan terakhir di FlatList.

#### TC-MOD5-02: Uji Ketahanan Offline & Smart Fallback AI
* **Aksi Uji (Negative / Resilience Test):** Matikan koneksi internet (atau saat kuota rate-limit Gemini HTTP 429/500 terjadi) -> Kirim pertanyaan: *"Daun cabai saya menguning dan layu, kenapa ya?"*.
* **Ekspektasi:** TaniBot DILARANG menampilkan bubble error merah atau teks *"Koneksi terputus/coba 15 menit lagi"*. Fungsi `generateLocalBotResponse` langsung aktif memberikan panduan botani offline yang komprehensif, cerdas, dan terstruktur rapi lengkap dengan haptic feedback sukses.

---

### Modul 6: Peta Sebaran Wabah Hama (Geospatial Leaflet)

#### TC-MOD6-01: Peta Interaktif & Filter Spesifik Hama (peta-hama.tsx)
* **Aksi Uji (Happy Path):** Buka menu Peta Hama dari Beranda.
* **Ekspektasi:** WebView Leaflet termuat mulus dengan zoom level 14, marker hijau menunjukkan posisi user, dan lingkaran heatmap risiko hama muncul di sekitar lokasi kebun.
* **Uji Kasus Negatif:**
  * *Beralih chip filter secara cepat (Semua -> Kutu Putih -> Wereng -> Ulat):* Layer heatmap berganti dengan halus tanpa white-flash atau error rendering script Leaflet.
  * *Pengujian di daerah terpencil yang belum ada laporan hama di database:* Sistem otomatis menjalankan generator simulasi lokal 4-6 titik risiko hama dalam radius 2 KM dari posisi GPS tester sehingga radar peta tidak pernah kosong melompong.
  * *Geser lokasi GPS lebih dari 0.005 derajat:* `syncGpsInBackground` mendeteksi pergeseran koordinat dan otomatis mereset cache agar data titik pantau menyesuaikan lokasi baru tester.

---

### Modul 7: Profil, Pengaturan, Notifikasi, dan Logout Sesi

#### TC-MOD7-01: Ringkasan Profil & Tab Koleksi Panen (profil.tsx)
* **Aksi Uji (Happy Path):** Buka tab Profil. Periksa statistik Kebun, Level Petani, Tab Postingan Saya, dan Tab Riwayat Panen.
* **Ekspektasi:** Seluruh data profil langsung muncul dalam 0ms dari cache memori, badge pencapaian yang sudah terbuka menampilkan warna cerah, dan tanaman yang dipanen tercatat historis.
* **Uji Kasus Negatif:**
  * *Edit Profil -> Ganti Avatar & Banner -> Simpan:* Data baru langsung tersinkronisasi ke seluruh aplikasi termasuk avatar di FarmerScene Beranda.

#### TC-MOD7-02: Konfigurasi Notifikasi Harian (pengaturan-notifikasi.tsx)
* **Aksi Uji (Happy Path):** Buka Pengaturan Notifikasi -> Nyalakan switch pengingat -> Pilih jam siram (misal: 07:00 Pagi).
* **Ekspektasi:** Izin notifikasi Android diminta secara resmi, channel notifikasi dibuat dengan suara dan prioritas tinggi, dan jadwal alarm tersimpan aman di sistem.
* **Uji Kasus Negatif:**
  * *Tolak izin notifikasi di level OS:* Switch otomatis kembali nonaktif dan memberi informasi ramah tanpa menyebabkan force-close alarm.

#### TC-MOD7-03: Logout Bersih & Pembersihan Cache Total
* **Aksi Uji (Happy Path):** Di menu Profil -> Buka Drawer Pengaturan -> Tekan "Keluar Akun" -> Konfirmasi di dialog Neoclay.
* **Ekspektasi:** `logoutUser()` mengeksekusi pembersihan total: `cachedToken = null`, seluruh cache disk di `AsyncStorage.multiRemove` terhapus tanpa sisa, sesi SecureStore terhapus, dan tester diarahkan ke halaman login.
* **Uji Kasus Negatif:**
  * *Login kembali menggunakan Akun B:* Seluruh data dari Akun A (riwayat chat TaniBot, postingan profil, cache tanaman lama) 100% bersih dan tidak ada yang bocor ke Akun B.

---

## 2. Audit Konsistensi UI/UX & Ergonomi Android

### A. Palet Warna Neoclay & Tipografi Nunito
* [ ] **Warna Latar Belakang:** Seluruh layar menggunakan latar solid `#FBF8F0` atau `#FBF8F1` yang konsisten. Tidak ada halaman dengan latar belakang putih mentah (`#FFFFFF`) tanpa batas kartu yang jelas.
* [ ] **Kontras Teks:** Teks utama menggunakan hijau hutan gelap `#123924` (rasio kontras WCAG AAA > 7:1 terhadap latar), teks sekunder menggunakan `#5C5A4F`. Tidak ada teks abu-abu pucat yang sulit dibaca di bawah sinar matahari.
* [ ] **Aksen Fungsional:** Hijau `#3FA86B` untuk tombol utama dan status sukses, Amber `#FFB627` untuk status siram/streak, Coral `#FF6B5C` untuk tombol destruktif/error.
* [ ] **Integritas Font Nunito:** Seluruh teks menggunakan famili font Nunito (`Nunito_400Regular`, `Nunito_600SemiBold`, `Nunito_700Bold`, `Nunito_800ExtraBold`). Tidak ada teks yang jatuh (*fallback*) ke font sistem Android Robot/Sans-Serif bawaan.
* [ ] **Batas Pembesaran Aksesibilitas:** Properti teks kunci terlindungi dengan batas proporsional sehingga saat tester mengaktifkan "Ukuran Font Besar" di pengaturan Android, teks tidak menabrak ikon atau terpotong (*clipping*).

### B. Simetri Komponen State (Empty, Skeleton, dan Error)
* [ ] **Komponen ErrorState Berdiri Sendiri:** Komponen `ErrorState` dengan maskot tidur (`seedling-ngantuk.svg`) dirender satu layar penuh simetris vertikal dan horizontal.
* [ ] **Kompensasi Navbar Bawah:** Komponen `ErrorState` memiliki kompensasi `paddingBottom: 60` sehingga maskot berada tepat di titik pandang tengah mata dan tidak tenggelam di balik bilah tab navigasi melayang.
* [ ] **Skeleton Loader Neoclay:** Skeleton loader saat memuat data awal menggunakan bentuk dan ukuran yang presisi meniru kartu aslinya, dengan animasi pulsa lembut tanpa kedipan tajam.

### C. Ergonomi Spesifik Perangkat Android
* [ ] **Status Bar Dinamis:** Menggunakan `StatusBar style="dark"` yang bersih. Ikon jam, baterai, dan sinyal di status bar atas terbaca kontras dan tidak terpotong oleh notch/kamera punch-hole.
* [ ] **Perilaku Tombol Hardware Back Android:**
  * Saat Modal terbuka (modal tambah tanaman, modal cuaca, drawer pengaturan): Menekan tombol Back fisik/gesture swipe-back menutup modal yang aktif, tidak mengeluarkan user dari layar utama.
  * Di tab Beranda: Dilindungi double-tap back to exit dengan toast pemberitahuan santai agar aplikasi tidak tertutup secara tidak sengaja.
* [ ] **Keyboard Handling & Auto-Dismiss:**
  * Menekan area di luar form input atau menekan tombol enter/submit otomatis menyembunyikan keyboard virtual (`Keyboard.dismiss()`).
  * Kolom password panjang memiliki tombol mata dengan batas sentuh luas (`hitSlop={10}`) dan padding kanan cukup agar teks tidak menumpuk di bawah ikon.
* [ ] **Bebas White-Flash Transisi:** Perpindahan antar-layar menggunakan stack transition `fade` atau `slide_from_right` dengan latar terkunci di `#FBF8F0`, menghasilkan navigasi 60 FPS tanpa kedipan putih layar kosong.

---

## 3. Audit Performa, 0ms Cache-First, & Jaringan Ekstrem

### A. Pengujian 0ms Cache-First & Optimistic UI
1. **Verifikasi Pindah Tab 0ms:**
   * Buka aplikasi -> Masuk ke Beranda -> Pindah ke tab Tanaman -> Pindah ke Komunitas -> Pindah ke Profil.
   * **Kriteria Kelulusan:** Layar langsung menampilkan data tersimpan dari cache RAM/AsyncStorage dalam 0 milidetik. Tidak ada spinner loading fullscreen yang memblokir layar saat berpindah-pindah tab.
2. **Verifikasi Optimistic Action:**
   * Lakukan aksi interaksi (Siram Tanaman, Like Postingan, Toggle Status).
   * **Kriteria Kelulusan:** UI langsung berubah seketika disertai getaran haptik responsif sebelum request HTTP selesai dikirim ke server.

### B. Pengujian Mode Offline & Anti-Deadlock Retry
1. **Skenario Offline dengan Cache Tersedia (Silent Offline):**
   * Matikan koneksi Wi-Fi dan Data Seluler pada HP tester.
   * Buka tab Beranda, Tanaman, Komunitas, dan Profil.
   * **Kriteria Kelulusan:** Seluruh data lokal kebun tampil utuh. Tidak ada layar maskot error yang muncul, dan tidak ada toast merah yang muncul secara otomatis saat sekadar berpindah tab.
2. **Skenario Manual Pull-to-Refresh saat Offline:**
   * Dalam kondisi data mati, tarik layar ke bawah (*pull-to-refresh*) di Beranda atau Tanaman.
   * **Kriteria Kelulusan:** Muncul notifikasi toast ramah: *"Koneksi kurang stabil, menampilkan data tersimpan"*, dan data di layar tetap stabil tanpa crash.
3. **Skenario Offline Tanpa Cache (Layar Maskot Error & Anti-Deadlock):**
   * Lakukan fresh install atau logout akun -> Matikan koneksi internet -> Buka aplikasi.
   * **Kriteria Kelulusan:** Layar penuh `ErrorState` muncul menampilkan maskot tidur di tengah layar secara presisi.
   * **Uji Tombol "Coba Lagi" & Pull-to-Refresh:**
     * Nyalakan kembali data internet HP.
     * Tekan tombol **"Coba Lagi"** atau tarik layar error ke bawah.
     * Tombol berubah menampilkan spinner *"Menghubungkan..."*, fungsi `clearInFlightRequests()` langsung membatalkan request lama yang menggantung, dan halaman berhasil memuat ulang data kebun tanpa perlu me-reload aplikasi.

### C. Pengujian Kebersihan Sesi Multi-Akun (Data Isolation)
1. Login dengan **Akun A** (Sari Agraria - Akun Demo).
2. Lakukan percakapan di TaniBot, buat 1 tanaman baru, dan lihat postingan profil.
3. Buka Pengaturan -> Logout.
4. Login dengan **Akun B** (Akun Baru / Pengguna Lain).
5. **Kriteria Kelulusan:**
   * Riwayat percakapan TaniBot Akun A tidak muncul di Akun B.
   * Daftar tanaman Akun A tidak muncul di Akun B.
   * Koordinat kebun dan banner profil Akun A tidak tercampur ke Akun B.

---

## 4. Matriks Laporan Bug & Sign-Off Pra-Build APK

Gunakan lembar matriks kerja berikut selama sesi pengujian. Seluruh temuan berkategori **CRITICAL** dan **MAJOR** wajib berstatus **FIXED/RESOLVED** sebelum menjalankan perintah final build APK:

| No | Modul / Layar | Kode Uji | Deskripsi Temuan Pengujian | Tingkat Keparahan | Status |
| :-: | :--- | :--- | :--- | :-: | :-: |
| 1 | Autentikasi | TC-MOD1-04 | Simpan sesi token dan userData di SecureStore | CRITICAL | PASS |
| 2 | Beranda | TC-MOD2-02 | Simulasi hujan Easter egg long-press cuaca | MAJOR | PASS |
| 3 | Beranda | TC-MOD2-03 | Proteksi mutex double-tap tombol siram | CRITICAL | PASS |
| 4 | Detail Tanaman | TC-MOD3-02 | Silent cache handling tanpa router.back() paksa | CRITICAL | PASS |
| 5 | Detail Tanaman | TC-MOD3-04 | Durasi Play Memori timelapse 1,1 detik per foto | MAJOR | PASS |
| 6 | Detail Tanaman | TC-MOD3-03 | Kompresi foto jurnal ImagePicker kualitas 0.6 | MAJOR | PASS |
| 7 | TaniBot AI | TC-MOD5-02 | Smart offline botani fallback saat Gemini rate limit | CRITICAL | PASS |
| 8 | Peta Hama | TC-MOD6-01 | Fallback simulasi titik hama radius 2 KM | CRITICAL | PASS |
| 9 | Layar Error | TC-MOD2-04 | ErrorState pull-to-refresh & anti-deadlock retry | CRITICAL | PASS |
| 10 | Global Layout | TC-UIUX-02 | Centering ErrorState dengan kompensasi navbar | MAJOR | PASS |
| 11 | Profil & Sesi | TC-MOD7-03 | Pembersihan total cache AsyncStorage saat logout | CRITICAL | PASS |
| 12 | Sistem Android | TC-UIUX-03 | Kompilasi TypeScript 0 error & zero emoji sistem | CRITICAL | PASS |

---

### Kriteria Kelulusan Final Sign-Off (Release Gate Criteria)
Aplikasi **TaniSync Mobile** dinyatakan **LULUS (APPROVED FOR PRODUCTION BUILD)** apabila memenuhi 5 syarat mutlak:
1. **Zero TypeScript Errors:** Perintah `tsc --noEmit --skipLibCheck` keluar dengan kode exit `0`.
2. **Zero Critical / Major Blockers:** Tidak ada bug yang menyebabkan force close, infinite loading, atau tombol macet.
3. **Zero Deadlock on Network Glitches:** Fitur "Coba Lagi" dan pull-to-refresh berhasil memulihkan layar saat internet kembali tersambung.
4. **Hermes & Build Config Valid:** Konfigurasi `app.json` dan `eas.json` terkunci pada profil standalone APK (`preview` / `production`).
5. **Akun Pengujian Juri Terverifikasi:** Akun demo `demo@tanisync.com` / `tanisync123` terbukti dapat login dalam 1 detik dan seluruh data pameran siap dipresentasikan.

---

*Dokumen disusun dan diverifikasi oleh Mobile Quality Assurance Lead & System Auditor TaniSync — SMK Telkom Sidoarjo untuk Kompetisi MAGE 12 Institut Teknologi Sepuluh Nopember (ITS).*
