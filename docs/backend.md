# Backend de la plateforme ADET : guide technique

> Pour l'équipe ADET (non technique), voir plutôt [`guide-editeur.md`](guide-editeur.md).

## 1. Architecture

```
Navigateur ──► Caddy (HTTPS) ──► Next.js 16 + Payload 3 (une seule application Node)
                                   │  ├─ site public  /fr/…  /en/…   (pages pré-générées, régénérées à la publication)
                                   │  ├─ back-office  /admin          (Payload, en français)
                                   │  └─ API          /api/…          (REST + GraphQL Payload, /api/sante)
                                   ├──► PostgreSQL 16 (contenus, comptes, messages, versions)
                                   ├──► Stockage objet S3/R2 (médias, documents) – facultatif
                                   └──► Serveur SMTP (e-mails) – facultatif
```

| Élément | Fichier(s) |
|---|---|
| Configuration Payload | `app/src/payload.config.ts` |
| Modèles de contenu | `app/src/collections/*.ts`, `app/src/globals/*.ts` |
| Règles d'accès | `app/src/access/index.ts` |
| Hooks (régénération, e-mails) | `app/src/hooks/` |
| Formulaires (server actions) | `app/src/app/(frontend)/[lang]/contact/actions.ts`, `app/src/app/actions/newsletter.ts` |
| Anti-abus | `app/src/lib/antiAbus.ts` |
| Migrations SQL | `app/src/migrations/` |
| Tests | `app/tests/` |
| Déploiement | `deploy/` |

## 2. Modèle de données

| Collection / global | Rôle | Traduit FR/EN | Brouillons |
|---|---|---|---|
| `realisations` | Projets de l'ADET (impact, galerie, partenaires, axe) | ✔ | ✔ |
| `actualites` | Articles | ✔ | ✔ |
| `partenaires`, `equipe`, `departements` | Vitrine institutionnelle | ✔ (textes) | – |
| `documents` | PDF téléchargeables (upload) | ✔ | – |
| `media` | Images (converties en WebP, 3 tailles) | ✔ (texte alternatif) | – |
| `messages` | Formulaire de contact | – | – |
| `abonnes` | Newsletter (export CSV : `GET /api/abonnes/export`) | – | – |
| `users` | Comptes du back-office | – | – |
| `association` (global) | Présentation : vision, mission, axes, valeurs… | ✔ | – |
| `coordonnees` (global) | Adresse, téléphones, réseaux, NINEA | – | – |

Une traduction anglaise manquante affiche automatiquement le français (`fallback: true`).

## 3. Rôles et droits

| | Public | Éditeur | Administrateur |
|---|---|---|---|
| Lire les contenus publiés | ✔ | ✔ | ✔ |
| Lire les brouillons, aperçu | – | ✔ | ✔ |
| Créer / modifier / publier les contenus | – | ✔ | ✔ |
| Lire les messages et abonnés | – | ✔ | ✔ |
| Supprimer des abonnés | – | – | ✔ |
| Gérer les comptes et les rôles | – | son propre compte (sans changer son rôle) | ✔ |
| Écrire dans `messages` / `abonnes` | uniquement via les formulaires du site | – | – |

Ces règles sont couvertes par les tests `app/tests/acces.test.ts`.

## 4. Sécurité

