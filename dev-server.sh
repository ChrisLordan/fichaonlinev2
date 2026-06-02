#!/bin/bash
# dev-server.sh — inicia servidor local em :8765
# Uso: bash dev-server.sh

PORT=${1:-8765}
DIR=$(cd "$(dirname "$0")" && pwd)

echo "Iniciando servidor em http://localhost:$PORT/"
echo "Diretório: $DIR"
echo "Para parar: Ctrl+C (PID \$(pgrep -f 'http.server $PORT'))"
echo ""

cd "$DIR"
python3 -m http.server "$PORT"
