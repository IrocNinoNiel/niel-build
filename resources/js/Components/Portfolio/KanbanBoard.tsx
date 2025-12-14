import React from 'react';
import { Box, Paper, Typography, Grid } from '@mui/material';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Task } from '@/types';
import TaskCard from './TaskCard';

interface KanbanBoardProps {
    tasks: Task[];
    onTaskUpdate: (taskId: number, status: Task['status']) => void;
    onTaskEdit: (task: Task) => void;
    onTaskDelete: (taskId: number) => void;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({
    tasks,
    onTaskUpdate,
    onTaskEdit,
    onTaskDelete,
}) => {
    const [activeTask, setActiveTask] = React.useState<Task | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    const columns: { id: Task['status']; title: string; color: string }[] = [
        { id: 'pending', title: 'Pending', color: '#9e9e9e' },
        { id: 'in_progress', title: 'In Progress', color: '#2196f3' },
        { id: 'completed', title: 'Completed', color: '#4caf50' },
    ];

    const getTasksByStatus = (status: Task['status']) => {
        return tasks.filter((task) => task.status === status);
    };

    const handleDragStart = (event: DragStartEvent) => {
        const task = tasks.find((t) => t.id === event.active.id);
        setActiveTask(task || null);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveTask(null);

        if (!over) return;

        const taskId = Number(active.id);
        const newStatus = over.id as Task['status'];

        const task = tasks.find((t) => t.id === taskId);
        if (task && task.status !== newStatus) {
            onTaskUpdate(taskId, newStatus);
        }
    };

    return (
        <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <Grid container spacing={2}>
                {columns.map((column) => {
                    const columnTasks = getTasksByStatus(column.id);

                    return (
                        <Grid item xs={12} md={4} key={column.id}>
                            <Paper
                                elevation={2}
                                sx={{
                                    p: 2,
                                    minHeight: '500px',
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
                                    <Typography variant="h6" fontWeight="bold">
                                        {column.title}
                                    </Typography>
                                    <Box
                                        sx={{
                                            ml: 1,
                                            px: 1,
                                            py: 0.5,
                                            borderRadius: '12px',
                                            backgroundColor: column.color,
                                            color: 'white',
                                            fontSize: '0.75rem',
                                            fontWeight: 'bold',
                                        }}
                                    >
                                        {columnTasks.length}
                                    </Box>
                                </Box>

                                <SortableContext
                                    items={columnTasks.map((t) => t.id)}
                                    strategy={verticalListSortingStrategy}
                                    id={column.id}
                                >
                                    <Box>
                                        {columnTasks.length === 0 ? (
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                textAlign="center"
                                                sx={{ mt: 4 }}
                                            >
                                                No tasks in this column
                                            </Typography>
                                        ) : (
                                            columnTasks.map((task) => (
                                                <TaskCard
                                                    key={task.id}
                                                    task={task}
                                                    onEdit={onTaskEdit}
                                                    onDelete={onTaskDelete}
                                                />
                                            ))
                                        )}
                                    </Box>
                                </SortableContext>
                            </Paper>
                        </Grid>
                    );
                })}
            </Grid>

            <DragOverlay>
                {activeTask ? (
                    <TaskCard
                        task={activeTask}
                        onEdit={() => {}}
                        onDelete={() => {}}
                    />
                ) : null}
            </DragOverlay>
        </DndContext>
    );
};

export default KanbanBoard;
