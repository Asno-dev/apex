const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const src = 'C:\\Users\\bdhar\\Downloads\\asno';
const dst = 'C:\\Users\\bdhar\\Downloads\\asno-backup.zip';

const excludeDirs = ['node_modules', 'dist', '.git', '.agents', 'temp_ob'];
const excludeNames = ['create-zip.ps1', 'create-zip.js'];

const files = [];
function walk(dir, rel) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    const relPath = rel ? rel + '/' + entry.name : entry.name;
    if (entry.isDirectory()) {
      if (!excludeDirs.includes(entry.name)) walk(full, relPath);
    } else {
      if (!excludeNames.includes(entry.name) && !entry.name.endsWith('.zip')) {
        files.push(full);
      }
    }
  }
}
walk(src, '');

console.log('Total files to zip:', files.length);

// Build a PowerShell command to zip these files
const psScript = `
$src = "${src.replace(/\\/g, '\\\\')}"
$dst = "${dst.replace(/\\/g, '\\\\')}"
if (Test-Path $dst) { Remove-Item $dst -Force }
Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::Open($dst, [System.IO.Compression.ZipArchiveMode]::Create)
$files = @(
${files.map(f => '  "' + f.replace(/\\/g, '\\\\') + '"').join(',\n')}
)
foreach ($f in $files) {
  $rel = $f.Substring($src.Length + 1)
  Write-Host "Adding: $rel"
  try {
    [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $f, $rel) | Out-Null
  } catch {
    Write-Host "Skipped: $rel"
  }
}
$zip.Dispose()
Write-Host "Done - created $dst"
Write-Host "Files zipped: $($files.Count)"
`;

const psFile = path.join(__dirname, 'create-zip-temp.ps1');
fs.writeFileSync(psFile, psScript, 'utf8');

execSync(`powershell -NoProfile -ExecutionPolicy Bypass -File "${psFile}"`, {
  stdio: 'inherit',
  timeout: 120000,
  cwd: __dirname
});

try { fs.unlinkSync(psFile); } catch {}
