<?php

namespace App\Services\Collaboration;

use App\Events\Collaboration\MessageDeleted;
use App\Events\Collaboration\MessageReactionAdded;
use App\Events\Collaboration\MessageReactionRemoved;
use App\Events\Collaboration\MessageSent;
use App\Events\Collaboration\MessageUpdated;
use App\Models\Collaboration\Channel;
use App\Models\Collaboration\Message;
use App\Models\Collaboration\MessageReaction;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class MessageService
{
    public function sendMessage(Channel $channel, User $user, array $data): Message
    {
        return DB::transaction(function () use ($channel, $user, $data) {
            $message = Message::create([
                'uuid' => Str::uuid(),
                'channel_id' => $channel->id,
                'user_id' => $user->id,
                'parent_id' => $data['parent_id'] ?? null,
                'content' => $data['content'],
                'content_type' => $data['content_type'] ?? 'text',
                'metadata' => $data['metadata'] ?? null,
            ]);

            event(new MessageSent($message));

            return $message->load(['user', 'channel', 'reactions', 'attachments']);
        });
    }

    public function updateMessage(Message $message, string $content): Message
    {
        $message->update([
            'content' => $content,
            'edited_at' => now(),
        ]);

        event(new MessageUpdated($message));

        return $message->fresh(['user', 'reactions']);
    }

    public function deleteMessage(Message $message): void
    {
        event(new MessageDeleted($message));
        $message->delete();
    }

    public function addReaction(Message $message, User $user, string $emoji): MessageReaction
    {
        // Check if reaction already exists
        $existing = MessageReaction::where('message_id', $message->id)
            ->where('user_id', $user->id)
            ->where('emoji', $emoji)
            ->first();

        if ($existing) {
            throw new \Exception('You have already reacted with this emoji');
        }

        $reaction = MessageReaction::create([
            'message_id' => $message->id,
            'user_id' => $user->id,
            'emoji' => $emoji,
        ]);

        event(new MessageReactionAdded($message, $user, $emoji));

        return $reaction;
    }

    public function removeReaction(Message $message, User $user, string $emoji): bool
    {
        $deleted = MessageReaction::where('message_id', $message->id)
            ->where('user_id' => $user->id)
            ->where('emoji', $emoji)
            ->delete();

        if ($deleted) {
            event(new MessageReactionRemoved($message, $user, $emoji));
        }

        return $deleted > 0;
    }

    public function pinMessage(Message $message, User $user): Message
    {
        $message->update([
            'is_pinned' => true,
            'pinned_at' => now(),
            'pinned_by' => $user->id,
        ]);

        return $message->fresh(['user', 'reactions']);
    }

    public function unpinMessage(Message $message): Message
    {
        $message->update([
            'is_pinned' => false,
            'pinned_at' => null,
            'pinned_by' => null,
        ]);

        return $message->fresh(['user', 'reactions']);
    }

    public function getChannelMessages(Channel $channel, int $perPage = 50)
    {
        return $channel->messages()
            ->with(['user', 'reactions.user', 'attachments'])
            ->whereNull('parent_id')
            ->latest()
            ->paginate($perPage);
    }

    public function getThreadMessages(Message $parentMessage)
    {
        return Message::where('parent_id', $parentMessage->id)
            ->with(['user', 'reactions.user'])
            ->oldest()
            ->get();
    }
}
