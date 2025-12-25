import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Grid,
    MenuItem,
    Box,
} from '@mui/material';
import { ApplicationActivity } from '@/types';
import axios from 'axios';

interface AddActivityDialogProps {
    open: boolean;
    activity: ApplicationActivity | null;
    jobApplicationId: number;
    onClose: () => void;
    onSave: () => void;
}

export default function AddActivityDialog({
    open,
    activity,
    jobApplicationId,
    onClose,
    onSave,
}: AddActivityDialogProps) {
    const [formData, setFormData] = useState<Partial<ApplicationActivity>>({
        job_application_id: jobApplicationId,
        activity_type: 'other',
        title: '',
        description: '',
        scheduled_at: null,
        completed_at: null,
        outcome: 'pending',
        notes: '',
    });

    useEffect(() => {
        if (activity) {
            setFormData({
                ...activity,
                scheduled_at: activity.scheduled_at?.split('T')[0] || null,
                completed_at: activity.completed_at?.split('T')[0] || null,
            });
        } else {
            setFormData({
                job_application_id: jobApplicationId,
                activity_type: 'other',
                title: '',
                description: '',
                scheduled_at: null,
                completed_at: null,
                outcome: 'pending',
                notes: '',
            });
        }
    }, [activity, jobApplicationId, open]);

    const handleChange = (field: keyof ApplicationActivity, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        try {
            const dataToSubmit = {
                ...formData,
                job_application_id: jobApplicationId,
            };

            if (activity) {
                await axios.put(`/application-activities/${activity.id}`, dataToSubmit);
            } else {
                await axios.post('/application-activities', dataToSubmit);
            }

            onSave();
        } catch (error) {
            console.error('Error saving activity:', error);
            alert('Failed to save activity');
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>{activity ? 'Edit Activity' : 'Add New Activity'}</DialogTitle>
            <DialogContent>
                <Box sx={{ pt: 2 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                select
                                label="Activity Type"
                                value={formData.activity_type}
                                onChange={(e) => handleChange('activity_type', e.target.value)}
                                required
                            >
                                <MenuItem value="applied">Applied</MenuItem>
                                <MenuItem value="phone_screen">Phone Screen</MenuItem>
                                <MenuItem value="interview">Interview</MenuItem>
                                <MenuItem value="technical_test">Technical Test</MenuItem>
                                <MenuItem value="offer">Offer</MenuItem>
                                <MenuItem value="rejection">Rejection</MenuItem>
                                <MenuItem value="follow_up">Follow Up</MenuItem>
                                <MenuItem value="other">Other</MenuItem>
                            </TextField>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                select
                                label="Outcome"
                                value={formData.outcome}
                                onChange={(e) => handleChange('outcome', e.target.value)}
                                required
                            >
                                <MenuItem value="pending">Pending</MenuItem>
                                <MenuItem value="positive">Positive</MenuItem>
                                <MenuItem value="neutral">Neutral</MenuItem>
                                <MenuItem value="negative">Negative</MenuItem>
                            </TextField>
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Title"
                                value={formData.title}
                                onChange={(e) => handleChange('title', e.target.value)}
                                required
                                placeholder="e.g., First Round Interview with Engineering Manager"
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Description"
                                value={formData.description}
                                onChange={(e) => handleChange('description', e.target.value)}
                                multiline
                                rows={3}
                                placeholder="Describe what happened or what to expect..."
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Scheduled Date & Time"
                                value={formData.scheduled_at || ''}
                                onChange={(e) => handleChange('scheduled_at', e.target.value || null)}
                                type="datetime-local"
                                InputLabelProps={{ shrink: true }}
                                helperText="When is/was this activity scheduled?"
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Completed Date & Time"
                                value={formData.completed_at || ''}
                                onChange={(e) => handleChange('completed_at', e.target.value || null)}
                                type="datetime-local"
                                InputLabelProps={{ shrink: true }}
                                helperText="When did you complete this?"
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Notes"
                                value={formData.notes}
                                onChange={(e) => handleChange('notes', e.target.value)}
                                multiline
                                rows={4}
                                placeholder="Any additional notes, questions asked, impressions, next steps..."
                            />
                        </Grid>
                    </Grid>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleSubmit} variant="contained" color="primary">
                    {activity ? 'Update' : 'Add'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
