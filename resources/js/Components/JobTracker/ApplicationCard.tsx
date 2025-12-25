import React from 'react';
import { Card, CardContent, Typography, Chip, IconButton, Box } from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon, Business, AttachMoney, LocationOn } from '@mui/icons-material';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { JobApplication } from '@/types';

interface ApplicationCardProps {
    application: JobApplication;
    onEdit: (application: JobApplication) => void;
    onDelete: (id: number) => void;
    onView?: (id: number) => void;
}

export default function ApplicationCard({ application, onEdit, onDelete, onView }: ApplicationCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: application.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const priorityColors: Record<JobApplication['priority'], 'success' | 'warning' | 'error'> = {
        low: 'success',
        medium: 'warning',
        high: 'error',
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return null;
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    const formatSalary = (min: number | null, max: number | null) => {
        if (!min && !max) return null;
        if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
        if (min) return `$${min.toLocaleString()}+`;
        return `Up to $${max?.toLocaleString()}`;
    };

    return (
        <Card
            ref={setNodeRef}
            style={style}
            sx={{
                cursor: 'grab',
                '&:active': { cursor: 'grabbing' },
                '&:hover': { boxShadow: 4 },
                borderLeft: `4px solid`,
                borderLeftColor:
                    application.priority === 'high' ? 'error.main' :
                    application.priority === 'medium' ? 'warning.main' :
                    'success.main',
            }}
            {...attributes}
            {...listeners}
            onClick={(e) => {
                if (onView && !isDragging) {
                    e.stopPropagation();
                    onView(application.id);
                }
            }}
        >
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                    <Typography variant="subtitle2" fontWeight="bold" sx={{ flex: 1, fontSize: '0.9rem' }}>
                        {application.job_title}
                    </Typography>
                    <Box>
                        <IconButton
                            size="small"
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit(application);
                            }}
                            sx={{ p: 0.5 }}
                        >
                            <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                            size="small"
                            color="error"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(application.id);
                            }}
                            sx={{ p: 0.5 }}
                        >
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Box>
                </Box>

                <Box display="flex" alignItems="center" gap={0.5} mb={1}>
                    <Business sx={{ fontSize: 14, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary" fontSize="0.75rem">
                        {application.company?.name || 'Unknown Company'}
                    </Typography>
                </Box>

                {application.location && (
                    <Box display="flex" alignItems="center" gap={0.5} mb={1}>
                        <LocationOn sx={{ fontSize: 14, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary" fontSize="0.75rem">
                            {application.location}
                        </Typography>
                    </Box>
                )}

                {formatSalary(application.salary_min, application.salary_max) && (
                    <Box display="flex" alignItems="center" gap={0.5} mb={1}>
                        <AttachMoney sx={{ fontSize: 14, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary" fontSize="0.75rem">
                            {formatSalary(application.salary_min, application.salary_max)}
                        </Typography>
                    </Box>
                )}

                <Box display="flex" gap={0.5} flexWrap="wrap" mt={1}>
                    <Chip
                        label={application.priority}
                        color={priorityColors[application.priority]}
                        size="small"
                        sx={{ height: 20, fontSize: '0.65rem' }}
                    />
                    {application.job_type && (
                        <Chip
                            label={application.job_type}
                            size="small"
                            variant="outlined"
                            sx={{ height: 20, fontSize: '0.65rem' }}
                        />
                    )}
                    {application.applied_at && (
                        <Chip
                            label={`Applied: ${formatDate(application.applied_at)}`}
                            size="small"
                            sx={{ height: 20, fontSize: '0.65rem' }}
                        />
                    )}
                </Box>
            </CardContent>
        </Card>
    );
}
