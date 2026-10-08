import re

filepath = '/mnt/06F6460AF645FA87/Project_MAGE/mage12-mobile/components/FarmerScene.tsx'
with open(filepath, 'r') as f:
    content = f.read()

old_clouds = """      {/* Drifting Clouds */}
      <Animated.View style={[styles.cloudLayer, cloudAnimatedStyle]}>
        <Svg width={width + 100} height={100}>
          <Path d="M 40,60 Q 60,40 80,60 Q 100,50 120,70 L 40,70 Z" fill="#FFFFFF" opacity={isNight ? 0.2 : 0.7} />
          <Path d="M 240,40 Q 260,20 280,40 Q 300,30 320,50 L 240,50 Z" fill="#FFFFFF" opacity={isNight ? 0.1 : 0.5} />
        </Svg>
      </Animated.View>"""

new_clouds = """      {/* Drifting Clouds */}
      <Animated.View style={[styles.cloudLayer, cloudAnimatedStyle]}>
        <Svg width={width + 200} height={100}>
          {/* Cloud 1 (Bigger, full fluffy) */}
          <G x="30" y="30" opacity={isNight ? 0.2 : 0.8} fill="#FFFFFF">
            <Circle cx="20" cy="20" r="14" />
            <Circle cx="40" cy="12" r="20" />
            <Circle cx="65" cy="22" r="16" />
            <Circle cx="42" cy="28" r="15" />
          </G>
          
          {/* Cloud 2 (Smaller, full fluffy) */}
          <G x="230" y="10" opacity={isNight ? 0.1 : 0.5} fill="#FFFFFF">
            <Circle cx="15" cy="15" r="10" />
            <Circle cx="30" cy="10" r="14" />
            <Circle cx="45" cy="18" r="12" />
            <Circle cx="30" cy="22" r="11" />
          </G>
        </Svg>
      </Animated.View>"""

content = content.replace(old_clouds, new_clouds)

with open(filepath, 'w') as f:
    f.write(content)

print("Clouds fixed!")
