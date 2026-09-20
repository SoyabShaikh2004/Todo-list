import { relations } from 'drizzle-orm';
import { integer, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  uid: text('uid').unique(),
  fullName: text('full_name').notNull().default(''),
  email: text('email').notNull(),
  mobile: text('mobile').default(''),
  passwordHash: text('password_hash').default(''),
  role: text('role').notNull().default('user'), // 'super_admin' | 'admin' | 'user'
  adminId: text('admin_id'), // For users: references the admin user id
  status: text('status').notNull().default('active'), // 'active' | 'inactive'
  department: text('department').default('General'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const tasks = pgTable('tasks', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  createdById: text('created_by_id'),
  assignedToId: text('assigned_to_id'),
  adminId: text('admin_id'),
  parentTaskId: text('parent_task_id'),
  title: text('title').notNull(),
  description: text('description').default(''),
  dueDate: varchar('due_date', { length: 20 }).notNull(),
  dueTime: varchar('due_time', { length: 20 }),
  priority: varchar('priority', { length: 20 }).notNull().default('medium'),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
  category: varchar('category', { length: 50 }).notNull().default('General'),
  completedAt: text('completed_at'),
  incompleteReason: text('incomplete_reason'),
  remarks: text('remarks'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const dailyReports = pgTable('daily_reports', {
  id: text('id').primaryKey(),
  senderId: text('sender_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  recipientId: text('recipient_id'),
  date: varchar('date', { length: 20 }).notNull(),
  role: varchar('role', { length: 20 }).notNull(), // 'user' | 'admin'
  completedCount: integer('completed_count').default(0),
  pendingCount: integer('pending_count').default(0),
  inProgressCount: integer('in_progress_count').default(0),
  tasksSummary: text('tasks_summary').default('[]'),
  remarks: text('remarks').default(''),
  status: varchar('status', { length: 20 }).default('submitted'), // 'submitted' | 'reviewed'
  createdAt: timestamp('created_at').defaultNow(),
});

export const usersRelations = relations(users, ({ many, one }) => ({
  tasks: many(tasks),
  sentReports: many(dailyReports, { relationName: 'sentReports' }),
  admin: one(users, {
    fields: [users.adminId],
    references: [users.id],
    relationName: 'adminUsers',
  }),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  user: one(users, {
    fields: [tasks.userId],
    references: [users.id],
  }),
}));

export const dailyReportsRelations = relations(dailyReports, ({ one }) => ({
  sender: one(users, {
    fields: [dailyReports.senderId],
    references: [users.id],
    relationName: 'sentReports',
  }),
}));
