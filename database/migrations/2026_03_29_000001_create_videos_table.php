<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('videos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->text('youtube_url');
            $table->string('youtube_id', 20);
            $table->text('title')->nullable();
            $table->text('thumbnail_url')->nullable();
            $table->integer('duration_seconds')->nullable();
            $table->string('channel_name')->nullable();
            $table->string('status', 20)->default('pending');
            $table->longText('captions')->nullable();
            $table->json('caption_segments')->nullable();
            $table->text('error_message')->nullable();
            $table->timestamp('processing_started_at')->nullable();
            $table->timestamp('processing_completed_at')->nullable();
            $table->timestamps();
        });

        Schema::table('videos', function (Blueprint $table) {
            $table->index('user_id');
            $table->index('status');
            $table->index('youtube_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('videos');
    }
};
