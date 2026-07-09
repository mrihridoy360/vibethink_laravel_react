<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReferralSetting extends Model
{
    protected $fillable = [
        'commission_percentage', 'auto_approve', 'is_active',
        'minimum_payout', 'terms_conditions',
    ];

    protected $casts = [
        'commission_percentage' => 'decimal:2',
        'minimum_payout'        => 'decimal:2',
        'auto_approve'          => 'boolean',
        'is_active'             => 'boolean',
    ];
}
