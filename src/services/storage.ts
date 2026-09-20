import { User, Task, DailyReport, UserRole } from '../types';

const USERS_KEY = 'daily_todo_users_v2';
const SESSION_KEY = 'daily_todo_session_user_id';
const REMEMBER_EMAIL_KEY = 'daily_todo_remember_email';

// Helper to hash passwords simply
export const hashPassword = (password: string): string => {
  return btoa(encodeURIComponent(password));
};

export const verifyPassword = (password: string, hash: string): boolean => {
  return hashPassword(password) === hash;
};

// Initial Seed Users for Local Storage if empty
const initSeedUsers = (): User[] => {
  const seedUsers: User[] = [
    {
      id: 'user_soyab_superadmin',
      fullName: 'Soyab Shaikh',
      email: 'soyxbshxikh@gmail.com',
      mobile: '+91 88300 00000',
      passwordHash: hashPassword('Soyab@8830'),
      role: 'super_admin',
      status: 'active',
      department: 'Executive Leadership',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'admin_marcus_01',
      fullName: 'Marcus Vance (Admin)',
      email: 'marcus.admin@company.com',
      mobile: '+1 555 101 2020',
      passwordHash: hashPassword('Password123!'),
      role: 'admin',
      status: 'active',
      department: 'Operations & Tech',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'admin_elena_02',
      fullName: 'Elena Rostova (Admin)',
      email: 'elena.admin@company.com',
      mobile: '+1 555 303 4040',
      passwordHash: hashPassword('Password123!'),
      role: 'admin',
      status: 'active',
      department: 'Design & Product',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'user_david_01',
      fullName: 'David Chen',
      email: 'david.user@company.com',
      mobile: '+1 555 505 6060',
      passwordHash: hashPassword('Password123!'),
      role: 'user',
      adminId: 'admin_marcus_01',
      status: 'active',
      department: 'Frontend Engineering',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'user_sarah_02',
      fullName: 'Sarah Connor',
      email: 'sarah.user@company.com',
      mobile: '+1 555 707 8080',
      passwordHash: hashPassword('Password123!'),
      role: 'user',
      adminId: 'admin_marcus_01',
      status: 'active',
      department: 'QA & Automation',
      createdAt: new Date().toISOString(),
    },
  ];

  const existing = getUsers();
  if (existing.length === 0) {
    saveUsers(seedUsers);
    return seedUsers;
  }
  return existing;
};

export const getUsers = (): User[] => {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

export const saveUsers = (users: User[]): void => {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch (err) {
    console.error('Failed to save users', err);
  }
};

export const findUserByEmail = (email: string): User | undefined => {
  const users = getUsers();
  return users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
};

export const checkSuperAdminStatus = async (): Promise<{ exists: boolean; superAdmin?: any }> => {
  try {
    const res = await fetch('/api/auth/super-admin-status');
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Fallback to local
  }
  const users = getUsers();
  const superAdmin = users.find((u) => u.role === 'super_admin');
  return { exists: !!superAdmin, superAdmin };
};

export const registerUser = async (
  userData: Omit<User, 'id' | 'createdAt' | 'passwordHash' | 'role' | 'status'> & {
    password: string;
    role?: UserRole;
    adminId?: string | null;
    department?: string;
  }
): Promise<{ success: boolean; message: string; user?: User }> => {
  const users = getUsers();
  const emailTrimmed = userData.email.trim().toLowerCase();

  if (users.some((u) => u.email.toLowerCase() === emailTrimmed)) {
    return { success: false, message: 'An account with this email already exists.' };
  }

  const pHash = hashPassword(userData.password);

  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: userData.fullName.trim(),
        email: emailTrimmed,
        mobile: userData.mobile?.trim() || '',
        passwordHash: pHash,
        role: userData.role || 'user',
        adminId: userData.adminId || null,
        department: userData.department || 'General',
      }),
    });
    const data = await res.json();
    if (data.success && data.user) {
      const dbUser: User = {
        id: data.user.id,
        fullName: data.user.fullName || userData.fullName.trim(),
        email: data.user.email,
        mobile: data.user.mobile || '',
        passwordHash: pHash,
        role: data.user.role || 'user',
        adminId: data.user.adminId || null,
        status: data.user.status || 'active',
        department: data.user.department || 'General',
        createdAt: data.user.createdAt || new Date().toISOString(),
      };
      users.push(dbUser);
      saveUsers(users);
      saveUserTasks(dbUser.id, []);
      return { success: true, message: 'Account created successfully!', user: dbUser };
    }
  } catch {
    // Fallback
  }

  const newUser: User = {
    id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    fullName: userData.fullName.trim(),
    email: emailTrimmed,
    mobile: userData.mobile?.trim() || '',
    passwordHash: pHash,
    role: userData.role || 'user',
    adminId: userData.adminId || null,
    status: 'active',
    department: userData.department || 'General',
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  saveUsers(users);
  saveUserTasks(newUser.id, []);

  return { success: true, message: 'Account created successfully!', user: newUser };
};

