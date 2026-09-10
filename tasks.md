# 📋 Task Tracker & Roadmap (tasks.md)
**Project Name:** TaniSync (MAGE 12 MVP)

Berisi daftar tugas (To-Do List) untuk tahap pengembangan aplikasi TaniSync[cite: 2]. Silakan ubah `[ ]` menjadi `[x]` jika tugas sudah selesai.

---

## 🟢 PHASE 1: Project Setup & Boilerplate
- [x] **[Arya]** Setup repository GitHub dan branch structure.
- [x] **[Arya]** Inisialisasi Backend (Node.js, Express, TypeScript/JS, dotenv)[cite: 2].
- [x] **[Arya]** Setup Database (MySQL) dan Prisma ORM Schema[cite: 2].
- [x] **[Fatih]** Inisialisasi Frontend (React Native + Expo)[cite: 2].
- [x] **[Fatih]** Setup React Navigation (Bottom Tabs).
- [x] **[Asykar]** Buat dan lengkapi `design.md` (Palet warna, tipografi, ukuran komponen).

## 🟡 PHASE 2: Core Backend API & Logika (Arya)
- [ ] Buat API Endpoint CRUD untuk data User dan Profil[cite: 2].
- [ ] Buat API Endpoint CRUD untuk Manajemen Tanaman (Tambah, Edit, Hapus tanaman)[cite: 2].
- [ ] Setup akun Cloudinary dan buat API untuk upload foto validasi perawatan[cite: 2].
- [ ] Buat logika `node-cron` untuk menarik data dari OpenWeatherMap API setiap pagi[cite: 2].
- [ ] Buat algoritma untuk menghitung *Predictive Harvest Score* (Poin foto vs klik biasa)[cite: 2].
- [ ] Integrasikan Generative AI API untuk logika chatbot TaniBot[cite: 2].

## 🟠 PHASE 3: Frontend UI & Slicing (Fatih)
- [ ] Slicing UI Halaman Beranda (To-do list harian & indikator Streak)[cite: 2].
- [ ] Slicing UI Halaman Manajemen Tanaman (Tab Semua, Perlu Perhatian, Sehat)[cite: 2].
- [ ] Slicing UI Halaman Komunitas (Location-Based Feed)[cite: 2].
- [ ] Slicing UI Halaman Profil dan Pengaturan Notifikasi.
- [ ] Integrasi `expo-camera` untuk fitur ambil foto real-time saat jadwal penyiraman[cite: 2].

## 🔵 PHASE 4: Integrasi (Arya & Fatih)
- [ ] Konek API Tanaman dari Backend ke Frontend.
- [ ] Konek API Cuaca (penundaan notifikasi penyiraman) ke UI Frontend[cite: 2].
- [ ] Konek API Community Feed (Filter berdasarkan radius geolokasi pengguna)[cite: 2].
- [ ] Konek UI TaniBot dengan response dari Backend AI Engine[cite: 2].
- [ ] Setup Expo Push API agar notifikasi muncul di HP[cite: 2].

## 🟣 PHASE 5: Testing & QA (Asykar)
- [ ] **[Asykar]** Test semua alur aplikasi (Create tanaman, siram, upload foto).
- [ ] **[Asykar]** Cari bug dan laporkan ke Arya/Fatih.
- [ ] **[Asykar]** Siapkan bahan presentasi/video demo untuk Tahap 2 MAGE.