import { useState, useEffect, useMemo } from 'react';
import {
    Box, Typography, Button, Card, CardContent, Grid, Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, FormControl, InputLabel, Select, MenuItem, List, ListItem, ListItemText, IconButton,
    Chip, LinearProgress
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import { SpendingCategory, SpendingTransaction } from '@/types';

export default function SpendingTracker() {
    const [transactions, setTransactions] = useState<SpendingTransaction[]>([]);
    const [categories, setCategories] = useState<SpendingCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<SpendingTransaction | null>(null);
    const [formData, setFormData] = useState({
        category_id: 0,
        type: 'expense' as 'income' | 'expense',
        amount: '',
        description: '',
        transaction_date: new Date().toISOString().split('T')[0],
    });

    useEffect(() => {
        fetchCategories();
        fetchTransactions();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await axios.get('/api/spending-categories');
            setCategories(Array.isArray(response.data) ? response.data : response.data.data || []);
        } catch (error) {
            console.error('Error fetching categories:', error);
            setCategories([]);
        }
    };

    const fetchTransactions = async () => {
        try {
            const response = await axios.get('/api/spending-transactions');
            setTransactions(Array.isArray(response.data) ? response.data : response.data.data || []);
        } catch (error) {
            console.error('Error fetching transactions:', error);
            setTransactions([]);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (transaction?: SpendingTransaction) => {
        if (transaction) {
            setEditingTransaction(transaction);
            setFormData({
                category_id: transaction.category_id,
                type: transaction.type,
                amount: transaction.amount.toString(),
                description: transaction.description || '',
                transaction_date: transaction.transaction_date,
            });
        } else {
            setEditingTransaction(null);
            setFormData({
                category_id: categories.find(c => c.type === 'expense')?.id || 0,
                type: 'expense',
                amount: '',
                description: '',
                transaction_date: new Date().toISOString().split('T')[0],
            });
        }
        setDialogOpen(true);
    };

    const handleSubmit = async () => {
        try {
            const data = {
                ...formData,
                amount: parseFloat(formData.amount),
            };

            if (editingTransaction) {
                await axios.put(`/api/spending-transactions/${editingTransaction.id}`, data);
            } else {
                await axios.post('/api/spending-transactions', data);
            }
            fetchTransactions();
            setDialogOpen(false);
        } catch (error) {
            console.error('Error saving transaction:', error);
            alert('Error saving transaction. Please check all fields.');
        }
    };

    const handleDelete = async (id: number) => {
        if (confirm('Are you sure you want to delete this transaction?')) {
            try {
                await axios.delete(`/api/spending-transactions/${id}`);
                fetchTransactions();
            } catch (error) {
                console.error('Error deleting transaction:', error);
            }
        }
    };

    const stats = useMemo(() => {
        const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        const balance = totalIncome - totalExpense;
        return { totalIncome, totalExpense, balance, netSavings: balance };
    }, [transactions]);

    const dailyData = useMemo(() => {
        const last30Days: { [key: string]: { income: number; expense: number } } = {};
        const today = new Date();

        for (let i = 29; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            last30Days[dateStr] = { income: 0, expense: 0 };
        }

        transactions.forEach(t => {
            if (last30Days[t.transaction_date]) {
                last30Days[t.transaction_date][t.type] += t.amount;
            }
        });

        return Object.entries(last30Days).map(([date, data]) => ({
            date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            income: data.income,
            expense: data.expense,
        }));
    }, [transactions]);

    const categoryData = useMemo(() => {
        const expensesByCategory: { [key: number]: number } = {};
        transactions.filter(t => t.type === 'expense').forEach(t => {
            expensesByCategory[t.category_id] = (expensesByCategory[t.category_id] || 0) + t.amount;
        });

        return Object.entries(expensesByCategory).map(([catId, amount]) => {
            const category = categories.find(c => c.id === parseInt(catId));
            return {
                name: category?.name || 'Unknown',
                amount: amount,
                color: category?.color || '#999999',
            };
        }).sort((a, b) => b.amount - a.amount);
    }, [transactions, categories]);

    const incomeExpenseCategories = categories.filter(c => c.type === 'income' || c.type === 'expense');
    const selectedCategory = categories.find(c => c.id === formData.category_id);

    if (loading) {
        return <Box sx={{ width: '100%' }}><LinearProgress /></Box>;
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" fontWeight="bold">Spending Tracker</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
                    Add Transaction
                </Button>
            </Box>

            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6} md={3}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom variant="body2">Balance</Typography>
                            <Typography variant="h4" color={stats.balance >= 0 ? 'success.main' : 'error.main'}>
                                ${stats.balance.toFixed(2)}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={6} md={3}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom variant="body2">Income</Typography>
                            <Typography variant="h4" color="success.main">${stats.totalIncome.toFixed(2)}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={6} md={3}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom variant="body2">Expenses</Typography>
                            <Typography variant="h4" color="error.main">${stats.totalExpense.toFixed(2)}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={6} md={3}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom variant="body2">Savings</Typography>
                            <Typography variant="h4">${stats.netSavings.toFixed(2)}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={12}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>Daily Spending Trend (Last 30 Days)</Typography>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={dailyData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="expense" stroke="#f44336" name="Expenses" />
                                    <Line type="monotone" dataKey="income" stroke="#4caf50" name="Income" />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>Expenses by Category</Typography>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={categoryData} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" />
                                    <YAxis dataKey="name" type="category" width={120} />
                                    <Tooltip />
                                    <Bar dataKey="amount" fill="#2196f3" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>Recent Transactions</Typography>
                            <List sx={{ maxHeight: 300, overflow: 'auto' }}>
                                {transactions.slice(0, 10).map((transaction) => (
                                    <ListItem
                                        key={transaction.id}
                                        secondaryAction={
                                            <Box>
                                                <IconButton size="small" onClick={() => handleOpenDialog(transaction)}>
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                                <IconButton size="small" color="error" onClick={() => handleDelete(transaction.id)}>
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Box>
                                        }
                                    >
                                        <ListItemText
                                            primary={
                                                <Box display="flex" alignItems="center" gap={1}>
                                                    <Typography variant="body1">
                                                        {transaction.category?.icon} {transaction.category?.name}
                                                    </Typography>
                                                    <Chip
                                                        label={transaction.type}
                                                        size="small"
                                                        color={transaction.type === 'income' ? 'success' : 'error'}
                                                    />
                                                </Box>
                                            }
                                            secondary={
                                                <Box>
                                                    <Typography variant="body2" color={transaction.type === 'income' ? 'success.main' : 'error.main'}>
                                                        {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                                                    </Typography>
                                                    <Typography variant="caption">
                                                        {new Date(transaction.transaction_date).toLocaleDateString()} {transaction.description && `• ${transaction.description}`}
                                                    </Typography>
                                                </Box>
                                            }
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{editingTransaction ? 'Edit Transaction' : 'Add Transaction'}</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        <FormControl fullWidth>
                            <InputLabel>Type</InputLabel>
                            <Select
                                value={formData.type}
                                label="Type"
                                onChange={(e) => {
                                    const newType = e.target.value as 'income' | 'expense';
                                    setFormData({
                                        ...formData,
                                        type: newType,
                                        category_id: categories.find(c => c.type === newType)?.id || 0
                                    });
                                }}
                            >
                                <MenuItem value="expense">Expense</MenuItem>
                                <MenuItem value="income">Income</MenuItem>
                            </Select>
                        </FormControl>

                        <FormControl fullWidth required>
                            <InputLabel>Category</InputLabel>
                            <Select
                                value={formData.category_id}
                                label="Category"
                                onChange={(e) => setFormData({ ...formData, category_id: e.target.value as number })}
                            >
                                {categories.filter(c => c.type === formData.type).map((category) => (
                                    <MenuItem key={category.id} value={category.id}>
                                        {category.icon} {category.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <TextField
                            label="Amount"
                            type="number"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            required
                            fullWidth
                            inputProps={{ min: 0.01, step: 0.01 }}
                        />

                        <TextField
                            label="Description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            multiline
                            rows={2}
                            fullWidth
                        />

                        <TextField
                            label="Date"
                            type="date"
                            value={formData.transaction_date}
                            onChange={(e) => setFormData({ ...formData, transaction_date: e.target.value })}
                            required
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained" disabled={!formData.amount || !formData.category_id}>
                        {editingTransaction ? 'Update' : 'Add'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
