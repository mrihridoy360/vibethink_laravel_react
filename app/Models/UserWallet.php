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

    /**
     * Credit amount to wallet
     */
    public function credit(float $amount, string $description, ?string $referenceType = null, ?int $referenceId = null): WalletTransaction
    {
        $this->balance += $amount;
        $this->total_earned += $amount;
        $this->save();

        return WalletTransaction::create([
            'user_id' => $this->user_id,
            'type' => 'credit',
            'amount' => $amount,
            'balance_after' => $this->balance,
            'description' => $description,
            'reference_type' => $referenceType,
            'reference_id' => $referenceId,
        ]);
    }

    /**
     * Debit amount from wallet
     */
    public function debit(float $amount, string $description, ?string $referenceType = null, ?int $referenceId = null): ?WalletTransaction
    {
        if ($this->balance < $amount) {
            return null; // Insufficient balance
        }

        $this->balance -= $amount;
        
        if ($referenceType === 'course_purchase' || $referenceType === 'product_purchase') {
            $this->total_spent += $amount;
        } elseif ($referenceType === 'withdrawal') {
            $this->total_withdrawn += $amount;
        }
        
        $this->save();

        return WalletTransaction::create([
            'user_id' => $this->user_id,
            'type' => 'debit',
            'amount' => $amount,
            'balance_after' => $this->balance,
            'description' => $description,
            'reference_type' => $referenceType,
            'reference_id' => $referenceId,
        ]);
    }

    /**
     * Get or create wallet for user
     */
    public static function getOrCreateForUser(int $userId): self
    {
        return self::firstOrCreate(
            ['user_id' => $userId],
            ['balance' => 0, 'total_earned' => 0, 'total_withdrawn' => 0, 'total_spent' => 0]
        );
    }
}
