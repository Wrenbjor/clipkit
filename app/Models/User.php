<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Cashier\Billable;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, Billable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'google_id',
        'avatar_url',
        'plan',
        'videos_this_month',
        'plan_video_limit',
        'billing_cycle_start',
        'brand_voice',
        'default_platforms',
        'is_admin',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at'  => 'datetime',
            'billing_cycle_start' => 'date',
            'password'           => 'hashed',
            'is_admin'           => 'boolean',
            'default_platforms'  => 'array',
        ];
    }

    public function videos()
    {
        return $this->hasMany(Video::class);
    }

    public function isPro(): bool
    {
        return $this->plan === 'pro';
    }

    public function canProcessVideo(): bool
    {
        if ($this->isPro()) {
            return true;
        }
        return $this->videos_this_month < $this->plan_video_limit;
    }

    public function videosRemainingThisMonth(): int
    {
        if ($this->isPro()) {
            return PHP_INT_MAX;
        }
        return max(0, $this->plan_video_limit - $this->videos_this_month);
    }

    public function incrementVideoCount(): void
    {
        $this->increment('videos_this_month');
    }
}
