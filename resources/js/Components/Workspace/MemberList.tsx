import React, { useState, useEffect } from 'react';
import {
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Avatar,
    Typography,
    Box,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Chip,
    CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { WorkspaceMember } from '@/types';
import axios from 'axios';

interface MemberListProps {
    workspaceId: number;
}

export default function MemberList({ workspaceId }: MemberListProps) {
    const [members, setMembers] = useState<WorkspaceMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<'admin' | 'member' | 'guest'>('member');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const fetchMembers = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/v1/workspaces/${workspaceId}/members`);
            setMembers(response.data.data || response.data);
        } catch (error) {
            console.error('Error fetching members:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMembers();
    }, [workspaceId]);

    const handleAddMember = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;

        setSubmitting(true);
        setError('');

        try {
            const response = await axios.post(`/api/v1/workspaces/${workspaceId}/members`, {
                email,
                role,
            });
            setMembers([...members, response.data.data || response.data]);
            setDialogOpen(false);
            setEmail('');
            setRole('member');
        } catch (error: any) {
            setError(error.response?.data?.message || 'Error adding member');
        } finally {
            setSubmitting(false);
        }
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'owner':
                return 'error';
            case 'admin':
                return 'warning';
            case 'member':
                return 'primary';
            case 'guest':
                return 'default';
            default:
                return 'default';
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Members</Typography>
                <Button
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={() => setDialogOpen(true)}
                >
                    Add
                </Button>
            </Box>

            {loading ? (
                <Box display="flex" justifyContent="center" py={4}>
                    <CircularProgress size={24} />
                </Box>
            ) : members.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body2" color="textSecondary">
                        No members yet
                    </Typography>
                </Box>
            ) : (
                <List sx={{ p: 0 }}>
                    {members.map((member) => (
                        <ListItem key={member.id} sx={{ px: 0 }}>
                            <ListItemAvatar>
                                <Avatar
                                    src={member.user.avatar_url || undefined}
                                    sx={{ width: 32, height: 32 }}
                                >
                                    {member.user.name.charAt(0).toUpperCase()}
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                                primary={
                                    <Typography variant="body2">
                                        {member.user.name}
                                    </Typography>
                                }
                                secondary={
                                    <Chip
                                        label={member.role}
                                        size="small"
                                        color={getRoleColor(member.role) as any}
                                        sx={{ height: 18, fontSize: '0.65rem', mt: 0.5 }}
                                    />
                                }
                            />
                        </ListItem>
                    ))}
                </List>
            )}

            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
                <form onSubmit={handleAddMember}>
                    <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PersonAddIcon />
                        Add Member
                    </DialogTitle>
                    <DialogContent>
                        <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <TextField
                                label="Email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                fullWidth
                                autoFocus
                                error={!!error}
                                helperText={error}
                            />
                            <TextField
                                label="Role"
                                select
                                value={role}
                                onChange={(e) => setRole(e.target.value as any)}
                                SelectProps={{ native: true }}
                                fullWidth
                            >
                                <option value="member">Member</option>
                                <option value="admin">Admin</option>
                                <option value="guest">Guest</option>
                            </TextField>
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setDialogOpen(false)} disabled={submitting}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="contained" disabled={submitting}>
                            {submitting ? 'Adding...' : 'Add'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Box>
    );
}
