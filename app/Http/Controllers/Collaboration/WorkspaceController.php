<?php

namespace App\Http\Controllers\Collaboration;

use App\Http\Controllers\Controller;
use App\Http\Requests\Collaboration\StoreWorkspaceRequest;
use App\Http\Requests\Collaboration\UpdateWorkspaceRequest;
use App\Http\Resources\Collaboration\WorkspaceResource;
use App\Http\Resources\Collaboration\WorkspaceDetailResource;
use App\Models\Collaboration\Workspace;
use App\Services\Collaboration\WorkspaceService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WorkspaceController extends Controller
{
    public function __construct(
        protected WorkspaceService $workspaceService
    ) {}

    /**
     * Display a listing of the user's workspaces
     */
    public function index(Request $request)
    {
        $workspaces = $this->workspaceService->getUserWorkspaces($request->user());

        // For API requests, return JSON
        if ($request->expectsJson()) {
            return WorkspaceResource::collection($workspaces);
        }

        // For web requests, return Inertia page
        return Inertia::render('Collaboration/Index', [
            'workspaces' => WorkspaceResource::collection($workspaces),
        ]);
    }

    /**
     * Show the form for creating a new workspace
     */
    public function create(): Response
    {
        return Inertia::render('Collaboration/CreateWorkspace');
    }

    /**
     * Store a newly created workspace
     */
    public function store(StoreWorkspaceRequest $request)
    {
        $workspace = $this->workspaceService->createWorkspace(
            $request->validated(),
            $request->user()
        );

        if ($request->expectsJson()) {
            return new WorkspaceDetailResource($workspace);
        }

        return redirect()
            ->route('workspaces.show', $workspace)
            ->with('success', 'Workspace created successfully!');
    }

    /**
     * Display the specified workspace
     */
    public function show(Request $request, Workspace $workspace)
    {
        // Check authorization
        $this->authorize('view', $workspace);

        // Load relationships
        $workspace->load([
            'owner',
            'members.user',
            'channels' => function ($query) {
                $query->where('is_archived', false);
            }
        ]);
        $workspace->loadCount(['members', 'channels']);

        if ($request->expectsJson()) {
            return new WorkspaceDetailResource($workspace);
        }

        return Inertia::render('Collaboration/Workspace', [
            'workspace' => new WorkspaceDetailResource($workspace),
        ]);
    }

    /**
     * Show the form for editing the specified workspace
     */
    public function edit(Workspace $workspace): Response
    {
        $this->authorize('update', $workspace);

        $workspace->load(['owner', 'members.user']);

        return Inertia::render('Collaboration/EditWorkspace', [
            'workspace' => new WorkspaceDetailResource($workspace),
        ]);
    }

    /**
     * Update the specified workspace
     */
    public function update(UpdateWorkspaceRequest $request, Workspace $workspace)
    {
        $this->authorize('update', $workspace);

        $workspace = $this->workspaceService->updateWorkspace(
            $workspace,
            $request->validated()
        );

        if ($request->expectsJson()) {
            return new WorkspaceDetailResource($workspace);
        }

        return redirect()
            ->route('workspaces.show', $workspace)
            ->with('success', 'Workspace updated successfully!');
    }

    /**
     * Remove the specified workspace
     */
    public function destroy(Request $request, Workspace $workspace)
    {
        $this->authorize('delete', $workspace);

        $this->workspaceService->deleteWorkspace($workspace);

        if ($request->expectsJson()) {
            return response()->json([
                'message' => 'Workspace deleted successfully'
            ]);
        }

        return redirect()
            ->route('workspaces.index')
            ->with('success', 'Workspace deleted successfully!');
    }
}
