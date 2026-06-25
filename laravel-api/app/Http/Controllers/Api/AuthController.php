<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $email    = $request->input('email', $request->input('username'));
        $password = $request->input('password');

        if (!$email || !$password) {
            return response()->json(['detail' => 'Email dan password wajib diisi.'], 400);
        }

        $user = DB::selectOne(
            "SELECT u.id, u.nama, u.email, u.password, u.role_id, u.is_active,
                    u.avatar_color, u.avatar_photo,
                    r.nama as role_nama
             FROM users u
             LEFT JOIN roles r ON u.role_id = r.id
             WHERE u.email = ? AND u.is_active = 1",
            [$email]
        );

        if (!$user) {
            return response()->json(['detail' => 'Email tidak ditemukan atau akun tidak aktif.'], 401);
        }

        // Support SHA256 (existing DB), bcrypt, or plain
        $passMatch = ($user->password === hash('sha256', $password))
            || ($user->password === $password)
            || password_verify($password, $user->password);

        if (!$passMatch) {
            return response()->json(['detail' => 'Password salah.'], 401);
        }

        // Get allowed menus
        $menus = DB::select(
            "SELECT menu_key FROM role_menus WHERE role_id = ?",
            [$user->role_id]
        );
        $allowedMenus = array_column($menus, 'menu_key');

        // Build Eloquent user for JWT
        $eloquentUser = \App\Models\User::find($user->id);
        $token = JWTAuth::fromUser($eloquentUser);

        return response()->json([
            'access_token'  => $token,
            'token_type'    => 'bearer',
            'expires_in'    => config('jwt.ttl') * 60,
            'user' => [
                'id'            => $user->id,
                'nama'          => $user->nama,
                'email'         => $user->email,
                'role_id'       => $user->role_id,
                'role_nama'     => $user->role_nama,
                'is_admin'      => (int)$user->role_id === 1,
                'allowed_menus' => $allowedMenus,
                'avatar_color'  => $user->avatar_color,
                'avatar_photo'  => $user->avatar_photo,
            ],
        ]);
    }

    public function changePassword(Request $request)
    {
        $authUser = $request->attributes->get('auth_user');
        if (!$authUser) return response()->json(['message' => 'Unauthenticated.'], 401);

        $oldPass  = $request->input('old_password', '');
        $newPass  = $request->input('new_password', '');
        $confirm  = $request->input('confirm_password', '');

        if (!$oldPass || !$newPass || !$confirm) {
            return response()->json(['message' => 'Semua field wajib diisi.'], 422);
        }
        if (strlen($newPass) < 8) {
            return response()->json(['message' => 'Password baru minimal 8 karakter.'], 422);
        }
        if ($newPass !== $confirm) {
            return response()->json(['message' => 'Konfirmasi password tidak cocok.'], 422);
        }

        $user = DB::selectOne("SELECT id, password FROM users WHERE id=?", [$authUser['id']]);
        if (!$user) return response()->json(['message' => 'User tidak ditemukan.'], 404);

        // Verifikasi password lama (support SHA256 legacy & bcrypt)
        $valid = ($user->password === hash('sha256', $oldPass))
            || ($user->password === $oldPass)
            || password_verify($oldPass, $user->password);

        if (!$valid) {
            return response()->json(['message' => 'Password lama tidak sesuai.'], 422);
        }

        DB::table('users')
            ->where('id', $authUser['id'])
            ->update(['password' => password_hash($newPass, PASSWORD_BCRYPT)]);

        return response()->json(['message' => 'Password berhasil diubah.']);
    }

    public function logout(Request $request)
    {
        try {
            JWTAuth::parseToken()->invalidate();
        } catch (\Exception $e) {
            // Token already expired or invalid — treat as logged out
        }
        return response()->json(['message' => 'Logout berhasil.']);
    }

    public function me(Request $request)
    {
        $authUser = JWTAuth::parseToken()->authenticate();

        $user = DB::selectOne(
            "SELECT u.id, u.nama, u.email, u.role_id, u.is_active,
                    u.avatar_color, u.avatar_photo,
                    r.nama as role_nama
             FROM users u
             LEFT JOIN roles r ON u.role_id = r.id
             WHERE u.id = ?",
            [$authUser->id]
        );

        $menus = DB::select(
            "SELECT menu_key FROM role_menus WHERE role_id = ?",
            [$user->role_id]
        );
        $allowedMenus = array_column($menus, 'menu_key');

        return response()->json([
            'id'            => $user->id,
            'nama'          => $user->nama,
            'email'         => $user->email,
            'role_id'       => $user->role_id,
            'role_nama'     => $user->role_nama,
            'is_admin'      => (int)$user->role_id === 1,
            'allowed_menus' => $allowedMenus,
            'avatar_color'  => $user->avatar_color,
            'avatar_photo'  => $user->avatar_photo,
        ]);
    }
}
