<?php

namespace App\Policies;

use App\Models\Collaboration\Channel;
use App\Models\User;
use App\Services\Collaboration\ChannelService;
use App\Services\Collaboration\WorkspaceService;

class ChannelPolicy
{
    public function __construct(
        protected ChannelService $channelService,
        protected WorkspaceService $workspaceService
    ) {}

    /**
     * Determine if the user can view the channel.
     */
    public function view(User $user, Channel $channel): bool
    {
        // For public channels, any workspace member can view
        if ($channel->type === 'public') {
            return $this->workspaceService->isMember($channel->workspace, $user);
        }

        // For private channels, user must be a channel member
        return $this->channelService->isMember($channel, $user);
    }

    /**
     * Determine if the user can create channels in a workspace.
     */
    public function create(User $user): bool
    {
        // Any authenticated user can create channels
        return true;
    }

    /**
     * Determine if the user can update the channel.
     */
    public function update(User $user, Channel $channel): bool
    {
        // Channel creator can always update
        if ($channel->creator_id === $user->id) {
            return true;
        }

        // Workspace admins/owners can update
        $workspaceRole = $this->workspaceService->getMemberRole($channel->workspace, $user);
        return in_array($workspaceRole, ['owner', 'admin']);
    }

    /**
     * Determine if the user can delete the channel.
     */
    public function delete(User $user, Channel $channel): bool
    {
        // Channel creator can delete
        if ($channel->creator_id === $user->id) {
            return true;
        }

        // Only workspace owner can delete channels they didn't create
        return $channel->workspace->owner_id === $user->id;
    }

    /**
     * Determine if the user can archive the channel.
     */
    public function archive(User $user, Channel $channel): bool
    {
        // Same permissions as update
        return $this->update($user, $channel);
    }

    /**
     * Determine if the user can unarchive the channel.
     */
    public function unarchive(User $user, Channel $channel): bool
    {
        // Same permissions as update
        return $this->update($user, $channel);
    }

    /**
     * Determine if the user can add members to the channel.
     */
    public function addMember(User $user, Channel $channel): bool
    {
        // For public channels, any workspace member can join
        if ($channel->type === 'public') {
            return $this->workspaceService->isMember($channel->workspace, $user);
        }

        // For private channels, only channel members or workspace admins can add
        if ($this->channelService->isMember($channel, $user)) {
            return true;
        }

        $workspaceRole = $this->workspaceService->getMemberRole($channel->workspace, $user);
        return in_array($workspaceRole, ['owner', 'admin']);
    }

    /**
     * Determine if the user can remove members from the channel.
     */
    public function removeMember(User $user, Channel $channel): bool
    {
        // Channel creator can remove members
        if ($channel->creator_id === $user->id) {
            return true;
        }

        // Workspace admins/owners can remove members
        $workspaceRole = $this->workspaceService->getMemberRole($channel->workspace, $user);
        return in_array($workspaceRole, ['owner', 'admin']);
    }

    /**
     * Determine if the user can send messages in the channel.
     */
    public function sendMessage(User $user, Channel $channel): bool
    {
        // Channel must not be archived
        if ($channel->is_archived) {
            return false;
        }

        // User must be able to view the channel
        return $this->view($user, $channel);
    }
}
