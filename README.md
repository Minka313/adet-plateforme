# Plateforme ADET – Kolda

Plateforme web de l'**Association pour la promotion du Développement Économique Territorial (ADET)**, basée à Kolda (Sénégal) : découvrir le territoire, trouver des opportunités, se former et suivre les réalisations de l'association.

- Vision, arborescence et feuille de route : [`docs/vision-plateforme.md`](docs/vision-plateforme.md)
- Checklist des contenus à fournir : [`docs/contenus-a-collecter.md`](docs/contenus-a-collecter.md)
- Cadre stratégique source : [`docs/cadre-strategique-ADET.pdf`](docs/cadre-strategique-ADET.pdf)
- **Backend (architecture, sécurité, déploiement, sauvegardes)** : [`docs/backend.md`](docs/backend.md)
- **Guide de l'éditeur (équipe ADET)** : [`docs/guide-editeur.md`](docs/guide-editeur.md)

## En ligne
Prévisualisation (cachée des moteurs de recherche) : **https://adet-plateforme.vercel.app** · back-office : `/admin`. Hébergement Vercel + Neon + Vercel Blob, voir [`docs/backend.md`](docs/backend.md) § 8.

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
pnpm test                     # tests d'intégration (base adet_test à créer : createdb adet_test)
```

- Site : http://localhost:3000 (redirige vers `/fr` ou `/en` selon la langue du navigateur)
- Back-office : http://localhost:3000/admin (le premier compte créé devient administrateur)

## Design et langues
- **Bilingue FR / EN** : chaque contenu se traduit dans `/admin` grâce au sélecteur de langue en haut des fiches. Une traduction manquante affiche le français.
- **Identité visuelle** : polices Fraunces (titres) et Inter (texte), couleurs du logo, motif inspiré du pagne manjak, étoiles du logo, carte de la Casamance (limites geoBoundaries, licence CC BY 4.0, régénérable avec `scripts/generer-carte.py`).
- **Sans photo**, chaque carte affiche une illustration aux couleurs de son axe ; dès qu'une photo est ajoutée dans `/admin`, elle la remplace.
- **Mesures Lighthouse mobile (build de production)** : Performance 90 à 92, Accessibilité 100, Bonnes pratiques 100, SEO 100.
- **SEO** : `sitemap.xml`, `robots.txt`, balises hreflang, images de partage générées automatiquement, données structurées schema.org (NGO).
- Variable d'environnement de production : `NEXT_PUBLIC_SITE_URL=https://votre-domaine` (pour les liens absolus du sitemap et des partages).

## Ce qui existe (Phase 1 : vitrine de l'ADET)
| Page | Contenu | Géré dans `/admin` |
|---|---|---|
| `/fr`, `/en` | Accueil : accroche, chiffres clés, vision/mission, 5 axes, réalisations, actualités, partenaires | Présentation de l'ADET + collections |
| `/a-propos` | Vision, mission, valeurs, axes stratégiques, démarche, zone d'intervention | Présentation de l'ADET |
| `/equipe` | Pôles (DFDC, DPS, DCIT, DSE, DFA, Coordination) et membres | Départements ADET, Équipe |
| `/realisations` et `/realisations/[slug]` | Projets avec chiffres d'impact, galerie, partenaires | Réalisations (brouillon / publié) |
| `/actualites` et `/actualites/[slug]` | Articles | Actualités (brouillon / publié) |
| `/partenaires` | Partenaires et appel à partenariat | Partenaires |
| `/contact` | Formulaire (enregistré dans « Messages reçus »), coordonnées, WhatsApp | Coordonnées et réseaux |
| `/documents` | Rapports et publications téléchargeables | Documents |
| `/mentions-legales` | Éditeur, données personnelles, crédits | Coordonnées |
| `/decouvrir-kolda` | La région : présentation, repères, chiffres sourcés (ANSD, RGPH-5 2023), carte cliquable, départements et filières | Territoires, Économie et filières |
| `/decouvrir-kolda/[slug]` | Fiche d'un département (Kolda, Vélingara, Médina Yoro Foulah) ou d'une filière | Territoires, Économie et filières |
| `/opportunites` | Opportunités en cours (masquées automatiquement après leur date limite) et annuaire des structures (financement, accompagnement, emploi) | Opportunités, Structures d'accompagnement |
| `/se-former` | Catalogue des formations de l'ADET et organismes de formation professionnelle | Formations de l'ADET, Structures d'accompagnement |

Menu principal (conforme à `docs/vision-plateforme.md`) : Accueil · Découvrir Kolda · Opportunités · Se former · L'ADET ▾ · Agir ▾, défini dans `app/src/lib/menu.ts`.

Toutes les pages existent en `/fr/...` et `/en/...`.

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
