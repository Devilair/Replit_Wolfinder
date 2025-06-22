@echo off
echo Eseguo 'npm install' per la cartella 'client'. Potrebbe richiedere alcuni minuti...
echo.
call npm install --prefix client

echo.
echo Avvio il frontend con 'npm run dev:client'...
echo.
call npm run dev:client

echo.
echo Lo script e' terminato. Premi un tasto per chiudere questa finestra.
pause 