# Hosting Guide – SvelteKit + Hono.js

## Objectif

Fournir les instructions pour héberger ton projet SaaS utilisant SvelteKit en frontend, Hono.js pour le backend et PostgreSQL pour la base de données.

## Hébergement du frontend – SvelteKit

### Recommandation principale : Vercel

**Avantages :**
- Déploiement automatique depuis GitHub/GitLab
- Support complet du SSR et de l'adaptateur officiel @sveltejs/adapter-vercel
- CDN mondial, HTTPS auto, et builds optimisés
- Niveau gratuit adapté pour ton MVP

**Installation et configuration :**

```bash
npm i -D @sveltejs/adapter-vercel
```

**svelte.config.js :**

```javascript
import adapter from '@sveltejs/adapter-vercel';

export default {
  kit: {
    adapter: adapter({
      runtime: 'nodejs20.x'
    })
  }
};
```

**Déploiement :**

```bash
npm i -g vercel
vercel
vercel deploy
```

### Alternative : Netlify

```bash
npm i -D @sveltejs/adapter-netlify
```

```javascript
import adapter from '@sveltejs/adapter-netlify';

export default {
  kit: {
    adapter: adapter()
  }
};
```

## Hébergement du backend – Hono.js

### Plateformes compatibles :

1. **Render** (hébergement simple, support Node natif)
2. **Railway.app** (héberge backend et DB ensemble)
3. **Cloudflare Workers** (idéal car Hono tourne nativement dessus)
4. **Fly.io** (multi‑région, Docker‑ready)

### Configuration Hono.js

**Production-ready server :**

```typescript
import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';

const app = new Hono();

app.use('*', cors());
app.use('*', logger());

app.get('/', (c) => c.text('W3C Checker API up and running!'));

const port = parseInt(process.env.PORT || '3000');
console.log(`Server is running on port ${port}`);
serve({ fetch: app.fetch, port });
```

### Dockerfile pour déploiement

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci --only=production
RUN npx prisma generate

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

### Configuration Render

**Build Command :**
```bash
npm install && npx prisma generate && npm run build
```

**Start Command :**
```bash
npm start
```

### Configuration Railway

**Variables d'environnement requises :**
```env
DATABASE_URL=postgresql://user:password@db:5432/w3c_checker
JWT_SECRET=your-super-secret-jwt-key
W3C_VALIDATOR_URL=https://validator.w3.org/nu/
REDIS_URL=redis://redis:6379
PORT=3000
NODE_ENV=production
```

## Hébergement de la base PostgreSQL

| Service | Avantages | Plan gratuit |
|---------|-----------|--------------|
| **Neon.tech** | Postgres serverless, mise en veille auto, connexion rapide | Gratuit jusqu'à 3 Go |
| **Supabase** | Postgres + Auth + API REST intégrée | Gratuit jusqu'à 500 Mo |
| **Render Postgres** | Facile à lier à ton backend Render | Gratuit (base petite) |
| **Railway PostgreSQL** | Intégration native avec Railway | Gratuit avec limitations |

### Configuration Prisma pour production

**prisma/schema.prisma :**
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

**Script de déploiement :**
```bash
npx prisma db push
npx prisma db seed
```

## Configuration Redis (pour BullMQ)

### Options d'hébergement Redis :

1. **Upstash** - Redis serverless (gratuit jusqu'à 10K requêtes/jour)
2. **Railway Redis** - Intégré avec Railway
3. **Redis Cloud** - Service managé Redis Labs

**Variables d'environnement :**
```env
REDIS_URL=redis://user:password@redis-host:6379
```

## Architecture recommandée

```
Frontend  → Vercel (SvelteKit)
Backend   → Render ou Railway (Hono.js)
Database  → Neon.tech ou Supabase (PostgreSQL)
Queue     → Upstash (Redis)
```

**Avantages :**
- Séparation des services = sécurité et performance accrues
- CI/CD automatique sur git push via Vercel et Render
- Scaling indépendant de chaque composant

## Coûts estimés par phase

| Usage | Plateformes | Coût mensuel approx. |
|-------|-------------|---------------------|
| **Dév local** | Docker + Neon | 0 € |
| **MVP déployé** | Vercel + Render + Neon | 0 – 5 € |
| **Scalabilité moyenne** | Vercel Pro + Render + Neon Pro | 25 € |
| **Production** | VPS dédié + PostgreSQL managé | 50 €+ |

## Configuration Docker Compose (développement)

**docker-compose.yml :**
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_USER: w3c_user
      POSTGRES_PASSWORD: w3c_pass
      POSTGRES_DB: w3c_checker
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  backend:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://w3c_user:w3c_pass@postgres:5432/w3c_checker
      REDIS_URL: redis://redis:6379
    depends_on:
      - postgres
      - redis

volumes:
  postgres_data:
```

## Bonnes pratiques de déploiement

### Sécurité
- Ne jamais commit de fichier `.env`
- Utiliser des variables d'environnement pour tous les secrets
- Sécuriser les headers HTTP avec middleware Hono
- Implémenter rate limiting sur les endpoints publics

### Monitoring
- Configurer un monitoring uptime (UptimeRobot, Healthchecks.io)
- Logs centralisés avec Winston
- Alertes email/Slack pour les erreurs critiques

### Base de données
- Backup automatique PostgreSQL (Neon, Supabase)
- Migrations Prisma versionnées
- Index sur les colonnes fréquemment requêtées

### Performance
- Cache Redis pour les résultats de scan
- Compression gzip sur les réponses API
- CDN pour les assets statiques (via Vercel)

## Variables d'environnement complètes

**Backend (.env) :**
```env
# Database
DATABASE_URL=postgresql://user:password@db.neon.tech:5432/w3c_checker

# Authentication
JWT_SECRET=your-super-secure-jwt-secret-key
JWT_EXPIRES_IN=7d

# External APIs
W3C_VALIDATOR_URL=https://validator.w3.org/nu/

# Queue
REDIS_URL=redis://user:password@redis-host:6379

# Server
PORT=3000
NODE_ENV=production

# Logging
LOG_LEVEL=info
```

**Frontend (.env) :**
```env
VITE_API_BASE_URL=https://your-backend.render.com
VITE_APP_NAME=W3C Sitemap Validator
```

## Résumé rapide

| Composant | Plateforme recommandée | Raisons |
|-----------|------------------------|---------|
| **Frontend** | Vercel | Support SSR natif pour SvelteKit |
| **Backend** | Render ou Railway | Facilité de déploiement Hono.js |
| **Base de données** | Neon.tech | PostgreSQL serverless et rapide |
| **Queue/Cache** | Upstash | Redis serverless pour BullMQ |
| **Option all‑in‑one** | Railway.app | Héberge backend + DB + Redis ensemble |

## Scripts de déploiement automatisé

**deploy.sh :**
```bash
#!/bin/bash

echo "🚀 Deploying W3C Checker..."

# Frontend deployment
echo "📦 Building and deploying frontend..."
cd frontend
npm run build
vercel deploy --prod

# Backend deployment
echo "🔧 Deploying backend..."
cd ../backend
git push render main

echo "✅ Deployment completed!"
```

**Commandes utiles :**
```bash
# Logs production
vercel logs
render logs

# Base de données
npx prisma studio
npx prisma db push --preview-feature

# Tests avant déploiement
npm run test
npm run lint
npm run type-check
```
