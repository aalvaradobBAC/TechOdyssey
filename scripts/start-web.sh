#!/usr/bin/env bash

set -Eeuo pipefail

ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"

exec npm --prefix src/frontend run dev -- --host 0.0.0.0
