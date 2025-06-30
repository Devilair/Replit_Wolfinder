# WOLFINDER - SCRIPT PULIZIA CODICE
# Esegue tutti i controlli di qualità del codice

Write-Host "WOLFINDER - PULIZIA CODICE" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green

# 1. Build del pacchetto shared
Write-Host "Building shared package..." -ForegroundColor Yellow
pnpm run build:shared
if ($LASTEXITCODE -ne 0) {
    Write-Host "Errore nel build del shared package" -ForegroundColor Red
    exit 1
}

# 2. Type check
Write-Host "Type check..." -ForegroundColor Yellow
pnpm run check
if ($LASTEXITCODE -ne 0) {
    Write-Host "Errori TypeScript trovati" -ForegroundColor Red
    exit 1
}

# 3. ESLint con fix automatico
Write-Host "ESLint con fix automatico..." -ForegroundColor Yellow
pnpm run lint
if ($LASTEXITCODE -ne 0) {
    Write-Host "Warning ESLint trovati (alcuni potrebbero non essere fixabili automaticamente)" -ForegroundColor Yellow
} else {
    Write-Host "Nessun problema ESLint trovato" -ForegroundColor Green
}

# 4. Build completo per verificare
Write-Host "Build completo..." -ForegroundColor Yellow
pnpm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Errore nel build completo" -ForegroundColor Red
    exit 1
}

Write-Host "PULIZIA CODICE COMPLETATA!" -ForegroundColor Green
Write-Host "Risultati:" -ForegroundColor Cyan
Write-Host "   - Shared package: Buildato" -ForegroundColor Green
Write-Host "   - TypeScript: Nessun errore" -ForegroundColor Green
Write-Host "   - ESLint: Controllato" -ForegroundColor Green
Write-Host "   - Build: Completato" -ForegroundColor Green 