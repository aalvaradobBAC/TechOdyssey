#!/usr/bin/env bash

set -Eeuo pipefail

ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"

exec dotnet run \
  --project src/backend/TechOdyssey.Api \
  --urls http://0.0.0.0:5048
