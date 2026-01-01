<?php

namespace App\Enums\Collaboration;

enum WorkspaceRole: string
{
    case OWNER = 'owner';
    case ADMIN = 'admin';
    case MEMBER = 'member';
    case GUEST = 'guest';

    public function label(): string
    {
        return match($this) {
            self::OWNER => 'Owner',
            self::ADMIN => 'Admin',
            self::MEMBER => 'Member',
            self::GUEST => 'Guest',
        };
    }

    public function canManageWorkspace(): bool
    {
        return in_array($this, [self::OWNER, self::ADMIN]);
    }

    public function canInviteMembers(): bool
    {
        return in_array($this, [self::OWNER, self::ADMIN]);
    }

    public function canDeleteWorkspace(): bool
    {
        return $this === self::OWNER;
    }
}
