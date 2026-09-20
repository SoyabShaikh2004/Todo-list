export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'not_completed';

export type TaskCategory = 'Work' | 'Personal' | 'Study' | 'Health' | 'Finance' | 'General' | 'Operations' | 'Urgent';

export type UserRole = 'super_admin' | 'admin' | 'user';

export type UserStatus = 'active' | 'inactive';

export interface User {
  id: string;
  fullName: string;
  email: string;
  mobile: string;
  passwordHash?: string;
  role: UserRole;
  adminId?: string | null;
  status: UserStatus;
  department?: string;
  createdAt?: string;
}

export interface Task {
  id: string;
  userId: string;
  createdById?: string | null;
  assignedToId?: string | null;
  adminId?: string | null;
  parentTaskId?: string | null;
  title: string;
  description?: string;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  priority: Priority;
  status: TaskStatus;
  category: TaskCategory;
  completedAt?: string;
  incompleteReason?: string;
  remarks?: string;
  createdAt: string;
  creatorName?: string;
  creatorRole?: string;
  assigneeName?: string;
  assigneeEmail?: string;
  assigneeRole?: string;
}

export interface DailyReport {
  id: string;
  senderId: string;
  recipientId?: string | null;
  date: string; // YYYY-MM-DD
  role: 'user' | 'admin';
  completedCount: number;
  pendingCount: number;
  inProgressCount: number;
  tasksSummary: string; // JSON string of task snapshots
  remarks?: string;
  status?: 'submitted' | 'reviewed';
  senderName?: string;
  senderEmail?: string;
  senderRole?: string;
  department?: string;
  createdAt?: string;
}

export type ActiveNav =
  | 'dashboard'
  | 'daily_tasks'
  | 'team'
  | 'hierarchy'
  | 'calendar'
  | 'reports'
  | 'database'
  | 'profile';

export type Theme = 'light' | 'dark';
