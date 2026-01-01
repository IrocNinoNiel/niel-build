<?php

namespace App\Policies;

use App\Models\Collaboration\Workspace;
use App\Models\Collaboration\WorkspaceMember;
use App\Models\User;

class WorkspacePolicy
{
    /**
     * Determine if the user can view any workspaces.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determine if the user can view the workspace.
     */
    public function view(User $user, Workspace $workspace): bool
    {
        return $this->isMember($user, $workspace);
    }

    /**
     * Determine if the user can create workspaces.
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * Determine if the user can update the workspace.
     */
    public function update(User $user, Workspace $workspace): bool
    {
        $role = $this->getMemberRole($user, $workspace);

        return in_array($role, ['owner', 'admin']);
    }

    /**
     * Determine if the user can delete the workspace.
     */
    public function delete(User $user, Workspace $workspace): bool
    {
        // Only the workspace owner can delete it
        return $workspace->owner_id === $user->id;
    }

    /**
     * Determine if the user can restore the workspace.
     */
    public function restore(User $user, Workspace $workspace): bool
    {
        return $workspace->owner_id === $user->id;
    }

    /**
     * Determine if the user can permanently delete the workspace.
     */
    public function forceDelete(User $user, Workspace $workspace): bool
    {
        return $workspace->owner_id === $user->id;
    }

    /**
     * Determine if the user can add members to the workspace.
     */
    public function addMember(User $user, Workspace $workspace): bool
    {
        $role = $this->getMemberRole($user, $workspace);

        return in_array($role, ['owner', 'admin']);
    }

    /**
     * Determine if the user can remove members from the workspace.
     */
    public function removeMember(User $user, Workspace $workspace): bool
    {
        $role = $this->getMemberRole($user, $workspace);

        return in_array($role, ['owner', 'admin']);
    }

    /**
     * Determine if the user can update member roles.
     */
    public function updateMember(User $user, Workspace $workspace): bool
    {
        $role = $this->getMemberRole($user, $workspace);

        return in_array($role, ['owner', 'admin']);
    }

    /**
     * Helper: Check if user is a member of the workspace
     */
    protected function isMember(User $user, Workspace $workspace): bool
    {
        return WorkspaceMember::where('workspace_id', $workspace->id)
            ->where('user_id', $user->id)
            ->exists();
    }

    /**
     * Helper: Get user's role in the workspace
     */
    protected function getMemberRole(User $user, Workspace $workspace): ?string
    {
        $member = WorkspaceMember::where('workspace_id', $workspace->id)
            ->where('user_id', $user->id)
            ->first();

        return $member?->role;
    }
}
