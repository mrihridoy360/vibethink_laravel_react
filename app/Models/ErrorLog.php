<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ErrorLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'type',
        'severity',
        'error_code',
        'message',
        'stack_trace',
        'file',
        'line',
        'url',
        'method',
        'request_data',
        'headers',
        'user_agent',
        'ip_address',
        'browser',
        'os',
        'device',
        'user_id',
        'user_email',
        'status',
        'resolution_notes',
        'resolved_by',
        'resolved_at',
        'occurrence_count',
        'last_occurred_at',
    ];

    protected $casts = [
        'line'             => 'integer',
        'request_data'     => 'array',
        'headers'          => 'array',
        'resolved_by'      => 'integer',
        'resolved_at'      => 'datetime',
        'occurrence_count' => 'integer',
        'last_occurred_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function resolver()
    {
        return $this->belongsTo(User::class, 'resolved_by');
    }
}
