import { db } from './index.ts';
import { tasks, users } from './schema.ts';
import { and, desc, eq, inArray, or } from 'drizzle-orm';

export interface TaskRecord {
  id: string;
  userId: string; // compatibility assignee
  createdById?: string | null;
  assignedToId?: string | null;
  adminId?: string | null;
  parentTaskId?: string | null;
  title: string;
  description?: string;
  dueDate: string;
  dueTime?: string | null;
  priority: string;
  status: string;
  category: string;
  completedAt?: string | null;
  incompleteReason?: string | null;
  remarks?: string | null;
}

export async function getTasksForUser(userId: string) {
  try {
    const result = await db
      .select({
        task: tasks,
        creator: {
          id: users.id,
          fullName: users.fullName,
          role: users.role,
        },
      })
      .from(tasks)
      .leftJoin(users, eq(tasks.createdById, users.id))
      .where(or(eq(tasks.userId, userId), eq(tasks.assignedToId, userId)))
      .orderBy(desc(tasks.createdAt));

    return result.map((r) => ({
      ...r.task,
      creatorName: r.creator?.fullName || 'Manager',
      creatorRole: r.creator?.role || 'admin',
    }));
  } catch (error) {
    console.error('Failed to get tasks for user:', error);
    throw new Error('Database query failed. Could not fetch tasks.', { cause: error });
  }
}

export async function getTasksForAdmin(adminId: string, userIdsUnderAdmin: string[] = []) {
  try {
    const condition = userIdsUnderAdmin.length > 0
      ? or(
          eq(tasks.userId, adminId),
          eq(tasks.assignedToId, adminId),
          eq(tasks.adminId, adminId),
          eq(tasks.createdById, adminId),
          inArray(tasks.userId, userIdsUnderAdmin),
          inArray(tasks.assignedToId, userIdsUnderAdmin)
        )
      : or(
          eq(tasks.userId, adminId),
          eq(tasks.assignedToId, adminId),
          eq(tasks.adminId, adminId),
          eq(tasks.createdById, adminId)
        );

    const result = await db
      .select({
        task: tasks,
        creator: {
          id: users.id,
          fullName: users.fullName,
          role: users.role,
        },
      })
      .from(tasks)
      .leftJoin(users, eq(tasks.createdById, users.id))
      .where(condition)
      .orderBy(desc(tasks.createdAt));

    return result.map((r) => ({
      ...r.task,
      creatorName: r.creator?.fullName || 'Super Admin',
      creatorRole: r.creator?.role || 'super_admin',
    }));
  } catch (error) {
    console.error('Failed to get tasks for admin:', error);
    throw new Error('Database query failed. Could not fetch admin tasks.', { cause: error });
  }
}

export async function createTask(taskData: TaskRecord) {
  try {
    const effectiveAssignee = taskData.assignedToId || taskData.userId;
    const inserted = await db
      .insert(tasks)
      .values({
        id: taskData.id,
        userId: effectiveAssignee,
        createdById: taskData.createdById || null,
        assignedToId: effectiveAssignee,
        adminId: taskData.adminId || null,
        parentTaskId: taskData.parentTaskId || null,
        title: taskData.title,
        description: taskData.description || '',
        dueDate: taskData.dueDate,
        dueTime: taskData.dueTime || null,
        priority: taskData.priority,
        status: taskData.status,
        category: taskData.category,
        completedAt: taskData.completedAt || null,
        incompleteReason: taskData.incompleteReason || null,
        remarks: taskData.remarks || null,
      })
      .onConflictDoUpdate({
        target: tasks.id,
        set: {
          title: taskData.title,
          description: taskData.description || '',
          dueDate: taskData.dueDate,
          dueTime: taskData.dueTime || null,
          priority: taskData.priority,
          status: taskData.status,
          category: taskData.category,
          completedAt: taskData.completedAt || null,
          incompleteReason: taskData.incompleteReason || null,
          remarks: taskData.remarks || null,
          assignedToId: effectiveAssignee,
          userId: effectiveAssignee,
          adminId: taskData.adminId || null,
        },
      })
      .returning();

    return inserted[0];
  } catch (error) {
    console.error('Failed to create task:', error);
    throw new Error('Database operation failed. Could not create task.', { cause: error });
  }
}

export async function updateTask(taskData: TaskRecord) {
  try {
    const effectiveAssignee = taskData.assignedToId || taskData.userId;
    const updated = await db
      .update(tasks)
      .set({
        title: taskData.title,
        description: taskData.description || '',
        dueDate: taskData.dueDate,
        dueTime: taskData.dueTime || null,
        priority: taskData.priority,
        status: taskData.status,
        category: taskData.category,
        completedAt: taskData.completedAt || null,
        incompleteReason: taskData.incompleteReason || null,
        remarks: taskData.remarks || null,
        assignedToId: effectiveAssignee,
        userId: effectiveAssignee,
        adminId: taskData.adminId !== undefined ? taskData.adminId : undefined,
      })
      .where(eq(tasks.id, taskData.id))
      .returning();

    return updated[0] || null;
  } catch (error) {
    console.error('Failed to update task:', error);
    throw new Error('Database operation failed. Could not update task.', { cause: error });
  }
}

export async function deleteTask(taskId: string, requestingUserId: string, requestingUserRole: string = 'user') {
  try {
    let whereClause;
    if (requestingUserRole === 'super_admin') {
      whereClause = eq(tasks.id, taskId);
    } else if (requestingUserRole === 'admin') {
      whereClause = and(
        eq(tasks.id, taskId),
        or(
          eq(tasks.userId, requestingUserId),
          eq(tasks.createdById, requestingUserId),
          eq(tasks.adminId, requestingUserId)
        )
      );
    } else {
      whereClause = and(eq(tasks.id, taskId), eq(tasks.userId, requestingUserId));
    }

    const deleted = await db.delete(tasks).where(whereClause).returning();
    return deleted.length > 0;
  } catch (error) {
    console.error('Failed to delete task:', error);
    throw new Error('Database operation failed. Could not delete task.', { cause: error });
  }
}

export async function getAllTasks() {
  try {
    const result = await db
      .select({
        task: tasks,
        assignee: {
          id: users.id,
          fullName: users.fullName,
          email: users.email,
          role: users.role,
        },
      })
      .from(tasks)
      .leftJoin(users, eq(tasks.userId, users.id))
      .orderBy(desc(tasks.createdAt));

    return result.map((r) => ({
      ...r.task,
      assigneeName: r.assignee?.fullName || 'Unassigned',
      assigneeEmail: r.assignee?.email || '',
      assigneeRole: r.assignee?.role || 'user',
    }));
  } catch (error) {
    console.error('Failed to get all tasks:', error);
    throw new Error('Database query failed. Could not list all tasks.', { cause: error });
  }
}
