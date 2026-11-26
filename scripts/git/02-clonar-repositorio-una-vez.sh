#!/usr/bin/env bash

set -Eeuo pipefail

repository_url="https://github.com/aalvaradobBAC/TechOdyssey.git"
destination="${1:-TechOdyssey}"

if ! command -v git >/dev/null 2>&1; then
  printf 'ERROR: No se encontró el comando requerido: git\n' >&2
  exit 127
fi

if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  printf 'ERROR: Ejecuta este script desde la carpeta donde quieras crear el clon, no desde dentro de otro repositorio.\n' >&2
  exit 1
fi

if [[ -e "$destination" ]]; then
  printf 'ERROR: La ruta de destino ya existe: %s\n' "$destination" >&2
  exit 1
fi

git clone "$repository_url" "$destination"
printf 'Repositorio clonado en: %s\n' "$destination"
