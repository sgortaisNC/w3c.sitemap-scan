# API Endpoints Documentation (Hola.js backend)

## Auth

- `POST /api/register`
    - email, password
    - Crée un compte, retourne JWT

- `POST /api/login`
    - email, password
    - Retoure JWT

## Credits

- `GET /api/credits`
    - Auth JWT
    - Retourne crédits disponibles

- `POST /api/credits/add`
    - Auth JWT
    - Ajoute crédits (simulé en local)

## Scans

- `POST /api/scan`
    - Auth JWT, sitemap_url
    - Démarre un scan (job async avec BullMQ)

- `GET /api/scans`
    - Auth JWT
    - Retourne historique scans de l’utilisateur

- `GET /api/scan/:id/results`
    - Auth JWT
    - Liste des résultats W3C du scan donné

## Utilitaires

- Tous les endpoints renvoient `{ success, data, error }` au format JSON.
- Les erreurs détaillées sont toujours renvoyées, pas de codes 500 muets.

## Authentification
- Les endpoints principaux nécessitent un header `Authorization: Bearer <JWT token>`
