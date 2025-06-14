# Workflow di Verifica Documenti - Riepilogo Completo

## 1. APPROVAZIONE DOCUMENTO

### Processo Admin:
1. Admin va su "Documenti in verifica"
2. Clicca "Approva" su un documento
3. Sistema esegue:
   - Aggiorna status documento: `pending` → `approved`
   - Controlla documenti professionista per determinare status generale
   - Aggiorna status professionista basato su documenti approvati:
     * 1+ documento richiesto approvato → `approved` (Verificato)
     * Tutti e 4 documenti approvati → `approved` + `isPremium: true` (Verificato PLUS)

### Notifiche:
- Crea notifica nel database
- Invia email al professionista
- Messaggi personalizzati:
  * Standard: "Il tuo profilo è stato verificato con successo"
  * PLUS: "Congratulazioni! Il tuo profilo ha ottenuto la verifica PLUS"

### Status Badge Dashboard:
- `not_verified` → `verified` (badge verde ✓ Verificato)
- `not_verified` → `verified_plus` (badge viola ✓ Verificato PLUS)

## 2. RIFIUTO DOCUMENTO

### Processo Admin:
1. Admin clicca "Rifiuta" con note opzionali
2. Sistema esegue:
   - Aggiorna status documento: `pending` → `rejected`
   - Aggiorna status professionista: `rejected`

### Notifiche:
- Crea notifica con motivo rifiuto
- Invia email con dettagli: "Il documento [tipo] è stato rigettato. Motivo: [note]"

### Status Badge Dashboard:
- Qualsiasi status → `rejected` (badge rosso ✗ Rigettato)
- Messaggio: "Documenti non validi, riprova"

## 3. DASHBOARD PROFESSIONISTA

### Visualizzazione Status:
```
not_verified: Badge grigio "In attesa" - "Carica i documenti per verificare"
pending: Badge giallo "In verifica" - "Documento in revisione, ~24h"
verified: Badge verde "✓ Verificato" 
verified_plus: Badge viola "✓ Verificato PLUS"
rejected: Badge rosso "✗ Rigettato" - "Documenti non validi, riprova"
```

### Logica Status:
- Usa `isVerified` e `verificationStatus` dal database
- Se `isVerified = true` → mostra "Verificato"
- Se `isPremium = true` → mostra "Verificato PLUS"
- Altrimenti usa `verificationStatus`

## 4. ENDPOINT API

### Admin:
- `GET /api/admin/verification-documents/pending` - Lista documenti pending
- `POST /api/admin/verification-documents/:id/verify` - Approva/rifiuta

### Professional:
- `GET /api/professional/notifications` - Lista notifiche
- `POST /api/professional/notifications/:id/read` - Segna come letta

## 5. SISTEMA NOTIFICHE

### Database:
- Tabella `notifications` con tracking completo
- Campi: professionalId, type, title, message, read, createdAt

### Email Integration:
- SendGrid configurato (SENDGRID_API_KEY disponibile)
- Template personalizzati per approvazione/rifiuto
- Logging per debug

## 6. DOCUMENTAZIONE STATUS

### Stati Possibili:
- `not_verified`: Iniziale, nessun documento caricato
- `pending`: Documenti in revisione
- `approved`/`verified`: Verificato standard (1+ documento)
- `verified_plus`: Verificato PLUS (tutti 4 documenti)
- `rejected`: Documenti rifiutati

### Documenti Richiesti:
- **Standard** (per verification): identity, albo, vat_fiscal (1+ richiesto)
- **PLUS** (per premium): tutti e 4 incluso qualifications

## STATUS: ✅ WORKFLOW COMPLETO E FUNZIONANTE