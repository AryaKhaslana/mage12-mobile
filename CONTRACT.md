# API CONTRACT - TANISYNC
> SUMBER TUNGGAL KEBENARAN UNTUK AI FRONTEND. BACA INI, JANGAN MENGARANG.

- **Base URL (Prod):** `https://mage12-api-production.up.railway.app`
- **Base URL (Dev):** `http://localhost:3000`
- **Auth Header:** `Authorization: Bearer <token>`
- **Format Error Global (Prod):** `{ "status": "fail" | "error", "message": "Pesan error" }`
- **Format Error Global (Dev):** `{ "status": string, "error": object, "message": string, "stack": string }`
- **Valid `jenisTanaman`:** `Padi`, `Jagung`, `Singkong`, `Ubi Jalar`, `Kedelai`, `Kacang Tanah`, `Tomat`, `Cabai Merah`, `Cabai Rawit`, `Bawang Merah`, `Bawang Putih`, `Kubis`, `Kangkung`, `Bayam`, `Terong`, `Timun`, `Labu Siam`, `Wortel`, `Kentang`, `Pisang`

---

### POST /api/auth/google
body: { idToken: string }
res 200: { status: "success", message: "Login Google berhasil broskie!", data: { token: string, user: { id: int, nama: string, email: string, googleId: string | null, username: string | null, noHp: string | null, bio: string | null, avatarUrl: string | null, latitude: float | null, longitude: float | null, level: int, streak: int, lastAktivitas: string | null } } }
res 400: { status: "fail", message: "idToken wajib dikirim." | "Email tidak ditemukan dari Google." }
res 401: { status: "fail", message: "Token Google tidak valid atau kedaluwarsa." }
⚠️ **CATATAN DATA USER**: Endpoint auth (`login` & `google`) me-return superset (termasuk `googleId` & `lastAktivitas`), sedangkan GET/PUT `/api/user/me` me-return subset (tanpa `googleId` & `lastAktivitas`).

### POST /api/auth/register
⚠️ **CATATAN**: Endpoint ini HANYA untuk pendaftaran email+password. User Google dibuat otomatis via `POST /api/auth/google` (dengan lat/long `null`), lalu melengkapi lokasi via `PUT /api/user/me`.
- **body (JSON):** `{ nama: string, email: string, password: string, latitude: float, longitude: float }`
- **res 201:** `{ "status": "success", "message": "Registrasi berhasil, silakan login!" }`
- **res 400/409:** `{ "status": "fail", "message": "..." }`

### POST /api/auth/login
- **body (JSON):** `{ email: string, password: string }`
- **res 200:** `{ "status": "success", "message": "Login berhasil.", "data": { "token": string, "user": { "id": int, "nama": string, "email": string, "username": string | null, "noHp": string | null, "bio": string | null, "avatarUrl": string | null, "latitude": float | null, "longitude": float | null, "level": int, "streak": int, "lastAktivitas": string | null } } }`
- **res 401/404:** `{ "status": "fail", "message": "..." }`

### GET /api/user/me
⚠️ **CATATAN LOKASI NULL**: `latitude` dan `longitude` bernilai `null` khusus untuk user Google yang belum menyetel lokasi; frontend WAJIB handle `null`.

- **res 200:** `{ "status": "success", "data": { "id": int, "nama": string, "email": string, "username": string | null, "noHp": string | null, "bio": string | null, "avatarUrl": string | null, "latitude": float | null, "longitude": float | null, "streak": int, "level": int } }`
- **res 401/404:** `{ "status": "fail", "message": "..." }`

### PUT /api/user/me
⚠️ **WARNING**: Frontend WAJIB meminta izin lokasi setelah login Google pertama kali, lalu kirim koordinat via PUT /user/me SEBELUM mengakses fitur komunitas.

