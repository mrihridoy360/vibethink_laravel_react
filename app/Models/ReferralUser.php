<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReferralUser extends Model
{
    protected $fillable = [
        'user_id', 'referral_code', 'phone', 'payment_method',
        'payment_account', 'status', 'rejection_reason', 'approved_at',
    ];

    protected $casts = [
        'approved_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function commissions()
    {
        return $this->hasMany(ReferralCommission::class, 'referrer_id', 'user_id');
    }
}
