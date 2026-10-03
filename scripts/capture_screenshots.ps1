$chromePath = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$outDir = "C:\Users\Thoufeek\Desktop\VAULT_LinkedIn_Screenshots"
$userDataDir = "C:\Users\Thoufeek\Desktop\VAULT_LinkedIn_Screenshots\.chrome_session"

if (!(Test-Path $outDir)) {
    New-Item -ItemType Directory -Force -Path $outDir
}

$targets = @(
    @{
        Name = "01_VAULT_Hero_Cosmic_Showcase.png"
        Url = "http://localhost:3000"
        Width = 1920
        Height = 1080
        Budget = 2500
    },
    @{
        Name = "02_VAULT_Product_Showcase_Tool_Grid.png"
        Url = "http://localhost:3000"
        Width = 1920
        Height = 1800
        Budget = 2500
    },
    @{
        Name = "03_VAULT_Developer_API_and_Architecture_FAQ.png"
        Url = "http://localhost:3000#developer-api"
        Width = 1920
        Height = 1400
        Budget = 2500
    },
    @{
        Name = "04_VAULT_Wallet_Console_Dashboard.png"
        Url = "http://localhost:3000/api/auth/quick-login?email=alice@wallet.secure&redirect=/wallet"
        Width = 1920
        Height = 1150
        Budget = 3000
    },
    @{
        Name = "05_VAULT_Cryptographic_Workbench_Hashing.png"
        Url = "http://localhost:3000/api/auth/quick-login?email=alice@wallet.secure&redirect=/crypto-lab?tab=hashing"
        Width = 1920
        Height = 1350
        Budget = 3500
    },
    @{
        Name = "06_VAULT_Cryptographic_Workbench_Signatures.png"
        Url = "http://localhost:3000/api/auth/quick-login?email=alice@wallet.secure&redirect=/crypto-lab?tab=signatures"
        Width = 1920
        Height = 1350
        Budget = 3500
    },
    @{
        Name = "07_VAULT_Cryptographic_Workbench_AES_GCM.png"
        Url = "http://localhost:3000/api/auth/quick-login?email=alice@wallet.secure&redirect=/crypto-lab?tab=encryption"
        Width = 1920
        Height = 1350
        Budget = 3500
    },
    @{
        Name = "08_VAULT_Attack_Pentest_Studio.png"
        Url = "http://localhost:3000/api/auth/quick-login?email=alice@wallet.secure&redirect=/security?tab=experiments"
        Width = 1920
        Height = 1350
        Budget = 3000
    },
    @{
        Name = "09_VAULT_Immutable_Audit_Ledger.png"
        Url = "http://localhost:3000/api/auth/quick-login?email=alice@wallet.secure&redirect=/transactions"
        Width = 1920
        Height = 1200
        Budget = 3000
    },
    @{
        Name = "10_VAULT_Compliance_and_Security_Dossier.png"
        Url = "http://localhost:3000/record-book"
        Width = 1920
        Height = 1450
        Budget = 2500
    }
)

foreach ($item in $targets) {
    $outFile = Join-Path $outDir $item.Name
    Write-Host "Capturing: $($item.Name) from $($item.Url)"
    
    $args = @(
        "--headless=new",
        "--window-size=$($item.Width),$($item.Height)",
        "--hide-scrollbars",
        "--run-all-compositor-stages-before-draw",
        "--virtual-time-budget=$($item.Budget)",
        "--user-data-dir=$userDataDir",
        "--screenshot=$outFile",
        $item.Url
    )
    
    Start-Process -FilePath $chromePath -ArgumentList $args -Wait
    Start-Sleep -Milliseconds 600
}

Write-Host "All 10 LinkedIn high-resolution screenshots generated successfully!"

