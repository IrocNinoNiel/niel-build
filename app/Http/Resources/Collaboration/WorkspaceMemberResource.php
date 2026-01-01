<?php

namespace App\Http\Resources\Collaboration;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class WorkspaceMemberResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'role' => $this->role,
            'permissions' => $this->permissions,
            'joined_at' => $this->joined_at?->toISOString(),
            'last_seen_at' => $this->last_seen_at?->toISOString(),
            'is_active' => $this->is_active,

            // User relationship
            'user' => new UserSimpleResource($this->whenLoaded('user')),

            // Workspace relationship
            'workspace' => new WorkspaceResource($this->whenLoaded('workspace')),
        ];
    }
}
