import fs from 'fs';

let content = fs.readFileSync('app/(auth)/login.tsx', 'utf8');

// Remove Image from @expo/vector-icons
content = content.replace('import { Image,  MaterialIcons } from "@expo/vector-icons";', 'import { MaterialIcons } from "@expo/vector-icons";');

// Add Image to react-native imports
content = content.replace('TouchableOpacity,', 'TouchableOpacity,\n    Image,');

fs.writeFileSync('app/(auth)/login.tsx', content);
