import re

filepath = '/mnt/06F6460AF645FA87/Project_MAGE/mage12-mobile/app/profil-pengguna.tsx'
with open(filepath, 'r') as f:
    content = f.read()

# Remove local function
content = re.sub(
    r'  const getRelativeTime = \(dateString: string\) => \{.*?\n  \};\n',
    '',
    content,
    flags=re.DOTALL
)

with open(filepath, 'w') as f:
    f.write(content)
