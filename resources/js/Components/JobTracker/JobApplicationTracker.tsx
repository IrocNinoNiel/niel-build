import React, { useState, useEffect } from 'react';
import { Box, Tabs, Tab, Container } from '@mui/material';
import StatsOverview from './StatsOverview';
import ApplicationKanban from './ApplicationKanban';
import ApplicationList from './ApplicationList';
import ApplicationAnalytics from './ApplicationAnalytics';
import { JobApplication, Company } from '@/types';
import axios from 'axios';

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
            id={`job-tracker-tabpanel-${index}`}
            aria-labelledby={`job-tracker-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
        </div>
    );
}

export default function JobApplicationTracker() {
    const [tabValue, setTabValue] = useState(0);
    const [applications, setApplications] = useState<JobApplication[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [appsResponse, companiesResponse] = await Promise.all([
                axios.get('/job-applications'),
                axios.get('/companies')
            ]);
            setApplications(appsResponse.data.data || appsResponse.data);
            setCompanies(companiesResponse.data.data || companiesResponse.data);
        } catch (error) {
            console.error('Error fetching job tracker data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    const handleApplicationUpdate = (updatedApplication: JobApplication) => {
        setApplications(apps =>
            apps.map(app => app.id === updatedApplication.id ? updatedApplication : app)
        );
    };

    const handleApplicationDelete = (id: number) => {
        setApplications(apps => apps.filter(app => app.id !== id));
    };

    const handleApplicationCreate = (newApplication: JobApplication) => {
        setApplications(apps => [newApplication, ...apps]);
    };

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <StatsOverview applications={applications} loading={loading} />

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 4 }}>
                <Tabs value={tabValue} onChange={handleTabChange}>
                    <Tab label="Kanban Board" />
                    <Tab label="List View" />
                    <Tab label="Analytics" />
                </Tabs>
            </Box>

            <TabPanel value={tabValue} index={0}>
                <ApplicationKanban
                    applications={applications}
                    companies={companies}
                    onUpdate={handleApplicationUpdate}
                    onDelete={handleApplicationDelete}
                    onCreate={handleApplicationCreate}
                    onRefresh={fetchData}
                />
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
                <ApplicationList
                    applications={applications}
                    companies={companies}
                    onUpdate={handleApplicationUpdate}
                    onDelete={handleApplicationDelete}
                    onCreate={handleApplicationCreate}
                    onRefresh={fetchData}
                />
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
                <ApplicationAnalytics applications={applications} />
            </TabPanel>
        </Container>
    );
}
