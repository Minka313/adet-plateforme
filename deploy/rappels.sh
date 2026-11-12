#!/usr/bin/env sh
# Rappels des réunions et relances des rapports (remplace la tâche planifiée de Vercel).
# crontab -e :  0 7 * * * /opt/adet/deploy/rappels.sh >> /var/log/adet-rappels.log 2>&1
set -eu
cd "$(dirname "$0")"
DOMAINE=$(grep '^DOMAINE=' .env | cut -d= -f2-)
SECRET=$(grep '^CRON_SECRET=' .env | cut -d= -f2-)
echo "$(date '+%F %T') $(curl -fsS --max-time 120 -H "Authorization: Bearer $SECRET" "https://$DOMAINE/api/reunions/rappels")"
