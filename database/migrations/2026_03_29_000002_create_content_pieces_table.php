<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('content_pieces', function (Blueprint $table) {
            $table->id();
            $table->foreignId('video_id')->constrained()->cascadeOnDelete();
            $table->string('platform', 20);
            $table->longText('content');
            $table->json('metadata')->nullable();
            $table->integer('source_segment_index')->nullable();
            $table->decimal('score', 4, 2)->nullable();
            $table->boolean('is_edited')->default(false);
            $table->timestamp('copied_at')->nullable();
            $table->timestamps();
        });

        Schema::table('content_pieces', function (Blueprint $table) {
            $table->index('video_id');
            $table->index('platform');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('content_pieces');
    }
};
