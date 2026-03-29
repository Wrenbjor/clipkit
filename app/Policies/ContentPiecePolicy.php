<?php

namespace App\Policies;

use App\Models\ContentPiece;
use App\Models\User;

class ContentPiecePolicy
{
    public function update(User $user, ContentPiece $contentPiece): bool
    {
        return $user->id === $contentPiece->video->user_id || $user->is_admin;
    }
}
