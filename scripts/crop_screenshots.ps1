Add-Type -AssemblyName System.Drawing

function Crop-Image($sourcePath, $destPath, $x, $y, $w, $h) {
    $src = [System.Drawing.Bitmap]::FromFile($sourcePath)
    $rect = New-Object System.Drawing.Rectangle($x, $y, $w, $h)
    $cropped = $src.Clone($rect, $src.PixelFormat)
    $src.Dispose()
    $cropped.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $cropped.Dispose()
    Write-Host "Processed: $destPath ($w x $h)"
}

$dir = "C:\Users\Thoufeek\Desktop\VAULT_LinkedIn_Screenshots"
$tempDir = Join-Path $dir "temp_cropped"
if (!(Test-Path $tempDir)) { New-Item -ItemType Directory -Path $tempDir | Out-Null }

# 01 Hero: cropped from 01 (X=320, Y=0, W=1280, H=835)
Crop-Image (Join-Path $dir "01_VAULT_Hero_Cosmic_Showcase.png") (Join-Path $tempDir "01_VAULT_Hero_Cosmic_Showcase.png") 320 0 1280 835

# 02 Tool Grid: cropped from 03 (X=320, Y=843, W=1280, H=1220)
Crop-Image (Join-Path $dir "03_VAULT_Developer_API_and_Architecture_FAQ.png") (Join-Path $tempDir "02_VAULT_Product_Showcase_Tool_Grid.png") 320 843 1280 1220

# 03 Developer API & FAQ: cropped from 03 (X=320, Y=2065, W=1280, H=1115)
Crop-Image (Join-Path $dir "03_VAULT_Developer_API_and_Architecture_FAQ.png") (Join-Path $tempDir "03_VAULT_Developer_API_and_Architecture_FAQ.png") 320 2065 1280 1115

# 04 Wallet Console: cropped from 04 (X=320, Y=0, W=1280, H=1085)
Crop-Image (Join-Path $dir "04_VAULT_Wallet_Console_Dashboard.png") (Join-Path $tempDir "04_VAULT_Wallet_Console_Dashboard.png") 320 0 1280 1085

# 05 Workbench Hashing: cropped from 05 (X=320, Y=0, W=1280, H=1150)
Crop-Image (Join-Path $dir "05_VAULT_Cryptographic_Workbench_Hashing.png") (Join-Path $tempDir "05_VAULT_Cryptographic_Workbench_Hashing.png") 320 0 1280 1150

# 06 Workbench Signatures: cropped from 06 (X=320, Y=0, W=1280, H=1040)
Crop-Image (Join-Path $dir "06_VAULT_Cryptographic_Workbench_Signatures.png") (Join-Path $tempDir "06_VAULT_Cryptographic_Workbench_Signatures.png") 320 0 1280 1040

# 07 Workbench AES-GCM: cropped from 07 (X=320, Y=0, W=1280, H=815)
Crop-Image (Join-Path $dir "07_VAULT_Cryptographic_Workbench_AES_GCM.png") (Join-Path $tempDir "07_VAULT_Cryptographic_Workbench_AES_GCM.png") 320 0 1280 815

# 08 Attack Studio: cropped from 08 (X=320, Y=0, W=1280, H=760)
Crop-Image (Join-Path $dir "08_VAULT_Attack_Pentest_Studio.png") (Join-Path $tempDir "08_VAULT_Attack_Pentest_Studio.png") 320 0 1280 760

# 09 Immutable Ledger: cropped from 09 (X=320, Y=0, W=1280, H=570)
Crop-Image (Join-Path $dir "09_VAULT_Immutable_Audit_Ledger.png") (Join-Path $tempDir "09_VAULT_Immutable_Audit_Ledger.png") 320 0 1280 570

# 10 Compliance Dossier: cropped from 10 (X=320, Y=0, W=1280, H=1140)
Crop-Image (Join-Path $dir "10_VAULT_Compliance_and_Security_Dossier.png") (Join-Path $tempDir "10_VAULT_Compliance_and_Security_Dossier.png") 320 0 1280 1140

# Copy all from tempDir to dir, overwriting originals
Get-ChildItem $tempDir -Filter "*.png" | ForEach-Object {
    Copy-Item $_.FullName $dir -Force
    Write-Host "Overwrote $($_.Name) with cropped version"
}

# Clean up temp directory and test files
Remove-Item $tempDir -Recurse -Force
Get-ChildItem $dir -Filter "test_*.png" | Remove-Item -Force
Write-Host "All 10 LinkedIn screenshots cropped cleanly and finalized!"
