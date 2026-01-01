<?php

use App\Http\Controllers\Collaboration\ChannelController;
use App\Http\Controllers\Collaboration\MessageController;
use App\Http\Controllers\Collaboration\WorkspaceController;
use App\Http\Controllers\Collaboration\WorkspaceMemberController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->group(function () {

    // Workspace routes
    Route::resource('workspaces', WorkspaceController::class);

    // Workspace member routes
    Route::prefix('workspaces/{workspace}')->group(function () {
        Route::get('members', [WorkspaceMemberController::class, 'index'])->name('workspaces.members.index');
        Route::post('members', [WorkspaceMemberController::class, 'store'])->name('workspaces.members.store');
        Route::patch('members/{user}', [WorkspaceMemberController::class, 'update'])->name('workspaces.members.update');
        Route::delete('members/{user}', [WorkspaceMemberController::class, 'destroy'])->name('workspaces.members.destroy');

        // Channel routes
        Route::get('channels', [ChannelController::class, 'index'])->name('workspaces.channels.index');
        Route::post('channels', [ChannelController::class, 'store'])->name('workspaces.channels.store');
    });

    // Channel routes
    Route::resource('channels', ChannelController::class)->except(['index', 'create', 'store']);

    // Channel archive routes
    Route::post('channels/{channel}/archive', [ChannelController::class, 'archive'])->name('channels.archive');
    Route::post('channels/{channel}/unarchive', [ChannelController::class, 'unarchive'])->name('channels.unarchive');

    // Message routes
    Route::prefix('channels/{channel}')->group(function () {
        Route::get('messages', [MessageController::class, 'index'])->name('channels.messages.index');
        Route::post('messages', [MessageController::class, 'store'])->name('channels.messages.store');
    });

    Route::resource('messages', MessageController::class)->except(['index', 'create', 'store']);

    // Message reactions
    Route::post('messages/{message}/reactions', [MessageController::class, 'addReaction'])->name('messages.reactions.add');
    Route::delete('messages/{message}/reactions/{emoji}', [MessageController::class, 'removeReaction'])->name('messages.reactions.remove');

    // Message pinning
    Route::post('messages/{message}/pin', [MessageController::class, 'pin'])->name('messages.pin');
    Route::delete('messages/{message}/pin', [MessageController::class, 'unpin'])->name('messages.unpin');

    // Message threading
    Route::get('messages/{message}/thread', [MessageController::class, 'thread'])->name('messages.thread');
});
