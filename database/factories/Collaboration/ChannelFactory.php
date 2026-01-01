<?php

namespace Database\Factories\Collaboration;

use App\Models\Collaboration\Channel;
use App\Models\Collaboration\Workspace;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class ChannelFactory extends Factory
{
    protected $model = Channel::class;

    public function definition(): array
    {
        $name = fake()->words(2, true) . ' Channel';

        return [
            'uuid' => Str::uuid(),
            'workspace_id' => Workspace::factory(),
            'creator_id' => User::factory(),
            'name' => $name,
            'slug' => Str::slug($name),
            'description' => fake()->sentence(),
            'type' => 'public',
            'settings' => [],
            'is_archived' => false,
        ];
    }

    public function private(): static
    {
        return $this->state(fn (array $attributes) => ['type' => 'private']);
    }

    public function archived(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_archived' => true,
            'archived_at' => now(),
        ]);
    }
}
