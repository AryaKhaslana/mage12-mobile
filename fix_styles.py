import re

files_to_fix = [
    'app/(tabs)/index.tsx',
    'app/(tabs)/profil.tsx'
]

for file in files_to_fix:
    with open(file, 'r') as f:
        content = f.read()

    # 1. Replace borderWidth: 2 with borderWidth: 0
    content = re.sub(r'borderWidth:\s*2\s*,?', r'borderWidth: 0,', content)
    
    # 2. Remove borderColor: '#123924'
    content = re.sub(r'borderColor:\s*[\'"]#123924[\'"]\s*,?', '', content)

    # 3. Replace boxShadow: '4px 4px 0px #123924' with the new clay shadow
    clay_shadow = r'shadowColor: "#123924", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 14, elevation: 4,'
    content = re.sub(r'boxShadow:\s*[\'"](?:4px 4px|3px 3px|2px 2px|5px 5px)\s+0px\s+#123924[\'"]\s*,?', clay_shadow, content)

    # 4. Replace the pressed animation (0px 0px 0px #123924 + translate) with scale
    clay_pressed_shadow = r'shadowColor: "#123924", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,'
    content = re.sub(r'boxShadow:\s*[\'"]0px 0px 0px #123924[\'"]\s*,?', clay_pressed_shadow, content)
    
    content = re.sub(r'transform:\s*\[\{\s*translate[XY]:\s*\d+\s*\}\s*,\s*\{\s*translate[XY]:\s*\d+\s*\}\]\s*,?', r'transform: [{ scale: 0.98 }],', content)

    with open(file, 'w') as f:
        f.write(content)
        
print("Styles safely replaced!")
