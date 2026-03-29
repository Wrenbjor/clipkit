<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Video extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'youtube_url',
        'youtube_id',
        'title',
        'thumbnail_url',
        'duration_seconds',
        'channel_name',
        'status',
        'captions',
        'caption_segments',
        'error_message',
        'processing_started_at',
        'processing_completed_at',
    ];

    protected function casts(): array
    {
        return [
            'caption_segments'       => 'array',
            'processing_started_at'  => 'datetime',
            'processing_completed_at' => 'datetime',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function contentPieces()
    {
        return $this->hasMany(ContentPiece::class);
    }

    public function contentByPlatform(): array
    {
        return $this->contentPieces
            ->groupBy('platform')
            ->toArray();
    }

    public function isReady(): bool
    {
        return $this->status === 'ready';
    }

    public function hasFailed(): bool
    {
        return $this->status === 'failed';
    }

    public function isProcessing(): bool
    {
        return in_array($this->status, ['pending', 'fetching_captions', 'generating']);
    }

    public function formattedDuration(): string
    {
        if (!$this->duration_seconds) {
            return '';
        }
        $minutes = floor($this->duration_seconds / 60);
        $seconds = $this->duration_seconds % 60;
        if ($minutes >= 60) {
            $hours = floor($minutes / 60);
            $minutes = $minutes % 60;
            return sprintf('%d:%02d:%02d', $hours, $minutes, $seconds);
        }
        return sprintf('%d:%02d', $minutes, $seconds);
    }
}
