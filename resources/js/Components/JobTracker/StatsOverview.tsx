import React, { useMemo } from 'react';
import { Grid, Card, CardContent, Typography, Box, CircularProgress } from '@mui/material';
import { Work, Send, Phone, CheckCircle, ThumbDown, Star } from '@mui/icons-material';
import { JobApplication } from '@/types';

interface StatsOverviewProps {
    applications: JobApplication[];
    loading: boolean;
}

interface StatCardProps {
    title: string;
    value: number;
    icon: React.ReactNode;
    color: string;
}

function StatCard({ title, value, icon, color }: StatCardProps) {
    return (
        <Card sx={{ height: '100%' }}>
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                        <Typography color="textSecondary" gutterBottom variant="body2">
                            {title}
                        </Typography>
                        <Typography variant="h3" component="div">
                            {value}
                        </Typography>
                    </Box>
                    <Box
                        sx={{
                            backgroundColor: color,
                            borderRadius: '50%',
                            width: 56,
                            height: 56,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        {icon}
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
}

export default function StatsOverview({ applications, loading }: StatsOverviewProps) {
    const stats = useMemo(() => {
        return {
            total: applications.length,
            wishlist: applications.filter(app => app.status === 'wishlist').length,
            applied: applications.filter(app => app.status === 'applied').length,
            interviewing: applications.filter(app => app.status === 'interviewing').length,
            offered: applications.filter(app => app.status === 'offered').length,
            accepted: applications.filter(app => app.status === 'accepted').length,
            rejected: applications.filter(app => app.status === 'rejected').length,
            highPriority: applications.filter(app => app.priority === 'high').length,
        };
    }, [applications]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
                <StatCard
                    title="Total Applications"
                    value={stats.total}
                    icon={<Work sx={{ color: 'white' }} />}
                    color="#1976d2"
                />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
                <StatCard
                    title="Applied"
                    value={stats.applied}
                    icon={<Send sx={{ color: 'white' }} />}
                    color="#2e7d32"
                />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
                <StatCard
                    title="Interviewing"
                    value={stats.interviewing}
                    icon={<Phone sx={{ color: 'white' }} />}
                    color="#ed6c02"
                />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
                <StatCard
                    title="Offers"
                    value={stats.offered + stats.accepted}
                    icon={<CheckCircle sx={{ color: 'white' }} />}
                    color="#9c27b0"
                />
            </Grid>
        </Grid>
    );
}
