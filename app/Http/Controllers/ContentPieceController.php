<?php

namespace App\Http\Controllers;

use App\Models\ContentPiece;
use App\Services\ClaudeService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class ContentPieceController extends Controller
{
    public function update(Request $request, ContentPiece $contentPiece)
    {
        Gate::authorize('update', $contentPiece);

        $request->validate([
            'content' => ['required', 'string', 'max:10000'],
        ]);

        $contentPiece->update([
            'content'   => $request->content,
            'is_edited' => true,
        ]);

        return response()->json(['ok' => true]);
    }

    public function markCopied(ContentPiece $contentPiece)
    {
        Gate::authorize('update', $contentPiece);

        $contentPiece->update(['copied_at' => now()]);

        return response()->json(['ok' => true]);
    }

    public function regenerate(ContentPiece $contentPiece, ClaudeService $claude)
    {
        Gate::authorize('update', $contentPiece);

        $video = $contentPiece->video;

        if (!$video->captions) {
            return response()->json(['error' => 'No captions available for regeneration'], 422);
        }

        $newContent = $claude->regeneratePiece(
            $contentPiece->platform,
            $video->captions,
            $video->title ?? '',
            $video->user->brand_voice
        );

        $contentPiece->update([
            'content'   => $newContent,
            'is_edited' => true,
        ]);

        return response()->json(['content' => $newContent]);
    }
}
