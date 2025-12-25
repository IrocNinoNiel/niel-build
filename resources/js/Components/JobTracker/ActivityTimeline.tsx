import React from 'react';
import {
    Box,
    Typography,
    Paper,
    IconButton,
    Chip,
    Avatar,
} from '@mui/material';
import {
    Phone,
    Work,
    Assessment,
    CheckCircle,
    Cancel,
    Message,
    MoreHoriz,
    Edit,
    Delete,
} from '@mui/icons-material';
import { ApplicationActivity } from '@/types';

interface ActivityTimelineProps {
    activities: ApplicationActivity[];
    onEdit?: (activity: ApplicationActivity) => void;
    onDelete?: (id: number) => void;
}

const activityIcons: Record<ApplicationActivity['activity_type'], React.ReactElement> = {
    applied: <Work />,
    phone_screen: <Phone />,
    interview: <Phone />,
    technical_test: <Assessment />,
    offer: <CheckCircle />,
    rejection: <Cancel />,
    follow_up: <Message />,
    other: <MoreHoriz />,
};

const activityColors: Record<ApplicationActivity['activity_type'], 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning'> = {
    applied: 'primary',
    phone_screen: 'info',
    interview: 'warning',
    technical_test: 'secondary',
    offer: 'success',
    rejection: 'error',
    follow_up: 'info',
    other: 'primary',
};

const outcomeColors: Record<ApplicationActivity['outcome'], 'success' | 'error' | 'warning' | 'default'> = {
    positive: 'success',
    neutral: 'warning',
    negative: 'error',
    pending: 'default',
};

export default function ActivityTimeline({ activities, onEdit, onDelete }: ActivityTimelineProps) {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
        });
    };

    if (activities.length === 0) {
        return (
            <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="textSecondary">
                    No activities recorded yet. Add your first activity to track your progress!
                </Typography>
            </Box>
        );
    }

    // Sort activities by date (newest first)
    const sortedActivities = [...activities].sort((a, b) => {
        const dateA = new Date(a.scheduled_at || a.created_at);
        const dateB = new Date(b.scheduled_at || b.created_at);
        return dateB.getTime() - dateA.getTime();
    });

    return (
        <Box sx={{ position: 'relative', pl: 3 }}>
            {sortedActivities.map((activity, index) => (
                <Box key={activity.id} sx={{ position: 'relative', pb: 4 }}>
                    {/* Timeline line */}
                    {index < sortedActivities.length - 1 && (
                        <Box
                            sx={{
                                position: 'absolute',
                                left: 20,
                                top: 48,
                                bottom: -16,
                                width: 2,
                                bgcolor: 'divider',
                            }}
                        />
                    )}

                    <Box sx={{ display: 'flex', gap: 2 }}>
                        {/* Timeline dot */}
                        <Avatar
                            sx={{
                                bgcolor: `${activityColors[activity.activity_type]}.main`,
                                width: 40,
                                height: 40,
                            }}
                        >
                            {activityIcons[activity.activity_type]}
                        </Avatar>

                        {/* Content */}
                        <Box sx={{ flex: 1 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                <Box>
                                    {activity.scheduled_at && (
                                        <Typography variant="caption" color="text.secondary" display="block">
                                            {formatDate(activity.scheduled_at)} {formatTime(activity.scheduled_at)}
                                        </Typography>
                                    )}
                                    {!activity.scheduled_at && (
                                        <Typography variant="caption" color="text.secondary" display="block">
                                            {formatDate(activity.created_at)}
                                        </Typography>
                                    )}
                                </Box>
                                {(onEdit || onDelete) && (
                                    <Box>
                                        {onEdit && (
                                            <IconButton size="small" onClick={() => onEdit(activity)}>
                                                <Edit fontSize="small" />
                                            </IconButton>
                                        )}
                                        {onDelete && (
                                            <IconButton
                                                size="small"
                                                color="error"
                                                onClick={() => onDelete(activity.id)}
                                            >
                                                <Delete fontSize="small" />
                                            </IconButton>
                                        )}
                                    </Box>
                                )}
                            </Box>

                            <Paper elevation={2} sx={{ p: 2 }}>
                                <Box sx={{ mb: 1 }}>
                                    <Typography variant="h6" component="span">
                                        {activity.title}
                                    </Typography>
                                    <Chip
                                        label={activity.activity_type.replace('_', ' ')}
                                        size="small"
                                        sx={{ ml: 1 }}
                                    />
                                    <Chip
                                        label={activity.outcome}
                                        size="small"
                                        color={outcomeColors[activity.outcome]}
                                        sx={{ ml: 1 }}
                                    />
                                </Box>

                                {activity.description && (
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                        {activity.description}
                                    </Typography>
                                )}

                                {activity.notes && (
                                    <Paper variant="outlined" sx={{ p: 1, mt: 1, bgcolor: 'background.default' }}>
                                        <Typography variant="caption" color="text.secondary" display="block">
                                            Notes:
                                        </Typography>
                                        <Typography variant="body2">
                                            {activity.notes}
                                        </Typography>
                                    </Paper>
                                )}

                                {activity.completed_at && (
                                    <Typography variant="caption" color="success.main" display="block" sx={{ mt: 1 }}>
                                        Completed: {formatDate(activity.completed_at)}
                                    </Typography>
                                )}
                            </Paper>
                        </Box>
                    </Box>
                </Box>
            ))}
        </Box>
    );
}
