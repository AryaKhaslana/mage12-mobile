import re

with open('app/(tabs)/profil.tsx', 'r') as f:
    content = f.read()

target = """          <Pressable 
            style={({ pressed }) => [
              styles.settingsButton,
              pressed && styles.pressedShadow2,
            ]}
            onPress={async () => {
              // DEV MODE: Reset onboarding state and go there
              await AsyncStorage.removeItem("hasSeenOnboarding");
              router.replace("/onboarding");
            }}
          >
            <MaterialIcons name="settings" size={24} color="#123924" />
          </Pressable>"""

content = content.replace(target, '')

with open('app/(tabs)/profil.tsx', 'w') as f:
    f.write(content)
