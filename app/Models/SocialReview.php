<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SocialReview extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'review_url',
        'status',
        'admin_feedback',
    ];

    protected $casts = [
        'user_id' => 'integer',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
