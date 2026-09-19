export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'not_completed';

export type TaskCategory = 'Work' | 'Personal' | 'Study' | 'Health' | 'Finance' | 'General';

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  priority: Priority;
  status: TaskStatus;
  category: TaskCategory;
  completedAt?: string;
  incompleteReason?: string;
  createdAt: string;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  mobile: string;
  passwordHash: string;
  createdAt: string;
}

export type ActiveNav = 'dashboard' | 'daily_tasks' | 'calendar' | 'reports' | 'profile';

export type Theme = 'light' | 'dark';
