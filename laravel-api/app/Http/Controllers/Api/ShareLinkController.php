<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Http\Controllers\Api\RevenueController;

class ShareLinkController extends Controller
{
    private function ensureTable(): void
    {
        DB::statement("
            CREATE TABLE IF NOT EXISTS share_links (
                id          SERIAL PRIMARY KEY,
                resource    VARCHAR(50)  NOT NULL,
                token       VARCHAR(64)  NOT NULL UNIQUE,
                password_hash VARCHAR(255) NOT NULL,
                created_at  TIMESTAMP DEFAULT NOW(),
                updated_at  TIMESTAMP DEFAULT NOW()
            )
        ");
    }

    // GET /api/v1/share-links/annual-target  (protected)
    public function getAnnualTarget()
    {
        $this->ensureTable();
        $row = DB::selectOne("SELECT token FROM share_links WHERE resource='annual_target' LIMIT 1");
        if (!$row) return response()->json(['token' => null, 'url' => null]);

        $url = config('app.frontend_url', config('app.url')) . '/share/annual-target/' . $row->token;
        return response()->json(['token' => $row->token, 'url' => $url]);
    }

    // POST /api/v1/share-links/annual-target/generate  (protected)
    public function generateAnnualTarget(Request $request)
    {
        $this->ensureTable();
        $password = $request->input('password');
        if (!$password || strlen($password) < 4) {
            return response()->json(['message' => 'Password minimal 4 karakter.'], 422);
        }

        $token = Str::random(48);
        $hash  = password_hash($password, PASSWORD_BCRYPT);

        DB::statement("DELETE FROM share_links WHERE resource='annual_target'");
        DB::statement(
            "INSERT INTO share_links (resource, token, password_hash) VALUES ('annual_target', ?, ?)",
            [$token, $hash]
        );

        $url = config('app.frontend_url', config('app.url')) . '/share/annual-target/' . $token;
        return response()->json(['token' => $token, 'url' => $url]);
    }

    // POST /api/v1/public/annual-target/{token}/verify  (public)
    public function verifyAnnualTarget(Request $request, string $token)
    {
        $this->ensureTable();
        $row = DB::selectOne("SELECT password_hash FROM share_links WHERE resource='annual_target' AND token=?", [$token]);
        if (!$row) return response()->json(['message' => 'Link tidak valid.'], 404);

        $password = $request->input('password', '');
        if (!password_verify($password, $row->password_hash)) {
            return response()->json(['message' => 'Password salah.'], 401);
        }

        $tahun = (int)$request->input('tahun', now()->year);
        $request->merge(['tahun' => $tahun]);
        $summary = (new AnnualTargetController)->summary($request)->getData(true);
        return response()->json(['ok' => true, 'summary' => $summary, 'tahun' => $tahun]);
    }

    // GET /api/v1/public/annual-target/{token}  (public) - check token valid
    public function checkToken(string $token)
    {
        $this->ensureTable();
        $row = DB::selectOne("SELECT id FROM share_links WHERE resource='annual_target' AND token=?", [$token]);
        if (!$row) return response()->json(['valid' => false], 404);
        return response()->json(['valid' => true]);
    }

    // ── Revenue Dashboard Share ───────────────────────────────────────────

    public function getDashboard()
    {
        $this->ensureTable();
        $row = DB::selectOne("SELECT token FROM share_links WHERE resource='revenue_dashboard' LIMIT 1");
        if (!$row) return response()->json(['token' => null, 'url' => null]);
        $url = config('app.frontend_url', config('app.url')) . '/share/revenue-dashboard/' . $row->token;
        return response()->json(['token' => $row->token, 'url' => $url]);
    }

    public function generateDashboard(Request $request)
    {
        $this->ensureTable();
        $password = $request->input('password');
        if (!$password || strlen($password) < 4) {
            return response()->json(['message' => 'Password minimal 4 karakter.'], 422);
        }
        $token = Str::random(48);
        $hash  = password_hash($password, PASSWORD_BCRYPT);
        DB::statement("DELETE FROM share_links WHERE resource='revenue_dashboard'");
        DB::statement(
            "INSERT INTO share_links (resource, token, password_hash) VALUES ('revenue_dashboard', ?, ?)",
            [$token, $hash]
        );
        $url = config('app.frontend_url', config('app.url')) . '/share/revenue-dashboard/' . $token;
        return response()->json(['token' => $token, 'url' => $url]);
    }

    public function checkTokenDashboard(string $token)
    {
        $this->ensureTable();
        $row = DB::selectOne("SELECT id FROM share_links WHERE resource='revenue_dashboard' AND token=?", [$token]);
        if (!$row) return response()->json(['valid' => false], 404);
        return response()->json(['valid' => true]);
    }

    public function verifyDashboard(Request $request, string $token)
    {
        $this->ensureTable();
        $row = DB::selectOne("SELECT password_hash FROM share_links WHERE resource='revenue_dashboard' AND token=?", [$token]);
        if (!$row) return response()->json(['message' => 'Link tidak valid.'], 404);

        $password = $request->input('password', '');
        if (!password_verify($password, $row->password_hash)) {
            return response()->json(['message' => 'Password salah.'], 401);
        }

        $tahun = (int)$request->input('tahun', now()->year);
        $request->merge(['tahun' => $tahun]);
        $data = (new RevenueController)->summary($request)->getData(true);
        return response()->json(['ok' => true, 'data' => $data, 'tahun' => $tahun]);
    }

}
