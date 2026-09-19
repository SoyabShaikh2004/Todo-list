import React, { useState, useEffect, useCallback } from 'react';
import { User, Task, ActiveNav } from './types';
import {
  getSessionUser,
  setSessionUser,
  getUserTasks,
  addTaskForUser,
  updateTaskForUser,
  deleteTaskForUser,
  toggleTaskStatus,
  markTaskCompleted,
  markTaskNotCompleted,
  markTaskPending,
} from './services/storage';

import { SignUpPage } from './components/auth/SignUpPage';
import { SignInPage } from './components/auth/SignInPage';
import { Sidebar } from './components/layout/Sidebar';
import { MobileNav } from './components/layout/MobileNav';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { DashboardView } from './components/dashboard/DashboardView';
import { DailyTasksView } from './components/tasks/DailyTasksView';
import { CalendarView } from './components/calendar/CalendarView';
import { DailyReportPage } from './components/reports/DailyReportPage';
import { ProfileView } from './components/profile/ProfileView';
import { TaskModal } from './components/tasks/TaskModal';
import { DailyReportModal } from './components/reports/DailyReportModal';
import { ConfirmDeleteModal } from './components/common/ConfirmDeleteModal';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authView, setAuthView] = useState<'signin' | 'signup'>('signin');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [activeNav, setActiveNav] = useState<ActiveNav>('dashboard');

  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskModalDefaultDate, setTaskModalDefaultDate] = useState<string | undefined>(undefined);
  const [isDailyReportOpen, setIsDailyReportOpen] = useState(false);
  const [taskPendingDelete, setTaskPendingDelete] = useState<Task | null>(null);

  // Initialize session on mount
  useEffect(() => {
    const session = getSessionUser();
    if (session) {
      setCurrentUser(session);
      setTasks(getUserTasks(session.id));
    }
  }, []);

  // Reload tasks when current user changes
  const reloadTasks = useCallback(() => {
    if (currentUser) {
      setTasks(getUserTasks(currentUser.id));
    } else {
      setTasks([]);
    }
  }, [currentUser]);

  useEffect(() => {
    reloadTasks();
  }, [reloadTasks]);

  // Auth Handlers
  const handleSignInSuccess = (user: User) => {
    setCurrentUser(user);
    setTasks(getUserTasks(user.id));
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
    setAuthView('signin');
  };

  // Task Operations
  const handleToggleTask = (taskId: string) => {
    if (!currentUser) return;
    toggleTaskStatus(currentUser.id, taskId);
    reloadTasks();
  };

  const handleMarkCompleted = (taskId: string) => {
    if (!currentUser) return;
    markTaskCompleted(currentUser.id, taskId);
    reloadTasks();
  };

  const handleMarkNotCompleted = (taskId: string, reason: string) => {
    if (!currentUser) return;
    markTaskNotCompleted(currentUser.id, taskId, reason);
    reloadTasks();
  };

  const handleMarkPending = (taskId: string) => {
    if (!currentUser) return;
    markTaskPending(currentUser.id, taskId);
    reloadTasks();
  };

  const handleNavigateToDailyTasks = (date: string) => {
    setSelectedDate(date);
    setActiveNav('daily_tasks');
  };

  const handleOpenAddTask = (targetDate?: string) => {
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
    deleteTaskForUser(currentUser.id, taskPendingDelete.id);
    setTaskPendingDelete(null);
    reloadTasks();
  };

  const handleSaveTask = (taskData: Omit<Task, 'id' | 'userId' | 'createdAt'>) => {
    if (!currentUser) return;
    if (editingTask) {
      updateTaskForUser(currentUser.id, {
        ...editingTask,
        ...taskData,
      });
    } else {
      addTaskForUser(currentUser.id, taskData);
    }
    reloadTasks();
  };

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

  // Authenticated Flow (Dashboard, Tasks, Calendar, Reports, Profile)
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
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              onToggleTask={handleToggleTask}
              onOpenAddTask={() => handleOpenAddTask()}
              onOpenEditTask={handleOpenEditTask}
              onDeleteTask={handleDeleteTask}
              onOpenDailyReport={() => setIsDailyReportOpen(true)}
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

          {activeNav === 'profile' && (
            <ProfileView
              user={currentUser}
              onUpdateUser={(updated) => setCurrentUser(updated)}
              onLogout={handleLogout}
              onTasksCleared={reloadTasks}
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

      {/* Add / Edit Task Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleSaveTask}
        editingTask={editingTask}
        defaultDate={taskModalDefaultDate}
      />

      {/* Daily Report Modal */}
      <DailyReportModal
        isOpen={isDailyReportOpen}
        onClose={() => setIsDailyReportOpen(false)}
        dateStr={selectedDate}
        tasks={tasks}
        user={currentUser}
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
