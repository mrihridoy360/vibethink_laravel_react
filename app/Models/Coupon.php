<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Coupon extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'description',
        'type',
        'value',
        'min_purchase',
        'max_discount',
        'usage_limit',
        'usage_limit_per_user',
        'used_count',
        'applicable_courses',
        'applicable_categories',
        'starts_at',
        'expires_at',
        'is_active',
    ];

    protected $casts = [
        'value'                 => 'float',
        'min_purchase'          => 'float',
        'max_discount'          => 'float',
        'usage_limit'           => 'integer',
        'usage_limit_per_user'  => 'integer',
        'used_count'            => 'integer',
        'applicable_courses'    => 'array',
        'applicable_categories' => 'array',
        'starts_at'             => 'datetime',
        'expires_at'            => 'datetime',
        'is_active'             => 'boolean',
    ];

    public function usages()
    {
        return $this->hasMany(CouponUsage::class);
    }
}
