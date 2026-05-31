#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

PATTERN="isa-epamig|incaper|isa epamig"

echo "Verificando termos proibidos..."
if grep -RInEi "$PATTERN" . \
  --exclude-dir=.git \
  --exclude-dir=node_modules \
  --exclude-dir=dist \
  --exclude-dir=coverage \
  --exclude-dir=.next \
  --exclude-dir=.turbo \
  --exclude='check-forbidden-terms.sh' \
  --exclude='*.log'; then
  echo "ERRO: foram encontrados termos proibidos no projeto."
  exit 1
fi

echo "OK: nenhum termo proibido encontrado."
