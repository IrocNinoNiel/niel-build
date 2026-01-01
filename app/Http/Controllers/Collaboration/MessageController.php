<?php

namespace App\Http\Controllers\Collaboration;

use App\Http\Controllers\Controller;
use App\Http\Requests\Collaboration\StoreMessageRequest;
use App\Http\Requests\Collaboration\UpdateMessageRequest;
use App\Http\Resources\Collaboration\MessageResource;
use App\Models\Collaboration\Channel;
use App\Models\Collaboration\Message;
use App\Services\Collaboration\MessageService;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    public function __construct(
        protected MessageService $messageService
    ) {}

    public function index(Request $request, Channel $channel)
    {
        $messages = $this->messageService->getChannelMessages(
            $channel,
            $request->integer('per_page', 50)
        );

        return MessageResource::collection($messages);
    }

    public function store(StoreMessageRequest $request, Channel $channel)
    {
        $message = $this->messageService->sendMessage(
            $channel,
            $request->user(),
            $request->validated()
        );

        return new MessageResource($message);
    }

    public function show(Message $message)
    {
        $message->load(['user', 'reactions.user', 'attachments', 'replies.user'])
            ->loadCount(['reactions', 'replies']);

        return new MessageResource($message);
    }

    public function update(UpdateMessageRequest $request, Message $message)
    {
        $this->authorize('update', $message);

        $message = $this->messageService->updateMessage($message, $request->validated('content'));

        return new MessageResource($message);
    }

    public function destroy(Message $message)
    {
        $this->authorize('delete', $message);

        $this->messageService->deleteMessage($message);

        return response()->json(['message' => 'Message deleted successfully']);
    }

    public function addReaction(Request $request, Message $message)
    {
        $this->authorize('view', $message->channel);

        $validated = $request->validate([
            'emoji' => ['required', 'string', 'max:10'],
        ]);

        try {
            $reaction = $this->messageService->addReaction($message, $request->user(), $validated['emoji']);
            return response()->json(['message' => 'Reaction added successfully', 'reaction' => $reaction]);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function removeReaction(Request $request, Message $message, string $emoji)
    {
        $this->authorize('view', $message->channel);

        $this->messageService->removeReaction($message, $request->user(), $emoji);

        return response()->json(['message' => 'Reaction removed successfully']);
    }

    public function pin(Request $request, Message $message)
    {
        $this->authorize('update', $message->channel);

        $message = $this->messageService->pinMessage($message, $request->user());

        return new MessageResource($message);
    }

    public function unpin(Request $request, Message $message)
    {
        $this->authorize('update', $message->channel);

        $message = $this->messageService->unpinMessage($message);

        return new MessageResource($message);
    }

    public function thread(Message $message)
    {
        $this->authorize('view', $message->channel);

        $replies = $this->messageService->getThreadMessages($message);

        return MessageResource::collection($replies);
    }
}
