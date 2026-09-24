import re

files = ['app/(tabs)/komunitas.tsx', 'app/(tabs)/profil.tsx', 'app/(tabs)/tanaman.tsx']

def remove_duplicate_keys(match):
    # This matches the inside of an object { ... }
    inner = match.group(1)
    # Split by comma
    parts = inner.split(',')
    
    seen = set()
    new_parts = []
    # Go backwards to keep the last one
    for part in reversed(parts):
        part = part.strip()
        if not part:
            continue
        if ':' in part:
            key = part.split(':')[0].strip()
            if key in seen:
                continue
            seen.add(key)
        new_parts.append(part)
        
    return "{" + ", ".join(reversed(new_parts)) + "}"

for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find { ... } and clean it
    # We have to be careful with nested objects, so we just match simple one-level inline objects
    # like { backgroundColor: '#FFF', shadowColor: "#123924", ... }
    content = re.sub(r'\{([^{}]+)\}', remove_duplicate_keys, content)

    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)

