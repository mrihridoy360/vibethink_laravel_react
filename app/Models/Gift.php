<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Gift extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'image',
        'code',
        'priority',
        'is_active',
        'is_locked',
        'expires_at',
        'created_by',
    ];

    protected $casts = [
        'is_active'  => 'boolean',
        'is_locked'  => 'boolean',
        'expires_at' => 'datetime',
        'created_by' => 'integer',
    ];

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
