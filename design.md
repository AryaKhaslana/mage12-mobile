---
version: alpha
name: TaniSync Neoclay
description: Kombinasi neobrutalism (border tebal, shadow offset solid, warna saturated) untuk framing UI, dengan sentuhan claymorphism (rounded chubby, soft shadow) khusus di elemen hero/mascot. Target Gen Z, playful tapi intentional — bukan generic soft-UI.
colors:
  primary: "#3FA86B"
  secondary: "#1F5C3D"
  ink: "#123924"
  amber: "#FFB627"
  coral: "#FF6B5C"
  teal: "#2E9E8C"
  neutral: "#FBF8F0"
  surface: "#FFFFFF"
  on-primary: "#FFFFFF"
  on-neutral: "#26251F"
  muted: "#5C5A4F"
typography:
  h1:
    fontFamily: Plus Jakarta Sans
    fontSize: 2rem
    fontWeight: 800
    lineHeight: 1.15
  h2:
    fontFamily: Plus Jakarta Sans
    fontSize: 1.25rem
    fontWeight: 700
    lineHeight: 1.25
  body:
    fontFamily: Plus Jakarta Sans
    fontSize: 0.9375rem
    fontWeight: 400
    lineHeight: 1.6
  caption:
    fontFamily: Plus Jakarta Sans
    fontSize: 0.75rem
    fontWeight: 500
    lineHeight: 1.4
rounded:
  sm: 12px
  md: 20px
  lg: 28px
  pill: 999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
border:
  width-default: 2px
  width-emphasis: 3px
  color: "{colors.ink}"
elevation:
  offset-sm: "3px 3px 0px {colors.ink}"
  offset-md: "5px 5px 0px {colors.ink}"
  soft-clay: "0px 8px 20px rgba(18, 57, 36, 0.12)"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    border: "{border.width-default} solid {colors.ink}"
    shadow: "{elevation.offset-sm}"
    rounded: "{rounded.pill}"
    padding: 14px 24px
  button-primary-pressed:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    border: "{border.width-default} solid {colors.ink}"
    shadow: none
    transform: translate(3px, 3px)
    rounded: "{rounded.pill}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.secondary}"
    border: "{border.width-default} solid {colors.ink}"
    shadow: "{elevation.offset-sm}"
    rounded: "{rounded.pill}"
    padding: 14px 24px
  card-flat:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-neutral}"
    border: "{border.width-default} solid {colors.ink}"
    shadow: "{elevation.offset-sm}"
    rounded: "{rounded.md}"
    padding: 16px
  card-hero-clay:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.on-primary}"
    border: none
    shadow: "{elevation.soft-clay}"
    rounded: "{rounded.lg}"
    padding: 20px
  badge-pill:
    backgroundColor: "{colors.amber}"
    textColor: "{colors.ink}"
    border: "{border.width-default} solid {colors.ink}"
    shadow: none
    rounded: "{rounded.pill}"
    padding: 4px 12px
  input-field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-neutral}"
    border: "{border.width-default} solid {colors.ink}"
    shadow: none
    rounded: "{rounded.sm}"
    padding: 12px 16px
  mascot-frame:
    backgroundColor: "{colors.neutral}"
    border: none
    shadow: "{elevation.soft-clay}"
    rounded: "{rounded.pill}"
---

## Overview

TaniSync Neoclay adalah sistem desain hybrid: **framing UI pakai bahasa neobrutalism** (border tebal warna ink/dark-green, shadow offset solid — bukan blur — nempel di kanan-bawah tiap elemen, warna flat saturated), sementara **elemen hero yang berhubungan langsung sama mascot** (streak card, panel avatar mascot, ilustrasi utama) pakai sentuhan claymorphism (rounded besar, soft shadow lembut, tanpa border).

Kombinasi ini disengaja: neobrutalism kasih kesan "berani dan intentional" yang jarang dipake app kompetitor, sementara clay-touch di elemen mascot mempertahankan kesan "huggable/playful" yang cocok sama karakter seedling TaniSync. Hasilnya gak jatuh ke generic soft-UI ("AI slop") karena border+offset-shadow butuh keputusan desain yang jelas di tiap elemen, bukan treatment seragam ke semuanya.

## Colors

