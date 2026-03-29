<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Video;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AdminController extends Controller
{
    public function index()
    {
        $stats = [
            'total_users'         => User::count(),
            'pro_users'           => User::where('plan', 'pro')->count(),
            'total_videos'        => Video::count(),
            'videos_today'        => Video::whereDate('created_at', today())->count(),
            'videos_this_month'   => Video::whereMonth('created_at', now()->month)->count(),
            'failed_videos'       => Video::where('status', 'failed')->count(),
            'processing_videos'   => Video::whereIn('status', ['pending', 'fetching_captions', 'generating'])->count(),
        ];

        $recentUsers = User::latest()
            ->select('id', 'name', 'email', 'plan', 'videos_this_month', 'created_at')
            ->limit(20)
            ->get();

        $recentVideos = Video::with('user:id,name,email')
            ->latest()
            ->select('id', 'user_id', 'title', 'youtube_id', 'status', 'created_at')
            ->limit(20)
            ->get();

        return Inertia::render('Admin/Index', [
            'stats'        => $stats,
            'recentUsers'  => $recentUsers,
            'recentVideos' => $recentVideos,
        ]);
    }
}
