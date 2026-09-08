import fs from 'fs';

let content = fs.readFileSync('app/(auth)/location-setup.tsx', 'utf8');

// Replace the broken api.put call
const brokenCall = `      const response = await api.put("/user/me", formData



      );`;

const newCall = `      const response = await api.put("/user/me", formData);`;

content = content.replace(brokenCall, newCall);
fs.writeFileSync('app/(auth)/location-setup.tsx', content);
