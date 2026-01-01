<?php

namespace App\Listeners\Collaboration;

use App\Events\Collaboration\WorkspaceMemberAdded;
use App\Events\Collaboration\WorkspaceMemberRemoved;
use App\Models\Collaboration\CollaborationActivity;

class LogMemberActivity
{
    public function handleMemberAdded(WorkspaceMemberAdded $event): void
    {
        CollaborationActivity::create([
            'workspace_id' => $event->workspace->id,
            'user_id' => auth()->id() ?? $event->user->id,
            'activity_type' => 'member_added',
            'subject_type' => 'App\\Models\\User',
            'subject_id' => $event->user->id,
            'metadata' => [
                'workspace_name' => $event->workspace->name,
                'member_name' => $event->user->name,
                'role' => $event->role,
            ],
        ]);
    }

    public function handleMemberRemoved(WorkspaceMemberRemoved $event): void
    {
        CollaborationActivity::create([
            'workspace_id' => $event->workspace->id,
            'user_id' => auth()->id(),
            'activity_type' => 'member_removed',
            'subject_type' => 'App\\Models\\User',
            'subject_id' => $event->user->id,
            'metadata' => [
                'workspace_name' => $event->workspace->name,
                'member_name' => $event->user->name,
            ],
        ]);
    }
}
