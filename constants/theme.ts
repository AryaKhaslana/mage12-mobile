import Colors from "./colors";

export const Fonts = {
  regular: "Nunito_400Regular",
  medium: "Nunito_500Medium",
  bold: "Nunito_700Bold",
  extraBold: "Nunito_800ExtraBold",
} as const;

export const Radius = {
  sm: 12,
  md: 20,
  lg: 28,
  pill: 999,
} as const;

export const Borders = {
  default: 2,
  emphasis: 3,
  color: Colors.ink,
} as const;

export const Shadows = {
  // Signature Neobrutalist Hard Offset Shadow (No blur, sharp offset)
  offsetSm: {
    shadowColor: Colors.ink,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  offsetMd: {
    shadowColor: Colors.ink,
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
  },
  // Soft Clay Shadow (Khusus elemen hero mascot / floating pill tanpa border)
  softClay: {
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 6,
  },
} as const;

export default {
  colors: Colors,
  fonts: Fonts,
  radius: Radius,
  borders: Borders,
  shadows: Shadows,
};
