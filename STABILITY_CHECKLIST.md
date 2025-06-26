# Wolfinder - Checklist Stabilità Core

## 🚨 OBBLIGATORIA: Testare dopo ogni fix prima del commit

### Server & Database
- [ ] Il server parte senza errori (`npm run dev`)
- [ ] Nessun errore TypeScript critico (`npm run check` - max 10 errori)
- [ ] Database connesso e risponde

### API Core
- [ ] Health check: `GET /api/health` → 200 OK
- [ ] Categorie: `GET /api/categories` → array non vuoto
- [ ] Ricerca professionisti: `GET /api/professionals/search?search=test` → array (anche vuoto)
- [ ] Featured professionals: `GET /api/professionals/featured` → array non vuoto
- [ ] Singolo professionista: `GET /api/professionals/1` → oggetto valido

### Frontend Core
- [ ] Landing page si carica senza errori console
- [ ] Pagina ricerca si carica e mostra professionisti
- [ ] Profilo professionista si apre (es: `/professionals/1`)
- [ ] Login page accessibile (`/login`)
- [ ] Admin login accessibile (`/admin-login`)

### Funzionalità Critiche
- [ ] Login utente funziona (se test account disponibile)
- [ ] Login admin funziona (se test account disponibile)
- [ ] Dashboard utente accessibile (se loggato)
- [ ] Dashboard admin accessibile (se loggato)
- [ ] Nessun errore JavaScript critico in console browser

### Performance Base
- [ ] API response time < 2 secondi
- [ ] Frontend si carica in < 5 secondi
- [ ] Nessun timeout su chiamate API

---

## 📝 Note
- **Se anche UN solo test fallisce**: NON committare, fixare prima
- **Se fix complesso**: fare rollback e riprovare con approccio più semplice
- **Aggiornare questa checklist** se si aggiungono feature core

---

## 🔧 Comandi Rapidi
```bash
# Test server
npm run dev

# Test TypeScript
npm run check

# Test API (PowerShell)
Invoke-WebRequest -Uri "http://localhost:5000/api/health" -UseBasicParsing
Invoke-WebRequest -Uri "http://localhost:5000/api/professionals/search?search=test" -UseBasicParsing
```

---

**Ultimo aggiornamento**: $(date)
**Stato attuale**: ⚠️ INSTABILE (159 errori TypeScript) 