export const syncGoogleUser = async (uid: string, email: string, fullName?: string): Promise<User | null> => {
  try {
    const res = await fetch('/api/auth/sync-google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid, email, fullName }),
    });
    const data = await res.json();
    if (data.success && data.user) {
      const user: User = {
        id: data.user.id,
        fullName: data.user.fullName || fullName || email.split('@')[0],
        email: data.user.email,
        mobile: data.user.mobile || '',
        passwordHash: '',
        role: data.user.role || 'user',
        adminId: data.user.adminId || null,
        status: data.user.status || 'active',
        department: data.user.department || 'General',
        createdAt: data.user.createdAt || new Date().toISOString(),
      };
      const users = getUsers();
      const idx = users.findIndex((u) => u.id === user.id || u.email === user.email);
      if (idx !== -1) {
        users[idx] = user;
      } else {
        users.push(user);
      }
      saveUsers(users);
      setSessionUser(user.id);
      return user;
    }
  } catch (err) {
    console.error('Error syncing Google user with PostgreSQL:', err);
  }
  return null;
};

export const getSessionUser = (): User | null => {
  initSeedUsers();
  const sessionUserId = localStorage.getItem(SESSION_KEY);
  if (!sessionUserId) return null;

  const users = getUsers();
  return users.find((u) => u.id === sessionUserId) || null;
};

export const setSessionUser = (userId: string | null): void => {
  if (userId) {
    localStorage.setItem(SESSION_KEY, userId);
  } else {
    localStorage.removeItem(SESSION_KEY);
  }
};

export const getRememberedEmail = (): string => {
  return localStorage.getItem(REMEMBER_EMAIL_KEY) || '';
};

export const setRememberedEmail = (email: string, remember: boolean): void => {
  if (remember && email) {
    localStorage.setItem(REMEMBER_EMAIL_KEY, email.trim());
  } else {
    localStorage.removeItem(REMEMBER_EMAIL_KEY);
  }
};

// Hierarchy Members & RBAC helpers
export interface HierarchyMembers {
  superAdmin: User | null;
  admins: User[];
  users: User[];
  all: User[];
}

export const fetchHierarchyMembers = async (currentUser: User): Promise<HierarchyMembers> => {
  try {
    const res = await fetch('/api/hierarchy/members', {
      headers: {
        'x-user-id': currentUser.id,
        'x-user-role': currentUser.role,
      },
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.error('Failed to fetch hierarchy members:', err);
  }

  const all = getUsers();
  return {
    superAdmin: all.find((u) => u.role === 'super_admin') || null,
    admins: all.filter((u) => u.role === 'admin'),
    users: all.filter((u) => u.role === 'user'),
    all,
  };
};

export const createAdminBySuperAdmin = async (
  superAdmin: User,
  adminData: { fullName: string; email: string; mobile?: string; password: string; department?: string }
): Promise<{ success: boolean; message: string; admin?: User }> => {
  try {
    const pHash = hashPassword(adminData.password);
    const res = await fetch('/api/hierarchy/admins', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': superAdmin.id,
        'x-user-role': superAdmin.role,
      },
      body: JSON.stringify({
        fullName: adminData.fullName,
        email: adminData.email,
        mobile: adminData.mobile,
        passwordHash: pHash,
        department: adminData.department || 'Operations',
      }),
    });

    const data = await res.json();
    if (res.ok && data.admin) {
      const users = getUsers();
      users.push(data.admin);
      saveUsers(users);
      return { success: true, message: 'Admin account created successfully!', admin: data.admin };
    }
    return { success: false, message: data.error || 'Failed to create Admin' };
  } catch (err: any) {
    return { success: false, message: err.message || 'Network error' };
  }
};

