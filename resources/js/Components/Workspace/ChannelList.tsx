import React, { useState } from 'react';
import {
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    ListItemIcon,
    Typography,
    Box,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Chip,
    IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import TagIcon from '@mui/icons-material/Tag';
import LockIcon from '@mui/icons-material/Lock';
import CampaignIcon from '@mui/icons-material/Campaign';
import ArchiveIcon from '@mui/icons-material/Archive';
import { Channel } from '@/types';
import axios from 'axios';

interface ChannelListProps {
    workspaceId: number;
    channels: Channel[];
    selectedChannel: Channel | null;
    onSelect: (channel: Channel) => void;
    onCreate: (channel: Channel) => void;
}

export default function ChannelList({
    workspaceId,
    channels,
    selectedChannel,
    onSelect,
    onCreate,
}: ChannelListProps) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        type: 'public' as 'public' | 'private' | 'announcement',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: '' });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setErrors({});

        try {
            const response = await axios.post(`/api/v1/workspaces/${workspaceId}/channels`, formData);
            onCreate(response.data.data || response.data);
            setDialogOpen(false);
            setFormData({ name: '', description: '', type: 'public' });
        } catch (error: any) {
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else {
                console.error('Error creating channel:', error);
            }
        } finally {
            setSubmitting(false);
        }
    };

    const getChannelIcon = (type: string) => {
        switch (type) {
            case 'private':
                return <LockIcon fontSize="small" />;
            case 'announcement':
                return <CampaignIcon fontSize="small" />;
            default:
                return <TagIcon fontSize="small" />;
        }
    };

    const activeChannels = channels.filter(c => !c.is_archived);
    const archivedChannels = channels.filter(c => c.is_archived);

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Channels</Typography>
                <IconButton size="small" color="primary" onClick={() => setDialogOpen(true)}>
                    <AddIcon />
                </IconButton>
            </Box>

            {activeChannels.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body2" color="textSecondary">
                        No channels yet
                    </Typography>
                    <Button
                        size="small"
                        startIcon={<AddIcon />}
                        onClick={() => setDialogOpen(true)}
                        sx={{ mt: 1 }}
                    >
                        Create Channel
                    </Button>
                </Box>
            ) : (
                <List sx={{ p: 0 }}>
                    {activeChannels.map((channel) => (
                        <ListItem key={channel.id} disablePadding>
                            <ListItemButton
                                selected={selectedChannel?.id === channel.id}
                                onClick={() => onSelect(channel)}
                            >
                                <ListItemIcon sx={{ minWidth: 36 }}>
                                    {getChannelIcon(channel.type)}
                                </ListItemIcon>
                                <ListItemText
                                    primary={channel.name}
                                    secondary={
                                        channel.unread_count ? (
                                            <Chip
                                                label={channel.unread_count}
                                                size="small"
                                                color="primary"
                                                sx={{ height: 18, fontSize: '0.7rem' }}
                                            />
                                        ) : null
                                    }
                                />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            )}

            {archivedChannels.length > 0 && (
                <Box sx={{ mt: 3 }}>
                    <Typography variant="caption" color="textSecondary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <ArchiveIcon fontSize="small" />
                        Archived Channels
                    </Typography>
                    <List sx={{ p: 0 }}>
                        {archivedChannels.map((channel) => (
                            <ListItem key={channel.id} disablePadding>
                                <ListItemButton
                                    selected={selectedChannel?.id === channel.id}
                                    onClick={() => onSelect(channel)}
                                    sx={{ opacity: 0.6 }}
                                >
                                    <ListItemIcon sx={{ minWidth: 36 }}>
                                        {getChannelIcon(channel.type)}
                                    </ListItemIcon>
                                    <ListItemText primary={channel.name} />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                </Box>
            )}

            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
                <form onSubmit={handleSubmit}>
                    <DialogTitle>Create New Channel</DialogTitle>
                    <DialogContent>
                        <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <TextField
                                name="name"
                                label="Channel Name"
                                value={formData.name}
                                onChange={handleChange}
                                error={!!errors.name}
                                helperText={errors.name}
                                required
                                fullWidth
                                autoFocus
                            />
                            <TextField
                                name="description"
                                label="Description"
                                value={formData.description}
                                onChange={handleChange}
                                error={!!errors.description}
                                helperText={errors.description}
                                multiline
                                rows={2}
                                fullWidth
                            />
                            <TextField
                                name="type"
                                label="Channel Type"
                                value={formData.type}
                                onChange={handleChange}
                                select
                                fullWidth
                            >
                                <MenuItem value="public">Public</MenuItem>
                                <MenuItem value="private">Private</MenuItem>
                                <MenuItem value="announcement">Announcement</MenuItem>
                            </TextField>
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setDialogOpen(false)} disabled={submitting}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="contained" disabled={submitting}>
                            {submitting ? 'Creating...' : 'Create'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Box>
    );
}
