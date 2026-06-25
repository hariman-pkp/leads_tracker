#!/bin/bash
# ============================================================
# stop_all.sh — Hentikan semua server CRM
# ============================================================

echo "======================================================"
echo "  CRM DCSS — Stopping All Services"
echo "======================================================"

stop_port() {
    local PORT=$1
    local NAME=$2
    echo ""
    echo "→ $NAME (port $PORT): stopping..."
    PIDS=$(lsof -ti:$PORT 2>/dev/null)
    if [ -n "$PIDS" ]; then
        echo "$PIDS" | xargs kill -9 2>/dev/null
        echo "  ✅ Stopped"
    else
        echo "  ℹ️  Not running"
    fi
}

stop_port 3000 "Nuxt Frontend"
stop_port 8002 "Laravel REST API"
stop_port 8001 "FastAPI REST API"
stop_port 8080 "FastAPI SSR Legacy"

# Hapus Nuxt lock file agar tidak ada masalah saat start ulang
LOCK_FILE="$(cd "$(dirname "$0")" && pwd)/frontend/.nuxt/nuxt.lock"
if [ -f "$LOCK_FILE" ]; then
    rm -f "$LOCK_FILE"
    echo ""
    echo "→ Nuxt lock file: removed"
fi

echo ""
echo "======================================================"
echo "  Semua service dihentikan."
echo "  Untuk menjalankan kembali: ./start_all.sh"
echo "======================================================"
