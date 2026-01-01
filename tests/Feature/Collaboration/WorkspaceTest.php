<?php

namespace Tests\Feature\Collaboration;

use App\Models\Collaboration\Workspace;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WorkspaceTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_create_workspace(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post('/workspaces', [
            'name' => 'My Workspace',
            'description' => 'A test workspace',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('workspaces', [
            'name' => 'My Workspace',
            'owner_id' => $user->id,
        ]);

        // Owner should be automatically added as a member
        $this->assertDatabaseHas('workspace_members', [
            'user_id' => $user->id,
            'role' => 'owner',
        ]);
    }

    public function test_workspace_name_is_required(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post('/workspaces', [
            'description' => 'A workspace without a name',
        ]);

        $response->assertSessionHasErrors('name');
    }

    public function test_workspace_slug_must_be_unique(): void
    {
        $user = User::factory()->create();
        Workspace::factory()->create(['slug' => 'test-workspace']);

        $response = $this->actingAs($user)->post('/workspaces', [
            'name' => 'Test Workspace',
            'slug' => 'test-workspace',
        ]);

        $response->assertSessionHasErrors('slug');
    }

    public function test_user_can_view_their_workspaces(): void
    {
        $user = User::factory()->create();
        $workspace = Workspace::factory()->create(['owner_id' => $user->id]);
        $workspace->members()->create([
            'user_id' => $user->id,
            'role' => 'owner',
            'joined_at' => now(),
        ]);

        $response = $this->actingAs($user)->get('/workspaces');

        $response->assertOk();
        $response->assertInertia(fn ($page) =>
            $page->component('Collaboration/Index')
        );
    }

    public function test_user_can_view_workspace_details(): void
    {
        $user = User::factory()->create();
        $workspace = Workspace::factory()->create(['owner_id' => $user->id]);
        $workspace->members()->create([
            'user_id' => $user->id,
            'role' => 'owner',
            'joined_at' => now(),
        ]);

        $response = $this->actingAs($user)->get("/workspaces/{$workspace->id}");

        $response->assertOk();
        $response->assertInertia(fn ($page) =>
            $page->component('Collaboration/Workspace')
                ->has('workspace')
        );
    }

    public function test_user_cannot_view_workspace_they_are_not_member_of(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $workspace = Workspace::factory()->create(['owner_id' => $otherUser->id]);

        $response = $this->actingAs($user)->get("/workspaces/{$workspace->id}");

        $response->assertForbidden();
    }

    public function test_owner_can_update_workspace(): void
    {
        $user = User::factory()->create();
        $workspace = Workspace::factory()->create(['owner_id' => $user->id]);
        $workspace->members()->create([
            'user_id' => $user->id,
            'role' => 'owner',
            'joined_at' => now(),
        ]);

        $response = $this->actingAs($user)->patch("/workspaces/{$workspace->id}", [
            'name' => 'Updated Workspace Name',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('workspaces', [
            'id' => $workspace->id,
            'name' => 'Updated Workspace Name',
        ]);
    }

    public function test_admin_can_update_workspace(): void
    {
        $owner = User::factory()->create();
        $admin = User::factory()->create();
        $workspace = Workspace::factory()->create(['owner_id' => $owner->id]);
        $workspace->members()->create([
            'user_id' => $admin->id,
            'role' => 'admin',
            'joined_at' => now(),
        ]);

        $response = $this->actingAs($admin)->patch("/workspaces/{$workspace->id}", [
            'name' => 'Updated by Admin',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('workspaces', [
            'id' => $workspace->id,
            'name' => 'Updated by Admin',
        ]);
    }

    public function test_regular_member_cannot_update_workspace(): void
    {
        $owner = User::factory()->create();
        $member = User::factory()->create();
        $workspace = Workspace::factory()->create(['owner_id' => $owner->id]);
        $workspace->members()->create([
            'user_id' => $member->id,
            'role' => 'member',
            'joined_at' => now(),
        ]);

        $response = $this->actingAs($member)->patch("/workspaces/{$workspace->id}", [
            'name' => 'Attempted Update',
        ]);

        $response->assertForbidden();
    }

    public function test_only_owner_can_delete_workspace(): void
    {
        $user = User::factory()->create();
        $workspace = Workspace::factory()->create(['owner_id' => $user->id]);

        $response = $this->actingAs($user)->delete("/workspaces/{$workspace->id}");

        $response->assertRedirect();
        $this->assertSoftDeleted('workspaces', [
            'id' => $workspace->id,
        ]);
    }

    public function test_admin_cannot_delete_workspace(): void
    {
        $owner = User::factory()->create();
        $admin = User::factory()->create();
        $workspace = Workspace::factory()->create(['owner_id' => $owner->id]);
        $workspace->members()->create([
            'user_id' => $admin->id,
            'role' => 'admin',
            'joined_at' => now(),
        ]);

        $response = $this->actingAs($admin)->delete("/workspaces/{$workspace->id}");

        $response->assertForbidden();
    }

    public function test_workspace_is_soft_deleted(): void
    {
        $user = User::factory()->create();
        $workspace = Workspace::factory()->create(['owner_id' => $user->id]);

        $this->actingAs($user)->delete("/workspaces/{$workspace->id}");

        $this->assertNotNull($workspace->fresh()->deleted_at);
        $this->assertDatabaseHas('workspaces', [
            'id' => $workspace->id,
        ]);
    }

    public function test_unauthenticated_user_cannot_access_workspaces(): void
    {
        $response = $this->get('/workspaces');

        $response->assertRedirect('/login');
    }
}
