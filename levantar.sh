#!/usr/bin/env bash

set -Eeuo pipefail

ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

if ! command -v dotnet >/dev/null 2>&1; then
  printf 'ERROR: No se encontró el comando requerido: dotnet\n' >&2
  exit 127
fi

if ! command -v npm >/dev/null 2>&1; then
  printf 'ERROR: No se encontró el comando requerido: npm\n' >&2
  exit 127
fi

api_pid=''
web_pid=''

stop_services() {
  local exit_code=$?
  trap - EXIT INT TERM

  for pid in "$api_pid" "$web_pid"; do
    if [[ -n "$pid" ]] && kill -0 "$pid" 2>/dev/null; then
      kill "$pid" 2>/dev/null || true
    fi
  done

  for pid in "$api_pid" "$web_pid"; do
    if [[ -n "$pid" ]]; then
      wait "$pid" 2>/dev/null || true
    fi
  done

  exit "$exit_code"
}

trap stop_services EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

dotnet run \
  --project src/backend/TechOdyssey.Api \
  --urls http://0.0.0.0:5048 &
api_pid=$!

npm --prefix src/frontend run dev -- --host 0.0.0.0 &
web_pid=$!

printf 'API: http://localhost:5048\n'
printf 'App: http://localhost:5173\n'
printf 'Presiona Ctrl+C para detener ambos servicios.\n'

wait -n "$api_pid" "$web_pid"
