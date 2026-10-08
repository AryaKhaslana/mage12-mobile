import re

filepath = '/mnt/06F6460AF645FA87/Project_MAGE/mage12-mobile/app/(tabs)/index.tsx'
with open(filepath, 'r') as f:
    content = f.read()

# Filter logic update
old_filter = """  const reminders = [...tanamanList]
    .filter((t) => {
      const sudahValidasiHariIni =
        t.logTerakhir &&
        new Date(t.logTerakhir.createdAt).toDateString() ===
          new Date().toDateString();
      if (t.statusPenyiraman === "PERLU_SIRAM" && !sudahValidasiHariIni)
        return true;
      if ((t.sisaHariPanen ?? 999) <= 7) return true;
      return false;
    })"""
    
new_filter = """  const reminders = [...tanamanList]
    .filter((t) => {
      // Keep watering task in the list even if validated today
      if (t.statusPenyiraman === "PERLU_SIRAM")
        return true;
      if ((t.sisaHariPanen ?? 999) <= 7) return true;
      return false;
    })"""
    
content = content.replace(old_filter, new_filter)

# Rendering logic update
old_render = """                  const isWateringTask = tanaman.statusPenyiraman === "PERLU_SIRAM" && !sudahValidasiHariIni;

                  return (
                    <TaskCard 
                      key={tanaman.id}
                      task={tanaman}
                      isWateringTask={isWateringTask}
                      onTaskPress={() => {
                        if (isWateringTask) {"""
                        
new_render = """                  const isWateringTask = tanaman.statusPenyiraman === "PERLU_SIRAM";

                  return (
                    <TaskCard 
                      key={tanaman.id}
                      task={tanaman}
                      isWateringTask={isWateringTask}
                      isWateredToday={sudahValidasiHariIni}
                      onTaskPress={() => {
                        if (isWateringTask && !sudahValidasiHariIni) {"""

content = content.replace(old_render, new_render)

with open(filepath, 'w') as f:
    f.write(content)
print("Fixed index filtering")
