# Database Schema & Models

## Tables

### users
| Field         | Type         | Description
|---------------|-------------|----------------
| id            | SERIAL PK    | ID unique
| email         | VARCHAR(255) | Email utilisateur
| hash_password | VARCHAR(255) | Mot de passe hashé
| created_at    | TIMESTAMP    | Date de création

### credits
| Field         | Type         | Description
| id            | SERIAL PK    | ID unique
| user_id       | INT FK       | Reference user
| amount        | INT          | Nbr de crédits courants
| updated_at    | TIMESTAMP    | Date mise à jour

### scans
| Field         | Type         | Description
| id            | SERIAL PK    | ID scan
| user_id       | INT FK       | Qui lance le scan
| sitemap_url   | TEXT         | URL du sitemap
| started_at    | TIMESTAMP    | Début scan
| finished_at   | TIMESTAMP    | Fin scan
| status        | VARCHAR(30)  | success/failed/pending

### scan_results
| Field         | Type         | Description
| id            | SERIAL PK    | ID résultat
| scan_id       | INT FK       | Scan d’origine
| url           | TEXT         | URL scannée
| errors        | JSON         | Erreurs W3C
| warnings      | JSON         | Avertissements W3C
| checked_at    | TIMESTAMP    | Date check

## Relations
- Un user → plusieurs scans, un scan → plusieurs résultats
- Les crédits sont liés à l’utilisateur uniquement

## Migrations
- Utilise Prisma migrations (`npx prisma migrate dev`)
