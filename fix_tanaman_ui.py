import re

with open('app/(tabs)/tanaman.tsx', 'r') as f:
    content = f.read()

# Filter logic
content = content.replace(
'''    if (activeFilter === "Perlu Disiram")
      return tanaman.statusPenyiraman === "PERLU_SIRAM" && !sudahValidasiHariIni;
    if (activeFilter === "Sudah Disiram")
      return tanaman.statusPenyiraman === "SUDAH_DISIRAM" || sudahValidasiHariIni;''',
'''    if (activeFilter === "Perlu Disiram")
      return tanaman.statusPenyiraman !== "DITUNDA_HUJAN" && !sudahValidasiHariIni;
    if (activeFilter === "Sudah Disiram")
      return sudahValidasiHariIni;'''
)

# Badge logic
content = content.replace(
'''    } else if (tanaman.statusPenyiraman === "PERLU_SIRAM") {
      bgColor = "#FFECEB";
      borderColor = "#FF6B5C";
      textColor = "#FF6B5C";
      statusText = "Perlu Disiram";
    } else if (tanaman.statusPenyiraman === "DITUNDA_HUJAN") {
      bgColor = "#FFF9E6";
      borderColor = "#FFB627";
      textColor = "#FFB627";
      statusText = "Ditunda Hujan";
    } else if (tanaman.statusPenyiraman === "SUDAH_DISIRAM") {
      bgColor = "#E8F5E9";
      borderColor = "#3FA96B";
      textColor = "#3FA96B";
      statusText = "Sudah Disiram";
    } else {
      bgColor = "#F3F4F6";
      borderColor = "#9CA3AF";
      textColor = "#9CA3AF";
      statusText = "Aman";
    }''',
'''    } else if (tanaman.statusPenyiraman === "DITUNDA_HUJAN" && !sudahValidasiHariIni) {
      bgColor = "#FFF9E6";
      borderColor = "#FFB627";
      textColor = "#FFB627";
      statusText = "Ditunda Hujan";
    } else if (sudahValidasiHariIni) {
      bgColor = "#E8F5E9";
      borderColor = "#3FA96B";
      textColor = "#3FA96B";
      statusText = "Sudah Disiram";
    } else {
      bgColor = "#FFECEB";
      borderColor = "#FF6B5C";
      textColor = "#FF6B5C";
      statusText = "Perlu Disiram";
    }'''
)

with open('app/(tabs)/tanaman.tsx', 'w') as f:
    f.write(content)

print("Fixed tanaman.tsx")
