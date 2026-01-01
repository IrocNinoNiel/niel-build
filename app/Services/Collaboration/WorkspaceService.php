<?php

namespace App\Services\Collaboration;

use App\Events\Collaboration\WorkspaceCreated;
use App\Events\Collaboration\WorkspaceMemberAdded;
use App\Events\Collaboration\WorkspaceMemberRemoved;
use App\Models\Collaboration\Workspace;
use App\Models\Collaboration\WorkspaceMember;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class WorkspaceService
{
    /**
     * Create a new workspace
     */
    public function createWorkspace(array $data, User $owner): Workspace
    {
        return DB::transaction(function () use ($data, $owner) {
            // Create the workspace
            $workspace = Workspace::create([
                'uuid' => Str::uuid(),
                'owner_id' => $owner->id,
                'name' => $data['name'],
                'slug' => $data['slug'] ?? Str::slug($data['name']),
                'description' => $data['description'] ?? null,
                'avatar_url' => $data['avatar_url'] ?? null,
                'settings' => $data['settings'] ?? [],
                'is_active' => true,
            ]);

            // Automatically add the owner as a member
            $this->addMember($workspace, $owner, 'owner');

            event(new WorkspaceCreated($workspace));

            return $workspace->load(['owner', 'members.user']);
        });
    }

    /**
     * Update workspace
     */
    public function updateWorkspace(Workspace $workspace, array $data): Workspace
    {
        return DB::transaction(function () use ($workspace, $data) {
            $workspace->update([
                'name' => $data['name'] ?? $workspace->name,
                'slug' => $data['slug'] ?? $workspace->slug,
                'description' => $data['description'] ?? $workspace->description,
                'avatar_url' => $data['avatar_url'] ?? $workspace->avatar_url,
                'settings' => $data['settings'] ?? $workspace->settings,
                'is_active' => $data['is_active'] ?? $workspace->is_active,
            ]);

            // Event will be fired here in Phase 3
            // event(new WorkspaceUpdated($workspace));

            return $workspace->fresh(['owner', 'members.user']);
        });
    }

    /**
     * Delete workspace (soft delete)
     */
    public function deleteWorkspace(Workspace $workspace): bool
    {
        return DB::transaction(function () use ($workspace) {
            // Event will be fired here in Phase 3
            // event(new WorkspaceDeleting($workspace));

            $deleted = $workspace->delete();

            if ($deleted) {
                // Event will be fired here in Phase 3
                // event(new WorkspaceDeleted($workspace));
            }

            return $deleted;
        });
    }

    /**
     * Add member to workspace
     */
    public function addMember(Workspace $workspace, User $user, string $role = 'member'): WorkspaceMember
    {
        return DB::transaction(function () use ($workspace, $user, $role) {
            $member = WorkspaceMember::updateOrCreate(
                [
                    'workspace_id' => $workspace->id,
                    'user_id' => $user->id,
                ],
                [
                    'role' => $role,
                    'joined_at' => now(),
                    'is_active' => true,
                ]
            );

            event(new WorkspaceMemberAdded($workspace, $user, $role));

            return $member;
        });
    }

    /**
     * Remove member from workspace
     */
    public function removeMember(Workspace $workspace, User $user): bool
    {
        return DB::transaction(function () use ($workspace, $user) {
            $member = WorkspaceMember::where('workspace_id', $workspace->id)
                ->where('user_id', $user->id)
                ->first();

            if (!$member) {
                return false;
            }

            $deleted = $member->delete();

            if ($deleted) {
                event(new WorkspaceMemberRemoved($workspace, $user));
            }

            return $deleted;
        });
    }

    /**
     * Update member role
     */
    public function updateMemberRole(Workspace $workspace, User $user, string $role): WorkspaceMember
    {
        return DB::transaction(function () use ($workspace, $user, $role) {
            $member = WorkspaceMember::where('workspace_id', $workspace->id)
                ->where('user_id', $user->id)
                ->firstOrFail();

            $member->update(['role' => $role]);

            // Event will be fired here in Phase 3
            // event(new WorkspaceMemberRoleUpdated($workspace, $user, $role));

            return $member->fresh();
        });
    }

    /**
     * Get user's workspaces
     */
    public function getUserWorkspaces(User $user)
    {
        return Workspace::whereHas('members', function ($query) use ($user) {
            $query->where('user_id', $user->id);
        })
            ->with(['owner', 'members'])
            ->withCount(['channels', 'members'])
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Check if user is member of workspace
     */
    public function isMember(Workspace $workspace, User $user): bool
    {
        return WorkspaceMember::where('workspace_id', $workspace->id)
            ->where('user_id', $user->id)
            ->exists();
    }

    /**
     * Get member role
     */
    public function getMemberRole(Workspace $workspace, User $user): ?string
    {
        $member = WorkspaceMember::where('workspace_id', $workspace->id)
            ->where('user_id', $user->id)
            ->first();

        return $member?->role;
    }
}
