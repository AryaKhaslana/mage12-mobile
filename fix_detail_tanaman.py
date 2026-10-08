import re

with open('app/detail-tanaman.tsx', 'r') as f:
    content = f.read()

# Badge logic
content = content.replace(
'''  let badgeBgColor = "#E0F2F1";
  let badgeBorderColor = "#00796B";
  let badgeTextColor = "#004D40";
  let badgeText = "Status";
  
  if ((tanaman.sisaHariPanen ?? 999) <= 0) {
    badgeBgColor = "#FFF9E6";
    badgeBorderColor = "#FFB627";
    badgeTextColor = "#FFB627";
    badgeText = "Siap Panen 🌾";
  } else if (tanaman.statusPenyiraman === "PERLU_SIRAM") {
    badgeBgColor = "#FFECEB";
    badgeBorderColor = "#FF6B5C";
    badgeTextColor = "#B71C1C";
    badgeText = "Perlu Disiram";
  } else if (tanaman.statusPenyiraman === "DITUNDA_HUJAN") {
    badgeBgColor = "#FFF9E6";
    badgeBorderColor = "#FFB627";
    badgeTextColor = "#B71C1C";
    badgeText = "Ditunda Hujan";
  } else if (tanaman.statusPenyiraman === "SUDAH_DISIRAM") {
    badgeText = "Sudah Disiram";
  }

  if (sudahValidasiHariIni) {
    badgeBgColor = "#E8F5E9";
    badgeBorderColor = "#3FA86B";
    badgeTextColor = "#123924";
    badgeText = "Sudah Disiram Hari Ini ";
  }''',
'''  let badgeBgColor = "#E0F2F1";
  let badgeBorderColor = "#00796B";
  let badgeTextColor = "#004D40";
  let badgeText = "Status";
  
  if ((tanaman.sisaHariPanen ?? 999) <= 0) {
    badgeBgColor = "#FFF9E6";
    badgeBorderColor = "#FFB627";
    badgeTextColor = "#FFB627";
    badgeText = "Siap Panen 🌾";
  } else if (tanaman.statusPenyiraman === "DITUNDA_HUJAN" && !sudahValidasiHariIni) {
    badgeBgColor = "#FFF9E6";
    badgeBorderColor = "#FFB627";
    badgeTextColor = "#B71C1C";
    badgeText = "Ditunda Hujan";
  } else if (sudahValidasiHariIni) {
    badgeBgColor = "#E8F5E9";
    badgeBorderColor = "#3FA86B";
    badgeTextColor = "#123924";
    badgeText = "Sudah Disiram Hari Ini ";
  } else {
    badgeBgColor = "#FFECEB";
    badgeBorderColor = "#FF6B5C";
    badgeTextColor = "#B71C1C";
    badgeText = "Perlu Disiram";
  }'''
)

# Action button logic
content = content.replace(
'''          sudahValidasiHariIni ? (
            <Text style={{ fontSize: 12, color: '#5C5A4F', textAlign: 'center', marginBottom: 20 }}>
              Tanaman ini sudah divalidasi hari ini, balik lagi besok ya! 
            </Text>
          ) : tanaman.statusPenyiraman === "DITUNDA_HUJAN" ? (
            <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: 14, color: '#123924', textAlign: 'center', backgroundColor: '#E3F5EC', padding: 16, borderRadius: 16, borderWidth: 0, borderColor: '#3FA86B' }}>
              Penyiraman ditunda karena sistem mendeteksi hujan lebat hari ini! 🌧️ Streak kamu aman!
            </Text>
          ) : (
            tanaman.statusPenyiraman !== "SUDAH_DISIRAM" && (''',
'''          sudahValidasiHariIni ? (
            <Text style={{ fontSize: 12, color: '#5C5A4F', textAlign: 'center', marginBottom: 20 }}>
              Tanaman ini sudah divalidasi hari ini, balik lagi besok ya! 
            </Text>
          ) : tanaman.statusPenyiraman === "DITUNDA_HUJAN" ? (
            <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: 14, color: '#123924', textAlign: 'center', backgroundColor: '#E3F5EC', padding: 16, borderRadius: 16, borderWidth: 0, borderColor: '#3FA86B' }}>
              Penyiraman ditunda karena sistem mendeteksi hujan lebat hari ini! 🌧️ Streak kamu aman!
            </Text>
          ) : (
            true && ('''
)

with open('app/detail-tanaman.tsx', 'w') as f:
    f.write(content)

print("Fixed detail-tanaman.tsx")
