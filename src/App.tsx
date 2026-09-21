import React, { useState, useEffect, useCallback } from 'react';
import { User, Task, ActiveNav, DailyReport } from './types';
import {
  getSessionUser,
  setSessionUser,
  getUserTasks,
  fetchTasksFromPostgres,
  addTaskForUser,
  updateTaskForUser,
  deleteTaskForUser,
  toggleTaskStatus,
  markTaskCompleted,
  markTaskNotCompleted,
  markTaskPending,
  fetchHierarchyMembers,
  createAdminBySuperAdmin,
  createUserByAdminOrSuper,
  reassignUserAdmin,
  toggleMemberStatus,
  delegateTaskToUser,
  submitDailyWorkReport,
  fetchDailyReports,
} from './services/storage';

import { SignUpPage } from './components/auth/SignUpPage';
import { SignInPage } from './components/auth/SignInPage';
import { Sidebar } from './components/layout/Sidebar';
import { MobileNav } from './components/layout/MobileNav';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { DashboardView } from './components/dashboard/DashboardView';
import { DailyTasksView } from './components/tasks/DailyTasksView';
import { HierarchyManagementView } from './components/hierarchy/HierarchyManagementView';
import { CalendarView } from './components/calendar/CalendarView';
import { DailyReportPage } from './components/reports/DailyReportPage';
import { ProfileView } from './components/profile/ProfileView';
import { DatabaseView } from './components/database/DatabaseView';
import { TaskModal } from './components/tasks/TaskModal';
import { SuperAdminAssignModal } from './components/tasks/SuperAdminAssignModal';
import { DelegateTaskModal } from './components/tasks/DelegateTaskModal';
import { CreateMemberModal } from './components/hierarchy/CreateMemberModal';
import { DailyReportModal } from './components/reports/DailyReportModal';
import { AdminConsolidatedReportModal } from './components/reports/AdminConsolidatedReportModal';
import { ReportDetailModal } from './components/reports/ReportDetailModal';
import { ConfirmDeleteModal } from './components/common/ConfirmDeleteModal';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authView, setAuthView] = useState<'signin' | 'signup'>('signin');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [activeNav, setActiveNav] = useState<ActiveNav>('dashboard');

  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [admins, setAdmins] = useState<User[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [superAdmin, setSuperAdmin] = useState<User | null>(null);
  const [dailyReports, setDailyReports] = useState<DailyReport[]>([]);

  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskModalDefaultDate, setTaskModalDefaultDate] = useState<string | undefined>(undefined);

  const [isSuperAdminAssignModalOpen, setIsSuperAdminAssignModalOpen] = useState(false);
  const [defaultSuperAdminAssigneeId, setDefaultSuperAdminAssigneeId] = useState<string | undefined>(undefined);

  const [isDelegateModalOpen, setIsDelegateModalOpen] = useState(false);
  const [delegatingTask, setDelegatingTask] = useState<Task | null>(null);

  const [isCreateMemberModalOpen, setIsCreateMemberModalOpen] = useState(false);
  const [createMemberTargetRole, setCreateMemberTargetRole] = useState<'admin' | 'user'>('admin');

  const [isDailyReportOpen, setIsDailyReportOpen] = useState(false);
  const [isAdminConsolidatedReportOpen, setIsAdminConsolidatedReportOpen] = useState(false);
  const [selectedReportForReview, setSelectedReportForReview] = useState<DailyReport | null>(null);

  const [taskPendingDelete, setTaskPendingDelete] = useState<Task | null>(null);

  // Initialize session on mount
  useEffect(() => {
    const session = getSessionUser();
    if (session) {
      setCurrentUser(session);
      setTasks(getUserTasks(session.id));
    }
  }, []);

  // Reload tasks & hierarchy when currentUser changes
  const reloadData = useCallback(async () => {
    if (!currentUser) {
      setTasks([]);
      setAdmins([]);
      setUsers([]);
      setSuperAdmin(null);
      setDailyReports([]);
      return;
    }

    // 1. Load tasks for current user and role
    const localTasks = getUserTasks(currentUser.id);
    setTasks(localTasks);
    fetchTasksFromPostgres(currentUser.id, currentUser.role).then((pgTasks) => {
      if (pgTasks && pgTasks.length > 0) {
        setTasks(pgTasks);
      }
    });

    // 2. Load hierarchy members
    try {
      const hierarchy = await fetchHierarchyMembers(currentUser);
      setAdmins(hierarchy.admins || []);
      setUsers(hierarchy.users || []);
      setSuperAdmin(hierarchy.superAdmin || null);
    } catch (err) {
      console.error('Failed to fetch hierarchy:', err);
    }

    // 3. Load daily reports
    try {
      const reports = await fetchDailyReports(currentUser);
      setDailyReports(reports || []);
    } catch (err) {
      console.error('Failed to fetch daily reports:', err);
    }
  }, [currentUser]);

  useEffect(() => {
    reloadData();
  }, [reloadData]);

  // Auth Handlers
  const handleSignInSuccess = (user: User) => {
    setCurrentUser(user);
    setActiveNav('dashboard');
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  const handleSignUpSuccess = (email: string) => {
    setSignUpEmail(email);
    setAuthView('signin');
  };

  const handleLogout = () => {
    setSessionUser(null);
    setCurrentUser(null);
    setTasks([]);
    setAdmins([]);
    setUsers([]);
    setDailyReports([]);
    setAuthView('signin');
  };

  // Task Operations
  const handleToggleTask = (taskId: string) => {
    if (!currentUser) return;
    toggleTaskStatus(currentUser.id, taskId, currentUser.role);
    reloadData();
  };

  const handleMarkCompleted = (taskId: string) => {
    if (!currentUser) return;
    markTaskCompleted(currentUser.id, taskId, currentUser.role);
    reloadData();
  };

  const handleMarkNotCompleted = (taskId: string, reason: string) => {
    if (!currentUser) return;
    markTaskNotCompleted(currentUser.id, taskId, reason, currentUser.role);
    reloadData();
  };

  const handleMarkPending = (taskId: string) => {
    if (!currentUser) return;
    markTaskPending(currentUser.id, taskId, currentUser.role);
    reloadData();
  };

  const handleNavigateToDailyTasks = (date: string) => {
    setSelectedDate(date);
    setActiveNav('daily_tasks');
  };

  const handleOpenAddTask = (targetDate?: string) => {
    if (currentUser?.role === 'super_admin') {
      setDefaultSuperAdminAssigneeId(admins[0]?.id || users[0]?.id || undefined);
      setIsSuperAdminAssignModalOpen(true);
      return;
    }
    setEditingTask(null);
    setTaskModalDefaultDate(targetDate || selectedDate || todayStr);
    setIsTaskModalOpen(true);
  };

  const handleOpenEditTask = (task: Task) => {
    setEditingTask(task);
    setTaskModalDefaultDate(task.dueDate);
    setIsTaskModalOpen(true);
  };

  const handleDeleteTask = (taskId: string) => {
    const foundTask = tasks.find((t) => t.id === taskId);
    if (foundTask) {
      setTaskPendingDelete(foundTask);
    }
  };

  const handleConfirmDeleteTask = () => {
    if (!currentUser || !taskPendingDelete) return;
    deleteTaskForUser(currentUser.id, taskPendingDelete.id, currentUser.role);
    setTaskPendingDelete(null);
    reloadData();
  };

  const handleSaveTask = (taskData: Omit<Task, 'id' | 'userId' | 'createdAt'>) => {
    if (!currentUser) return;
    if (editingTask) {
      updateTaskForUser(currentUser.id, {
        ...editingTask,
        ...taskData,
      }, currentUser.role);
    } else {
      addTaskForUser(currentUser.id, taskData, currentUser.role);
    }
    reloadData();
  };

  // Super Admin Executive Task Assignment
  const handleSuperAdminAssignTask = (taskInput: Omit<Task, 'id' | 'createdAt'>) => {
    if (!currentUser || currentUser.role !== 'super_admin') return;
    addTaskForUser(currentUser.id, {
      ...taskInput,
      createdById: currentUser.id,
      creatorName: currentUser.fullName,
      creatorRole: currentUser.role,
    }, currentUser.role);
    reloadData();
  };

  // Admin Delegate Task to User
  const handleDelegateTaskConfirm = async (
    parentTaskId: string,
    payload: { assignedToId: string; title: string; description?: string; dueDate: string; priority: string; remarks?: string }
  ) => {
    if (!currentUser) return;
    const res = await delegateTaskToUser(currentUser, parentTaskId, payload);
    if (res.success) {
      setIsDelegateModalOpen(false);
      setDelegatingTask(null);
      reloadData();
    }
  };

  // Hierarchy Management Actions
  const handleCreateAdmin = async (data: { fullName: string; email: string; mobile?: string; password: string; department?: string }) => {
    if (!currentUser) return { success: false, message: 'Not logged in' };
    const res = await createAdminBySuperAdmin(currentUser, data);
    if (res.success) {
      reloadData();
    }
    return res;
  };

  const handleCreateUser = async (data: { fullName: string; email: string; mobile?: string; password: string; adminId?: string | null; department?: string }) => {
    if (!currentUser) return { success: false, message: 'Not logged in' };
    const res = await createUserByAdminOrSuper(currentUser, data);
    if (res.success) {
      reloadData();
    }
    return res;
  };

  const handleReassignUserAdmin = async (userId: string, newAdminId: string | null) => {
    if (!currentUser) return false;
    const ok = await reassignUserAdmin(currentUser, userId, newAdminId);
    if (ok) {
      reloadData();
      return true;
    }
    return false;
  };

  const handleToggleMemberStatus = async (userId: string) => {
    if (!currentUser) return;
    await toggleMemberStatus(currentUser, userId);
    reloadData();
  };

  // Supervising Admin for current User
  const supervisingAdmin = currentUser?.adminId
    ? admins.find((a) => a.id === currentUser.adminId) || null
    : null;

  // Today's report submitted by current user (if any)
  const todayReport = dailyReports.find(
    (r) => r.senderId === currentUser?.id && r.date === selectedDate
  ) || null;

  // Pending count for today
  const todayTasks = tasks.filter((t) => t.dueDate === todayStr);
  const todayPendingCount = todayTasks.filter((t) => t.status !== 'completed').length;

  // Unauthenticated Flow
  if (!currentUser) {
    if (authView === 'signup') {
      return (
        <SignUpPage
          onNavigateToSignIn={() => setAuthView('signin')}
          onSignUpSuccess={handleSignUpSuccess}
        />
      );
    }
    return (
      <SignInPage
        onNavigateToSignUp={() => setAuthView('signup')}
        onSignInSuccess={handleSignInSuccess}
        initialEmail={signUpEmail}
      />
    );
  }

  // Authenticated Flow
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row font-sans text-slate-900 dark:text-slate-100 transition-colors">
      {/* Desktop Left Sidebar */}
      <Sidebar
        activeNav={activeNav}
        onSelectNav={setActiveNav}
        user={currentUser}
        onLogout={handleLogout}
        onQuickAddTask={() => handleOpenAddTask()}
        todayPendingCount={todayPendingCount}
      />

      {/* Main Content Area */}
      <div className="flex-1 md:pl-64 flex flex-col min-h-screen">
        {/* Mobile Navigation Header & Drawer */}
        <MobileNav
          activeNav={activeNav}
          onSelectNav={setActiveNav}
          user={currentUser}
          onLogout={handleLogout}
          onQuickAddTask={() => handleOpenAddTask()}
          todayPendingCount={todayPendingCount}
        />

        {/* View Router */}
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 pb-24 md:pb-10 max-w-7xl w-full mx-auto">
          {activeNav === 'dashboard' && (
            <DashboardView
              user={currentUser}
              tasks={tasks}
              admins={admins}
              users={users}
              superAdmin={superAdmin}
              supervisingAdmin={supervisingAdmin}
              dailyReports={dailyReports}
              todayReport={todayReport}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              onToggleTask={handleToggleTask}
              onMarkCompleted={handleMarkCompleted}
              onMarkInProgress={handleMarkPending}
              onMarkNotCompleted={(id) => handleMarkNotCompleted(id, 'Marked incomplete by user')}
              onOpenAssignTask={(preselectedAdminId) => {
                setDefaultSuperAdminAssigneeId(preselectedAdminId || admins[0]?.id || undefined);
                setIsSuperAdminAssignModalOpen(true);
              }}
              onOpenAssignTaskToUser={() => {
                setEditingTask(null);
                setTaskModalDefaultDate(selectedDate);
                setIsTaskModalOpen(true);
              }}
              onOpenDelegateTask={(task) => {
                setDelegatingTask(task);
                setIsDelegateModalOpen(true);
              }}
              onOpenCreateAdmin={() => {
                setCreateMemberTargetRole('admin');
                setIsCreateMemberModalOpen(true);
              }}
              onOpenCreateUser={() => {
                setCreateMemberTargetRole('user');
                setIsCreateMemberModalOpen(true);
              }}
              onOpenManageTeam={() => setActiveNav('hierarchy')}
              onOpenEditTask={handleOpenEditTask}
              onDeleteTask={handleDeleteTask}
              onOpenSubmitReportToSuperAdmin={() => setIsAdminConsolidatedReportOpen(true)}
              onOpenSubmitReportToAdmin={() => setIsDailyReportOpen(true)}
              onOpenReportView={(report) => setSelectedReportForReview(report)}
            />
          )}

          {activeNav === 'daily_tasks' && (
            <DailyTasksView
              tasks={tasks}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              onToggleTask={handleToggleTask}
              onMarkCompleted={handleMarkCompleted}
              onMarkNotCompleted={handleMarkNotCompleted}
              onMarkPending={handleMarkPending}
              onOpenAddTask={(date) => handleOpenAddTask(date)}
              onOpenEditTask={handleOpenEditTask}
              onDeleteTask={handleDeleteTask}
            />
          )}

          {activeNav === 'hierarchy' && (
            <HierarchyManagementView
              currentUser={currentUser}
              superAdmin={superAdmin}
              admins={admins}
              users={users}
              tasks={tasks}
              onOpenCreateAdmin={() => {
                setCreateMemberTargetRole('admin');
                setIsCreateMemberModalOpen(true);
              }}
              onOpenCreateUser={() => {
                setCreateMemberTargetRole('user');
                setIsCreateMemberModalOpen(true);
              }}
              onReassignUserAdmin={handleReassignUserAdmin}
              onToggleUserStatus={handleToggleMemberStatus}
              onRefresh={reloadData}
            />
          )}

          {activeNav === 'calendar' && (
            <CalendarView
              tasks={tasks}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              onToggleTask={handleToggleTask}
              onMarkCompleted={handleMarkCompleted}
              onMarkNotCompleted={handleMarkNotCompleted}
              onMarkPending={handleMarkPending}
              onOpenAddTaskForDate={(d) => handleOpenAddTask(d)}
              onNavigateToDailyTasks={handleNavigateToDailyTasks}
            />
          )}

          {activeNav === 'reports' && (
            <DailyReportPage
              user={currentUser}
              tasks={tasks}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              onMarkCompleted={handleMarkCompleted}
              onMarkNotCompleted={handleMarkNotCompleted}
              onMarkPending={handleMarkPending}
              onOpenAddTaskForDate={(d) => handleOpenAddTask(d)}
            />
          )}

          {activeNav === 'database' && (
            <DatabaseView currentUser={currentUser} />
          )}

          {activeNav === 'profile' && (
            <ProfileView
              user={currentUser}
              onUpdateUser={(updated) => setCurrentUser(updated)}
              onLogout={handleLogout}
              onTasksCleared={reloadData}
            />
          )}
        </main>

        {/* Mobile Sticky Bottom Navigation */}
        <MobileBottomNav
          activeNav={activeNav}
          onSelectNav={setActiveNav}
          onQuickAddTask={() => handleOpenAddTask()}
          todayPendingCount={todayPendingCount}
        />
      </div>

      {/* Standard Add / Edit Task Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleSaveTask}
        editingTask={editingTask}
        defaultDate={taskModalDefaultDate}
      />

      {/* Super Admin Executive Task Assignment Modal */}
      <SuperAdminAssignModal
        isOpen={isSuperAdminAssignModalOpen}
        onClose={() => setIsSuperAdminAssignModalOpen(false)}
        admins={admins}
        users={users}
        defaultAssigneeId={defaultSuperAdminAssigneeId}
        onAssignTask={handleSuperAdminAssignTask}
      />

      {/* Admin Task Delegation Modal */}
      {delegatingTask && (
        <DelegateTaskModal
          isOpen={isDelegateModalOpen}
          onClose={() => {
            setIsDelegateModalOpen(false);
            setDelegatingTask(null);
          }}
          task={delegatingTask}
          teamUsers={users.filter((u) => u.adminId === currentUser.id)}
          onDelegate={handleDelegateTaskConfirm}
        />
      )}

      {/* Create Admin / User Modal */}
      <CreateMemberModal
        isOpen={isCreateMemberModalOpen}
        onClose={() => setIsCreateMemberModalOpen(false)}
        targetRole={createMemberTargetRole}
        currentUser={currentUser}
        admins={admins}
        onCreateAdmin={handleCreateAdmin}
        onCreateUser={handleCreateUser}
      />

      {/* User Daily Report Submission Modal */}
      <DailyReportModal
        isOpen={isDailyReportOpen}
        onClose={() => {
          setIsDailyReportOpen(false);
          reloadData();
        }}
        dateStr={selectedDate}
        tasks={tasks}
        user={currentUser}
        supervisingAdmin={supervisingAdmin}
        onSubmitReport={async (reportData) => {
          await submitDailyWorkReport(currentUser, reportData);
          reloadData();
        }}
      />

      {/* Admin Consolidated Report Submission Modal */}
      <AdminConsolidatedReportModal
        isOpen={isAdminConsolidatedReportOpen}
        onClose={() => {
          setIsAdminConsolidatedReportOpen(false);
          reloadData();
        }}
        admin={currentUser}
        superAdmin={superAdmin}
        tasks={tasks}
        teamUsers={users.filter((u) => u.adminId === currentUser.id)}
        onSubmitReport={async (reportData) => {
          await submitDailyWorkReport(currentUser, reportData);
          reloadData();
        }}
      />

      {/* Detailed Report View Modal */}
      <ReportDetailModal
        report={selectedReportForReview}
        onClose={() => setSelectedReportForReview(null)}
      />

      {/* Task Deletion Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={!!taskPendingDelete}
        title="Delete Task"
        message="Are you sure you want to permanently delete this task? This action cannot be undone."
        itemTitle={taskPendingDelete?.title}
        onConfirm={handleConfirmDeleteTask}
        onClose={() => setTaskPendingDelete(null)}
      />
    </div>
  );
}
