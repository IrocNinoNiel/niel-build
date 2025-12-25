import React, { useState } from 'react';
import {
    Box,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    IconButton,
    TextField,
    MenuItem,
    Grid,
} from '@mui/material';
import { Edit, Delete, Add, Business, OpenInNew } from '@mui/icons-material';
import { JobApplication, Company } from '@/types';
import ApplicationDialog from './ApplicationDialog';
import axios from 'axios';

interface ApplicationListProps {
    applications: JobApplication[];
    companies: Company[];
    onUpdate: (application: JobApplication) => void;
    onDelete: (id: number) => void;
    onCreate: (application: JobApplication) => void;
    onRefresh: () => void;
}

export default function ApplicationList({
    applications,
    companies,
    onUpdate,
    onDelete,
    onCreate,
    onRefresh
}: ApplicationListProps) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingApplication, setEditingApplication] = useState<JobApplication | null>(null);
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [priorityFilter, setPriorityFilter] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredApplications = applications.filter(app => {
        const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
        const matchesPriority = priorityFilter === 'all' || app.priority === priorityFilter;
        const matchesSearch = searchQuery === '' ||
            app.job_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            app.company?.name.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesStatus && matchesPriority && matchesSearch;
    });

    const handleEdit = (application: JobApplication) => {
        setEditingApplication(application);
        setDialogOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (confirm('Are you sure you want to delete this application?')) {
            try {
                await axios.delete(`/job-applications/${id}`);
                onDelete(id);
            } catch (error) {
                console.error('Error deleting application:', error);
            }
        }
    };

    const handleDialogClose = () => {
        setDialogOpen(false);
        setEditingApplication(null);
    };

    const handleDialogSave = () => {
        handleDialogClose();
        onRefresh();
    };

    const getStatusColor = (status: JobApplication['status']) => {
        const colors: Record<JobApplication['status'], 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
            wishlist: 'default',
            applied: 'primary',
            interviewing: 'warning',
            offered: 'secondary',
            accepted: 'success',
            rejected: 'error',
            withdrawn: 'default',
        };
        return colors[status] || 'default';
    };

    const getPriorityColor = (priority: JobApplication['priority']) => {
        const colors: Record<JobApplication['priority'], 'success' | 'warning' | 'error'> = {
            low: 'success',
            medium: 'warning',
            high: 'error',
        };
        return colors[priority];
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString();
    };

    return (
        <Box>
            <Box sx={{ mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={4}>
                        <TextField
                            fullWidth
                            size="small"
                            label="Search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by job title or company..."
                        />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <TextField
                            fullWidth
                            select
                            size="small"
                            label="Status"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <MenuItem value="all">All Statuses</MenuItem>
                            <MenuItem value="wishlist">Wishlist</MenuItem>
                            <MenuItem value="applied">Applied</MenuItem>
                            <MenuItem value="interviewing">Interviewing</MenuItem>
                            <MenuItem value="offered">Offered</MenuItem>
                            <MenuItem value="accepted">Accepted</MenuItem>
                            <MenuItem value="rejected">Rejected</MenuItem>
                            <MenuItem value="withdrawn">Withdrawn</MenuItem>
                        </TextField>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <TextField
                            fullWidth
                            select
                            size="small"
                            label="Priority"
                            value={priorityFilter}
                            onChange={(e) => setPriorityFilter(e.target.value)}
                        >
                            <MenuItem value="all">All Priorities</MenuItem>
                            <MenuItem value="high">High</MenuItem>
                            <MenuItem value="medium">Medium</MenuItem>
                            <MenuItem value="low">Low</MenuItem>
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sm={2}>
                        <Button
                            fullWidth
                            variant="contained"
                            startIcon={<Add />}
                            onClick={() => setDialogOpen(true)}
                        >
                            Add
                        </Button>
                    </Grid>
                </Grid>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Job Title</TableCell>
                            <TableCell>Company</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Priority</TableCell>
                            <TableCell>Location</TableCell>
                            <TableCell>Applied Date</TableCell>
                            <TableCell>Deadline</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredApplications.map((app) => (
                            <TableRow key={app.id} hover>
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        {app.job_title}
                                        {app.job_url && (
                                            <IconButton
                                                size="small"
                                                href={app.job_url}
                                                target="_blank"
                                                sx={{ p: 0.5 }}
                                            >
                                                <OpenInNew fontSize="small" />
                                            </IconButton>
                                        )}
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <Business fontSize="small" color="action" />
                                        {app.company?.name || '-'}
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={app.status}
                                        color={getStatusColor(app.status)}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={app.priority}
                                        color={getPriorityColor(app.priority)}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>{app.location || '-'}</TableCell>
                                <TableCell>{formatDate(app.applied_at)}</TableCell>
                                <TableCell>{formatDate(app.deadline)}</TableCell>
                                <TableCell align="right">
                                    <IconButton
                                        size="small"
                                        onClick={() => handleEdit(app)}
                                    >
                                        <Edit fontSize="small" />
                                    </IconButton>
                                    <IconButton
                                        size="small"
                                        color="error"
                                        onClick={() => handleDelete(app.id)}
                                    >
                                        <Delete fontSize="small" />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        {filteredApplications.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                                    No applications found
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <ApplicationDialog
                open={dialogOpen}
                application={editingApplication}
                companies={companies}
                onClose={handleDialogClose}
                onSave={handleDialogSave}
            />
        </Box>
    );
}
