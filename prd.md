# 📄 FULL PRD — TaniSync (Versi Lengkap & Final)

## 1. Project Overview
* **Nama**: TaniSync
* **Tagline**: Asisten Urban Farming Pintar — Tanaman Sehat, Panen Pasti, Tanpa Tebak-Tebakan
* **Platform**: Mobile (Android & iOS via React Native Expo)
* **Tim**: Ready Set Go — MAGE 12 ITS
* **Repo Backend**: Express.js + Prisma

### 1.1 Latar Belakang Masalah
Urban farming di Indonesia tumbuh pesat, namun rasio kegagalan panen masih tinggi karena:
1. **Human error** — penyiraman berlebihan (*overwatering*) dan jadwal perawatan yang tidak konsisten, terutama bagi pemilik tanaman yang padat aktivitas.
2. **Informasi cuaca tidak terintegrasi** — petani urban menyiram tanaman tepat sebelum hujan turun: pemborosan air + risiko busuk akar.
3. **Surplus panen terbuang** — tidak ada kanal distribusi lokal untuk kelebihan hasil, padahal tetangga sekitar mungkin membutuhkannya.
4. **Terputusnya motivasi** — urban farmer pemula menyerah di fase awal karena tidak melihat progres yang terukur.

### 1.2 Solusi
TaniSync menggabungkan otomasi adaptif berbasis cuaca, jurnal visual tervalidasi foto, gamifikasi retensi, komunitas hiperlokal, dan AI agronomis dalam satu aplikasi — dirancang khusus untuk skala rumah tangga (pot, polybag, hidroponik).

### 1.3 Visi
Membangun ekonomi sirkular pangan lokal — warga kota menanam, memantau dengan bantuan AI dan otomasi cuaca, lalu berbagi surplus dengan tetangga terdekat.

---

## 2. Target Pengguna & Personas

| Persona | Deskripsi | Pain Point |
| :--- | :--- | :--- |
| **Sari, 24 (Karyawan WFH)** | Punya 5 pot cabai di balkon, sering lupa nyiram. | Lupa jadwal, nggak tau kapan perlu air. |
| **Bimo, 30 (Gen Z Sustainability)** | Mulai hidroponik selada, baru 2 bulan. | Takut gagal lagi, butuh guidance & motivasi. |
| **Bu Ratna, 35 (Ibu Rumah Tangga)** | Panen kangkung berlebih tiap 2 minggu. | Surplus buang sia-sia, mau bagi ke tetangga. |

**Out of Scope (Di Luar Cakupan):**
* ❌ Skala komersial/agribisnis
* ❌ Transaksi uang (jual-beli) — murni komunitas barter/donasi
* ❌ Sensor IoT hardware (masuk *roadmap* jangka panjang)

---

## 3. Tech Stack & Arsitektur

```text
┌─────────────────┐     ┌──────────────────────────────┐
│  Mobile Client  │────▶│   Backend API (Express.js)   │
│  React Native   │HTTP │        Railway.app           │
│  Expo + Axios   │     │                              │
└─────────────────┘     │  ┌────────┐  ┌────────────┐  │
                        │  │Routes  │→ │Controllers │  │
┌─────────────────┐     │  └────────┘  └─────┬──────┘  │
│  Cloudinary     │◀────│  Image Upload      │         │
│  (foto jurnal)  │     │                    ▼         │
└─────────────────┘     │  ┌────────────────────────┐  │
                        │  │  Prisma ORM            │  │
┌─────────────────┐     │  └───────────┬────────────┘  │
│  OpenWeatherMap │◀────│  Weather Cron│ (node-cron)   │
│  API            │     └──────────────┼───────────────┘
└─────────────────┘                    ▼
┌─────────────────┐     ┌──────────────────────────────┐
│  Gemini API     │◀────│         TiDB Serverless      │
│  (TaniBot AI)   │     │        (MySQL, pooled)       │
└─────────────────┘     └──────────────────────────────┘
```

| Layer | Teknologi | Justifikasi |
| :--- | :--- | :--- |
| **Backend** | Node.js + Express | Ringan, cepat develop, ekosistem besar. |
| **ORM** | Prisma | Type-safe, migrasi database mudah. |
| **Database** | TiDB Serverless | MySQL-compatible, free tier stabil, serverless scaling. |
| **Auth** | JWT + bcryptjs | Stateless, sangat cocok untuk arsitektur mobile. |
| **AI** | Gemini API | Gratis, pemahaman bahasa Indonesia sangat baik. |
| **Cuaca** | OpenWeatherMap API | Data probabilitas hujan harian akurat untuk radius lokal. |
| **Storage** | Cloudinary | Transformasi & optimasi gambar otomatis. |
| **Scheduler** | node-cron | Cron in-process untuk pengecekan cuaca harian rutin. |
| **Deploy** | Railway + GitHub | CI/CD otomatis dari push repository. |

