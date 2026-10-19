# Plateforme ADET – Kolda

Plateforme web de l'**Association pour la promotion du Développement Économique Territorial (ADET)**, basée à Kolda (Sénégal) : découvrir le territoire, trouver des opportunités, se former et suivre les réalisations de l'association.

- Vision, arborescence et feuille de route : [`docs/vision-plateforme.md`](docs/vision-plateforme.md)
- Checklist des contenus à fournir : [`docs/contenus-a-collecter.md`](docs/contenus-a-collecter.md)
- Cadre stratégique source : [`docs/cadre-strategique-ADET.pdf`](docs/cadre-strategique-ADET.pdf)

## Stack
Next.js (App Router) avec Payload CMS 3 (back-office `/admin` en français) et PostgreSQL.

## Démarrer en local
Prérequis : Node.js ≥ 20, pnpm, Docker (ou un PostgreSQL local).

```bash
cd app
cp .env.example .env          # puis changer PAYLOAD_SECRET
docker compose up -d          # lance PostgreSQL (adet/adet)
pnpm install
pnpm dev
```

- Site : http://localhost:3000
- Back-office : http://localhost:3000/admin (le premier compte créé devient administrateur)

## Structure
```
docs/   cadrage du projet
app/    application Next.js + Payload
  src/collections/   modèles de contenu (Payload)
  src/app/(frontend) pages publiques
  src/app/(payload)  back-office et API
```
