# Create a clean zip of the asno project for Google AI Studio upload
# Excludes: node_modules, .git, dist, .agents, temp_ob, old zip files

$projectRoot = "c:\Users\bdhar\Downloads\asno"
$zipPath = "c:\Users\bdhar\Downloads\asno-for-ai-studio.zip"

# Remove old zip if exists
if (Test-Path $zipPath) {
    Remove-Item $zipPath -Force
}

# Create a temporary staging directory
$stagingDir = "$env:TEMP\asno-staging"
if (Test-Path $stagingDir) {
    Remove-Item $stagingDir -Recurse -Force
}
New-Item -ItemType Directory -Path $stagingDir | Out-Null

# Define exclude patterns
$excludeDirs = @('node_modules', '.git', 'dist', '.agents', 'temp_ob')
$excludeExtensions = @('.zip')
$excludeFiles = @('make-zip.ps1', 'create-zip.js', 'create-zip.ps1')

# Copy files with filtering
$allFiles = Get-ChildItem -Path $projectRoot -Recurse -File
foreach ($file in $allFiles) {
    $relativePath = $file.FullName.Substring($projectRoot.Length + 1)
    
    # Check if in excluded directory
    $skip = $false
    foreach ($dir in $excludeDirs) {
        if ($relativePath -like "$dir\*" -or $relativePath -like "*\$dir\*") {
            $skip = $true
            break
        }
    }
    
    # Check excluded extensions
    if (-not $skip -and $excludeExtensions -contains $file.Extension) {
        $skip = $true
    }
    
    # Check excluded files
    if (-not $skip -and $excludeFiles -contains $file.Name) {
        $skip = $true
    }
    
    if (-not $skip) {
        $destPath = Join-Path $stagingDir $relativePath
        $destDir = Split-Path $destPath -Parent
        if (-not (Test-Path $destDir)) {
            New-Item -ItemType Directory -Path $destDir -Force | Out-Null
        }
        Copy-Item $file.FullName -Destination $destPath
    }
}

# Show what's being zipped
$stagedFiles = Get-ChildItem -Path $stagingDir -Recurse -File
$totalSize = ($stagedFiles | Measure-Object -Property Length -Sum).Sum
Write-Host "Files to zip: $($stagedFiles.Count)"
Write-Host "Total size before compression: $([math]::Round($totalSize / 1MB, 2)) MB"

# Create the zip
Compress-Archive -Path "$stagingDir\*" -DestinationPath $zipPath -CompressionLevel Optimal

# Show result
$zipFile = Get-Item $zipPath
Write-Host ""
Write-Host "ZIP created successfully!"
Write-Host "Location: $zipPath"
Write-Host "ZIP size: $([math]::Round($zipFile.Length / 1MB, 2)) MB"

if ($zipFile.Length -lt 30MB) {
    Write-Host "Status: UNDER 30 MB - Ready for Google AI Studio!" -ForegroundColor Green
} else {
    Write-Host "Status: OVER 30 MB - Need to reduce further!" -ForegroundColor Red
}

# Cleanup staging
Remove-Item $stagingDir -Recurse -Force

Write-Host ""
Write-Host "Files included:"
foreach ($f in $stagedFiles) {
    $rel = $f.FullName.Substring($stagingDir.Length + 1)
    Write-Host "  $rel"
}
