<?php

namespace App\Listeners\Collaboration;

use App\Events\Collaboration\MessageDeleted;
use App\Events\Collaboration\MessageSent;
use App\Events\Collaboration\MessageUpdated;
use App\Models\Collaboration\CollaborationActivity;

class LogMessageActivity
{
    public function handleMessageSent(MessageSent $event): void
    {
        CollaborationActivity::create([
            'workspace_id' => $event->message->channel->workspace_id,
            'user_id' => $event->message->user_id,
            'activity_type' => 'message_sent',
            'subject_type' => 'App\\Models\\Collaboration\\Message',
            'subject_id' => $event->message->id,
            'metadata' => [
                'channel_id' => $event->message->channel_id,
                'channel_name' => $event->message->channel->name,
                'content_preview' => substr($event->message->content, 0, 100),
            ],
        ]);
    }

    public function handleMessageUpdated(MessageUpdated $event): void
    {
        CollaborationActivity::create([
            'workspace_id' => $event->message->channel->workspace_id,
            'user_id' => $event->message->user_id,
            'activity_type' => 'message_updated',
            'subject_type' => 'App\\Models\\Collaboration\\Message',
            'subject_id' => $event->message->id,
            'metadata' => [
                'channel_id' => $event->message->channel_id,
                'edited_at' => $event->message->edited_at?->toISOString(),
            ],
        ]);
    }

    public function handleMessageDeleted(MessageDeleted $event): void
    {
        CollaborationActivity::create([
            'workspace_id' => $event->message->channel->workspace_id,
            'user_id' => $event->message->user_id,
            'activity_type' => 'message_deleted',
            'subject_type' => 'App\\Models\\Collaboration\\Message',
            'subject_id' => $event->message->id,
            'metadata' => [
                'channel_id' => $event->message->channel_id,
            ],
        ]);
    }
}
