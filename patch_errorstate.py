import re

with open('components/ErrorState.tsx', 'r') as f:
    content = f.read()

# Add Image to imports
content = content.replace("import { View, Text, StyleSheet, Pressable } from 'react-native';", "import { View, Text, StyleSheet, Pressable, Image } from 'react-native';")

old_render = """  return (
    <View style={styles.container}>
      <View style={styles.iconWrapper}>
        <MaterialIcons name={icon} size={64} color="#FF6B5C" />
      </View>"""

new_render = """  return (
    <View style={styles.container}>
      <Image 
        source={require('../assets/images/icontampilanawal/seedling-ngantuk.png')} 
        style={{ width: 140, height: 140, marginBottom: 24, resizeMode: 'contain' }} 
      />"""

content = content.replace(old_render, new_render)
content = content.replace('title = "Sinyal Hilang Ditelan Bumi 🌍",', 'title = "Sinyal Ilang, Seedling Tidur Dulu 😴",')
content = content.replace('subtitle = "Koneksi internetmu lagi ngambek nih broskie. Cek kuota atau WiFi, trus coba lagi ya!",', 'subtitle = "Koneksi internetmu lagi ngambek nih broskie. Cek kuota atau nyalain WiFi lagi biar Seedling bangun!",')

with open('components/ErrorState.tsx', 'w') as f:
    f.write(content)
