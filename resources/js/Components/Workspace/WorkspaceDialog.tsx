import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Box,
} from '@mui/material';
import { Workspace } from '@/types';
import axios from 'axios';

interface WorkspaceDialogProps {
    open: boolean;
    workspace: Workspace | null;
    onClose: () => void;
    onCreate: (workspace: Workspace) => void;
    onUpdate: (workspace: Workspace) => void;
}

export default function WorkspaceDialog({
    open,
    workspace,
    onClose,
    onCreate,
    onUpdate,
}: WorkspaceDialogProps) {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (workspace) {
            setFormData({
                name: workspace.name,
                description: workspace.description || '',
            });
        } else {
            setFormData({
                name: '',
                description: '',
            });
        }
        setErrors({});
    }, [workspace, open]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        // Clear error for this field
        if (errors[e.target.name]) {
            setErrors({
                ...errors,
                [e.target.name]: '',
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setErrors({});

        try {
            if (workspace) {
                // Update existing workspace
                const response = await axios.put(`/api/v1/workspaces/${workspace.id}`, formData);
                onUpdate(response.data.data || response.data);
            } else {
                // Create new workspace
                const response = await axios.post('/api/v1/workspaces', formData);
                onCreate(response.data.data || response.data);
            }
        } catch (error: any) {
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else {
                console.error('Error saving workspace:', error);
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <form onSubmit={handleSubmit}>
                <DialogTitle>
                    {workspace ? 'Edit Workspace' : 'Create New Workspace'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            name="name"
                            label="Workspace Name"
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
                            rows={3}
                            fullWidth
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose} disabled={submitting}>
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={submitting}
                    >
                        {submitting ? 'Saving...' : workspace ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}
