<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReferralCommission extends Model
{
    protected $fillable = [
        'referrer_id', 'referred_id', 'payment_id', 'course_id',
        'course_amount', 'commission_percentage', 'commission_amount',
        'status', 'credited_at',
    ];

    protected $casts = [
        'course_amount'          => 'decimal:2',
        'commission_percentage'  => 'decimal:2',
        'commission_amount'      => 'decimal:2',
        'credited_at'            => 'datetime',
    ];

    public function referrer()
    {
        return $this->belongsTo(User::class, 'referrer_id');
    }

    public function referred()
    {
        return $this->belongsTo(User::class, 'referred_id');
    }

    public function course()
    {
        return $this->belongsTo(Course::class);
    }
}
