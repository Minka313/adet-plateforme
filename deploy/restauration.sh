#!/usr/bin/env sh
# Restaure une sauvegarde de la base : ./restauration.sh sauvegardes/base_AAAA-MM-JJ_HHMM.dump
# ATTENTION : remplace le contenu actuel de la base.
set -eu
cd "$(dirname "$0")"
[ -f "${1:-}" ] || { echo "Usage : $0 chemin/vers/base_XXXX.dump"; exit 1; }
printf "Remplacer la base actuelle par %s ? (oui/non) " "$1"; read -r ok; [ "$ok" = "oui" ] || exit 1
docker compose -f docker-compose.prod.yml exec -T postgres pg_restore -U adet -d adet --clean --if-exists < "$1"
echo "Base restaurée."
