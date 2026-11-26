#!/usr/bin/env bash

set -Eeuo pipefail

if ! command -v git >/dev/null 2>&1; then
  printf 'ERROR: No se encontró el comando requerido: git\n' >&2
  exit 127
fi

ROOT="$(git rev-parse --show-toplevel 2>/dev/null)" || {
  printf 'ERROR: Ejecuta este script desde dentro del repositorio clonado.\n' >&2
  exit 1
}
cd "$ROOT"

if [[ -n "$(git status --porcelain)" ]]; then
  printf 'ERROR: Hay cambios locales. Guárdalos o resuélvelos antes de actualizar.\n' >&2
  GIT_PAGER=cat git status --short
  exit 1
fi

git pull --ff-only
