<?php

namespace App\Enums\Collaboration;

enum PresenceStatus: string
{
    case ONLINE = 'online';
    case AWAY = 'away';
    case BUSY = 'busy';
    case OFFLINE = 'offline';

    public function label(): string
    {
        return match($this) {
            self::ONLINE => 'Online',
            self::AWAY => 'Away',
            self::BUSY => 'Busy',
            self::OFFLINE => 'Offline',
        };
    }

    public function color(): string
    {
        return match($this) {
            self::ONLINE => 'success',
            self::AWAY => 'warning',
            self::BUSY => 'error',
            self::OFFLINE => 'default',
        };
    }

    public function isAvailable(): bool
    {
        return $this === self::ONLINE;
    }

    public function isAway(): bool
    {
        return $this === self::AWAY;
    }
}
