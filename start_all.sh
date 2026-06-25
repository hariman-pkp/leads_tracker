#!/bin/bash
# ============================================================
# start_all.sh — Jalankan semua server CRM
# ============================================================
# Usage: ./start_all.sh [dev|prod]
# Default: dev (dengan --reload dan Nuxt dev server)
# ============================================================

MODE="${1:-dev}"
BASE_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "======================================================"
echo "  CRM DCSS — Starting All Services ($MODE mode)"
echo "======================================================"

# 1. PostgreSQL — pastikan berjalan
echo ""
echo "→ PostgreSQL: checking..."
if /Library/PostgreSQL/18/bin/pg_isready -q 2>/dev/null; then
    echo "  ✅ PostgreSQL already running"
else
    echo "  Starting PostgreSQL..."
    sudo -u postgres /Library/PostgreSQL/18/bin/pg_ctl start \
        -D /Library/PostgreSQL/18/data 2>/dev/null || echo "  ⚠️  Start manually via pgAdmin"
fi

# 2. FastAPI Jinja2 SSR (port 8080) — legacy, keep running during migration
echo ""
echo "→ FastAPI SSR (port 8080): starting..."
cd "$BASE_DIR"
if lsof -ti:8080 > /dev/null 2>&1; then
    echo "  ✅ Already running on :8080"
else
    nohup python3 -m uvicorn main:app --host 0.0.0.0 --port 8080 --reload \
        > /tmp/crm_ssr.log 2>&1 &
    echo "  ✅ Started (PID $!) — log: /tmp/crm_ssr.log"
fi

# 3. FastAPI REST API (port 8001)
echo ""
echo "→ FastAPI REST API (port 8001): starting..."
if lsof -ti:8001 > /dev/null 2>&1; then
    echo "  ✅ Already running on :8001"
else
    nohup python3 -m uvicorn api_app:app --host 0.0.0.0 --port 8001 --reload \
        > /tmp/crm_api.log 2>&1 &
    echo "  ✅ Started (PID $!) — log: /tmp/crm_api.log"
fi

# 3b. Laravel REST API (port 8002)
echo ""
echo "→ Laravel REST API (port 8002): starting..."
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
if lsof -ti:8002 > /dev/null 2>&1; then
    echo "  ✅ Already running on :8002"
else
    nohup php "$BASE_DIR/laravel-api/artisan" serve --port=8002 \
        > /tmp/crm_laravel.log 2>&1 &
    echo "  ✅ Started (PID $!) — log: /tmp/crm_laravel.log"
fi

# 4. Nuxt 3 Frontend (port 3000)
echo ""
echo "→ Nuxt 3 Frontend (port 3000): starting..."
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && source "$NVM_DIR/nvm.sh"

if lsof -ti:3000 > /dev/null 2>&1; then
    echo "  ✅ Already running on :3000"
else
    cd "$BASE_DIR/frontend"
    nohup bash -c "TMPDIR=/tmp npx nuxt dev --port 3000 --host 0.0.0.0" \
        > /tmp/crm_nuxt.log 2>&1 &
    echo "  ✅ Started (PID $!) — log: /tmp/crm_nuxt.log"
fi

echo ""
echo "======================================================"
echo "  Services:"
echo "  🌐 Nuxt Frontend     → http://localhost:3000"
echo "  🔌 Laravel REST API  → http://localhost:8002/api/v1/..."
echo "  🔌 FastAPI REST API  → http://localhost:8001/api/docs"
echo "  📄 SSR Legacy        → http://localhost:8080"
echo "======================================================"
echo ""
echo "Menunggu semua service siap..."
sleep 5

# Quick health check
for PORT in 3000 8001 8080; do
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$PORT 2>/dev/null)
    if [ "$STATUS" != "000" ]; then
        echo "  ✅ :$PORT → HTTP $STATUS"
    else
        echo "  ⏳ :$PORT → masih starting..."
    fi
done

echo ""
echo "Login ke: http://localhost:3000"
echo "Email   : hariman@pkp.co.id"
echo "Password: pkp2026"
