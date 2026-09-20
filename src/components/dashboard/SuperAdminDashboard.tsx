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
  UserPlus,
  PlusCircle,
  Briefcase,
  ChevronRight,
  Filter,
  Eye,
  Calendar,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface SuperAdminDashboardProps {
  user: User;
  tasks: Task[];
  admins: User[];
  users: User[];
  dailyReports: DailyReport[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onOpenAssignTask: (preselectedAdminId?: string) => void;
  onOpenCreateAdmin: () => void;
  onOpenManageTeam: () => void;
  onOpenTaskDetails: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onOpenReportView: (report: DailyReport) => void;
}

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({
  user,
  tasks,
  admins,
  users,
  dailyReports,
  selectedDate,
  onSelectDate,
  onOpenAssignTask,
  onOpenCreateAdmin,
  onOpenManageTeam,
  onOpenTaskDetails,
  onDeleteTask,
  onOpenReportView,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'admins' | 'tasks' | 'reports'>('overview');
  const [selectedAdminFilter, setSelectedAdminFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Stats calculations
  const totalAdminsCount = admins.length;
  const totalUsersCount = users.length;
  const totalTasksCount = tasks.length;
  const completedTasksCount = tasks.filter((t) => t.status === 'completed').length;
  const inProgressTasksCount = tasks.filter((t) => t.status === 'in_progress').length;
  const pendingTasksCount = tasks.filter((t) => t.status === 'pending' || t.status === 'not_completed').length;
  const completionRate = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    if (selectedAdminFilter !== 'all') {
      const isTargetAdmin = t.adminId === selectedAdminFilter || t.assignedToId === selectedAdminFilter;
      if (!isTargetAdmin) return false;
    }
    if (statusFilter !== 'all') {
      if (statusFilter === 'pending') {
        if (t.status !== 'pending' && t.status !== 'not_completed') return false;
      } else if (t.status !== statusFilter) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Super Admin Top Header */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-700/50">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                Level 1 Hierarchy: Single Super Admin
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">Master Authority</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Organization Command Center
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Complete visibility and operational governance across all Admins, Users, tasks, and daily reports.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              id="btn-sa-create-admin"
              onClick={onOpenCreateAdmin}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 transition"
            >
              <UserPlus className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Create Admin
            </button>
            <button
              id="btn-sa-assign-task"
              onClick={() => onOpenAssignTask()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition"
            >
              <PlusCircle className="w-4 h-4" />
              Assign Task to Admin
            </button>
          </div>
        </div>

        {/* Navigation Tabs inside Header */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Overview & Metrics
          </button>
          <button
            onClick={() => setActiveTab('admins')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
              activeTab === 'admins'
                ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Admins & Teams ({totalAdminsCount})
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
              activeTab === 'tasks'
                ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            All Organization Tasks ({totalTasksCount})
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
              activeTab === 'reports'
                ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Daily Work Reports ({dailyReports.length})
          </button>
        </div>
      </div>

      {/* Primary KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">Admins</span>
            <ShieldCheck className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{totalAdminsCount}</div>
          <p className="text-[11px] text-slate-500 mt-1">Under Super Admin</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">Users</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{totalUsersCount}</div>
          <p className="text-[11px] text-slate-500 mt-1">Under Admins</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">Total Tasks</span>
            <Briefcase className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{totalTasksCount}</div>
          <p className="text-[11px] text-slate-500 mt-1">{completionRate}% Completed</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{completedTasksCount}</div>
          <p className="text-[11px] text-slate-500 mt-1">Verified work</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">In-Progress</span>
            <TrendingUp className="w-4 h-4 text-sky-500" />
          </div>
          <div className="text-2xl font-bold text-sky-600 dark:text-sky-400">{inProgressTasksCount}</div>
          <p className="text-[11px] text-slate-500 mt-1">Active execution</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">Pending</span>
            <AlertCircle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{pendingTasksCount}</div>
          <p className="text-[11px] text-slate-500 mt-1">Needs attention</p>
        </div>
      </div>

      {/* TAB 1: OVERVIEW & ADMIN CARDS */}
      {(activeTab === 'overview' || activeTab === 'admins') && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-600" />
              Admin Performance & Task Status Overview
            </h2>
            <button
              onClick={onOpenManageTeam}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              Manage Hierarchy & Users <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {admins.map((admin) => {
              const usersUnderThisAdmin = users.filter((u) => u.adminId === admin.id);
              const adminTasks = tasks.filter(
                (t) => t.userId === admin.id || t.assignedToId === admin.id || t.adminId === admin.id
              );
              const completedUnderAdmin = adminTasks.filter((t) => t.status === 'completed').length;
              const pendingUnderAdmin = adminTasks.filter(
                (t) => t.status === 'pending' || t.status === 'not_completed'
              ).length;
              const adminRate = adminTasks.length > 0 ? Math.round((completedUnderAdmin / adminTasks.length) * 100) : 0;

              return (
                <div
                  key={admin.id}
                  className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-slate-900 dark:text-white">{admin.fullName}</h3>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              admin.status === 'active'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                : 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300'
                            }`}
                          >
                            {admin.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{admin.email}</p>
                        <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400 mt-0.5">
                          {admin.department || 'Operations Team Lead'}
                        </p>
                      </div>
                      <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 flex items-center justify-center">
                        <ShieldCheck className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-center">
                      <div>
                        <div className="text-xs text-slate-500">Users</div>
                        <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                          {usersUnderThisAdmin.length}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">Tasks</div>
                        <div className="text-sm font-bold text-slate-800 dark:text-slate-200">{adminTasks.length}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">Completed</div>
                        <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                          {completedUnderAdmin}
                        </div>
                      </div>
                    </div>

                    {/* Team Members Chips */}
                    <div>
                      <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                        Team Members:
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {usersUnderThisAdmin.length > 0 ? (
                          usersUnderThisAdmin.map((u) => (
                            <span
                              key={u.id}
                              className="px-2 py-0.5 rounded text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                            >
                              {u.fullName}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400 italic">No users assigned yet</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <button
                      onClick={() => {
                        setSelectedAdminFilter(admin.id);
                        setActiveTab('tasks');
                      }}
                      className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    >
                      View Tasks →
                    </button>
                    <button
                      onClick={() => onOpenAssignTask(admin.id)}
                      className="px-2.5 py-1 rounded text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition"
                    >
                      + Assign Task
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: TASKS MATRIX */}
      {(activeTab === 'overview' || activeTab === 'tasks') && (
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-indigo-600" />
              Organization Task Governance Matrix
            </h2>

            <div className="flex flex-wrap items-center gap-2">
              {/* Admin Filter */}
              <select
                value={selectedAdminFilter}
                onChange={(e) => setSelectedAdminFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
              >
                <option value="all">All Admins & Teams</option>
                {admins.map((a) => (
                  <option key={a.id} value={a.id}>
                    Admin: {a.fullName}
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
              >
                <option value="all">All Statuses</option>
                <option value="completed">Completed</option>
                <option value="in_progress">In Progress</option>
                <option value="pending">Pending / Incomplete</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Task Details</th>
                  <th className="py-3 px-4">Supervised By</th>
                  <th className="py-3 px-4">Assigned To</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No tasks found matching current filters.
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map((t) => {
                    const assignee =
                      admins.find((a) => a.id === t.assignedToId || a.id === t.userId) ||
                      users.find((u) => u.id === t.assignedToId || u.id === t.userId);
                    const supervisor = admins.find((a) => a.id === t.adminId);

                    return (
                      <tr key={t.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                        <td className="py-3 px-4 font-medium text-slate-900 dark:text-white max-w-xs">
                          <div className="font-semibold">{t.title}</div>
                          {t.description && (
                            <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{t.description}</div>
                          )}
                          {t.incompleteReason && (
                            <div className="mt-1 text-[11px] font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded">
                              Reason: {t.incompleteReason}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                          {supervisor ? supervisor.fullName : 'Direct Super Admin'}
                        </td>
                        <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-medium">
                          {t.assigneeName || assignee?.fullName || 'Assigned'}
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">{t.dueDate}</td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
                              t.priority === 'urgent'
                                ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                                : t.priority === 'high'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
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
                        <td className="py-3 px-4 text-right whitespace-nowrap space-x-1">
                          <button
                            onClick={() => onOpenTaskDetails(t)}
                            className="p-1 rounded text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                            title="Inspect Task"
                          >
                            <Eye className="w-4 h-4" />
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

      {/* TAB 3: DAILY WORK REPORTS FEED */}
      {(activeTab === 'overview' || activeTab === 'reports') && (
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              Daily Work Reports Feed (Admin & User Submissions)
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {dailyReports.length} Submitted Reports
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {dailyReports.length === 0 ? (
              <div className="col-span-2 py-8 text-center text-slate-400">
                No daily work reports submitted yet today.
              </div>
            ) : (
              dailyReports.map((rep) => (
                <div
                  key={rep.id}
                  onClick={() => onOpenReportView(rep)}
                  className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 bg-slate-50/50 dark:bg-slate-800/30 cursor-pointer transition space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white text-sm">
                          {rep.senderName || 'Member'}
                        </span>
                        <span
                          className={`px-1.5 py-0.2 rounded text-[10px] font-bold uppercase ${
                            rep.role === 'admin'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                          }`}
                        >
                          {rep.role}
                        </span>
                      </div>
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
