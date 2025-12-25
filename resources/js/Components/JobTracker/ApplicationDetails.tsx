import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    Chip,
    Grid,
    Paper,
    IconButton,
    Divider,
    Fab,
} from '@mui/material';
import {
    Business,
    LocationOn,
    AttachMoney,
    CalendarToday,
    Link as LinkIcon,
    Edit,
    Close,
    Add,
} from '@mui/icons-material';
import { JobApplication, ApplicationActivity } from '@/types';
import ActivityTimeline from './ActivityTimeline';
import AddActivityDialog from './AddActivityDialog';
import axios from 'axios';

interface ApplicationDetailsProps {
    open: boolean;
    applicationId: number | null;
    onClose: () => void;
    onEdit: (application: JobApplication) => void;
}

export default function ApplicationDetails({
    open,
    applicationId,
    onClose,
    onEdit,
}: ApplicationDetailsProps) {
    const [application, setApplication] = useState<JobApplication | null>(null);
    const [activities, setActivities] = useState<ApplicationActivity[]>([]);
    const [loading, setLoading] = useState(false);
    const [activityDialogOpen, setActivityDialogOpen] = useState(false);
    const [editingActivity, setEditingActivity] = useState<ApplicationActivity | null>(null);

    useEffect(() => {
        if (applicationId && open) {
            fetchApplicationDetails();
        }
    }, [applicationId, open]);

    const fetchApplicationDetails = async () => {
        if (!applicationId) return;

        try {
            setLoading(true);
            const response = await axios.get(`/job-applications/${applicationId}`);
            setApplication(response.data);
            setActivities(response.data.activities || []);
        } catch (error) {
            console.error('Error fetching application details:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEditActivity = (activity: ApplicationActivity) => {
        setEditingActivity(activity);
        setActivityDialogOpen(true);
    };

    const handleDeleteActivity = async (id: number) => {
        if (confirm('Are you sure you want to delete this activity?')) {
            try {
                await axios.delete(`/application-activities/${id}`);
                fetchApplicationDetails();
            } catch (error) {
                console.error('Error deleting activity:', error);
            }
        }
    };

    const handleActivityDialogClose = () => {
        setActivityDialogOpen(false);
        setEditingActivity(null);
    };

    const handleActivitySave = () => {
        handleActivityDialogClose();
        fetchApplicationDetails();
    };

    const handleEditApplication = () => {
        if (application) {
            onEdit(application);
        }
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'Not set';
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const formatSalary = (min: number | null, max: number | null) => {
        if (!min && !max) return 'Not specified';
        if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
        if (min) return `$${min.toLocaleString()}+`;
        return `Up to $${max?.toLocaleString()}`;
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

    if (!application) {
        return null;
    }

    return (
        <>
            <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
                <DialogTitle>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h5" component="span">
                            {application.job_title}
                        </Typography>
                        <Box>
                            <IconButton onClick={handleEditApplication} color="primary">
                                <Edit />
                            </IconButton>
                            <IconButton onClick={onClose}>
                                <Close />
                            </IconButton>
                        </Box>
                    </Box>
                </DialogTitle>

                <DialogContent dividers>
                    {/* Application Info */}
                    <Paper sx={{ p: 3, mb: 3 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <Business sx={{ mr: 1, color: 'text.secondary' }} />
                                    <Typography variant="h6">
                                        {application.company?.name || 'Unknown Company'}
                                    </Typography>
                                </Box>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <Typography variant="body2" color="textSecondary">Status</Typography>
                                <Chip
                                    label={application.status}
                                    color={getStatusColor(application.status)}
                                    sx={{ mt: 0.5 }}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <Typography variant="body2" color="textSecondary">Priority</Typography>
                                <Chip
                                    label={application.priority}
                                    color={getPriorityColor(application.priority)}
                                    sx={{ mt: 0.5 }}
                                />
                            </Grid>

                            {application.location && (
                                <Grid item xs={12} sm={6}>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <LocationOn sx={{ mr: 1, fontSize: 20, color: 'text.secondary' }} />
                                        <Box>
                                            <Typography variant="body2" color="textSecondary">Location</Typography>
                                            <Typography variant="body1">{application.location}</Typography>
                                        </Box>
                                    </Box>
                                </Grid>
                            )}

                            <Grid item xs={12} sm={6}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <AttachMoney sx={{ mr: 1, fontSize: 20, color: 'text.secondary' }} />
                                    <Box>
                                        <Typography variant="body2" color="textSecondary">Salary Range</Typography>
                                        <Typography variant="body1">
                                            {formatSalary(application.salary_min, application.salary_max)}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <CalendarToday sx={{ mr: 1, fontSize: 20, color: 'text.secondary' }} />
                                    <Box>
                                        <Typography variant="body2" color="textSecondary">Applied Date</Typography>
                                        <Typography variant="body1">{formatDate(application.applied_at)}</Typography>
                                    </Box>
                                </Box>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <CalendarToday sx={{ mr: 1, fontSize: 20, color: 'text.secondary' }} />
                                    <Box>
                                        <Typography variant="body2" color="textSecondary">Deadline</Typography>
                                        <Typography variant="body1">{formatDate(application.deadline)}</Typography>
                                    </Box>
                                </Box>
                            </Grid>

                            {application.job_type && (
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" color="textSecondary">Job Type</Typography>
                                    <Chip label={application.job_type} size="small" sx={{ mt: 0.5 }} />
                                </Grid>
                            )}

                            {application.employment_type && (
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" color="textSecondary">Employment Type</Typography>
                                    <Chip label={application.employment_type} size="small" sx={{ mt: 0.5 }} />
                                </Grid>
                            )}

                            {application.source && (
                                <Grid item xs={12}>
                                    <Typography variant="body2" color="textSecondary">Source</Typography>
                                    <Typography variant="body1">{application.source}</Typography>
                                </Grid>
                            )}

                            {application.job_url && (
                                <Grid item xs={12}>
                                    <Button
                                        startIcon={<LinkIcon />}
                                        href={application.job_url}
                                        target="_blank"
                                        variant="outlined"
                                        size="small"
                                    >
                                        View Job Posting
                                    </Button>
                                </Grid>
                            )}

                            {application.description && (
                                <Grid item xs={12}>
                                    <Divider sx={{ my: 2 }} />
                                    <Typography variant="body2" color="textSecondary" gutterBottom>
                                        Description
                                    </Typography>
                                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                                        {application.description}
                                    </Typography>
                                </Grid>
                            )}

                            {application.notes && (
                                <Grid item xs={12}>
                                    <Divider sx={{ my: 2 }} />
                                    <Typography variant="body2" color="textSecondary" gutterBottom>
                                        Notes
                                    </Typography>
                                    <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                                        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                                            {application.notes}
                                        </Typography>
                                    </Paper>
                                </Grid>
                            )}
                        </Grid>
                    </Paper>

                    {/* Activity Timeline */}
                    <Box sx={{ position: 'relative' }}>
                        <Typography variant="h6" gutterBottom>
                            Activity Timeline
                        </Typography>
                        <ActivityTimeline
                            activities={activities}
                            onEdit={handleEditActivity}
                            onDelete={handleDeleteActivity}
                        />
                        <Fab
                            color="primary"
                            aria-label="add activity"
                            sx={{ position: 'fixed', bottom: 80, right: 24 }}
                            onClick={() => setActivityDialogOpen(true)}
                        >
                            <Add />
                        </Fab>
                    </Box>
                </DialogContent>

                <DialogActions>
                    <Button onClick={onClose}>Close</Button>
                </DialogActions>
            </Dialog>

            <AddActivityDialog
                open={activityDialogOpen}
                activity={editingActivity}
                jobApplicationId={application.id}
                onClose={handleActivityDialogClose}
                onSave={handleActivitySave}
            />
        </>
    );
}
