import { PropsWithChildren, useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    AppBar,
    Box,
    Toolbar,
    Typography,
    Button,
    IconButton,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CodeIcon from '@mui/icons-material/Code';

const drawerWidth = 240;

export default function PortfolioLayout({ children }: PropsWithChildren) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const { auth } = usePage().props as any;

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const drawer = (
        <Box sx={{ mt: 2 }}>
            <Typography variant="h6" sx={{ px: 2, mb: 2, fontWeight: 'bold' }}>
                Portfolio Projects
            </Typography>
            <List>
                <ListItem disablePadding>
                    <ListItemButton component={Link} href="/dashboard">
                        <ListItemText primary="Dashboard" />
                    </ListItemButton>
                </ListItem>
            </List>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            <AppBar
                position="fixed"
                sx={{
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                    backgroundColor: '#1976d2',
                }}
            >
                <Toolbar>
                    {isMobile && (
                        <IconButton
                            color="inherit"
                            aria-label="open drawer"
                            edge="start"
                            onClick={handleDrawerToggle}
                            sx={{ mr: 2 }}
                        >
                            <MenuIcon />
                        </IconButton>
                    )}
                    <CodeIcon sx={{ mr: 1 }} />
                    <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
                        My Portfolio
                    </Typography>
                    {auth?.user ? (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button color="inherit" component={Link} href="/profile">
                                {auth.user.name}
                            </Button>
                            <Button
                                color="inherit"
                                component={Link}
                                href="/logout"
                                method="post"
                                as="button"
                            >
                                Logout
                            </Button>
                        </Box>
                    ) : (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button color="inherit" component={Link} href="/login">
                                Login
                            </Button>
                            <Button color="inherit" component={Link} href="/register">
                                Register
                            </Button>
                        </Box>
                    )}
                </Toolbar>
            </AppBar>

            {isMobile && (
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{
                        keepMounted: true,
                    }}
                    sx={{
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: drawerWidth,
                        },
                    }}
                >
                    {drawer}
                </Drawer>
            )}

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    width: '100%',
                    mt: '64px',
                    backgroundColor: '#f5f5f5',
                    minHeight: 'calc(100vh - 64px)',
                }}
            >
                {children}
            </Box>
        </Box>
    );
}
