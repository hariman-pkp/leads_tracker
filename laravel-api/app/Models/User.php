<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use PHPOpenSourceSaver\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject
{
    protected $table = 'users';
    public $timestamps = false;

    protected $fillable = ['nama', 'email', 'password', 'role_id', 'is_active'];
    protected $hidden   = ['password'];

    protected $casts = [
        'is_active' => 'integer',
        'role_id'   => 'integer',
    ];

    // JWT required
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims(): array
    {
        return [];
    }

    public function role()
    {
        return $this->belongsTo(Role::class, 'role_id');
    }
}
