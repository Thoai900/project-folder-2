# AI Prompt Refiner Extension - Installation Script
# Run: Right-click -> Run with PowerShell ISE

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  Cai Dat AI Prompt Refiner Extension" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""
Start-Sleep -Milliseconds 500

# Get the script directory
$scriptDir = Split-Path -Parent -Path $MyInvocation.MyCommand.Definition
if ([string]::IsNullOrWhiteSpace($scriptDir)) {
    $scriptDir = Get-Location
}

Write-Host "[1/5] Kiem tra thu muc extension..." -ForegroundColor Yellow

$extensionPath = Join-Path -Path $scriptDir -ChildPath "extension"
$manifestPath = Join-Path -Path $extensionPath -ChildPath "manifest.json"

# Check if extension folder exists
if (-not (Test-Path -Path $extensionPath)) {
    Write-Host "❌ Loi: Khong tim thay thu muc 'extension'" -ForegroundColor Red
    Write-Host "   Duong dan tim: $extensionPath" -ForegroundColor Red
    Write-Host ""
    Write-Host "   Gia i: Hay chac chan ban da giai nen ZIP va chay script trong thu muc chung" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Nhan Enter de thoat"
    exit 1
}

if (-not (Test-Path -Path $manifestPath)) {
    Write-Host "❌ Loi: Khong tim thay manifest.json" -ForegroundColor Red
    Write-Host "   Duong dan: $manifestPath" -ForegroundColor Red
    Write-Host ""
    Read-Host "Nhan Enter de thoat"
    exit 1
}

Write-Host "✓ Tim thay extension" -ForegroundColor Green
Write-Host "  Duong dan: $extensionPath" -ForegroundColor Gray
Write-Host ""
Start-Sleep -Milliseconds 500

# Find Chrome or Edge
Write-Host "[2/5] Tim Chrome hoac Edge..." -ForegroundColor Yellow

$browserPath = $null
$browserType = $null

# List of possible browser paths
$possiblePaths = @(
    @{ Path = "$env:ProgramFiles\Google\Chrome\Application\chrome.exe"; Type = "Chrome" },
    @{ Path = "$env:ProgramFiles(x86)\Google\Chrome\Application\chrome.exe"; Type = "Chrome" },
    @{ Path = "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe"; Type = "Chrome" },
    @{ Path = "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe"; Type = "Edge" },
    @{ Path = "$env:ProgramFiles(x86)\Microsoft\Edge\Application\msedge.exe"; Type = "Edge" },
    @{ Path = "$env:LOCALAPPDATA\Microsoft\Edge\Application\msedge.exe"; Type = "Edge" }
)

foreach ($item in $possiblePaths) {
    if (Test-Path -Path $item.Path) {
        $browserPath = $item.Path
        $browserType = $item.Type
        Write-Host "✓ Tim thay: $browserType" -ForegroundColor Green
        Write-Host "  Duong dan: $browserPath" -ForegroundColor Gray
        break
    }
}

if (-not $browserPath) {
    Write-Host "❌ Loi: Khong tim thay Chrome hoac Edge!" -ForegroundColor Red
    Write-Host "   Hay cai dat Chrome hoac Edge truoc" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Nhan Enter de thoat"
    exit 1
}

Write-Host ""
Start-Sleep -Milliseconds 500

# Find Extensions folder
Write-Host "[3/5] Tim thu muc Extensions..." -ForegroundColor Yellow

$extensionsPath = $null

if ($browserType -eq "Edge") {
    $extensionsPath = Join-Path -Path $env:LOCALAPPDATA -ChildPath "Microsoft\Edge\User Data\Default\Extensions"
} else {
    $extensionsPath = Join-Path -Path $env:LOCALAPPDATA -ChildPath "Google\Chrome\User Data\Default\Extensions"
}

Write-Host "  Duong dan Extensions: $extensionsPath" -ForegroundColor Gray

# Create Extensions folder if it doesn't exist
if (-not (Test-Path -Path $extensionsPath)) {
    Write-Host "  Tao thu muc Extensions..." -ForegroundColor Gray
    New-Item -ItemType Directory -Path $extensionsPath -Force | Out-Null
}

Write-Host "✓ Tim thay Extensions folder" -ForegroundColor Green
Write-Host ""
Start-Sleep -Milliseconds 500

# Copy extension
Write-Host "[4/5] Cai dat extension..." -ForegroundColor Yellow

$destPath = Join-Path -Path $extensionsPath -ChildPath "ai-prompt-refiner"

# Remove old version if exists
if (Test-Path -Path $destPath) {
    Write-Host "  Go bo version cu..." -ForegroundColor Gray
    Remove-Item -Path $destPath -Recurse -Force -ErrorAction SilentlyContinue
    Start-Sleep -Milliseconds 500
}

# Copy new extension
Write-Host "  Sao chep files..." -ForegroundColor Gray
try {
    Copy-Item -Path $extensionPath -Destination $destPath -Recurse -Force
    Write-Host "✓ Cai dat thanh cong!" -ForegroundColor Green
    Write-Host "  Dia chi: $destPath" -ForegroundColor Gray
} catch {
    Write-Host "❌ Loi khi sao chep: $($_)" -ForegroundColor Red
    Write-Host ""
    Read-Host "Nhan Enter de thoat"
    exit 1
}

Write-Host ""
Start-Sleep -Milliseconds 500

# Open browser
Write-Host "[5/5] Mo trang Extensions..." -ForegroundColor Yellow

try {
    Write-Host "  Mo $browserType..." -ForegroundColor Gray
    Start-Process -FilePath $browserPath -ArgumentList "chrome://extensions/" -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
    Write-Host "✓ Mo thanh cong" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Khong the mo browser tu dong" -ForegroundColor Yellow
    Write-Host "   Hay mo tay: chrome://extensions/" -ForegroundColor White
}

Write-Host ""
Write-Host "======================================" -ForegroundColor Green
Write-Host "   ✓ CAI DAT HOAN TAT!" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green
Write-Host ""
Write-Host "BUOC TIEP THEO:" -ForegroundColor Cyan
Write-Host "  1. Tron trang Extensions vua mo" -ForegroundColor White
Write-Host "  2. Tim 'AI Prompt Refiner' trong danh sach" -ForegroundColor White
Write-Host "  3. Chac chan no da BAT (toggle trang)" -ForegroundColor White
Write-Host "  4. Ghe ChatGPT, Gemini hoac Claude de dung!" -ForegroundColor White
Write-Host ""
Write-Host "NEU CO VAN DE:" -ForegroundColor Yellow
Write-Host "  • Reload trang Extensions (F5)" -ForegroundColor White
Write-Host "  • Dong va mo lai browser" -ForegroundColor White
Write-Host "  • Chay lai script nay" -ForegroundColor White
Write-Host ""

Read-Host "Nhan Enter de dong cua so nay"
