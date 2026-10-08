const fs = require('fs');
let code = fs.readFileSync('app/(tabs)/komunitas.tsx', 'utf-8');
code = code.replace(
  /<TextInput style=\{\{ flex: 1, marginLeft: 8, height: '100%', fontFamily: 'Nunito_700Bold', fontSize: 16, color: '#123924' \}\}/,
  "<TextInput style={{ flex: 1, marginLeft: 8, height: '100%', fontFamily: 'Nunito_700Bold', fontSize: 16, color: '#123924', paddingVertical: 0 }}"
);
fs.writeFileSync('app/(tabs)/komunitas.tsx', code);
