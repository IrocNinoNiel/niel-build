<?php

namespace App\Enums\Collaboration;

enum ChannelType: string
{
    case PUBLIC = 'public';
    case PRIVATE = 'private';
    case DIRECT = 'direct';

    public function label(): string
    {
        return match($this) {
            self::PUBLIC => 'Public Channel',
            self::PRIVATE => 'Private Channel',
            self::DIRECT => 'Direct Message',
        };
    }

    public function description(): string
    {
        return match($this) {
            self::PUBLIC => 'Anyone in the workspace can join',
            self::PRIVATE => 'Only invited members can access',
            self::DIRECT => 'One-on-one conversation',
        };
    }

    public function isPublic(): bool
    {
        return $this === self::PUBLIC;
    }

    public function isPrivate(): bool
    {
        return $this === self::PRIVATE;
    }

    public function isDirect(): bool
    {
        return $this === self::DIRECT;
    }
}
