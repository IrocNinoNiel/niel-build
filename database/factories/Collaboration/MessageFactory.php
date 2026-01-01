<?php

namespace Database\Factories\Collaboration;

use App\Models\Collaboration\Channel;
use App\Models\Collaboration\Message;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class MessageFactory extends Factory
{
    protected $model = Message::class;

    public function definition(): array
    {
        return [
            'uuid' => Str::uuid(),
            'channel_id' => Channel::factory(),
            'user_id' => User::factory(),
            'parent_id' => null,
            'content' => fake()->paragraph(),
            'content_type' => 'text',
            'metadata' => null,
            'is_pinned' => false,
        ];
    }

    public function pinned(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_pinned' => true,
            'pinned_at' => now(),
            'pinned_by' => User::factory(),
        ]);
    }

    public function reply(): static
    {
        return $this->state(fn (array $attributes) => [
            'parent_id' => Message::factory(),
        ]);
    }
}
