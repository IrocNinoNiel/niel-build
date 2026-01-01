<?php

namespace App\Listeners\Collaboration;

use App\Events\Collaboration\WorkspaceCreated;
use App\Services\Collaboration\ActivityService;

class LogWorkspaceActivity
{
    public function __construct(
        protected ActivityService $activityService
    ) {}

    public function handle(WorkspaceCreated $event): void
    {
        $this->activityService->log(
            'workspace.created',
            $event->workspace,
            $event->workspace,
            $event->workspace->owner
        );
    }
}
