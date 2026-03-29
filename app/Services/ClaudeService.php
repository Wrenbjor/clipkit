<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;

class ClaudeService
{
    private string $apiKey;
    private string $model;
    private string $baseUrl = 'https://api.anthropic.com/v1';

    public function __construct()
    {
        $this->apiKey = config('services.anthropic.api_key');
        $this->model  = config('services.anthropic.model', 'claude-sonnet-4-6');
    }

    public function generateContent(string $captions, array $options = []): array
    {
        $brandVoice     = $options['brand_voice'] ?? null;
        $topicEmphasis  = $options['topic_emphasis'] ?? null;
        $platforms      = $options['platforms'] ?? ['linkedin', 'twitter', 'newsletter', 'video_script', 'quote'];
        $videoTitle     = $options['video_title'] ?? 'this video';

        $voiceInstruction = $brandVoice
            ? "Brand voice: {$brandVoice}. Maintain this voice consistently across all content."
            : "Use a professional yet conversational tone.";

        $topicInstruction = $topicEmphasis
            ? "Key topics to emphasize: {$topicEmphasis}."
            : '';

        $prompt = <<<PROMPT
You are a social media content strategist. Your job is to transform YouTube video transcripts into high-performing social media content.

VIDEO TITLE: {$videoTitle}

TRANSCRIPT:
{$captions}

{$voiceInstruction}
{$topicInstruction}

Generate exactly 15 pieces of social media content from this transcript. You must return a valid JSON object with this exact structure:

{
  "linkedin": [
    {
      "content": "full post text here",
      "score": 8.5,
      "metadata": { "char_count": 450, "hook": "first line of the post" }
    }
  ],
  "twitter": [
    {
      "content": "thread tweet 1\n\ntweet 2\n\ntweet 3",
      "score": 7.8,
      "metadata": { "tweet_count": 3 }
    }
  ],
  "newsletter": [
    {
      "content": "subject: Subject Line Here\n\nBody paragraph here...",
      "score": 8.2,
      "metadata": { "subject": "Subject Line Here", "word_count": 180 }
    }
  ],
  "video_script": [
    {
      "content": "HOOK (0-3s): ...\n\nBODY (10-45s): ...\n\nCTA (3-5s): ...",
      "score": 8.0,
      "metadata": { "estimated_duration": "45-60 seconds" }
    }
  ],
  "quote": [
    {
      "content": "The quote text here",
      "score": 9.1,
      "metadata": { "char_count": 95 }
    }
  ]
}

Requirements:
- linkedin: exactly 5 posts. Each post: hook line + 3-5 paragraphs + engagement question CTA. Under 3000 chars each.
- twitter: exactly 3 threads. Each thread: 4-8 tweets separated by double newlines. First tweet standalone value. Each individual tweet under 280 chars.
- newsletter: exactly 2 entries. Format: "subject: [line]\n\n[150-250 word intro body]". Short paragraphs. Bold key phrases with **bold**.
- video_script: exactly 3 scripts. Format: "HOOK (0-3s): [text]\n\nBODY (10-45s): [text]\n\nCTA (3-5s): [text]". Include estimated duration.
- quote: exactly 2 quotes. Under 25 words each. Punchy and attributable.

Quality rules:
- No AI artifacts ("As an AI...", "Here's a...", "Certainly!", etc.)
- No content that merely summarizes — each piece must add perspective, framing, or a specific insight
- For linkedin: start with a pattern interrupt (question, bold statement, or surprising stat)
- For twitter: each thread must be completable as standalone content
- For quotes: pull the most memorable/counterintuitive line from the transcript

Return ONLY the JSON object, no other text.
PROMPT;

        $response = Http::withHeaders([
            'x-api-key'         => $this->apiKey,
            'anthropic-version' => '2023-06-01',
            'content-type'      => 'application/json',
        ])->timeout(120)->post("{$this->baseUrl}/messages", [
            'model'      => $this->model,
            'max_tokens' => 8000,
            'messages'   => [
                ['role' => 'user', 'content' => $prompt],
            ],
        ]);

        if (!$response->successful()) {
            throw new RuntimeException("Claude API error: {$response->status()} — {$response->body()}");
        }

        $body    = $response->json();
        $rawText = $body['content'][0]['text'] ?? '';

        return $this->parseAndValidate($rawText);
    }

