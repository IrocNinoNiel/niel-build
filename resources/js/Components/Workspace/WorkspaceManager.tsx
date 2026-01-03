import React, { useState, useEffect } from 'react';
import {
    Box,
    Grid,
    Paper,
    Typography,
    Button,
    CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import WorkspaceList from './WorkspaceList';
import ChannelList from './ChannelList';
import MessageBoard from './MessageBoard';
import MemberList from './MemberList';
import WorkspaceDialog from './WorkspaceDialog';
import { Workspace, Channel } from '@/types';
import axios from 'axios';

export default function WorkspaceManager() {
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);
    const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
    const [channels, setChannels] = useState<Channel[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingWorkspace, setEditingWorkspace] = useState<Workspace | null>(null);

    const fetchWorkspaces = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/v1/workspaces');
            const data = response.data.data || response.data;
            setWorkspaces(data);

            // Auto-select first workspace if available
            if (data.length > 0 && !selectedWorkspace) {
                setSelectedWorkspace(data[0]);
            }
        } catch (error) {
            console.error('Error fetching workspaces:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchChannels = async (workspaceId: number) => {
        try {
            const response = await axios.get(`/api/v1/workspaces/${workspaceId}/channels`);
            const data = response.data.data || response.data;
            setChannels(data);

            // Auto-select first channel if available
            if (data.length > 0 && !selectedChannel) {
                setSelectedChannel(data[0]);
            }
        } catch (error) {
            console.error('Error fetching channels:', error);
        }
    };

    useEffect(() => {
        fetchWorkspaces();
    }, []);

    useEffect(() => {
        if (selectedWorkspace) {
            fetchChannels(selectedWorkspace.id);
            setSelectedChannel(null);
        }
    }, [selectedWorkspace]);

    const handleWorkspaceCreate = (workspace: Workspace) => {
        setWorkspaces([...workspaces, workspace]);
        setSelectedWorkspace(workspace);
        setDialogOpen(false);
    };

    const handleWorkspaceUpdate = (workspace: Workspace) => {
        setWorkspaces(workspaces.map(w => w.id === workspace.id ? workspace : w));
        if (selectedWorkspace?.id === workspace.id) {
            setSelectedWorkspace(workspace);
        }
        setDialogOpen(false);
    };

    const handleWorkspaceDelete = (id: number) => {
        setWorkspaces(workspaces.filter(w => w.id !== id));
        if (selectedWorkspace?.id === id) {
            setSelectedWorkspace(workspaces[0] || null);
        }
    };

    const handleChannelCreate = (channel: Channel) => {
        setChannels([...channels, channel]);
        setSelectedChannel(channel);
    };

    const handleChannelSelect = (channel: Channel) => {
        setSelectedChannel(channel);
    };

    const handleEditWorkspace = (workspace: Workspace) => {
        setEditingWorkspace(workspace);
        setDialogOpen(true);
    };

    const handleDialogClose = () => {
        setDialogOpen(false);
        setEditingWorkspace(null);
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" fontWeight="bold">
                    Workspace Collaboration
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setDialogOpen(true)}
                >
                    New Workspace
                </Button>
            </Box>

            <Grid container spacing={3}>
                {/* Workspaces List - Left Sidebar */}
                <Grid item xs={12} md={3}>
                    <Paper sx={{ p: 2, height: '700px', overflow: 'auto' }}>
                        <Typography variant="h6" gutterBottom>
                            Workspaces
                        </Typography>
                        <WorkspaceList
                            workspaces={workspaces}
                            selectedWorkspace={selectedWorkspace}
                            onSelect={setSelectedWorkspace}
                            onEdit={handleEditWorkspace}
                            onDelete={handleWorkspaceDelete}
                        />
                    </Paper>
                </Grid>

                {/* Main Content Area */}
                {selectedWorkspace ? (
                    <>
                        {/* Channels List */}
                        <Grid item xs={12} md={3}>
                            <Paper sx={{ p: 2, height: '700px', overflow: 'auto' }}>
                                <ChannelList
                                    workspaceId={selectedWorkspace.id}
                                    channels={channels}
                                    selectedChannel={selectedChannel}
                                    onSelect={handleChannelSelect}
                                    onCreate={handleChannelCreate}
                                />
                            </Paper>
                        </Grid>

                        {/* Messages Board */}
                        <Grid item xs={12} md={4}>
                            <Paper sx={{ p: 2, height: '700px', display: 'flex', flexDirection: 'column' }}>
                                {selectedChannel ? (
                                    <MessageBoard channel={selectedChannel} />
                                ) : (
                                    <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                                        <Typography variant="body1" color="textSecondary">
                                            Select a channel to view messages
                                        </Typography>
                                    </Box>
                                )}
                            </Paper>
                        </Grid>

                        {/* Members List - Right Sidebar */}
                        <Grid item xs={12} md={2}>
                            <Paper sx={{ p: 2, height: '700px', overflow: 'auto' }}>
                                <MemberList workspaceId={selectedWorkspace.id} />
                            </Paper>
                        </Grid>
                    </>
                ) : (
                    <Grid item xs={12} md={9}>
                        <Paper sx={{ p: 4, height: '700px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <Box textAlign="center">
                                <Typography variant="h6" color="textSecondary" gutterBottom>
                                    No workspace selected
                                </Typography>
                                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                                    Create a new workspace or select one from the list
                                </Typography>
                                <Button
                                    variant="contained"
                                    startIcon={<AddIcon />}
                                    onClick={() => setDialogOpen(true)}
                                >
                                    Create Workspace
                                </Button>
                            </Box>
                        </Paper>
                    </Grid>
                )}
            </Grid>

            <WorkspaceDialog
                open={dialogOpen}
                workspace={editingWorkspace}
                onClose={handleDialogClose}
                onCreate={handleWorkspaceCreate}
                onUpdate={handleWorkspaceUpdate}
            />
        </Box>
    );
}
