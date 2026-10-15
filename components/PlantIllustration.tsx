import React, { useMemo } from 'react';
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
    bgColor: '#FEF9C3',
    accentColor: '#D97706',
    textColor: '#854D0E',
    renderSvg: (s) => (
      <Svg width={s} height={s} viewBox="0 0 100 100">
        <Circle cx="50" cy="50" r="38" fill="#FDE68A" opacity={0.4} />
        <Path d="M40 85 C35 60 20 45 10 40 C22 46 36 62 42 85 Z" fill="#16A34A" />
        <Path d="M45 85 C55 65 75 55 88 50 C75 58 58 70 47 85 Z" fill="#22C55E" />
        <Path d="M42 85 Q45 50 68 25" stroke="#15803D" strokeWidth="3" strokeLinecap="round" fill="none" />
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
    bgColor: '#FEF08A',
    accentColor: '#CA8A04',
    textColor: '#854D0E',
    renderSvg: (s) => (
      <Svg width={s} height={s} viewBox="0 0 100 100">
        <Circle cx="50" cy="50" r="38" fill="#FDE047" opacity={0.35} />
        <Path d="M48 20 Q50 14 54 12 M52 20 Q55 13 60 14 M46 21 Q44 15 42 13" stroke="#B45309" strokeWidth="2" strokeLinecap="round" />
        <Path d="M40 70 C36 50 40 28 50 20 C60 28 64 50 60 70 C58 76 42 76 40 70 Z" fill="#FBBF24" stroke="#D97706" strokeWidth="1.5" />
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
    bgColor: '#FEF3C7',
    accentColor: '#92400E',
    textColor: '#78350F',
    renderSvg: (s) => (
      <Svg width={s} height={s} viewBox="0 0 100 100">
        <Circle cx="50" cy="50" r="38" fill="#FDE68A" opacity={0.35} />
        <Path d="M50 35 L50 15 M50 35 L38 20 M50 35 L62 20 M50 35 L30 30 M50 35 L70 30" stroke="#16A34A" strokeWidth="3" strokeLinecap="round" />
        <Path d="M35 78 C28 65 40 45 60 38 C68 50 62 70 42 82 C38 83 36 81 35 78 Z" fill="#78350F" stroke="#451A03" strokeWidth="1.5" />
        <Path d="M42 55 Q46 58 52 53 M38 68 Q44 71 50 65" stroke="#92400E" strokeWidth="1.5" strokeLinecap="round" />
        <Ellipse cx="65" cy="70" rx="14" ry="10" transform="rotate(-25 65 70)" fill="#FEF3C7" stroke="#78350F" strokeWidth="2.5" />
        <Circle cx="65" cy="70" r="3" fill="#D97706" opacity={0.6} />
      </Svg>
    ),
  },

  // 4. UBI JALAR (Sweet Potato)
  'ubi jalar': {
    name: 'Ubi Jalar',
    category: 'Umbi Manis',
    bgColor: '#F3E8FF',
    accentColor: '#7E22CE',
    textColor: '#581C87',
    renderSvg: (s) => (
      <Svg width={s} height={s} viewBox="0 0 100 100">
        <Circle cx="50" cy="50" r="38" fill="#E9D5FF" opacity={0.4} />
        <Path d="M22 68 C16 55 24 35 48 30 C72 25 84 40 80 58 C76 72 58 82 38 78 C28 76 25 72 22 68 Z" fill="#8B5CF6" stroke="#6D28D9" strokeWidth="2" />
        <Path d="M32 64 C30 52 38 38 56 34" stroke="#6D28D9" strokeWidth="2" strokeLinecap="round" fill="none" />
        <Path d="M46 72 C58 70 70 60 72 50" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" fill="none" />
        <Ellipse cx="70" cy="35" rx="9" ry="7" transform="rotate(30 70 35)" fill="#F97316" stroke="#9333EA" strokeWidth="1.5" />
      </Svg>
    ),
  },

  // 5. KEDELAI (Soybean)
  kedelai: {
    name: 'Kedelai',
    category: 'Legum',
    bgColor: '#ECFCCB',
    accentColor: '#65A30D',
    textColor: '#3F6212',
    renderSvg: (s) => (
      <Svg width={s} height={s} viewBox="0 0 100 100">
        <Circle cx="50" cy="50" r="38" fill="#D9F99D" opacity={0.4} />
        <Path d="M25 35 Q40 38 52 48" stroke="#4D7C0F" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <Path d="M25 35 Q30 22 42 26 Q35 38 25 35 Z" fill="#65A30D" />
        <Path d="M28 62 C34 48 46 45 58 52 C70 58 80 50 82 45 C80 62 65 78 45 76 C35 75 28 70 28 62 Z" fill="#84CC16" stroke="#4D7C0F" strokeWidth="2" />
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
    bgColor: '#FFEDD5',
    accentColor: '#C2410C',
    textColor: '#7C2D12',
    renderSvg: (s) => (
      <Svg width={s} height={s} viewBox="0 0 100 100">
        <Circle cx="50" cy="50" r="38" fill="#FED7AA" opacity={0.4} />
        <Path d="M38 28 C48 24 58 32 55 44 C53 48 53 52 56 56 C62 65 55 80 42 80 C28 80 25 65 34 54 C38 49 37 46 32 40 C28 32 32 28 38 28 Z" fill="#F59E0B" stroke="#B45309" strokeWidth="2" />
        <Path d="M36 34 Q42 36 48 33 M34 44 Q44 45 48 41 M35 60 Q45 61 52 57 M34 70 Q43 72 48 68" stroke="#B45309" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        <Path d="M42 30 V76" stroke="#D97706" strokeWidth="1.2" strokeDasharray="3 3" fill="none" />
        <Ellipse cx="70" cy="55" rx="10" ry="14" transform="rotate(20 70 55)" fill="#EA580C" stroke="#9A3412" strokeWidth="1.5" />
        <Path d="M68 44 Q72 55 70 66" stroke="#FED7AA" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity={0.7} />
      </Svg>
    ),
  },

  // 7. TOMAT (Tomato)
  tomat: {
    name: 'Tomat',
    category: 'Hortikultura',
    bgColor: '#FEE2E2',
    accentColor: '#DC2626',
    textColor: '#991B1B',
    renderSvg: (s) => (
      <Svg width={s} height={s} viewBox="0 0 100 100">
        <Circle cx="50" cy="50" r="38" fill="#FECACA" opacity={0.4} />
        <Circle cx="50" cy="56" r="28" fill="#EF4444" stroke="#B91C1C" strokeWidth="2" />
        <Path d="M36 44 C34 50 36 60 42 66" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" opacity={0.6} fill="none" />
        <Path d="M50 32 Q52 20 60 18" stroke="#15803D" strokeWidth="3.5" strokeLinecap="round" fill="none" />
        <Path d="M50 32 L40 28 L46 34 L36 38 L47 38 L48 46 L52 38 L62 40 L54 34 L62 28 Z" fill="#22C55E" stroke="#15803D" strokeWidth="1" />
      </Svg>
    ),
  },

  // 8. CABAI MERAH (Red Chili)
  'cabai merah': {
    name: 'Cabai Merah',
    category: 'Rempah Pedas',
    bgColor: '#FEE2E2',
    accentColor: '#DC2626',
    textColor: '#991B1B',
    renderSvg: (s) => (
      <Svg width={s} height={s} viewBox="0 0 100 100">
        <Circle cx="50" cy="50" r="38" fill="#FECACA" opacity={0.4} />
        <Path d="M38 32 C48 30 65 40 68 56 C70 70 58 82 45 85 C52 76 60 62 55 50 C50 40 40 36 38 32 Z" fill="#DC2626" stroke="#991B1B" strokeWidth="2" />
        <Path d="M48 38 Q60 46 62 60" stroke="#F87171" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <Path d="M38 32 Q32 24 35 15" stroke="#15803D" strokeWidth="3" strokeLinecap="round" fill="none" />
        <Path d="M34 32 C38 28 44 32 44 35 C40 37 36 36 34 32 Z" fill="#22C55E" stroke="#15803D" strokeWidth="1" />
      </Svg>
    ),
  },

  // 9. CABAI RAWIT (Bird's Eye Chili)
  'cabai rawit': {
    name: 'Cabai Rawit',
    category: 'Rempah Pedas',
    bgColor: '#FFEDD5',
    accentColor: '#EA580C',
    textColor: '#9A3412',
    renderSvg: (s) => (
      <Svg width={s} height={s} viewBox="0 0 100 100">
        <Circle cx="50" cy="50" r="38" fill="#FED7AA" opacity={0.4} />
        <Path d="M42 42 C38 52 42 72 55 82 C55 68 62 55 58 42 C54 36 46 36 42 42 Z" fill="#F97316" stroke="#C2410C" strokeWidth="2" />
        <Path d="M48 68 C50 74 53 78 55 82 C54 78 53 72 52 68 Z" fill="#DC2626" />
        <Path d="M50 38 Q48 24 42 20" stroke="#15803D" strokeWidth="3.5" strokeLinecap="round" fill="none" />
        <Path d="M40 40 C46 36 54 36 60 40 C55 43 45 43 40 40 Z" fill="#22C55E" stroke="#15803D" strokeWidth="1" />
      </Svg>
    ),
  },

  // 10. BAWANG MERAH (Shallot)
  'bawang merah': {
    name: 'Bawang Merah',
    category: 'Bumbu Dapur',
    bgColor: '#FCE7F3',
    accentColor: '#C026D3',
    textColor: '#86198F',
    renderSvg: (s) => (
      <Svg width={s} height={s} viewBox="0 0 100 100">
        <Circle cx="50" cy="50" r="38" fill="#FBCFE8" opacity={0.4} />
        <Path d="M50 25 Q48 18 44 14 M50 25 Q53 17 58 15" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <Path d="M50 25 C34 38 28 60 38 72 C46 80 54 80 62 72 C72 60 66 38 50 25 Z" fill="#C026D3" stroke="#86198F" strokeWidth="2" />
        <Path d="M50 26 Q42 50 48 76" stroke="#E879F9" strokeWidth="2" strokeLinecap="round" fill="none" />
        <Path d="M50 26 Q58 50 52 76" stroke="#E879F9" strokeWidth="2" strokeLinecap="round" fill="none" />
        <Path d="M46 78 Q44 85 40 88 M50 79 V89 M54 78 Q56 85 60 88" stroke="#D97706" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      </Svg>
    ),
  },

  // 11. BAWANG PUTIH (Garlic)
  'bawang putih': {
    name: 'Bawang Putih',
    category: 'Bumbu Dapur',
    bgColor: '#F1F5F9',
    accentColor: '#475569',
    textColor: '#334155',
    renderSvg: (s) => (
      <Svg width={s} height={s} viewBox="0 0 100 100">
        <Circle cx="50" cy="50" r="38" fill="#E2E8F0" opacity={0.5} />
        <Path d="M50 28 V16" stroke="#A16207" strokeWidth="3" strokeLinecap="round" />
        <Path d="M50 28 C30 38 24 64 36 74 C44 80 56 80 64 74 C76 64 70 38 50 28 Z" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="2" />
        <Path d="M50 28 C42 45 42 65 46 77" stroke="#CBD5E1" strokeWidth="2" fill="none" />
        <Path d="M50 28 C58 45 58 65 54 77" stroke="#CBD5E1" strokeWidth="2" fill="none" />
        <Path d="M46 78 Q44 84 42 86 M50 78 V87 M54 78 Q56 84 58 86" stroke="#CA8A04" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      </Svg>
    ),
  },

  // 12. KUBIS (Cabbage / Kol)
  kubis: {
    name: 'Kubis',
    category: 'Sayuran Daun',
    bgColor: '#DCFCE7',
    accentColor: '#16A34A',
    textColor: '#14532D',
    renderSvg: (s) => (
      <Svg width={s} height={s} viewBox="0 0 100 100">
        <Circle cx="50" cy="50" r="38" fill="#BBF7D0" opacity={0.4} />
        <Path d="M22 55 C18 35 38 22 50 22 C62 22 82 35 78 55 C74 76 64 82 50 82 C36 82 26 76 22 55 Z" fill="#4ADE80" stroke="#15803D" strokeWidth="2" />
        <Path d="M30 45 C35 30 55 30 65 42 C72 52 68 70 54 74" fill="#86EFAC" stroke="#16A34A" strokeWidth="1.8" />
        <Path d="M66 48 C62 38 45 40 38 54 C34 64 42 74 52 74" fill="#BBF7D0" stroke="#16A34A" strokeWidth="1.8" />
        <Path d="M50 78 Q51 60 52 48 M45 62 Q38 58 35 55 M55 60 Q62 55 66 52" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" fill="none" opacity={0.8} />
      </Svg>
    ),
  },

  // 13. KANGKUNG (Water Spinach)
  kangkung: {
    name: 'Kangkung',
    category: 'Sayuran Hijau',
    bgColor: '#D1FAE5',
    accentColor: '#059669',
    textColor: '#064E3B',
    renderSvg: (s) => (
      <Svg width={s} height={s} viewBox="0 0 100 100">
        <Circle cx="50" cy="50" r="38" fill="#A7F3D0" opacity={0.4} />
        <Path d="M48 85 Q46 60 38 38" stroke="#10B981" strokeWidth="3.5" strokeLinecap="round" fill="none" />
        <Path d="M50 85 Q52 55 62 35" stroke="#059669" strokeWidth="3.5" strokeLinecap="round" fill="none" />
        <Path d="M52 85 Q54 65 50 48" stroke="#34D399" strokeWidth="3" strokeLinecap="round" fill="none" />
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
    bgColor: '#DCFCE7',
    accentColor: '#15803D',
    textColor: '#14532D',
    renderSvg: (s) => (
      <Svg width={s} height={s} viewBox="0 0 100 100">
        <Circle cx="50" cy="50" r="38" fill="#BBF7D0" opacity={0.4} />
        <Path d="M50 85 V52" stroke="#16A34A" strokeWidth="3.5" strokeLinecap="round" />
        <Path d="M50 68 Q40 60 34 50" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <Path d="M50 64 Q60 56 66 48" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" fill="none" />
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
    bgColor: '#F3E8FF',
    accentColor: '#7E22CE',
    textColor: '#581C87',
    renderSvg: (s) => (
      <Svg width={s} height={s} viewBox="0 0 100 100">
        <Circle cx="50" cy="50" r="38" fill="#E9D5FF" opacity={0.4} />
        <Path d="M42 34 C36 45 30 65 38 78 C46 88 64 88 70 76 C76 62 66 45 56 34 Z" fill="#6B21A8" stroke="#4C1D95" strokeWidth="2" />
        <Path d="M44 48 C40 58 40 70 48 78" stroke="#C084FC" strokeWidth="3" strokeLinecap="round" fill="none" opacity={0.7} />
        <Path d="M50 34 Q52 18 58 16" stroke="#15803D" strokeWidth="3.5" strokeLinecap="round" fill="none" />
        <Path d="M38 36 C42 32 46 35 50 34 C54 35 58 32 62 36 C58 42 54 44 50 42 C46 44 42 42 38 36 Z" fill="#22C55E" stroke="#15803D" strokeWidth="1.5" />
      </Svg>
    ),
  },

  // 16. TIMUN (Cucumber)
  timun: {
    name: 'Timun',
    category: 'Hortikultura',
    bgColor: '#E0F2FE',
    accentColor: '#0284C7',
    textColor: '#0369A1',
    renderSvg: (s) => (
      <Svg width={s} height={s} viewBox="0 0 100 100">
        <Circle cx="50" cy="50" r="38" fill="#BAE6FD" opacity={0.4} />
        <Path d="M26 68 C20 58 32 38 52 30 C72 22 84 32 80 44 C74 62 58 76 40 80 C32 82 28 76 26 68 Z" fill="#059669" stroke="#047857" strokeWidth="2" />
        <Path d="M36 65 Q52 50 70 38" stroke="#34D399" strokeWidth="2" strokeDasharray="4 6" fill="none" />
        <Circle cx="44" cy="56" r="1.5" fill="#A7F3D0" />
        <Circle cx="56" cy="46" r="1.5" fill="#A7F3D0" />
        <Circle cx="66" cy="38" r="1.5" fill="#A7F3D0" />
        <Path d="M24 72 Q18 76 16 80" stroke="#047857" strokeWidth="2.5" strokeLinecap="round" />
      </Svg>
    ),
  },

  // 17. LABU SIAM (Chayote)
  'labu siam': {
    name: 'Labu Siam',
    category: 'Hortikultura',
    bgColor: '#ECFCCB',
    accentColor: '#65A30D',
    textColor: '#3F6212',
    renderSvg: (s) => (
      <Svg width={s} height={s} viewBox="0 0 100 100">
        <Circle cx="50" cy="50" r="38" fill="#D9F99D" opacity={0.4} />
        <Path d="M48 26 C40 32 32 50 30 65 C28 78 40 86 50 86 C60 86 72 78 70 65 C68 50 60 32 52 26 Z" fill="#84CC16" stroke="#4D7C0F" strokeWidth="2" />
        <Path d="M44 32 C38 48 38 68 44 82" stroke="#4D7C0F" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity={0.6} />
        <Path d="M56 32 C62 48 62 68 56 82" stroke="#4D7C0F" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity={0.6} />
        <Path d="M50 26 V18" stroke="#3F6212" strokeWidth="3" strokeLinecap="round" />
      </Svg>
    ),
  },

  // 18. WORTEL (Carrot)
  wortel: {
    name: 'Wortel',
    category: 'Sayuran Umbi',
    bgColor: '#FFEDD5',
    accentColor: '#EA580C',
    textColor: '#9A3412',
    renderSvg: (s) => (
      <Svg width={s} height={s} viewBox="0 0 100 100">
        <Circle cx="50" cy="50" r="38" fill="#FED7AA" opacity={0.4} />
        <Path d="M50 32 L40 16 M50 32 L50 12 M50 32 L60 16 M44 24 L36 18 M56 24 L64 18" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" />
        <Path d="M38 34 C36 32 64 32 62 34 C60 52 54 75 50 86 C46 75 40 52 38 34 Z" fill="#F97316" stroke="#C2410C" strokeWidth="2" />
        <Path d="M42 42 H54 M44 52 H52 M46 62 H50 M47 72 H49" stroke="#C2410C" strokeWidth="1.8" strokeLinecap="round" />
      </Svg>
    ),
  },

  // 19. KENTANG (Potato)
  kentang: {
    name: 'Kentang',
    category: 'Umbi Batang',
    bgColor: '#FEF9C3',
    accentColor: '#B45309',
    textColor: '#78350F',
    renderSvg: (s) => (
      <Svg width={s} height={s} viewBox="0 0 100 100">
        <Circle cx="50" cy="50" r="38" fill="#FDE68A" opacity={0.4} />
        <Path d="M26 50 C24 35 42 28 62 32 C78 36 82 52 78 68 C74 80 52 82 36 76 C26 72 28 60 26 50 Z" fill="#D97706" stroke="#92400E" strokeWidth="2" />
        <Path d="M38 42 Q42 44 40 46 M58 40 Q62 42 60 44 M48 60 Q52 62 50 64 M68 58 Q72 60 70 62 M34 60 Q38 62 36 64" stroke="#78350F" strokeWidth="2" strokeLinecap="round" fill="none" />
      </Svg>
    ),
  },

  // 20. PISANG (Banana)
  pisang: {
    name: 'Pisang',
    category: 'Buah Tropis',
    bgColor: '#FEF08A',
    accentColor: '#CA8A04',
    textColor: '#854D0E',
    renderSvg: (s) => (
      <Svg width={s} height={s} viewBox="0 0 100 100">
        <Circle cx="50" cy="50" r="38" fill="#FDE047" opacity={0.35} />
        <Path d="M24 70 C28 45 48 30 74 34 C64 54 44 68 24 70 Z" fill="#FACC15" stroke="#CA8A04" strokeWidth="2" />
        <Path d="M28 66 C40 50 56 38 72 36" stroke="#EAB308" strokeWidth="2" strokeLinecap="round" fill="none" />
        <Path d="M74 34 L82 32 L80 38 Z" fill="#15803D" stroke="#166534" strokeWidth="1" />
        <Circle cx="24" cy="70" r="2.5" fill="#451A03" />
      </Svg>
    ),
  },

  // 21. PAKCOY (Bok Choy)
  pakcoy: {
    name: 'Pakcoy',
    category: 'Sayuran Daun',
    bgColor: '#DCFCE7',
    accentColor: '#15803D',
    textColor: '#14532D',
    renderSvg: (s) => (
      <Svg width={s} height={s} viewBox="0 0 100 100">
        <Circle cx="50" cy="50" r="38" fill="#BBF7D0" opacity={0.4} />
        <Path d="M36 48 C20 38 22 22 34 20 C44 24 44 38 38 48 Z" fill="#15803D" stroke="#14532D" strokeWidth="1.2" />
        <Path d="M64 48 C80 38 78 22 66 20 C56 24 56 38 62 48 Z" fill="#15803D" stroke="#14532D" strokeWidth="1.2" />
        <Path d="M50 42 C38 30 40 14 50 12 C60 14 62 30 50 42 Z" fill="#22C55E" stroke="#15803D" strokeWidth="1.5" />
        <Path d="M50 15 V38" stroke="#BBF7D0" strokeWidth="2" strokeLinecap="round" fill="none" />
        <Path d="M42 85 C36 72 32 60 36 50 C40 50 44 64 46 85 Z" fill="#F0FDF4" stroke="#86EFAC" strokeWidth="1.5" />
        <Path d="M58 85 C64 72 68 60 64 50 C60 50 56 64 54 85 Z" fill="#F0FDF4" stroke="#86EFAC" strokeWidth="1.5" />
        <Path d="M45 86 C42 68 44 52 50 46 C56 52 58 68 55 86 Z" fill="#FFFFFF" stroke="#86EFAC" strokeWidth="1.5" />
      </Svg>
    ),
  },

  // 22. SELADA (Lettuce)
  selada: {
    name: 'Selada',
    category: 'Sayuran Daun',
    bgColor: '#ECFDF5',
    accentColor: '#059669',
    textColor: '#064E3B',
    renderSvg: (s) => (
      <Svg width={s} height={s} viewBox="0 0 100 100">
        <Circle cx="50" cy="50" r="38" fill="#A7F3D0" opacity={0.4} />
        <Path d="M22 55 C16 40 28 26 42 30 C50 20 62 22 68 30 C82 28 90 44 82 58 C86 70 74 82 60 82 C50 86 38 84 30 78 C18 72 16 62 22 55 Z" fill="#4ADE80" stroke="#15803D" strokeWidth="1.8" />
        <Path d="M30 52 C26 42 36 34 46 36 C52 32 60 34 62 40 C72 40 74 52 68 62 C64 70 54 74 46 72 C36 72 28 62 30 52 Z" fill="#86EFAC" stroke="#16A34A" strokeWidth="1.5" />
        <Path d="M40 54 C38 46 44 42 50 42 C56 42 60 46 58 54 C58 60 52 64 50 64 C46 64 40 60 40 54 Z" fill="#BBF7D0" stroke="#22C55E" strokeWidth="1.2" />
        <Path d="M50 46 V60 M45 52 Q50 56 54 54" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity={0.8} />
      </Svg>
    ),
  },

  // 23. SAWI HIJAU (Choy Sum / Mustard Greens)
  'sawi hijau': {
    name: 'Sawi Hijau',
    category: 'Sayuran Hijau',
    bgColor: '#DCFCE7',
    accentColor: '#16A34A',
    textColor: '#14532D',
    renderSvg: (s) => (
      <Svg width={s} height={s} viewBox="0 0 100 100">
        <Circle cx="50" cy="50" r="38" fill="#BBF7D0" opacity={0.4} />
        <Path d="M50 86 V48" stroke="#86EFAC" strokeWidth="4" strokeLinecap="round" />
        <Path d="M48 70 Q38 56 32 46" stroke="#86EFAC" strokeWidth="3" strokeLinecap="round" fill="none" />
        <Path d="M52 68 Q62 54 68 44" stroke="#86EFAC" strokeWidth="3" strokeLinecap="round" fill="none" />
        <Path d="M32 46 C22 38 24 22 36 22 C44 26 42 40 32 46 Z" fill="#22C55E" stroke="#15803D" strokeWidth="1.5" />
        <Path d="M68 44 C78 36 76 20 64 20 C56 24 58 38 68 44 Z" fill="#22C55E" stroke="#15803D" strokeWidth="1.5" />
        <Path d="M50 48 C38 36 40 18 50 16 C60 18 62 36 50 48 Z" fill="#16A34A" stroke="#14532D" strokeWidth="1.5" />
        <Circle cx="48" cy="14" r="2.5" fill="#FACC15" />
        <Circle cx="53" cy="13" r="2.2" fill="#FDE047" />
        <Circle cx="50" cy="10" r="2" fill="#FACC15" />
      </Svg>
    ),
  },

  // 24. KALE (Curly Kale)
  kale: {
    name: 'Kale',
    category: 'Superfood',
    bgColor: '#ECFCCB',
    accentColor: '#4D7C0F',
    textColor: '#365314',
    renderSvg: (s) => (
      <Svg width={s} height={s} viewBox="0 0 100 100">
        <Circle cx="50" cy="50" r="38" fill="#D9F99D" opacity={0.4} />
        <Path d="M50 86 Q50 56 50 24" stroke="#A3E635" strokeWidth="4" strokeLinecap="round" fill="none" />
        <Path d="M50 24 C42 16 34 22 36 30 C28 28 24 38 30 46 C22 46 22 58 32 64 C26 68 30 76 46 76 C48 76 50 68 50 58 C50 68 52 76 54 76 C70 76 74 68 68 64 C78 58 78 46 70 46 C76 38 72 28 64 30 C66 22 58 16 50 24 Z" fill="#15803D" stroke="#166534" strokeWidth="2" />
        <Path d="M38 36 Q45 42 48 40 M36 52 Q44 54 48 50 M62 36 Q55 42 52 40 M64 52 Q56 54 52 50" stroke="#86EFAC" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity={0.7} />
      </Svg>
    ),
  },

  // 25. DAUN BAWANG (Scallion / Spring Onion)
  'daun bawang': {
    name: 'Daun Bawang',
    category: 'Bumbu Dapur',
    bgColor: '#F0FDF4',
    accentColor: '#15803D',
    textColor: '#14532D',
    renderSvg: (s) => (
      <Svg width={s} height={s} viewBox="0 0 100 100">
        <Circle cx="50" cy="50" r="38" fill="#DCFCE7" opacity={0.4} />
        <Path d="M46 85 Q44 91 40 93 M50 86 V94 M54 85 Q56 91 60 93" stroke="#D97706" strokeWidth="1.8" strokeLinecap="round" fill="none" />
        <Path d="M44 85 H56 V62 H44 Z" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
        <Path d="M44 62 H56 V50 H44 Z" fill="#86EFAC" />
        <Path d="M44 50 L38 18 L43 16 L48 50 Z" fill="#16A34A" stroke="#15803D" strokeWidth="1.2" />
        <Path d="M47 50 L52 14 L56 15 L52 50 Z" fill="#22C55E" stroke="#15803D" strokeWidth="1.2" />
        <Path d="M51 50 L64 22 L60 20 L49 50 Z" fill="#15803D" stroke="#14532D" strokeWidth="1.2" />
      </Svg>
    ),
  },

  // 26. SELEDRI (Celery)
  seledri: {
    name: 'Seledri',
    category: 'Bumbu Dapur',
    bgColor: '#F0FDF4',
    accentColor: '#16A34A',
    textColor: '#14532D',
    renderSvg: (s) => (
      <Svg width={s} height={s} viewBox="0 0 100 100">
        <Circle cx="50" cy="50" r="38" fill="#DCFCE7" opacity={0.4} />
        <Path d="M48 85 Q44 60 34 40" stroke="#86EFAC" strokeWidth="3" strokeLinecap="round" fill="none" />
        <Path d="M50 85 V30" stroke="#86EFAC" strokeWidth="3.2" strokeLinecap="round" fill="none" />
        <Path d="M52 85 Q56 60 66 40" stroke="#86EFAC" strokeWidth="3" strokeLinecap="round" fill="none" />
        <Path d="M34 40 C24 38 22 28 30 26 C30 32 38 32 34 40 Z" fill="#16A34A" stroke="#15803D" strokeWidth="1.2" />
        <Path d="M32 32 C26 24 32 18 38 22 C36 28 34 30 32 32 Z" fill="#22C55E" stroke="#15803D" strokeWidth="1.2" />
        <Path d="M50 30 C40 26 42 14 50 16 C58 14 60 26 50 30 Z" fill="#16A34A" stroke="#15803D" strokeWidth="1.2" />
        <Path d="M66 40 C76 38 78 28 70 26 C70 32 62 32 66 40 Z" fill="#16A34A" stroke="#15803D" strokeWidth="1.2" />
        <Path d="M68 32 C74 24 68 18 62 22 C64 28 66 30 68 32 Z" fill="#22C55E" stroke="#15803D" strokeWidth="1.2" />
      </Svg>
    ),
  },

  // 27. KEMANGI (Lemon Basil)
  kemangi: {
    name: 'Kemangi',
    category: 'Herbal Aromatik',
    bgColor: '#FEF3C7',
    accentColor: '#D97706',
    textColor: '#92400E',
    renderSvg: (s) => (
      <Svg width={s} height={s} viewBox="0 0 100 100">
        <Circle cx="50" cy="50" r="38" fill="#FDE68A" opacity={0.35} />
        <Path d="M50 86 V32" stroke="#65A30D" strokeWidth="3.2" strokeLinecap="round" />
        <Path d="M50 72 C32 72 26 58 38 52 C46 54 48 64 50 72 Z" fill="#22C55E" stroke="#16A34A" strokeWidth="1.5" />
        <Path d="M50 72 C68 72 74 58 62 52 C54 54 52 64 50 72 Z" fill="#22C55E" stroke="#16A34A" strokeWidth="1.5" />
        <Path d="M50 50 C36 50 32 38 42 32 C48 34 49 42 50 50 Z" fill="#4ADE80" stroke="#15803D" strokeWidth="1.5" />
        <Path d="M50 50 C64 50 68 38 58 32 C52 34 51 42 50 50 Z" fill="#4ADE80" stroke="#15803D" strokeWidth="1.5" />
        <Path d="M50 32 V18" stroke="#9333EA" strokeWidth="2.5" strokeLinecap="round" />
        <Circle cx="47" cy="26" r="2.2" fill="#C084FC" />
        <Circle cx="53" cy="24" r="2.2" fill="#C084FC" />
        <Circle cx="48" cy="20" r="2" fill="#A855F7" />
        <Circle cx="52" cy="18" r="1.8" fill="#C084FC" />
        <Circle cx="50" cy="14" r="1.5" fill="#E9D5FF" />
      </Svg>
    ),
  },

  // 28. JAHE (Ginger)
  jahe: {
    name: 'Jahe',
    category: 'Tanaman Obat',
    bgColor: '#FEF3C7',
    accentColor: '#D97706',
    textColor: '#78350F',
    renderSvg: (s) => (
      <Svg width={s} height={s} viewBox="0 0 100 100">
        <Circle cx="50" cy="50" r="38" fill="#FDE68A" opacity={0.35} />
        <Path d="M42 52 Q40 32 34 18" stroke="#16A34A" strokeWidth="3" strokeLinecap="round" fill="none" />
        <Path d="M34 18 C30 24 34 32 38 36 Z" fill="#22C55E" />
        <Path d="M54 48 Q56 30 62 16" stroke="#15803D" strokeWidth="3.2" strokeLinecap="round" fill="none" />
        <Path d="M62 16 C66 22 62 30 58 34 Z" fill="#22C55E" />
        <Path d="M30 68 C24 60 28 50 38 52 C44 48 52 46 60 50 C68 46 76 52 74 62 C78 68 76 78 66 80 C56 84 44 84 36 78 C28 78 26 72 30 68 Z" fill="#D97706" stroke="#92400E" strokeWidth="2" />
        <Path d="M38 56 Q42 66 38 74" stroke="#FDE68A" strokeWidth="2" strokeLinecap="round" fill="none" opacity={0.8} />
        <Path d="M52 52 Q54 64 50 78" stroke="#FDE68A" strokeWidth="2" strokeLinecap="round" fill="none" opacity={0.8} />
        <Path d="M64 56 Q66 66 62 76" stroke="#FDE68A" strokeWidth="2" strokeLinecap="round" fill="none" opacity={0.8} />
      </Svg>
    ),
  },

  // 29. KUNYIT (Turmeric)
  kunyit: {
    name: 'Kunyit',
    category: 'Tanaman Obat',
    bgColor: '#FFFBEB',
    accentColor: '#EA580C',
    textColor: '#9A3412',
    renderSvg: (s) => (
      <Svg width={s} height={s} viewBox="0 0 100 100">
        <Circle cx="50" cy="50" r="38" fill="#FED7AA" opacity={0.4} />
        <Path d="M50 54 Q50 32 50 14" stroke="#16A34A" strokeWidth="3" strokeLinecap="round" />
        <Path d="M50 48 C36 38 34 22 50 14 C66 22 64 38 50 48 Z" fill="#22C55E" stroke="#15803D" strokeWidth="1.8" />
        <Path d="M50 18 V46" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity={0.7} />
        <Path d="M32 74 C26 68 30 58 40 60 C46 56 56 56 62 60 C72 58 76 68 70 76 C64 84 54 84 44 82 C36 84 30 80 32 74 Z" fill="#EA580C" stroke="#9A3412" strokeWidth="2" />
        <Path d="M42 62 Q45 70 42 78 M54 62 Q56 72 52 80 M64 64 Q66 72 62 76" stroke="#FDE047" strokeWidth="2" strokeLinecap="round" fill="none" />
      </Svg>
    ),
  },

  // 30. MELON (Melon)
  melon: {
    name: 'Melon',
    category: 'Buah Buahan',
    bgColor: '#FEF9C3',
    accentColor: '#65A30D',
    textColor: '#3F6212',
    renderSvg: (s) => (
      <Svg width={s} height={s} viewBox="0 0 100 100">
        <Circle cx="50" cy="50" r="38" fill="#ECFCCB" opacity={0.4} />
        <Circle cx="50" cy="56" r="28" fill="#84CC16" stroke="#4D7C0F" strokeWidth="2" />
        <Path d="M32 44 Q50 56 68 44 M26 56 Q50 68 74 56 M32 68 Q50 78 68 68" stroke="#D9F99D" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity={0.85} />
        <Path d="M50 28 V84 M38 34 Q40 56 38 78 M62 34 Q60 56 62 78" stroke="#D9F99D" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity={0.85} />
        <Path d="M50 28 V18 M42 18 H58" stroke="#65A30D" strokeWidth="3.5" strokeLinecap="round" />
        <Path d="M56 20 Q64 16 62 24 Q60 30 68 28" stroke="#84CC16" strokeWidth="2" strokeLinecap="round" fill="none" />
      </Svg>
    ),
  },

  // 31. STROBERI (Strawberry)
  stroberi: {
    name: 'Stroberi',
    category: 'Buah Buahan',
    bgColor: '#FFE4E6',
    accentColor: '#E11D48',
    textColor: '#9F1239',
    renderSvg: (s) => (
      <Svg width={s} height={s} viewBox="0 0 100 100">
        <Circle cx="50" cy="50" r="38" fill="#FECDD3" opacity={0.4} />
        <Path d="M34 42 C26 52 34 74 50 86 C66 74 74 52 66 42 C60 36 40 36 34 42 Z" fill="#E11D48" stroke="#9F1239" strokeWidth="2" />
        <Path d="M38 46 C34 52 36 60 40 64" stroke="#FDA4AF" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <Circle cx="44" cy="50" r="1.5" fill="#FDE047" />
        <Circle cx="56" cy="50" r="1.5" fill="#FDE047" />
        <Circle cx="50" cy="58" r="1.5" fill="#FDE047" />
        <Circle cx="42" cy="64" r="1.5" fill="#FDE047" />
        <Circle cx="58" cy="64" r="1.5" fill="#FDE047" />
        <Circle cx="50" cy="72" r="1.4" fill="#FDE047" />
        <Path d="M50 36 V24" stroke="#15803D" strokeWidth="3" strokeLinecap="round" />
        <Path d="M50 36 L40 32 L44 38 L34 40 L46 42 L50 36 L54 42 L66 40 L56 38 L60 32 Z" fill="#22C55E" stroke="#15803D" strokeWidth="1" />
      </Svg>
    ),
  },
};

// Default fallback untuk jenis tanaman tak dikenal
const DEFAULT_THEME: PlantTheme = {
  name: 'Tanaman',
  category: 'Kebun Tani',
  bgColor: '#E8F5E9',
  accentColor: '#3FA86B',
  textColor: '#123924',
  renderSvg: (s) => (
    <Svg width={s} height={s} viewBox="0 0 100 100">
      <Circle cx="50" cy="50" r="38" fill="#C8E6C9" opacity={0.4} />
      <Path d="M34 62 L38 82 H62 L66 62 Z" fill="#B45309" stroke="#78350F" strokeWidth="2" />
      <Rect x="30" y="58" width="40" height="6" rx="2" fill="#D97706" stroke="#78350F" strokeWidth="1.5" />
      <Path d="M50 58 V36" stroke="#15803D" strokeWidth="3" strokeLinecap="round" />
      <Path d="M50 44 C40 38 38 28 46 26 C52 30 50 40 50 44 Z" fill="#22C55E" stroke="#15803D" strokeWidth="1.2" />
      <Path d="M50 40 C60 34 62 24 54 22 C48 26 50 36 50 40 Z" fill="#16A34A" stroke="#15803D" strokeWidth="1.2" />
    </Svg>
  ),
};

export function getPlantTheme(jenisTanaman?: string): PlantTheme {
  if (!jenisTanaman) return DEFAULT_THEME;
  const raw = jenisTanaman.trim().toLowerCase();
  if (!raw) return DEFAULT_THEME;

  // 1. Exact match
  if (PLANT_THEMES[raw]) {
    return PLANT_THEMES[raw];
  }

  // 2. Direct normalized keyword mapping
  if (raw.includes('rawit')) {
    return PLANT_THEMES['cabai rawit'];
  }
  if (raw.includes('cabai') || raw.includes('cabe') || raw.includes('chili') || raw.includes('chilli')) {
    return PLANT_THEMES['cabai merah'];
  }
  if (raw.includes('putih') && raw.includes('bawang')) {
    return PLANT_THEMES['bawang putih'];
  }
  if (raw.includes('daun bawang') || raw.includes('scallion') || raw.includes('loncang') || raw.includes('spring onion')) {
    return PLANT_THEMES['daun bawang'];
  }
  if (raw.includes('bawang') || raw.includes('shallot') || raw.includes('onion')) {
    return PLANT_THEMES['bawang merah'];
  }
  if (raw.includes('pakcoy') || raw.includes('pokcoy') || raw.includes('bok choy') || raw.includes('pak choi')) {
    return PLANT_THEMES['pakcoy'];
  }
  if (raw.includes('selada') || raw.includes('lettuce') || raw.includes('romaine')) {
    return PLANT_THEMES['selada'];
  }
  if (raw.includes('sawi') || raw.includes('caisim') || raw.includes('choy sum')) {
    return PLANT_THEMES['sawi hijau'];
  }
  if (raw.includes('kale')) {
    return PLANT_THEMES['kale'];
  }
  if (raw.includes('seledri') || raw.includes('celery')) {
    return PLANT_THEMES['seledri'];
  }
  if (raw.includes('kemangi') || raw.includes('basil')) {
    return PLANT_THEMES['kemangi'];
  }
  if (raw.includes('jahe') || raw.includes('ginger')) {
    return PLANT_THEMES['jahe'];
  }
  if (raw.includes('kunyit') || raw.includes('turmeric')) {
    return PLANT_THEMES['kunyit'];
  }
  if (raw.includes('melon') || raw.includes('cantaloupe') || raw.includes('honeydew')) {
    return PLANT_THEMES['melon'];
  }
  if (raw.includes('stroberi') || raw.includes('strawberry')) {
    return PLANT_THEMES['stroberi'];
  }
  if (raw.includes('ubi') || raw.includes('sweet potato')) {
    return PLANT_THEMES['ubi jalar'];
  }
  if (raw.includes('kacang') || raw.includes('peanut')) {
    return PLANT_THEMES['kacang tanah'];
  }
  if (raw.includes('labu') || raw.includes('chayote')) {
    return PLANT_THEMES['labu siam'];
  }
  if (raw.includes('kedelai') || raw.includes('soya') || raw.includes('soybean') || raw.includes('edamame')) {
    return PLANT_THEMES['kedelai'];
  }
  if (raw.includes('singkong') || raw.includes('cassava')) {
    return PLANT_THEMES['singkong'];
  }
  if (raw.includes('jagung') || raw.includes('corn')) {
    return PLANT_THEMES['jagung'];
  }
  if (raw.includes('padi') || raw.includes('rice')) {
    return PLANT_THEMES['padi'];
  }
  if (raw.includes('tomat') || raw.includes('tomato')) {
    return PLANT_THEMES['tomat'];
  }
  if (raw.includes('kubis') || raw.includes('kol') || raw.includes('cabbage')) {
    return PLANT_THEMES['kubis'];
  }
  if (raw.includes('kangkung')) {
    return PLANT_THEMES['kangkung'];
  }
  if (raw.includes('bayam') || raw.includes('spinach')) {
    return PLANT_THEMES['bayam'];
  }
  if (raw.includes('terong') || raw.includes('eggplant')) {
    return PLANT_THEMES['terong'];
  }
  if (raw.includes('timun') || raw.includes('mentimun') || raw.includes('cucumber')) {
    return PLANT_THEMES['timun'];
  }
  if (raw.includes('wortel') || raw.includes('carrot')) {
    return PLANT_THEMES['wortel'];
  }
  if (raw.includes('kentang') || raw.includes('potato')) {
    return PLANT_THEMES['kentang'];
  }
  if (raw.includes('pisang') || raw.includes('banana')) {
    return PLANT_THEMES['pisang'];
  }

  // 3. Fallback: check if any PLANT_THEMES key is substring of input or vice versa
  for (const key of Object.keys(PLANT_THEMES)) {
    if (raw.includes(key) || key.includes(raw)) {
      return PLANT_THEMES[key];
    }
  }

  return DEFAULT_THEME;
}

const PlantIllustration = React.memo(function PlantIllustration({
  jenisTanaman,
  size = 84,
  style,
  showBadge = false,
}: PlantIllustrationProps) {
  const theme = useMemo(() => getPlantTheme(jenisTanaman), [jenisTanaman]);
  const svgContent = useMemo(() => theme.renderSvg(size), [theme, size]);

  const backdropSize = Math.round(size * 1.15);
  const backdropRadius = Math.round(backdropSize / 2);
  const badgeText = theme === DEFAULT_THEME && jenisTanaman ? jenisTanaman : theme.name;

  return (
    <View
      style={[styles.container, { backgroundColor: theme.bgColor }, style]}
      pointerEvents="none"
    >
      <View
        style={[
          styles.backdropCircle,
          {
            width: backdropSize,
            height: backdropSize,
            borderRadius: backdropRadius,
          },
        ]}
      />
      <View style={styles.svgWrapper}>{svgContent}</View>
      {showBadge && (
        <View style={styles.badge}>
          <Text style={[styles.badgeText, { color: theme.textColor }]}>
            {badgeText}
          </Text>
        </View>
      )}
    </View>
  );
});

export default PlantIllustration;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  backdropCircle: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.7)',
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
