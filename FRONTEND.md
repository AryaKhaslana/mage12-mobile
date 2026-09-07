# 🚀 TaniSync Frontend Playbook
Panduan taktis integrasi React Native/Expo ke Backend TaniSync. 
Dokumen ini difokuskan pada *workflow*, *gotchas* (jebakan betmen), dan *flow state*. Untuk detail *payload* per endpoint, silakan merujuk ke file `api.md`.

---

## 1. QUICK START (Alur Integrasi 5 Langkah)

Alur dasar integrasi API TaniSync:
`Login/Register` ➡️ `Simpan Token (SecureStore)` ➡️ `Set Koordinat` ➡️ `Fetch Data pakai Token` ➡️ `Render UI`.

### A. Login & Simpan Token
Gunakan *Local Storage* atau `expo-secure-store` untuk menyimpan token JWT.

```javascript
// Contoh Login
const login = async (email, password) => {
  try {
    const res = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const json = await res.json();
    
    if (res.ok) {
      await SecureStore.setItemAsync('userToken', json.token);
      return json.token;
    } else {
      alert(json.message); // Pesan dari server
    }
  } catch (err) {
    console.error(err);
  }
};
```

### B. Request Endpoint Terproteksi (Pakai Bearer Token)
Semua request selain Auth WAJIB mengirim token JWT di *Header*.

```javascript
const fetchTanaman = async () => {
  const token = await SecureStore.getItemAsync('userToken');
  
  const res = await fetch('http://localhost:3000/api/tanaman', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const json = await res.json();
  if (res.ok) {
    // Ingat: Data asli ada di json.data, BUKAN json secara langsung
    setTanamanList(json.data); 
  }
};
```

### C. Upload Foto (Form-Data) ke POST /api/logs
Upload foto ke API kita wajib menggunakan format `multipart/form-data`. **Jangan kirim JSON!**

```javascript
const submitLogPhoto = async (tanamanId, imageUri) => {
  const token = await SecureStore.getItemAsync('userToken');
  const formData = new FormData();
  
  formData.append('tanamanId', tanamanId);
  formData.append('tipeValidasi', 'photo');
  
  // Format file dari image picker Expo
  const filename = imageUri.split('/').pop();
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : `image`;
  
  formData.append('foto', {
    uri: imageUri,
    name: filename,
    type
  });

  const res = await fetch('http://localhost:3000/api/logs', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
      // JANGAN set Content-Type secara manual kalau pakai formData di Fetch API
    },
    body: formData
  });
  
  const json = await res.json();
  if (res.ok) {
    alert(`Dapat ${json.data.skorSaatIni} skor! Streak: ${json.data.streak}`);
  }
};
```

### D. Fetch Feed Tetangga (GET /api/community)
WAJIB menyertakan `latitude` dan `longitude` via *Query Parameter*.

