<?php

namespace App\Services\Collaboration;

use App\Models\Collaboration\CollaborationActivity;
use App\Models\Collaboration\Workspace;
use App\Models\User;

class ActivityService
{
    /**
     * Log an activity
     */
    public function log(string $action, $subject, Workspace $workspace, ?User $user = null): CollaborationActivity
    {
        // Will be implemented in Phase 6
        return new CollaborationActivity();
    }

    /**
     * Get workspace activities
     */
    public function getWorkspaceActivities(Workspace $workspace, int $limit = 50): array
    {
        // Will be implemented in Phase 6
        return [];
    }

    /**
     * Get user activities
     */
    public function getUserActivities(User $user, int $limit = 50): array
    {
        // Will be implemented in Phase 6
        return [];
    }
}
