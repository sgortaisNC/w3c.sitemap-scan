# Technical Stack & Dependencies

## Frontend (SvelteKit)
- SvelteKit + TypeScript
- TailwindCSS (UI rapide en MVP)
- Pinia (state management si besoin)
- Axios ou fetch natif pour requêtes API backend

## Backend (Hola.js / Hono)
- Hola.js (Node.js, TypeScript)
- Zod (validation données)
- cors (CORS middleware)
- BullMQ (gestion async des tâches)
- jsonwebtoken (JWT pour auth)
- bcrypt (hasher les mots de passe)
- pg (PostgreSQL driver)
- node-fetch (fetch côté serveur vers W3C API)

## Database
- PostgreSQL 16+
- Prisma ORM ou SQL natif
- Tables : users, credits, scans, scan_results

## Environnement local
- docker-compose.yml (DB + backend à lancer rapidement)
- .env pour les secrets et configs

## API externes
- W3C Validator `https://validator.w3.org/nu/` (format JSON, méthode POST)
