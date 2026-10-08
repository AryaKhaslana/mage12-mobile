const fs = require('fs');
let code = fs.readFileSync('app/(tabs)/index.tsx', 'utf-8');

code = code.replace(
  /const handleLogAktivitas = async \(tanamanId: number\) => \{/,
  'const handleLogAktivitas = async (tanamanId: number, plantName?: string) => {'
);

code = code.replace(
  /showNotification\(\s*"Mantap!",\s*`\+\$\{d\.expDidapat\} EXP! Streak: \$\{d\.streak\} hari`,\s*"success",\s*\);/,
  `showNotification("Mantap!", \`Berhasil menyiram \${plantName || 'tanaman'}! +\${d.expDidapat} EXP! Streak: \$\{d.streak\} hari\`, "success");`
);

code = code.replace(
  /handleLogAktivitas\(tanaman\.id\);/g,
  'handleLogAktivitas(tanaman.id, tanaman.nickname || tanaman.jenisTanaman);'
);

fs.writeFileSync('app/(tabs)/index.tsx', code);
