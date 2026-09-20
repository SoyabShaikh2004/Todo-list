import React, { useState } from 'react';
import { User, Task, DailyReport } from '../../types';
import {
  ShieldCheck,
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  FileText,
  PlusCircle,
  Send,
  UserPlus,
  Share2,
  Calendar,
  Briefcase,
  Layers,
  ChevronRight,
} from 'lucide-react';

interface AdminDashboardProps {
  user: User;
  tasks: Task[];
  teamUsers: User[];
  dailyReportsFromTeam: DailyReport[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onOpenAssignTaskToUser: () => void;
  onOpenDelegateTask: (task: Task) => void;
  onOpenSubmitReportToSuperAdmin: () => void;
  onOpenAddUserToTeam: () => void;
  onToggleTask: (taskId: string) => void;
  onOpenEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onOpenReportDetails: (report: DailyReport) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  user,
  tasks,
  teamUsers,
  dailyReportsFromTeam,
  selectedDate,
  onSelectDate,
  onOpenAssignTaskToUser,
  onOpenDelegateTask,
  onOpenSubmitReportToSuperAdmin,
  onOpenAddUserToTeam,
  onToggleTask,
  onOpenEditTask,
  onDeleteTask,
  onOpenReportDetails,
}) => {
  const [activeTab, setActiveTab] = useState<'directives' | 'team_tasks' | 'my_tasks' | 'team_reports'>('directives');

  // Categorize tasks:
  // 1. Directives received from Super Admin:
  //    Assigned directly to this Admin, or where createdById != user.id and assignedToId === user.id
  const directivesFromSuperAdmin = tasks.filter(
    (t) => (t.assignedToId === user.id || t.userId === user.id) && t.createdById !== user.id
  );

  // 2. Tasks assigned to Users under this Admin:
  const teamUserIds = teamUsers.map((u) => u.id);
  const tasksAssignedToUsers = tasks.filter(
    (t) => (t.assignedToId && teamUserIds.includes(t.assignedToId)) || (t.userId && teamUserIds.includes(t.userId))
  );

  // 3. My Tasks (tasks Admin handles directly):
  const myTasks = tasks.filter(
    (t) => (t.assignedToId === user.id || t.userId === user.id)
  );

  // KPI calculations
  const teamCompleted = tasksAssignedToUsers.filter((t) => t.status === 'completed').length;
  const teamInProgress = tasksAssignedToUsers.filter((t) => t.status === 'in_progress').length;
  const teamPending = tasksAssignedToUsers.filter((t) => t.status === 'pending' || t.status === 'not_completed').length;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner Header */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-900 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-700/50">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                Level 2 Hierarchy: Admin
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Reporting to Super Admin • {user.department || 'Operations'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Admin Task & Team Command
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Manage executive directives, delegate responsibilities to your {teamUsers.length} team members, and compile consolidated daily work reports.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              id="btn-admin-add-team"
              onClick={onOpenAddUserToTeam}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 transition"
            >
              <UserPlus className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Add Team Member
            </button>
            <button
              id="btn-admin-assign-task"
              onClick={onOpenAssignTaskToUser}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium bg-slate-800 dark:bg-slate-700 text-white hover:bg-slate-900 transition"
            >
              <PlusCircle className="w-4 h-4" />
              Assign Task to User
            </button>
            <button
              id="btn-admin-submit-report"
              onClick={onOpenSubmitReportToSuperAdmin}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition"
            >
              <Send className="w-4 h-4" />
              Submit Daily Report to Super Admin
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 overflow-x-auto">
          <button
            onClick={() => setActiveTab('directives')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
              activeTab === 'directives'
                ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Directives from Super Admin ({directivesFromSuperAdmin.length})
          </button>
          <button
            onClick={() => setActiveTab('team_tasks')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
              activeTab === 'team_tasks'
                ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Tasks Assigned to Team ({tasksAssignedToUsers.length})
          </button>
          <button
            onClick={() => setActiveTab('my_tasks')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
              activeTab === 'my_tasks'
                ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            My Own Tasks ({myTasks.length})
          </button>
          <button
            onClick={() => setActiveTab('team_reports')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
              activeTab === 'team_reports'
                ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Daily Reports from Users ({dailyReportsFromTeam.length})
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">From Super Admin</span>
            <ShieldCheck className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {directivesFromSuperAdmin.length}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Directives</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">Assigned to Users</span>
            <Users className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {tasksAssignedToUsers.length}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Across team</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">My Tasks</span>
            <Briefcase className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{myTasks.length}</div>
          <p className="text-[11px] text-slate-500 mt-1">Direct execution</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">Team Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{teamCompleted}</div>
          <p className="text-[11px] text-slate-500 mt-1">Completed by team</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">Team In-Progress</span>
            <TrendingUp className="w-4 h-4 text-sky-500" />
          </div>
          <div className="text-2xl font-bold text-sky-600 dark:text-sky-400">{teamInProgress}</div>
          <p className="text-[11px] text-slate-500 mt-1">Being worked on</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">Team Reports</span>
            <FileText className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
            {dailyReportsFromTeam.length}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Received today</p>
        </div>
      </div>

      {/* TAB 1: SUPER ADMIN DIRECTIVES */}
      {activeTab === 'directives' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-600" />
                Tasks Received Directly from Super Admin
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                You can either complete these tasks yourself, or delegate them to team members under your supervision.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {directivesFromSuperAdmin.length === 0 ? (
              <div className="py-10 text-center text-slate-400">
                No active directives from Super Admin at this time.
              </div>
            ) : (
              directivesFromSuperAdmin.map((task) => (
                <div
                  key={task.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col md:flex-row md:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                        {task.priority}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">Due: {task.dueDate}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          task.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                        }`}
                      >
                        {task.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">{task.title}</h3>
                    {task.description && (
                      <p className="text-sm text-slate-600 dark:text-slate-400">{task.description}</p>
                    )}
                    {task.remarks && (
                      <p className="text-xs text-amber-700 dark:text-amber-300 font-medium">
                        Super Admin Note: {task.remarks}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center">
                    <button
                      onClick={() => onToggleTask(task.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                        task.status === 'completed'
                          ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                          : 'bg-emerald-600 text-white hover:bg-emerald-700'
                      }`}
                    >
                      {task.status === 'completed' ? 'Mark Incomplete' : 'Complete Myself'}
                    </button>
                    <button
                      onClick={() => onOpenDelegateTask(task)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 flex items-center gap-1.5 transition"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      Delegate to User
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 2: TASKS ASSIGNED TO USERS */}
      {activeTab === 'team_tasks' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              Tasks Delegated to Your Team Members
            </h2>
            <button
              onClick={onOpenAssignTaskToUser}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 transition"
            >
              + Assign New Task
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Task</th>
                  <th className="py-3 px-4">Assigned Member</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Current Status</th>
                  <th className="py-3 px-4">Incomplete Reason</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {tasksAssignedToUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No tasks currently assigned to team members.
                    </td>
                  </tr>
                ) : (
                  tasksAssignedToUsers.map((t) => {
                    const assignedUser = teamUsers.find((u) => u.id === t.assignedToId || u.id === t.userId);
                    return (
                      <tr key={t.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                        <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white max-w-xs">
                          {t.title}
                          {t.description && (
                            <div className="text-xs text-slate-500 dark:text-slate-400 font-normal truncate">
                              {t.description}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
                          {t.assigneeName || assignedUser?.fullName || 'Team Member'}
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">{t.dueDate}</td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
                              t.priority === 'urgent'
                                ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                                : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                            }`}
                          >
                            {t.priority}
                          </span>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                              t.status === 'completed'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : t.status === 'in_progress'
                                ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            }`}
                          >
                            {t.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-xs text-red-600 dark:text-red-400">
                          {t.incompleteReason || '—'}
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => onOpenEditTask(t)}
                            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline mr-2"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => onDeleteTask(t.id)}
                            className="text-xs font-semibold text-red-600 hover:underline"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: MY OWN TASKS */}
      {activeTab === 'my_tasks' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-indigo-600" />
              Tasks Admin Is Handling Directly
            </h2>
          </div>

          <div className="space-y-2">
            {myTasks.length === 0 ? (
              <div className="py-8 text-center text-slate-400">You have no direct tasks assigned currently.</div>
            ) : (
              myTasks.map((t) => (
                <div
                  key={t.id}
                  className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={t.status === 'completed'}
                      onChange={() => onToggleTask(t.id)}
                      className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
                    />
                    <div>
                      <div
                        className={`text-sm font-semibold ${
                          t.status === 'completed'
                            ? 'line-through text-slate-400'
                            : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {t.title}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        Due: {t.dueDate} • {t.priority.toUpperCase()}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                      t.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                    }`}
                  >
                    {t.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 4: DAILY REPORTS FROM USERS */}
      {activeTab === 'team_reports' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              Daily Reports Submitted by Your Team Members
            </h2>
            <button
              onClick={onOpenSubmitReportToSuperAdmin}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition"
            >
              Compile Report to Super Admin →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {dailyReportsFromTeam.length === 0 ? (
              <div className="col-span-2 py-8 text-center text-slate-400">
                No daily reports submitted by your users today yet.
              </div>
            ) : (
              dailyReportsFromTeam.map((rep) => (
                <div
                  key={rep.id}
                  onClick={() => onOpenReportDetails(rep)}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 bg-slate-50/50 dark:bg-slate-800/30 cursor-pointer transition space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        {rep.senderName || 'Team User'}
                      </h4>
                      <p className="text-xs text-slate-500">Date: {rep.date}</p>
                    </div>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      {rep.status || 'Submitted'}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-emerald-600 font-semibold">✓ {rep.completedCount} Completed</span>
                    <span className="text-amber-600 font-semibold">⏱ {rep.pendingCount} Pending</span>
                    <span className="text-sky-600 font-semibold">⚡ {rep.inProgressCount} In Progress</span>
                  </div>

                  {rep.remarks && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 italic line-clamp-2">
                      "{rep.remarks}"
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
