import { db } from './index.ts';
import { dailyReports, users } from './schema.ts';
import { desc, eq, or } from 'drizzle-orm';

export interface DailyReportRecord {
  id: string;
  senderId: string;
  recipientId?: string | null;
  date: string;
  role: 'user' | 'admin';
  completedCount: number;
  pendingCount: number;
  inProgressCount: number;
  tasksSummary: string; // JSON string
  remarks?: string;
  status?: string;
}

export async function createDailyReport(reportData: DailyReportRecord) {
  try {
    const inserted = await db
      .insert(dailyReports)
      .values({
        id: reportData.id,
        senderId: reportData.senderId,
        recipientId: reportData.recipientId || null,
        date: reportData.date,
        role: reportData.role,
        completedCount: reportData.completedCount,
        pendingCount: reportData.pendingCount,
        inProgressCount: reportData.inProgressCount,
        tasksSummary: reportData.tasksSummary || '[]',
        remarks: reportData.remarks || '',
        status: reportData.status || 'submitted',
      })
      .returning();

    return inserted[0];
  } catch (error) {
    console.error('Failed to create daily report:', error);
    throw new Error('Database operation failed. Could not create daily report.', { cause: error });
  }
}

export async function getAllDailyReports() {
  try {
    const reports = await db
      .select({
        report: dailyReports,
        sender: {
          id: users.id,
          fullName: users.fullName,
          email: users.email,
          role: users.role,
          department: users.department,
        },
      })
      .from(dailyReports)
      .leftJoin(users, eq(dailyReports.senderId, users.id))
      .orderBy(desc(dailyReports.createdAt));

    return reports.map((r) => ({
      ...r.report,
      senderName: r.sender?.fullName || 'Unknown',
      senderEmail: r.sender?.email || '',
      senderRole: r.sender?.role || r.report.role,
      department: r.sender?.department || 'General',
    }));
  } catch (error) {
    console.error('Failed to get all daily reports:', error);
    throw new Error('Database query failed. Could not fetch daily reports.', { cause: error });
  }
}

export async function getReportsForAdmin(adminId: string) {
  try {
    // Admin receives reports where recipientId == adminId, OR reports they sent
    const reports = await db
      .select({
        report: dailyReports,
        sender: {
          id: users.id,
          fullName: users.fullName,
          email: users.email,
          role: users.role,
          department: users.department,
        },
      })
      .from(dailyReports)
      .leftJoin(users, eq(dailyReports.senderId, users.id))
      .where(or(eq(dailyReports.recipientId, adminId), eq(dailyReports.senderId, adminId)))
      .orderBy(desc(dailyReports.createdAt));

    return reports.map((r) => ({
      ...r.report,
      senderName: r.sender?.fullName || 'Unknown',
      senderEmail: r.sender?.email || '',
      senderRole: r.sender?.role || r.report.role,
      department: r.sender?.department || 'General',
    }));
  } catch (error) {
    console.error('Failed to get reports for admin:', error);
    throw new Error('Database query failed. Could not fetch admin daily reports.', { cause: error });
  }
}

export async function getReportsForUser(userId: string) {
  try {
    return await db
      .select()
      .from(dailyReports)
      .where(eq(dailyReports.senderId, userId))
      .orderBy(desc(dailyReports.createdAt));
  } catch (error) {
    console.error('Failed to get reports for user:', error);
    throw new Error('Database query failed. Could not fetch user reports.', { cause: error });
  }
}
