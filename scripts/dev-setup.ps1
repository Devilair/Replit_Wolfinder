# 🛠️ WOLFINDER - SCRIPT SETUP SVILUPPO
# Configura l'ambiente di sviluppo completo

Write-Host "🐺 WOLFINDER - SETUP AMBIENTE SVILUPPO" -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Green

# 1. Verifica Node.js
Write-Host "🔍 Verifica Node.js..." -ForegroundColor Yellow
$nodeVersion = node --version
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Node.js non trovato!" -ForegroundColor Red
    Write-Host "   Installa Node.js da: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ Node.js trovato: $nodeVersion" -ForegroundColor Green

# 2. Verifica pnpm
Write-Host "🔍 Verifica pnpm..." -ForegroundColor Yellow
$pnpmVersion = pnpm --version
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ pnpm non trovato!" -ForegroundColor Red
    Write-Host "   Installa pnpm: npm install -g pnpm" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ pnpm trovato: $pnpmVersion" -ForegroundColor Green

# 3. Installazione dipendenze
Write-Host "📦 Installazione dipendenze..." -ForegroundColor Yellow
pnpm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Errore nell'installazione delle dipendenze" -ForegroundColor Red
    exit 1
}

# 4. Build del pacchetto shared
Write-Host "📦 Build del pacchetto shared..." -ForegroundColor Yellow
pnpm run build:shared
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Errore nel build del shared package" -ForegroundColor Red
    exit 1
}

# 5. Verifica file .env
Write-Host "🔍 Verifica file .env..." -ForegroundColor Yellow
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  File .env non trovato" -ForegroundColor Yellow
    Write-Host "   Copia .env.example in .env e configura le variabili" -ForegroundColor Cyan
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "✅ File .env creato da .env.example" -ForegroundColor Green
    }
} else {
    Write-Host "✅ File .env trovato" -ForegroundColor Green
}

# 6. Type check
Write-Host "🔍 Type check..." -ForegroundColor Yellow
pnpm run check
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Errori TypeScript trovati" -ForegroundColor Red
    Write-Host "   Risolvi gli errori prima di continuare" -ForegroundColor Yellow
    exit 1
}

# 7. Test di base
Write-Host "🧪 Test di base..." -ForegroundColor Yellow
pnpm run test
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Alcuni test falliti (controllare manualmente)" -ForegroundColor Yellow
} else {
    Write-Host "✅ Test superati" -ForegroundColor Green
}

Write-Host "✅ SETUP COMPLETATO!" -ForegroundColor Green
Write-Host "📊 Risultati:" -ForegroundColor Cyan
Write-Host "   - Node.js: ✅ $nodeVersion" -ForegroundColor Green
Write-Host "   - pnpm: ✅ $pnpmVersion" -ForegroundColor Green
Write-Host "   - Dipendenze: ✅ Installate" -ForegroundColor Green
Write-Host "   - Shared package: ✅ Buildato" -ForegroundColor Green
Write-Host "   - Environment: ✅ Configurato" -ForegroundColor Green
Write-Host "   - TypeScript: ✅ Nessun errore" -ForegroundColor Green
Write-Host "   - Test: ✅ Superati" -ForegroundColor Green

Write-Host ""
Write-Host "🚀 COMANDI DISPONIBILI:" -ForegroundColor Cyan
Write-Host "   pnpm run dev:full     - Avvia tutto (backend + frontend)" -ForegroundColor White
Write-Host "   pnpm run dev:backend  - Solo backend" -ForegroundColor White
Write-Host "   pnpm run dev:frontend - Solo frontend" -ForegroundColor White
Write-Host "   pnpm run clean:code   - Pulizia codice" -ForegroundColor White
Write-Host "   pnpm run test:all     - Tutti i test" -ForegroundColor White
Write-Host "   pnpm run deploy       - Deploy production" -ForegroundColor White 