const fs = require('fs');
const path = require('path');

const root = process.cwd();
const files = fs.readdirSync(root);

// Process files
for (const file of files) {
  if (file.includes('\\')) {
    try {
      const isDir = fs.statSync(path.join(root, file)).isDirectory();
      
      // Clean target path by removing trailing backslash or empty parts
      let cleanedFile = file;
      if (cleanedFile.endsWith('\\')) {
        cleanedFile = cleanedFile.slice(0, -1);
      }
      
      const newPath = cleanedFile.split('\\').join('/');
      const fullNewPath = path.join(root, newPath);
      const fullOldPath = path.join(root, file);
      
      if (isDir) {
        fs.mkdirSync(fullNewPath, { recursive: true });
        console.log(`Created directory ${newPath}`);
      } else {
        fs.mkdirSync(path.dirname(fullNewPath), { recursive: true });
        fs.renameSync(fullOldPath, fullNewPath);
        console.log(`Moved file ${file} to ${newPath}`);
      }
    } catch (err) {
      console.warn(`Error processing ${file}:`, err.message);
    }
  }
}
console.log('Renaming finished.');