export const createUserByAdminOrSuper = async (
  currentUser: User,
  userData: { fullName: string; email: string; mobile?: string; password: string; adminId?: string | null; department?: string }
): Promise<{ success: boolean; message: string; user?: User }> => {
  try {
    const pHash = hashPassword(userData.password);
    const res = await fetch('/api/hierarchy/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': currentUser.id,
        'x-user-role': currentUser.role,
      },
      body: JSON.stringify({
        fullName: userData.fullName,
        email: userData.email,
        mobile: userData.mobile,
        passwordHash: pHash,
        adminId: currentUser.role === 'admin' ? currentUser.id : userData.adminId || null,
        department: userData.department || 'General',
      }),
    });

    const data = await res.json();
    if (res.ok && data.user) {
      const users = getUsers();
      users.push(data.user);
      saveUsers(users);
      return { success: true, message: 'User account created successfully!', user: data.user };
    }
    return { success: false, message: data.error || 'Failed to create User' };
  } catch (err: any) {
    return { success: false, message: err.message || 'Network error' };
  }
};

export const reassignUserAdmin = async (
  superAdmin: User,
  userId: string,
  adminId: string | null
): Promise<boolean> => {
  try {
    const res = await fetch(`/api/hierarchy/users/${encodeURIComponent(userId)}/assign-admin`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': superAdmin.id,
        'x-user-role': superAdmin.role,
      },
      body: JSON.stringify({ adminId }),
    });
    return res.ok;
  } catch {
    return false;
  }
};

export const toggleMemberStatus = async (
  superAdmin: User,
  userId: string
): Promise<{ success: boolean; user?: User; error?: string }> => {
  try {
    const res = await fetch(`/api/hierarchy/users/${encodeURIComponent(userId)}/toggle-status`, {
      method: 'PUT',
      headers: {
        'x-user-id': superAdmin.id,
        'x-user-role': superAdmin.role,
      },
    });
    const data = await res.json();
    if (res.ok && data.user) {
      const users = getUsers();
      const idx = users.findIndex((u) => u.id === userId);
      if (idx !== -1) {
        users[idx].status = data.user.status;
        saveUsers(users);
      }
      return { success: true, user: data.user };
    }
    return { success: false, error: data.error || 'Failed to toggle status' };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
};

// Delegate Task from Admin to User
export const delegateTaskToUser = async (
  admin: User,
  parentTaskId: string,
  payload: { assignedToId: string; title: string; description?: string; dueDate: string; priority: string; remarks?: string }
): Promise<{ success: boolean; delegatedTask?: Task; message?: string }> => {
  try {
    const res = await fetch(`/api/tasks/${encodeURIComponent(parentTaskId)}/delegate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': admin.id,
        'x-user-role': admin.role,
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (res.ok && data.delegatedTask) {
      return { success: true, delegatedTask: data.delegatedTask };
    }
    return { success: false, message: data.error || 'Failed to delegate task' };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
};

// USER-SPECIFIC TASK MANAGEMENT
const getTaskStorageKey = (userId: string) => `daily_todo_tasks_${userId}`;

export const getUserTasks = (userId: string): Task[] => {
  if (!userId) return [];
  try {
    const raw = localStorage.getItem(getTaskStorageKey(userId));
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

export const fetchTasksFromPostgres = async (userId: string, role: string = 'user'): Promise<Task[]> => {
  if (!userId) return [];
  try {
    const res = await fetch(`/api/tasks?userId=${encodeURIComponent(userId)}`, {
      headers: {
        'x-user-id': userId,
        'x-user-role': role,
      },
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        const formattedTasks: Task[] = data.map((t: any) => ({
          id: t.id,
          userId: t.userId,
          createdById: t.createdById,
          assignedToId: t.assignedToId,
          adminId: t.adminId,
          parentTaskId: t.parentTaskId,
          title: t.title,
          description: t.description || undefined,
          dueDate: t.dueDate,
          dueTime: t.dueTime || undefined,
          priority: t.priority,
          status: t.status,
          category: t.category,
          completedAt: t.completedAt || undefined,
          incompleteReason: t.incompleteReason || undefined,
          remarks: t.remarks || undefined,
          creatorName: t.creatorName,
          creatorRole: t.creatorRole,
          assigneeName: t.assigneeName,
          assigneeEmail: t.assigneeEmail,
          assigneeRole: t.assigneeRole,
          createdAt: t.createdAt ? new Date(t.createdAt).toISOString() : new Date().toISOString(),
        }));
        saveUserTasks(userId, formattedTasks);
        return formattedTasks;
      }
    }
  } catch (err) {
    console.error('Failed to fetch tasks from PostgreSQL:', err);
  }
  return getUserTasks(userId);
};

export const saveUserTasks = (userId: string, tasks: Task[]): void => {
  if (!userId) return;
  try {
    localStorage.setItem(getTaskStorageKey(userId), JSON.stringify(tasks));
  } catch (err) {
    console.error('Failed to save tasks', err);
  }
};

export const addTaskForUser = (
  userId: string,
  taskInput: Omit<Task, 'id' | 'userId' | 'createdAt'>,
  userRole: string = 'user'
): Task => {
  const tasks = getUserTasks(userId);
  const newTask: Task = {
    ...taskInput,
    id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    userId: taskInput.assignedToId || userId,
    createdAt: new Date().toISOString(),
    completedAt: taskInput.status === 'completed' ? new Date().toISOString() : undefined,
  };

  tasks.unshift(newTask);
  saveUserTasks(userId, tasks);

  fetch('/api/tasks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': userId,
      'x-user-role': userRole,
    },
    body: JSON.stringify(newTask),
  }).catch((err) => console.error('Failed to save task to PostgreSQL:', err));

  return newTask;
};

export const updateTaskForUser = (userId: string, updatedTask: Task, userRole: string = 'user'): void => {
  const tasks = getUserTasks(userId);
  const index = tasks.findIndex((t) => t.id === updatedTask.id);
  if (index !== -1) {
    if (updatedTask.status === 'completed') {
      if (!updatedTask.completedAt) {
        updatedTask.completedAt = new Date().toISOString();
      }
      updatedTask.incompleteReason = undefined;
    } else if (updatedTask.status === 'not_completed') {
      updatedTask.completedAt = undefined;
    } else {
      updatedTask.completedAt = undefined;
      updatedTask.incompleteReason = undefined;
    }
    tasks[index] = updatedTask;
    saveUserTasks(userId, tasks);
  }

  fetch(`/api/tasks/${encodeURIComponent(updatedTask.id)}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': userId,
      'x-user-role': userRole,
    },
    body: JSON.stringify(updatedTask),
  }).catch((err) => console.error('Failed to update task in PostgreSQL:', err));
};

