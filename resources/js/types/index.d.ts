export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
}

export interface Project {
    id: number;
    name: string;
    description: string | null;
    color: string; // Hex color code
    status: 'active' | 'archived' | 'on_hold';
    due_date: string | null;
    tasks_count?: number;
    completed_tasks_count?: number;
    created_at: string;
    updated_at: string;
}

export interface Task {
    id: number;
    title: string;
    description: string | null;
    status: 'pending' | 'in_progress' | 'completed';
    priority: 'low' | 'medium' | 'high';
    due_date: string | null;
    project_id: number;
    project?: Project;
    created_at: string;
    updated_at: string;
}

export interface SpendingCategory {
    id: number;
    name: string;
    type: 'income' | 'expense';
    icon: string | null;
    color: string;
    created_at: string;
    updated_at: string;
}

export interface SpendingTransaction {
    id: number;
    category_id: number;
    category?: SpendingCategory;
    type: 'income' | 'expense';
    amount: number;
    description: string | null;
    transaction_date: string;
    created_at: string;
    updated_at: string;
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
    };
};
