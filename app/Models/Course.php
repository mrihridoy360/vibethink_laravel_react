<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Course extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'category_id',
        'title',
        'slug',
        'short_description',
        'description',
        'language',
        'what_youll_learn',
        'requirements',
        'audience',
        'this_course_includes',
        'problems',
        'solutions',
        'seo_title',
        'seo_description',
        'seo_image',
        'thumbnail',
        'video_url',
        'price',
        'discount_price',
        'is_published',
    ];

    protected $casts = [
        'what_youll_learn' => 'array',
        'requirements' => 'array',
        'audience' => 'array',
        'this_course_includes' => 'array',
        'problems' => 'array',
        'solutions' => 'array',
        'is_published' => 'boolean',
        'price' => 'decimal:2',
        'discount_price' => 'decimal:2',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function chapters()
    {
        return $this->hasMany(Chapter::class)->orderBy('sort_order');
    }

    public function enrollments()
    {
        return $this->hasMany(Enrollment::class);
    }
}
