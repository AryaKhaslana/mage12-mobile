import re

with open('app/_layout.tsx', 'r') as f:
    content = f.read()

# Add detail-tanaman to _layout.tsx to hide default header
if '<Stack.Screen name="detail-tanaman" options={{ headerShown: false }} />' not in content:
    content = content.replace(
        '<Stack.Screen name="(auth)" options={{ headerShown: false }} />',
        '<Stack.Screen name="(auth)" options={{ headerShown: false }} />\n        <Stack.Screen name="detail-tanaman" options={{ headerShown: false }} />'
    )

with open('app/_layout.tsx', 'w') as f:
    f.write(content)
