import re

with open('app/(auth)/location-setup.tsx', 'r') as f:
    content = f.read()

content = content.replace('from "react-native";', 'from "react-native";\nimport Animated, { useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming } from "react-native-reanimated";')
content = content.replace('import { useState } from "react";', 'import { useState, useEffect } from "react";')

with open('app/(auth)/location-setup.tsx', 'w') as f:
    f.write(content)
