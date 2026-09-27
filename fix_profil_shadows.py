import re

with open('app/(tabs)/profil.tsx', 'r') as f:
    content = f.read()

# Remove old explicit shadow properties that were added alongside boxShadow
content = re.sub(r'shadowColor:\s*[\'"]#123924[\'"]\s*,\s*shadowOffset:\s*{\s*width:\s*\d+\s*,\s*height:\s*\d+\s*}\s*,\s*shadowOpacity:\s*1\s*,\s*shadowRadius:\s*0\s*,?', '', content)

with open('app/(tabs)/profil.tsx', 'w') as f:
    f.write(content)
    
print("Cleaned up duplicate shadows in profil.tsx")
