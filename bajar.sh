#!/usr/bin/env bash

set -Eeuo pipefail

ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

ARCHIVE="$ROOT/TechOdyssey-source.zip"
TEMP_ARCHIVE="/tmp/TechOdyssey-source.$$.${RANDOM:-0}.zip"
rm -f -- "$TEMP_ARCHIVE"

cleanup() {
  rm -f -- "$TEMP_ARCHIVE"
}
trap cleanup EXIT

if ! command -v zip >/dev/null 2>&1; then
  printf 'ERROR: No se encontró el comando requerido: zip\n' >&2
  exit 127
fi

printf 'Empaquetando los fuentes de TechOdyssey...\n'

zip -r -q "$TEMP_ARCHIVE" . \
  -x \
  ".git/*" \
  "*/.git/*" \
  "node_modules/*" \
  "*/node_modules/*" \
  "dist/*" \
  "*/dist/*" \
  "bin/*" \
  "*/bin/*" \
  "obj/*" \
  "*/obj/*" \
  "App_Data/*" \
  "*/App_Data/*" \
  "TechOdyssey-source.zip"

mv -f -- "$TEMP_ARCHIVE" "$ARCHIVE"
trap - EXIT

SIZE="$(du -h -- "$ARCHIVE" | cut -f1)"
COUNT="$(unzip -Z1 "$ARCHIVE" | wc -l)"

printf 'Archivo actualizado: %s\n' "$ARCHIVE"
printf 'Tamaño: %s | Entradas: %s\n' "$SIZE" "$COUNT"
printf 'Descárgalo desde VS Code/Codespaces con el explorador de archivos.\n'
