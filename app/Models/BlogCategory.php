<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Route;

class BlogCategory extends Model
{
    protected $fillable = [
        'name', 'slug', 'description', 'meta_title', 'meta_description',
    ];

    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($category) {
            if (empty($category->slug)) {
                $category->slug = Str::slug($category->name);
            }
            if (empty($category->meta_title)) {
                $category->meta_title = $category->name . ' - Blog Articles';
            }
        });
    }

    public function posts()
    {
        return $this->hasMany(BlogPost::class);
    }

    public function publishedPosts()
    {
        return $this->hasMany(BlogPost::class)
            ->where('status', 'published')
            ->where('published_at', '<=', now());
    }

    public function getUrlAttribute()
    {
        return Route::has('blog.category') ? route('blog.category', $this->slug) : '#';
    }
}
