<?php

namespace App\Http\Controllers;

use App\Models\Page;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class AdminPageController extends Controller
{
    /**
     * Verify admin role on every action.
     */
    private function ensureAdmin()
    {
        if (!Auth::check() || Auth::user()->role !== 'admin') {
            abort(403, 'অ্যাডমিন অ্যাক্সেস প্রয়োজন।');
        }
    }

    /**
     * Display a listing of the pages.
     */
    public function index()
    {
        $this->ensureAdmin();
        $pages = Page::orderBy('id', 'desc')->get();

        return response()->json([
            'success' => true,
            'pages' => $pages,
        ]);
    }

    /**
     * Display the specified page.
     */
    public function show($id)
    {
        $this->ensureAdmin();
        $page = Page::findOrFail($id);

        return response()->json([
            'success' => true,
            'page' => $page,
        ]);
    }

    /**
     * Store a newly created page in storage.
     */
    public function store(Request $request)
    {
        $this->ensureAdmin();

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:pages,slug',
            'content' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['title']);
        } else {
            $validated['slug'] = Str::slug($validated['slug']);
        }

        $page = Page::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'পেজটি সফলভাবে তৈরি করা হয়েছে।',
            'page' => $page,
        ]);
    }

    /**
     * Update the specified page in storage.
     */
    public function update(Request $request, $id)
    {
        $this->ensureAdmin();
        $page = Page::findOrFail($id);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:pages,slug,' . $page->id,
            'content' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $validated['slug'] = Str::slug($validated['slug']);

        $page->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'পেজটি সফলভাবে আপডেট করা হয়েছে।',
            'page' => $page->fresh(),
        ]);
    }

    /**
     * Remove the specified page from storage.
     */
    public function destroy($id)
    {
        $this->ensureAdmin();
        $page = Page::findOrFail($id);
        $page->delete();

        return response()->json([
            'success' => true,
            'message' => 'পেজটি সফলভাবে মুছে ফেলা হয়েছে।',
        ]);
    }

    /**
     * Toggle status of a page.
     */
    public function toggleStatus($id)
    {
        $this->ensureAdmin();
        $page = Page::findOrFail($id);
        $page->update([
            'is_active' => !$page->is_active
        ]);

        return response()->json([
            'success' => true,
            'message' => 'পেজের সক্রিয় অবস্থা পরিবর্তন করা হয়েছে।',
            'page' => $page->fresh(),
        ]);
    }
}
