<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;

class YouTubeService
{
    public function extractVideoId(string $url): ?string
    {
        $patterns = [
            '/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/',
            '/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/',
        ];

        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $url, $matches)) {
                return $matches[1];
            }
        }

        return null;
    }

    public function fetchMetadata(string $videoId): array
    {
        $apiKey = config('services.youtube.api_key');

        if (!$apiKey) {
            return $this->fetchMetadataFromOembed($videoId);
        }

        try {
            $response = Http::get('https://www.googleapis.com/youtube/v3/videos', [
                'id'   => $videoId,
                'part' => 'snippet,contentDetails',
                'key'  => $apiKey,
            ]);

            $data = $response->json();

            if (empty($data['items'])) {
                throw new RuntimeException('Video not found');
            }

            $item    = $data['items'][0];
            $snippet = $item['snippet'];
            $details = $item['contentDetails'];

            return [
                'title'            => $snippet['title'],
                'thumbnail_url'    => $snippet['thumbnails']['maxres']['url']
                    ?? $snippet['thumbnails']['high']['url']
                    ?? $snippet['thumbnails']['default']['url'],
                'channel_name'     => $snippet['channelTitle'],
                'duration_seconds' => $this->parseDuration($details['duration']),
            ];
        } catch (\Exception $e) {
            Log::warning('YouTube API metadata fetch failed', ['error' => $e->getMessage()]);
            return $this->fetchMetadataFromOembed($videoId);
        }
    }

    private function fetchMetadataFromOembed(string $videoId): array
    {
        try {
            $response = Http::get('https://www.youtube.com/oembed', [
                'url'    => "https://www.youtube.com/watch?v={$videoId}",
                'format' => 'json',
            ]);

            $data = $response->json();

            return [
                'title'            => $data['title'] ?? null,
                'thumbnail_url'    => "https://img.youtube.com/vi/{$videoId}/maxresdefault.jpg",
                'channel_name'     => $data['author_name'] ?? null,
                'duration_seconds' => null,
            ];
        } catch (\Exception $e) {
            return [
                'title'            => null,
                'thumbnail_url'    => "https://img.youtube.com/vi/{$videoId}/maxresdefault.jpg",
                'channel_name'     => null,
                'duration_seconds' => null,
            ];
        }
    }

    public function fetchCaptions(string $videoId): array
    {
        // Try youtube-transcript Node package first
        $result = $this->fetchCaptionsViaNode($videoId);

        if ($result['success']) {
            return $result;
        }

        // Fallback: yt-dlp
        Log::info('youtube-transcript failed, trying yt-dlp', ['error' => $result['error']]);
        return $this->fetchCaptionsViaYtDlp($videoId);
    }

    private function fetchCaptionsViaNode(string $videoId): array
    {
        $scriptPath = base_path('scripts/fetch-transcript.mjs');
        $safeId     = escapeshellarg($videoId);
        $command    = "node {$scriptPath} {$safeId} 2>/dev/null";

        $output = shell_exec($command);

        if (!$output) {
            return ['success' => false, 'error' => 'Node script returned no output'];
        }

        $data = json_decode($output, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            return ['success' => false, 'error' => 'Invalid JSON from Node script'];
        }

        return $data;
    }

    private function fetchCaptionsViaYtDlp(string $videoId): array
    {
        $tmpDir  = sys_get_temp_dir();
        $safeId  = escapeshellarg($videoId);
        $url     = "https://www.youtube.com/watch?v={$videoId}";
        $safeUrl = escapeshellarg($url);
        $output  = escapeshellarg("{$tmpDir}/ck_{$videoId}");

        $command = "yt-dlp --write-auto-sub --sub-lang en --skip-download --sub-format json3 -o {$output} {$safeUrl} 2>&1";
        exec($command, $lines, $exitCode);

        $captionFile = "{$tmpDir}/ck_{$videoId}.en.json3";

        if (!file_exists($captionFile)) {
            return ['success' => false, 'error' => 'yt-dlp could not fetch captions. This video may not have captions available.'];
        }

        try {
            $json     = json_decode(file_get_contents($captionFile), true);
            $segments = [];
            $textParts = [];

            foreach ($json['events'] ?? [] as $event) {
                if (empty($event['segs'])) {
                    continue;
                }
                $segText = implode('', array_column($event['segs'], 'utf8'));
                $segText = trim($segText);
                if ($segText) {
                    $segments[]  = [
                        'text'     => $segText,
                        'offset'   => ($event['tStartMs'] ?? 0) / 1000,
                        'duration' => ($event['dDurationMs'] ?? 0) / 1000,
                    ];
                    $textParts[] = $segText;
                }
            }

            unlink($captionFile);

            if (empty($segments)) {
                return ['success' => false, 'error' => 'No caption content found in yt-dlp output'];
            }

            return [
                'success'  => true,
                'text'     => implode(' ', $textParts),
                'segments' => $segments,
            ];
        } catch (\Exception $e) {
            return ['success' => false, 'error' => 'Failed to parse caption file: ' . $e->getMessage()];
        }
    }

    private function parseDuration(string $isoDuration): int
    {
        preg_match('/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/', $isoDuration, $matches);
        return (int)($matches[1] ?? 0) * 3600
             + (int)($matches[2] ?? 0) * 60
             + (int)($matches[3] ?? 0);
    }
}
