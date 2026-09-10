with open('app/(tabs)/komunitas.tsx', 'r') as f:
    content = f.read()

content = content.replace("  fab: {", ",  fab: {", 1)

with open('app/(tabs)/komunitas.tsx', 'w') as f:
    f.write(content)