```javascript
const fetchCommunityFeed = async (lat, lng) => {
  const token = await SecureStore.getItemAsync('userToken');
  const url = `http://localhost:3000/api/community?latitude=${lat}&longitude=${lng}`;
  
  const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
  const json = await res.json();
  
  if (res.ok) {
    setFeed(json.data); // Array postingan tetangga
    // Metadata pagination ada di json.meta
  }
};
```

---

## 2. KONTRAK DATA PENTING (Awas Typo!)

- **Response Sukses:** Format pastinya adalah `{ status: "success", message: "...", data: {...} }`. Saat *assign state* React, kamu harus mengekstrak `json.data`, jangan nge-*set* respon `json` mentah ke dalam state array.
- **Log Foto URL (`fotoUrl`):** Untuk respon upload foto dari Cloudinary, letak pastinya ada di **`json.data.log.fotoUrl`** (BUKAN `logAktivitas`). Tolong diperhatikan baik-baik.
- **Pagination Feed:** Tersedia di **`json.meta`**. Formatnya: `{ halamanSekarang, dataPerHalaman }`. 
- **Field `distance`:** Feed community akan otomatis mereturn field `distance`. Satuan yang dipakai murni **Kilometer (km)** berformat Number. Data selalu otomatis diurutkan (ASC) dari lokasi paling dekat ke paling jauh.

---

## 3. FORMATTING STANDAR

- **Tanggal (ISO 8601 UTC):** Tanggal dari API (`createdAt`, `tanggalTanam`) dikirimkan dalam format waktu standar UTC (contoh: `2026-09-06T14:17:04.040Z`). Frontend (aplikasi) **HARUS** mengonversinya secara lokal untuk penyesuaian zona waktu sebelum di-render (Misalnya: WIB GMT+7). Bisa pakai library seperti `date-fns` atau `dayjs`.
- **Foto (Bisa `null`):** Properti `fotoUrl` dari *Community Feed* maupun *Log Aktivitas* dapat bernilai `null` apabila user mem-posting tulisan biasa (`button_only`). WAJIB tangani via pengecekan *conditional rendering* (contoh: `if (!post.fotoUrl) return null;`) supaya Expo tidak *crash*.

---

## 4. HAL YANG SERVER YANG NGURUS (Frontend Nggak Perlu Mikir)

- 🧮 **Hitung Jarak (Haversine):** Frontend cuma perlu nyodorin titik koordinat device user saat nembak GET Community Feed. Otak matematis nyari siapa tetangga terdekat, perhitungan *distance*, dan filter *strict* 2 KM murni diproses sama server.
- 🎮 **Streak, Skor, Level:** Aturan perhitungan *reset daily streak* dan kalkulasi poin (+5 untuk foto, +1 untuk tombol) semuanya otomatis divalidasi dan dihitung di *Database Transaction*. Pas *request* sukses, JSON response langsung nyodorin *streak* & *skor* terbaru untuk di-render.
- ⏳ **Sisa Hari Panen (`daysToHarvest`):** Backend otomatis nge-*lookup* masa panen dari kamus *dictionary* internal saat user pilih `jenisTanaman`. Frontend gak perlu nge-*hardcode* umur tanaman.
- 🤖 **Konteks Chat TaniBot:** Gak perlu kirim susunan *array message history* panjang-panjang ke API. Cukup tembak pertanyaan baru (`pertanyaan`). Backend udah nyimpen memori spesifik per-user dan menyusun skemanya ke Gemini.
- 📍 **Validasi Koordinat & Author ID:** `userId`, `latitude`, dan `longitude` pembuat postingan bakal otomatis diambil dari ekstrak JWT Token. Frontend gak perlu dan dilarang menyisipkan `userId` di *request body*.

---

## 5. DAFTAR NAMA TANAMAN VALID

Nilai *payload* `jenisTanaman` saat menembak POST `/api/tanaman` **WAJIB SAMA PERSIS** (Perhatikan huruf besar dan spasi) dengan nilai *array* di bawah ini. Jika dikirim beda 1 karakter pun, API akan melempar error 400. Gunakan ini sebagai *Data Source Dropdown Picker* di UI.

1. `Padi`
2. `Jagung`
3. `Singkong`
4. `Ubi Jalar`
5. `Kedelai`
6. `Kacang Tanah`
7. `Tomat`
8. `Cabai Merah`
9. `Cabai Rawit`
10. `Bawang Merah`
11. `Bawang Putih`
12. `Kubis`
13. `Kangkung`
14. `Bayam`
15. `Terong`
16. `Timun`
17. `Labu Siam`
18. `Wortel`
19. `Kentang`
20. `Pisang`

---

## 6. STATE FLOW UNTUK FITUR UTAMA

**A. Flow "Sari menanam cabai"**
1. User **Register** & **Login** sukses, token tersimpan di *device*.
2. User klik tambah tanaman di UI, aplikasi mengirim **POST /api/tanaman** (`jenisTanaman: "Cabai Merah"`).
3. Tanaman muncul di kebun dengan hari sisa panen (`sisaHariPanen`) yang dirender.
4. User mencatat aktivitas harian: kirim **POST /api/logs** (menggunakan tipe `button_only` atau foto).
5. Frontend memunculkan pop-up / toast dari respons server (Skor & Streak naik secara *real-time*).

**B. Flow "Feed Tetangga"**
1. Aplikasi meminta izin akses GPS *device*.
2. Setelah dapat GPS, tembak **GET /api/community?latitude=x&longitude=y**.
3. Frontend merender postingan menjadi lis (*FlatList*), setiap *item card* bisa dirender beserta *badge* indikator jarak (contoh dari JSON: `distance: 0.3` diubah di tampilan jadi `0.3 km`).

**C. Flow "TaniBot"**
1. Tampilan Chat terbuka, tembak **GET /api/tanibot/history** untuk nge-*load* obrolan terdahulu (tampilkan chat bubble yang diurutkan).
2. User mengetik pesan dan submit.
3. Kirim **POST /api/tanibot** dengan payload `{ pertanyaan: "Isi teks..." }`.
4. Render *typing indicator* sambil menunggu.
5. Setelah *response* (200) sukses diterima, populasikan / re-render list obrolan dengan *bubble* teks bot dari properti `jawaban`.

---

## 7. ERROR HANDLING CHEAT SHEET

| HTTP Status | Artinya | Action Frontend |
| :--- | :--- | :--- |
| **`400`** | Validasi gagal / Input form ditolak | Tangkap dan munculkan teks peringatan di UI dari atribut `json.message` (contoh: "Password minimal 8"). |
| **`401`** | Token *Invalid*, *Expired*, atau Kosong | Deteksi status ini lalu paksa *logout* user (hapus token dari SecureStore) dan arahkan ke layar Login. |
| **`404`** | Data tidak ketemu / Salah ID akses | Tampilkan UI *"Data Not Found"* atau 404 illustration, sembunyikan fitur aksi (Edit/Delete). |
| **`409`** | Data Duplikat (*Unique Constraint*) | Beritahu user inputannya bentrok (Misal: *"Email ini sudah dipakai mendaftar"*). |
| **`429`** | Limit API / Sistem Anti-Spam aktif | Matikan (*disable*) tombol *submit* sementara waktu, dan tampilkan indikasi hitung mundur / *cooldown timer*. |
| **`500`** | Server Crash / TiDB Database Mati | Tampilkan *Snackbar* "Server sedang sibuk, ulangi lagi nanti". (Pesan 500 tidak memuat stack error di produksi). |

---

## 8. ENVIRONMENT VARIABLES (.env)

Tim Frontend **HARUS** membedakan koneksi Base URL secara dinamis dari file Environment variable (seperti `.env` expo):
- **Development**: `http://localhost:3000` (Ganti localhost dengan IP Laptop `192.x.x.x` jika test di HP Fisik yang terhubung WiFi sama).
- **Production**: URL Railway / VPS sesungguhnya jika backend telah di-deploy (Misal: `https://api.tanisync.com`).

**MOHON UNTUK TIDAK MENG-HARDCODE STRING URL DI FILE FETCH ANDA.** Gunakan `process.env.EXPO_PUBLIC_API_URL`.

