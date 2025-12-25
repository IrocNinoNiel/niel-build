import React, { useMemo } from 'react';
import { Box, Grid, Paper, Typography, Card, CardContent } from '@mui/material';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { JobApplication } from '@/types';
import { TrendingUp, PieChart as PieChartIcon, Assessment, Source } from '@mui/icons-material';

interface ApplicationAnalyticsProps {
    applications: JobApplication[];
}

const COLORS = {
    wishlist: '#9e9e9e',
    applied: '#2196f3',
    interviewing: '#ff9800',
    offered: '#9c27b0',
    accepted: '#4caf50',
    rejected: '#f44336',
    withdrawn: '#757575',
};

export default function ApplicationAnalytics({ applications }: ApplicationAnalyticsProps) {
    // Applications over time (last 30 days)
    const applicationsOverTime = useMemo(() => {
        const last30Days = Array.from({ length: 30 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (29 - i));
            return date.toISOString().split('T')[0];
        });

        const counts = last30Days.map(date => {
            const count = applications.filter(app => {
                if (!app.applied_at) return false;
                return app.applied_at.split('T')[0] === date;
            }).length;

            return {
                date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                applications: count,
            };
        });

        return counts;
    }, [applications]);

    // Applications by status
    const applicationsByStatus = useMemo(() => {
        const statusCounts: Record<string, number> = {};
        applications.forEach(app => {
            statusCounts[app.status] = (statusCounts[app.status] || 0) + 1;
        });

        return Object.entries(statusCounts).map(([status, count]) => ({
            name: status.charAt(0).toUpperCase() + status.slice(1),
            value: count,
            color: COLORS[status as keyof typeof COLORS],
        }));
    }, [applications]);

    // Success funnel
    const successFunnel = useMemo(() => {
        return [
            { stage: 'Wishlist', count: applications.filter(a => a.status === 'wishlist').length },
            { stage: 'Applied', count: applications.filter(a => a.status === 'applied').length },
            { stage: 'Interviewing', count: applications.filter(a => a.status === 'interviewing').length },
            { stage: 'Offered', count: applications.filter(a => a.status === 'offered').length },
            { stage: 'Accepted', count: applications.filter(a => a.status === 'accepted').length },
        ];
    }, [applications]);

    // Applications by source
    const applicationsBySource = useMemo(() => {
        const sourceCounts: Record<string, number> = {};
        applications.forEach(app => {
            const source = app.source || 'Unknown';
            sourceCounts[source] = (sourceCounts[source] || 0) + 1;
        });

        return Object.entries(sourceCounts)
            .map(([source, count]) => ({ source, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
    }, [applications]);

    // Calculate success metrics
    const metrics = useMemo(() => {
        const total = applications.length;
        const applied = applications.filter(a => ['applied', 'interviewing', 'offered', 'accepted'].includes(a.status)).length;
        const interviewing = applications.filter(a => ['interviewing', 'offered', 'accepted'].includes(a.status)).length;
        const offered = applications.filter(a => ['offered', 'accepted'].includes(a.status)).length;
        const accepted = applications.filter(a => a.status === 'accepted').length;

        return {
            applicationRate: applied > 0 ? ((applied / total) * 100).toFixed(1) : '0',
            interviewRate: applied > 0 ? ((interviewing / applied) * 100).toFixed(1) : '0',
            offerRate: interviewing > 0 ? ((offered / interviewing) * 100).toFixed(1) : '0',
            acceptanceRate: offered > 0 ? ((accepted / offered) * 100).toFixed(1) : '0',
        };
    }, [applications]);

    return (
        <Box>
            {/* Metrics Cards */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom variant="body2">
                                Application Rate
                            </Typography>
                            <Typography variant="h4" component="div">
                                {metrics.applicationRate}%
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                                Wishlist → Applied
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom variant="body2">
                                Interview Rate
                            </Typography>
                            <Typography variant="h4" component="div">
                                {metrics.interviewRate}%
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                                Applied → Interviewing
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom variant="body2">
                                Offer Rate
                            </Typography>
                            <Typography variant="h4" component="div">
                                {metrics.offerRate}%
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                                Interviewing → Offered
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom variant="body2">
                                Acceptance Rate
                            </Typography>
                            <Typography variant="h4" component="div">
                                {metrics.acceptanceRate}%
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                                Offered → Accepted
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Charts */}
            <Grid container spacing={3}>
                {/* Applications Over Time */}
                <Grid item xs={12} lg={6}>
                    <Paper sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <TrendingUp color="primary" sx={{ mr: 1 }} />
                            <Typography variant="h6">Applications Over Time (Last 30 Days)</Typography>
                        </Box>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={applicationsOverTime}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" angle={-45} textAnchor="end" height={80} />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="applications"
                                    stroke="#2196f3"
                                    strokeWidth={2}
                                    dot={{ fill: '#2196f3', r: 4 }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

                {/* Applications by Status */}
                <Grid item xs={12} lg={6}>
                    <Paper sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <PieChartIcon color="primary" sx={{ mr: 1 }} />
                            <Typography variant="h6">Applications by Status</Typography>
                        </Box>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={applicationsByStatus}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {applicationsByStatus.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

                {/* Success Funnel */}
                <Grid item xs={12} lg={6}>
                    <Paper sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Assessment color="primary" sx={{ mr: 1 }} />
                            <Typography variant="h6">Application Funnel</Typography>
                        </Box>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={successFunnel} layout="horizontal">
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" />
                                <YAxis dataKey="stage" type="category" width={100} />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="count" fill="#2196f3" name="Applications" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

                {/* Applications by Source */}
                <Grid item xs={12} lg={6}>
                    <Paper sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Source color="primary" sx={{ mr: 1 }} />
                            <Typography variant="h6">Top Application Sources</Typography>
                        </Box>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={applicationsBySource}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="source" angle={-45} textAnchor="end" height={100} />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="count" fill="#ff9800" name="Applications" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}
