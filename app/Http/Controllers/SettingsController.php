<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class SettingsController extends Controller
{
    public function show()
    {
        $user = Auth::user();

        return Inertia::render('Settings', [
            'user' => [
                'name'              => $user->name,
                'email'             => $user->email,
                'brand_voice'       => $user->brand_voice,
                'default_platforms' => $user->default_platforms ?? ['linkedin', 'twitter', 'newsletter', 'video_script', 'quote'],
                'plan'              => $user->plan,
                'avatar_url'        => $user->avatar_url,
            ],
        ]);
    }

    public function update(Request $request)
    {
        $request->validate([
            'brand_voice'       => ['nullable', 'string', 'max:1000'],
            'default_platforms' => ['nullable', 'array'],
            'default_platforms.*' => ['in:linkedin,twitter,newsletter,video_script,quote'],
        ]);

        Auth::user()->update([
            'brand_voice'       => $request->brand_voice,
            'default_platforms' => $request->default_platforms,
        ]);

        return back()->with('success', 'Settings saved.');
    }
}
