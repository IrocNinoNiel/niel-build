<?php

namespace App\Services\Collaboration;

use App\Events\Collaboration\ChannelCreated;
use App\Events\Collaboration\ChannelUpdated;
use App\Models\Collaboration\Channel;
use App\Models\Collaboration\ChannelMember;
use App\Models\Collaboration\Workspace;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ChannelService
{
    public function createChannel(Workspace $workspace, array $data, User $creator): Channel
    {
        return DB::transaction(function () use ($workspace, $data, $creator) {
            $channel = Channel::create([
                'uuid' => Str::uuid(),
                'workspace_id' => $workspace->id,
                'creator_id' => $creator->id,
                'name' => $data['name'],
                'slug' => $data['slug'] ?? Str::slug($data['name']),
                'description' => $data['description'] ?? null,
                'type' => $data['type'] ?? 'public',
                'settings' => $data['settings'] ?? [],
            ]);

            // Auto-add creator as admin
            $this->addMember($channel, $creator, 'admin');

            event(new ChannelCreated($channel));

            return $channel->load(['creator', 'workspace', 'members.user']);
        });
    }

    public function updateChannel(Channel $channel, array $data): Channel
    {
        $channel->update([
            'name' => $data['name'] ?? $channel->name,
            'slug' => $data['slug'] ?? $channel->slug,
            'description' => $data['description'] ?? $channel->description,
            'settings' => $data['settings'] ?? $channel->settings,
        ]);

        event(new ChannelUpdated($channel));

        return $channel->fresh(['creator', 'workspace', 'members.user']);
    }

    public function archiveChannel(Channel $channel): void
    {
        $channel->update([
            'is_archived' => true,
            'archived_at' => now(),
        ]);
    }

    public function unarchiveChannel(Channel $channel): void
    {
        $channel->update([
            'is_archived' => false,
            'archived_at' => null,
        ]);
    }

    public function deleteChannel(Channel $channel): bool
    {
        return $channel->delete();
    }

    public function addMember(Channel $channel, User $user, string $role = 'member'): ChannelMember
    {
        return ChannelMember::updateOrCreate(
            [
                'channel_id' => $channel->id,
                'user_id' => $user->id,
            ],
            [
                'role' => $role,
                'joined_at' => now(),
                'notification_preference' => 'all',
            ]
        );
    }

    public function removeMember(Channel $channel, User $user): bool
    {
        return ChannelMember::where('channel_id', $channel->id)
            ->where('user_id', $user->id)
            ->delete();
    }

    public function getWorkspaceChannels(Workspace $workspace, bool $includeArchived = false)
    {
        $query = $workspace->channels()->with(['creator', 'members']);

        if (!$includeArchived) {
            $query->where('is_archived', false);
        }

        return $query->orderBy('created_at', 'desc')->get();
    }

    public function isMember(Channel $channel, User $user): bool
    {
        return ChannelMember::where('channel_id', $channel->id)
            ->where('user_id', $user->id)
            ->exists();
    }
}
