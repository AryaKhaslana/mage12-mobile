const fs = require('fs');
let code = fs.readFileSync('app/notifikasi.tsx', 'utf-8');

code = code.replace(
  /<Stack\.Screen options=\{\{ headerShown: false \}\} \/>\s*\{\/\* Header \*\/\}\s*<View style=\{styles\.header\}>[\s\S]*?<\/View>/,
  `
      <Stack.Screen 
        options={{ 
          headerShown: true,
          title: 'Notifikasi',
          headerTitleStyle: { fontFamily: 'Nunito_700Bold', fontSize: 17, color: '#123924' },
          headerStyle: { backgroundColor: '#FBF8F0' },
          headerShadowVisible: false,
          headerLeft: () => (
            <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.backButton, pressed && styles.pressed, { marginLeft: 16 }]}>
              <MaterialIcons name="arrow-back" size={20} color="#123924" />
            </Pressable>
          ),
          headerRight: () => (
            <Pressable onPress={handleMarkAllRead} style={({ pressed }) => [pressed && styles.pressed, { marginRight: 16 }]}>
              <Text style={styles.headerAction}>Tandai Dibaca</Text>
            </Pressable>
          )
        }} 
      />
`
);

fs.writeFileSync('app/notifikasi.tsx', code);
