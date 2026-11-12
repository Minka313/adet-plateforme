#!/usr/bin/env bash
# Bascule vers le VPS : copie la base actuelle (Neon) dans le PostgreSQL du serveur, puis vérifie
# que chaque table contient exactement le même nombre de lignes des deux côtés.
#
# Usage, sur le VPS, depuis deploy/ :  SOURCE_DB_URL="postgres://…neon…" ./bascule/importer-base.sh
# Refuse d'écraser une base déjà remplie (sauf FORCER=oui). Rien n'est modifié côté Neon.
set -euo pipefail
cd "$(dirname "$0")/.."
: "${SOURCE_DB_URL:?Indiquez SOURCE_DB_URL (base actuelle, Neon)}"
COMPOSE="docker compose -f docker-compose.prod.yml"
SOURCE_PSQL="docker run --rm -i postgres:17-alpine psql"
cible_psql() { $COMPOSE exec -T postgres psql -U adet -d adet -tA "$@"; }

echo "1. Démarrage de PostgreSQL sur le serveur…"
$COMPOSE up -d postgres
until $COMPOSE exec -T postgres pg_isready -U adet -d adet >/dev/null 2>&1; do sleep 2; done

tables=$(cible_psql -c "select count(*) from pg_tables where schemaname = 'public'")
if [ "$tables" != "0" ] && [ "${FORCER:-}" != "oui" ]; then
  echo "La base du serveur contient déjà $tables tables : rien n'est fait. Pour la remplacer : FORCER=oui $0" >&2
  exit 1
fi

DUMP="bascule/source_$(date +%Y-%m-%d_%H%M).dump"
echo "2. Export de la base actuelle vers $DUMP…"
docker run --rm postgres:17-alpine pg_dump "$SOURCE_DB_URL" --format=custom --no-owner --no-privileges > "$DUMP"

echo "3. Restauration sur le serveur…"
$COMPOSE exec -T postgres pg_restore -U adet -d adet --no-owner --no-privileges ${FORCER:+--clean --if-exists} < "$DUMP"

echo "4. Vérification, table par table…"
liste=$($SOURCE_PSQL "$SOURCE_DB_URL" -tAc "select tablename from pg_tables where schemaname = 'public' order by 1")
requete=$(for t in $liste; do printf "select '%s' || '=' || count(*) from \"%s\" union all " "$t" "$t"; done | sed 's/ union all $//')
diff <($SOURCE_PSQL "$SOURCE_DB_URL" -tAc "$requete" | sort) <(cible_psql -c "$requete" | sort) >/dev/null || {
  echo "ÉCART entre la base actuelle et le serveur :" >&2
  diff <($SOURCE_PSQL "$SOURCE_DB_URL" -tAc "$requete" | sort) <(cible_psql -c "$requete" | sort) >&2 || true
  exit 1
}
echo "Base importée et vérifiée : $(echo "$liste" | wc -w) tables identiques. Copie conservée : $DUMP"
