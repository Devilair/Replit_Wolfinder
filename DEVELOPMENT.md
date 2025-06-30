# 🐺 WOLFINDER - GUIDA SVILUPPO STANDARDIZZATA

*Guida completa per lo sviluppo della piattaforma Wolfinder*

---

## 🚀 **COMANDI STANDARDIZZATI (SEMPRE USARE)**

### **Sviluppo**
```powershell
# ✅ CORRETTO - Avvia tutto (backend + frontend)
pnpm run dev:full

# ✅ CORRETTO - Solo backend (porta 8080)
pnpm run dev:backend

# ✅ CORRETTO - Solo frontend (porta 5173)
pnpm run dev:frontend

# ❌ SBAGLIATO - Non usare mai
npm run dev
&& (non funziona in PowerShell)
```

### **Qualità Codice**
```powershell
# ✅ CORRETTO - Pulizia completa del codice
pnpm run clean:code

# ✅ CORRETTO - Type check
pnpm run check

# ✅ CORRETTO - ESLint con fix automatico
pnpm run lint

# ❌ SBAGLIATO - Non usare mai
npm run lint
cd client && pnpm lint
```

### **Test**
```powershell
# ✅ CORRETTO - Tutti i test
pnpm run test:all

# ✅ CORRETTO - Unit test
pnpm run test

# ✅ CORRETTO - Performance test (badge calculator)
pnpm run bench:badge

# ❌ SBAGLIATO - Non usare mai
npm test
cd tests && pnpm test
```

### **Build e Deploy**
```powershell
# ✅ CORRETTO - Build shared package
pnpm run build:shared

# ✅ CORRETTO - Build completo
pnpm run build

# ✅ CORRETTO - Deploy production
pnpm run deploy

# ❌ SBAGLIATO - Non usare mai
npm run build
cd packages/shared && pnpm build
```

### **Setup Ambiente**
```powershell
# ✅ CORRETTO - Setup completo ambiente
pnpm run setup

# ✅ CORRETTO - Installazione dipendenze
pnpm install

# ❌ SBAGLIATO - Non usare mai
npm install
yarn install
```

---

## 📁 **STRUTTURA WORKSPACE**

### **Monorepo pnpm**
```
Replit_Wolfinder/
├── client/                 # Frontend React + Vite
│   ├── src/
│   ├── package.json        # wolfinder-client
│   └── vite.config.ts
├── server/                 # Backend Express + TypeScript
│   ├── routes/
│   ├── storage.ts
│   └── index.ts
├── packages/
│   └── shared/            # Pacchetto condiviso
│       ├── src/
│       ├── dist/
│       └── package.json   # @wolfinder/shared
├── scripts/               # Script PowerShell standardizzati
│   ├── clean-code.ps1
│   ├── test-all.ps1
│   ├── deploy.ps1
│   └── dev-setup.ps1
├── pnpm-workspace.yaml    # Configurazione workspace
└── package.json           # Root package.json
```

### **Comandi Workspace (Filtri pnpm)**
```powershell
# ✅ CORRETTO - Filtri workspace
pnpm -F wolfinder-client dev
pnpm -F @wolfinder/shared build
pnpm -F wolfinder-client lint

# ❌ SBAGLIATO - Non usare mai
cd client && pnpm dev
cd packages/shared && pnpm build
```

---

## 🔧 **SCRIPT AUTOMATICI**

### **1. Setup Ambiente (`pnpm run setup`)**
Esegue automaticamente:
- ✅ Verifica Node.js e pnpm
- ✅ Installazione dipendenze
- ✅ Build shared package
- ✅ Configurazione .env
- ✅ Type check
- ✅ Test di base

### **2. Pulizia Codice (`pnpm run clean:code`)**
Esegue automaticamente:
- ✅ Build shared package
- ✅ Type check
- ✅ ESLint con fix automatico
- ✅ Build completo
- ✅ Report risultati

### **3. Test Completi (`pnpm run test:all`)**
Esegue automaticamente:
- ✅ Build shared package
- ✅ Type check
- ✅ Unit test
- ✅ Performance test
- ✅ Integration test
- ✅ Report risultati

### **4. Deploy (`pnpm run deploy`)**
Esegue automaticamente:
- ✅ Verifica ambiente
- ✅ Build shared package
- ✅ Type check
- ✅ Test completi
- ✅ Build completo
- ✅ Avvio produzione

