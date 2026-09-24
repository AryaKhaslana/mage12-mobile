import re

with open('app/(tabs)/index.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace inline thick borders and hard shadows
content = re.sub(r'borderWidth:\s*[123],?\s*', '', content)
content = re.sub(r'borderColor:\s*[\'\"`]#123924[\'\"`],?\s*', '', content)
content = re.sub(r'boxShadow:\s*[\'\"`]\d+px \d+px 0px #123924[\'\"`],?\s*', '', content)

# Clean up dangling commas in objects like { backgroundColor: '#FFF', }
content = re.sub(r',\s*\}', ' }', content)

with open('app/(tabs)/index.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

