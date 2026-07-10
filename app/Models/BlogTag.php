<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Route;

class BlogTag extends Model
{
    protected $fillable = [
        'name', 'slug',
    ];

    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($tag) {
            if (empty($tag->slug)) {
                $tag->slug = Str::slug($tag->name);
            }
        });
    }

    public function posts()
    {
        return $this->belongsToMany(BlogPost::class, 'blog_post_tag');
    }

    public function publishedPosts()
    {
        return $this->belongsToMany(BlogPost::class, 'blog_post_tag')
            ->where('status', 'published')
            ->where('published_at', '<=', now());
    }

    public function getUrlAttribute()
    {
        return Route::has('blog.tag') ? route('blog.tag', $this->slug) : '#';
    }
}
