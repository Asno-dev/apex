import fs from 'fs';
import path from 'path';

const root = process.cwd();
const files = fs.readdirSync(root);

for (const file of files) {
  if (file.includes('\\')) {
    const newPath = file.split('\\').join('/');
    const fullNewPath = path.join(root, newPath);
    const fullOldPath = path.join(root, file);
    fs.mkdirSync(path.dirname(fullNewPath), { recursive: true });
    fs.renameSync(fullOldPath, fullNewPath);
    console.log(`Moved ${file} to ${newPath}`);
  }
}
