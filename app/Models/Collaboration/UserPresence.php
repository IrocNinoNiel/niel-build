<?php

namespace App\Models\Collaboration;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserPresence extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'workspace_id',
        'status',
        'current_channel_id',
        'last_activity_at',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
        'last_activity_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }

    public function currentChannel(): BelongsTo
    {
        return $this->belongsTo(Channel::class, 'current_channel_id');
    }

    public function isOnline(): bool
    {
        return $this->status === 'online';
    }

    public function setOnline(): void
    {
        $this->update([
            'status' => 'online',
            'last_activity_at' => now(),
        ]);
    }

    public function setOffline(): void
    {
        $this->update([
            'status' => 'offline',
            'last_activity_at' => now(),
        ]);
    }
}
