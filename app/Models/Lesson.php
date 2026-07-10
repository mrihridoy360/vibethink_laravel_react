<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Lesson extends Model
{
    use HasFactory;

    protected $fillable = [
        'chapter_id',
        'title',
        'type',
        'provider',
        'slug',
        'content',
        'description',
        'attachment_path',
        'summary',
        'video_url',
        'duration',
        'is_published',
        'is_preview',
        'sort_order',
    ];

    protected $casts = [
        'is_published' => 'boolean',
        'is_preview' => 'boolean',
        'duration' => 'integer',
        'sort_order' => 'integer',
    ];

    public function chapter()
    {
        return $this->belongsTo(Chapter::class);
    }

    public function assignment()
    {
        return $this->hasOne(Assignment::class);
    }
}
