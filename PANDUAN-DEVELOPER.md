# Panduan Developer & Tim 🤝

Selamat datang di tim frontend TaniSync! Untuk menjaga kualitas *codebase* dan mencegah konflik antar developer (termasuk kolaborasi dengan agen AI seperti Antigravity), ikuti aturan ketat di bawah ini.

## 🛠 Aturan Git & Kolaborasi
1. **Selalu Pull Sebelum Mulai:** Wajib hukumnya menjalankan `git pull` setiap kali baru mau mulai *coding* agar kamu bekerja di versi terbaru.
2. **Commit Kecil-Kecil:** Jangan menumpuk fitur dalam satu commit raksasa. Pecah commit per fitur atau per perbaikan (*bug*).
3. **Format Pesan Commit:** Ikuti pola log yang sudah ada. Gunakan format `feat(scope): deskripsi` untuk fitur baru, dan `fix(scope): deskripsi` untuk perbaikan. Contoh: `feat(profile): edit profile screen with avatar upload`.
4. **Jaga Kebersihan Push:** **JANGAN** *push* file yang tidak sengaja terubah (seperti *auto-formatting* di file yang tidak kamu kerjakan). Selalu cek `git diff` sebelum `git add`.
5. **Komunikasi Perubahan File:** Jika kamu menghapus atau me-refactor file penting, beri tahu tim! **Contoh kasus nyata:** File `app/post-detail.tsx` **SUDAH DIHAPUS** karena menjadi file *zombie*. Jangan hidupkan atau kembalikan file tersebut dari salinan lokal lamamu.

## 🤖 Aturan Pakai AI (Antigravity)
Jika kamu menggunakan asisten AI untuk membantu *coding*, pastikan *prompt* kamu memiliki batasan yang tegas:
1. **Scope File:** Selalu sebutkan secara eksplisit daftar file yang BOLEH disentuh oleh AI.
2. **Tanpa Izin = Tanpa Install:** Larang AI menginstal *library* apapun tanpa izin eksplisit darimu di *prompt*.
3. **Pembuktian Kualitas:** Setelah AI melakukan perubahan, AI **WAJIB** membuktikan dengan hasil `npx tsc --noEmit` = **0 error**.
4. **Verifikasi Manual:** Jangan asal terima kata "selesai" dari AI. Selalu tes manual di HP/Emulator sebelum *commit*.
5. **Dewa Endpoint (CONTRACT.md):** File `CONTRACT.md` adalah satu-satunya **sumber kebenaran (*single source of truth*)** untuk integrasi API. Jangan biarkan AI mengarang *endpoint* atau format struktur *payload* yang tidak ada di kontrak.

## 📦 Aturan Dependency & Expo
1. **Cara Install:** **DILARANG KERAS** menjalankan `npm install expo@<angka>` secara manual. Jika ingin menambah *library*, HANYA gunakan perintah:
   ```bash
   npx expo install <nama-package>
   ```
   Ini memastikan *package* yang diinstal kompatibel dengan Expo SDK 57 yang kita gunakan.
2. **Koordinasi Native Library:** Setiap penambahan *library* baru WAJIB didiskusikan ke tim. Jika *library* tersebut mengandung kode *native* (seperti `expo-notifications` atau `google-signin`), maka proyek WAJIB di-*build* ulang menggunakan EAS Build (Expo Go tidak akan mempan).

## ✅ Checklist Sebelum Commit
Sebelum menjalankan `git commit`, pastikan kamu mencentang ini di kepalamu:
- [ ] `npx tsc --noEmit` berjalan mulus dengan **0 error**.
- [ ] Fitur sudah dites dan berjalan normal di *device* / *simulator*.
- [ ] `git status` dan `git diff` beres (tidak ada file lain yang tidak sengaja ikut terubah/masuk).
