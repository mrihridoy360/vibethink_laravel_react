<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TicketCategory extends Model
{
    protected $fillable = ['name', 'slug', 'description', 'icon', 'color', 'is_active', 'sort_order'];

    public function tickets()
    {
        return $this->hasMany(SupportTicket::class, 'category_id');
    }
}
