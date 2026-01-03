import React from 'react';
import {
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    ListItemAvatar,
    Avatar,
    IconButton,
    Menu,
    MenuItem,
    Typography,
    Box,
    Chip,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import WorkspacesIcon from '@mui/icons-material/Workspaces';
import { Workspace } from '@/types';

interface WorkspaceListProps {
    workspaces: Workspace[];
    selectedWorkspace: Workspace | null;
    onSelect: (workspace: Workspace) => void;
    onEdit: (workspace: Workspace) => void;
    onDelete: (id: number) => void;
}

export default function WorkspaceList({
    workspaces,
    selectedWorkspace,
    onSelect,
    onEdit,
    onDelete,
}: WorkspaceListProps) {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const [menuWorkspace, setMenuWorkspace] = React.useState<Workspace | null>(null);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, workspace: Workspace) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
        setMenuWorkspace(workspace);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setMenuWorkspace(null);
    };

    const handleEdit = () => {
        if (menuWorkspace) {
            onEdit(menuWorkspace);
        }
        handleMenuClose();
    };

    const handleDelete = () => {
        if (menuWorkspace && window.confirm(`Are you sure you want to delete "${menuWorkspace.name}"?`)) {
            onDelete(menuWorkspace.id);
        }
        handleMenuClose();
    };

    if (workspaces.length === 0) {
        return (
            <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" color="textSecondary">
                    No workspaces yet
                </Typography>
            </Box>
        );
    }

    return (
        <>
            <List sx={{ p: 0 }}>
                {workspaces.map((workspace) => (
                    <ListItem
                        key={workspace.id}
                        disablePadding
                        secondaryAction={
                            <IconButton
                                edge="end"
                                size="small"
                                onClick={(e) => handleMenuOpen(e, workspace)}
                            >
                                <MoreVertIcon fontSize="small" />
                            </IconButton>
                        }
                    >
                        <ListItemButton
                            selected={selectedWorkspace?.id === workspace.id}
                            onClick={() => onSelect(workspace)}
                        >
                            <ListItemAvatar>
                                <Avatar src={workspace.avatar_url || undefined}>
                                    <WorkspacesIcon />
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                                primary={workspace.name}
                                secondary={
                                    <Box sx={{ display: 'flex', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
                                        <Chip
                                            label={`${workspace.members_count || 0} members`}
                                            size="small"
                                            sx={{ height: 18, fontSize: '0.7rem' }}
                                        />
                                        <Chip
                                            label={`${workspace.channels_count || 0} channels`}
                                            size="small"
                                            sx={{ height: 18, fontSize: '0.7rem' }}
                                        />
                                    </Box>
                                }
                            />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
            >
                <MenuItem onClick={handleEdit}>Edit</MenuItem>
                <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
                    Delete
                </MenuItem>
            </Menu>
        </>
    );
}
