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

if ! git remote get-url origin >/dev/null 2>&1; then
  printf 'ERROR: No existe un remoto llamado origin.\n' >&2
  exit 1
fi

generated_paths=()
while IFS= read -r -d '' path; do
  case "$path" in
    obj/*|*/obj/*|bin/*|*/bin/*|node_modules/*|*/node_modules/*|dist/*|*/dist/*|App_Data/*|*/App_Data/*|TechOdyssey-source.zip)
      generated_paths+=("$path")
      ;;
  esac
done < <(git diff --cached --name-only -z)

if (("${#generated_paths[@]}" > 0)); then
  git restore --staged -- "${generated_paths[@]}"
fi

git add -A -- . ':(exclude)workspaces'
git add --renormalize -- . ':(exclude)workspaces'

if git diff --cached --name-only | grep -E '(^|/)(obj|bin|node_modules|dist|App_Data)/'; then
  printf 'ERROR: Hay archivos generados o datos locales preparados. No se creará el commit.\n' >&2
  exit 1
fi

if git diff --cached --quiet; then
  printf 'No hay cambios para guardar.\n'
  exit 0
fi

git diff --cached --check
printf '\nCambios preparados:\n'
GIT_PAGER=cat git status --short
printf '\nResumen:\n'
GIT_PAGER=cat git diff --cached --stat

read -r -p "¿Crear un commit con estos cambios? [y/N] " confirm_commit
if [[ ! "$confirm_commit" =~ ^[Yy]$ ]]; then
  printf 'Cancelado. Los cambios permanecen preparados localmente.\n'
  exit 0
fi

read -r -p "Mensaje del commit: " commit_message
if [[ -z "$commit_message" ]]; then
  printf 'ERROR: El mensaje del commit no puede estar vacío.\n' >&2
  exit 1
fi

git commit -m "$commit_message"

read -r -p "¿Publicar el commit en origin? [y/N] " confirm_push
if [[ ! "$confirm_push" =~ ^[Yy]$ ]]; then
  printf 'Commit guardado localmente; no se publicó.\n'
  exit 0
fi

branch="$(git branch --show-current)"
if git rev-parse --abbrev-ref --symbolic-full-name '@{u}' >/dev/null 2>&1; then
  git push
else
  git push --set-upstream origin "$branch"
fi
