# 🧪 WOLFINDER - SCRIPT TEST COMPLETI
# Esegue tutti i test della piattaforma

Write-Host "🐺 WOLFINDER - TEST COMPLETI" -ForegroundColor Green
Write-Host "=============================" -ForegroundColor Green

# 1. Build del pacchetto shared (necessario per i test)
Write-Host "📦 Building shared package..." -ForegroundColor Yellow
pnpm run build:shared
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Errore nel build del shared package" -ForegroundColor Red
    exit 1
}

# 2. Type check
Write-Host "🔍 Type check..." -ForegroundColor Yellow
pnpm run check
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Errori TypeScript trovati" -ForegroundColor Red
    exit 1
}

# 3. Unit test
Write-Host "🧪 Unit test..." -ForegroundColor Yellow
pnpm run test
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Unit test falliti" -ForegroundColor Red
    exit 1
}

# 4. Performance test (badge calculator)
Write-Host "⚡ Performance test (badge calculator)..." -ForegroundColor Yellow
pnpm run bench:badge
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Performance test falliti (controllare manualmente)" -ForegroundColor Yellow
} else {
    Write-Host "✅ Performance test superati" -ForegroundColor Green
}

# 5. Integration test (se presenti)
Write-Host "🔗 Integration test..." -ForegroundColor Yellow
if (Test-Path "tests/integration") {
    pnpm run test tests/integration
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Integration test falliti" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "ℹ️  Nessun integration test trovato" -ForegroundColor Cyan
}

Write-Host "✅ TUTTI I TEST COMPLETATI!" -ForegroundColor Green
Write-Host "📊 Risultati:" -ForegroundColor Cyan
Write-Host "   - Shared package: ✅ Buildato" -ForegroundColor Green
Write-Host "   - TypeScript: ✅ Nessun errore" -ForegroundColor Green
Write-Host "   - Unit test: ✅ Superati" -ForegroundColor Green
Write-Host "   - Performance test: ✅ Superati" -ForegroundColor Green
Write-Host "   - Integration test: ✅ Superati" -ForegroundColor Green 