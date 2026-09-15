import re

with open('app/(tabs)/profil.tsx', 'r') as f:
    content = f.read()

# Add AsyncStorage import
if "import AsyncStorage" not in content:
    content = content.replace("import { MaterialIcons } from '@expo/vector-icons';", "import { MaterialIcons } from '@expo/vector-icons';\nimport AsyncStorage from '@react-native-async-storage/async-storage';")

# Add onPress to settingsButton
old_button = """          <Pressable 
            style={({ pressed }) => [
              styles.settingsButton,
              pressed && styles.pressedShadow2,
            ]}
          >"""

new_button = """          <Pressable 
            style={({ pressed }) => [
              styles.settingsButton,
              pressed && styles.pressedShadow2,
            ]}
            onPress={async () => {
              // DEV MODE: Reset onboarding state and go there
              await AsyncStorage.removeItem("hasSeenOnboarding");
              router.replace("/onboarding");
            }}
          >"""

content = content.replace(old_button, new_button)

with open('app/(tabs)/profil.tsx', 'w') as f:
    f.write(content)
