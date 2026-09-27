import re

with open('app/(tabs)/profil.tsx', 'r') as f:
    content = f.read()

# Let's remove the elevation: \d+ that is right after the clay_shadow string.
# Actually, the clay shadow ends with `elevation: 4,`. If the next lines have `elevation: 3,` or `elevation: 4,`, we should remove them.
# The previous regex might have left `elevation: \d+,` trailing.
content = re.sub(r'(shadowRadius:\s*14,\s*elevation:\s*4,)\s*elevation:\s*\d+\s*,?', r'\1', content)

with open('app/(tabs)/profil.tsx', 'w') as f:
    f.write(content)

print("Cleaned up duplicate elevations")
