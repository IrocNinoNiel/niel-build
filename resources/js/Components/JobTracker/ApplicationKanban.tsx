import React, { useState } from 'react';
import { Box, Paper, Typography, Grid, Button, Chip } from '@mui/material';
import { DndContext, DragEndEvent, DragStartEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { JobApplication, Company } from '@/types';
import ApplicationCard from './ApplicationCard';
import ApplicationDialog from './ApplicationDialog';
import ApplicationDetails from './ApplicationDetails';
import { Add } from '@mui/icons-material';
import axios from 'axios';

interface ApplicationKanbanProps {
    applications: JobApplication[];
    companies: Company[];
    onUpdate: (application: JobApplication) => void;
    onDelete: (id: number) => void;
    onCreate: (application: JobApplication) => void;
    onRefresh: () => void;
}

export default function ApplicationKanban({
    applications,
    companies,
    onUpdate,
    onDelete,
    onCreate,
    onRefresh
}: ApplicationKanbanProps) {
    const [activeApplication, setActiveApplication] = useState<JobApplication | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingApplication, setEditingApplication] = useState<JobApplication | null>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [viewingApplicationId, setViewingApplicationId] = useState<number | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    const columns: { id: JobApplication['status']; title: string; color: string }[] = [
        { id: 'wishlist', title: 'Wishlist', color: '#9e9e9e' },
        { id: 'applied', title: 'Applied', color: '#2196f3' },
        { id: 'interviewing', title: 'Interviewing', color: '#ff9800' },
        { id: 'offered', title: 'Offered', color: '#9c27b0' },
        { id: 'accepted', title: 'Accepted', color: '#4caf50' },
        { id: 'rejected', title: 'Rejected', color: '#f44336' },
    ];

    const getApplicationsByStatus = (status: JobApplication['status']) => {
        return applications.filter((app) => app.status === status);
    };

    const handleDragStart = (event: DragStartEvent) => {
        const app = applications.find((a) => a.id === event.active.id);
        setActiveApplication(app || null);
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveApplication(null);

        if (!over) return;

        const appId = Number(active.id);
        const newStatus = over.id as JobApplication['status'];

        const app = applications.find((a) => a.id === appId);
        if (app && app.status !== newStatus) {
            try {
                const response = await axios.put(`/job-applications/${appId}`, {
                    ...app,
                    status: newStatus,
                });
                onUpdate(response.data);
            } catch (error) {
                console.error('Error updating application status:', error);
            }
        }
    };

    const handleEdit = (application: JobApplication) => {
        setEditingApplication(application);
        setDialogOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (confirm('Are you sure you want to delete this application?')) {
            try {
                await axios.delete(`/job-applications/${id}`);
                onDelete(id);
            } catch (error) {
                console.error('Error deleting application:', error);
            }
        }
    };

    const handleDialogClose = () => {
        setDialogOpen(false);
        setEditingApplication(null);
    };

    const handleDialogSave = () => {
        handleDialogClose();
        onRefresh();
    };

    const handleView = (id: number) => {
        setViewingApplicationId(id);
        setDetailsOpen(true);
    };

    const handleDetailsClose = () => {
        setDetailsOpen(false);
        setViewingApplicationId(null);
    };

    const handleDetailsEdit = (application: JobApplication) => {
        setDetailsOpen(false);
        setEditingApplication(application);
        setDialogOpen(true);
    };

    return (
        <>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => setDialogOpen(true)}
                >
                    Add Application
                </Button>
            </Box>

            <DndContext
                sensors={sensors}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <Grid container spacing={2}>
                    {columns.map((column) => {
                        const columnApplications = getApplicationsByStatus(column.id);

                        return (
                            <Grid item xs={12} sm={6} md={4} lg={2} key={column.id}>
                                <Paper
                                    id={column.id}
                                    elevation={2}
                                    sx={{
                                        p: 2,
                                        minHeight: '600px',
                                        backgroundColor: '#fafafa',
                                    }}
                                >
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            mb: 2,
                                            pb: 1,
                                            borderBottom: `3px solid ${column.color}`,
                                        }}
                                    >
                                        <Typography variant="h6" fontWeight="bold" sx={{ fontSize: '0.95rem' }}>
                                            {column.title}
                                        </Typography>
                                        <Chip
                                            label={columnApplications.length}
                                            size="small"
                                            sx={{
                                                ml: 1,
                                                backgroundColor: column.color,
                                                color: 'white',
                                                fontWeight: 'bold',
                                            }}
                                        />
                                    </Box>

                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                        {columnApplications.map((application) => (
                                            <ApplicationCard
                                                key={application.id}
                                                application={application}
                                                onEdit={handleEdit}
                                                onDelete={handleDelete}
                                                onView={handleView}
                                            />
                                        ))}
                                    </Box>
                                </Paper>
                            </Grid>
                        );
                    })}
                </Grid>
            </DndContext>

            <ApplicationDialog
                open={dialogOpen}
                application={editingApplication}
                companies={companies}
                onClose={handleDialogClose}
                onSave={handleDialogSave}
            />

            <ApplicationDetails
                open={detailsOpen}
                applicationId={viewingApplicationId}
                onClose={handleDetailsClose}
                onEdit={handleDetailsEdit}
            />
        </>
    );
}
