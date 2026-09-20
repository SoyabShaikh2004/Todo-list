import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import {
  getOrCreateGoogleUser,
  getUserById,
  getUserByEmail,
  createLocalUser,
  ensureUserExists,
  getAllUsers,
  getSuperAdmin,
  getAdmins,
  getUsersByAdmin,
  updateUserRoleAndHierarchy,
  toggleUserActiveStatus,
} from './src/db/users.ts';
import {
  getTasksForUser,
  getTasksForAdmin,
  createTask,
  updateTask,
  deleteTask,
  getAllTasks,
} from './src/db/tasks.ts';
import {
  createDailyReport,
  getAllDailyReports,
  getReportsForAdmin,
  getReportsForUser,
} from './src/db/reports.ts';
import { db } from './src/db/index.ts';
import { sql } from 'drizzle-orm';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // 1. Health check
  app.get('/api/health', async (_req, res) => {
    try {
      await db.execute(sql`SELECT 1`);
      res.json({ status: 'ok', database: 'postgresql', connected: true });
    } catch (err: any) {
      res.json({ status: 'ok', database: 'postgresql', connected: false, error: err.message });
    }
  });

  // 2. Hierarchy & User Management APIs (RBAC)
  app.get('/api/auth/super-admin-status', async (_req, res) => {
    try {
      const superAdmin = await getSuperAdmin();
      res.json({
        exists: !!superAdmin,
        superAdmin: superAdmin
          ? {
              id: superAdmin.id,
              fullName: superAdmin.fullName,
              email: superAdmin.email,
              department: superAdmin.department,
            }
          : null,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/auth/setup-super-admin', async (req, res) => {
    try {
      const { email, fullName, passwordHash, mobile, department } = req.body;
      const existingSuper = await getSuperAdmin();
      if (existingSuper) {
        return res.status(400).json({
          error: 'Super Admin already exists. Only one Super Admin is allowed in the entire system.',
        });
      }

      const existingUser = await getUserByEmail(email);
      let superUser;
      if (existingUser) {
        superUser = await updateUserRoleAndHierarchy(existingUser.id, {
          role: 'super_admin',
          status: 'active',
          department: department || 'Executive Leadership',
        });
      } else {
        superUser = await createLocalUser({
          email,
          fullName: fullName || 'Super Administrator',
          mobile: mobile || '',
          passwordHash: passwordHash || '',
          role: 'super_admin',
          department: department || 'Executive Leadership',
        });
      }

      res.json({ success: true, superAdmin: superUser });
    } catch (error: any) {
      console.error('Setup super admin error:', error);
      res.status(500).json({ error: error.message || 'Failed to setup Super Admin' });
    }
  });

  app.get('/api/hierarchy/members', async (req, res) => {
    try {
      const requestingUserId = req.headers['x-user-id'] as string;
      const allUsers = await getAllUsers();
      const superAdmin = allUsers.find((u) => u.role === 'super_admin') || null;
      const admins = allUsers.filter((u) => u.role === 'admin');
      const users = allUsers.filter((u) => u.role === 'user');

      // Sanitize password hashes
      const sanitize = (u: any) => ({
        id: u.id,
        fullName: u.fullName,
        email: u.email,
        mobile: u.mobile,
        role: u.role,
        adminId: u.adminId,
        status: u.status,
        department: u.department,
        createdAt: u.createdAt,
      });

      res.json({
        superAdmin: superAdmin ? sanitize(superAdmin) : null,
        admins: admins.map(sanitize),
        users: users.map(sanitize),
        all: allUsers.map(sanitize),
      });
    } catch (error: any) {
      console.error('Failed to get hierarchy members:', error);
      res.status(500).json({ error: error.message || 'Failed to load organization members' });
    }
  });

  app.post('/api/hierarchy/admins', async (req, res) => {
    try {
      const requesterId = req.headers['x-user-id'] as string;
      const requesterRole = req.headers['x-user-role'] as string;

      if (requesterRole !== 'super_admin') {
        return res.status(403).json({ error: 'Only the Super Admin can create Admin accounts.' });
      }

      const { fullName, email, mobile, passwordHash, department } = req.body;
      if (!fullName || !email) {
        return res.status(400).json({ error: 'Full name and email are required' });
      }

      const existing = await getUserByEmail(email);
      if (existing) {
        return res.status(400).json({ error: 'An account with this email already exists.' });
      }

      const newAdmin = await createLocalUser({
        fullName,
        email,
        mobile: mobile || '',
        passwordHash: passwordHash || '',
        role: 'admin',
        department: department || 'Operations',
      });

      res.json({ success: true, admin: newAdmin });
    } catch (error: any) {
      console.error('Failed to create admin:', error);
      res.status(500).json({ error: error.message || 'Failed to create Admin' });
    }
  });

  app.post('/api/hierarchy/users', async (req, res) => {
    try {
      const requesterId = req.headers['x-user-id'] as string;
      const requesterRole = req.headers['x-user-role'] as string;

      if (requesterRole !== 'super_admin' && requesterRole !== 'admin') {
        return res.status(403).json({ error: 'Only Super Admin or Admin can create Users.' });
      }

      const { fullName, email, mobile, passwordHash, adminId, department } = req.body;
      if (!fullName || !email) {
        return res.status(400).json({ error: 'Full name and email are required' });
      }

      const assignedAdminId = requesterRole === 'admin' ? requesterId : adminId || null;

      const existing = await getUserByEmail(email);
      if (existing) {
        return res.status(400).json({ error: 'An account with this email already exists.' });
      }

      const newUser = await createLocalUser({
        fullName,
        email,
        mobile: mobile || '',
        passwordHash: passwordHash || '',
        role: 'user',
        adminId: assignedAdminId,
        department: department || 'Team Member',
      });

      res.json({ success: true, user: newUser });
    } catch (error: any) {
      console.error('Failed to create user:', error);
      res.status(500).json({ error: error.message || 'Failed to create User' });
    }
  });

  app.put('/api/hierarchy/users/:id/assign-admin', async (req, res) => {
    try {
      const requesterRole = req.headers['x-user-role'] as string;
      if (requesterRole !== 'super_admin') {
        return res.status(403).json({ error: 'Only Super Admin can reassign users to Admins.' });
      }

      const { adminId } = req.body;
      const targetUserId = req.params.id;

      const updated = await updateUserRoleAndHierarchy(targetUserId, { adminId });
      res.json({ success: true, user: updated });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put('/api/hierarchy/users/:id/toggle-status', async (req, res) => {
    try {
      const requesterRole = req.headers['x-user-role'] as string;
      if (requesterRole !== 'super_admin') {
        return res.status(403).json({ error: 'Only Super Admin can activate or deactivate accounts.' });
      }

      const targetUserId = req.params.id;
      const updated = await toggleUserActiveStatus(targetUserId);
      res.json({ success: true, user: updated });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // 3. User Authentication
  app.post('/api/auth/sync-google', async (req, res) => {
    try {
      const { uid, email, fullName } = req.body;
      if (!uid || !email) {
        return res.status(400).json({ error: 'Missing uid or email' });
      }
      const user = await getOrCreateGoogleUser(uid, email, fullName);
      res.json({ success: true, user });
    } catch (error: any) {
      console.error('Google sync error:', error);
      res.status(500).json({ error: error.message || 'Failed to sync Google user' });
    }
  });

  app.post('/api/auth/register', async (req, res) => {
    try {
      const { fullName, email, mobile, passwordHash, role, adminId, department } = req.body;
      if (!email || !fullName) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const existing = await getUserByEmail(email);
      if (existing) {
        return res.status(400).json({ error: 'An account with this email already exists.' });
      }

      // Check if super admin is being registered
      if (role === 'super_admin') {
        const currentSuper = await getSuperAdmin();
        if (currentSuper) {
          return res.status(400).json({ error: 'Only one Super Admin can exist in the system.' });
        }
      }

      const newUser = await createLocalUser({
        fullName,
        email,
        mobile,
        passwordHash: passwordHash || '',
        role: role || 'user',
        adminId: adminId || null,
        department: department || 'General',
      });

      res.json({ success: true, user: newUser });
    } catch (error: any) {
      console.error('Register error:', error);
      res.status(500).json({ error: error.message || 'Failed to register user' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, passwordHash } = req.body;
      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      const user = await getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      if (user.status === 'inactive') {
        return res.status(403).json({ error: 'This account is deactivated. Please contact your Super Admin.' });
      }

      if (user.passwordHash && user.passwordHash !== passwordHash) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      res.json({ success: true, user });
    } catch (error: any) {
      console.error('Login error:', error);
      res.status(500).json({ error: error.message || 'Login failed' });
    }
  });

  app.get('/api/auth/user/:id', async (req, res) => {
    try {
      const user = await getUserById(req.params.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // 4. Tasks API (Role-Based Access Control)
  app.get('/api/tasks', async (req, res) => {
    try {
      const userId = (req.headers['x-user-id'] as string) || (req.query.userId as string);
      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      const user = await getUserById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (user.role === 'super_admin') {
        // Super Admin gets all tasks across the organization
        const tasks = await getAllTasks();
        return res.json(tasks);
      }

      if (user.role === 'admin') {
        // Admin gets tasks assigned to them + tasks assigned to users working under them
        const usersUnderAdmin = await getUsersByAdmin(user.id);
        const userIds = usersUnderAdmin.map((u) => u.id);
        const tasks = await getTasksForAdmin(user.id, userIds);
        return res.json(tasks);
      }

      // Regular User: only tasks assigned to them
      const tasks = await getTasksForUser(user.id);
      res.json(tasks);
    } catch (error: any) {
      console.error('Failed to get tasks:', error);
      res.status(500).json({ error: error.message || 'Failed to get tasks' });
    }
  });

  app.post('/api/tasks', async (req, res) => {
    try {
      const requesterId = req.headers['x-user-id'] as string;
      const requester = requesterId ? await getUserById(requesterId) : null;
      const taskData = req.body;

      if (!taskData.id || !taskData.title) {
        return res.status(400).json({ error: 'Missing required task attributes' });
      }

      // Hierarchy authorization rules:
      // Super Admin can assign to any Admin or User
      // Admin can assign to self or users under them
      // Regular User can create personal tasks
      let effectiveAssignee = taskData.assignedToId || taskData.userId || requesterId;
      let effectiveAdminId = taskData.adminId;

      if (requester?.role === 'admin') {
        effectiveAdminId = requester.id;
        // Verify assignee is either admin self or a user working under this admin
        if (effectiveAssignee !== requester.id) {
          const assigneeUser = await getUserById(effectiveAssignee);
          if (assigneeUser && assigneeUser.adminId !== requester.id) {
            return res.status(403).json({ error: 'Admins can only assign tasks to users under their supervision.' });
          }
        }
      }

      await ensureUserExists(effectiveAssignee);

      const created = await createTask({
        ...taskData,
        userId: effectiveAssignee,
        assignedToId: effectiveAssignee,
        createdById: requesterId || taskData.createdById,
        adminId: effectiveAdminId,
      });

      res.json(created);
    } catch (error: any) {
      console.error('Failed to create task:', error);
      res.status(500).json({ error: error.message || 'Failed to create task' });
    }
  });

  app.post('/api/tasks/:id/delegate', async (req, res) => {
    try {
      const requesterId = req.headers['x-user-id'] as string;
      const requester = requesterId ? await getUserById(requesterId) : null;

      if (!requester || (requester.role !== 'admin' && requester.role !== 'super_admin')) {
        return res.status(403).json({ error: 'Only Admins or Super Admin can delegate tasks.' });
      }

      const parentTaskId = req.params.id;
      const { assignedToId, title, description, dueDate, priority, remarks } = req.body;

      if (!assignedToId) {
        return res.status(400).json({ error: 'Target assignee user is required' });
      }

      // Verify assignee is under this admin if requester is admin
      if (requester.role === 'admin') {
        const targetUser = await getUserById(assignedToId);
        if (targetUser && targetUser.adminId !== requester.id) {
          return res.status(403).json({ error: 'Can only delegate tasks to users in your team.' });
        }
      }

      const subTaskId = `task_del_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const subTask = await createTask({
        id: subTaskId,
        userId: assignedToId,
        assignedToId,
        createdById: requester.id,
        adminId: requester.id,
        parentTaskId,
        title: title || 'Delegated Task',
        description: description || '',
        dueDate: dueDate || new Date().toISOString().split('T')[0],
        priority: priority || 'medium',
        status: 'pending',
        category: 'Work',
        remarks: remarks || `Delegated by ${requester.fullName}`,
      });

      res.json({ success: true, delegatedTask: subTask });
    } catch (error: any) {
      console.error('Failed to delegate task:', error);
      res.status(500).json({ error: error.message || 'Failed to delegate task' });
    }
  });

  app.put('/api/tasks/:id', async (req, res) => {
    try {
      const requesterId = req.headers['x-user-id'] as string;
      const requester = requesterId ? await getUserById(requesterId) : null;
      const taskData = { ...req.body, id: req.params.id };

      const updated = await updateTask(taskData);
      if (!updated) {
        return res.status(404).json({ error: 'Task not found or unauthorized' });
      }
      res.json(updated);
    } catch (error: any) {
      console.error('Failed to update task:', error);
      res.status(500).json({ error: error.message || 'Failed to update task' });
    }
  });

  app.delete('/api/tasks/:id', async (req, res) => {
    try {
      const userId = (req.headers['x-user-id'] as string) || (req.query.userId as string);
      const userRole = (req.headers['x-user-role'] as string) || 'user';
      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      const success = await deleteTask(req.params.id, userId, userRole);
      res.json({ success });
    } catch (error: any) {
      console.error('Failed to delete task:', error);
      res.status(500).json({ error: error.message || 'Failed to delete task' });
    }
  });

  // 5. Daily Work Reports API
  app.get('/api/reports/daily', async (req, res) => {
    try {
      const userId = req.headers['x-user-id'] as string;
      const userRole = req.headers['x-user-role'] as string;

      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      if (userRole === 'super_admin') {
        const reports = await getAllDailyReports();
        return res.json(reports);
      }

      if (userRole === 'admin') {
        const reports = await getReportsForAdmin(userId);
        return res.json(reports);
      }

      const reports = await getReportsForUser(userId);
      res.json(reports);
    } catch (error: any) {
      console.error('Failed to get daily reports:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch daily reports' });
    }
  });

  app.post('/api/reports/daily', async (req, res) => {
    try {
      const senderId = req.headers['x-user-id'] as string;
      const userRole = (req.headers['x-user-role'] as string) || 'user';

      if (!senderId) {
        return res.status(400).json({ error: 'Sender ID is required' });
      }

      const sender = await getUserById(senderId);
      if (!sender) {
        return res.status(404).json({ error: 'Sender user not found' });
      }

      const { date, completedCount, pendingCount, inProgressCount, tasksSummary, remarks, recipientId } = req.body;

      // Determine recipient based on hierarchy:
      // User -> reports to their assigned Admin
      // Admin -> reports to Super Admin
      let targetRecipientId = recipientId;
      if (!targetRecipientId) {
        if (sender.role === 'user' && sender.adminId) {
          targetRecipientId = sender.adminId;
        } else if (sender.role === 'admin') {
          const superAdmin = await getSuperAdmin();
          targetRecipientId = superAdmin?.id || null;
        }
      }

      const reportId = `rep_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const newReport = await createDailyReport({
        id: reportId,
        senderId,
        recipientId: targetRecipientId,
        date: date || new Date().toISOString().split('T')[0],
        role: sender.role as any,
        completedCount: Number(completedCount) || 0,
        pendingCount: Number(pendingCount) || 0,
        inProgressCount: Number(inProgressCount) || 0,
        tasksSummary: typeof tasksSummary === 'string' ? tasksSummary : JSON.stringify(tasksSummary || []),
        remarks: remarks || '',
        status: 'submitted',
      });

      res.json({ success: true, report: newReport });
    } catch (error: any) {
      console.error('Failed to submit daily report:', error);
      res.status(500).json({ error: error.message || 'Failed to submit daily report' });
    }
  });

  // 6. Database Inspector (Super Admin / Admin protected)
  app.get('/api/database/inspect', async (req, res) => {
    try {
      const userRole = (req.headers['x-user-role'] as string || '').toLowerCase();
      const userEmail = (req.headers['x-admin-email'] as string || '').toLowerCase();

      if (userRole !== 'super_admin' && userEmail !== 'soyxbshxikh@gmail.com' && userEmail !== 'soyabdzyrisinfotech@gmail.com') {
        return res.status(403).json({ error: 'Access denied: Super Admin credentials required.' });
      }

      const [usersList, tasksList, reportsList, columnsInfo] = await Promise.all([
        getAllUsers(),
        getAllTasks(),
        getAllDailyReports(),
        db.execute(
          sql`SELECT table_name, column_name, data_type, is_nullable 
              FROM information_schema.columns 
              WHERE table_schema = 'public' 
              ORDER BY table_name, ordinal_position;`
        ),
      ]);

      const safeUsers = usersList.map((u) => ({
        ...u,
        passwordHash: u.passwordHash ? '•••••••• (hashed)' : '(Google Auth)',
      }));

      res.json({
        engine: 'PostgreSQL (Cloud SQL)',
        database: process.env.SQL_DB_NAME || 'postgres',
        host: process.env.SQL_HOST || 'localhost',
        totalUsers: usersList.length,
        totalTasks: tasksList.length,
        totalReports: reportsList.length,
        tables: {
          users: {
            name: 'users',
            count: usersList.length,
            rows: safeUsers,
          },
          tasks: {
            name: 'tasks',
            count: tasksList.length,
            rows: tasksList,
          },
          dailyReports: {
            name: 'daily_reports',
            count: reportsList.length,
            rows: reportsList,
          },
        },
        schemaColumns: (columnsInfo as any).rows || [],
      });
    } catch (error: any) {
      console.error('Failed to inspect database:', error);
      res.status(500).json({ error: error.message || 'Failed to inspect database' });
    }
  });

  // Database download
  app.get('/api/database/download', async (req, res) => {
    try {
      const userRole = (req.headers['x-user-role'] as string || '').toLowerCase();
      const userEmail = (req.headers['x-admin-email'] as string || '').toLowerCase();

      if (userRole !== 'super_admin' && userEmail !== 'soyxbshxikh@gmail.com' && userEmail !== 'soyabdzyrisinfotech@gmail.com') {
        return res.status(403).json({ error: 'Access denied: Super Admin credentials required to download database.' });
      }

      const [usersList, tasksList, reportsList] = await Promise.all([
        getAllUsers(),
        getAllTasks(),
        getAllDailyReports(),
      ]);

      const backup = {
        exportedAt: new Date().toISOString(),
        engine: 'PostgreSQL 16 (Google Cloud SQL)',
        database: process.env.SQL_DB_NAME || 'cloud_sql_development_database',
        counts: {
          users: usersList.length,
          tasks: tasksList.length,
          reports: reportsList.length,
        },
        users: usersList.map((u) => ({
          ...u,
          passwordHash: u.passwordHash ? '••••••' : null,
        })),
        tasks: tasksList,
        dailyReports: reportsList,
      };

      res.setHeader('Content-Type', 'application/json');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="database_backup_${new Date().toISOString().slice(0, 10)}.json"`
      );
      res.send(JSON.stringify(backup, null, 2));
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Export failed' });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
