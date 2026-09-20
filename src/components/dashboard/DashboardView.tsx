import React from 'react';
import { User, Task, DailyReport } from '../../types';
import { SuperAdminDashboard } from './SuperAdminDashboard';
import { AdminDashboard } from './AdminDashboard';
import { UserDashboard } from './UserDashboard';

interface DashboardViewProps {
  user: User;
  tasks: Task[];
  admins: User[];
  users: User[];
  superAdmin: User | null;
  supervisingAdmin: User | null;
  dailyReports: DailyReport[];
  todayReport: DailyReport | null;
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onToggleTask: (taskId: string) => void;
  onMarkCompleted: (taskId: string) => void;
  onMarkInProgress: (taskId: string) => void;
  onMarkNotCompleted: (taskId: string) => void;
  onOpenAssignTask: (preselectedAdminId?: string) => void;
  onOpenAssignTaskToUser: () => void;
  onOpenDelegateTask: (task: Task) => void;
  onOpenCreateAdmin: () => void;
  onOpenCreateUser: () => void;
  onOpenManageTeam: () => void;
  onOpenEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onOpenSubmitReportToSuperAdmin: () => void;
  onOpenSubmitReportToAdmin: () => void;
  onOpenReportView: (report: DailyReport) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  tasks,
  admins,
  users,
  superAdmin,
  supervisingAdmin,
  dailyReports,
  todayReport,
  selectedDate,
  onSelectDate,
  onToggleTask,
  onMarkCompleted,
  onMarkInProgress,
  onMarkNotCompleted,
  onOpenAssignTask,
  onOpenAssignTaskToUser,
  onOpenDelegateTask,
  onOpenCreateAdmin,
  onOpenCreateUser,
  onOpenManageTeam,
  onOpenEditTask,
  onDeleteTask,
  onOpenSubmitReportToSuperAdmin,
  onOpenSubmitReportToAdmin,
  onOpenReportView,
}) => {
  if (user.role === 'super_admin') {
    return (
      <SuperAdminDashboard
        user={user}
        tasks={tasks}
        admins={admins}
        users={users}
        dailyReports={dailyReports}
        selectedDate={selectedDate}
        onSelectDate={onSelectDate}
        onOpenAssignTask={onOpenAssignTask}
        onOpenCreateAdmin={onOpenCreateAdmin}
        onOpenManageTeam={onOpenManageTeam}
        onOpenTaskDetails={onOpenEditTask}
        onDeleteTask={onDeleteTask}
        onOpenReportView={onOpenReportView}
      />
    );
  }

  if (user.role === 'admin') {
    // Filter users belonging to this admin
    const teamUsers = users.filter((u) => u.adminId === user.id);
    const reportsFromTeam = dailyReports.filter((r) => r.recipientId === user.id || teamUsers.some((tu) => tu.id === r.senderId));

    return (
      <AdminDashboard
        user={user}
        tasks={tasks}
        teamUsers={teamUsers}
        dailyReportsFromTeam={reportsFromTeam}
        selectedDate={selectedDate}
        onSelectDate={onSelectDate}
        onOpenAssignTaskToUser={onOpenAssignTaskToUser}
        onOpenDelegateTask={onOpenDelegateTask}
        onOpenSubmitReportToSuperAdmin={onOpenSubmitReportToSuperAdmin}
        onOpenAddUserToTeam={onOpenCreateUser}
        onToggleTask={onToggleTask}
        onOpenEditTask={onOpenEditTask}
        onDeleteTask={onDeleteTask}
        onOpenReportDetails={onOpenReportView}
      />
    );
  }

  // User Role (Level 3)
  return (
    <UserDashboard
      user={user}
      tasks={tasks}
      supervisingAdmin={supervisingAdmin}
      todayReport={todayReport}
      selectedDate={selectedDate}
      onSelectDate={onSelectDate}
      onMarkCompleted={onMarkCompleted}
      onMarkInProgress={onMarkInProgress}
      onMarkNotCompleted={onMarkNotCompleted}
      onOpenSubmitReportToAdmin={onOpenSubmitReportToAdmin}
    />
  );
};
