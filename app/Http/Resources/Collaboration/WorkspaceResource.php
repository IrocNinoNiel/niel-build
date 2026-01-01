<?php

namespace App\Http\Resources\Collaboration;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class WorkspaceResource extends JsonResource
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
            'avatar_url' => $this->avatar_url,
            'is_active' => $this->is_active,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),

            // Relationships
            'owner' => new UserSimpleResource($this->whenLoaded('owner')),

            // Counts
            'members_count' => $this->when(
                $this->relationLoaded('members'),
                fn () => $this->members_count ?? $this->members->count()
            ),
            'channels_count' => $this->when(
                isset($this->channels_count),
                $this->channels_count
            ),
        ];
    }
}