- **Connexion** : verrouillage 15 min après 5 échecs, session de 8 h, cookie `Secure` + `SameSite=Lax` en production.
- **CSRF / CORS** : l'API n'accepte les cookies de session que depuis `NEXT_PUBLIC_SITE_URL`.
- **Formulaires** : champ piège anti-robots ; limite de débit par visiteur (contact : 3 envois / 10 min ; newsletter : 5 / 30 min). Le visiteur est identifié par une **empreinte** = hachage SHA-256 de l'IP + secret : aucune adresse IP n'est stockée.
- **En-têtes HTTP** : `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, HSTS en production ; `X-Powered-By` supprimé.
- **Aperçu** : la route `/[lang]/apercu` vérifie la session Payload (401 sinon) et n'accepte que des chemins internes (pas de redirection ouverte).
- **GraphQL Playground** : désactivé en production (comportement par défaut de Payload).
- **Secrets** : uniquement dans `.env` / `deploy/.env`, jamais dans Git.

## 5. Publication, aperçu, e-mails

- **Publication instantanée** : chaque modification (collections publiques + globals) appelle `revalidatePath('/', 'layout')` (`hooks/revalider.ts`). Les pages sont régénérées à la visite suivante, dans les deux langues. Sécurité supplémentaire : régénération automatique toutes les 60 s.
- **Aperçu des brouillons** : bouton « Aperçu » dans `/admin` → `/{lang}/apercu?chemin=…` active le *draft mode* de Next ; un bandeau jaune le signale ; « Quitter l'aperçu » le désactive.
- **E-mails** (`hooks/notifierMessage.ts`, gabarit `email/gabarit.ts`) : à chaque message reçu, alerte à `NOTIFICATION_EMAIL` (ou e-mail des coordonnées) avec bouton vers le back-office, et accusé de réception dans la langue du visiteur. Sans SMTP, les e-mails sont écrits dans les journaux. Un échec d'envoi ne bloque jamais l'enregistrement.

## 6. Variables d'environnement

Voir `app/.env.example` (développement) et `deploy/.env.example` (production). Essentielles : `DATABASE_URL`, `PAYLOAD_SECRET`, `NEXT_PUBLIC_SITE_URL`. Facultatives : `SMTP_*`, `NOTIFICATION_EMAIL`, `S3_*`.

**Gmail** : `SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=465`, `SMTP_USER=adetsenegal1@gmail.com`, `SMTP_PASS=` *mot de passe d'application* (Compte Google → Sécurité → Validation en deux étapes → Mots de passe des applications).

## 7. Base de données et migrations

- **Développement** : Payload synchronise le schéma automatiquement (`push`).
- **Production** : le schéma n'évolue **que par migrations** versionnées dans `app/src/migrations/`.
  1. Modifier une collection, puis `pnpm payload migrate:create nom-du-changement`
  2. Relire le fichier SQL généré et le commiter
  3. Au déploiement, `pnpm build:prod` applique les migrations **avant** le build (une seule fois) ; le serveur les applique aussi au démarrage si besoin (`prodMigrations`).
- ⚠️ Ne jamais lancer `pnpm migrate` sur une base de **développement** (créée en mode `push`) : Payload pose alors une question interactive. Les bases de production, de CI et de build doivent naître vierges et n'évoluer que par migrations.

## 8. Hébergement actuel : Vercel + Neon (prévisualisation)

Le site tourne sur **https://adet-plateforme.vercel.app** (compte Vercel `minka313`, projet `adet-plateforme`), en **prévisualisation** : en ligne et partageable, mais caché des moteurs de recherche.

| Élément | Service |
|---|---|
| Site + back-office + API | Vercel, région Londres (`lhr1`), voir `app/vercel.json` |
| Base PostgreSQL | Neon, projet `adet-plateforme` (`noisy-bonus-72054032`), branche `production`, région `aws-eu-west-2` |
| Photos et documents | Vercel Blob, magasin `adet-medias` (variable `BLOB_READ_WRITE_TOKEN`, ajoutée automatiquement) |

**Variables Vercel (production)** : `DATABASE_URL` (Neon, connexion *pooler*), `PAYLOAD_SECRET`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_INDEXATION=non`, `BLOB_READ_WRITE_TOKEN`. Copie locale privée des secrets : `~/.config/adet/production.env` (hors Git).

**Déployer** : automatique. Le projet Vercel est relié au dépôt GitHub (dossier racine `app`) : chaque `git push` sur `main` publie le site. Les autres branches ne sont pas déployées (`ignoreCommand` dans `app/vercel.json`), car elles n'ont pas accès à la base. La commande de build `pnpm build:prod` applique d'abord les migrations sur la base Neon. Déploiement manuel possible depuis la **racine du dépôt** (pas depuis `app/`, le dossier racine est déjà réglé) : `vercel deploy --prod`.

