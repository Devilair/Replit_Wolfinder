@echo off
REM Script per avviare Wolfinder backend su Windows e loggare gli errori

echo Impostazione delle variabili d'ambiente...
REM Imposta le variabili d'ambiente
set NODE_ENV=development
set PORT=5000
set JWT_SECRET=dev-secret-key
set DATABASE_URL=file:./dev.db
set STRIPE_SECRET_KEY=sk_test_dummy_key_for_local_dev

echo.
echo Avvio del server backend e scrittura del log su 'server-log.txt'...
REM Avvia il server e reindirizza tutto l'output (normale e di errore) su un file di log.
npx tsx server/index.ts > server-log.txt 2>&1

echo.
echo Il processo del server e' terminato. Controlla il file 'server-log.txt' per eventuali errori.
pause 