<?php

namespace App\Jobs;

use App\Models\ContentPiece;
use App\Models\Video;
use App\Services\ClaudeService;
use App\Services\YouTubeService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Throwable;

class ProcessVideoJob implements ShouldQueue
{
    use Queueable, InteractsWithQueue, SerializesModels;

    public int $tries    = 3;
    public int $timeout  = 300;
    public int $backoff  = 30;

    public function __construct(public readonly int $videoId)
    {
    }

    public function handle(YouTubeService $youtube, ClaudeService $claude): void
    {
        $video = Video::find($this->videoId);

        if (!$video) {
            return;
        }

        $video->update([
            'status'               => 'fetching_captions',
            'processing_started_at' => now(),
        ]);

        // Step 1: Fetch captions
        $captionResult = $youtube->fetchCaptions($video->youtube_id);

        if (!$captionResult['success']) {
            $video->update([
                'status'        => 'failed',
                'error_message' => $captionResult['error'],
            ]);
            return;
        }

        $captions = $captionResult['text'];

        if (str_word_count($captions) < 50) {
            $video->update([
                'status'        => 'failed',
                'error_message' => "This video doesn't have enough spoken content to generate meaningful posts.",
            ]);
            return;
        }

        $video->update([
            'status'           => 'generating',
            'captions'         => $captions,
            'caption_segments' => $captionResult['segments'] ?? [],
        ]);

        // Step 2: Generate content with Claude
        $user    = $video->user;
        $options = [
            'brand_voice'    => $user->brand_voice,
            'video_title'    => $video->title,
            'platforms'      => $user->default_platforms ?? ['linkedin', 'twitter', 'newsletter', 'video_script', 'quote'],
        ];

        $contentData = $claude->generateContent($captions, $options);

        // Step 3: Persist content pieces
        $platformMap = [
            'linkedin'     => 'linkedin',
            'twitter'      => 'twitter',
            'newsletter'   => 'newsletter',
            'video_script' => 'video_script',
            'quote'        => 'quote',
        ];

        foreach ($platformMap as $key => $platform) {
            foreach ($contentData[$key] ?? [] as $piece) {
                ContentPiece::create([
                    'video_id' => $video->id,
                    'platform' => $platform,
                    'content'  => $piece['content'],
                    'metadata' => $piece['metadata'] ?? null,
                    'score'    => $piece['score'] ?? null,
                ]);
            }
        }

        $video->update([
            'status'                  => 'ready',
            'processing_completed_at' => now(),
        ]);

        // Increment user's monthly video count
        $user->incrementVideoCount();
    }

    public function failed(Throwable $exception): void
    {
        Log::error('ProcessVideoJob failed', [
            'video_id' => $this->videoId,
            'error'    => $exception->getMessage(),
        ]);

        Video::where('id', $this->videoId)->update([
            'status'        => 'failed',
            'error_message' => $this->attempts() >= $this->tries
                ? 'Processing failed after multiple attempts. Please try again.'
                : $exception->getMessage(),
        ]);
    }
}
