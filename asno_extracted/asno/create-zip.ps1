$src = "C:\Users\bdhar\Downloads\asno"
$dst = "C:\Users\bdhar\Downloads\asno-backup.zip"

Add-Type -Assembly System.IO.Compression.FileSystem

if (Test-Path $dst) { Remove-Item $dst -Force }

$zip = [System.IO.Compression.ZipFile]::Open($dst, [System.IO.Compression.ZipArchiveMode]::Create)

$excludeDirs = @("node_modules", "dist", ".git", ".agents", "temp_ob")
$excludeFiles = @("*.zip", "create-zip.ps1")

# Add all files recursively (skipping excluded dirs)
$allFiles = Get-ChildItem -Path $src -Recurse -File | Where-Object {
    $inExcludedDir = $false
    foreach ($ed in $excludeDirs) {
        if ($_.FullName -match "\\$ed\\") { $inExcludedDir = $true; break }
    }
    $isExcludedFile = $false
    foreach ($ef in $excludeFiles) {
        if ($_.Name -like $ef) { $isExcludedFile = $true; break }
    }
    -not $inExcludedDir -and -not $isExcludedFile
}

foreach ($file in $allFiles) {
    $relativePath = $file.FullName.Substring($src.Length + 1)
    $entry = $zip.CreateEntry($relativePath, [System.IO.Compression.CompressionLevel]::Optimal)
    $entryWriter = new-object System.IO.StreamWriter($entry.Open())
    $entryWriter.Write([System.IO.File]::ReadAllText($file.FullName))
    $entryWriter.Flush()
    $entryWriter.Close()
}

$zip.Dispose()
Write-Host "Created backup at $dst"
Write-Host "Total files: $($allFiles.Count)"
