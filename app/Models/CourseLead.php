<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CourseLead extends Model
{
    use HasFactory;

    protected $table = 'course_leads';

    protected $fillable = [
        'course_id',
        'name',
        'email',
        'notified',
        'notified_at',
    ];

    protected $casts = [
        'notified' => 'boolean',
        'notified_at' => 'datetime',
    ];

    public function course()
    {
        return $this->belongsTo(Course::class);
    }
}