---

## 4. Fitur Inti (MVP) — Detail Fungsional

### A. 🔔 Otomasi Adaptif Berbasis Cuaca (Killer Feature)
* Cron job harian mengecek probabilitas hujan (OpenWeatherMap) untuk lokasi tiap *user*.
* **Logika keputusan:**
  * Prob. hujan < 40% → kirim notifikasi *"Waktunya siram tanamanmu! 🌱"*
  * Prob. hujan ≥ 40% pada jadwal penyiraman → kirim notifikasi *"Hujan diprediksi, penyiraman ditunda otomatis 💧 — hemat air, cegah busuk akar."*
* Menyimpan riwayat keputusan sistem untuk transparansi *user*.

### B. 📔 Jurnal Linimasa Visual
* Wajib unggah foto *real-time* via kamera (bukan galeri — mencegah manipulasi) sebagai validasi perawatan.
* Foto tersusun kronologis per tanaman: bibit → vegetatif → berbunga → panen.
* Terintegrasi Cloudinary: kompresi otomatis, max 5MB, format jpeg/png/webp.

### C. 🏆 Predictive Harvest Score & Gamifikasi
* **Skor kesehatan tanaman:**
  * Validasi foto tepat waktu: +5 poin.
  * Klik "sudah disiram" darurat (tanpa foto): +1 poin.
  * Bolos jadwal (hujan tidak terjadi): skor tanaman menurun.
* *Streak* harian + Level *user* (Pemula → Tukang Kebun → Master Green Thumb).
* Skor dikombinasikan dengan variabel cuaca → memprediksi tingkat kesehatan panen.

### D. 📍 Community Feed Hiperlokal
* *Feed* hanya menampilkan postingan dalam radius 1–2 KM (filter via *lat/long user & post*).
* Fungsi: *update* tanaman, tanya solusi, barter/donasi surplus panen.
* Tanpa transaksi uang.

### E. 🤖 TaniBot (AI Assistant)
* Integrasi Gemini API dengan *system prompt* khusus urban farming Indonesia.
* Fokus mendiagnosis: daun menguning, hama, jamur, nutrisi hidroponik.
* Riwayat percakapan tersimpan (TiDB) sehingga AI memiliki konteks tanaman *user*.
* Sistem *Rate-limited* pada *backend* untuk efisiensi kuota API.

### F. 🔐 Autentikasi & Keamanan
* Register/Login menggunakan JWT (expiry 7 hari) dan enkripsi bcrypt.
* Proteksi *email-enumeration* dan *timing-attack* pada rute autentikasi.
* Simpan presisi lokasi *user* (lat/long) saat registrasi untuk kebutuhan parameter cuaca & radius komunitas.

---

## 5. Data Model (Prisma Schema — Ringkas)

```prisma
model User {
    id        Int      @id @default(autoincrement())
    nama      String
    email     String   @unique
    password  String
    latitude  Float?
    longitude Float?
    poin      Int      @default(0)
    streak    Int      @default(0)
    plants    Plant[]
    posts     Post[]
    chats     Chat[]
}

model Plant {
    id            Int      @id @default(autoincrement())
    userId        Int
    nama          String
    jenis         String   
    tanggalTanam  DateTime
    harvestDate   DateTime 
    skor          Int      @default(50)
    journals      Journal[]
}

model Journal {
    id         Int      @id @default(autoincrement())
    plantId    Int
    fotoUrl    String   
    poinDidapat Int
    createdAt  DateTime @default(now())
}

model Post {
    id        Int       @id @default(autoincrement())
    userId    Int
    tipe      String    // UPDATE | TANYA | BARTER | DONASI
    judul     String
    isi       String
    fotoUrl   String?
    latitude  Float
    longitude Float
    komentar  Comment[]
}

model Chat {
    id        Int      @id @default(autoincrement())
    userId    Int
    role      String   // USER | BOT
    message   String
    createdAt DateTime @default(now())
}
```

---

## 6. API Endpoint (Ringkas)

