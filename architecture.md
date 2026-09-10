# 🏗️ Architecture Document (architecture.md)
**Project Name:** TaniSync
**Architecture Pattern:** Modern Client-Server[cite: 2]

---

## 1. High-Level Architecture
Secara teknis, TaniSync mengimplementasikan arsitektur Client-Server modern[cite: 2]. Aplikasi sisi klien (mobile app) akan berkomunikasi dengan server backend melalui antarmuka RESTful API untuk melakukan operasi pertukaran data, seperti pembuatan profil pencatatan tanaman[cite: 2].

## 2. Client-Side (Frontend)
*   **Teknologi Utama:** React Native (Expo)[cite: 2].
*   **Fungsi:** Memungkinkan pengembangan antarmuka aplikasi mobile lintas platform (Android/iOS) secara efisien[cite: 2].
*   **Akses Native Perangkat:** Bertugas menangani input pengguna serta mengakses fitur perangkat keras seperti live camera (untuk unggah foto jurnal) dan GPS/Geolokasi (untuk memvalidasi radius pengguna)[cite: 2].

## 3. Server-Side (Backend API)
*   **Teknologi Utama:** Node.js dengan framework Express.js[cite: 2].
*   **Fungsi Utama:** Bertindak sebagai jembatan logika utama yang memproses validasi jarak koordinat dan waktu perawatan tanaman[cite: 2].
*   **Karakteristik:** Mengeksekusi sisi server yang ringan dan sangat cepat, sangat ideal untuk menangani logika otomasi (cron-job) dan menjembatani integrasi dengan berbagai API eksternal[cite: 2].

## 4. Database & ORM
*   **Basis Data:** MySQL[cite: 2].
*   **Fungsi Basis Data:** Berperan sebagai Sistem Manajemen Basis Data Relasional (RDBMS) yang stabil dan andal untuk mengelola relasi kompleks antara data pengguna, tanaman, dan transaksi (log aktivitas)[cite: 2].
*   **ORM (Object-Relational Mapping):** Prisma ORM[cite: 2].
*   **Fungsi ORM:** Meningkatkan efisiensi, keterbacaan, keamanan pengembangan backend melalui type-safety, dan menjamin keamanan dari ancaman SQL Injection saat mengeksekusi query basis data[cite: 2].

## 5. Background Task & Automation (Scheduler)
*   **Teknologi:** Module `node-cron`[cite: 2].
*   **Fungsi:** Mengeksekusi fungsi pengecekan cuaca dan pengiriman notifikasi penyiraman secara otomatis dan terjadwal di sisi server[cite: 2].
*   **Alur Kerja:** Mengeksekusi tugas terjadwal setiap pagi untuk menarik data cuaca berformat JSON dari endpoint OpenWeatherMap API[cite: 2]. Data cuaca ini kemudian dikomparasi dengan basis data untuk menentukan logika pengiriman atau penundaan push notification penyiraman ke perangkat pengguna[cite: 2].

## 6. Integrasi Pihak Ketiga (Third-Party Services)
Sistem TaniSync bergantung pada beberapa layanan eksternal untuk menjalankan fitur intinya:
1.  **OpenWeatherMap API (Data Source):** Menyediakan data cuaca hiperlokal secara real-time dalam format JSON yang menjadi pondasi algoritma penundaan penyiraman otomatis[cite: 2].
2.  **AI API (AI Engine):** Terhubung dengan API Generative AI untuk menggerakkan fitur TaniBot, yang memproses Natural Language Processing (NLP) guna menganalisis dan menjawab keluhan agronomis pengguna (penyakit tanaman dan takaran nutrisi) secara instan[cite: 2].
3.  **Cloudinary (Cloud Storage):** Menyediakan layanan media penyimpanan berbasis cloud yang efisien untuk menampung file gambar dari pengguna[cite: 2]. Storage ini mengelola foto validasi perawatan harian dan foto unggahan pada Community Feed, guna mencegah beban berlebih pada database relasional[cite: 2].
4.  **Expo Push API (Push Notification Service):** Berfungsi sebagai layanan terpusat untuk menjembatani peladen backend dengan perangkat seluler[cite: 2]. Digunakan untuk mengirimkan notifikasi pengingat jadwal perawatan dan peringatan cuaca real-time secara langsung ke smartphone pengguna (Android/iOS)[cite: 2].