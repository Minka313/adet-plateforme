#!/usr/bin/env sh
# Sauvegarde quotidienne de la base et des fichiers envoyés, conservées 14 jours.
# Cron conseillé (tous les jours à 3 h) : 0 3 * * * /chemin/adet-plateforme/deploy/sauvegarde.sh
set -eu
cd "$(dirname "$0")"
DEST="${DEST_SAUVEGARDES:-./sauvegardes}"
DATE="$(date +%Y-%m-%d_%H%M)"
mkdir -p "$DEST"

docker compose -f docker-compose.prod.yml exec -T postgres pg_dump -U adet -d adet --format=custom > "$DEST/base_$DATE.dump"
docker compose -f docker-compose.prod.yml exec -T app tar -czf - media documents > "$DEST/fichiers_$DATE.tar.gz"

find "$DEST" -type f -mtime +14 -delete
echo "Sauvegarde terminée : $DEST/base_$DATE.dump et fichiers_$DATE.tar.gz"
