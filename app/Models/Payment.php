<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    protected $fillable = [
        'user_id', 'course_id', 'amount', 'transaction_id',
        'payment_method', 'status', 'payment_data', 'coupon_id', 'coupon_discount',
    ];

    protected $casts = [
        'amount'          => 'decimal:2',
        'coupon_discount' => 'decimal:2',
        'payment_data'    => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function course()
    {
        return $this->belongsTo(Course::class);
    }
}
