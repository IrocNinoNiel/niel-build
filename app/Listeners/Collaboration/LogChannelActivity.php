<?php

namespace App\Listeners\Collaboration;

use App\Events\Collaboration\ChannelCreated;
use App\Events\Collaboration\ChannelUpdated;
use App\Models\Collaboration\CollaborationActivity;

class LogChannelActivity
{
    public function handleChannelCreated(ChannelCreated $event): void
    {
        CollaborationActivity::create([
            'workspace_id' => $event->channel->workspace_id,
            'user_id' => $event->channel->creator_id,
            'activity_type' => 'channel_created',
            'subject_type' => 'App\\Models\\Collaboration\\Channel',
            'subject_id' => $event->channel->id,
            'metadata' => [
                'channel_name' => $event->channel->name,
                'channel_type' => $event->channel->type,
            ],
        ]);
    }

    public function handleChannelUpdated(ChannelUpdated $event): void
    {
        CollaborationActivity::create([
            'workspace_id' => $event->channel->workspace_id,
            'user_id' => auth()->id(),
            'activity_type' => 'channel_updated',
            'subject_type' => 'App\\Models\\Collaboration\\Channel',
            'subject_id' => $event->channel->id,
            'metadata' => [
                'channel_name' => $event->channel->name,
            ],
        ]);
    }
}
