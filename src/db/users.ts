import { db } from './index.ts';
import { users } from './schema.ts';
import { and, eq } from 'drizzle-orm';

export interface UserRecord {
  id: string;
  uid?: string | null;
  fullName: string;
  email: string;
  mobile?: string | null;
  passwordHash?: string | null;
  role: 'super_admin' | 'admin' | 'user';
  adminId?: string | null;
  status: 'active' | 'inactive';
  department?: string | null;
  createdAt?: Date | null;
}

export async function getSuperAdmin() {
  try {
    const result = await db.select().from(users).where(eq(users.role, 'super_admin'));
    return result[0] || null;
  } catch (error) {
    console.error('Failed to get super admin:', error);
    return null;
  }
}

export async function getOrCreateGoogleUser(uid: string, email: string, fullName: string = '') {
  try {
    const normalizedEmail = email.toLowerCase().trim();
    const existing = await db.select().from(users).where(eq(users.uid, uid));
    if (existing.length > 0) {
      if (fullName && !existing[0].fullName) {
        await db.update(users).set({ fullName }).where(eq(users.id, existing[0].id));
      }
      return existing[0];
    }

    // Check if user exists by email
    const byEmail = await db.select().from(users).where(eq(users.email, normalizedEmail));
    if (byEmail.length > 0) {
      const updated = await db
        .update(users)
        .set({ uid, fullName: fullName || byEmail[0].fullName })
        .where(eq(users.id, byEmail[0].id))
        .returning();
      return updated[0];
    }

    // Check if any super admin exists. If not, the first registered user can be claimed or default to user.
    const superAdmin = await getSuperAdmin();
    const role = !superAdmin ? 'super_admin' : 'user';

    const newUserId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const inserted = await db
      .insert(users)
      .values({
        id: newUserId,
        uid,
        email: normalizedEmail,
        fullName: fullName || normalizedEmail.split('@')[0],
        mobile: '',
        passwordHash: '',
        role: role as any,
        status: 'active',
        department: 'General',
      })
      .returning();

    return inserted[0];
  } catch (error) {
    console.error('Failed to get or create Google user:', error);
    throw new Error('Database operation failed for user synchronization.', { cause: error });
  }
}

export async function getUserById(id: string) {
  try {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0] || null;
  } catch (error) {
    console.error('Failed to get user by id:', error);
    throw new Error('Database query failed. Could not fetch user.', { cause: error });
  }
}

export async function getUserByUid(uid: string) {
  try {
    const result = await db.select().from(users).where(eq(users.uid, uid));
    return result[0] || null;
  } catch (error) {
    console.error('Failed to get user by uid:', error);
    throw new Error('Database query failed. Could not fetch user by uid.', { cause: error });
  }
}

export async function getUserByEmail(email: string) {
  try {
    const result = await db.select().from(users).where(eq(users.email, email.toLowerCase().trim()));
    return result[0] || null;
  } catch (error) {
    console.error('Failed to get user by email:', error);
    throw new Error('Database query failed. Could not fetch user by email.', { cause: error });
  }
}

export async function createLocalUser(userData: {
  fullName: string;
  email: string;
  mobile?: string;
  passwordHash: string;
  role?: 'super_admin' | 'admin' | 'user';
  adminId?: string | null;
  department?: string;
}) {
  try {
    const normalizedEmail = userData.email.toLowerCase().trim();
    const newUserId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    
    // Check super admin count
    if (userData.role === 'super_admin') {
      const existingSuper = await getSuperAdmin();
      if (existingSuper && existingSuper.email !== normalizedEmail) {
        throw new Error('There can only be one Super Admin in the system.');
      }
    }

    const roleToAssign = userData.role || 'user';

    const inserted = await db
      .insert(users)
      .values({
        id: newUserId,
        fullName: userData.fullName.trim(),
        email: normalizedEmail,
        mobile: userData.mobile?.trim() || '',
        passwordHash: userData.passwordHash,
        role: roleToAssign,
        adminId: userData.adminId || null,
        status: 'active',
        department: userData.department || 'General',
      })
      .returning();

    return inserted[0];
  } catch (error) {
    console.error('Failed to create local user:', error);
    throw error;
  }
}

export async function ensureUserExists(id: string, fullName?: string, email?: string) {
  try {
    const existing = await getUserById(id);
    if (existing) return existing;

    const inserted = await db
      .insert(users)
      .values({
        id,
        fullName: fullName || 'System Member',
        email: email || `${id}@example.com`,
        mobile: '',
        passwordHash: '',
        role: 'user',
        status: 'active',
      })
      .onConflictDoNothing()
      .returning();

    return inserted[0] || (await getUserById(id));
  } catch (error) {
    console.error('Failed to ensure user exists:', error);
    return null;
  }
}

export async function getAllUsers() {
  try {
    return await db.select().from(users);
  } catch (error) {
    console.error('Failed to fetch all users:', error);
    throw new Error('Database query failed. Could not list users.', { cause: error });
  }
}

export async function getAdmins() {
  try {
    return await db.select().from(users).where(eq(users.role, 'admin'));
  } catch (error) {
    console.error('Failed to fetch admins:', error);
    return [];
  }
}

export async function getUsersByAdmin(adminId: string) {
  try {
    return await db.select().from(users).where(eq(users.adminId, adminId));
  } catch (error) {
    console.error('Failed to fetch users by admin:', error);
    return [];
  }
}

export async function updateUserRoleAndHierarchy(
  userId: string,
  updates: {
    role?: 'super_admin' | 'admin' | 'user';
    adminId?: string | null;
    status?: 'active' | 'inactive';
    department?: string;
    fullName?: string;
  }
) {
  try {
    if (updates.role === 'super_admin') {
      const existingSuper = await getSuperAdmin();
      if (existingSuper && existingSuper.id !== userId) {
        throw new Error('System already has an active Super Admin. There can be only one Super Admin.');
      }
    }

    const updated = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, userId))
      .returning();

    return updated[0] || null;
  } catch (error) {
    console.error('Failed to update user role:', error);
    throw error;
  }
}

export async function toggleUserActiveStatus(userId: string) {
  try {
    const user = await getUserById(userId);
    if (!user) throw new Error('User not found');
    if (user.role === 'super_admin') {
      throw new Error('Super Admin cannot be deactivated.');
    }

    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    const updated = await db
      .update(users)
      .set({ status: newStatus })
      .where(eq(users.id, userId))
      .returning();

    return updated[0];
  } catch (error) {
    console.error('Failed to toggle user status:', error);
    throw error;
  }
}
