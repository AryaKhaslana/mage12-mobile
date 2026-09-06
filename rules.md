# 📜 TaniSync Repository & Codebase Rules

Dokumen ini berisi standar pengerjaan *codebase* TaniSync untuk kompetisi MAGE 12. Semua anggota tim **WAJIB** mematuhi aturan ini demi menjaga kualitas, keamanan, dan keterbacaan kode, baik di sisi Backend (Express) maupun Frontend (React Native Expo).

---

## 1. 🌿 Git Workflow & Branching
Kita menggunakan alur kerja *feature-branch*. Dilarang keras melakukan *commit* atau *push* langsung ke *branch* `main`.

*   **main**: HANYA berisi kode *production-ready* yang siap di- *deploy*.
*   **dev**: *Branch* utama untuk integrasi proses *development*.
*   **Fitur/Bugfix**: Buat *branch* baru dari `dev` dengan format:
    *   `feature/nama-fitur` (contoh: `feature/weather-cron`)
    *   `bugfix/nama-bug` (contoh: `bugfix/jwt-expiry`)
*   **Aturan Sinkronisasi**: Selalu jalankan `git pull origin dev` sebelum membuat *branch* baru dan sebelum membuat *Pull Request*.
*   **Pembersihan**: *Branch feature* WAJIB dihapus setelah berhasil di- *merge* ke `dev`.

---

## 2. 📝 Conventional Commits & Pull Requests (PR)
Riwayat *commit* akan dibaca oleh juri. Gunakan bahasa Inggris, huruf kecil (lowercase), kalimat imperatif, dan tanpa titik di akhir.

**Format:** `type: deskripsi singkat`
*   `feat:` — Menambah fitur baru (contoh: `feat: add community feed endpoint`)
*   `fix:` — Memperbaiki *bug* (contoh: `fix: correct radius geolocation filter`)
*   `refactor:` — Mengubah struktur kode tanpa mengubah logika/hasil (contoh: `refactor: move AI logic to service layer`)
*   `style:` — Perbaikan *formatting* atau UI *tweak* tanpa ubah logika (contoh: `style: update button neobrutalism shadow`)
*   `test:` — Menambah atau memperbaiki *testing*.

**Aturan Pull Request (PR):**
Semua *merge* ke `dev` WAJIB melalui *Pull Request*. Minimal harus ada 1 *approval* dari anggota tim lain. Pastikan aplikasi berjalan normal di *environment* lokal dan tidak ada *merge conflict* sebelum melakukan *merge*.

---

## 3. ⚙️ Backend Rules (Express.js + Prisma)

**A. Naming Convention:**
*   **Controllers, Middlewares, & Utils**: Gunakan *camelCase* dengan satu file per domain (contoh: `authController.js`, `errorHandler.js`).
*   **Endpoint URL**: Gunakan *kebab-case* dan *plural* (kata jamak) (contoh: `/api/plants`, `/api/community-posts`).

**B. Error Handling (Global):**
*   **DILARANG** menggunakan `try...catch` manual di dalam *Controller*.
*   Gunakan pelemparan *error* langsung: `throw new AppError('Pesan error', statusCode)`.
*   Semua *error* akan ditangkap dan diformat secara otomatis oleh *Global Error Handler*. *Stack trace* tidak boleh bocor ke *client* saat berada di mode *production*.

**C. Standard API Response:**
Tujuannya agar tim *Frontend* konsisten saat melakukan *parsing* data pakai Axios.
*   **Sukses (Tanpa Data):**
    ```json
    { "status": "success", "message": "Tanaman berhasil disiram" }
    ```
*   **Sukses (Dengan Data):**
    ```json
    { "status": "success", "message": "Data profil ditemukan", "data": { "nama": "Arya", "poin": 150 } }
    ```
*   **Sukses (List/Pagination):**
    ```json
    { "status": "success", "data": [...], "meta": { "page": 1, "limit": 10, "total": 45 } }
    ```

**D. Database Governance:**
Dilarang mengubah skema Prisma (`schema.prisma`) tanpa kesepakatan tim. Jika ada perubahan, WAJIB mengabari tim *Frontend* karena akan merubah struktur JSON *response*.

---

## 4. 🎨 Frontend Rules (React Native / Expo)

**A. Naming Convention:**
*   **Komponen UI**: Gunakan *PascalCase* (contoh: `PlantCard.jsx`, `PrimaryButton.jsx`).
*   **Fungsi & Hooks**: Gunakan *camelCase* (contoh: `useWeatherSync.js`, `handleLogin`).

**B. Design System (TaniSync Neoclay):**
**DILARANG** melakukan *hardcode* nilai HEX warna di dalam komponen. Semua warna wajib dipanggil dari satu file sumber (misal: `constants/colors.js`).

*Palet Wajib:*
*   **Primary (Fresh Green)**: `#3FA86B`
*   **Secondary (Forest Green)**: `#1F5C3D`
*   **Background (Cream)**: `#FBF8F0`
*   **Text Utama (Neutral)**: `#1A1A1A`
*   **Text Muted (Gray)**: `#5C5A4F`
*   **Error/Alert**: `#E5484D`

Komponen interaktif (tombol, *input*) wajib menerapkan standar batas Neobrutalism (border tegas, *hard offset-shadow*), sedangkan ilustrasi/maskot dibiarkan *soft* (tanpa *border*).

---

## 5. 🔐 Security & Secrets
*   File `.env` **HARAM** di- *commit* ke GitHub.
*   Konfigurasi rahasia (*API Keys Gemini*, *OpenWeatherMap*, *Cloudinary*, dan *Database URL*) **HANYA** boleh diakses melalui `process.env`. 
*   **DILARANG KERAS** melakukan *hardcode API Key* di file apapun, baik di sisi Backend maupun Frontend.
*   *Token JWT* dilarang di- *log* ke dalam *console* dengan alasan apapun.