export const deleteTaskForUser = (userId: string, taskId: string, userRole: string = 'user'): void => {
  const tasks = getUserTasks(userId);
  const filtered = tasks.filter((t) => t.id !== taskId);
  saveUserTasks(userId, filtered);

  fetch(`/api/tasks/${encodeURIComponent(taskId)}`, {
    method: 'DELETE',
    headers: {
      'x-user-id': userId,
      'x-user-role': userRole,
    },
  }).catch((err) => console.error('Failed to delete task in PostgreSQL:', err));
};

export const markTaskCompleted = (userId: string, taskId: string, userRole: string = 'user'): Task | null => {
  const tasks = getUserTasks(userId);
  const task = tasks.find((t) => t.id === taskId);
  if (!task) return null;

  task.status = 'completed';
  task.completedAt = new Date().toISOString();
  task.incompleteReason = undefined;

  saveUserTasks(userId, tasks);

  fetch(`/api/tasks/${encodeURIComponent(taskId)}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': userId,
      'x-user-role': userRole,
    },
    body: JSON.stringify(task),
  }).catch(() => {});

  return task;
};

export const markTaskNotCompleted = (
  userId: string,
  taskId: string,
  reason: string,
  userRole: string = 'user'
): Task | null => {
  const tasks = getUserTasks(userId);
  const task = tasks.find((t) => t.id === taskId);
  if (!task) return null;

  task.status = 'not_completed';
  task.incompleteReason = reason.trim();
  task.completedAt = undefined;

  saveUserTasks(userId, tasks);

  fetch(`/api/tasks/${encodeURIComponent(taskId)}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': userId,
      'x-user-role': userRole,
    },
    body: JSON.stringify(task),
  }).catch(() => {});

  return task;
};

