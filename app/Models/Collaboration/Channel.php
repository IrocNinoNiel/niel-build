<?php

namespace App\Models\Collaboration;

use App\Models\User;
use Database\Factories\Collaboration\ChannelFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Channel extends Model
{
    use HasFactory;
    protected $fillable = [
        'uuid',
        'workspace_id',
        'creator_id',
        'name',
        'slug',
        'description',
        'type',
        'settings',
        'is_archived',
        'archived_at',
    ];

    protected $casts = [
        'settings' => 'array',
        'is_archived' => 'boolean',
        'archived_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($channel) {
            if (empty($channel->uuid)) {
                $channel->uuid = (string) Str::uuid();
            }
            if (empty($channel->slug)) {
                $channel->slug = Str::slug($channel->name);
            }
        });
    }

    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'creator_id');
    }

    public function members(): HasMany
    {
        return $this->hasMany(ChannelMember::class);
    }

    public function messages(): HasMany
    {
        return $this->hasMany(Message::class);
    }

    public function typingIndicators(): HasMany
    {
        return $this->hasMany(TypingIndicator::class);
    }

    protected static function newFactory()
    {
        return ChannelFactory::new();
    }
}
