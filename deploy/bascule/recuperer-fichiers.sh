#!/usr/bin/env bash
# Bascule vers le VPS : télécharge toutes les photos et tous les documents du site actuel
# (original et tailles réduites), d'après la liste des fichiers enregistrée dans la base.
#
# Usage : SOURCE_DB_URL="postgres://…neon…" SITE_SOURCE=https://adet-plateforme.vercel.app ./recuperer-fichiers.sh [dossier]
# psql est lu dans $PSQL (par défaut « psql » ; sur le VPS sans client installé :
#   PSQL="docker run --rm -i postgres:17-alpine psql").
set -euo pipefail
: "${SOURCE_DB_URL:?Indiquez SOURCE_DB_URL (base actuelle)}"
: "${SITE_SOURCE:?Indiquez SITE_SOURCE (adresse du site actuel)}"
DEST="${1:-./fichiers-recuperes}"
PSQL="${PSQL:-psql}"
mkdir -p "$DEST/media" "$DEST/documents"

encoder() { python3 -c 'import sys, urllib.parse; print(urllib.parse.quote(sys.argv[1]))' "$1"; }

telecharger() { # collection, liste SQL des noms
  local collection="$1" requete="$2" n=0 echecs=0
  while IFS= read -r nom; do
    [ -n "$nom" ] || continue
    local cible="$DEST/$collection/$nom"
    # Déjà récupéré lors d'un passage précédent : on le garde (le script se relance sans tout refaire)
    if [ -s "$cible" ]; then n=$((n + 1)); continue; fi
    # Téléchargé à côté, puis gardé seulement s'il est complet et non vide
    if curl -fsS --retry 4 --retry-delay 3 --max-time 300 -o "$cible.partiel" "$SITE_SOURCE/api/$collection/file/$(encoder "$nom")" && [ -s "$cible.partiel" ]; then
      mv "$cible.partiel" "$cible"
      n=$((n + 1))
    else
      rm -f "$cible.partiel"
      echecs=$((echecs + 1))
      echo "  échec : $collection/$nom" >&2
    fi
  done < <($PSQL "$SOURCE_DB_URL" -tAc "$requete")
  echo "$collection : $n fichiers récupérés, $echecs échecs"
  [ "$echecs" -eq 0 ]
}

telecharger media "select filename from media union select sizes_vignette_filename from media union select sizes_carte_filename from media union select sizes_large_filename from media"
telecharger documents "select filename from documents"
echo "Fichiers dans $DEST (à copier dans les volumes media et documents du conteneur app). En cas d'échec, relancez : seuls les fichiers manquants seront téléchargés."
