<?php

namespace App\Http\Controllers;

use App\Jobs\ProcessVideoJob;
use App\Models\Video;
use App\Services\YouTubeService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class VideoController extends Controller
{
    public function __construct(private YouTubeService $youtube)
    {
    }

    public function index()
    {
        $user   = Auth::user();
        $videos = $user->videos()
            ->select('id', 'youtube_id', 'title', 'thumbnail_url', 'duration_seconds', 'channel_name', 'status', 'created_at', 'processing_completed_at')
            ->latest()
            ->paginate(20);

        return Inertia::render('Dashboard', [
            'videos'             => $videos,
            'videosRemaining'    => $user->videosRemainingThisMonth(),
            'isPro'              => $user->isPro(),
            'videosThisMonth'    => $user->videos_this_month,
            'planVideoLimit'     => $user->plan_video_limit,
        ]);
    }

    public function create()
    {
        return Inertia::render('Videos/New');
    }

    public function store(Request $request)
    {
        $request->validate([
            'url'             => ['required', 'string', 'url'],
            'topic_emphasis'  => ['nullable', 'string', 'max:500'],
        ]);

        $user = Auth::user();

        if (!$user->canProcessVideo()) {
            return back()->withErrors([
                'url' => "You've used all {$user->plan_video_limit} free videos this month. Upgrade to Pro for unlimited processing.",
            ]);
        }

        $videoId = $this->youtube->extractVideoId($request->url);

        if (!$videoId) {
            return back()->withErrors(['url' => 'That doesn\'t look like a valid YouTube URL.']);
        }

        // Check duplicate within 24h
        $existing = $user->videos()
            ->where('youtube_id', $videoId)
            ->where('created_at', '>=', now()->subHours(24))
            ->whereIn('status', ['ready', 'generating', 'fetching_captions'])
            ->first();

        if ($existing) {
            return redirect()->route('videos.show', $existing->id)
                ->with('info', 'We already processed this video recently. Showing the existing result.');
        }

        $metadata = $this->youtube->fetchMetadata($videoId);

        $video = $user->videos()->create([
            'youtube_url'    => $request->url,
            'youtube_id'     => $videoId,
            'title'          => $metadata['title'],
            'thumbnail_url'  => $metadata['thumbnail_url'],
            'duration_seconds' => $metadata['duration_seconds'],
            'channel_name'   => $metadata['channel_name'],
            'status'         => 'pending',
        ]);

        ProcessVideoJob::dispatch($video->id)
            ->onQueue('videos');

        return redirect()->route('videos.show', $video->id);
    }

    public function show(Video $video)
    {
        $this->authorize('view', $video);

        $video->load('contentPieces');

        $contentByPlatform = $video->contentPieces
            ->groupBy('platform')
            ->map(fn ($pieces) => $pieces->values())
            ->toArray();

        return Inertia::render('Videos/Show', [
            'video'            => array_merge($video->only([
                'id', 'youtube_id', 'title', 'thumbnail_url', 'duration_seconds',
                'channel_name', 'status', 'error_message', 'created_at',
                'processing_started_at', 'processing_completed_at',
            ]), [
                'formatted_duration' => $video->formattedDuration(),
            ]),
            'contentByPlatform' => $contentByPlatform,
        ]);
    }

    public function status(Video $video)
    {
        $this->authorize('view', $video);

        $response = [
            'status'        => $video->status,
            'error_message' => $video->error_message,
        ];

        if ($video->isReady()) {
            $video->load('contentPieces');
            $response['content_count'] = $video->contentPieces->count();
        }

        return response()->json($response);
    }

    public function destroy(Video $video)
    {
        $this->authorize('delete', $video);
        $video->delete();
        return redirect()->route('dashboard');
    }
}
