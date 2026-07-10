<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Route;

class BlogPost extends Model
{
    protected $fillable = [
        'user_id', 'blog_category_id', 'title', 'slug', 'excerpt', 'content',
        'featured_image', 'featured_image_alt', 'meta_title', 'meta_description',
        'meta_keywords', 'canonical_url', 'og_image', 'schema_type', 'reading_time',
        'word_count', 'is_indexable', 'is_followable', 'status', 'published_at',
        'scheduled_at', 'views_count', 'related_courses',
    ];

    protected $casts = [
        'published_at'    => 'datetime',
        'scheduled_at'    => 'datetime',
        'is_indexable'    => 'boolean',
        'is_followable'   => 'boolean',
        'related_courses' => 'array',
    ];

    protected $appends = ['url', 'formatted_date', 'robots_meta'];

    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($post) {
            if (empty($post->slug)) {
                $post->slug = Str::slug($post->title);
            }
            $post->calculateReadingStats();
            $post->generateSeoDefaults();
        });

        static::updating(function ($post) {
            if ($post->isDirty('content')) {
                $post->calculateReadingStats();
            }
        });
    }

    public function calculateReadingStats()
    {
        $text = strip_tags($this->content ?? '');
        $wordCount = str_word_count($text);
        $this->word_count = $wordCount;
        $this->reading_time = max(1, ceil($wordCount / 200));
    }

    public function generateSeoDefaults()
    {
        if (empty($this->meta_title)) {
            $this->meta_title = Str::limit($this->title, 60);
        }
        if (empty($this->meta_description) && !empty($this->excerpt)) {
            $this->meta_description = Str::limit(strip_tags($this->excerpt), 160);
        }
        if (empty($this->featured_image_alt)) {
            $this->featured_image_alt = $this->title;
        }
    }

    public function author()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function category()
    {
        return $this->belongsTo(BlogCategory::class, 'blog_category_id');
    }

    public function tags()
    {
        return $this->belongsToMany(BlogTag::class, 'blog_post_tag');
    }

    public function relatedCourses()
    {
        if (empty($this->related_courses)) {
            return collect();
        }
        return Course::whereIn('id', $this->related_courses)->get();
    }

    public function scopePublished($query)
    {
        return $query->where('status', 'published')
                     ->where('published_at', '<=', now());
    }

    public function scopeIndexable($query)
    {
        return $query->where('is_indexable', true);
    }

    public function getUrlAttribute()
    {
        return Route::has('blog.show') ? route('blog.show', $this->slug) : '#';
    }

    public function getFormattedDateAttribute()
    {
        if ($this->published_at) {
            return $this->published_at->format('M d, Y');
        }
        if ($this->created_at) {
            return $this->created_at->format('M d, Y');
        }
        return 'N/A';
    }

    public function getRobotsMetaAttribute()
    {
        $robots = [];
        $robots[] = $this->is_indexable ? 'index' : 'noindex';
        $robots[] = $this->is_followable ? 'follow' : 'nofollow';
        return implode(', ', $robots);
    }

    public function getEffectiveMetaTitleAttribute()
    {
        return $this->meta_title ?: $this->title;
    }

    public function getEffectiveMetaDescriptionAttribute()
    {
        return $this->meta_description ?: Str::limit(strip_tags($this->excerpt ?: $this->content), 160);
    }

    public function getOgImageUrlAttribute()
    {
        return $this->og_image ?: $this->featured_image;
    }
}
