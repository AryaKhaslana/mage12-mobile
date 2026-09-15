import re

with open('app/(tabs)/profil.tsx', 'r') as f:
    content = f.read()

# Remove the component
button_pattern = r'<\s*Pressable[^>]*styles\.settingsButton[\s\S]*?<\s*/\s*Pressable\s*>'
content = re.sub(button_pattern, '', content)

# Remove the style
style_pattern = r'settingsButton:\s*{[^}]*},\s*'
content = re.sub(style_pattern, '', content)

with open('app/(tabs)/profil.tsx', 'w') as f:
    f.write(content)
