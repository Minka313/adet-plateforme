# Bascule de Vercel + Neon vers un VPS Hostinger

Mode d'emploi pas à pas pour installer la plateforme sur un serveur et y transférer la base, les photos et les documents. Compter une soirée. Le site Vercel reste en ligne pendant toute l'opération : en cas de problème, on revient en arrière en changeant le DNS.

## Ce qu'il faut avant de commencer

- **Un VPS Hostinger KVM 2** (2 processeurs, 8 Go de mémoire), système **Ubuntu 24.04**, datacenter en **France**.
- **Le nom de domaine** (par exemple `adet.sn`), avec accès à sa zone DNS.
- **Le fichier privé** `~/.config/adet/production.env` : `DATABASE_URL` (Neon), `PAYLOAD_SECRET`, clés VAPID.
- Facultatif mais conseillé : clés JaaS (visio), mot de passe d'application Gmail (e-mails).

Prévenez l'équipe : **ne rien modifier dans `/admin` ni dans l'espace pro pendant une heure**. Ce qui serait saisi sur l'ancien site après l'export de la base serait perdu.

## 1. Préparer le serveur

Connecté en SSH au VPS (accès root fourni par Hostinger) :

```bash
adduser adet && usermod -aG sudo adet          # compte de travail
mkdir -p /home/adet/.ssh && cp ~/.ssh/authorized_keys /home/adet/.ssh/ && chown -R adet:adet /home/adet/.ssh
apt update && apt -y full-upgrade && apt -y install unattended-upgrades fail2ban ufw git postgresql-client python3
ufw allow OpenSSH && ufw allow 80 && ufw allow 443 && ufw --force enable
curl -fsSL https://get.docker.com | sh && usermod -aG docker adet
```

Puis interdire la connexion root et par mot de passe : dans `/etc/ssh/sshd_config`, `PermitRootLogin no` et `PasswordAuthentication no`, puis `systemctl restart ssh`. Vérifier d'abord, depuis un autre terminal, que `ssh adet@IP_DU_VPS` fonctionne avec la clé.

## 2. Installer le code et la configuration

```bash
sudo mkdir -p /opt/adet && sudo chown adet:adet /opt/adet
git clone https://github.com/Minka313/adet-plateforme.git /opt/adet && cd /opt/adet/deploy
cp .env.example .env && nano .env
```

Dans `.env` :

| Variable | Valeur |
|---|---|
| `DOMAINE` | `adet.sn` (sans https) |
| `POSTGRES_PASSWORD` | `openssl rand -hex 24` |
| `PAYLOAD_SECRET` | **la même** que sur Vercel (fichier privé) : sessions, salles de visio et protections restent valides |
| `CRON_SECRET` | `openssl rand -hex 24` |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` | celles du fichier privé |
| `JAAS_…`, `SMTP_…` | si disponibles |

Laisser `S3_…` vide : les fichiers seront sur le serveur.

## 3. Copier la base

```bash
cd /opt/adet/deploy
SOURCE_DB_URL="(DATABASE_URL du fichier privé)" ./bascule/importer-base.sh
```

Le script exporte Neon, restaure sur le serveur, puis **compare le nombre de lignes de chaque table**. Il s'arrête en cas d'écart (c'est arrivé en répétition sur une connexion lente : l'export avait été coupé). Il refuse aussi d'écraser une base déjà remplie.

## 4. Construire et démarrer le site

```bash
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml logs -f app      # attendre « Ready », puis Ctrl+C
```

## 5. Copier les photos et les documents

```bash
SOURCE_DB_URL="(DATABASE_URL du fichier privé)" SITE_SOURCE=https://adet-plateforme.vercel.app ./bascule/recuperer-fichiers.sh ./bascule/fichiers
docker compose -f docker-compose.prod.yml cp ./bascule/fichiers/media/. app:/app/media/
docker compose -f docker-compose.prod.yml cp ./bascule/fichiers/documents/. app:/app/documents/
docker compose -f docker-compose.prod.yml exec -u root app chown -R nextjs:nodejs media documents
```

Le script ne garde que des fichiers complets ; s'il signale des échecs, le relancer : seuls les fichiers manquants sont téléchargés.

## 6. Pointer le domaine vers le serveur

Dans la zone DNS du domaine : enregistrements **A** pour `adet.sn` et `www.adet.sn` vers l'adresse IP du VPS. Caddy obtient seul le certificat HTTPS dès que le DNS répond (quelques minutes à quelques heures).

## 7. Vérifier

- `curl https://adet.sn/api/sante` → `{"statut":"ok",…}`
- Le site, une page avec photo, une page Découvrir Kolda.
- `/admin` : connexion avec un compte existant.
- `/espace` : connexion, tâches, réunions, salle de visio.

## 8. Tâches planifiées

`crontab -e` (compte adet) :

```
0 3 * * * /opt/adet/deploy/sauvegarde.sh >> /var/log/adet-sauvegarde.log 2>&1
0 7 * * * /opt/adet/deploy/rappels.sh >> /var/log/adet-rappels.log 2>&1
```

Les sauvegardes restent sur le serveur 14 jours : **les copier aussi ailleurs** (par exemple avec `rclone` vers un Google Drive de l'ADET), sans quoi une panne du serveur emporterait base et sauvegardes.

## 9. Après la bascule

- **Notifications** : chaque membre réinstalle l'application depuis `https://adet.sn/espace` et touche « Activer » dans son profil (l'adresse a changé).
- **Ouvrir au public** : retirer `NEXT_PUBLIC_INDEXATION` du `.env` s'il y figure, puis `docker compose -f docker-compose.prod.yml up -d --build`.
- **Sentry** : mettre à jour l'adresse surveillée (`https://adet.sn/api/sante`).
- **Vercel et Neon** : garder une semaine en secours, puis mettre le projet Vercel en pause et supprimer Neon après un mois. Adapter alors le dépôt `adet-sauvegardes`.

## Mettre à jour le site ensuite

```bash
cd /opt/adet && git pull && cd deploy && docker compose -f docker-compose.prod.yml up -d --build
```

Les migrations de la base s'appliquent toutes seules au build.

## Revenir en arrière

Tant que Vercel et Neon tournent : remettre l'ancien DNS (ou utiliser `adet-plateforme.vercel.app`). Ce qui a été saisi sur le serveur entre-temps devra être ressaisi.
