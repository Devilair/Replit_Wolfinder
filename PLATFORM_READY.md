# 🐺 Wolfinder Platform - READY FOR DEVELOPMENT

## ✅ Stato Attuale
La piattaforma è ora **completamente funzionante** con:
- ✅ **pnpm workspaces** configurati correttamente
- ✅ **Frontend** (React + Vite) su `http://localhost:5173`
- ✅ **Backend** (Express + TypeScript) su `http://localhost:8080`
- ✅ **Shared package** (`@wolfinder/shared`) linkato correttamente
- ✅ **Tutti gli import** aggiornati e funzionanti

## 🚀 Avvio Rapido

### Opzione 1: Script Automatico (Raccomandato)
```bash
# Windows Batch
start-platform.bat

# Windows PowerShell
.\start-platform.ps1
```

### Opzione 2: Comandi Manuali
```bash
# Terminal 1: Backend
pnpm run dev:backend

# Terminal 2: Frontend  
pnpm run dev:frontend
```

### Opzione 3: Tutto in uno
```bash
pnpm run dev:full
```

## 📁 Struttura del Progetto

```
Replit_Wolfinder/
├── client/                 # Frontend React + Vite
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
├── server/                 # Backend Express + TypeScript
│   ├── routes/
│   ├── storage.ts
│   └── index.ts
├── packages/
│   └── shared/            # Pacchetto condiviso
│       ├── src/
│       ├── dist/
│       └── package.json
├── pnpm-workspace.yaml    # Configurazione workspace
└── package.json           # Root package.json
```

## 🔧 Comandi Utili

```bash
# Build del pacchetto shared
pnpm run build:shared

# Avvio solo backend
pnpm run dev:backend

# Avvio solo frontend
pnpm run dev:frontend

# Avvio completo
pnpm run dev:full

# Type check
pnpm run check

# Test
pnpm run test
```

## 🌐 Endpoints Disponibili

### Frontend
- **URL**: http://localhost:5173
- **Framework**: React + Vite
- **UI**: Radix UI + Tailwind CSS

### Backend
- **URL**: http://localhost:8080
- **Health Check**: http://localhost:8080/api/health
- **Framework**: Express + TypeScript
- **Database**: PostgreSQL + Drizzle ORM

## 📦 Pacchetto Shared

Il pacchetto `@wolfinder/shared` contiene:
- **Schema database** (Drizzle ORM)
- **Zod schemas** per validazione
- **Tipi TypeScript** condivisi
- **Utility functions** comuni

### Import nel Frontend
```typescript
import { professionalRegistrationSchema } from "@wolfinder/shared";
```

### Import nel Backend
```typescript
import { professionals, reviews } from "@wolfinder/shared";
```

## 🔄 Workflow di Sviluppo

1. **Modifica codice** in `client/` o `server/`
2. **Modifica schemi** in `packages/shared/src/`
3. **Build shared**: `pnpm run build:shared`
4. **Riavvia server** se necessario

## 🛠️ Risoluzione Problemi

### Porta 5000 occupata
Il backend ora usa la porta 8080 di default. Se necessario, imposta:
```bash
set PORT=8080
```

### Import non risolti
Assicurati che:
1. Il pacchetto shared sia buildato: `pnpm run build:shared`
2. Gli import usino `@wolfinder/shared` (non `@shared/`)

### Workspace non linkato
```bash
pnpm install
pnpm -F @wolfinder/shared build
```

## 🎯 Prossimi Passi

La piattaforma è **pronta per lo sviluppo**! Puoi:
- ✅ Aggiungere nuove funzionalità
- ✅ Modificare l'UI
- ✅ Espandere l'API
- ✅ Aggiungere test
- ✅ Deployare in produzione

## 📞 Supporto

Per problemi o domande:
1. Verifica che tutti i workspace siano linkati: `pnpm install`
2. Ricostruisci shared: `pnpm run build:shared`
3. Controlla i log dei server per errori specifici

---

**🎉 La piattaforma Wolfinder è ora stabile e pronta per nuovi sviluppi!** 