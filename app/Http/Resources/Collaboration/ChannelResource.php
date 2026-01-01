<?php

namespace App\Http\Resources\Collaboration;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ChannelResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'type' => $this->type,
            'is_archived' => $this->is_archived,
            'archived_at' => $this->archived_at?->toISOString(),
            'created_at' => $this->created_at?->toISOString(),

            // Relationships
            'creator' => new UserSimpleResource($this->whenLoaded('creator')),
            'workspace' => new WorkspaceResource($this->whenLoaded('workspace')),
        ];
    }
}
