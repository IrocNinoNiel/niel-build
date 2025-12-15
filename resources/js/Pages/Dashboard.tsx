import { useState, SyntheticEvent } from 'react';
import { Head } from '@inertiajs/react';
import PortfolioLayout from '@/Layouts/PortfolioLayout';
import TaskManager from '@/Components/Portfolio/TaskManager';
import SpendingTracker from '@/Components/Spending/SpendingTracker';
import CategoryManager from '@/Components/Spending/CategoryManager';
import {
    Box,
    Tabs,
    Tab,
    Typography,
    Paper,
    Card,
    CardContent,
    Grid,
} from '@mui/material';
import CodeIcon from '@mui/icons-material/Code';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CategoryIcon from '@mui/icons-material/Category';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`tabpanel-${index}`}
            aria-labelledby={`tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
        </div>
    );
}

interface SubTabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function SubTabPanel(props: SubTabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`sub-tabpanel-${index}`}
            aria-labelledby={`sub-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
        </div>
    );
}

export default function Dashboard() {
    const [headerTab, setHeaderTab] = useState(0);
    const [subTab, setSubTab] = useState(0);

    const handleHeaderTabChange = (event: SyntheticEvent, newValue: number) => {
        setHeaderTab(newValue);
        setSubTab(0);
    };

    const handleSubTabChange = (event: SyntheticEvent, newValue: number) => {
        setSubTab(newValue);
    };

    return (
        <PortfolioLayout>
            <Head title="Dashboard - Portfolio" />

            <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
                {/* Header Section */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                        Portfolio Dashboard
                    </Typography>
                    <Typography variant="body1" color="textSecondary">
                        Explore my React projects and demos
                    </Typography>
                </Box>

                {/* Project Preview Cards */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} md={4}>
                        <Card sx={{ height: '100%', cursor: 'pointer' }} onClick={() => { setHeaderTab(0); setSubTab(0); }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <AssignmentIcon color="primary" sx={{ mr: 1 }} />
                                    <Typography variant="h6">Task Manager</Typography>
                                </Box>
                                <Typography variant="body2" color="textSecondary">
                                    A full-featured task management application with CRUD operations,
                                    status tracking, priority levels, and due dates.
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Card sx={{ height: '100%', cursor: 'pointer' }} onClick={() => { setHeaderTab(0); setSubTab(1); }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <AccountBalanceWalletIcon color="primary" sx={{ mr: 1 }} />
                                    <Typography variant="h6">Spending Tracker</Typography>
                                </Box>
                                <Typography variant="body2" color="textSecondary">
                                    Track your income and expenses with interactive charts,
                                    category breakdown, and auto-calculated balance.
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Card sx={{ height: '100%', cursor: 'pointer' }} onClick={() => { setHeaderTab(0); setSubTab(2); }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <CategoryIcon color="primary" sx={{ mr: 1 }} />
                                    <Typography variant="h6">Category Manager</Typography>
                                </Box>
                                <Typography variant="body2" color="textSecondary">
                                    Manage your income and expense categories with custom icons,
                                    colors, and organize your financial tracking.
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Main Tabs Section */}
                <Paper sx={{ width: '100%' }}>
                    {/* Header Tabs */}
                    <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: '#fafafa' }}>
                        <Tabs
                            value={headerTab}
                            onChange={handleHeaderTabChange}
                            aria-label="project categories"
                            sx={{
                                '& .MuiTab-root': {
                                    fontWeight: 'bold',
                                    fontSize: '1rem',
                                },
                            }}
                        >
                            <Tab
                                icon={<CodeIcon />}
                                iconPosition="start"
                                label="React Projects"
                            />
                        </Tabs>
                    </Box>

                    {/* React Projects Tab Panel */}
                    <TabPanel value={headerTab} index={0}>
                        {/* Sub Tabs */}
                        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
                            <Tabs
                                value={subTab}
                                onChange={handleSubTabChange}
                                aria-label="react projects"
                                variant="scrollable"
                                scrollButtons="auto"
                            >
                                <Tab
                                    icon={<AssignmentIcon />}
                                    iconPosition="start"
                                    label="Task Manager"
                                />
                                <Tab
                                    icon={<AccountBalanceWalletIcon />}
                                    iconPosition="start"
                                    label="Spending Tracker"
                                />
                                <Tab
                                    icon={<CategoryIcon />}
                                    iconPosition="start"
                                    label="Category Manager"
                                />
                            </Tabs>
                        </Box>

                        {/* Sub Tab Panels */}
                        <Box sx={{ p: 2 }}>
                            <SubTabPanel value={subTab} index={0}>
                                <TaskManager />
                            </SubTabPanel>
                            <SubTabPanel value={subTab} index={1}>
                                <SpendingTracker />
                            </SubTabPanel>
                            <SubTabPanel value={subTab} index={2}>
                                <CategoryManager />
                            </SubTabPanel>
                        </Box>
                    </TabPanel>
                </Paper>
            </Box>
        </PortfolioLayout>
    );
}
