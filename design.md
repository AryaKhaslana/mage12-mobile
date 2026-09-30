---
name: TaniSync Clay
version: 2.0.0
description: "Sistem desain resmi untuk aplikasi TaniSync yang mengusung gaya Full Claymorphism (lembut, modern, tanpa border tebal)."
---

# TaniSync Clay Design System

## Overview

TaniSync Clay adalah sistem desain yang sepenuhnya berfokus pada gaya **Claymorphism**. Semua komponen UI (card, button, modal, input) dirancang dengan pendekatan yang lembut, *bouncy*, dan ramah. Sistem ini membuang gaya Neobrutalism lama yang terkesan kasar (border tebal dan shadow offset keras).

Karakteristik utama:
- **Soft Shadows (Elevation):** Efek mengambang lembut menggunakan `shadowColor: "#123924", shadowOpacity: 0.08, shadowRadius: 14, elevation: 4`.
- **No Borders:** Komponen card, tombol, dan input tidak lagi menggunakan `borderWidth: 2` dengan `borderColor: "#123924"`. Border disembunyikan atau dihapus sepenuhnya (`borderWidth: 0`).
- **Rounded Corners:** Menggunakan sudut melengkung besar (biasanya `borderRadius: 16` hingga `32` atau `100` untuk pill) untuk memperkuat kesan empuk/clay.

## Colors

- **Primary** (`#3FA86B`): tombol utama, ikon aktif, elemen interaktif.
- **Secondary** (`#1F5C3D`): background panel gelap (header).
- **Ink** (`#123924`): teks utama, ikon, dan warna dasar shadow (selalu dengan opacity rendah).
- **Amber** (`#FFB627`): elemen gamifikasi (badge, reward, streak accent).
- **Coral** (`#FF6B5C`): status urgent/butuh perhatian, notifikasi.
- **Teal** (`#2E9E8C`): tag komunitas/sosial.
- **Neutral** (`#FBF8F0`): background halaman utama.
- **Surface** (`#FFFFFF`): background card & input.

## Typography

Plus Jakarta Sans (atau Nunito) digunakan secara konsisten.
- **ExtraBold** (800): Headline, modal title.
- **Bold** (700): Sub-title, teks tombol, teks tag.
- **Medium** (500): Teks body panjang, input text, deskripsi sekunder.

## Layout & Elevation

Padding halaman standar adalah `20px`.

Dua level elevation utama:
- **Base Clay (Elevation 4):** Digunakan untuk 90% komponen (Card, Button, Input, Chip).
  - Format: `shadowColor: "#123924", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 14, elevation: 4`
- **Floating Clay (Elevation 16):** Digunakan untuk komponen yang melayang di atas konten lain (Bottom Modal, Floating Action Button, Header melayang).
  - Format: `shadowColor: "#123924", shadowOffset: { width: 0, height: -6 }, shadowOpacity: 0.08, shadowRadius: 14, elevation: 16`

## Components

- **button-primary**: Tombol aksi utama (background Primary). Tanpa border, soft shadow.
- **button-secondary**: Tombol sekunder (background Surface/putih). Tanpa border, soft shadow.
- **card-flat**: Permukaan konten standar (background Surface). Tanpa border, soft shadow, `borderRadius: 24`.
- **input-field**: Input teks (background Surface). Tanpa border tebal, soft shadow, padding luas.
- **chip / tag**: Elemen filter/kategori (background Surface / Primary jika aktif). Tanpa border, soft shadow, bentuk melingkar (pill).

## States (Interaksi)

- **pressed**: Saat ditekan, komponen mengecil sedikit (`transform: [{ scale: 0.98 }]`) dan shadow mengecil (`shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1`). Tidak ada perubahan warna mendadak atau shadow yang tiba-tiba keras.

## Do's and Don'ts

- **Do**: Gunakan format shadow yang persis sama di semua tempat untuk menjaga konsistensi elevasi.
- **Do**: Gunakan `borderRadius` yang besar untuk mempertahankan kesan empuk.
- **Don't**: Jangan gunakan border tebal (contoh: `borderWidth: 2`) lagi.
- **Don't**: Jangan gunakan hard/offset shadow tanpa blur (seperti pada Neobrutalism sebelumnya).
