import React from 'react';
import {
    Box,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Typography,
    Button,
    IconButton,
    Divider,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon } from '@mui/icons-material';
import { Project } from '@/types';

interface ProjectSidebarProps {
    projects: Project[];
    selectedProjectId: number | null;
    onProjectSelect: (projectId: number | null) => void;
    onAddProject: () => void;
    onEditProject: (project: Project) => void;
    mobileOpen?: boolean;
    onMobileClose?: () => void;
}

const DRAWER_WIDTH = 280;

const ProjectSidebar: React.FC<ProjectSidebarProps> = ({
    projects,
    selectedProjectId,
    onProjectSelect,
    onAddProject,
    onEditProject,
    mobileOpen = false,
    onMobileClose,
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const drawerContent = (
        <Box sx={{ p: 2 }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                Projects
            </Typography>

            <List sx={{ p: 0 }}>
                <ListItem disablePadding sx={{ mb: 1 }}>
                    <ListItemButton
                        selected={selectedProjectId === null}
                        onClick={() => {
                            onProjectSelect(null);
                            if (isMobile && onMobileClose) {
                                onMobileClose();
                            }
                        }}
                        sx={{
                            borderRadius: 1,
                            '&.Mui-selected': {
                                backgroundColor: 'primary.light',
                                color: 'primary.contrastText',
                                '&:hover': {
                                    backgroundColor: 'primary.main',
                                },
                            },
                        }}
                    >
                        <Box
                            sx={{
                                width: 12,
                                height: 12,
                                borderRadius: '50%',
                                backgroundColor: 'grey.400',
                                mr: 2,
                            }}
                        />
                        <ListItemText primary="All Projects" />
                    </ListItemButton>
                </ListItem>

                <Divider sx={{ my: 1 }} />

                {projects.map((project) => (
                    <ListItem
                        key={project.id}
                        disablePadding
                        sx={{ mb: 1 }}
                        secondaryAction={
                            <IconButton
                                edge="end"
                                size="small"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEditProject(project);
                                }}
                            >
                                <EditIcon fontSize="small" />
                            </IconButton>
                        }
                    >
                        <ListItemButton
                            selected={selectedProjectId === project.id}
                            onClick={() => {
                                onProjectSelect(project.id);
                                if (isMobile && onMobileClose) {
                                    onMobileClose();
                                }
                            }}
                            sx={{
                                borderRadius: 1,
                                pr: 6,
                                '&.Mui-selected': {
                                    backgroundColor: 'primary.light',
                                    color: 'primary.contrastText',
                                    '&:hover': {
                                        backgroundColor: 'primary.main',
                                    },
                                },
                            }}
                        >
                            <Box
                                sx={{
                                    width: 12,
                                    height: 12,
                                    borderRadius: '50%',
                                    backgroundColor: project.color,
                                    mr: 2,
                                    flexShrink: 0,
                                }}
                            />
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography
                                    variant="body2"
                                    noWrap
                                    sx={{ fontWeight: 'medium' }}
                                >
                                    {project.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {project.tasks_count || 0} tasks
                                </Typography>
                            </Box>
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>

            <Button
                fullWidth
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={onAddProject}
                sx={{ mt: 2 }}
            >
                New Project
            </Button>
        </Box>
    );

    return (
        <>
            {/* Mobile Drawer */}
            {isMobile ? (
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={onMobileClose}
                    ModalProps={{
                        keepMounted: true, // Better mobile performance
                    }}
                    sx={{
                        display: { xs: 'block', md: 'none' },
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: DRAWER_WIDTH,
                        },
                    }}
                >
                    {drawerContent}
                </Drawer>
            ) : (
                /* Desktop Drawer */
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', md: 'block' },
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: DRAWER_WIDTH,
                            position: 'relative',
                            height: '100%',
                        },
                    }}
                    open
                >
                    {drawerContent}
                </Drawer>
            )}
        </>
    );
};

export default ProjectSidebar;
