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
pnpm seed                     # charge le contenu du cadre stratégique (vision, axes, départements…)
pnpm dev
```

- Site : http://localhost:3000
- Back-office : http://localhost:3000/admin (le premier compte créé devient administrateur)

## Ce qui existe (Phase 1 : vitrine de l'ADET)
| Page | Contenu | Géré dans `/admin` |
|---|---|---|
| `/` | Accueil : accroche, chiffres clés, vision/mission, 5 axes, réalisations, actualités, partenaires | Présentation de l'ADET + collections |
| `/a-propos` | Vision, mission, valeurs, axes stratégiques, démarche, zone d'intervention | Présentation de l'ADET |
| `/equipe` | Pôles (DFDC, DPS, DCIT, DSE, DFA, Coordination) et membres | Départements ADET, Équipe |
| `/realisations` et `/realisations/[slug]` | Projets avec chiffres d'impact, galerie, partenaires | Réalisations (brouillon / publié) |
| `/actualites` et `/actualites/[slug]` | Articles | Actualités (brouillon / publié) |
| `/partenaires` | Partenaires et appel à partenariat | Partenaires |
| `/contact` | Formulaire (enregistré dans « Messages reçus »), coordonnées, WhatsApp | Coordonnées et réseaux |

Rôles : **Administrateur** (tout, y compris les comptes) et **Éditeur** (contenus).

## Structure
```
docs/   cadrage du projet
app/    application Next.js + Payload
  src/collections/   modèles de contenu (Payload)
  src/globals/       contenus uniques : présentation de l'ADET, coordonnées
  src/components/    éléments d'interface du site
  src/seed.ts        contenu initial issu du cadre stratégique
  src/app/(frontend) pages publiques
  src/app/(payload)  back-office et API
```
