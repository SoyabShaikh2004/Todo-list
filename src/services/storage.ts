import { User, Task } from '../types';

const USERS_KEY = 'daily_todo_users_v1';
const SESSION_KEY = 'daily_todo_session_user_id';
const REMEMBER_EMAIL_KEY = 'daily_todo_remember_email';

// Helper to hash/encode passwords simply for client demo (safe storage representation)
export const hashPassword = (password: string): string => {
  return btoa(encodeURIComponent(password));
};

export const verifyPassword = (password: string, hash: string): boolean => {
  return hashPassword(password) === hash;
};

// Initial Seed User if no users exist
const initSeedUser = (): User => {
  const demoUser: User = {
    id: 'user_demo_01',
    fullName: 'Alex Morgan',
    email: 'demo@example.com',
    mobile: '+1 555 234 5678',
    passwordHash: hashPassword('Password123!'),
    createdAt: new Date().toISOString(),
  };

  const existingUsers = getUsers();
  if (existingUsers.length === 0) {
    saveUsers([demoUser]);
    saveUserTasks(demoUser.id, []);
  }
  return demoUser;
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

export const registerUser = (userData: Omit<User, 'id' | 'createdAt' | 'passwordHash'> & { password: string }): { success: boolean; message: string; user?: User } => {
  const users = getUsers();
  const emailTrimmed = userData.email.trim().toLowerCase();
  
  if (users.some((u) => u.email.toLowerCase() === emailTrimmed)) {
    return { success: false, message: 'An account with this email already exists.' };
  }

  const newUser: User = {
    id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    fullName: userData.fullName.trim(),
    email: emailTrimmed,
    mobile: userData.mobile.trim(),
    passwordHash: hashPassword(userData.password),
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  saveUsers(users);

  // Initialize clean empty task repository for user
  saveUserTasks(newUser.id, []);

  return { success: true, message: 'Account created successfully! You can now log in.', user: newUser };
};

export const getSessionUser = (): User | null => {
  // Ensure seed user exists if first visit
  initSeedUser();
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

export const saveUserTasks = (userId: string, tasks: Task[]): void => {
  if (!userId) return;
  try {
    localStorage.setItem(getTaskStorageKey(userId), JSON.stringify(tasks));
  } catch (err) {
    console.error('Failed to save tasks', err);
  }
};

export const addTaskForUser = (userId: string, taskInput: Omit<Task, 'id' | 'userId' | 'createdAt'>): Task => {
  const tasks = getUserTasks(userId);
  const newTask: Task = {
    ...taskInput,
    id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    userId,
    createdAt: new Date().toISOString(),
    completedAt: taskInput.status === 'completed' ? new Date().toISOString() : undefined,
  };

  tasks.unshift(newTask);
  saveUserTasks(userId, tasks);
  return newTask;
};

export const updateTaskForUser = (userId: string, updatedTask: Task): void => {
  const tasks = getUserTasks(userId);
  const index = tasks.findIndex((t) => t.id === updatedTask.id);
  if (index !== -1) {
    // If status changed to completed, set completedAt
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
};

export const deleteTaskForUser = (userId: string, taskId: string): void => {
  const tasks = getUserTasks(userId);
  const filtered = tasks.filter((t) => t.id !== taskId);
  saveUserTasks(userId, filtered);
};

export const markTaskCompleted = (userId: string, taskId: string): Task | null => {
  const tasks = getUserTasks(userId);
  const task = tasks.find((t) => t.id === taskId);
  if (!task) return null;

  task.status = 'completed';
  task.completedAt = new Date().toISOString();
  task.incompleteReason = undefined;

  saveUserTasks(userId, tasks);
  return task;
};

export const markTaskNotCompleted = (userId: string, taskId: string, reason: string): Task | null => {
  const tasks = getUserTasks(userId);
  const task = tasks.find((t) => t.id === taskId);
  if (!task) return null;

  task.status = 'not_completed';
  task.incompleteReason = reason.trim();
  task.completedAt = undefined;

  saveUserTasks(userId, tasks);
  return task;
};

export const markTaskPending = (userId: string, taskId: string): Task | null => {
  const tasks = getUserTasks(userId);
  const task = tasks.find((t) => t.id === taskId);
  if (!task) return null;

  task.status = 'pending';
  task.completedAt = undefined;
  task.incompleteReason = undefined;

  saveUserTasks(userId, tasks);
  return task;
};

export const toggleTaskStatus = (userId: string, taskId: string): Task | null => {
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
  return task;
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

  // If changing password, verify current password
  if (updates.newPassword) {
    if (updates.currentPassword && !verifyPassword(updates.currentPassword, users[index].passwordHash)) {
      return { success: false, message: 'Current password does not match our records.' };
    }
    users[index].passwordHash = hashPassword(updates.newPassword);
  }

  if (updates.fullName) users[index].fullName = updates.fullName.trim();
  if (updates.mobile) users[index].mobile = updates.mobile.trim();

  saveUsers(users);
  return { success: true, message: 'Profile and account settings saved successfully!', user: users[index] };
};

// Seed initial tasks for a user (no-op to ensure no dummy task data in final application)
export const seedUserTasks = (userId: string, userName?: string): void => {
  const existing = getUserTasks(userId);
  if (!existing || existing.length === 0) {
    saveUserTasks(userId, []);
  }
};
