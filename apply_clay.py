import re

with open('app/(tabs)/index.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Soften Avatar
content = content.replace('borderWidth: 2,\n    borderColor: "#123924",', 'borderWidth: 0,\n    shadowColor: "#123924",\n    shadowOffset: { width: 0, height: 4 },\n    shadowOpacity: 0.08,\n    shadowRadius: 12,\n    elevation: 3,')

# Soften LogoutButton
content = content.replace('boxShadow: "4px 4px 0px #123924",', 'shadowColor: "#123924",\n    shadowOffset: { width: 0, height: 4 },\n    shadowOpacity: 0.08,\n    shadowRadius: 12,\n    elevation: 3,')
content = re.sub(r'logoutButton: \{[^\}]*?borderWidth: 2,[^\}]*?borderColor: "#123924",', lambda m: m.group(0).replace('borderWidth: 2,', 'borderWidth: 0,').replace('borderColor: "#123924",', ''), content)

# Soften HeroCard
content = re.sub(r'heroCard: \{[^\}]*?boxShadow: "4px 4px 0px #123924",', lambda m: m.group(0).replace('boxShadow: "4px 4px 0px #123924",', 'shadowColor: "#123924",\n    shadowOffset: { width: 0, height: 8 },\n    shadowOpacity: 0.12,\n    shadowRadius: 16,\n    elevation: 5,'), content)

# Soften TaskCard
content = re.sub(r'taskCard: \{[^\}]*?borderWidth: 2,[^\}]*?borderColor: "#123924",\n[^\}]*?boxShadow: "4px 4px 0px #123924",', lambda m: m.group(0).replace('borderWidth: 2,', 'borderWidth: 0,').replace('borderColor: "#123924",', '').replace('boxShadow: "4px 4px 0px #123924",', 'shadowColor: "#123924",\n    shadowOffset: { width: 0, height: 4 },\n    shadowOpacity: 0.06,\n    shadowRadius: 12,\n    elevation: 2,'), content)

# Soften PlantCard
content = re.sub(r'plantCard: \{[^\}]*?borderWidth: 2,[^\}]*?borderColor: "#123924",\n[^\}]*?boxShadow: "4px 4px 0px #123924",', lambda m: m.group(0).replace('borderWidth: 2,', 'borderWidth: 0,').replace('borderColor: "#123924",', '').replace('boxShadow: "4px 4px 0px #123924",', 'shadowColor: "#123924",\n    shadowOffset: { width: 0, height: 6 },\n    shadowOpacity: 0.08,\n    shadowRadius: 14,\n    elevation: 4,'), content)

# Soften pressed states
content = re.sub(r'pressedShadow4: \{[^\}]*?boxShadow: "0px 0px 0px #123924",', lambda m: m.group(0).replace('boxShadow: "0px 0px 0px #123924",', 'shadowOffset: { width: 0, height: 2 },\n    shadowOpacity: 0.04,\n    shadowRadius: 4,\n    elevation: 1,'), content)
content = content.replace('transform: [{ translateX: 4 }, { translateY: 4 }]', 'transform: [{ scale: 0.98 }]')

# Soften TaskIconBox and Checkbox and Badge
content = re.sub(r'taskIconBox: \{[^\}]*?borderWidth: 2,\n[^\}]*?borderColor: "#123924",', lambda m: m.group(0).replace('borderWidth: 2,', 'borderWidth: 0,').replace('borderColor: "#123924",', 'backgroundColor: "#F6F3EB",'), content)
content = re.sub(r'checkbox: \{[^\}]*?borderWidth: 2,\n[^\}]*?borderColor: "#123924",', lambda m: m.group(0).replace('borderWidth: 2,', 'borderWidth: 0,').replace('borderColor: "#123924",', 'backgroundColor: "#F1EEE6",'), content)
content = re.sub(r'badge: \{[^\}]*?borderWidth: 1,\n[^\}]*?borderColor: "#123924",', lambda m: m.group(0).replace('borderWidth: 1,', 'borderWidth: 0,').replace('borderColor: "#123924",', 'backgroundColor: "#F6F3EB",'), content)

# Modals and inline styles
content = content.replace("borderWidth: 3, borderColor: '#123924'", 'borderWidth: 0, shadowColor: "#123924", shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.15, shadowRadius: 24, elevation: 10')
content = content.replace("borderWidth: 2, borderColor: '#123924'", 'borderWidth: 0')
content = content.replace("boxShadow: '3px 3px 0px #123924'", 'shadowColor: "#123924", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3')
content = content.replace("boxShadow: '0px 0px 0px #123924'", 'shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1')
content = content.replace("transform: [{ translateY: 3 }, { translateX: 3 }]", "transform: [{ scale: 0.97 }]")

# FAB
content = re.sub(r'tanibotFab: \{[^\}]*?borderWidth: 2,\n[^\}]*?borderColor: "#123924",\n[^\}]*?boxShadow: "4px 4px 0px #123924",', lambda m: m.group(0).replace('borderWidth: 2,', 'borderWidth: 0,').replace('borderColor: "#123924",', '').replace('boxShadow: "4px 4px 0px #123924",', 'shadowColor: "#3FA86B",\n    shadowOffset: { width: 0, height: 8 },\n    shadowOpacity: 0.3,\n    shadowRadius: 16,\n    elevation: 8,'), content)
content = re.sub(r'pressedFab: \{[^\}]*?boxShadow: "0px 0px 0px #123924",\n[^\}]*?transform: \[\{ translateX: 4 \}, \{ translateY: 4 \}\],', lambda m: m.group(0).replace('boxShadow: "0px 0px 0px #123924",', 'shadowOffset: { width: 0, height: 4 },\n    shadowOpacity: 0.15,\n    shadowRadius: 8,\n    elevation: 4,').replace('transform: [{ translateX: 4 }, { translateY: 4 }],', 'transform: [{ scale: 0.95 }],'), content)

with open('app/(tabs)/index.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

