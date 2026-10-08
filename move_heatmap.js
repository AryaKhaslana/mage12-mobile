const fs = require('fs');
let code = fs.readFileSync('app/(tabs)/index.tsx', 'utf-8');

// hapus Info Peta Wabah yang di bawah
code = code.replace(
  /\s*\{\/\* 5\. Info Peta Wabah \*\/\}\s*<View style=\{\{ paddingHorizontal: 24, marginTop: 8 \}\}>\s*<InfoCard onPress=\{\(\) => router\.push\("\/peta-hama" as any\)\} \/>\s*<\/View>/,
  ""
);

// sisipkan di bawah HeroCard
code = code.replace(
  /(\s*<HeroCard[\s\S]*?\/>\s*)/,
  `$1
            {/* 5. Info Peta Wabah (Dipindah ke atas) */}
            <View style={{ paddingHorizontal: 24, marginTop: 8 }}>
              <InfoCard onPress={() => router.push("/peta-hama" as any)} />
            </View>
`
);

fs.writeFileSync('app/(tabs)/index.tsx', code);
