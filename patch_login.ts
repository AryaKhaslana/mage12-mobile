import fs from 'fs';

let content = fs.readFileSync('app/(auth)/login.tsx', 'utf8');

// Use static import
content = content.replace(
  'import api from "../../services/api";',
  'import api, { googleSignIn } from "../../services/api";'
);

// Remove dynamic import
content = content.replace(
  'const { googleSignIn } = await import("../../services/api");\n              await googleSignIn();',
  'await googleSignIn();'
);

fs.writeFileSync('app/(auth)/login.tsx', content);
