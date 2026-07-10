<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class Tool extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'name',
        'slug',
        'description',
        'url',
        'icon',
        'thumbnail',
        'is_external',
        'is_featured',
        'is_active',
        'order',
        'button_text',
    ];

    protected $casts = [
        'is_external' => 'boolean',
        'is_featured' => 'boolean',
        'is_active' => 'boolean',
        'order' => 'integer',
        'category_id' => 'integer',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($tool) {
            if (empty($tool->slug)) {
                $tool->slug = Str::slug($tool->name);
                // Ensure uniqueness
                $originalSlug = $tool->slug;
                $count = 1;
                while (static::where('slug', $tool->slug)->exists()) {
                    $tool->slug = $originalSlug . '-' . $count++;
                }
            }
        });
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(ToolCategory::class, 'category_id');
    }
}
