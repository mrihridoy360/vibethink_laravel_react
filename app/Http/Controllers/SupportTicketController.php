<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\SupportTicket;
use App\Models\TicketCategory;
use App\Models\TicketReply;

class SupportTicketController extends Controller
{
    /**
     * List user's tickets.
     */
    public function index()
    {
        $user = Auth::user();

        $tickets = SupportTicket::where('user_id', $user->id)
            ->with(['category:id,name,color,icon', 'replies'])
            ->latest()
            ->get()
            ->map(function ($ticket) {
                $ticket->replies_count = $ticket->replies->count();
                unset($ticket->replies); // keep response lean
                return $ticket;
            });

        $categories = TicketCategory::where('is_active', true)
            ->orderBy('sort_order')
            ->get(['id', 'name', 'color', 'icon']);

        return response()->json([
            'success'    => true,
            'tickets'    => $tickets,
            'categories' => $categories,
        ]);
    }

    /**
     * Create a new ticket.
     */
    public function store(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'category_id' => 'required|exists:ticket_categories,id',
            'subject'     => 'required|string|max:255',
            'message'     => 'required|string',
            'priority'    => 'nullable|in:low,medium,high,urgent',
        ]);

        // Generate unique ticket number
        $ticketNumber = 'TK-' . strtoupper(substr(md5(uniqid()), 0, 8));

        $ticket = SupportTicket::create([
            'user_id'       => $user->id,
            'category_id'   => $validated['category_id'],
            'ticket_number' => $ticketNumber,
            'subject'       => $validated['subject'],
            'message'       => $validated['message'],
            'priority'      => $validated['priority'] ?? 'medium',
            'status'        => 'open',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'টিকেট সফলভাবে তৈরি হয়েছে।',
            'ticket'  => $ticket->load('category:id,name,color,icon'),
        ]);
    }

    /**
     * Show a specific ticket with replies.
     */
    public function show($id)
    {
        $user = Auth::user();

        $ticket = SupportTicket::where('user_id', $user->id)
            ->where('id', $id)
            ->with([
                'category:id,name,color,icon',
                'replies' => function ($q) {
                    $q->with('user:id,name,avatar')->orderBy('created_at');
                }
            ])
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'ticket'  => $ticket,
        ]);
    }

    /**
     * Add a reply to a ticket.
     */
    public function reply(Request $request, $id)
    {
        $user = Auth::user();

        $ticket = SupportTicket::where('user_id', $user->id)
            ->where('id', $id)
            ->firstOrFail();

        if (in_array($ticket->status, ['resolved', 'closed'])) {
            return response()->json([
                'success' => false,
                'message' => 'এই টিকেটটি বন্ধ হয়ে গেছে।',
            ], 422);
        }

        $validated = $request->validate([
            'message' => 'required|string',
        ]);

        $reply = TicketReply::create([
            'ticket_id'      => $ticket->id,
            'user_id'        => $user->id,
            'message'        => $validated['message'],
            'is_admin_reply' => false,
        ]);

        $ticket->update(['last_reply_at' => now()]);

        return response()->json([
            'success' => true,
            'message' => 'রিপ্লাই পাঠানো হয়েছে।',
            'reply'   => $reply->load('user:id,name,avatar'),
        ]);
    }
}
