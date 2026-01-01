<?php

namespace App\Http\Controllers\Collaboration;

use App\Http\Controllers\Controller;
use App\Http\Requests\Collaboration\StoreChannelRequest;
use App\Http\Requests\Collaboration\UpdateChannelRequest;
use App\Http\Resources\Collaboration\ChannelDetailResource;
use App\Models\Collaboration\Channel;
use App\Models\Collaboration\Workspace;
use App\Services\Collaboration\ChannelService;
use Illuminate\Http\Request;

class ChannelController extends Controller
{
    public function __construct(
        protected ChannelService $channelService
    ) {}

    public function index(Request $request, Workspace $workspace)
    {
        $this->authorize('view', $workspace);

        $channels = $this->channelService->getWorkspaceChannels(
            $workspace,
            $request->boolean('include_archived')
        );

        return ChannelDetailResource::collection($channels);
    }

    public function store(StoreChannelRequest $request, Workspace $workspace)
    {
        $this->authorize('view', $workspace);

        $channel = $this->channelService->createChannel(
            $workspace,
            $request->validated(),
            $request->user()
        );

        return new ChannelDetailResource($channel);
    }

    public function show(Request $request, Channel $channel)
    {
        $channel->load(['creator', 'workspace', 'members.user']);

        return new ChannelDetailResource($channel);
    }

    public function update(UpdateChannelRequest $request, Channel $channel)
    {
        $channel = $this->channelService->updateChannel($channel, $request->validated());

        return new ChannelDetailResource($channel);
    }

    public function destroy(Channel $channel)
    {
        $this->channelService->deleteChannel($channel);

        return response()->json(['message' => 'Channel deleted successfully']);
    }

    public function archive(Request $request, Channel $channel)
    {
        $this->authorize('archive', $channel);

        $channel = $this->channelService->archiveChannel($channel);

        if ($request->expectsJson()) {
            return new ChannelDetailResource($channel);
        }

        return response()->json(['message' => 'Channel archived successfully']);
    }

    public function unarchive(Request $request, Channel $channel)
    {
        $this->authorize('unarchive', $channel);

        $channel = $this->channelService->unarchiveChannel($channel);

        if ($request->expectsJson()) {
            return new ChannelDetailResource($channel);
        }

        return response()->json(['message' => 'Channel unarchived successfully']);
    }
}