---

## 🌐 **ENDPOINTS E PORTE**

### **Sviluppo**
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:8080
- **Health Check**: http://localhost:8080/api/health

### **Produzione**
- **Server**: http://localhost:8080 (configurabile via PORT)

---

## 📦 **PACCHETTO SHARED**

### **Import nel Frontend**
```typescript
// ✅ CORRETTO
import { professionalRegistrationSchema } from "@wolfinder/shared";
import { getProfessionalFeatures } from "@wolfinder/shared/subscription-features";

// ❌ SBAGLIATO
import { schema } from "../packages/shared/src/schema";
```

### **Import nel Backend**
```typescript
// ✅ CORRETTO
import { professionals, reviews } from "@wolfinder/shared";
import { db } from "@wolfinder/shared";

// ❌ SBAGLIATO
import { professionals } from "../packages/shared/src/schema";
```

### **Build del Shared Package**
```powershell
# ✅ CORRETTO - Build shared
pnpm run build:shared

# ✅ CORRETTO - Build con watch
pnpm -F @wolfinder/shared dev

# ❌ SBAGLIATO - Non usare mai
cd packages/shared && pnpm build
```

---

## 🛠️ **RISOLUZIONE PROBLEMI**

### **Porta 8080 occupata**
```powershell
# ✅ CORRETTO - Cambia porta
$env:PORT=3000; pnpm run dev:backend

# ❌ SBAGLIATO - Non usare mai
set PORT=3000 && pnpm run dev
```

### **Import non risolti**
```powershell
# ✅ CORRETTO - Ricostruisci shared
pnpm run build:shared
pnpm run check

# ❌ SBAGLIATO - Non usare mai
cd packages/shared && pnpm build
```

### **Workspace non linkato**
```powershell
# ✅ CORRETTO - Reinstalla tutto
pnpm install
pnpm run build:shared

# ❌ SBAGLIATO - Non usare mai
npm install
yarn install
```

### **Errori TypeScript**
```powershell
# ✅ CORRETTO - Controlla e risolvi
pnpm run check
pnpm run clean:code

# ❌ SBAGLIATO - Non usare mai
tsc --noEmit
```

---

## 🎯 **WORKFLOW DI SVILUPPO**

### **1. Setup Iniziale**
```powershell
# Prima volta o dopo pull
pnpm run setup
```

### **2. Sviluppo Quotidiano**
```powershell
# Avvia ambiente sviluppo
pnpm run dev:full

# In un altro terminale, pulisci codice
pnpm run clean:code
```

### **3. Prima del Commit**
```powershell
# Testa tutto
pnpm run test:all
pnpm run clean:code
```

### **4. Deploy**
```powershell
# Deploy production
pnpm run deploy
```

---

## 📊 **METRICHE DI QUALITÀ**

### **Target**
- **TypeScript**: 0 errori
- **ESLint**: < 50 warning
- **Test Coverage**: > 80%
- **Performance**: < 200ms API response

### **Comandi di Verifica**
```powershell
# Verifica qualità
pnpm run clean:code

# Verifica test
pnpm run test:all

# Verifica performance
pnpm run bench:badge
```

---

## 🚨 **COMANDI VIETATI**

### **Non usare mai questi comandi**
```powershell
# ❌ VIETATO
npm run dev
npm install
yarn install
&& (operatore bash)
cd client && pnpm dev
cd packages/shared && pnpm build
tsc --noEmit
```

### **Sempre usare questi comandi**
```powershell
# ✅ SEMPRE USARE
pnpm run dev:full
pnpm install
pnpm run build:shared
pnpm run clean:code
pnpm run test:all
pnpm run deploy
```

---

## 📞 **SUPPORTO**

### **Problemi Comuni**
1. **Import non risolti**: `pnpm run build:shared`
2. **Errori TypeScript**: `pnpm run clean:code`
3. **Test falliti**: `pnpm run test:all`
4. **Build fallito**: `pnpm run setup`

### **Log e Debug**
- **Frontend**: Controlla console browser
- **Backend**: Controlla terminale server
- **Database**: Controlla log PostgreSQL
- **Build**: Controlla output TypeScript

---

**🎉 Con questa guida, lo sviluppo di Wolfinder sarà sempre standardizzato e senza errori!** 