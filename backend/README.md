# W3C Checker Backend - TypeScript

## 🏗️ Architecture

Backend robuste construit avec **TypeScript**, **Hono.js**, **PostgreSQL** et **BullMQ** pour le scanning asynchrone de sitemaps avec validation W3C.

## 🚀 Technologies

- **Runtime**: Node.js 20+
- **Framework**: Hono.js (ultra-rapide, type-safe)
- **Language**: TypeScript (100% typé)
- **Database**: PostgreSQL 16+ avec Prisma ORM
- **Queue**: BullMQ + Redis pour jobs asynchrones
- **Auth**: JWT + bcrypt
- **Validation**: Zod pour la validation runtime
- **Testing**: Jest avec TypeScript
- **Linting**: ESLint + TypeScript ESLint

## 📁 Structure du projet

```
backend/
├── src/
│   ├── config/          # Configuration et variables d'environnement
│   ├── controllers/     # Contrôleurs HTTP (Auth, Credits, Scans)
│   ├── middleware/      # Middlewares (Auth, Validation, Erreurs)
│   ├── services/        # Logique métier
│   ├── routes/          # Définition des routes API
│   ├── utils/           # Utilitaires (Logger, JWT, Validation)
│   ├── queues/          # Gestion des queues BullMQ
│   ├── types/           # Définitions TypeScript
│   ├── __tests__/       # Tests unitaires
│   └── app.ts           # Point d'entrée principal
├── prisma/
│   ├── schema.prisma    # Schéma de base de données
│   └── seed.ts          # Données de test
├── dist/                # Code JavaScript compilé
├── tsconfig.json        # Configuration TypeScript
└── package.json
```

## 🛠️ Installation et Développement

### Prérequis
- Node.js 20+
- PostgreSQL 16+
- Redis 6+
- npm ou yarn

### Installation

```bash
# Installer les dépendances
npm install

# Copier les variables d'environnement
cp .env.example .env

# Configurer la base de données
npm run db:generate
npm run db:migrate

# Ajouter des données de test
npm run db:seed
```

### Variables d'environnement

```env
NODE_ENV=development
PORT=3000
DATABASE_URL="postgresql://user:pass@localhost:5432/w3c_checker_dev"
JWT_SECRET="your-super-secret-jwt-key-minimum-32-characters-long"
REDIS_URL="redis://localhost:6379"
W3C_VALIDATOR_URL="https://validator.w3.org/nu/"
```

### Développement

```bash
# Mode développement avec hot reload
npm run dev

# Build TypeScript
npm run build

# Production
npm start

# Tests
npm test
npm run test:watch
npm run test:coverage

# Linting
npm run lint
npm run lint:fix

# Type checking
npm run type-check
```

## 📋 API Endpoints

### 🔐 Authentication (`/api/auth`)

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| POST | `/register` | Inscription utilisateur | ❌ |
| POST | `/login` | Connexion utilisateur | ❌ |
| GET | `/profile` | Profil utilisateur | ✅ |
| PUT | `/password` | Changer mot de passe | ✅ |
| POST | `/refresh` | Rafraîchir token | ✅ |

### 💳 Credits (`/api/credits`)

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/balance` | Solde crédits | ✅ |
| POST | `/add` | Ajouter crédits | ✅ |
| GET | `/history` | Historique crédits | ✅ |
| GET | `/packages` | Packages disponibles | ✅ |

### 🔍 Scans (`/api/scans`)

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| POST | `/` | Créer scan sitemap | ✅ |
| GET | `/` | Historique scans | ✅ |
| GET | `/:id` | Détails scan | ✅ |
| GET | `/:id/results` | Résultats scan | ✅ |
| GET | `/:id/status` | Statut temps réel | ✅ |
| DELETE | `/:id` | Supprimer scan | ✅ |

## 🔧 Architecture Technique

### Type Safety
- **100% TypeScript** avec types stricts
- **Zod** pour validation runtime
- **Prisma** pour types base de données
- **Interface cohérentes** dans `/src/types/`

### Authentification
- **JWT tokens** avec signature sécurisée
- **Middleware d'auth** avec vérification automatique
- **Rate limiting** par IP
- **Validation stricte** des entrées

### Gestion des Crédits
- **Système transactionnel** pour éviter la corruption
- **Vérification pré-scan** du solde
- **Remboursement automatique** en cas d'échec
- **Audit trail** des transactions

### Scanning Asynchrone
- **BullMQ + Redis** pour les jobs
- **Processing en arrière-plan** des sitemaps
- **Rate limiting W3C** (1 req/sec)
- **Retry automatique** en cas d'échec
- **Progress tracking** temps réel

### Base de Données
- **PostgreSQL** avec Prisma ORM
- **Migrations versionnées** pour déploiements
- **Relations optimisées** avec indexes
- **Seed data** pour développement

### Logging et Monitoring
- **Winston** pour logging structuré
- **Niveaux configurables** (debug, info, warn, error)
- **Rotation des logs** en production
- **Correlation IDs** pour tracing

## 🧪 Tests

```bash
# Tous les tests
npm test

# Tests avec coverage
npm run test:coverage

# Tests en mode watch
npm run test:watch

# Tests spécifiques
npm test -- auth.test.ts
```

### Types de Tests
- **Unit Tests**: Fonctions utilitaires (JWT, validation)
- **Integration Tests**: Services avec base de données
- **API Tests**: Endpoints complets
- **Queue Tests**: Jobs BullMQ

## 🚀 Déploiement

### Build Production
```bash
npm run build
npm start
```

### Variables Production
- `NODE_ENV=production`
- `DATABASE_URL` (PostgreSQL production)
- `REDIS_URL` (Redis production)
- `JWT_SECRET` (clé sécurisée)

### Docker Support
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist/ ./dist/
CMD ["node", "dist/app.js"]
```

## 📈 Performance

- **Hono.js**: Framework ultra-rapide (~4x Express)
- **TypeScript**: Zero-cost abstractions
- **Prisma**: Requêtes optimisées + connection pooling
- **BullMQ**: Processing parallèle des scans
- **Redis**: Cache haute performance

## 🛡️ Sécurité

- **Input validation** avec Zod
- **SQL injection** protection via Prisma
- **XSS protection** avec sanitization
- **Rate limiting** par endpoint
- **JWT secure** avec expiration
- **Password hashing** avec bcrypt (12 rounds)
- **CORS** configuré strictement

## 📊 Monitoring

### Logs Structurés
```typescript
logger.info('Scan completed', {
  scanId: 123,
  userId: 456,
  duration: 5000,
  urlCount: 25,
  errors: 2
});
```

### Métriques Disponibles
- Nombre de scans par statut
- Temps moyen de processing
- Consommation crédits par user
- Taux d'erreur W3C par domaine

## 🔄 Workflow Développement

1. **Feature branch** depuis `main`
2. **TypeScript strict** - pas de `any`
3. **Tests unitaires** obligatoires
4. **ESLint** sans warnings
5. **Type check** sans erreurs
6. **Pull Request** avec review

## 📚 Documentation API

Mode développement : `GET /api/auth/docs`, `/api/credits/docs`, `/api/scans/docs`

## 🐛 Debug

```bash
# Logs détaillés
LOG_LEVEL=debug npm run dev

# TypeScript compilation
npm run type-check

# Database state
npx prisma studio

# Queue monitoring
# Redis CLI: MONITOR
```
