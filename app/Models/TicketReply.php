<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TicketReply extends Model
{
    protected $fillable = [
        'ticket_id', 'user_id', 'message', 'attachments',
        'is_admin_reply', 'is_internal_note',
    ];

    protected $casts = [
        'attachments'      => 'array',
        'is_admin_reply'   => 'boolean',
        'is_internal_note' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function ticket()
    {
        return $this->belongsTo(SupportTicket::class, 'ticket_id');
    }
}