| Method | Endpoint | Fungsi |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Daftar akun + simpan koordinat lokasi. |
| `POST` | `/api/auth/login` | Login otorisasi, me-return JWT. |
| `POST` | `/api/plants` | Tambah tanaman + kalkulasi *harvest date* otomatis. |
| `GET` | `/api/plants` | Ambil daftar tanaman, skor, dan progres *user*. |
| `POST` | `/api/journals` | Validasi *upload* foto jurnal + penambahan poin. |
| `POST` | `/api/posts` | Buat postingan komunitas. |
| `GET` | `/api/posts?lat=&lng=&radius=` | Tarik data *feed* komunitas hiperlokal sesuai radius. |
| `POST` | `/api/posts/:id/comments` | Beri komentar pada postingan *user* lain. |
| `POST` | `/api/tanibot` | Kirim *prompt* diagnosa ke AI Assistant. |
| `GET` | `/api/tanibot/history` | Tarik riwayat percakapan AI per *user*. |
| `GET` | `/health` | *Health check endpoint* (termasuk *database ping*). |

---

## 7. Success Metrics
* ✅ Notifikasi adaptif tersinkronisasi cuaca — terbukti menunda pengingat saat prob. hujan ≥ 40%.
* ✅ *Feed* komunitas terfilter akurat berdasarkan radius (Hyperlocal constraint bekerja).
* ✅ *Upload* foto → Cloudinary berjalan tanpa hambatan (target waktu respons < 3 detik).
* ✅ *User Flow* utuh: daftar → tanam → terima notif → validasi foto → poin bertambah → post surplus.
* ✅ Sistem Poin: Skor & *streak* terekam presisi dan tersaji real-time di profil *user*.

---

## 8. Roadmap Pengembangan

| Fase | Durasi | Deliverable | Status |
| :--- | :--- | :--- | :--- |
| **Fase 1: Fondasi** | Minggu 1 | Auth, Database Schema, Deploy Pipeline, Error Handling. | Selesai ✅ |
| **Fase 2: Fitur Inti** | Minggu 2 | Integrasi TaniBot AI, Weather Cron, Feed Logic, Cloudinary. | Selesai ✅ |
| **Fase 3: Mobile Sync**| Minggu 3 | Menyambungkan UI/UX React Native ke REST API Backend. | Sedang Berjalan ⏳ |
| **Fase 4: Gamifikasi** | H-3 Lomba | Pengujian endpoint skor, *streak*, dan tingkatan level *user*. | Pending 🕒 |
| **Fase 5: Polish Demo**| H-1 Lomba | *Populate data dummy* (seeder) untuk akun demo, gladi resik *pitching*. | Pending 🕒 |

---

## 9. Risiko & Mitigasi

| Risiko | Strategi Mitigasi |
| :--- | :--- |
| **Cron in-process mati saat Railway restart** | **Jangka pendek (MVP):** Implementasi *health check endpoint* + *auto-restart*. **Jangka panjang:** Migrasi ke *scheduled job worker* terpisah. |
| **Kuota limit Gemini/OpenWeather habis saat demo** | Menyiapkan *fallback* berupa video dokumentasi demo interaktif + implementasi sistem *cache* untuk jawaban umum AI. |
| **Konten komunitas out-of-topic (spam)** | Validasi ekstensi dan batas ukuran file ketat. *Roadmap*: Implementasi AI Content Moderation. |
| **Manipulasi foto validasi progres tanaman** | Memaksa pemanggilan kamera *real-time* langsung dari *client* Expo (memblokir akses galeri/ *camera roll* lama). |
| **Koneksi DB limit saat traffic melonjak** | Mengimplementasikan *Connection Pooling* (`connection_limit=5`) dan Singleton *PrismaClient* untuk mencegah kebocoran koneksi serverless. |

---

## 10. Tim & Pembagian Peran (Ready Set Go)

* **Arya** — *Lead Backend Engineer*: Bertanggung jawab penuh merancang arsitektur API, skema database (TiDB), integrasi model AI (Gemini), logika otomasi cuaca, keamanan *endpoint*, serta *deployment infrastructure* (Railway).
* **Fatih** — *Lead Frontend Engineer*: Bertanggung jawab mengonversi *wireframe* ke antarmuka aplikasi interaktif (*slicing*) menggunakan React Native (Expo), mengatur navigasi aplikasi, *styling* desain sistem *Neoclay*, serta mengintegrasikan *client* dengan REST API.
* **Asykar** — *UI/UX Designer & Project Manager*: Berperan mengawal dokumen progres (*Logbook*), standardisasi desain antarmuka, pembuatan aset presentasi, serta mengatur strategi narasi presentasi (*Pitch Lead*) untuk juri.