import { useState, useEffect } from 'react';
import {
    Box, Typography, Button, Card, CardContent, Grid, Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, FormControl, InputLabel, Select, MenuItem, Chip, IconButton, Alert, LinearProgress
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon, Category as CategoryIcon } from '@mui/icons-material';
import axios from 'axios';
import { SpendingCategory } from '@/types';

export default function CategoryManager() {
    const [categories, setCategories] = useState<SpendingCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<SpendingCategory | null>(null);
    const [error, setError] = useState<string>('');
    const [formData, setFormData] = useState({
        name: '',
        type: 'expense' as 'income' | 'expense',
        icon: '',
        color: '#1976d2',
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await axios.get('/api/spending-categories');
            setCategories(Array.isArray(response.data) ? response.data : response.data.data || []);
            setError('');
        } catch (error) {
            console.error('Error fetching categories:', error);
            setError('Failed to load categories');
            setCategories([]);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (category?: SpendingCategory) => {
        if (category) {
            setEditingCategory(category);
            setFormData({
                name: category.name,
                type: category.type,
                icon: category.icon || '',
                color: category.color || '#1976d2',
            });
        } else {
            setEditingCategory(null);
            setFormData({
                name: '',
                type: 'expense',
                icon: '',
                color: '#1976d2',
            });
        }
        setError('');
        setDialogOpen(true);
    };

    const handleSubmit = async () => {
        try {
            setError('');

            if (!formData.name.trim()) {
                setError('Category name is required');
                return;
            }

            const data = {
                name: formData.name.trim(),
                type: formData.type,
                icon: formData.icon || null,
                color: formData.color,
            };

            if (editingCategory) {
                await axios.put(`/api/spending-categories/${editingCategory.id}`, data);
            } else {
                await axios.post('/api/spending-categories', data);
            }

            fetchCategories();
            setDialogOpen(false);
        } catch (error: any) {
            console.error('Error saving category:', error);
            const errorMsg = error.response?.data?.message || 'Error saving category. Please check all fields.';
            setError(errorMsg);
        }
    };

    const handleDelete = async (category: SpendingCategory) => {
        if (confirm(`Are you sure you want to delete "${category.name}"? This will fail if the category has transactions.`)) {
            try {
                setError('');
                await axios.delete(`/api/spending-categories/${category.id}`);
                fetchCategories();
            } catch (error: any) {
                console.error('Error deleting category:', error);
                const errorMsg = error.response?.data?.message || 'Error deleting category';
                setError(errorMsg);
            }
        }
    };

    const incomeCategories = categories.filter(c => c.type === 'income');
    const expenseCategories = categories.filter(c => c.type === 'expense');

    if (loading) {
        return <Box sx={{ width: '100%' }}><LinearProgress /></Box>;
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" fontWeight="bold">Category Manager</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
                    Add Category
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                    {error}
                </Alert>
            )}

            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <CategoryIcon sx={{ mr: 1, color: 'success.main' }} />
                                <Typography variant="h6">Income Categories ({incomeCategories.length})</Typography>
                            </Box>
                            <Grid container spacing={1}>
                                {incomeCategories.map((category) => (
                                    <Grid item xs={12} sm={6} key={category.id}>
                                        <Card variant="outlined" sx={{ borderLeft: `4px solid ${category.color}` }}>
                                            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Typography variant="h6">{category.icon}</Typography>
                                                        <Typography variant="body1" fontWeight="medium">
                                                            {category.name}
                                                        </Typography>
                                                    </Box>
                                                    <Box>
                                                        <IconButton size="small" onClick={() => handleOpenDialog(category)}>
                                                            <EditIcon fontSize="small" />
                                                        </IconButton>
                                                        <IconButton size="small" color="error" onClick={() => handleDelete(category)}>
                                                            <DeleteIcon fontSize="small" />
                                                        </IconButton>
                                                    </Box>
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))}
                                {incomeCategories.length === 0 && (
                                    <Grid item xs={12}>
                                        <Typography variant="body2" color="textSecondary" sx={{ p: 2 }}>
                                            No income categories yet. Click "Add Category" to create one.
                                        </Typography>
                                    </Grid>
                                )}
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <CategoryIcon sx={{ mr: 1, color: 'error.main' }} />
                                <Typography variant="h6">Expense Categories ({expenseCategories.length})</Typography>
                            </Box>
                            <Grid container spacing={1}>
                                {expenseCategories.map((category) => (
                                    <Grid item xs={12} sm={6} key={category.id}>
                                        <Card variant="outlined" sx={{ borderLeft: `4px solid ${category.color}` }}>
                                            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Typography variant="h6">{category.icon}</Typography>
                                                        <Typography variant="body1" fontWeight="medium">
                                                            {category.name}
                                                        </Typography>
                                                    </Box>
                                                    <Box>
                                                        <IconButton size="small" onClick={() => handleOpenDialog(category)}>
                                                            <EditIcon fontSize="small" />
                                                        </IconButton>
                                                        <IconButton size="small" color="error" onClick={() => handleDelete(category)}>
                                                            <DeleteIcon fontSize="small" />
                                                        </IconButton>
                                                    </Box>
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))}
                                {expenseCategories.length === 0 && (
                                    <Grid item xs={12}>
                                        <Typography variant="body2" color="textSecondary" sx={{ p: 2 }}>
                                            No expense categories yet. Click "Add Category" to create one.
                                        </Typography>
                                    </Grid>
                                )}
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{editingCategory ? 'Edit Category' : 'Add Category'}</DialogTitle>
                <DialogContent>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        <FormControl fullWidth required>
                            <InputLabel>Type</InputLabel>
                            <Select
                                value={formData.type}
                                label="Type"
                                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'income' | 'expense' })}
                            >
                                <MenuItem value="expense">Expense</MenuItem>
                                <MenuItem value="income">Income</MenuItem>
                            </Select>
                        </FormControl>

                        <TextField
                            label="Category Name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            fullWidth
                            placeholder="e.g., Groceries, Salary, etc."
                        />

                        <TextField
                            label="Icon (Emoji)"
                            value={formData.icon}
                            onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                            fullWidth
                            placeholder="e.g., 🛒 🏠 💰"
                            inputProps={{ maxLength: 10 }}
                            helperText="Optional: Add an emoji to represent this category"
                        />

                        <Box>
                            <Typography variant="body2" color="textSecondary" gutterBottom>
                                Color
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                {['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'].map((color) => (
                                    <Box
                                        key={color}
                                        onClick={() => setFormData({ ...formData, color })}
                                        sx={{
                                            width: 36,
                                            height: 36,
                                            backgroundColor: color,
                                            borderRadius: 1,
                                            cursor: 'pointer',
                                            border: formData.color === color ? '3px solid #000' : '2px solid #ddd',
                                            '&:hover': { transform: 'scale(1.1)' },
                                            transition: 'all 0.2s',
                                        }}
                                    />
                                ))}
                            </Box>
                            <TextField
                                label="Custom Color (Hex)"
                                value={formData.color}
                                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                fullWidth
                                placeholder="#1976d2"
                                sx={{ mt: 1 }}
                                inputProps={{ maxLength: 7 }}
                                helperText="Format: #RRGGBB"
                            />
                        </Box>

                        <Box sx={{ p: 2, backgroundColor: 'grey.100', borderRadius: 1 }}>
                            <Typography variant="body2" color="textSecondary" gutterBottom>
                                Preview:
                            </Typography>
                            <Chip
                                icon={formData.icon ? <Typography>{formData.icon}</Typography> : undefined}
                                label={formData.name || 'Category Name'}
                                sx={{ backgroundColor: formData.color, color: '#fff', fontWeight: 'medium' }}
                            />
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained" disabled={!formData.name.trim()}>
                        {editingCategory ? 'Update' : 'Add'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
