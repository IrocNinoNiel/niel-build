<?php

namespace App\Http\Resources\Collaboration;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MessageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'content' => $this->content,
            'content_type' => $this->content_type,
            'metadata' => $this->metadata,
            'is_pinned' => $this->is_pinned,
            'pinned_at' => $this->pinned_at?->toISOString(),
            'edited_at' => $this->edited_at?->toISOString(),
            'created_at' => $this->created_at?->toISOString(),

            'user' => new UserSimpleResource($this->whenLoaded('user')),
            'channel' => new ChannelResource($this->whenLoaded('channel')),
            'reactions' => MessageReactionResource::collection($this->whenLoaded('reactions')),
            'replies' => MessageResource::collection($this->whenLoaded('replies')),

            'reactions_count' => $this->when(isset($this->reactions_count), $this->reactions_count),
            'replies_count' => $this->when(isset($this->replies_count), $this->replies_count),
        ];
    }
}
