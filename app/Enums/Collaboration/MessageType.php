<?php

namespace App\Enums\Collaboration;

enum MessageType: string
{
    case TEXT = 'text';
    case FILE = 'file';
    case SYSTEM = 'system';

    public function label(): string
    {
        return match($this) {
            self::TEXT => 'Text Message',
            self::FILE => 'File Attachment',
            self::SYSTEM => 'System Message',
        };
    }

    public function isText(): bool
    {
        return $this === self::TEXT;
    }

    public function isFile(): bool
    {
        return $this === self::FILE;
    }

    public function isSystem(): bool
    {
        return $this === self::SYSTEM;
    }
}
