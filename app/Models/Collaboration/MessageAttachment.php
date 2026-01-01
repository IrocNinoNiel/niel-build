<?php

namespace App\Models\Collaboration;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class MessageAttachment extends Model
{
    protected $fillable = [
        'uuid',
        'message_id',
        'filename',
        'original_filename',
        'file_path',
        'file_size',
        'mime_type',
        'is_processed',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
        'is_processed' => 'boolean',
        'file_size' => 'integer',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($attachment) {
            if (empty($attachment->uuid)) {
                $attachment->uuid = (string) Str::uuid();
            }
        });
    }

    public function message(): BelongsTo
    {
        return $this->belongsTo(Message::class);
    }
}
