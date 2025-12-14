import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Box,
} from '@mui/material';
import { Project } from '@/types';

interface ProjectDialogProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: Partial<Project>) => void;
    project?: Project | null;
}

const ProjectDialog: React.FC<ProjectDialogProps> = ({
    open,
    onClose,
    onSubmit,
    project,
}) => {
    const [formData, setFormData] = React.useState({
        name: '',
        description: '',
        color: '#1976d2',
        status: 'active' as Project['status'],
        due_date: '',
    });

    React.useEffect(() => {
        if (project) {
            setFormData({
                name: project.name,
                description: project.description || '',
                color: project.color,
                status: project.status,
                due_date: project.due_date || '',
            });
        } else {
            setFormData({
                name: '',
                description: '',
                color: '#1976d2',
                status: 'active',
                due_date: '',
            });
        }
    }, [project, open]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
        onClose();
    };

    const handleChange = (field: string, value: any) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const predefinedColors = [
        '#1976d2', // Blue
        '#9c27b0', // Purple
        '#f44336', // Red
        '#4caf50', // Green
        '#ff9800', // Orange
        '#00bcd4', // Cyan
        '#e91e63', // Pink
        '#795548', // Brown
    ];

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <form onSubmit={handleSubmit}>
                <DialogTitle>
                    {project ? 'Edit Project' : 'Create New Project'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        <TextField
                            label="Project Name"
                            value={formData.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            required
                            fullWidth
                            autoFocus
                        />

                        <TextField
                            label="Description"
                            value={formData.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                            multiline
                            rows={3}
                            fullWidth
                        />

                        <Box>
                            <InputLabel sx={{ mb: 1 }}>Color</InputLabel>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                                {predefinedColors.map((color) => (
                                    <Box
                                        key={color}
                                        onClick={() => handleChange('color', color)}
                                        sx={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: 1,
                                            backgroundColor: color,
                                            cursor: 'pointer',
                                            border: formData.color === color ? '3px solid black' : '2px solid transparent',
                                            transition: 'all 0.2s',
                                            '&:hover': {
                                                transform: 'scale(1.1)',
                                            },
                                        }}
                                    />
                                ))}
                            </Box>
                            <TextField
                                type="color"
                                value={formData.color}
                                onChange={(e) => handleChange('color', e.target.value)}
                                fullWidth
                                size="small"
                            />
                        </Box>

                        <FormControl fullWidth>
                            <InputLabel>Status</InputLabel>
                            <Select
                                value={formData.status}
                                label="Status"
                                onChange={(e) => handleChange('status', e.target.value)}
                            >
                                <MenuItem value="active">Active</MenuItem>
                                <MenuItem value="archived">Archived</MenuItem>
                                <MenuItem value="on_hold">On Hold</MenuItem>
                            </Select>
                        </FormControl>

                        <TextField
                            label="Due Date"
                            type="date"
                            value={formData.due_date}
                            onChange={(e) => handleChange('due_date', e.target.value)}
                            InputLabelProps={{
                                shrink: true,
                            }}
                            fullWidth
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button type="submit" variant="contained">
                        {project ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default ProjectDialog;
