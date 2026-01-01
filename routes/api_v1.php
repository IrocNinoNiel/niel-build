<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Collaboration API Routes (v1)
|--------------------------------------------------------------------------
|
| These are the RESTful API routes for the collaboration module.
| All routes are prefixed with /api/v1
|
| Authentication: Sanctum token-based authentication (implemented in Phase 2)
| Rate Limiting: Applied per endpoint (implemented in Phase 2)
|
*/

Route::prefix('v1')->group(function () {

    // Authentication routes (Phase 2)
    // Route::post('/auth/register', [AuthController::class, 'register']);
    // Route::post('/auth/login', [AuthController::class, 'login']);
    // Route::post('/auth/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');

    // Protected routes
    Route::middleware(['auth:sanctum'])->group(function () {

        // Workspace routes (Phase 2)
        // Route::apiResource('workspaces', WorkspaceApiController::class);
        // Route::post('workspaces/{workspace}/members', [WorkspaceMemberController::class, 'store']);

        // Channel routes (Phase 3)
        // Route::apiResource('channels', ChannelApiController::class);
        // Route::apiResource('channels.messages', MessageApiController::class);

        // Presence routes (Phase 4)
        // Route::get('workspaces/{workspace}/presence', [PresenceController::class, 'index']);
        // Route::post('workspaces/{workspace}/presence', [PresenceController::class, 'update']);

        // Notification routes (Phase 6)
        // Route::get('notifications', [NotificationController::class, 'index']);
        // Route::patch('notifications/{notification}/read', [NotificationController::class, 'markAsRead']);

    });
});
