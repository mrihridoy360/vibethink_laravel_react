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

    public function payment()
    {
        return $this->belongsTo(Payment::class);
    }

    /**
     * Credit this commission to referrer's wallet
     */
    public function creditToWallet(): bool
    {
        if ($this->status !== 'pending') {
            return false;
        }

        $wallet = UserWallet::getOrCreateForUser($this->referrer_id);
        
        $wallet->credit(
            $this->commission_amount,
            "Referral commission from {$this->referred->name} for {$this->course->title}",
            'referral_commission',
            $this->id
        );

        $this->status = 'credited';
        $this->credited_at = now();
        $this->save();

        return true;
    }
}
