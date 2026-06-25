<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProfileController extends Controller
{
    private function authUser(Request $request): array
    {
        return $request->attributes->get('auth_user', []);
    }

    // ── GET /v1/profile ───────────────────────────────────────────────────────
    public function show(Request $request)
    {
        $auth = $this->authUser($request);
        $user = DB::selectOne(
            "SELECT id, nama, email, role_id, avatar_color FROM users WHERE id = ?",
            [$auth['id']]
        );

        if (!$user) {
            return response()->json(['message' => 'User tidak ditemukan.'], 404);
        }

        return response()->json((array) $user);
    }

    // ── PATCH /v1/profile/avatar-color ───────────────────────────────────────
    public function updateAvatarColor(Request $request)
    {
        $auth = $this->authUser($request);

        $data = $request->validate([
            'avatar_color' => ['required', 'regex:/^#[0-9A-Fa-f]{6}$/'],
        ]);

        DB::update(
            "UPDATE users SET avatar_color = ? WHERE id = ?",
            [$data['avatar_color'], $auth['id']]
        );

        return response()->json([
            'avatar_color' => $data['avatar_color'],
            'message'      => 'Warna avatar berhasil diperbarui.',
        ]);
    }

    // ── POST /v1/profile/avatar-photo ─────────────────────────────────────────
    public function uploadAvatarPhoto(Request $request)
    {
        $auth = $this->authUser($request);

        $request->validate(['photo' => 'required|image|max:3072']);

        $file  = $request->file('photo');
        $fname = 'avatar_' . $auth['id'] . '_' . time() . '.' . $file->getClientOriginalExtension();
        $file->move(public_path('uploads/avatars'), $fname);
        $photoUrl = 'uploads/avatars/' . $fname;

        // Hapus foto lama
        $old = DB::selectOne("SELECT avatar_photo FROM users WHERE id = ?", [$auth['id']]);
        if ($old && $old->avatar_photo) {
            $oldPath = public_path($old->avatar_photo);
            if (file_exists($oldPath)) @unlink($oldPath);
        }

        DB::update("UPDATE users SET avatar_photo = ? WHERE id = ?", [$photoUrl, $auth['id']]);

        return response()->json([
            'avatar_photo' => $photoUrl,
            'message'      => 'Foto avatar berhasil diupload.',
        ]);
    }

    // ── DELETE /v1/profile/avatar-photo ──────────────────────────────────────
    public function deleteAvatarPhoto(Request $request)
    {
        $auth = $this->authUser($request);

        $row = DB::selectOne("SELECT avatar_photo FROM users WHERE id = ?", [$auth['id']]);
        if ($row && $row->avatar_photo) {
            $path = public_path($row->avatar_photo);
            if (file_exists($path)) @unlink($path);
        }

        DB::update("UPDATE users SET avatar_photo = NULL WHERE id = ?", [$auth['id']]);

        return response()->json(['message' => 'Foto avatar dihapus.']);
    }
}
