# API CONTRACT - TANISYNC
> SUMBER TUNGGAL KEBENARAN UNTUK AI FRONTEND. BACA INI, JANGAN MENGARANG.

- **Base URL (Prod):** `https://mage12-api-production.up.railway.app`
- **Base URL (Dev):** `http://localhost:3000`
- **Auth Header:** `Authorization: Bearer <token>`
- **Format Error Global (Prod):** `{ "status": "fail" | "error", "message": "Pesan error" }`
- **Format Error Global (Dev):** `{ "status": string, "error": object, "message": string, "stack": string }`
- **Valid `jenisTanaman`:** `Padi`, `Jagung`, `Singkong`, `Ubi Jalar`, `Kedelai`, `Kacang Tanah`, `Tomat`, `Cabai Merah`, `Cabai Rawit`, `Bawang Merah`, `Bawang Putih`, `Kubis`, `Kangkung`, `Bayam`, `Terong`, `Timun`, `Labu Siam`, `Wortel`, `Kentang`, `Pisang`

---

### POST /api/auth/register
- **body (JSON):** `{ nama: string, email: string, password: string, latitude: float, longitude: float }`
- **res 201:** `{ "status": "success", "message": "Registrasi berhasil, silakan login!" }`
- **res 400/409:** `{ "status": "fail", "message": "..." }`

### POST /api/auth/login
- **body (JSON):** `{ email: string, password: string }`
- **res 200:** `{ "status": "success", "message": "Login berhasil.", "token": string, "data": { "id": int, "nama": string, "email": string } }`
- **res 401/404:** `{ "status": "fail", "message": "..." }`

### GET /api/user/me
- **res 200:** `{ "status": "success", "data": { "id": int, "nama": string, "email": string, "latitude": float, "longitude": float, "streak": int, "level": int } }`
- **res 401/404:** `{ "status": "fail", "message": "..." }`

### POST /api/tanaman
- **body (JSON):** `{ jenisTanaman: string }`
- **res 201:** `{ "status": "success", "message": "Tanaman berhasil ditambahkan broskie!", "data": { "id": int, "userId": int, "jenisTanaman": string, "tanggalTanam": string(ISO), "daysToHarvest": int, "predictiveScore": int, "statusPenyiraman": "PERLU_SIRAM" | "DITUNDA_HUJAN" | "SUDAH_DISIRAM" } }`
- **res 400:** `{ "status": "fail", "message": "..." }`

### GET /api/tanaman
- **res 200:** `{ "status": "success", "data": [ { "id": int, "userId": int, "jenisTanaman": string, "tanggalTanam": string(ISO), "daysToHarvest": int, "predictiveScore": int, "statusPenyiraman": string, "sisaHariPanen": int } ] }`

### PUT /api/tanaman/:id
- **body (JSON):** `{ jenisTanaman: string }`
- **res 200:** `{ "status": "success", "data": { "id": int, "userId": int, "jenisTanaman": string, "tanggalTanam": string, "daysToHarvest": int, "predictiveScore": int, "statusPenyiraman": string } }`
- **res 404:** `{ "status": "fail", "message": "Tanaman tidak ditemukan atau bukan punya lu!" }`

### DELETE /api/tanaman/:id
- **res 200:** `{ "status": "success", "message": "Tanaman berhasil dihapus!" }`
- **res 404:** `{ "status": "fail", "message": "..." }`

### POST /api/logs
- **body (JSON atau Form-Data):** `tanamanId: int`, `tipeValidasi: "button_only" | "photo"`, `foto: file (wajib jika photo)`
- **res 201:** `{ "status": "success", "message": "Aktivitas dicatat! Tanaman dapet +X poin. Streak kamu: Y hari 🔥!", "data": { "log": { "id": int, "userId": int, "tanamanId": int, "tipeValidasi": "button_only" | "photo", "fotoUrl": string | null, "createdAt": string(ISO) }, "skorSaatIni": int, "streak": int } }`
- **res 400/404:** `{ "status": "error", "message": "..." }`

### GET /api/logs/:tanamanId
- **res 200:** `{ "status": "success", "data": [ { "id": int, "userId": int, "tanamanId": int, "tipeValidasi": string, "fotoUrl": string | null, "createdAt": string(ISO) } ] }`

### GET /api/community
- **query:** `latitude: float (wajib)`, `longitude: float (wajib)`, `page: int (opsional)`, `limit: int (opsional)`
- **res 200:** `{ "status": "success", "meta": { "halamanSekarang": int, "dataPerHalaman": int }, "data": [ { "id": int, "userId": int, "user_nama": string, "tipePost": "progress_update" | "panen_surplus" | "pertanyaan", "deskripsi": string, "fotoUrl": string | null, "createdAt": string(ISO), "latitude": float, "longitude": float, "distance": float(km) } ] }`

### POST /api/community
- **body (Form-Data):** `tipePost: "progress_update" | "panen_surplus" | "pertanyaan"`, `deskripsi: string`, `foto: file (opsional)`
- **res 201:** `{ "status": "success", "message": "Berhasil posting broskie!", "data": { "id": int, "userId": int, "tipePost": string, "deskripsi": string, "fotoUrl": string | null, "latitude": float, "longitude": float, "createdAt": string(ISO) } }`
- **res 400:** `{ "status": "fail", "message": "..." }`

### DELETE /api/community/:id
- **res 200:** `{ "status": "success", "message": "Postingan dan foto di Cloudinary resmi musnah broskie!" }`
- **res 404:** `{ "status": "fail", "message": "..." }`

### POST /api/tanibot
- **body (JSON):** `{ pertanyaan: string }`
- **res 200:** `{ "status": "success", "message": "Berhasil mendapatkan jawaban TaniBot", "data": { "jawaban": string } }`

### GET /api/tanibot/history
- **query:** `page: int (opsional)`, `limit: int (opsional)`
- **res 200:** `{ "status": "success", "message": "Berhasil mengambil riwayat obrolan", "data": [ { "id": int, "role": "USER" | "BOT", "message": string, "createdAt": string(ISO) } ], "meta": { "page": int, "limit": int, "total": int } }`

### GET /health
- **res 200:** `{ "status": "success", "message": "TaniSync API is healthy and connected to DB!" }`
- **res 500:** `{ "status": "error", "message": "..." }`

---

## 🚫 CATATAN PENTING (YANG TIDAK ADA DI API)
1. **TIDAK ADA endpoint edit profil.** Profil lengkap diambil via `GET /api/user/me`. Edit tidak didukung.
2. **Skor Saat Ini pada Jurnal: Data skorSaatIni (skor per tanaman) hanya di-return saat POST /api/logs. Untuk mendapatkan total streak harian dan level user secara global, WAJIB menggunakan GET /api/user/me."`.
3. **TIDAK ADA field `userId`, `latitude`, `longitude` pada payload POST /api/community.** Frontend dilarang mengirim data ini via form karena Backend mengekstraknya otomatis dari Token JWT.
4. **TIDAK ADA sistem Notifikasi/Websocket.**
5. **TIDAK ADA pagination pada `/api/tanaman` atau `/api/logs/:tanamanId`.** Semua data di-return langsung dalam 1 array. Pagination HANYA ada di `/api/community` dan `/api/tanibot/history`.
6. **TIDAK ADA tipe data `Date` utuh.** Semua tanggal dikembalikan sebagai String ISO 8601 (contoh: `2026-09-06T14:17:04.040Z`). Frontend wajib memparsingnya.

