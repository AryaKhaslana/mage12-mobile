import React from 'react';
import { StyleSheet, Text, View, StyleProp, ViewStyle } from 'react-native';
import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';

export interface PlantIllustrationProps {
  jenisTanaman?: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
  showBadge?: boolean;
}

interface PlantTheme {
  name: string;
  category: string;
  emoji: string;
  bgColor: string;
  accentColor: string;
  textColor: string;
  renderSvg: (size: number) => React.ReactNode;
}

const PLANT_THEMES: Record<string, PlantTheme> = {
  // 1. PADI (Rice / Paddy)
  padi: {
    name: 'Padi',
    category: 'Serealia',
    emoji: '🌾',
    bgColor: '#FEF9C3', // Warm golden yellow
    accentColor: '#D97706',
    textColor: '#854D0E',
    renderSvg: (s) => (
      <Svg width={s} height={s} viewBox="0 0 100 100">
        {/* Soft background aura */}
        <Circle cx="50" cy="50" r="38" fill="#FDE68A" opacity={0.4} />
        {/* Daun padi melengkung */}
        <Path d="M40 85 C35 60 20 45 10 40 C22 46 36 62 42 85 Z" fill="#16A34A" />
        <Path d="M45 85 C55 65 75 55 88 50 C75 58 58 70 47 85 Z" fill="#22C55E" />
        {/* Batang padi utama */}
        <Path d="M42 85 Q45 50 68 25" stroke="#15803D" strokeWidth="3" strokeLinecap="round" fill="none" />
        {/* Bulir padi emas di tangkai */}
        <Ellipse cx="48" cy="54" rx="4" ry="7" transform="rotate(-30 48 54)" fill="#F59E0B" stroke="#D97706" strokeWidth="1" />
        <Ellipse cx="53" cy="46" rx="4" ry="7" transform="rotate(35 53 46)" fill="#FBBF24" stroke="#D97706" strokeWidth="1" />
        <Ellipse cx="56" cy="38" rx="3.5" ry="6.5" transform="rotate(-35 56 38)" fill="#F59E0B" stroke="#D97706" strokeWidth="1" />
        <Ellipse cx="62" cy="32" rx="3.5" ry="6.5" transform="rotate(40 62 32)" fill="#FBBF24" stroke="#D97706" strokeWidth="1" />
        <Ellipse cx="66" cy="25" rx="3" ry="6" transform="rotate(-25 66 25)" fill="#F59E0B" stroke="#D97706" strokeWidth="1" />
        <Ellipse cx="72" cy="22" rx="3" ry="5.5" transform="rotate(45 72 22)" fill="#FBBF24" stroke="#D97706" strokeWidth="1" />
        <Ellipse cx="76" cy="21" rx="2.5" ry="5" transform="rotate(65 76 21)" fill="#FCD34D" stroke="#D97706" strokeWidth="1" />
      </Svg>
    ),
  },

  // 2. JAGUNG (Corn)
  jagung: {
    name: 'Jagung',
    category: 'Pangan Pokok',
    emoji: '🌽',
    bgColor: '#FEF08A', // Corn yellow
    accentColor: '#CA8A04',
    textColor: '#854D0E',
    renderSvg: (s) => (
      <Svg width={s} height={s} viewBox="0 0 100 100">
        <Circle cx="50" cy="50" r="38" fill="#FDE047" opacity={0.35} />
        {/* Rambut jagung atas */}
        <Path d="M48 20 Q50 14 54 12 M52 20 Q55 13 60 14 M46 21 Q44 15 42 13" stroke="#B45309" strokeWidth="2" strokeLinecap="round" />
        {/* Tongkol Jagung Utama */}
        <Path d="M40 70 C36 50 40 28 50 20 C60 28 64 50 60 70 C58 76 42 76 40 70 Z" fill="#FBBF24" stroke="#D97706" strokeWidth="1.5" />
        {/* Barisan Biji Jagung */}
        <G fill="#F59E0B">
          <Circle cx="46" cy="32" r="2.8" />
          <Circle cx="54" cy="32" r="2.8" />
          <Circle cx="44" cy="40" r="3.2" />
          <Circle cx="50" cy="40" r="3.2" />
          <Circle cx="56" cy="40" r="3.2" />
          <Circle cx="43" cy="48" r="3.2" />
          <Circle cx="50" cy="48" r="3.2" />
          <Circle cx="57" cy="48" r="3.2" />
          <Circle cx="44" cy="56" r="3.2" />
          <Circle cx="50" cy="56" r="3.2" />
          <Circle cx="56" cy="56" r="3.2" />
          <Circle cx="46" cy="64" r="3" />
          <Circle cx="53" cy="64" r="3" />
        </G>
        {/* Kelobot Daun Kiri & Kanan */}
        <Path d="M38 74 C32 60 25 45 28 32 C35 48 38 65 44 76 Z" fill="#22C55E" stroke="#15803D" strokeWidth="1.5" />
        <Path d="M62 74 C68 60 75 45 72 32 C65 48 62 65 56 76 Z" fill="#16A34A" stroke="#15803D" strokeWidth="1.5" />
        <Path d="M42 75 C48 78 52 78 58 75 C55 83 45 83 42 75 Z" fill="#15803D" />
      </Svg>
    ),
  },

  // 3. SINGKONG (Cassava)
  singkong: {
    name: 'Singkong',
    category: 'Umbi Akar',
    emoji: '🪵',
    bgColor: '#FEF3C7',
    accentColor: '#92400E',
    textColor: '#78350F',
    renderSvg: (s) => (
      <Svg width={s} height={s} viewBox="0 0 100 100">
        <Circle cx="50" cy="50" r="38" fill="#FDE68A" opacity={0.35} />
        {/* Daun menjari singkong di atas */}
        <Path d="M50 35 L50 15 M50 35 L38 20 M50 35 L62 20 M50 35 L30 30 M50 35 L70 30" stroke="#16A34A" strokeWidth="3" strokeLinecap="round" />
        {/* Umbi singkong utama (cokelat tanah) */}
        <Path d="M35 78 C28 65 40 45 60 38 C68 50 62 70 42 82 C38 83 36 81 35 78 Z" fill="#78350F" stroke="#451A03" strokeWidth="1.5" />
        {/* Garis tekstur kulit */}
        <Path d="M42 55 Q46 58 52 53 M38 68 Q44 71 50 65" stroke="#92400E" strokeWidth="1.5" strokeLinecap="round" />
        {/* Potongan umbi putih singkong di samping */}
        <Ellipse cx="65" cy="70" rx="14" ry="10" transform="rotate(-25 65 70)" fill="#FEF3C7" stroke="#78350F" strokeWidth="2.5" />
        <Circle cx="65" cy="70" r="3" fill="#D97706" opacity={0.6} />
      </Svg>
    ),
  },

  // 4. UBI JALAR (Sweet Potato)
  'ubi jalar': {
    name: 'Ubi Jalar',
    category: 'Umbi Manis',
    emoji: '🍠',
    bgColor: '#F3E8FF',
    accentColor: '#7E22CE',
    textColor: '#581C87',
    renderSvg: (s) => (
      <Svg width={s} height={s} viewBox="0 0 100 100">
        <Circle cx="50" cy="50" r="38" fill="#E9D5FF" opacity={0.4} />
        {/* Umbi Ubi Ungu Gendut */}
        <Path d="M22 68 C16 55 24 35 48 30 C72 25 84 40 80 58 C76 72 58 82 38 78 C28 76 25 72 22 68 Z" fill="#8B5CF6" stroke="#6D28D9" strokeWidth="2" />
        {/* Gradasi/aksen warna ungu tua & serat */}
        <Path d="M32 64 C30 52 38 38 56 34" stroke="#6D28D9" strokeWidth="2" strokeLinecap="round" fill="none" />
        <Path d="M46 72 C58 70 70 60 72 50" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" fill="none" />
        {/* Irisan potongan ubi oranye manis di samping */}
        <Ellipse cx="70" cy="35" rx="9" ry="7" transform="rotate(30 70 35)" fill="#F97316" stroke="#9333EA" strokeWidth="1.5" />
      </Svg>
    ),
  },

  // 5. KEDELAI (Soybean)
  kedelai: {
    name: 'Kedelai',
    category: 'Legum',
    emoji: '🫛',
    bgColor: '#ECFCCB',
    accentColor: '#65A30D',
    textColor: '#3F6212',
    renderSvg: (s) => (
      <Svg width={s} height={s} viewBox="0 0 100 100">
        <Circle cx="50" cy="50" r="38" fill="#D9F99D" opacity={0.4} />
        {/* Tangkai daun kedelai */}
        <Path d="M25 35 Q40 38 52 48" stroke="#4D7C0F" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <Path d="M25 35 Q30 22 42 26 Q35 38 25 35 Z" fill="#65A30D" />
        {/* Kulit polong kedelai/edamame berlekuk 3 biji */}
        <Path d="M28 62 C34 48 46 45 58 52 C70 58 80 50 82 45 C80 62 65 78 45 76 C35 75 28 70 28 62 Z" fill="#84CC16" stroke="#4D7C0F" strokeWidth="2" />
        {/* Tonjolan 3 Biji di dalam polong */}
        <Circle cx="40" cy="64" r="6" fill="#A3E635" stroke="#4D7C0F" strokeWidth="1" />
        <Circle cx="54" cy="62" r="6.5" fill="#BEF264" stroke="#4D7C0F" strokeWidth="1" />
        <Circle cx="68" cy="56" r="5.5" fill="#A3E635" stroke="#4D7C0F" strokeWidth="1" />
      </Svg>
    ),
  },

  // 6. KACANG TANAH (Peanut)
  'kacang tanah': {
    name: 'Kacang Tanah',
    category: 'Legum',
    emoji: '🥜',
    bgColor: '#FFEDD5',
    accentColor: '#C2410C',
    textColor: '#7C2D12',
    renderSvg: (s) => (
      <Svg width={s} height={s} viewBox="0 0 100 100">
        <Circle cx="50" cy="50" r="38" fill="#FED7AA" opacity={0.4} />
        {/* Kulit polong kacang tanah berpinggang dua */}
        <Path d="M38 28 C48 24 58 32 55 44 C53 48 53 52 56 56 C62 65 55 80 42 80 C28 80 25 65 34 54 C38 49 37 46 32 40 C28 32 32 28 38 28 Z" fill="#F59E0B" stroke="#B45309" strokeWidth="2" />
        {/* Tekstur jaring khas kulit kacang */}
        <Path d="M36 34 Q42 36 48 33 M34 44 Q44 45 48 41 M35 60 Q45 61 52 57 M34 70 Q43 72 48 68" stroke="#B45309" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        <Path d="M42 30 V76" stroke="#D97706" strokeWidth="1.2" strokeDasharray="3 3" fill="none" />
        {/* Butir biji kacang terbuka di samping */}
        <Ellipse cx="70" cy="55" rx="10" ry="14" transform="rotate(20 70 55)" fill="#EA580C" stroke="#9A3412" strokeWidth="1.5" />
        <Path d="M68 44 Q72 55 70 66" stroke="#FED7AA" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity={0.7} />
      </Svg>
    ),
  },

  // 7. TOMAT (Tomato)
  tomat: {
    name: 'Tomat',
    category: 'Hortikultura',
    emoji: '🍅',
    bgColor: '#FEE2E2',
    accentColor: '#DC2626',
    textColor: '#991B1B',
    renderSvg: (s) => (
      <Svg width={s} height={s} viewBox="0 0 100 100">
        <Circle cx="50" cy="50" r="38" fill="#FECACA" opacity={0.4} />
        {/* Buah Tomat Bulat Montok */}
        <Circle cx="50" cy="56" r="28" fill="#EF4444" stroke="#B91C1C" strokeWidth="2" />
        {/* Highlight kilau mengkilap */}
        <Path d="M36 44 C34 50 36 60 42 66" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" opacity={0.6} fill="none" />
        {/* Tangkai hijau melengkung */}
        <Path d="M50 32 Q52 20 60 18" stroke="#15803D" strokeWidth="3.5" strokeLinecap="round" fill="none" />
        {/* Daun kelopak bintang di kepala tomat */}
        <Path d="M50 32 L40 28 L46 34 L36 38 L47 38 L48 46 L52 38 L62 40 L54 34 L62 28 Z" fill="#22C55E" stroke="#15803D" strokeWidth="1" />
      </Svg>
    ),
  },

  // 8. CABAI MERAH (Red Chili)
  'cabai merah': {
    name: 'Cabai Merah',
    category: 'Rempah Pedas',
    emoji: '🌶️',
    bgColor: '#FEE2E2',
    accentColor: '#DC2626',
    textColor: '#991B1B',
    renderSvg: (s) => (
      <Svg width={s} height={s} viewBox="0 0 100 100">
        <Circle cx="50" cy="50" r="38" fill="#FECACA" opacity={0.4} />
        {/* Badan cabai merah panjang melengkung */}
        <Path d="M38 32 C48 30 65 40 68 56 C70 70 58 82 45 85 C52 76 60 62 55 50 C50 40 40 36 38 32 Z" fill="#DC2626" stroke="#991B1B" strokeWidth="2" />
        {/* Highlight kilau cabai */}
        <Path d="M48 38 Q60 46 62 60" stroke="#F87171" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        {/* Tangkai dan kelopak hijau */}
        <Path d="M38 32 Q32 24 35 15" stroke="#15803D" strokeWidth="3" strokeLinecap="round" fill="none" />
        <Path d="M34 32 C38 28 44 32 44 35 C40 37 36 36 34 32 Z" fill="#22C55E" stroke="#15803D" strokeWidth="1" />
      </Svg>
    ),
  },

  // 9. CABAI RAWIT (Bird's Eye Chili)
  'cabai rawit': {
    name: 'Cabai Rawit',
    category: 'Rempah Pedas',
    emoji: '🌶️',
    bgColor: '#FFEDD5',
    accentColor: '#EA580C',
    textColor: '#9A3412',
    renderSvg: (s) => (
      <Svg width={s} height={s} viewBox="0 0 100 100">
        <Circle cx="50" cy="50" r="38" fill="#FED7AA" opacity={0.4} />
        {/* Cabai rawit kecil tegak meruncing pedas */}
        <Path d="M42 42 C38 52 42 72 55 82 C55 68 62 55 58 42 C54 36 46 36 42 42 Z" fill="#F97316" stroke="#C2410C" strokeWidth="2" />
        {/* Semburat merah pedas di ujung */}
        <Path d="M48 68 C50 74 53 78 55 82 C54 78 53 72 52 68 Z" fill="#DC2626" />
        {/* Tangkai hijau tegak kokoh */}
        <Path d="M50 38 Q48 24 42 20" stroke="#15803D" strokeWidth="3.5" strokeLinecap="round" fill="none" />
        <Path d="M40 40 C46 36 54 36 60 40 C55 43 45 43 40 40 Z" fill="#22C55E" stroke="#15803D" strokeWidth="1" />
      </Svg>
    ),
  },

  // 10. BAWANG MERAH (Shallot)
  'bawang merah': {
    name: 'Bawang Merah',
    category: 'Bumbu Dapur',
    emoji: '🧅',
    bgColor: '#FCE7F3',
    accentColor: '#C026D3',
    textColor: '#86198F',
    renderSvg: (s) => (
      <Svg width={s} height={s} viewBox="0 0 100 100">
        <Circle cx="50" cy="50" r="38" fill="#FBCFE8" opacity={0.4} />
        {/* Pucuk tunas hijau */}
        <Path d="M50 25 Q48 18 44 14 M50 25 Q53 17 58 15" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        {/* Badan Umbi Lapis Bawang Merah */}
        <Path d="M50 25 C34 38 28 60 38 72 C46 80 54 80 62 72 C72 60 66 38 50 25 Z" fill="#C026D3" stroke="#86198F" strokeWidth="2" />
        {/* Garis alur siung vertikal */}
        <Path d="M50 26 Q42 50 48 76" stroke="#E879F9" strokeWidth="2" strokeLinecap="round" fill="none" />
        <Path d="M50 26 Q58 50 52 76" stroke="#E879F9" strokeWidth="2" strokeLinecap="round" fill="none" />
        {/* Akar serabut di bawah */}
        <Path d="M46 78 Q44 85 40 88 M50 79 V89 M54 78 Q56 85 60 88" stroke="#D97706" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      </Svg>
    ),
  },

  // 11. BAWANG PUTIH (Garlic)
  'bawang putih': {
    name: 'Bawang Putih',
    category: 'Bumbu Dapur',
    emoji: '🧄',
    bgColor: '#F1F5F9',
    accentColor: '#475569',
    textColor: '#334155',
    renderSvg: (s) => (
      <Svg width={s} height={s} viewBox="0 0 100 100">
        <Circle cx="50" cy="50" r="38" fill="#E2E8F0" opacity={0.5} />
        {/* Tangkai kering di pucuk */}
        <Path d="M50 28 V16" stroke="#A16207" strokeWidth="3" strokeLinecap="round" />
        {/* Siung bawang putih kiri, tengah, kanan */}
        <Path d="M50 28 C30 38 24 64 36 74 C44 80 56 80 64 74 C76 64 70 38 50 28 Z" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="2" />
        <Path d="M50 28 C42 45 42 65 46 77" stroke="#CBD5E1" strokeWidth="2" fill="none" />
        <Path d="M50 28 C58 45 58 65 54 77" stroke="#CBD5E1" strokeWidth="2" fill="none" />
        {/* Akar serabut bawah */}
        <Path d="M46 78 Q44 84 42 86 M50 78 V87 M54 78 Q56 84 58 86" stroke="#CA8A04" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      </Svg>
    ),
  },

  // 12. KUBIS (Cabbage / Kol)
  kubis: {
    name: 'Kubis',
    category: 'Sayuran Daun',
    emoji: '🥬',
    bgColor: '#DCFCE7',
    accentColor: '#16A34A',
    textColor: '#14532D',
    renderSvg: (s) => (
      <Svg width={s} height={s} viewBox="0 0 100 100">
        <Circle cx="50" cy="50" r="38" fill="#BBF7D0" opacity={0.4} />
        {/* Daun luar pelindung kubis */}
        <Path d="M22 55 C18 35 38 22 50 22 C62 22 82 35 78 55 C74 76 64 82 50 82 C36 82 26 76 22 55 Z" fill="#4ADE80" stroke="#15803D" strokeWidth="2" />
        {/* Lipatan daun kubis bulat */}
        <Path d="M30 45 C35 30 55 30 65 42 C72 52 68 70 54 74" fill="#86EFAC" stroke="#16A34A" strokeWidth="1.8" />
        <Path d="M66 48 C62 38 45 40 38 54 C34 64 42 74 52 74" fill="#BBF7D0" stroke="#16A34A" strokeWidth="1.8" />
        {/* Tulang daun putih */}
        <Path d="M50 78 Q51 60 52 48 M45 62 Q38 58 35 55 M55 60 Q62 55 66 52" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" fill="none" opacity={0.8} />
      </Svg>
    ),
  },

  // 13. KANGKUNG (Water Spinach)
  kangkung: {
    name: 'Kangkung',
    category: 'Sayuran Hijau',
    emoji: '🥗',
    bgColor: '#D1FAE5',
    accentColor: '#059669',
    textColor: '#064E3B',
    renderSvg: (s) => (
      <Svg width={s} height={s} viewBox="0 0 100 100">
        <Circle cx="50" cy="50" r="38" fill="#A7F3D0" opacity={0.4} />
        {/* Rumpun batang berongga kangkung */}
        <Path d="M48 85 Q46 60 38 38" stroke="#10B981" strokeWidth="3.5" strokeLinecap="round" fill="none" />
        <Path d="M50 85 Q52 55 62 35" stroke="#059669" strokeWidth="3.5" strokeLinecap="round" fill="none" />
        <Path d="M52 85 Q54 65 50 48" stroke="#34D399" strokeWidth="3" strokeLinecap="round" fill="none" />
        {/* Daun lanset runcing memanjang */}
        <Path d="M38 38 C32 26 24 18 20 16 C28 24 38 30 42 38 Z" fill="#059669" stroke="#047857" strokeWidth="1.2" />
        <Path d="M62 35 C68 24 76 16 80 14 C72 22 64 28 58 36 Z" fill="#10B981" stroke="#047857" strokeWidth="1.2" />
        <Path d="M50 48 C46 34 44 24 45 18 C50 26 53 35 52 48 Z" fill="#34D399" stroke="#047857" strokeWidth="1.2" />
      </Svg>
    ),
  },

  // 14. BAYAM (Spinach)
  bayam: {
    name: 'Bayam',
    category: 'Sayuran Hijau',
    emoji: '🌿',
    bgColor: '#DCFCE7',
    accentColor: '#15803D',
    textColor: '#14532D',
    renderSvg: (s) => (
      <Svg width={s} height={s} viewBox="0 0 100 100">
        <Circle cx="50" cy="50" r="38" fill="#BBF7D0" opacity={0.4} />
        {/* Batang utama */}
        <Path d="M50 85 V52" stroke="#16A34A" strokeWidth="3.5" strokeLinecap="round" />
        <Path d="M50 68 Q40 60 34 50" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <Path d="M50 64 Q60 56 66 48" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        {/* Daun-daun bundar oval rimbun */}
        <Path d="M50 52 C38 42 38 24 50 18 C62 24 62 42 50 52 Z" fill="#22C55E" stroke="#15803D" strokeWidth="1.5" />
        <Path d="M34 50 C24 45 22 30 32 26 C42 30 40 44 34 50 Z" fill="#16A34A" stroke="#15803D" strokeWidth="1.5" />
        <Path d="M66 48 C76 43 78 28 68 24 C58 28 60 42 66 48 Z" fill="#16A34A" stroke="#15803D" strokeWidth="1.5" />
      </Svg>
    ),
  },

  // 15. TERONG (Eggplant)
  terong: {
    name: 'Terong',
    category: 'Hortikultura',
    emoji: '🍆',
    bgColor: '#F3E8FF',
    accentColor: '#7E22CE',
    textColor: '#581C87',
    renderSvg: (s) => (
      <Svg width={s} height={s} viewBox="0 0 100 100">
        <Circle cx="50" cy="50" r="38" fill="#E9D5FF" opacity={0.4} />
        {/* Buah terong lonjong membesar ke bawah */}
        <Path d="M42 34 C36 45 30 65 38 78 C46 88 64 88 70 76 C76 62 66 45 56 34 Z" fill="#6B21A8" stroke="#4C1D95" strokeWidth="2" />
        {/* Highlight kilau melengkung */}
        <Path d="M44 48 C40 58 40 70 48 78" stroke="#C084FC" strokeWidth="3" strokeLinecap="round" fill="none" opacity={0.7} />
        {/* Tangkai dan mahkota daun hijau kelopak */}
        <Path d="M50 34 Q52 18 58 16" stroke="#15803D" strokeWidth="3.5" strokeLinecap="round" fill="none" />
        <Path d="M38 36 C42 32 46 35 50 34 C54 35 58 32 62 36 C58 42 54 44 50 42 C46 44 42 42 38 36 Z" fill="#22C55E" stroke="#15803D" strokeWidth="1.5" />
      </Svg>
    ),
  },

  // 16. TIMUN (Cucumber)
  timun: {
    name: 'Timun',
    category: 'Hortikultura',
    emoji: '🥒',
    bgColor: '#E0F2FE',
    accentColor: '#0284C7',
    textColor: '#0369A1',
    renderSvg: (s) => (
      <Svg width={s} height={s} viewBox="0 0 100 100">
        <Circle cx="50" cy="50" r="38" fill="#BAE6FD" opacity={0.4} />
        {/* Buah timun silindris lonjong sedikit melengkung */}
        <Path d="M26 68 C20 58 32 38 52 30 C72 22 84 32 80 44 C74 62 58 76 40 80 C32 82 28 76 26 68 Z" fill="#059669" stroke="#047857" strokeWidth="2" />
        {/* Garis tekstur bintik segar */}
        <Path d="M36 65 Q52 50 70 38" stroke="#34D399" strokeWidth="2" strokeDasharray="4 6" fill="none" />
        <Circle cx="44" cy="56" r="1.5" fill="#A7F3D0" />
        <Circle cx="56" cy="46" r="1.5" fill="#A7F3D0" />
        <Circle cx="66" cy="38" r="1.5" fill="#A7F3D0" />
        {/* Tangkai kecil di ujung */}
        <Path d="M24 72 Q18 76 16 80" stroke="#047857" strokeWidth="2.5" strokeLinecap="round" />
      </Svg>
    ),
  },

  // 17. LABU SIAM (Chayote)
  'labu siam': {
    name: 'Labu Siam',
    category: 'Hortikultura',
    emoji: '🍈',
    bgColor: '#ECFCCB',
    accentColor: '#65A30D',
    textColor: '#3F6212',
    renderSvg: (s) => (
      <Svg width={s} height={s} viewBox="0 0 100 100">
        <Circle cx="50" cy="50" r="38" fill="#D9F99D" opacity={0.4} />
        {/* Buah labu siam berbentuk pir dengan lekukan */}
        <Path d="M48 26 C40 32 32 50 30 65 C28 78 40 86 50 86 C60 86 72 78 70 65 C68 50 60 32 52 26 Z" fill="#84CC16" stroke="#4D7C0F" strokeWidth="2" />
        {/* Alur lekukan vertikal khas labu siam */}
        <Path d="M44 32 C38 48 38 68 44 82" stroke="#4D7C0F" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity={0.6} />
        <Path d="M56 32 C62 48 62 68 56 82" stroke="#4D7C0F" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity={0.6} />
        {/* Tangkai di atas */}
        <Path d="M50 26 V18" stroke="#3F6212" strokeWidth="3" strokeLinecap="round" />
      </Svg>
    ),
  },

  // 18. WORTEL (Carrot)
  wortel: {
    name: 'Wortel',
    category: 'Sayuran Umbi',
    emoji: '🥕',
    bgColor: '#FFEDD5',
    accentColor: '#EA580C',
    textColor: '#9A3412',
    renderSvg: (s) => (
      <Svg width={s} height={s} viewBox="0 0 100 100">
        <Circle cx="50" cy="50" r="38" fill="#FED7AA" opacity={0.4} />
        {/* Daun jambul hijau rimbun di pucuk */}
        <Path d="M50 32 L40 16 M50 32 L50 12 M50 32 L60 16 M44 24 L36 18 M56 24 L64 18" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" />
        {/* Umbi wortel kerucut tebal di atas, meruncing ke bawah */}
        <Path d="M38 34 C36 32 64 32 62 34 C60 52 54 75 50 86 C46 75 40 52 38 34 Z" fill="#F97316" stroke="#C2410C" strokeWidth="2" />
        {/* Garis kerut horizontal tekstur wortel */}
        <Path d="M42 42 H54 M44 52 H52 M46 62 H50 M47 72 H49" stroke="#C2410C" strokeWidth="1.8" strokeLinecap="round" />
      </Svg>
    ),
  },

  // 19. KENTANG (Potato)
  kentang: {
    name: 'Kentang',
    category: 'Umbi Batang',
    emoji: '🥔',
    bgColor: '#FEF9C3',
    accentColor: '#B45309',
    textColor: '#78350F',
    renderSvg: (s) => (
      <Svg width={s} height={s} viewBox="0 0 100 100">
        <Circle cx="50" cy="50" r="38" fill="#FDE68A" opacity={0.4} />
        {/* Umbi kentang oval tak beraturan */}
        <Path d="M26 50 C24 35 42 28 62 32 C78 36 82 52 78 68 C74 80 52 82 36 76 C26 72 28 60 26 50 Z" fill="#D97706" stroke="#92400E" strokeWidth="2" />
        {/* Titik mata tunas / lekukan alami kentang */}
        <Path d="M38 42 Q42 44 40 46 M58 40 Q62 42 60 44 M48 60 Q52 62 50 64 M68 58 Q72 60 70 62 M34 60 Q38 62 36 64" stroke="#78350F" strokeWidth="2" strokeLinecap="round" fill="none" />
      </Svg>
    ),
  },

  // 20. PISANG (Banana)
  pisang: {
    name: 'Pisang',
    category: 'Buah Tropis',
    emoji: '🍌',
    bgColor: '#FEF08A',
    accentColor: '#CA8A04',
    textColor: '#854D0E',
    renderSvg: (s) => (
      <Svg width={s} height={s} viewBox="0 0 100 100">
        <Circle cx="50" cy="50" r="38" fill="#FDE047" opacity={0.35} />
        {/* Sisir pisang melengkung kuning */}
        <Path d="M24 70 C28 45 48 30 74 34 C64 54 44 68 24 70 Z" fill="#FACC15" stroke="#CA8A04" strokeWidth="2" />
        {/* Garis punggung lengkungan */}
        <Path d="M28 66 C40 50 56 38 72 36" stroke="#EAB308" strokeWidth="2" strokeLinecap="round" fill="none" />
        {/* Ujung tangkai atas hijau/cokelat & ujung bawah hitam */}
        <Path d="M74 34 L82 32 L80 38 Z" fill="#15803D" stroke="#166534" strokeWidth="1" />
        <Circle cx="24" cy="70" r="2.5" fill="#451A03" />
      </Svg>
    ),
  },
};

