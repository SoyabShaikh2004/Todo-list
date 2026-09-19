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
    // Seed initial tasks for this user
    seedUserTasks(demoUser.id);
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

  // Initialize initial starter tasks for the new user
  seedUserTasks(newUser.id, newUser.fullName);

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
    if (updatedTask.status === 'completed' && !updatedTask.completedAt) {
      updatedTask.completedAt = new Date().toISOString();
    } else if (updatedTask.status !== 'completed') {
      updatedTask.completedAt = undefined;
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

export const toggleTaskStatus = (userId: string, taskId: string): Task | null => {
  const tasks = getUserTasks(userId);
  const task = tasks.find((t) => t.id === taskId);
  if (!task) return null;

  if (task.status === 'completed') {
    task.status = 'pending';
    task.completedAt = undefined;
  } else {
    task.status = 'completed';
    task.completedAt = new Date().toISOString();
  }

  saveUserTasks(userId, tasks);
  return task;
};

export const updateUserProfile = (userId: string, updates: { fullName?: string; mobile?: string; newPassword?: string }): { success: boolean; message: string; user?: User } => {
  const users = getUsers();
  const index = users.findIndex((u) => u.id === userId);
  if (index === -1) {
    return { success: false, message: 'User not found.' };
  }

  if (updates.fullName) users[index].fullName = updates.fullName.trim();
  if (updates.mobile) users[index].mobile = updates.mobile.trim();
  if (updates.newPassword) users[index].passwordHash = hashPassword(updates.newPassword);

  saveUsers(users);
  return { success: true, message: 'Profile updated successfully!', user: users[index] };
};

// Seed initial tasks for a user
export const seedUserTasks = (userId: string, userName?: string): void => {
  const today = new Date().toISOString().split('T')[0];
  
  // Calculate yesterday and tomorrow dates
  const d = new Date();
  const yesterday = new Date(d.setDate(d.getDate() - 1)).toISOString().split('T')[0];
  const tomorrow = new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0];

  const starterTasks: Task[] = [
    {
      id: `task_init_1_${userId}`,
      userId,
      title: 'Review quarterly project deliverables',
      description: 'Check milestone alignment with product managers and confirm sprint backlog.',
      dueDate: today,
      dueTime: '09:30',
      priority: 'high',
      status: 'completed',
      category: 'Work',
      completedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    },
    {
      id: `task_init_2_${userId}`,
      userId,
      title: 'Prepare presentation for daily client sync',
      description: 'Gather metrics, status updates, and blocker documentation into slide deck.',
      dueDate: today,
      dueTime: '11:00',
      priority: 'urgent',
      status: 'in_progress',
      category: 'Work',
      createdAt: new Date().toISOString(),
    },
    {
      id: `task_init_3_${userId}`,
      userId,
      title: '30-minute cardio & stretching routine',
      description: 'Run 3km at the park or treadmill, followed by cool-down stretch.',
      dueDate: today,
      dueTime: '16:00',
      priority: 'medium',
      status: 'pending',
      category: 'Health',
      createdAt: new Date().toISOString(),
    },
    {
      id: `task_init_4_${userId}`,
      userId,
      title: 'Review monthly utility & subscription expenses',
      description: 'Check bank accounts, balance budget spreadsheet, and schedule invoice payments.',
      dueDate: today,
      dueTime: '18:30',
      priority: 'low',
      status: 'pending',
      category: 'Finance',
      createdAt: new Date().toISOString(),
    },
    {
      id: `task_init_5_${userId}`,
      userId,
      title: 'Finish reading Chapter 4 of System Design book',
      description: 'Take notes on distributed caching patterns and database replication.',
      dueDate: tomorrow,
      dueTime: '20:00',
      priority: 'medium',
      status: 'pending',
      category: 'Study',
      createdAt: new Date().toISOString(),
    },
    {
      id: `task_init_6_${userId}`,
      userId,
      title: 'Weekly team sprint retrospective',
      description: 'Discuss achievements, friction points, and process improvements.',
      dueDate: yesterday,
      dueTime: '15:00',
      priority: 'high',
      status: 'completed',
      category: 'Work',
      completedAt: new Date(Date.now() - 86400000).toISOString(),
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ];

  saveUserTasks(userId, starterTasks);
};
