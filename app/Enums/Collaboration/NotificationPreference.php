<?php

namespace App\Enums\Collaboration;

enum NotificationPreference: string
{
    case ALL = 'all';
    case MENTIONS = 'mentions';
    case NONE = 'none';

    public function label(): string
    {
        return match($this) {
            self::ALL => 'All Messages',
            self::MENTIONS => 'Mentions Only',
            self::NONE => 'None',
        };
    }

    public function description(): string
    {
        return match($this) {
            self::ALL => 'Get notified for all messages',
            self::MENTIONS => 'Only get notified when mentioned',
            self::NONE => 'No notifications',
        };
    }

    public function shouldNotify(bool $isMentioned = false): bool
    {
        return match($this) {
            self::ALL => true,
            self::MENTIONS => $isMentioned,
            self::NONE => false,
        };
    }
}
