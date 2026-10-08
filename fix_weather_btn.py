import re

with open('components/FarmerScene.tsx', 'r') as f:
    content = f.read()

# Change the weather Box to a button
content = content.replace(
'''  weatherBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.8)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },''',
'''  weatherBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
    shadowColor: '#1B4332',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F3E5F5'
  },'''
)

# And add "Cuaca: " text to the weather render
content = content.replace(
'''        <Text style={styles.tempText}>{Math.round(temperature)}°C</Text>
      </Pressable>''',
'''        <Text style={styles.tempText}>Cuaca: {Math.round(temperature)}°C</Text>
      </Pressable>'''
)

with open('components/FarmerScene.tsx', 'w') as f:
    f.write(content)

print("Fixed FarmerScene.tsx")
