# TaniSync Mobile App 🌱

TaniSync adalah aplikasi teman bertani kaum urban. TaniSync membantu kamu merawat tanaman dengan mudah dan menyenangkan. Aplikasi ini memiliki fitur utama:
- **Manajemen Tanaman:** Catat tanamanmu, dapatkan prediksi panen, dan pengingat jadwal siram harian (notifikasi lokal).
- **Komunitas:** Bagikan progress tanamanmu atau panen surplus ke petani urban lain di sekitarmu (berbasis geolokasi).
- **TaniBot:** Asisten AI pintar yang siap menjawab semua pertanyaan seputar perawatan tanaman dan cuaca hari ini.
- **Gamifikasi:** Dapatkan poin, *streak*, dan koleksi *achievement* setiap kali kamu merawat tanamanmu!

## 🚀 Tech Stack (Real-based)
Aplikasi ini dibangun menggunakan teknologi modern:
- **Expo SDK:** `~57.0.21` (SDK 57)
- **React Native:** `0.86.3`
- **React:** `19.2.3`
- **TypeScript:** `~6.0.3`
- **Networking:** `axios` (`^1.20.0`)
- **Routing:** `expo-router`

---

## 🛠 Panduan Setup (Windows / Mac / Linux)

### 1. Install Persyaratan Sistem
Pastikan kamu memiliki **Node.js** terinstal. Expo SDK 57 membutuhkan Node.js v18 atau versi LTS terbaru (sangat disarankan v20+).
- **Windows / Mac / Linux:** Download dan install dari [nodejs.org](https://nodejs.org).

### 2. Clone Repositori
Buka terminal (Mac/Linux) atau PowerShell (Windows) lalu jalankan:
```bash
git clone <URL_REPO_TANISYNC_MOBILE>
cd mage12-mobile
```

### 3. Install Dependency
```bash
npm install
```

### 4. Konfigurasi Environment Variables (.env)
Buat file bernama `.env` di *root* direktori proyek (sejajar dengan `package.json`). Isi dengan variabel berikut (contoh):
```env
# URL Backend TaniSync (tanpa slash di akhir)
EXPO_PUBLIC_API_URL=https://mage12-api-production.up.railway.app/api

# Client ID untuk Google Sign-In
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

### 5. Jalankan Aplikasi
```bash
npx expo start
```
- **Expo Go:** Scan QR Code yang muncul di terminal menggunakan aplikasi Expo Go di HP kamu.
- ⚠️ **CATATAN PENTING:** Beberapa fitur native seperti **Google Sign-In** dan **Push Notification Lokal** *TIDAK BISA* berjalan sempurna di Expo Go biasa. Kamu **WAJIB** membuat dan menggunakan *Development Build* (APK / Simulator) untuk menguji fitur-fitur tersebut secara penuh.

---

## 📁 Struktur Direktori Penting

- `app/` → Berisi semua *screens* berbasis *file-system routing* dari Expo Router.
  - `app/(auth)/` → Grup rute untuk alur otentikasi (Login, Register, Setup Lokasi).
  - `app/(tabs)/` → Grup rute utama aplikasi yang menggunakan Bottom Navigation Bar (Beranda, Tanaman, Komunitas, Profil).
- `components/` → Komponen UI yang bisa dipakai ulang (contoh: `NotificationContext.tsx` untuk sistem *toast* kustom).
- `services/` → Layanan eksternal aplikasi.
  - `services/api.ts` → Konfigurasi Axios, *interceptor* token JWT, dan semua fungsi panggilan endpoint *backend*.
  - `services/notificationService.ts` → Logika penjadwalan dan perizinan Notifikasi Lokal (Expo Notifications).
