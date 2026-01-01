<?php

namespace App\Providers;

use App\Events\Collaboration\ChannelCreated;
use App\Events\Collaboration\ChannelUpdated;
use App\Events\Collaboration\MessageDeleted;
use App\Events\Collaboration\MessageSent;
use App\Events\Collaboration\MessageUpdated;
use App\Events\Collaboration\WorkspaceCreated;
use App\Events\Collaboration\WorkspaceMemberAdded;
use App\Events\Collaboration\WorkspaceMemberRemoved;
use App\Listeners\Collaboration\LogChannelActivity;
use App\Listeners\Collaboration\LogMemberActivity;
use App\Listeners\Collaboration\LogMessageActivity;
use App\Listeners\Collaboration\LogWorkspaceActivity;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        // Register collaboration event listeners
        Event::listen(WorkspaceCreated::class, [LogWorkspaceActivity::class, 'handle']);

        // Message activity listeners
        Event::listen(MessageSent::class, [LogMessageActivity::class, 'handleMessageSent']);
        Event::listen(MessageUpdated::class, [LogMessageActivity::class, 'handleMessageUpdated']);
        Event::listen(MessageDeleted::class, [LogMessageActivity::class, 'handleMessageDeleted']);

        // Channel activity listeners
        Event::listen(ChannelCreated::class, [LogChannelActivity::class, 'handleChannelCreated']);
        Event::listen(ChannelUpdated::class, [LogChannelActivity::class, 'handleChannelUpdated']);

        // Member activity listeners
        Event::listen(WorkspaceMemberAdded::class, [LogMemberActivity::class, 'handleMemberAdded']);
        Event::listen(WorkspaceMemberRemoved::class, [LogMemberActivity::class, 'handleMemberRemoved']);
    }
}
