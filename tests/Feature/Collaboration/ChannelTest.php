<?php

namespace Tests\Feature\Collaboration;

use App\Models\Collaboration\Channel;
use App\Models\Collaboration\Workspace;
use App\Models\Collaboration\WorkspaceMember;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ChannelTest extends TestCase
{
    use RefreshDatabase;

    protected function createWorkspaceWithMember(string $role = 'owner'): array
    {
        $user = User::factory()->create();
        $workspace = Workspace::factory()->create(['owner_id' => $user->id]);

        WorkspaceMember::create([
            'workspace_id' => $workspace->id,
            'user_id' => $user->id,
            'role' => $role,
        ]);

        return ['user' => $user, 'workspace' => $workspace];
    }

    public function test_user_can_create_public_channel_in_workspace(): void
    {
        ['user' => $user, 'workspace' => $workspace] = $this->createWorkspaceWithMember();

        $response = $this->actingAs($user)->post("/workspaces/{$workspace->id}/channels", [
            'name' => 'General Channel',
            'description' => 'A general discussion channel',
            'type' => 'public',
        ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('channels', [
            'workspace_id' => $workspace->id,
            'creator_id' => $user->id,
            'name' => 'General Channel',
            'type' => 'public',
        ]);

        // Creator should be added as channel member
        $channel = Channel::where('name', 'General Channel')->first();
        $this->assertDatabaseHas('channel_members', [
            'channel_id' => $channel->id,
            'user_id' => $user->id,
            'role' => 'admin',
        ]);
    }

    public function test_user_can_create_private_channel_in_workspace(): void
    {
        ['user' => $user, 'workspace' => $workspace] = $this->createWorkspaceWithMember();

        $response = $this->actingAs($user)->post("/workspaces/{$workspace->id}/channels", [
            'name' => 'Private Channel',
            'description' => 'A private discussion channel',
            'type' => 'private',
        ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('channels', [
            'workspace_id' => $workspace->id,
            'name' => 'Private Channel',
            'type' => 'private',
        ]);
    }

    public function test_channel_slug_is_auto_generated_if_not_provided(): void
    {
        ['user' => $user, 'workspace' => $workspace] = $this->createWorkspaceWithMember();

        $this->actingAs($user)->post("/workspaces/{$workspace->id}/channels", [
            'name' => 'Test Channel Name',
            'type' => 'public',
        ]);

        $this->assertDatabaseHas('channels', [
            'name' => 'Test Channel Name',
            'slug' => 'test-channel-name',
        ]);
    }

    public function test_user_cannot_create_channel_in_workspace_they_are_not_member_of(): void
    {
        $user = User::factory()->create();
        $workspace = Workspace::factory()->create();

        $response = $this->actingAs($user)->post("/workspaces/{$workspace->id}/channels", [
            'name' => 'General Channel',
            'type' => 'public',
        ]);

        $response->assertStatus(403);
    }

    public function test_workspace_member_can_view_channel(): void
    {
        ['user' => $user, 'workspace' => $workspace] = $this->createWorkspaceWithMember();
        $channel = Channel::factory()->create([
            'workspace_id' => $workspace->id,
            'creator_id' => $user->id,
        ]);

        $response = $this->actingAs($user)->get("/channels/{$channel->id}");

        $response->assertStatus(200);
    }

    public function test_non_workspace_member_cannot_view_channel(): void
    {
        $user = User::factory()->create();
        $workspace = Workspace::factory()->create();
        $channel = Channel::factory()->create(['workspace_id' => $workspace->id]);

        $response = $this->actingAs($user)->get("/channels/{$channel->id}");

        $response->assertStatus(403);
    }

    public function test_channel_creator_can_update_channel(): void
    {
        ['user' => $user, 'workspace' => $workspace] = $this->createWorkspaceWithMember();
        $channel = Channel::factory()->create([
            'workspace_id' => $workspace->id,
            'creator_id' => $user->id,
        ]);

        $response = $this->actingAs($user)->patch("/channels/{$channel->id}", [
            'name' => 'Updated Channel Name',
            'description' => 'Updated description',
        ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('channels', [
            'id' => $channel->id,
            'name' => 'Updated Channel Name',
            'description' => 'Updated description',
        ]);
    }

    public function test_workspace_admin_can_update_any_channel(): void
    {
        ['user' => $admin, 'workspace' => $workspace] = $this->createWorkspaceWithMember('admin');
        $creator = User::factory()->create();

        WorkspaceMember::create([
            'workspace_id' => $workspace->id,
            'user_id' => $creator->id,
            'role' => 'member',
        ]);

        $channel = Channel::factory()->create([
            'workspace_id' => $workspace->id,
            'creator_id' => $creator->id,
        ]);

        $response = $this->actingAs($admin)->patch("/channels/{$channel->id}", [
            'name' => 'Admin Updated Channel',
        ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('channels', [
            'id' => $channel->id,
            'name' => 'Admin Updated Channel',
        ]);
    }

    public function test_regular_member_cannot_update_channel_they_did_not_create(): void
    {
        $creator = User::factory()->create();
        $workspace = Workspace::factory()->create(['owner_id' => $creator->id]);

        WorkspaceMember::create([
            'workspace_id' => $workspace->id,
            'user_id' => $creator->id,
            'role' => 'owner',
        ]);

        $member = User::factory()->create();
        WorkspaceMember::create([
            'workspace_id' => $workspace->id,
            'user_id' => $member->id,
            'role' => 'member',
        ]);

        $channel = Channel::factory()->create([
            'workspace_id' => $workspace->id,
            'creator_id' => $creator->id,
        ]);

        $response = $this->actingAs($member)->patch("/channels/{$channel->id}", [
            'name' => 'Unauthorized Update',
        ]);

        $response->assertStatus(403);
    }

    public function test_channel_creator_can_archive_channel(): void
    {
        ['user' => $user, 'workspace' => $workspace] = $this->createWorkspaceWithMember();
        $channel = Channel::factory()->create([
            'workspace_id' => $workspace->id,
            'creator_id' => $user->id,
        ]);

        $response = $this->actingAs($user)->post("/channels/{$channel->id}/archive");

        $response->assertStatus(200);

        $this->assertDatabaseHas('channels', [
            'id' => $channel->id,
            'is_archived' => true,
        ]);

        $channel->refresh();
        $this->assertNotNull($channel->archived_at);
    }

    public function test_channel_creator_can_unarchive_channel(): void
    {
        ['user' => $user, 'workspace' => $workspace] = $this->createWorkspaceWithMember();
        $channel = Channel::factory()->archived()->create([
            'workspace_id' => $workspace->id,
            'creator_id' => $user->id,
        ]);

        $response = $this->actingAs($user)->post("/channels/{$channel->id}/unarchive");

        $response->assertStatus(200);

        $this->assertDatabaseHas('channels', [
            'id' => $channel->id,
            'is_archived' => false,
        ]);
    }

    public function test_workspace_owner_can_delete_any_channel(): void
    {
        ['user' => $owner, 'workspace' => $workspace] = $this->createWorkspaceWithMember('owner');
        $creator = User::factory()->create();

        WorkspaceMember::create([
            'workspace_id' => $workspace->id,
            'user_id' => $creator->id,
            'role' => 'member',
        ]);

        $channel = Channel::factory()->create([
            'workspace_id' => $workspace->id,
            'creator_id' => $creator->id,
        ]);

        $response = $this->actingAs($owner)->delete("/channels/{$channel->id}");

        $response->assertRedirect();

        $this->assertDatabaseMissing('channels', [
            'id' => $channel->id,
        ]);
    }

    public function test_channel_creator_can_delete_their_own_channel(): void
    {
        ['user' => $user, 'workspace' => $workspace] = $this->createWorkspaceWithMember();
        $channel = Channel::factory()->create([
            'workspace_id' => $workspace->id,
            'creator_id' => $user->id,
        ]);

        $response = $this->actingAs($user)->delete("/channels/{$channel->id}");

        $response->assertRedirect();

        $this->assertDatabaseMissing('channels', [
            'id' => $channel->id,
        ]);
    }

    public function test_regular_member_cannot_delete_channel(): void
    {
        $creator = User::factory()->create();
        $workspace = Workspace::factory()->create(['owner_id' => $creator->id]);

        WorkspaceMember::create([
            'workspace_id' => $workspace->id,
            'user_id' => $creator->id,
            'role' => 'owner',
        ]);

        $member = User::factory()->create();
        WorkspaceMember::create([
            'workspace_id' => $workspace->id,
            'user_id' => $member->id,
            'role' => 'member',
        ]);

        $channel = Channel::factory()->create([
            'workspace_id' => $workspace->id,
            'creator_id' => $creator->id,
        ]);

        $response = $this->actingAs($member)->delete("/channels/{$channel->id}");

        $response->assertStatus(403);
    }

    public function test_get_workspace_channels_returns_only_accessible_channels(): void
    {
        ['user' => $user, 'workspace' => $workspace] = $this->createWorkspaceWithMember();

        // Create public channels
        $publicChannel = Channel::factory()->create([
            'workspace_id' => $workspace->id,
            'type' => 'public',
        ]);

        // Create private channel where user is not a member
        $privateChannel = Channel::factory()->private()->create([
            'workspace_id' => $workspace->id,
        ]);

        $response = $this->actingAs($user)->get("/workspaces/{$workspace->id}/channels");

        $response->assertStatus(200);

        // User should see public channels
        $response->assertJsonFragment(['id' => $publicChannel->id]);

        // User should NOT see private channels they're not part of
        $response->assertJsonMissing(['id' => $privateChannel->id]);
    }

    public function test_channel_name_is_required(): void
    {
        ['user' => $user, 'workspace' => $workspace] = $this->createWorkspaceWithMember();

        $response = $this->actingAs($user)->post("/workspaces/{$workspace->id}/channels", [
            'description' => 'Channel without name',
        ]);

        $response->assertSessionHasErrors('name');
    }

    public function test_channel_type_must_be_valid(): void
    {
        ['user' => $user, 'workspace' => $workspace] = $this->createWorkspaceWithMember();

        $response = $this->actingAs($user)->post("/workspaces/{$workspace->id}/channels", [
            'name' => 'Test Channel',
            'type' => 'invalid_type',
        ]);

        $response->assertSessionHasErrors('type');
    }
}
