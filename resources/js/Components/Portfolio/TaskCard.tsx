import React from 'react';
import { Card, CardContent, Typography, Chip, IconButton, Box } from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '@/types';

interface TaskCardProps {
    task: Task;
    onEdit: (task: Task) => void;
    onDelete: (taskId: number) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: task.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const priorityColors: Record<Task['priority'], 'success' | 'warning' | 'error'> = {
        low: 'success',
        medium: 'warning',
        high: 'error',
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return null;
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    return (
        <Card
            ref={setNodeRef}
            style={style}
            sx={{
                mb: 1.5,
                cursor: 'grab',
                '&:active': { cursor: 'grabbing' },
                borderLeft: `4px solid`,
                borderLeftColor:
                    task.priority === 'high' ? 'error.main' :
                    task.priority === 'medium' ? 'warning.main' :
                    'success.main',
            }}
            {...attributes}
            {...listeners}
        >
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                    <Typography variant="subtitle1" fontWeight="medium" sx={{ flex: 1 }}>
                        {task.title}
                    </Typography>
                    <Box>
                        <IconButton
                            size="small"
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit(task);
                            }}
                            sx={{ ml: 0.5 }}
                        >
                            <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                            size="small"
                            color="error"
                            onClick={(e) => {
                                e.stopPropagation();
                                if (confirm('Are you sure you want to delete this task?')) {
                                    onDelete(task.id);
                                }
                            }}
                        >
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Box>
                </Box>

                {task.description && (
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                            mb: 1,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                        }}
                    >
                        {task.description}
                    </Typography>
                )}

                <Box display="flex" gap={1} flexWrap="wrap" alignItems="center">
                    <Chip
                        label={task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                        size="small"
                        color={priorityColors[task.priority]}
                    />
                    {task.due_date && (
                        <Chip
                            label={formatDate(task.due_date)}
                            size="small"
                            variant="outlined"
                        />
                    )}
                </Box>
            </CardContent>
        </Card>
    );
};

export default TaskCard;