- **body (Form-Data):** `nama?: string`, `username?: string`, `noHp?: string`, `bio?: string`, `avatar?: file`, `latitude?: string`, `longitude?: string`
- **catatan:** Kirim KEDUANYA atau tidak sama sekali (satu saja -> 400). Range lat -90..90 / lng -180..180. Nilai dari FormData berupa string dan akan di-parse backend menjadi float.
- **res 200:** `{ "status": "success", "message": "Profil berhasil diupdate!", "data": { "id": int, "nama": string, "email": string, "username": string | null, "noHp": string | null, "bio": string | null, "avatarUrl": string | null, "latitude": float | null, "longitude": float | null, "streak": int, "level": int } }`
- **res 400/409:** `{ "status": "fail", "message": "..." }`

### POST /api/tanaman
- **body (JSON):** `{ jenisTanaman: string, nickname?: string }`
- **res 201:** `{ "status": "success", "message": "Tanaman berhasil ditambahkan broskie!", "data": { "id": int, "userId": int, "jenisTanaman": string, "nickname": string | null, "tanggalTanam": string(ISO), "daysToHarvest": int, "predictiveScore": int, "statusPenyiraman": "PERLU_SIRAM" | "DITUNDA_HUJAN" | "SUDAH_DISIRAM" } }`
- **res 400:** `{ "status": "fail", "message": "..." }`

### GET /api/tanaman
- **res 200:** `{ "status": "success", "data": [ { "id": int, "userId": int, "jenisTanaman": string, "nickname": string | null, "tanggalTanam": string(ISO), "daysToHarvest": int, "predictiveScore": int, "statusPenyiraman": string, "sisaHariPanen": int, "logTerakhir": { "id": int, "tipeValidasi": string, "fotoUrl": string | null, "createdAt": string(ISO) } | null } ] }`

### GET /api/tanaman/:id
- **res 200:** `{ "status": "success", "data": { "id": int, "userId": int, "jenisTanaman": string, "nickname": string | null, "tanggalTanam": string(ISO), "daysToHarvest": int, "predictiveScore": int, "statusPenyiraman": string, "sisaHariPanen": int } }`
- **res 404:** `{ "status": "fail", "message": "Tanaman tidak ditemukan atau bukan milik lu broskie!" }`

### PUT /api/tanaman/:id
- **body (JSON):** `{ jenisTanaman?: string, nickname?: string }`
- **res 200:** `{ "status": "success", "data": { "id": int, "userId": int, "jenisTanaman": string, "nickname": string | null, "tanggalTanam": string, "daysToHarvest": int, "predictiveScore": int, "statusPenyiraman": string } }`
- **res 400/404:** `{ "status": "fail", "message": "..." }`

### DELETE /api/tanaman/:id
- **res 200:** `{ "status": "success", "message": "Tanaman berhasil dihapus!" }`
- **res 404:** `{ "status": "fail", "message": "..." }`

### POST /api/logs
- **body (JSON atau Form-Data):** `tanamanId: int`, `tipeValidasi: "button_only" | "photo"`, `foto: file (wajib jika photo)`
- **res 201:** `{ "status": "success", "message": "Aktivitas dicatat! Tanaman dapet +X poin. Streak kamu: Y hari 🔥!", "data": { "log": { "id": int, "userId": int, "tanamanId": int, "tipeValidasi": "button_only" | "photo", "fotoUrl": string | null, "createdAt": string(ISO) }, "skorSaatIni": int, "streak": int } }`
- **res 400/404:** `{ "status": "error", "message": "..." }`

### GET /api/logs/:tanamanId
- **res 200:** `{ "status": "success", "data": [ { "id": int, "userId": int, "tanamanId": int, "tipeValidasi": string, "fotoUrl": string | null, "createdAt": string(ISO) } ] }`

