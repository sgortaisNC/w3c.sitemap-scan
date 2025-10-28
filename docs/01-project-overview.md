# Project Overview - Sitemap W3C Validator SaaS

## Concept
- Micro-SaaS web qui scanne un sitemap XML, valide toutes ses URLs via le W3C HTML/CSS checker et génère un rapport d’erreurs.
- Accès par crédits (1 scan = 1 crédit), utilisateurs via compte/authentification.

## Objectifs
- Offrir un outil simple et rapide pour vérifier la conformité technique d’un site web.
- Monétisation par packs de crédits ou abonnement récurrent.

## Stack technique
- Frontend : SvelteKit (TypeScript, Vite)
- Backend : Hono.js en Node.js
- Base de données : PostgreSQL (modèles utilisateurs, scans, crédits, résultats)
- Authentification : JWT
- Queue : BullMQ pour gestion des jobs de scan asynchrones.
- API externe : W3C Validator public API

## Flux utilisateur
1. Inscription / Connexion
2. Ajout d’URL sitemap
3. Scan W3C lancé → rapports reçus
4. Consultation historique, gestion crédits

## Cibles
- Freelances
- Petites agences web
- Développeurs indépendants
- Utilisateurs SEO
