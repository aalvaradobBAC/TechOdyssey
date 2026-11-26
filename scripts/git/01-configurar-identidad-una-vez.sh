#!/usr/bin/env bash

set -Eeuo pipefail

if ! command -v git >/dev/null 2>&1; then
  printf 'ERROR: No se encontró el comando requerido: git\n' >&2
  exit 127
fi

current_name="$(git config --global --get user.name || true)"
current_email="$(git config --global --get user.email || true)"

read -r -p "Nombre para los commits${current_name:+ [$current_name]}: " name
read -r -p "Correo para los commits${current_email:+ [$current_email]}: " email

name="${name:-$current_name}"
email="${email:-$current_email}"

if [[ -z "$name" || -z "$email" ]]; then
  printf 'ERROR: Debes configurar un nombre y un correo no vacíos.\n' >&2
  exit 1
fi

git config --global user.name "$name"
git config --global user.email "$email"

printf 'Identidad global de Git configurada para esta computadora.\n'
