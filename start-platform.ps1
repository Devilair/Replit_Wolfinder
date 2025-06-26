Write-Host "Avvio della piattaforma Wolfinder..." -ForegroundColor Green
Write-Host ""

Write-Host "Avvio del backend sulla porta 8080..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$env:PORT=8080; pnpm run dev" -WindowStyle Normal

Write-Host "Attendo 3 secondi per l'avvio del backend..." -ForegroundColor Cyan
Start-Sleep 3

Write-Host "Avvio del frontend sulla porta 5173..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "pnpm -F wolfinder-client dev" -WindowStyle Normal

Write-Host ""
Write-Host "Piattaforma avviata!" -ForegroundColor Green
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "Backend:  http://localhost:8080" -ForegroundColor Cyan
Write-Host ""
Write-Host "Premi CTRL+C per chiudere questo script." -ForegroundColor Yellow

try {
    while ($true) {
        Start-Sleep 1
    }
} catch {
    Write-Host "Script terminato." -ForegroundColor Red
} 