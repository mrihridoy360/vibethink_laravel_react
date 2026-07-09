<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserWallet extends Model
{
    protected $fillable = ['user_id', 'balance', 'total_earned', 'total_withdrawn', 'total_spent'];

    protected $casts = [
        'balance'          => 'decimal:2',
        'total_earned'     => 'decimal:2',
        'total_withdrawn'  => 'decimal:2',
        'total_spent'      => 'decimal:2',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function transactions()
    {
        return $this->hasMany(WalletTransaction::class, 'user_id', 'user_id');
    }
}
