const fs = require('fs');
let code = fs.readFileSync('app/notifikasi.tsx', 'utf-8');

code = code.replace(/title: 'Notifikasi',/, "title: 'Notifikasi',\n          headerTitleAlign: 'center',");
code = code.replace(/size=\{20\}/, "size={24}");

fs.writeFileSync('app/notifikasi.tsx', code);
