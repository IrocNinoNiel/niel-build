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

export interface Company {
    id: number;
    name: string;
    website: string | null;
    logo_url: string | null;
    industry: string | null;
    location: string | null;
    company_size: 'startup' | 'small' | 'medium' | 'large' | 'enterprise' | null;
    notes: string | null;
    rating: number | null;
    job_applications?: JobApplication[];
    contacts?: Contact[];
    applications_count?: number;
    created_at: string;
    updated_at: string;
}

export interface JobApplication {
    id: number;
    company_id: number;
    job_title: string;
    job_url: string | null;
    description: string | null;
    salary_min: number | null;
    salary_max: number | null;
    location: string | null;
    job_type: 'remote' | 'hybrid' | 'onsite' | null;
    employment_type: 'full-time' | 'part-time' | 'contract' | 'freelance' | null;
    status: 'wishlist' | 'applied' | 'interviewing' | 'offered' | 'accepted' | 'rejected' | 'withdrawn';
    priority: 'low' | 'medium' | 'high';
    applied_at: string | null;
    deadline: string | null;
    source: string | null;
    notes: string | null;
    company?: Company;
    activities?: ApplicationActivity[];
    documents?: Document[];
    reminders?: ApplicationReminder[];
    created_at: string;
    updated_at: string;
}

export interface ApplicationActivity {
    id: number;
    job_application_id: number;
    activity_type: 'applied' | 'phone_screen' | 'interview' | 'technical_test' | 'offer' | 'rejection' | 'follow_up' | 'other';
    title: string;
    description: string | null;
    scheduled_at: string | null;
    completed_at: string | null;
    outcome: 'positive' | 'neutral' | 'negative' | 'pending';
    notes: string | null;
    created_at: string;
    updated_at: string;
}

export interface Contact {
    id: number;
    company_id: number;
    name: string;
    position: string | null;
    email: string | null;
    phone: string | null;
    linkedin_url: string | null;
    notes: string | null;
    company?: Company;
    created_at: string;
    updated_at: string;
}

export interface Document {
    id: number;
    job_application_id: number | null;
    document_type: 'resume' | 'cover_letter' | 'portfolio' | 'certificate' | 'other';
    file_name: string;
    file_path: string;
    file_size: number | null;
    uploaded_at: string;
    created_at: string;
    updated_at: string;
}

export interface ApplicationReminder {
    id: number;
    job_application_id: number;
    reminder_type: 'follow_up' | 'interview' | 'deadline' | 'other';
    reminder_date: string;
    message: string;
    is_completed: boolean;
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
