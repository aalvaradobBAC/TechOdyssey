#!/usr/bin/env bash

set -Eeuo pipefail

ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"

dotnet restore TechOdyssey.sln
dotnet build TechOdyssey.sln --no-restore
dotnet test TechOdyssey.sln --no-build

if [ ! -d "src/frontend/node_modules" ]; then
  npm --prefix src/frontend install --no-fund --no-audit --yes
fi

npm --prefix src/frontend run build

echo "Validación completada correctamente."
