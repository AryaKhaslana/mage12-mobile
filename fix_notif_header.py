import re

filepath = '/mnt/06F6460AF645FA87/Project_MAGE/mage12-mobile/app/notifikasi.tsx'
with open(filepath, 'r') as f:
    content = f.read()

# Fix header title centering
old_header = """      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}><MaterialIcons name="arrow-back" size={20} color="#123924" /></Pressable>
        
        <Text style={styles.headerTitle}>Notifikasi</Text>
        
        <Pressable style={({ pressed }) => [pressed && styles.pressed]}>
          <Text style={styles.headerAction}>Tandai Semua Dibaca</Text>
        </Pressable>
      </View>"""
      
new_header = """      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1, alignItems: 'flex-start' }}>
          <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
            <MaterialIcons name="arrow-back" size={20} color="#123924" />
          </Pressable>
        </View>
        
        <Text style={styles.headerTitle}>Notifikasi</Text>
        
        <View style={{ flex: 1, alignItems: 'flex-end' }}>
          <Pressable style={({ pressed }) => [pressed && styles.pressed]}>
            <Text style={styles.headerAction}>Tandai Dibaca</Text>
          </Pressable>
        </View>
      </View>"""

content = content.replace(old_header, new_header)

with open(filepath, 'w') as f:
    f.write(content)
print("Fixed notif header UI")
