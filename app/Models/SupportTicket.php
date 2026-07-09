<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SupportTicket extends Model
{
    protected $fillable = [
        'user_id', 'course_id', 'category_id', 'ticket_number',
        'subject', 'message', 'priority', 'status', 'attachments',
        'assigned_to', 'last_reply_at', 'resolved_at', 'closed_at',
    ];

    protected $casts = [
        'attachments'  => 'array',
        'last_reply_at' => 'datetime',
        'resolved_at'   => 'datetime',
        'closed_at'     => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function category()
    {
        return $this->belongsTo(TicketCategory::class);
    }

    public function replies()
    {
        return $this->hasMany(TicketReply::class, 'ticket_id');
    }

    public function course()
    {
        return $this->belongsTo(Course::class);
    }
}
