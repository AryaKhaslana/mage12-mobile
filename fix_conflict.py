import re

filepath = '/mnt/06F6460AF645FA87/Project_MAGE/mage12-mobile/app/profil-pengguna.tsx'
with open(filepath, 'r') as f:
    content = f.read()

# Remove the specific local function
content = re.sub(
    r'const getRelativeTime = \(iso: string\) => \{.*?\n\};\n\n',
    '',
    content,
    flags=re.DOTALL
)

with open(filepath, 'w') as f:
    f.write(content)
print("Removed duplicate function")
