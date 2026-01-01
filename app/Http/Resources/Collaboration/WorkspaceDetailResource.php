<?php

namespace App\Http\Resources\Collaboration;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class WorkspaceDetailResource extends JsonResource
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
            'settings' => $this->settings,
            'is_active' => $this->is_active,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),

            // Relationships
            'owner' => new UserSimpleResource($this->whenLoaded('owner')),
            'members' => WorkspaceMemberResource::collection($this->whenLoaded('members')),
            'channels' => ChannelResource::collection($this->whenLoaded('channels')),

            // Counts
            'members_count' => $this->when(
                isset($this->members_count),
                $this->members_count
            ),
            'channels_count' => $this->when(
                isset($this->channels_count),
                $this->channels_count
            ),

            // Permissions for current user
            'can' => $this->when($request->user(), function () use ($request) {
                return [
                    'update' => $request->user()->can('update', $this->resource),
                    'delete' => $request->user()->can('delete', $this->resource),
                    'addMember' => $request->user()->can('addMember', $this->resource),
                    'removeMember' => $request->user()->can('removeMember', $this->resource),
                ];
            }),
        ];
    }
}
