import re

with open('app/cuaca.tsx', 'r') as f:
    content = f.read()

# Change header options
content = content.replace(
'''      <Stack.Screen 
        options={{ 
          headerShown: true,
          headerTransparent: true,
          headerTitle: "",
          headerLeft: () => (
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={COLORS.ink} />
            </Pressable>
          )
        }} 
      />''',
'''      <Stack.Screen options={{ headerShown: false }} />
      
      {/* CUSTOM BACK BUTTON */}
      <Pressable onPress={() => router.back()} style={styles.absoluteBackButton}>
        <Ionicons name="arrow-back" size={24} color={COLORS.ink} />
      </Pressable>'''
)

# Update styles for absolute back button
styles_idx = content.find('  backButton: {')
if styles_idx != -1:
    end_btn_idx = content.find('  },', styles_idx) + 4
    content = content[:styles_idx] + '''  absoluteBackButton: {
    position: 'absolute',
    top: 48,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99,
  },
''' + content[end_btn_idx:]

with open('app/cuaca.tsx', 'w') as f:
    f.write(content)

print("Fixed header in cuaca.tsx")