**Ouvrir le site au public** : supprimer la variable `NEXT_PUBLIC_INDEXATION` dans Vercel (`vercel env rm NEXT_PUBLIC_INDEXATION production`), puis redéployer. Brancher ensuite le nom de domaine (Vercel → Domains) et mettre à jour `NEXT_PUBLIC_SITE_URL`.

**Charger le contenu de départ** dans la base de production (depuis `app/`, avec les variables de production et `NODE_ENV=production`, pour ne jamais modifier le schéma hors migrations) : `pnpm seed`.

**Premier administrateur** : `ADMIN_EMAIL=… ADMIN_PASSWORD=… pnpm payload run scripts/creer-admin.ts` avec les variables de production. Toujours le faire **juste après** la création d'une base : sinon, le premier visiteur de `/admin` deviendrait administrateur.

⚠️ **Migrations et Vercel Blob** : l'adaptateur Blob ajoute une colonne `_objectkey` aux tables `media` et `documents`. Créez toujours les migrations avec une valeur factice pour que l'état de référence l'inclue :
`BLOB_READ_WRITE_TOKEN=vercel_blob_rw_factice_000 pnpm payload migrate:create nom-du-changement`

## 8 bis. Autre option : serveur VPS avec Docker

Prérequis : un serveur (2 vCPU / 4 Go conseillés), un nom de domaine pointant vers son IP (enregistrements A pour `adet.sn` et `www`), Docker installé.

```bash
git clone https://github.com/Minka313/adet-plateforme.git && cd adet-plateforme/deploy
cp .env.example .env            # remplir DOMAINE, POSTGRES_PASSWORD, PAYLOAD_SECRET, SMTP…
docker compose -f docker-compose.prod.yml up -d postgres      # 1. la base
docker compose -f docker-compose.prod.yml up -d --build       # 2. l'application + HTTPS
curl https://adet.sn/api/sante                                 # → {"statut":"ok",…}
```

Puis ouvrir `https://adet.sn/admin`, créer le premier compte (administrateur), et charger le contenu de départ si la base est vide :
`docker compose -f docker-compose.prod.yml exec app node -e "…"` n'étant pas pratique, lancer plutôt `pnpm seed` depuis un poste avec `DATABASE_URL` pointant vers la base (tunnel SSH), ou saisir le contenu dans `/admin`.

**Mise à jour** : `git pull && docker compose -f docker-compose.prod.yml up -d --build`.

## 9. Sauvegardes et restauration

**Hébergement actuel (Neon)** : sauvegarde automatique chaque nuit à 2 h par le dépôt **privé** `Minka313/adet-sauvegardes` (GitHub Actions). La base est exportée, **restaurée à blanc pour vérification**, chiffrée (AES-256) et conservée 30 jours. En cas d'échec, GitHub prévient par e-mail. Restauration : `restaurer.sh` de ce dépôt, dans une base vide uniquement. La phrase de chiffrement est indispensable : la garder en lieu sûr.

**Option VPS (Docker)** :

- `deploy/sauvegarde.sh` : dump PostgreSQL + archive des fichiers, rotation 14 jours. À planifier : `0 3 * * * /…/deploy/sauvegarde.sh`.
- **Copier régulièrement `deploy/sauvegardes/` hors du serveur** (autre machine, stockage objet).
- `deploy/restauration.sh sauvegardes/base_….dump` : restauration (demande confirmation).
- Tester une restauration au moins une fois par trimestre.

## 10. Supervision

- `GET /api/sante` → `200 {"statut":"ok"}` ou `503` si la base est injoignable. À brancher sur un service de surveillance gratuit (UptimeRobot, Better Stack…) avec alerte e-mail/SMS.
- Journaux : `docker compose -f docker-compose.prod.yml logs -f app`.

## 11. Qualité

- `pnpm test` : 16 tests d'intégration (droits d'accès, formulaires, anti-abus, newsletter, slugs) sur une base dédiée (`DATABASE_URL_TEST`, par défaut `adet_test`).
- GitHub Actions (`.github/workflows/ci.yml`) : types TypeScript, tests et build de production à chaque push.
- Mesures Lighthouse mobile : Performance 90+, Accessibilité/Bonnes pratiques/SEO 100.
