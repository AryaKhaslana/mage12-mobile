# Troubleshooting Guide 🚑

Daftar masalah umum dan solusinya yang **tervalidasi** khusus untuk versi Expo SDK yang kita gunakan di TaniSync. 

| Masalah | Penyebab | Solusi |
|---------|----------|--------|
| **`npm error ETARGET — No matching version found`** | Mencoba menginstall *package* dengan versi spesifik yang ternyata tidak ada/salah ketik. | Pulihkan `package.json` kamu ke versi git terakhir (`git checkout package.json`). Lalu **selalu** gunakan `npx expo install <nama-package>` agar Expo yang mencarikan versi yang paling cocok untuk SDK proyek ini. |
| **`Invalid project root: ...\update`** | Mengetikkan perintah *upgrade* yang tidak valid seperti `npx expo update`. | Perintah tersebut tidak ada di Expo CLI modern. Jika kamu memang berniat menaikkan versi SDK, gunakan perintah resmi yang valid: `npx expo install expo@^57.0.0 --fix` atau ganti ke target SDK yang dituju, lalu ikuti panduan *upgrade* di web Expo. |
| **`Unable to resolve module`** | Aplikasi tidak bisa menemukan file/komponen. Biasanya karena file dipindahkan/dihapus tapi *import*-nya masih nyangkut, atau *cache* bundler bermasalah. | 1. Cek ulang *path import* di kodemu.<br>2. Hapus *cache* Metro dengan menjalankan: `npx expo start -c`. |
| **Port 8081 sudah dipakai** | Ada proses Node.js / React Native lain yang masih berjalan di latar belakang (mungkin *server* sebelumnya belum mati sempurna). | **Ubah Port:** `npx expo start --port 8082`<br>**Atau Kill Port (Mac/Linux):** `kill $(lsof -t -i:8081)`<br>**Kill Port (Windows PowerShell):** `Stop-Process -Id (Get-NetTCPConnection -LocalPort 8081).OwningProcess -Force` |
| **Gagal koneksi API (Network Error) saat dites di HP** | HP gagal berkomunikasi dengan *server backend*. Jika menjalankan backend secara lokal, HP mungkin beda jaringan Wi-Fi. | 1. Pastikan HP dan PC berada di satu jaringan Wi-Fi yang sama jika URL `API_URL` mengarah ke IP Lokal.<br>2. Cek `services/api.ts` atau file `.env`. Sangat disarankan untuk langsung memasang/menembak URL *production* (Railway) di `.env` agar aman dites dari jaringan manapun. |
| **Aplikasi langsung crash/putih (berhenti) di Expo Go** | Banyak kemungkinan: *cache* korup, salah menginstal versi dependensi native, dll. | Lakukan diagnosis berurutan:<br>1. Baca log berwarna merah di terminal Metro (seringkali letak error terlihat di situ).<br>2. Hapus *cache* Metro: `npx expo start -c`.<br>3. Jika masih gagal, hapus dependencies dan install ulang (Lihat langkah di bawah). |

---

## 🧹 Cara Clean Reinstall Dependencies

Jika aplikasi masih sering *crash* misterius, lakukan hapus total dan *reinstall*.

**Di Windows (PowerShell):**
```powershell
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json
npm install
npx expo start -c
```

**Di Mac / Linux (Bash):**
```bash
rm -rf node_modules package-lock.json
npm install
npx expo start -c
```

---

## 🛡️ Pentingnya TypeScript (Mengapa Wajib `npx tsc --noEmit`)
Di proyek ini, **TypeScript adalah sabuk pengaman utama kita**. Banyak aplikasi React Native *crash* secara diam-diam (layar merah saat jalan) akibat kesalahan sepele. 

**Contoh Kasus Nyata di Proyek Ini:**
Pernah terjadi *typo* salah mengambil variabel dari *context* `useNotification`, dan ketidaksengajaan terhapusnya baris `import { useNotification }`. Jika kita langsung tes di HP, aplikasi akan **Crash** (*Runtime Error*). 

Namun, dengan menjalankan perintah:
```bash
npx tsc --noEmit
```
TypeScript langsung mendeteksi bahwa *hook* tersebut tidak ditemukan di *scope* file sebelum aplikasi sempat dijalankan. Inilah alasan mengapa `tsc 0 error` wajib dipenuhi sebelum setiap *commit*.
