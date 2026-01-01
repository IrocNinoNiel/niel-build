<?php

namespace App\Http\Resources\Collaboration;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MessageReactionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'emoji' => $this->emoji,
            'created_at' => $this->created_at?->toISOString(),
            'user' => new UserSimpleResource($this->whenLoaded('user')),
        ];
    }
}
