<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
use PHPOpenSourceSaver\JWTAuth\Exceptions\TokenExpiredException;
use PHPOpenSourceSaver\JWTAuth\Exceptions\TokenInvalidException;
use PHPOpenSourceSaver\JWTAuth\Exceptions\JWTException;

class JwtMiddleware
{
    public function handle(Request $request, Closure $next, string $menu = null)
    {
        try {
            $user = JWTAuth::parseToken()->authenticate();
        } catch (TokenExpiredException $e) {
            return response()->json(['detail' => 'Token expired.'], 401);
        } catch (TokenInvalidException $e) {
            return response()->json(['detail' => 'Token tidak valid.'], 401);
        } catch (JWTException $e) {
            return response()->json(['detail' => 'Token tidak ditemukan.'], 401);
        }

        if (!$user) {
            return response()->json(['detail' => 'User tidak ditemukan.'], 401);
        }

        // Get allowed menus
        $menus = DB::select(
            "SELECT menu_key FROM role_menus WHERE role_id = ?",
            [$user->role_id]
        );
        $allowedMenus = array_column($menus, 'menu_key');
        $roleId = (int) $user->role_id;

        // Check menu permission (admin bypasses all menu checks)
        if ($menu && $roleId !== 1 && !in_array($menu, $allowedMenus)) {
            return response()->json(['detail' => "Akses ke menu '$menu' tidak diizinkan."], 403);
        }

        $request->attributes->set('auth_user', [
            'id'            => $user->id,
            'nama'          => $user->nama,
            'email'         => $user->email,
            'role_id'       => $roleId,
            'is_admin'      => $roleId === 1,          // Admin saja
            'is_manager'    => $roleId <= 2,           // Admin & Manager
            'is_sales_only' => $roleId === 3,          // Sales saja
            'allowed_menus' => $allowedMenus,
        ]);

        return $next($request);
    }
}