    private function parseAndValidate(string $rawText): array
    {
        // Strip markdown code fences if present
        $text = preg_replace('/^```(?:json)?\s*/m', '', $rawText);
        $text = preg_replace('/\s*```$/m', '', $text);
        $text = trim($text);

        $data = json_decode($text, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            Log::error('Claude returned invalid JSON', ['raw' => substr($rawText, 0, 500)]);
            throw new RuntimeException('Claude returned invalid JSON: ' . json_last_error_msg());
        }

        $required = ['linkedin', 'twitter', 'newsletter', 'video_script', 'quote'];
        foreach ($required as $platform) {
            if (empty($data[$platform])) {
                throw new RuntimeException("Claude response missing platform: {$platform}");
            }
        }

        // Validate character limits
        foreach ($data['linkedin'] as &$post) {
            if (strlen($post['content']) > 3000) {
                $post['content'] = substr($post['content'], 0, 2997) . '...';
            }
        }

        foreach ($data['quote'] as &$quote) {
            $wordCount = str_word_count($quote['content']);
            if ($wordCount > 35) {
                Log::warning('Quote over word limit', ['content' => $quote['content']]);
            }
        }

        // Strip AI artifacts
        $artifacts = ['As an AI', 'As a language model', "Here's a", 'Certainly!', 'Of course!', 'Sure!'];
        foreach ($required as $platform) {
            foreach ($data[$platform] as &$piece) {
                foreach ($artifacts as $artifact) {
                    if (str_contains($piece['content'], $artifact)) {
                        throw new RuntimeException("Claude output contains AI artifact: {$artifact}");
                    }
                }
            }
        }

        return $data;
    }

    public function regeneratePiece(string $platform, string $captions, string $videoTitle, ?string $brandVoice = null): string
    {
        $voiceInstruction = $brandVoice
            ? "Brand voice: {$brandVoice}."
            : "Use a professional yet conversational tone.";

        $platformInstructions = match($platform) {
            'linkedin'     => 'Generate 1 LinkedIn post: hook line + 3-5 short paragraphs + engagement question. Under 3000 chars. No AI artifacts.',
            'twitter'      => 'Generate 1 Twitter thread: 4-8 tweets separated by double newlines. Each tweet under 280 chars. First tweet has standalone value.',
            'newsletter'   => 'Generate 1 newsletter intro: format "subject: [line]\n\n[150-250 word body]". Short paragraphs.',
            'video_script' => 'Generate 1 short-form video script: "HOOK (0-3s): [text]\n\nBODY (10-45s): [text]\n\nCTA (3-5s): [text]".',
            'quote'        => 'Extract 1 highly quotable line from the transcript. Under 25 words. Punchy and memorable.',
            default        => 'Generate 1 piece of social media content.',
        };

        $prompt = <<<PROMPT
VIDEO TITLE: {$videoTitle}

TRANSCRIPT:
{$captions}

{$voiceInstruction}

{$platformInstructions}

Return ONLY the content text itself. No JSON wrapper, no labels, no extra text.
PROMPT;

        $response = Http::withHeaders([
            'x-api-key'         => $this->apiKey,
            'anthropic-version' => '2023-06-01',
            'content-type'      => 'application/json',
        ])->timeout(60)->post("{$this->baseUrl}/messages", [
            'model'      => $this->model,
            'max_tokens' => 1500,
            'messages'   => [
                ['role' => 'user', 'content' => $prompt],
            ],
        ]);

        if (!$response->successful()) {
            throw new RuntimeException("Claude API error: {$response->status()}");
        }

        $body = $response->json();
        return trim($body['content'][0]['text'] ?? '');
    }
}