### GET /api/weather/today
- **res 200:** `{ "status": "success", "data": { "kondisi": "HUJAN" | "BERAWAN" | "CERAH", "deskripsi": string, "suhu": float, "pop": float, "prediksiHujanHariIni": boolean } }`
- **catatan:** `pop` = probability of precipitation 0..1 (3 jam ke depan), `prediksiHujanHariIni` = true jika `pop >= 0.4` (threshold identik dengan cron DITUNDA_HUJAN).
- **res 400:** `{ "status": "fail", "message": "Koordinat lokasi belum disetel." }` (user belum set lat/lng)
- **res 502:** `{ "status": "error", "message": "Layanan cuaca sedang tidak tersedia." }`
⚠️ **CATATAN CUACA**: Frontend WAJIB handle user koordinat `null` (skip kartu cuaca, JANGAN crash).

### POST /api/tanaman/:id/panen
- **res 201:** `{ "status": "success", "message": "Panen berhasil dicatat broskie! 🌾", "data": { "id": int, "userId": int, "tanamanId": int | null, "namaTanaman": string, "jenisTanaman": string, "tanggalPanen": string(ISO) } }`
- **res 400:** `{ "status": "fail", "message": "Tanaman ini belum siap panen broskie!" }` atau `"Tanaman ini sudah pernah dipanen broskie!"`
- **res 403/404:** `{ "status": "fail", "message": "Tanaman tidak ditemukan atau bukan milik lu broskie!" }`
- **catatan:** Saat dipanen, record tanaman dihapus permanen dari tabel `Tanaman` tapi tercatat rapi di `RiwayatPanen`.

### GET /api/achievements
- **res 200:** `{ "status": "success", "data": { "streak": int, "totalPanen": int, "tanamanAktif": int, "level": int, "achievements": [ { "kode": string, "judul": string, "deskripsi": string, "tercapai": boolean, "progress": int, "target": int } ] } }`

### GET /api/community
- **query:** `latitude: float (wajib)`, `longitude: float (wajib)`, `page: int (opsional)`, `limit: int (opsional)`
- **res 200:** `{ "status": "success", "meta": { "halamanSekarang": int, "dataPerHalaman": int }, "data": [ { "id": int, "userId": int, "user_nama": string, "tipePost": "progress_update" | "panen_surplus" | "pertanyaan", "deskripsi": string, "fotoUrl": string | null, "createdAt": string(ISO), "latitude": float, "longitude": float, "distance": float(km) } ] }`

### POST /api/community
- **body (Form-Data):** `tipePost: "progress_update" | "panen_surplus" | "pertanyaan"`, `deskripsi: string`, `foto: file (opsional)`
- **res 201:** `{ "status": "success", "message": "Berhasil posting broskie!", "data": { "id": int, "userId": int, "tipePost": string, "deskripsi": string, "fotoUrl": string | null, "latitude": float, "longitude": float, "createdAt": string(ISO) } }`
- **res 400:** `{ "status": "fail", "message": "Lengkapi lokasimu dulu sebelum posting di komunitas ya broskie." | "..." }`

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
1. **TIDAK ADA endpoint khusus get streak/skor user.** Data `streak` user & `skorSaatIni` hanya di-return sebagai respons saat berhasil melakukan `POST /api/logs`.
2. **TIDAK ADA field `userId`, `latitude`, `longitude` pada payload POST /api/community.** Frontend dilarang mengirim data ini via form karena Backend mengekstraknya otomatis dari Token JWT.
3. **TIDAK ADA sistem Notifikasi/Websocket.**
4. **TIDAK ADA pagination pada `/api/tanaman` atau `/api/logs/:tanamanId`.** Semua data di-return langsung dalam 1 array. Pagination HANYA ada di `/api/community` dan `/api/tanibot/history`.
5. **TIDAK ADA tipe data `Date` utuh.** Semua tanggal dikembalikan sebagai String ISO 8601 (contoh: `2026-09-06T14:17:04.040Z`). Frontend wajib memparsingnya.


6. **META BEDA BENTUK antar endpoint — jangan bikin helper generik**. Pada `/api/community` format `meta`-nya adalah `{ halamanSekarang, dataPerHalaman }`, sedangkan di `/api/tanibot/history` formatnya `{ page, limit, total }`.