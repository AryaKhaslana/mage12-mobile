import re

filepath = '/mnt/06F6460AF645FA87/Project_MAGE/mage12-mobile/app/profil-pengguna.tsx'
with open(filepath, 'r') as f:
    content = f.read()

old_btn = """        <View style={{ width: 40 }} />
      </View>

      <ScrollView"""
      
new_btn = """        <Pressable
          accessibilityLabel="Opsi Lainnya"
          onPress={handleMore}
          style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
        >
          <MaterialIcons name="more-vert" size={20} color={C.ink} />
        </Pressable>
      </View>

      <ScrollView"""

content = content.replace(old_btn, new_btn)

with open(filepath, 'w') as f:
    f.write(content)
print("Restored 3 dots button")
