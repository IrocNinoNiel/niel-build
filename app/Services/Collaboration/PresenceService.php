<?php

namespace App\Services\Collaboration;

use App\Enums\Collaboration\PresenceStatus;
use App\Models\Collaboration\Channel;
use App\Models\Collaboration\UserPresence;
use App\Models\Collaboration\Workspace;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class PresenceService
{
    /**
     * Update user presence status in a workspace
     */
    public function updateWorkspacePresence(
        Workspace $workspace,
        User $user,
        PresenceStatus $status = PresenceStatus::ONLINE
    ): UserPresence {
        return UserPresence::updateOrCreate(
            [
                'user_id' => $user->id,
                'workspace_id' => $workspace->id,
                'channel_id' => null,
            ],
            [
                'status' => $status->value,
                'last_seen_at' => now(),
                'metadata' => [],
            ]
        );
    }

    /**
     * Update user presence status in a channel
     */
    public function updateChannelPresence(
        Channel $channel,
        User $user,
        PresenceStatus $status = PresenceStatus::ONLINE
    ): UserPresence {
        return UserPresence::updateOrCreate(
            [
                'user_id' => $user->id,
                'workspace_id' => $channel->workspace_id,
                'channel_id' => $channel->id,
            ],
            [
                'status' => $status->value,
                'last_seen_at' => now(),
                'metadata' => [
                    'channel_name' => $channel->name,
                ],
            ]
        );
    }

    /**
     * Set user as offline in a workspace
     */
    public function setOffline(Workspace $workspace, User $user): void
    {
        UserPresence::where('workspace_id', $workspace->id)
            ->where('user_id', $user->id)
            ->update([
                'status' => PresenceStatus::OFFLINE->value,
                'last_seen_at' => now(),
            ]);
    }

    /**
     * Set user as away in a workspace
     */
    public function setAway(Workspace $workspace, User $user): void
    {
        UserPresence::where('workspace_id', $workspace->id)
            ->where('user_id', $user->id)
            ->update([
                'status' => PresenceStatus::AWAY->value,
                'last_seen_at' => now(),
            ]);
    }

    /**
     * Get all online users in a workspace
     */
    public function getOnlineUsers(Workspace $workspace): Collection
    {
        return UserPresence::where('workspace_id', $workspace->id)
            ->where('status', PresenceStatus::ONLINE->value)
            ->where('last_seen_at', '>=', now()->subMinutes(5))
            ->with('user')
            ->get()
            ->pluck('user')
            ->unique('id');
    }

    /**
     * Get all online users in a channel
     */
    public function getChannelOnlineUsers(Channel $channel): Collection
    {
        return UserPresence::where('channel_id', $channel->id)
            ->where('status', PresenceStatus::ONLINE->value)
            ->where('last_seen_at', '>=', now()->subMinutes(5))
            ->with('user')
            ->get()
            ->pluck('user')
            ->unique('id');
    }

    /**
     * Get user's current status in a workspace
     */
    public function getUserStatus(Workspace $workspace, User $user): ?PresenceStatus
    {
        $presence = UserPresence::where('workspace_id', $workspace->id)
            ->where('user_id', $user->id)
            ->whereNull('channel_id')
            ->first();

        if (!$presence) {
            return null;
        }

        // If last seen was more than 5 minutes ago, consider offline
        if ($presence->last_seen_at < now()->subMinutes(5)) {
            return PresenceStatus::OFFLINE;
        }

        return PresenceStatus::from($presence->status);
    }

    /**
     * Get workspace presence statistics
     */
    public function getWorkspacePresenceStats(Workspace $workspace): array
    {
        $fiveMinutesAgo = now()->subMinutes(5);

        $stats = UserPresence::where('workspace_id', $workspace->id)
            ->whereNull('channel_id')
            ->where('last_seen_at', '>=', $fiveMinutesAgo)
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        return [
            'online' => $stats[PresenceStatus::ONLINE->value] ?? 0,
            'away' => $stats[PresenceStatus::AWAY->value] ?? 0,
            'busy' => $stats[PresenceStatus::BUSY->value] ?? 0,
            'total_active' => array_sum($stats),
        ];
    }

    /**
     * Cleanup stale presence records
     * Should be called periodically via scheduled task
     */
    public function cleanupStalePresence(int $daysOld = 7): int
    {
        return UserPresence::where('last_seen_at', '<', now()->subDays($daysOld))
            ->delete();
    }

    /**
     * Get recently active users in workspace
     */
    public function getRecentlyActiveUsers(Workspace $workspace, int $minutes = 30): Collection
    {
        return UserPresence::where('workspace_id', $workspace->id)
            ->where('last_seen_at', '>=', now()->subMinutes($minutes))
            ->with('user')
            ->orderBy('last_seen_at', 'desc')
            ->get()
            ->pluck('user')
            ->unique('id');
    }

    /**
     * Check if user is currently online in workspace
     */
    public function isUserOnline(Workspace $workspace, User $user): bool
    {
        $presence = UserPresence::where('workspace_id', $workspace->id)
            ->where('user_id', $user->id)
            ->whereNull('channel_id')
            ->where('last_seen_at', '>=', now()->subMinutes(5))
            ->first();

        return $presence && $presence->status === PresenceStatus::ONLINE->value;
    }

    /**
     * Update user's last seen time (heartbeat)
     */
    public function heartbeat(Workspace $workspace, User $user): void
    {
        UserPresence::where('workspace_id', $workspace->id)
            ->where('user_id', $user->id)
            ->update(['last_seen_at' => now()]);
    }

    /**
     * Get user's last seen time in workspace
     */
    public function getLastSeen(Workspace $workspace, User $user): ?Carbon
    {
        $presence = UserPresence::where('workspace_id', $workspace->id)
            ->where('user_id', $user->id)
            ->first();

        return $presence?->last_seen_at;
    }
}
