<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ContentPiece extends Model
{
    use HasFactory;

    protected $fillable = [
        'video_id',
        'platform',
        'content',
        'metadata',
        'source_segment_index',
        'score',
        'is_edited',
        'copied_at',
    ];

    protected function casts(): array
    {
        return [
            'metadata'   => 'array',
            'is_edited'  => 'boolean',
            'copied_at'  => 'datetime',
            'score'      => 'decimal:2',
        ];
    }

    public function video()
    {
        return $this->belongsTo(Video::class);
    }

    public function platformLabel(): string
    {
        return match($this->platform) {
            'linkedin'     => 'LinkedIn',
            'twitter'      => 'Twitter/X',
            'newsletter'   => 'Newsletter',
            'video_script' => 'Video Script',
            'quote'        => 'Quote',
            default        => ucfirst($this->platform),
        };
    }

    public function characterLimit(): ?int
    {
        return match($this->platform) {
            'linkedin'  => 3000,
            'twitter'   => 280,
            'quote'     => 150,
            default     => null,
        };
    }
}