- **Primary** (`#3FA86B`): tombol utama, ikon aktif, elemen interaktif.
- **Secondary** (`#1F5C3D`): background panel gelap (streak card, header), teks judul di atas neutral.
- **Ink** (`#123924`): warna border & shadow neobrutalist di SEMUA komponen framed — ini yang jadi signature garis tebal khas sistem ini.
- **Amber** (`#FFB627`): elemen gamifikasi (badge, reward, streak accent).
- **Coral** (`#FF6B5C`): status urgent/butuh perhatian, notifikasi.
- **Teal** (`#2E9E8C`): tag komunitas/sosial.
- **Neutral** (`#FBF8F0`): background halaman.
- **Surface** (`#FFFFFF`): background card-flat & input.

## Typography

Plus Jakarta Sans untuk semua teks — ExtraBold buat headline (H1), Bold buat section title (H2), Regular/Medium buat body & caption. Hierarki dibangun dari ukuran & weight, bukan ganti font — konsisten dari onboarding sampai settings.

## Layout

Padding halaman 20px, gap antar section 24-32px (spacing.lg/xl). Grid card 2 kolom buat listing (tanaman, plant-type grid), gap 12px antar card.

## Elevation & Depth

Dua jenis "kedalaman" yang sengaja dibedain fungsinya:
- **Offset shadow solid** (`elevation.offset-sm/md`) — dipakai di SEMUA elemen ber-border (button, card-flat, input): shadow keras tanpa blur, nempel di sisi kanan-bawah, warna sama persis dengan border (ink). Ini yang bikin kesan neobrutalist "nempel/tactile".
- **Soft clay shadow** (`elevation.soft-clay`) — HANYA dipakai di elemen hero terkait mascot (card-hero-clay, mascot-frame): blur lembut, tanpa border, kesan mengambang/empuk.

Jangan campur dua jenis shadow ini di komponen yang sama — salah satu elemen harus jelas masuk kategori "framed neobrutalist" atau "soft hero clay", tidak keduanya.

## Shapes

- `rounded.sm` (12px): input field, elemen kecil.
- `rounded.md` (20px): card-flat, foto tanaman.
- `rounded.lg` (28px): card-hero-clay, panel mascot.
- `rounded.pill` (999px): semua tombol dan badge.

Border 2px selalu pakai warna `ink`, tidak pernah warna lain — ini konsisten di semua komponen framed supaya sistemnya terasa satu kesatuan, bukan campur-campur ketebalan/warna border.

## Components

- **button-primary**: tombol aksi utama (satu per halaman/section), border + offset shadow solid. State pressed: shadow hilang, elemen bergeser 3px ke arah shadow (efek "ditekan").
- **button-secondary**: tombol aksi kedua, treatment sama tapi background putih.
- **card-flat**: permukaan default untuk konten berkelompok (list tanaman, item notifikasi, settings row) — pakai border + offset shadow.
- **card-hero-clay**: khusus elemen hero yang nempel ke mascot/gamifikasi (streak card di dashboard) — soft shadow, tanpa border, rounded besar.
- **badge-pill**: label kecil (status, streak count) — tetap pakai border tipis biar konsisten sama sistem framed, bukan floating tanpa outline.
- **input-field**: border ink, tanpa shadow (state focus baru dapet border warna primary, lihat catatan di bawah).
- **mascot-frame**: bingkai lingkaran/pill di sekitar ilustrasi mascot (avatar chatbot, badge welcome) — soft clay shadow, tanpa border, biar mascot "melayang lembut" berbeda dari elemen UI di sekitarnya.

## States (tambahan di luar template dasar)

- **input-field focus**: border berubah warna jadi `{colors.primary}`, shadow tetap none.
- **input-field error**: border berubah warna jadi `{colors.coral}`, teks bantuan di bawah field pakai warna coral.
- **button disabled**: opacity 40%, shadow dihilangkan (rata dengan background, kesan "non-aktif/tenggelam").

## Do's and Don'ts

- **Do**: pakai token reference (`{colors.ink}`, `{elevation.offset-sm}`) biar satu sumber kebenaran — border dan shadow HARUS selalu pasangan warna yang sama.
- **Do**: pertahanin batas jelas antara elemen "framed" (neobrutalist) dan elemen "hero clay" (mascot) — jangan digabung di komponen yang sama.
- **Don't**: tambah warna border baru di luar `ink`. Semua border di seluruh app pakai satu warna itu saja.
- **Don't**: pakai blur shadow di komponen ber-border (card-flat, button) — itu ngerusak signature offset-shadow neobrutalist-nya.
- **Don't**: bikin SEMUA elemen jadi clay (rounded + soft shadow merata) — itu yang bikin hasilnya kerasa generic/"AI slop". Clay-touch harus eksklusif buat elemen yang emang terhubung langsung ke karakter mascot.
