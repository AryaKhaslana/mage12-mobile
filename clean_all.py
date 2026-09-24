import re
import glob

files = ['app/(tabs)/_layout.tsx', 'app/(tabs)/tanaman.tsx', 'app/(tabs)/komunitas.tsx', 'app/(tabs)/profil.tsx']

for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Special handling for layout
    content = content.replace("borderWidth: 2.5,", "borderWidth: 0,")
    
    content = re.sub(r'borderWidth:\s*[1234],?\s*', 'borderWidth: 0, ', content)
    content = re.sub(r'borderColor:\s*[\'\"`]#123924[\'\"`],?\s*', '', content)
    content = re.sub(r'boxShadow:\s*[\'\"`]\d+px \d+px 0px #123924[\'\"`],?\s*', 'shadowColor: "#123924", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4, ', content)

    # Clean up dangling commas in objects like { backgroundColor: '#FFF', }
    content = re.sub(r',\s*\}', ' }', content)

    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)

