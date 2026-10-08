const fs = require('fs');
let code = fs.readFileSync('app/notifikasi.tsx', 'utf-8');

// The remaining part of the old header is:
/*
        <Text style={styles.headerTitle}>Notifikasi</Text>
        
        <View style={{ flex: 1, alignItems: 'flex-end' }}>
          <Pressable onPress={handleMarkAllRead} style={({ pressed }) => [pressed && styles.pressed]}>
            <Text style={styles.headerAction}>Tandai Dibaca</Text>
          </Pressable>
        </View>
      </View>
*/

code = code.replace(
  /\s*<Text style=\{styles\.headerTitle\}>Notifikasi<\/Text>\s*<View style=\{\{ flex: 1, alignItems: 'flex-end' \}\}>\s*<Pressable onPress=\{handleMarkAllRead\} style=\{\(\{ pressed \}\) => \[pressed && styles\.pressed\]\}>\s*<Text style=\{styles\.headerAction\}>Tandai Dibaca<\/Text>\s*<\/Pressable>\s*<\/View>\s*<\/View>/g,
  ""
);

fs.writeFileSync('app/notifikasi.tsx', code);
