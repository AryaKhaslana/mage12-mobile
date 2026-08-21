# 📜 Coding Standards & Guidelines (rules.md)
**Project Name:** TaniSync
**Tech Stack:** React Native, Node.js, MySQL, Prisma ORM[cite: 2]

Semua anggota tim (Frontend & Backend) WAJIB mematuhi aturan ini agar kode tetap bersih, mudah dibaca, dan meminimalisir bug selama fase development.

---

## 1. 🌿 Git & Workflow Rules (GitHub)
Jangan pernah nge-push langsung ke *branch* `main`! 
*   **Branching:** 
    *   `main`: Hanya untuk kode yang sudah 100% jalan dan siap dinilai juri/produksi.
    *   `dev`: Branch utama untuk development dan penggabungan fitur.
    *   `feature/...`: Branch untuk bikin fitur baru (contoh: `feature/auth-login`, `feature/ui-beranda`).
*   **Commit Messages:** Gunakan standar *Conventional Commits*:
    *   `feat: [nama fitur]` -> Untuk menambah fitur baru (contoh: `feat: add community feed UI`).
    *   `fix: [nama bug]` -> Untuk memperbaiki bug (contoh: `fix: benerin radius geolokasi`).
    *   `chore: [tugas]` -> Untuk update package/config (contoh: `chore: install expo-camera`).
    *   `docs: [dokumen]` -> Untuk update README, PRD, dll.

---

## 2. ⚙️ Backend Rules (Node.js & Express)
*   **Arsitektur MVC:** Pisahkan logika menjadi `routes` (untuk endpoint URL) dan `controllers` (untuk logika bisnis/fungsi)[cite: 2]. Jangan taruh logika panjang di dalam `routes`.
*   **Standard API Response:** Semua balasan dari server (API) WAJIB menggunakan format JSON yang seragam agar Frontend mudah melakukan *parsing*.
    ```javascript
    // Format Sukses
    res.status(200).json({ status: "success", message: "Data berhasil diambil", data: {...} });
    
    // Format Error
    res.status(400).json({ status: "error", message: "Gagal memvalidasi radius" });
    ```
*   **Error Handling:** Wajib menggunakan blok `try...catch` di setiap *controller* yang berinteraksi dengan database (Prisma) atau API eksternal (OpenWeatherMap/Cloudinary)[cite: 2].
*   **Keamanan (.env):** File `.env` yang berisi *password database* dan *API Keys* **DILARANG KERAS** di-push ke GitHub. Pastikan `.env` sudah masuk di dalam `.gitignore`.

---

## 3. 📱 Frontend Rules (React Native & Expo)
*   **Komponen:** Gunakan *Functional Components* dan *React Hooks* (`useState`, `useEffect`). Jangan menggunakan *Class Components*.
*   **Penamaan File & Folder:**
    *   Gunakan **PascalCase** untuk komponen UI dan Halaman (contoh: `PlantCard.js`, `HomeScreen.js`).
    *   Gunakan **camelCase** untuk *utilities*, fungsi, atau *hooks* (contoh: `formatDate.js`, `useWeather.js`).
*   **Styling (CSS):** Hindari penggunaan *inline styles* jika terlalu panjang. Selalu gunakan `StyleSheet.create` di bagian bawah file untuk performa render yang lebih baik.
*   **Konsistensi Warna:** Patuhi kode HEX warna aplikasi yang ada di `prd.md` (Fresh Green `#3FA86B`, Forest Green `#1F5C3D`)[cite: 2]. Jangan pakai kode warna hijau lain.

---

## 4. 🗄️ Database & Prisma Rules
*   **Prisma Client:** Semua interaksi dengan database MySQL wajib melalui Prisma Client[cite: 2], dilarang melakukan raw SQL query (`SELECT * FROM...`) kecuali sangat mendesak.
*   **Perubahan Skema:** Jika ada yang ingin mengubah/menambah tabel di `schema.prisma`, **wajib lapor ke Lead Backend (Arya)** terlebih dahulu agar database tidak berantakan saat sinkronisasi (*migration*).