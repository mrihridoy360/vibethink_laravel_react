<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Announcement extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'content',
        'type',
        'priority',
        'is_active',
        'is_pinned',
        'expires_at',
        'created_by',
        'course_id',
    ];

    protected $casts = [
        'is_active'  => 'boolean',
        'is_pinned'  => 'boolean',
        'expires_at' => 'datetime',
        'created_by' => 'integer',
        'course_id'  => 'integer',
    ];

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function course()
    {
        return $this->belongsTo(Course::class, 'course_id');
    }
}
