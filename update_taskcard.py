import re

filepath = '/mnt/06F6460AF645FA87/Project_MAGE/mage12-mobile/components/dashboard/TaskCard.tsx'
with open(filepath, 'r') as f:
    content = f.read()

# Replace props
content = content.replace(
    'export default function TaskCard({ task, onTaskPress, isWateringTask }: { task: any, onTaskPress: () => void, isWateringTask: boolean }) {',
    'export default function TaskCard({ task, onTaskPress, isWateringTask, isWateredToday }: { task: any, onTaskPress: () => void, isWateringTask: boolean, isWateredToday?: boolean }) {'
)

# Update styling logic
content = re.sub(
    r'<View style=\{\[styles\.iconBox, \{ backgroundColor: isWateringTask \? \'\#FFECE8\' : \'\#E5F5EB\' \}\]\}>',
    r'<View style={[styles.iconBox, { backgroundColor: isWateringTask && !isWateredToday ? \'#FFECE8\' : \'#E5F5EB\' }]}>',
    content
)

content = re.sub(
    r'<MaterialIcons name=\{isWateringTask \? "water-drop" : "eco"\} size=\{28\} color=\{isWateringTask \? "\#FF8A65" : "\#3FA96B"\} />',
    r'<MaterialIcons name={isWateringTask ? "water-drop" : "eco"} size={28} color={isWateringTask && !isWateredToday ? "#FF8A65" : "#3FA96B"} />',
    content
)

content = re.sub(
    r'<Text style=\{\[styles\.status, \{ color: isWateringTask \? "\#FF8A65" : "\#3FA96B" \}\]\}>\n\s*\{isWateringTask \? "Perlu disiram sekarang" : "Pertumbuhan baik"\}\n\s*</Text>',
    r"""<Text style={[styles.status, { color: isWateringTask && !isWateredToday ? "#FF8A65" : "#3FA96B" }]}>
            {isWateringTask ? (isWateredToday ? "Sudah disiram!" : "Perlu disiram sekarang") : "Pertumbuhan baik"}
          </Text>""",
    content
)

# Update checkbox logic
checkbox_old = """        {isWateringTask && (
          <View style={styles.checkbox}>
            <View style={styles.checkboxInner} />
          </View>
        )}"""
        
checkbox_new = """        {isWateringTask && (
          <View style={[styles.checkbox, isWateredToday && { borderColor: '#3FA96B', backgroundColor: '#3FA96B' }]}>
            {isWateredToday ? (
              <MaterialIcons name="check" size={24} color="#FFFFFF" />
            ) : (
              <View style={styles.checkboxInner} />
            )}
          </View>
        )}"""

content = content.replace(checkbox_old, checkbox_new)

with open(filepath, 'w') as f:
    f.write(content)
print("Updated TaskCard")
