<?php

namespace Tests\Feature\Collaboration;

use App\Models\Collaboration\Channel;
use App\Models\Collaboration\ChannelMember;
use App\Models\Collaboration\Message;
use App\Models\Collaboration\MessageReaction;
use App\Models\Collaboration\Workspace;
use App\Models\Collaboration\WorkspaceMember;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MessageTest extends TestCase
{
    use RefreshDatabase;

    protected function createChannelWithMember(): array
    {
        $user = User::factory()->create();
        $workspace = Workspace::factory()->create(['owner_id' => $user->id]);

        WorkspaceMember::create([
            'workspace_id' => $workspace->id,
            'user_id' => $user->id,
            'role' => 'owner',
        ]);

        $channel = Channel::factory()->create([
            'workspace_id' => $workspace->id,
            'creator_id' => $user->id,
        ]);

        ChannelMember::create([
            'channel_id' => $channel->id,
            'user_id' => $user->id,
            'role' => 'admin',
        ]);

        return ['user' => $user, 'workspace' => $workspace, 'channel' => $channel];
    }

    public function test_user_can_send_message_in_channel(): void
    {
        ['user' => $user, 'channel' => $channel] = $this->createChannelWithMember();

        $response = $this->actingAs($user)->post("/channels/{$channel->id}/messages", [
            'content' => 'Hello, this is my first message!',
        ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('messages', [
            'channel_id' => $channel->id,
            'user_id' => $user->id,
            'content' => 'Hello, this is my first message!',
            'content_type' => 'text',
        ]);
    }

    public function test_non_channel_member_cannot_send_message(): void
    {
        ['channel' => $channel] = $this->createChannelWithMember();
        $nonMember = User::factory()->create();

        $response = $this->actingAs($nonMember)->post("/channels/{$channel->id}/messages", [
            'content' => 'Unauthorized message',
        ]);

        $response->assertStatus(403);
    }

    public function test_user_cannot_send_message_in_archived_channel(): void
    {
        ['user' => $user, 'channel' => $channel] = $this->createChannelWithMember();

        $channel->update([
            'is_archived' => true,
            'archived_at' => now(),
        ]);

        $response = $this->actingAs($user)->post("/channels/{$channel->id}/messages", [
            'content' => 'Message in archived channel',
        ]);

        $response->assertStatus(403);
    }

    public function test_message_content_is_required(): void
    {
        ['user' => $user, 'channel' => $channel] = $this->createChannelWithMember();

        $response = $this->actingAs($user)->post("/channels/{$channel->id}/messages", [
            'content' => '',
        ]);

        $response->assertSessionHasErrors('content');
    }

    public function test_user_can_get_messages_from_channel(): void
    {
        ['user' => $user, 'channel' => $channel] = $this->createChannelWithMember();

        // Create some messages
        Message::factory()->count(5)->create([
            'channel_id' => $channel->id,
            'user_id' => $user->id,
        ]);

        $response = $this->actingAs($user)->get("/channels/{$channel->id}/messages");

        $response->assertStatus(200);
        $response->assertJsonCount(5, 'data');
    }

    public function test_message_author_can_update_their_message(): void
    {
        ['user' => $user, 'channel' => $channel] = $this->createChannelWithMember();

        $message = Message::factory()->create([
            'channel_id' => $channel->id,
            'user_id' => $user->id,
            'content' => 'Original content',
        ]);

        $response = $this->actingAs($user)->patch("/messages/{$message->id}", [
            'content' => 'Updated content',
        ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('messages', [
            'id' => $message->id,
            'content' => 'Updated content',
        ]);

        $message->refresh();
        $this->assertNotNull($message->edited_at);
    }

    public function test_user_cannot_update_someone_elses_message(): void
    {
        ['channel' => $channel] = $this->createChannelWithMember();

        $author = User::factory()->create();
        $message = Message::factory()->create([
            'channel_id' => $channel->id,
            'user_id' => $author->id,
        ]);

        $otherUser = User::factory()->create();

        ChannelMember::create([
            'channel_id' => $channel->id,
            'user_id' => $otherUser->id,
            'role' => 'member',
        ]);

        $response = $this->actingAs($otherUser)->patch("/messages/{$message->id}", [
            'content' => 'Unauthorized update',
        ]);

        $response->assertStatus(403);
    }

    public function test_message_author_can_delete_their_message(): void
    {
        ['user' => $user, 'channel' => $channel] = $this->createChannelWithMember();

        $message = Message::factory()->create([
            'channel_id' => $channel->id,
            'user_id' => $user->id,
        ]);

        $response = $this->actingAs($user)->delete("/messages/{$message->id}");

        $response->assertStatus(200);

        $this->assertSoftDeleted('messages', [
            'id' => $message->id,
        ]);
    }

    public function test_channel_admin_can_delete_any_message(): void
    {
        ['user' => $admin, 'channel' => $channel] = $this->createChannelWithMember();

        $member = User::factory()->create();
        ChannelMember::create([
            'channel_id' => $channel->id,
            'user_id' => $member->id,
            'role' => 'member',
        ]);

        $message = Message::factory()->create([
            'channel_id' => $channel->id,
            'user_id' => $member->id,
        ]);

        $response = $this->actingAs($admin)->delete("/messages/{$message->id}");

        $response->assertStatus(200);

        $this->assertSoftDeleted('messages', [
            'id' => $message->id,
        ]);
    }

    public function test_user_can_create_threaded_reply(): void
    {
        ['user' => $user, 'channel' => $channel] = $this->createChannelWithMember();

        $parentMessage = Message::factory()->create([
            'channel_id' => $channel->id,
            'user_id' => $user->id,
            'content' => 'Parent message',
        ]);

        $response = $this->actingAs($user)->post("/channels/{$channel->id}/messages", [
            'content' => 'This is a reply',
            'parent_id' => $parentMessage->id,
        ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('messages', [
            'channel_id' => $channel->id,
            'parent_id' => $parentMessage->id,
            'content' => 'This is a reply',
        ]);
    }

    public function test_user_can_add_reaction_to_message(): void
    {
        ['user' => $user, 'channel' => $channel] = $this->createChannelWithMember();

        $message = Message::factory()->create([
            'channel_id' => $channel->id,
            'user_id' => $user->id,
        ]);

        $response = $this->actingAs($user)->post("/messages/{$message->id}/reactions", [
            'emoji' => '👍',
        ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('message_reactions', [
            'message_id' => $message->id,
            'user_id' => $user->id,
            'emoji' => '👍',
        ]);
    }

    public function test_user_can_remove_their_reaction(): void
    {
        ['user' => $user, 'channel' => $channel] = $this->createChannelWithMember();

        $message = Message::factory()->create([
            'channel_id' => $channel->id,
            'user_id' => $user->id,
        ]);

        MessageReaction::create([
            'message_id' => $message->id,
            'user_id' => $user->id,
            'emoji' => '👍',
        ]);

        $response = $this->actingAs($user)->delete("/messages/{$message->id}/reactions/👍");

        $response->assertStatus(200);

        $this->assertDatabaseMissing('message_reactions', [
            'message_id' => $message->id,
            'user_id' => $user->id,
            'emoji' => '👍',
        ]);
    }

    public function test_user_cannot_add_duplicate_reaction(): void
    {
        ['user' => $user, 'channel' => $channel] = $this->createChannelWithMember();

        $message = Message::factory()->create([
            'channel_id' => $channel->id,
            'user_id' => $user->id,
        ]);

        // Add reaction first time
        $this->actingAs($user)->post("/messages/{$message->id}/reactions", [
            'emoji' => '👍',
        ]);

        // Try to add same reaction again
        $response = $this->actingAs($user)->post("/messages/{$message->id}/reactions", [
            'emoji' => '👍',
        ]);

        $response->assertStatus(422);
    }

    public function test_channel_admin_can_pin_message(): void
    {
        ['user' => $admin, 'channel' => $channel] = $this->createChannelWithMember();

        $message = Message::factory()->create([
            'channel_id' => $channel->id,
            'user_id' => $admin->id,
        ]);

        $response = $this->actingAs($admin)->post("/messages/{$message->id}/pin");

        $response->assertStatus(200);

        $this->assertDatabaseHas('messages', [
            'id' => $message->id,
            'is_pinned' => true,
            'pinned_by' => $admin->id,
        ]);

        $message->refresh();
        $this->assertNotNull($message->pinned_at);
    }

    public function test_channel_admin_can_unpin_message(): void
    {
        ['user' => $admin, 'channel' => $channel] = $this->createChannelWithMember();

        $message = Message::factory()->pinned()->create([
            'channel_id' => $channel->id,
            'user_id' => $admin->id,
        ]);

        $response = $this->actingAs($admin)->delete("/messages/{$message->id}/pin");

        $response->assertStatus(200);

        $this->assertDatabaseHas('messages', [
            'id' => $message->id,
            'is_pinned' => false,
        ]);
    }

    public function test_regular_member_cannot_pin_message(): void
    {
        ['channel' => $channel] = $this->createChannelWithMember();

        $member = User::factory()->create();
        ChannelMember::create([
            'channel_id' => $channel->id,
            'user_id' => $member->id,
            'role' => 'member',
        ]);

        $message = Message::factory()->create([
            'channel_id' => $channel->id,
            'user_id' => $member->id,
        ]);

        $response = $this->actingAs($member)->post("/messages/{$message->id}/pin");

        $response->assertStatus(403);
    }

    public function test_get_thread_messages_returns_all_replies(): void
    {
        ['user' => $user, 'channel' => $channel] = $this->createChannelWithMember();

        $parentMessage = Message::factory()->create([
            'channel_id' => $channel->id,
            'user_id' => $user->id,
            'content' => 'Parent message',
        ]);

        // Create 3 replies
        Message::factory()->count(3)->create([
            'channel_id' => $channel->id,
            'user_id' => $user->id,
            'parent_id' => $parentMessage->id,
        ]);

        $response = $this->actingAs($user)->get("/messages/{$parentMessage->id}/thread");

        $response->assertStatus(200);
        $response->assertJsonCount(3, 'data');
    }

    public function test_messages_are_ordered_by_created_at_descending(): void
    {
        ['user' => $user, 'channel' => $channel] = $this->createChannelWithMember();

        // Create messages with specific timestamps
        $message1 = Message::factory()->create([
            'channel_id' => $channel->id,
            'user_id' => $user->id,
            'created_at' => now()->subHours(3),
        ]);

        $message2 = Message::factory()->create([
            'channel_id' => $channel->id,
            'user_id' => $user->id,
            'created_at' => now()->subHours(1),
        ]);

        $message3 = Message::factory()->create([
            'channel_id' => $channel->id,
            'user_id' => $user->id,
            'created_at' => now()->subHours(2),
        ]);

        $response = $this->actingAs($user)->get("/channels/{$channel->id}/messages");

        $response->assertStatus(200);

        // Check that messages are ordered newest first
        $messages = $response->json('data');
        $this->assertEquals($message2->id, $messages[0]['id']);
        $this->assertEquals($message3->id, $messages[1]['id']);
        $this->assertEquals($message1->id, $messages[2]['id']);
    }

    public function test_message_includes_user_relationship(): void
    {
        ['user' => $user, 'channel' => $channel] = $this->createChannelWithMember();

        $message = Message::factory()->create([
            'channel_id' => $channel->id,
            'user_id' => $user->id,
        ]);

        $response = $this->actingAs($user)->get("/messages/{$message->id}");

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'data' => [
                'id',
                'content',
                'user' => [
                    'id',
                    'name',
                    'email',
                ],
            ],
        ]);
    }

    public function test_message_includes_reactions_count(): void
    {
        ['user' => $user, 'channel' => $channel] = $this->createChannelWithMember();

        $message = Message::factory()->create([
            'channel_id' => $channel->id,
            'user_id' => $user->id,
        ]);

        // Add multiple reactions
        MessageReaction::create([
            'message_id' => $message->id,
            'user_id' => $user->id,
            'emoji' => '👍',
        ]);

        $otherUser = User::factory()->create();
        ChannelMember::create([
            'channel_id' => $channel->id,
            'user_id' => $otherUser->id,
            'role' => 'member',
        ]);

        MessageReaction::create([
            'message_id' => $message->id,
            'user_id' => $otherUser->id,
            'emoji' => '❤️',
        ]);

        $response = $this->actingAs($user)->get("/messages/{$message->id}");

        $response->assertStatus(200);
        $response->assertJsonPath('data.reactions_count', 2);
    }

    public function test_pagination_works_for_messages(): void
    {
        ['user' => $user, 'channel' => $channel] = $this->createChannelWithMember();

        // Create 25 messages
        Message::factory()->count(25)->create([
            'channel_id' => $channel->id,
            'user_id' => $user->id,
        ]);

        $response = $this->actingAs($user)->get("/channels/{$channel->id}/messages?per_page=10");

        $response->assertStatus(200);
        $response->assertJsonCount(10, 'data');
        $response->assertJsonStructure([
            'data',
            'links',
            'meta' => [
                'current_page',
                'last_page',
                'total',
            ],
        ]);
    }
}
