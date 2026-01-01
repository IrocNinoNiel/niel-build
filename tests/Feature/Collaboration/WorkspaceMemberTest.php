<?php

namespace Tests\Feature\Collaboration;

use App\Models\Collaboration\Workspace;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WorkspaceMemberTest extends TestCase
{
    use RefreshDatabase;

    public function test_owner_can_add_member_to_workspace(): void
    {
        $owner = User::factory()->create();
        $newMember = User::factory()->create();
        $workspace = Workspace::factory()->create(['owner_id' => $owner->id]);
        $workspace->members()->create([
            'user_id' => $owner->id,
            'role' => 'owner',
            'joined_at' => now(),
        ]);

        $response = $this->actingAs($owner)
            ->post("/workspaces/{$workspace->id}/members", [
                'user_id' => $newMember->id,
                'role' => 'member',
            ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('workspace_members', [
            'workspace_id' => $workspace->id,
            'user_id' => $newMember->id,
            'role' => 'member',
        ]);
    }

    public function test_admin_can_add_member_to_workspace(): void
    {
        $owner = User::factory()->create();
        $admin = User::factory()->create();
        $newMember = User::factory()->create();
        $workspace = Workspace::factory()->create(['owner_id' => $owner->id]);
        $workspace->members()->create([
            'user_id' => $admin->id,
            'role' => 'admin',
            'joined_at' => now(),
        ]);

        $response = $this->actingAs($admin)
            ->post("/workspaces/{$workspace->id}/members", [
                'user_id' => $newMember->id,
                'role' => 'member',
            ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('workspace_members', [
            'workspace_id' => $workspace->id,
            'user_id' => $newMember->id,
        ]);
    }

    public function test_regular_member_cannot_add_member_to_workspace(): void
    {
        $owner = User::factory()->create();
        $member = User::factory()->create();
        $newMember = User::factory()->create();
        $workspace = Workspace::factory()->create(['owner_id' => $owner->id]);
        $workspace->members()->create([
            'user_id' => $member->id,
            'role' => 'member',
            'joined_at' => now(),
        ]);

        $response = $this->actingAs($member)
            ->post("/workspaces/{$workspace->id}/members", [
                'user_id' => $newMember->id,
                'role' => 'member',
            ]);

        $response->assertForbidden();
    }

    public function test_user_id_is_required_when_adding_member(): void
    {
        $owner = User::factory()->create();
        $workspace = Workspace::factory()->create(['owner_id' => $owner->id]);
        $workspace->members()->create([
            'user_id' => $owner->id,
            'role' => 'owner',
            'joined_at' => now(),
        ]);

        $response = $this->actingAs($owner)
            ->post("/workspaces/{$workspace->id}/members", [
                'role' => 'member',
            ]);

        $response->assertSessionHasErrors('user_id');
    }

    public function test_user_must_exist_when_adding_member(): void
    {
        $owner = User::factory()->create();
        $workspace = Workspace::factory()->create(['owner_id' => $owner->id]);
        $workspace->members()->create([
            'user_id' => $owner->id,
            'role' => 'owner',
            'joined_at' => now(),
        ]);

        $response = $this->actingAs($owner)
            ->post("/workspaces/{$workspace->id}/members", [
                'user_id' => 99999,
                'role' => 'member',
            ]);

        $response->assertSessionHasErrors('user_id');
    }

    public function test_role_must_be_valid_when_adding_member(): void
    {
        $owner = User::factory()->create();
        $newMember = User::factory()->create();
        $workspace = Workspace::factory()->create(['owner_id' => $owner->id]);
        $workspace->members()->create([
            'user_id' => $owner->id,
            'role' => 'owner',
            'joined_at' => now(),
        ]);

        $response = $this->actingAs($owner)
            ->post("/workspaces/{$workspace->id}/members", [
                'user_id' => $newMember->id,
                'role' => 'invalid-role',
            ]);

        $response->assertSessionHasErrors('role');
    }

    public function test_owner_can_update_member_role(): void
    {
        $owner = User::factory()->create();
        $member = User::factory()->create();
        $workspace = Workspace::factory()->create(['owner_id' => $owner->id]);
        $workspace->members()->create([
            'user_id' => $member->id,
            'role' => 'member',
            'joined_at' => now(),
        ]);

        $response = $this->actingAs($owner)
            ->patch("/workspaces/{$workspace->id}/members/{$member->id}", [
                'role' => 'admin',
            ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('workspace_members', [
            'workspace_id' => $workspace->id,
            'user_id' => $member->id,
            'role' => 'admin',
        ]);
    }

    public function test_admin_can_update_member_role(): void
    {
        $owner = User::factory()->create();
        $admin = User::factory()->create();
        $member = User::factory()->create();
        $workspace = Workspace::factory()->create(['owner_id' => $owner->id]);
        $workspace->members()->create([
            'user_id' => $admin->id,
            'role' => 'admin',
            'joined_at' => now(),
        ]);
        $workspace->members()->create([
            'user_id' => $member->id,
            'role' => 'member',
            'joined_at' => now(),
        ]);

        $response = $this->actingAs($admin)
            ->patch("/workspaces/{$workspace->id}/members/{$member->id}", [
                'role' => 'guest',
            ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('workspace_members', [
            'user_id' => $member->id,
            'role' => 'guest',
        ]);
    }

    public function test_owner_can_remove_member_from_workspace(): void
    {
        $owner = User::factory()->create();
        $member = User::factory()->create();
        $workspace = Workspace::factory()->create(['owner_id' => $owner->id]);
        $workspace->members()->create([
            'user_id' => $member->id,
            'role' => 'member',
            'joined_at' => now(),
        ]);

        $response = $this->actingAs($owner)
            ->delete("/workspaces/{$workspace->id}/members/{$member->id}");

        $response->assertRedirect();
        $this->assertDatabaseMissing('workspace_members', [
            'workspace_id' => $workspace->id,
            'user_id' => $member->id,
        ]);
    }

    public function test_admin_can_remove_member_from_workspace(): void
    {
        $owner = User::factory()->create();
        $admin = User::factory()->create();
        $member = User::factory()->create();
        $workspace = Workspace::factory()->create(['owner_id' => $owner->id]);
        $workspace->members()->create([
            'user_id' => $admin->id,
            'role' => 'admin',
            'joined_at' => now(),
        ]);
        $workspace->members()->create([
            'user_id' => $member->id,
            'role' => 'member',
            'joined_at' => now(),
        ]);

        $response = $this->actingAs($admin)
            ->delete("/workspaces/{$workspace->id}/members/{$member->id}");

        $response->assertRedirect();
        $this->assertDatabaseMissing('workspace_members', [
            'user_id' => $member->id,
        ]);
    }

    public function test_regular_member_cannot_remove_members(): void
    {
        $owner = User::factory()->create();
        $member1 = User::factory()->create();
        $member2 = User::factory()->create();
        $workspace = Workspace::factory()->create(['owner_id' => $owner->id]);
        $workspace->members()->create([
            'user_id' => $member1->id,
            'role' => 'member',
            'joined_at' => now(),
        ]);
        $workspace->members()->create([
            'user_id' => $member2->id,
            'role' => 'member',
            'joined_at' => now(),
        ]);

        $response = $this->actingAs($member1)
            ->delete("/workspaces/{$workspace->id}/members/{$member2->id}");

        $response->assertForbidden();
    }

    public function test_user_can_list_workspace_members(): void
    {
        $owner = User::factory()->create();
        $member = User::factory()->create();
        $workspace = Workspace::factory()->create(['owner_id' => $owner->id]);
        $workspace->members()->create([
            'user_id' => $owner->id,
            'role' => 'owner',
            'joined_at' => now(),
        ]);
        $workspace->members()->create([
            'user_id' => $member->id,
            'role' => 'member',
            'joined_at' => now(),
        ]);

        $response = $this->actingAs($owner)
            ->get("/workspaces/{$workspace->id}/members");

        $response->assertOk();
        $response->assertJsonCount(2, 'data');
    }
}