// Default fallback untuk jenis tanaman tak dikenal
const DEFAULT_THEME: PlantTheme = {
  name: 'Tanaman',
  category: 'Kebun Tani',
  emoji: '🌱',
  bgColor: '#E8F5E9',
  accentColor: '#3FA86B',
  textColor: '#123924',
  renderSvg: (s) => (
    <Svg width={s} height={s} viewBox="0 0 100 100">
      <Circle cx="50" cy="50" r="38" fill="#C8E6C9" opacity={0.4} />
      {/* Pot tanaman */}
      <Path d="M34 62 L38 82 H62 L66 62 Z" fill="#B45309" stroke="#78350F" strokeWidth="2" />
      <Rect x="30" y="58" width="40" height="6" rx="2" fill="#D97706" stroke="#78350F" strokeWidth="1.5" />
      {/* Tunas tanaman hijau dengan dua daun */}
      <Path d="M50 58 V36" stroke="#15803D" strokeWidth="3" strokeLinecap="round" />
      <Path d="M50 44 C40 38 38 28 46 26 C52 30 50 40 50 44 Z" fill="#22C55E" stroke="#15803D" strokeWidth="1.2" />
      <Path d="M50 40 C60 34 62 24 54 22 C48 26 50 36 50 40 Z" fill="#16A34A" stroke="#15803D" strokeWidth="1.2" />
    </Svg>
  ),
};

export function getPlantTheme(jenisTanaman?: string): PlantTheme {
  if (!jenisTanaman) return DEFAULT_THEME;
  const key = jenisTanaman.trim().toLowerCase();
  return PLANT_THEMES[key] || DEFAULT_THEME;
}

export default function PlantIllustration({
  jenisTanaman,
  size = 84,
  style,
  showBadge = false,
}: PlantIllustrationProps) {
  const theme = getPlantTheme(jenisTanaman);

  return (
    <View style={[styles.container, { backgroundColor: theme.bgColor }, style]}>
      <View style={styles.svgWrapper}>
        {theme.renderSvg(size)}
      </View>
      {showBadge && (
        <View style={styles.badge}>
          <Text style={[styles.badgeText, { color: theme.textColor }]}>
            {theme.emoji} {theme.name}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  svgWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    bottom: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(18, 57, 36, 0.12)',
  },
  badgeText: {
    fontSize: 10,
    fontFamily: 'Nunito_700Bold',
    letterSpacing: 0.2,
  },
});

