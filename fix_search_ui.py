import re

filepath = '/mnt/06F6460AF645FA87/Project_MAGE/mage12-mobile/app/(tabs)/komunitas.tsx'
with open(filepath, 'r') as f:
    content = f.read()

old_search = """<View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 12, borderRadius: 20, borderWidth: 0, shadowColor: "#123924", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.05, shadowRadius: 14, elevation: 4 }}>
              <MaterialIcons name="search" size={24} color="#5C5A4F" />
              <TextInput style={{ flex: 1, marginLeft: 8, fontFamily: 'Nunito_700Bold', fontSize: 16, color: '#123924' }} placeholder="Cari postingan, lokasi..." placeholderTextColor="#5C5A4F" value={searchQuery} onChangeText={setSearchQuery} />
            </View>"""
            
new_search = """<View style={{ flex: 1, height: 52, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', paddingHorizontal: 16, borderRadius: 20, borderWidth: 0, shadowColor: "#123924", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.05, shadowRadius: 14, elevation: 4 }}>
              <MaterialIcons name="search" size={24} color="#5C5A4F" />
              <TextInput style={{ flex: 1, marginLeft: 8, height: '100%', fontFamily: 'Nunito_700Bold', fontSize: 16, color: '#123924' }} placeholder="Cari username, lokasi..." placeholderTextColor="#5C5A4F" value={searchQuery} onChangeText={setSearchQuery} />
            </View>"""
            
content = content.replace(old_search, new_search)

with open(filepath, 'w') as f:
    f.write(content)
print("Fixed search bar UI")
