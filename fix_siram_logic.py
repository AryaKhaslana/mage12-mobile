import re

with open('app/(tabs)/index.tsx', 'r') as f:
    content = f.read()

# We need to fix the logic in both places where it filters reminders and checks hasWateringTask

content = content.replace(
'''      const sudahValidasiHariIni = t.logTerakhir && new Date(t.logTerakhir.createdAt).toDateString() === new Date().toDateString();
      if (t.statusPenyiraman === "PERLU_SIRAM" || sudahValidasiHariIni)
        return true;
      if ((t.sisaHariPanen ?? 999) <= 7) return true;
      return false;''',
'''      const sudahValidasiHariIni = t.logTerakhir && new Date(t.logTerakhir.createdAt).toDateString() === new Date().toDateString();
      // Selalu tampilkan plant sebagai task nyiram tiap hari KECUALI kalau statusnya DITUNDA_HUJAN (dan belum disiram hari ini)
      if (t.statusPenyiraman !== "DITUNDA_HUJAN" || sudahValidasiHariIni) return true;
      
      if ((t.sisaHariPanen ?? 999) <= 7) return true;
      return false;'''
)

content = content.replace(
'''      const sudahValidasiHariIni = a.logTerakhir && new Date(a.logTerakhir.createdAt).toDateString() === new Date().toDateString();
      const bSudahValidasi = b.logTerakhir && new Date(b.logTerakhir.createdAt).toDateString() === new Date().toDateString();
      
      // Order: needs watering -> watered today -> harvest soon
      if (a.statusPenyiraman === "PERLU_SIRAM" && b.statusPenyiraman !== "PERLU_SIRAM") return -1;
      if (a.statusPenyiraman !== "PERLU_SIRAM" && b.statusPenyiraman === "PERLU_SIRAM") return 1;''',
'''      const aSudahValidasi = a.logTerakhir && new Date(a.logTerakhir.createdAt).toDateString() === new Date().toDateString();
      const bSudahValidasi = b.logTerakhir && new Date(b.logTerakhir.createdAt).toDateString() === new Date().toDateString();
      
      // Order: needs watering -> watered today -> harvest soon
      const aNeedsWatering = a.statusPenyiraman !== "DITUNDA_HUJAN" && !aSudahValidasi;
      const bNeedsWatering = b.statusPenyiraman !== "DITUNDA_HUJAN" && !bSudahValidasi;
      if (aNeedsWatering && !bNeedsWatering) return -1;
      if (!aNeedsWatering && bNeedsWatering) return 1;'''
)

content = content.replace(
'''  const hasWateringTask = reminders.some(t => {
      const sudahValidasiHariIni = t.logTerakhir && new Date(t.logTerakhir.createdAt).toDateString() === new Date().toDateString();
      return t.statusPenyiraman === "PERLU_SIRAM" && !sudahValidasiHariIni;
  });''',
'''  const hasWateringTask = reminders.some(t => {
      const sudahValidasiHariIni = t.logTerakhir && new Date(t.logTerakhir.createdAt).toDateString() === new Date().toDateString();
      return t.statusPenyiraman !== "DITUNDA_HUJAN" && !sudahValidasiHariIni;
  });'''
)

content = content.replace(
'''                  const isWateringTask = tanaman.statusPenyiraman === "PERLU_SIRAM" || sudahValidasiHariIni;''',
'''                  // Task penyiraman aktif tiap hari, kecuali kalau ditunda hujan
                  const isWateringTask = tanaman.statusPenyiraman !== "DITUNDA_HUJAN" || sudahValidasiHariIni;'''
)


with open('app/(tabs)/index.tsx', 'w') as f:
    f.write(content)

print("Fixed index.tsx siram logic")
