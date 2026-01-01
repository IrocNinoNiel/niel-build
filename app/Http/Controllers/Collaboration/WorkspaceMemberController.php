<?php

namespace App\Http\Controllers\Collaboration;

use App\Http\Controllers\Controller;
use App\Http\Requests\Collaboration\AddMemberRequest;
use App\Http\Requests\Collaboration\UpdateMemberRoleRequest;
use App\Http\Resources\Collaboration\WorkspaceMemberResource;
use App\Models\Collaboration\Workspace;
use App\Models\User;
use App\Services\Collaboration\WorkspaceService;
use Illuminate\Http\Request;

class WorkspaceMemberController extends Controller
{
    public function __construct(
        protected WorkspaceService $workspaceService
    ) {}

    /**
     * Display a listing of workspace members
     */
    public function index(Request $request, Workspace $workspace)
    {
        $this->authorize('view', $workspace);

        $members = $workspace->members()
            ->with('user')
            ->paginate($request->get('per_page', 20));

        return WorkspaceMemberResource::collection($members);
    }

    /**
     * Add a member to the workspace
     */
    public function store(AddMemberRequest $request, Workspace $workspace)
    {
        $this->authorize('addMember', $workspace);

        $user = User::findOrFail($request->validated('user_id'));
        $role = $request->validated('role');

        $member = $this->workspaceService->addMember($workspace, $user, $role);

        if ($request->expectsJson()) {
            return new WorkspaceMemberResource($member->load('user'));
        }

        return redirect()
            ->route('workspaces.show', $workspace)
            ->with('success', 'Member added successfully!');
    }

    /**
     * Update the member's role
     */
    public function update(UpdateMemberRoleRequest $request, Workspace $workspace, User $user)
    {
        $this->authorize('updateMember', $workspace);

        $role = $request->validated('role');

        $member = $this->workspaceService->updateMemberRole($workspace, $user, $role);

        if ($request->expectsJson()) {
            return new WorkspaceMemberResource($member->load('user'));
        }

        return redirect()
            ->route('workspaces.show', $workspace)
            ->with('success', 'Member role updated successfully!');
    }

    /**
     * Remove a member from the workspace
     */
    public function destroy(Request $request, Workspace $workspace, User $user)
    {
        $this->authorize('removeMember', $workspace);

        $this->workspaceService->removeMember($workspace, $user);

        if ($request->expectsJson()) {
            return response()->json([
                'message' => 'Member removed successfully'
            ]);
        }

        return redirect()
            ->route('workspaces.show', $workspace)
            ->with('success', 'Member removed successfully!');
    }
}
