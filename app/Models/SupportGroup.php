<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SupportGroup extends Model
{
    protected $fillable = ['course_id', 'platform', 'url', 'is_active'];

    public function course()
    {
        return $this->belongsTo(Course::class);
    }
}
