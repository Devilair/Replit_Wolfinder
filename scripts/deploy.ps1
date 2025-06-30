# 🚀 WOLFINDER - SCRIPT DEPLOY
# Esegue il deploy completo della piattaforma

Write-Host "🐺 WOLFINDER - DEPLOY PRODUCTION" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green

# 1. Verifica ambiente
Write-Host "🔍 Verifica ambiente..." -ForegroundColor Yellow
if (-not (Test-Path ".env")) {
    Write-Host "❌ File .env non trovato!" -ForegroundColor Red
    Write-Host "   Crea il file .env con le variabili di produzione" -ForegroundColor Yellow
    exit 1
}

# 2. Build del pacchetto shared
Write-Host "📦 Building shared package..." -ForegroundColor Yellow
pnpm run build:shared
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Errore nel build del shared package" -ForegroundColor Red
    exit 1
}

# 3. Type check
Write-Host "🔍 Type check..." -ForegroundColor Yellow
pnpm run check
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Errori TypeScript trovati" -ForegroundColor Red
    exit 1
}

# 4. Test completi
Write-Host "🧪 Esecuzione test..." -ForegroundColor Yellow
pnpm run test
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Test falliti" -ForegroundColor Red
    exit 1
}

# 5. Build completo
Write-Host "🏗️  Build completo..." -ForegroundColor Yellow
pnpm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Errore nel build" -ForegroundColor Red
    exit 1
}

# 6. Verifica file di build
Write-Host "📁 Verifica file di build..." -ForegroundColor Yellow
if (-not (Test-Path "dist")) {
    Write-Host "❌ Cartella dist non trovata" -ForegroundColor Red
    exit 1
}

# 7. Avvio produzione
Write-Host "🚀 Avvio in modalità produzione..." -ForegroundColor Yellow
Write-Host "   Server disponibile su: http://localhost:8080" -ForegroundColor Cyan
Write-Host "   Premi Ctrl+C per fermare il server" -ForegroundColor Yellow

pnpm run start

Write-Host "✅ DEPLOY COMPLETATO!" -ForegroundColor Green
Write-Host "📊 Risultati:" -ForegroundColor Cyan
Write-Host "   - Ambiente: ✅ Verificato" -ForegroundColor Green
Write-Host "   - Shared package: ✅ Buildato" -ForegroundColor Green
Write-Host "   - TypeScript: ✅ Nessun errore" -ForegroundColor Green
Write-Host "   - Test: ✅ Superati" -ForegroundColor Green
Write-Host "   - Build: ✅ Completato" -ForegroundColor Green
Write-Host "   - Server: ✅ Avviato" -ForegroundColor Green 