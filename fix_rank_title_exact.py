import re

files = [
    '/mnt/06F6460AF645FA87/Project_MAGE/mage12-mobile/app/(tabs)/profil.tsx',
    '/mnt/06F6460AF645FA87/Project_MAGE/mage12-mobile/app/profil-pengguna.tsx'
]

old_func = """const getRankTitle = (level: number) => {
  if (level >= 10) return "Dewa Tani";
  if (level >= 8) return "Sultan Hidroponik";
  if (level >= 6) return "Master Kompos";
  if (level >= 4) return "Juragan Panen";
  if (level >= 2) return "Petani Magang";
  return "Petani Pemula";
};"""

old_func_2 = """  const getRankTitle = (level: number) => {
    if (level >= 10) return "Dewa Tani ";
    if (level >= 8) return "Sultan Hidroponik ";
    if (level >= 6) return "Master Kompos ";
    if (level >= 4) return "Juragan Panen ";
    if (level >= 2) return "Petani Magang ";
    return "Petani Pemula ";
  };"""

new_func = """const getRankTitle = (level: number) => {
  if (level >= 10) return "Dewa Tani";
  if (level >= 8) return "Sultan Hidroponik";
  if (level >= 4) return "Juragan Panen";
  if (level >= 2) return "Tangan Dingin";
  return "Petani Balkon";
};"""

new_func_2 = """  const getRankTitle = (level: number) => {
    if (level >= 10) return "Dewa Tani ";
    if (level >= 8) return "Sultan Hidroponik ";
    if (level >= 4) return "Juragan Panen ";
    if (level >= 2) return "Tangan Dingin ";
    return "Petani Balkon ";
  };"""

for filepath in files:
    with open(filepath, 'r') as f:
        content = f.read()
    
    if "Petani Magang " in content:
        content = content.replace(old_func_2, new_func_2)
    else:
        content = content.replace(old_func, new_func)
        
    with open(filepath, 'w') as f:
        f.write(content)

print("Updated getRankTitle in both files to perfectly match Dashboard")
