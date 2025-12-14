import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    TextField,
    Button,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Grid,
    Card,
    CardContent,
    LinearProgress,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import { Add as AddIcon, Menu as MenuIcon } from '@mui/icons-material';
import axios from 'axios';
import { Task, Project } from '@/types';
import KanbanBoard from './KanbanBoard';
import ProjectSidebar from './ProjectSidebar';
import ProjectDialog from './ProjectDialog';

export default function TaskManager() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);

    // Task Dialog State
    const [taskDialogOpen, setTaskDialogOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [taskFormData, setTaskFormData] = useState({
        title: '',
        description: '',
        status: 'pending' as Task['status'],
        priority: 'medium' as Task['priority'],
        due_date: '',
        project_id: 0,
    });

    // Project Dialog State
    const [projectDialogOpen, setProjectDialogOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);

    // Mobile Sidebar
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        fetchProjects();
        fetchTasks();
    }, []);

    useEffect(() => {
        // Auto-select first project if none selected and tasks require project
        if (projects.length > 0 && selectedProjectId === null) {
            setSelectedProjectId(projects[0].id);
        }
    }, [projects]);

    const fetchProjects = async () => {
        try {
            const response = await axios.get('/api/projects');
            // Laravel API Resources wrap collections in a 'data' property
            setProjects(Array.isArray(response.data) ? response.data : response.data.data || []);
        } catch (error) {
            console.error('Error fetching projects:', error);
            setProjects([]);
        }
    };

    const fetchTasks = async () => {
        try {
            const response = await axios.get('/api/tasks');
            // Laravel API Resources wrap collections in a 'data' property
            setTasks(Array.isArray(response.data) ? response.data : response.data.data || []);
        } catch (error) {
            console.error('Error fetching tasks:', error);
            setTasks([]);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenTaskDialog = (task?: Task) => {
        if (task) {
            setEditingTask(task);
            setTaskFormData({
                title: task.title,
                description: task.description || '',
                status: task.status,
                priority: task.priority,
                due_date: task.due_date || '',
                project_id: task.project_id,
            });
        } else {
            setEditingTask(null);
            setTaskFormData({
                title: '',
                description: '',
                status: 'pending',
                priority: 'medium',
                due_date: '',
                project_id: selectedProjectId || (projects[0]?.id || 0),
            });
        }
        setTaskDialogOpen(true);
    };

    const handleCloseTaskDialog = () => {
        setTaskDialogOpen(false);
        setEditingTask(null);
    };

    const handleSubmitTask = async () => {
        try {
            if (editingTask) {
                await axios.put(`/api/tasks/${editingTask.id}`, taskFormData);
            } else {
                await axios.post('/api/tasks', taskFormData);
            }
            fetchTasks();
            fetchProjects(); // Refresh to update task counts
            handleCloseTaskDialog();
        } catch (error) {
            console.error('Error saving task:', error);
            alert('Error saving task. Please check all fields are valid.');
        }
    };

    const handleDeleteTask = async (id: number) => {
        try {
            await axios.delete(`/api/tasks/${id}`);
            fetchTasks();
            fetchProjects(); // Refresh to update task counts
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    };

    const handleTaskStatusUpdate = async (taskId: number, newStatus: Task['status']) => {
        try {
            await axios.patch(`/api/tasks/${taskId}`, { status: newStatus });
            fetchTasks();
        } catch (error) {
            console.error('Error updating task status:', error);
        }
    };

    const handleSubmitProject = async (data: Partial<Project>) => {
        try {
            if (editingProject) {
                await axios.put(`/api/projects/${editingProject.id}`, data);
            } else {
                const response = await axios.post('/api/projects', data);
                // Auto-select newly created project
                setSelectedProjectId(response.data.id);
            }
            fetchProjects();
        } catch (error) {
            console.error('Error saving project:', error);
            alert('Error saving project. Please check all fields are valid.');
        }
    };

    const handleEditProject = (project: Project) => {
        setEditingProject(project);
        setProjectDialogOpen(true);
    };

    // Get filtered tasks based on selected project
    const filteredTasks = selectedProjectId
        ? tasks.filter((t) => t.project_id === selectedProjectId)
        : tasks;

    const currentProject = projects.find((p) => p.id === selectedProjectId);

    const getTaskStats = () => {
        const total = filteredTasks.length;
        const completed = filteredTasks.filter((t) => t.status === 'completed').length;
        const inProgress = filteredTasks.filter((t) => t.status === 'in_progress').length;
        const pending = filteredTasks.filter((t) => t.status === 'pending').length;
        return { total, completed, inProgress, pending };
    };

    const stats = getTaskStats();

    if (loading) {
        return (
            <Box sx={{ width: '100%' }}>
                <LinearProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ display: 'flex', height: '100%' }}>
            {/* Sidebar */}
            <ProjectSidebar
                projects={projects}
                selectedProjectId={selectedProjectId}
                onProjectSelect={setSelectedProjectId}
                onAddProject={() => {
                    setEditingProject(null);
                    setProjectDialogOpen(true);
                }}
                onEditProject={handleEditProject}
                mobileOpen={mobileOpen}
                onMobileClose={() => setMobileOpen(false)}
            />

            {/* Main Content */}
            <Box sx={{ flex: 1, p: 3, overflow: 'auto' }}>
                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {isMobile && (
                            <IconButton onClick={() => setMobileOpen(true)}>
                                <MenuIcon />
                            </IconButton>
                        )}
                        <Typography variant="h5" fontWeight="bold">
                            {currentProject ? currentProject.name : 'All Projects'}
                        </Typography>
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => handleOpenTaskDialog()}
                        disabled={projects.length === 0}
                    >
                        Add Task
                    </Button>
                </Box>

                {projects.length === 0 ? (
                    <Card sx={{ p: 4, textAlign: 'center' }}>
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            No Projects Yet
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            Create your first project to start managing tasks
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => {
                                setEditingProject(null);
                                setProjectDialogOpen(true);
                            }}
                        >
                            Create Project
                        </Button>
                    </Card>
                ) : (
                    <>
                        {/* Stats Cards */}
                        <Grid container spacing={2} sx={{ mb: 3 }}>
                            <Grid item xs={6} md={3}>
                                <Card>
                                    <CardContent>
                                        <Typography color="textSecondary" gutterBottom variant="body2">
                                            Total Tasks
                                        </Typography>
                                        <Typography variant="h4">{stats.total}</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={6} md={3}>
                                <Card>
                                    <CardContent>
                                        <Typography color="textSecondary" gutterBottom variant="body2">
                                            Pending
                                        </Typography>
                                        <Typography variant="h4" color="text.secondary">
                                            {stats.pending}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={6} md={3}>
                                <Card>
                                    <CardContent>
                                        <Typography color="textSecondary" gutterBottom variant="body2">
                                            In Progress
                                        </Typography>
                                        <Typography variant="h4" color="primary">
                                            {stats.inProgress}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={6} md={3}>
                                <Card>
                                    <CardContent>
                                        <Typography color="textSecondary" gutterBottom variant="body2">
                                            Completed
                                        </Typography>
                                        <Typography variant="h4" color="success.main">
                                            {stats.completed}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>

                        {/* Kanban Board */}
                        <KanbanBoard
                            tasks={filteredTasks}
                            onTaskUpdate={handleTaskStatusUpdate}
                            onTaskEdit={handleOpenTaskDialog}
                            onTaskDelete={handleDeleteTask}
                        />
                    </>
                )}
            </Box>

            {/* Task Dialog */}
            <Dialog open={taskDialogOpen} onClose={handleCloseTaskDialog} maxWidth="sm" fullWidth>
                <DialogTitle>{editingTask ? 'Edit Task' : 'Add New Task'}</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        <TextField
                            label="Title"
                            value={taskFormData.title}
                            onChange={(e) => setTaskFormData({ ...taskFormData, title: e.target.value })}
                            fullWidth
                            required
                            autoFocus
                        />
                        <TextField
                            label="Description"
                            value={taskFormData.description}
                            onChange={(e) => setTaskFormData({ ...taskFormData, description: e.target.value })}
                            fullWidth
                            multiline
                            rows={3}
                        />
                        <FormControl fullWidth required>
                            <InputLabel>Project</InputLabel>
                            <Select
                                value={taskFormData.project_id}
                                label="Project"
                                onChange={(e) =>
                                    setTaskFormData({ ...taskFormData, project_id: e.target.value as number })
                                }
                            >
                                {projects.map((project) => (
                                    <MenuItem key={project.id} value={project.id}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Box
                                                sx={{
                                                    width: 12,
                                                    height: 12,
                                                    borderRadius: '50%',
                                                    backgroundColor: project.color,
                                                }}
                                            />
                                            {project.name}
                                        </Box>
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl fullWidth>
                            <InputLabel>Status</InputLabel>
                            <Select
                                value={taskFormData.status}
                                label="Status"
                                onChange={(e) =>
                                    setTaskFormData({ ...taskFormData, status: e.target.value as Task['status'] })
                                }
                            >
                                <MenuItem value="pending">Pending</MenuItem>
                                <MenuItem value="in_progress">In Progress</MenuItem>
                                <MenuItem value="completed">Completed</MenuItem>
                            </Select>
                        </FormControl>
                        <FormControl fullWidth>
                            <InputLabel>Priority</InputLabel>
                            <Select
                                value={taskFormData.priority}
                                label="Priority"
                                onChange={(e) =>
                                    setTaskFormData({ ...taskFormData, priority: e.target.value as Task['priority'] })
                                }
                            >
                                <MenuItem value="low">Low</MenuItem>
                                <MenuItem value="medium">Medium</MenuItem>
                                <MenuItem value="high">High</MenuItem>
                            </Select>
                        </FormControl>
                        <TextField
                            label="Due Date"
                            type="date"
                            value={taskFormData.due_date}
                            onChange={(e) => setTaskFormData({ ...taskFormData, due_date: e.target.value })}
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseTaskDialog}>Cancel</Button>
                    <Button
                        onClick={handleSubmitTask}
                        variant="contained"
                        disabled={!taskFormData.title || !taskFormData.project_id}
                    >
                        {editingTask ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Project Dialog */}
            <ProjectDialog
                open={projectDialogOpen}
                onClose={() => {
                    setProjectDialogOpen(false);
                    setEditingProject(null);
                }}
                onSubmit={handleSubmitProject}
                project={editingProject}
            />
        </Box>
    );
}
