const fs = require('fs');
const lines = fs.readFileSync('vibe-coding/src/components/PluginsManager.tsx', 'utf-8').split('\n');
fs.writeFileSync('vibe-coding/src/components/PluginsManager.tsx', lines.slice(0, 1337).join('\n'));
