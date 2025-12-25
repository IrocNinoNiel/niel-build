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
    Autocomplete,
    Box,
} from '@mui/material';
import { JobApplication, Company } from '@/types';
import axios from 'axios';

interface ApplicationDialogProps {
    open: boolean;
    application: JobApplication | null;
    companies: Company[];
    onClose: () => void;
    onSave: () => void;
}

export default function ApplicationDialog({
    open,
    application,
    companies,
    onClose,
    onSave,
}: ApplicationDialogProps) {
    const [formData, setFormData] = useState<Partial<JobApplication>>({
        company_id: 0,
        job_title: '',
        job_url: '',
        description: '',
        salary_min: null,
        salary_max: null,
        location: '',
        job_type: null,
        employment_type: null,
        status: 'wishlist',
        priority: 'medium',
        applied_at: null,
        deadline: null,
        source: '',
        notes: '',
    });

    const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
    const [newCompanyName, setNewCompanyName] = useState('');

    useEffect(() => {
        if (application) {
            setFormData(application);
            const company = companies.find(c => c.id === application.company_id);
            setSelectedCompany(company || null);
        } else {
            setFormData({
                company_id: 0,
                job_title: '',
                job_url: '',
                description: '',
                salary_min: null,
                salary_max: null,
                location: '',
                job_type: null,
                employment_type: null,
                status: 'wishlist',
                priority: 'medium',
                applied_at: null,
                deadline: null,
                source: '',
                notes: '',
            });
            setSelectedCompany(null);
            setNewCompanyName('');
        }
    }, [application, companies, open]);

    const handleChange = (field: keyof JobApplication, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        try {
            let companyId = selectedCompany?.id;

            if (!companyId && newCompanyName) {
                const companyResponse = await axios.post('/companies', { name: newCompanyName });
                companyId = companyResponse.data.id;
            }

            const dataToSubmit = {
                ...formData,
                company_id: companyId,
            };

            if (application) {
                await axios.put(`/job-applications/${application.id}`, dataToSubmit);
            } else {
                await axios.post('/job-applications', dataToSubmit);
            }

            onSave();
        } catch (error) {
            console.error('Error saving application:', error);
            alert('Failed to save application');
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>{application ? 'Edit Application' : 'Add New Application'}</DialogTitle>
            <DialogContent>
                <Box sx={{ pt: 2 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Autocomplete
                                value={selectedCompany}
                                onChange={(_, newValue) => {
                                    if (typeof newValue === 'string') {
                                        setNewCompanyName(newValue);
                                        setSelectedCompany(null);
                                    } else {
                                        setSelectedCompany(newValue);
                                        if (newValue) setNewCompanyName('');
                                    }
                                }}
                                inputValue={newCompanyName}
                                onInputChange={(_, newInputValue) => setNewCompanyName(newInputValue)}
                                options={companies}
                                getOptionLabel={(option) => typeof option === 'string' ? option : option.name}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Company"
                                        required
                                        helperText="Select existing or type new company name"
                                    />
                                )}
                                freeSolo
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Job Title"
                                value={formData.job_title}
                                onChange={(e) => handleChange('job_title', e.target.value)}
                                required
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Job URL"
                                value={formData.job_url}
                                onChange={(e) => handleChange('job_url', e.target.value)}
                                type="url"
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
                            />
                        </Grid>

                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                label="Salary Min"
                                value={formData.salary_min || ''}
                                onChange={(e) => handleChange('salary_min', e.target.value ? parseFloat(e.target.value) : null)}
                                type="number"
                            />
                        </Grid>

                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                label="Salary Max"
                                value={formData.salary_max || ''}
                                onChange={(e) => handleChange('salary_max', e.target.value ? parseFloat(e.target.value) : null)}
                                type="number"
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Location"
                                value={formData.location}
                                onChange={(e) => handleChange('location', e.target.value)}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                select
                                label="Job Type"
                                value={formData.job_type || ''}
                                onChange={(e) => handleChange('job_type', e.target.value || null)}
                            >
                                <MenuItem value="">None</MenuItem>
                                <MenuItem value="remote">Remote</MenuItem>
                                <MenuItem value="hybrid">Hybrid</MenuItem>
                                <MenuItem value="onsite">Onsite</MenuItem>
                            </TextField>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                select
                                label="Employment Type"
                                value={formData.employment_type || ''}
                                onChange={(e) => handleChange('employment_type', e.target.value || null)}
                            >
                                <MenuItem value="">None</MenuItem>
                                <MenuItem value="full-time">Full-time</MenuItem>
                                <MenuItem value="part-time">Part-time</MenuItem>
                                <MenuItem value="contract">Contract</MenuItem>
                                <MenuItem value="freelance">Freelance</MenuItem>
                            </TextField>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                select
                                label="Status"
                                value={formData.status}
                                onChange={(e) => handleChange('status', e.target.value)}
                                required
                            >
                                <MenuItem value="wishlist">Wishlist</MenuItem>
                                <MenuItem value="applied">Applied</MenuItem>
                                <MenuItem value="interviewing">Interviewing</MenuItem>
                                <MenuItem value="offered">Offered</MenuItem>
                                <MenuItem value="accepted">Accepted</MenuItem>
                                <MenuItem value="rejected">Rejected</MenuItem>
                                <MenuItem value="withdrawn">Withdrawn</MenuItem>
                            </TextField>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                select
                                label="Priority"
                                value={formData.priority}
                                onChange={(e) => handleChange('priority', e.target.value)}
                                required
                            >
                                <MenuItem value="low">Low</MenuItem>
                                <MenuItem value="medium">Medium</MenuItem>
                                <MenuItem value="high">High</MenuItem>
                            </TextField>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Applied Date"
                                value={formData.applied_at || ''}
                                onChange={(e) => handleChange('applied_at', e.target.value || null)}
                                type="date"
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Deadline"
                                value={formData.deadline || ''}
                                onChange={(e) => handleChange('deadline', e.target.value || null)}
                                type="date"
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Source"
                                value={formData.source}
                                onChange={(e) => handleChange('source', e.target.value)}
                                placeholder="e.g., LinkedIn, Indeed, Company Website"
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Notes"
                                value={formData.notes}
                                onChange={(e) => handleChange('notes', e.target.value)}
                                multiline
                                rows={3}
                            />
                        </Grid>
                    </Grid>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleSubmit} variant="contained" color="primary">
                    {application ? 'Update' : 'Create'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
