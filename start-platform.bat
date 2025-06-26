@echo off
echo Avvio della piattaforma Wolfinder...
echo.

echo Avvio del backend sulla porta 8080...
start "Backend" cmd /k "set PORT=8080 && pnpm run dev"

echo Attendo 3 secondi per l'avvio del backend...
timeout /t 3 /nobreak > nul

echo Avvio del frontend sulla porta 5173...
start "Frontend" cmd /k "pnpm -F wolfinder-client dev"

echo.
echo Piattaforma avviata!
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:8080
echo.
echo Premi CTRL+C per chiudere questo script.
pause 