export const markTaskPending = (userId: string, taskId: string, userRole: string = 'user'): Task | null => {
  const tasks = getUserTasks(userId);
  const task = tasks.find((t) => t.id === taskId);
  if (!task) return null;

  task.status = 'pending';
  task.completedAt = undefined;
  task.incompleteReason = undefined;

  saveUserTasks(userId, tasks);

  fetch(`/api/tasks/${encodeURIComponent(taskId)}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': userId,
      'x-user-role': userRole,
    },
    body: JSON.stringify(task),
  }).catch(() => {});

  return task;
};

export const toggleTaskStatus = (userId: string, taskId: string, userRole: string = 'user'): Task | null => {
  const tasks = getUserTasks(userId);
  const task = tasks.find((t) => t.id === taskId);
  if (!task) return null;

  if (task.status === 'completed') {
    task.status = 'pending';
    task.completedAt = undefined;
    task.incompleteReason = undefined;
  } else {
    task.status = 'completed';
    task.completedAt = new Date().toISOString();
    task.incompleteReason = undefined;
  }

  saveUserTasks(userId, tasks);

  fetch(`/api/tasks/${encodeURIComponent(taskId)}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': userId,
      'x-user-role': userRole,
    },
    body: JSON.stringify(task),
  }).catch(() => {});

  return task;
};

// Daily Reports Storage & API
export const submitDailyWorkReport = async (
  currentUser: User,
  reportData: {
    date: string;
    completedCount: number;
    pendingCount: number;
    inProgressCount: number;
    tasksSummary: any[];
    remarks?: string;
    recipientId?: string | null;
  }
): Promise<{ success: boolean; message: string; report?: DailyReport }> => {
  try {
    const res = await fetch('/api/reports/daily', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': currentUser.id,
        'x-user-role': currentUser.role,
      },
      body: JSON.stringify(reportData),
    });

    const data = await res.json();
    if (res.ok && data.report) {
      return { success: true, message: 'Daily work report submitted successfully!', report: data.report };
    }
    return { success: false, message: data.error || 'Failed to submit report' };
  } catch (err: any) {
    return { success: false, message: err.message || 'Failed to submit report' };
  }
};

export const fetchDailyReports = async (currentUser: User): Promise<DailyReport[]> => {
  try {
    const res = await fetch('/api/reports/daily', {
      headers: {
        'x-user-id': currentUser.id,
        'x-user-role': currentUser.role,
      },
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.error('Failed to fetch daily reports:', err);
  }
  return [];
};

export const clearAllUserTasks = (userId: string): void => {
  if (!userId) return;
  saveUserTasks(userId, []);
};

export const updateUserProfile = (
  userId: string,
  updates: {
    fullName?: string;
    mobile?: string;
    currentPassword?: string;
    newPassword?: string;
  }
): { success: boolean; message: string; user?: User } => {
  const users = getUsers();
  const index = users.findIndex((u) => u.id === userId);
  if (index === -1) {
    return { success: false, message: 'User account not found.' };
  }

  if (updates.newPassword) {
    if (updates.currentPassword && !verifyPassword(updates.currentPassword, users[index].passwordHash || '')) {
      return { success: false, message: 'Current password does not match our records.' };
    }
    users[index].passwordHash = hashPassword(updates.newPassword);
  }

  if (updates.fullName) users[index].fullName = updates.fullName.trim();
  if (updates.mobile) users[index].mobile = updates.mobile.trim();

  saveUsers(users);
  return { success: true, message: 'Profile and account settings saved successfully!', user: users[index] };
};

export interface DatabaseInspectionData {
  engine: string;
  database: string;
  host: string;
  totalUsers: number;
  totalTasks: number;
  totalReports?: number;
  tables: {
    users: {
      name: string;
      count: number;
      rows: any[];
    };
    tasks: {
      name: string;
      count: number;
      rows: any[];
    };
    dailyReports?: {
      name: string;
      count: number;
      rows: any[];
    };
  };
  schemaColumns: Array<{
    table_name: string;
    column_name: string;
    data_type: string;
    is_nullable: string;
  }>;
}

export const fetchDatabaseInspection = async (
  adminEmail?: string,
  role?: string
): Promise<DatabaseInspectionData | null> => {
  try {
    const email = adminEmail || 'soyxbshxikh@gmail.com';
    const res = await fetch(`/api/database/inspect?adminEmail=${encodeURIComponent(email)}`, {
      headers: {
        'x-admin-email': email,
        'x-user-role': role || 'super_admin',
      },
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.error('Failed to fetch database inspection data:', err);
  }
  return null;
};

export const syncBatchTasksToPostgres = async (userId: string): Promise<boolean> => {
  try {
    const tasks = getUserTasks(userId);
    for (const t of tasks) {
      await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
        },
        body: JSON.stringify(t),
      }).catch(() => {});
    }
    return true;
  } catch (err) {
    console.error('Batch sync error:', err);
    return false;
  }
};
