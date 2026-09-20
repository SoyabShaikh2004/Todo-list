import React, { useState } from 'react';
import { User, Task, DailyReport } from '../../types';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  FileText,
  Send,
  Calendar,
  Briefcase,
  ShieldCheck,
  Check,
  Play,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface UserDashboardProps {
  user: User;
  tasks: Task[];
  supervisingAdmin: User | null;
  todayReport: DailyReport | null;
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onMarkCompleted: (taskId: string) => void;
  onMarkInProgress: (taskId: string) => void;
  onMarkNotCompleted: (taskId: string) => void;
  onOpenSubmitReportToAdmin: () => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  user,
  tasks,
  supervisingAdmin,
  todayReport,
  selectedDate,
  onSelectDate,
  onMarkCompleted,
  onMarkInProgress,
  onMarkNotCompleted,
  onOpenSubmitReportToAdmin,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const [filterType, setFilterType] = useState<'all' | 'today' | 'pending' | 'completed'>('today');

  // Tasks assigned specifically to this user
  const myAssignedTasks = tasks;

  // Filter tasks
  const todayTasks = myAssignedTasks.filter((t) => t.dueDate === todayStr);
  const completedTasks = myAssignedTasks.filter((t) => t.status === 'completed');
  const inProgressTasks = myAssignedTasks.filter((t) => t.status === 'in_progress');
  const pendingTasks = myAssignedTasks.filter((t) => t.status === 'pending' || t.status === 'not_completed');

  const displayedTasks = myAssignedTasks.filter((t) => {
    if (filterType === 'today') return t.dueDate === todayStr;
    if (filterType === 'pending') return t.status === 'pending' || t.status === 'not_completed';
    if (filterType === 'completed') return t.status === 'completed';
    return true;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner Header */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-900 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-300 dark:border-blue-700/50">
                Level 3 Hierarchy: Team User
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Supervised by: {supervisingAdmin ? supervisingAdmin.fullName : 'Admin Supervisor'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              My Assigned Daily Workspace
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Focus on tasks assigned by your Admin, update progress, provide reasons for pending tasks, and submit your daily work report.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              id="btn-user-submit-daily-report"
              onClick={onOpenSubmitReportToAdmin}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition"
            >
              <Send className="w-4 h-4" />
              Submit Daily Report to Admin
            </button>
          </div>
        </div>

        {/* Daily Report Status alert banner */}
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Today's Reporting Status:</span>
            {todayReport ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" /> Daily Report Submitted
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold">
                <Clock className="w-3.5 h-3.5" /> Daily Report Pending for Today
              </span>
            )}
          </div>

          <span className="text-slate-500">
            Assigned Admin: <strong className="text-slate-700 dark:text-slate-200">{supervisingAdmin?.fullName || 'Assigned Admin'}</strong> ({supervisingAdmin?.email || 'admin@company.com'})
          </span>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
        <div
          onClick={() => setFilterType('all')}
          className={`p-4 rounded-xl border cursor-pointer transition ${
            filterType === 'all'
              ? 'bg-indigo-50/50 dark:bg-indigo-950/30 border-indigo-300 dark:border-indigo-700'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">My Tasks</span>
            <Briefcase className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{myAssignedTasks.length}</div>
          <p className="text-[11px] text-slate-500 mt-1">Total assigned</p>
        </div>

        <div
          onClick={() => setFilterType('today')}
          className={`p-4 rounded-xl border cursor-pointer transition ${
            filterType === 'today'
              ? 'bg-indigo-50/50 dark:bg-indigo-950/30 border-indigo-300 dark:border-indigo-700'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">Today's Tasks</span>
            <Calendar className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{todayTasks.length}</div>
          <p className="text-[11px] text-slate-500 mt-1">Due today</p>
        </div>

        <div
          onClick={() => setFilterType('completed')}
          className={`p-4 rounded-xl border cursor-pointer transition ${
            filterType === 'completed'
              ? 'bg-indigo-50/50 dark:bg-indigo-950/30 border-indigo-300 dark:border-indigo-700'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{completedTasks.length}</div>
          <p className="text-[11px] text-slate-500 mt-1">Finished tasks</p>
        </div>

        <div className="p-4 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">In Progress</span>
            <TrendingUp className="w-4 h-4 text-sky-500" />
          </div>
          <div className="text-2xl font-bold text-sky-600 dark:text-sky-400">{inProgressTasks.length}</div>
          <p className="text-[11px] text-slate-500 mt-1">Active work</p>
        </div>

        <div
          onClick={() => setFilterType('pending')}
          className={`p-4 rounded-xl border cursor-pointer transition ${
            filterType === 'pending'
              ? 'bg-indigo-50/50 dark:bg-indigo-950/30 border-indigo-300 dark:border-indigo-700'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">Pending</span>
            <AlertCircle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{pendingTasks.length}</div>
          <p className="text-[11px] text-slate-500 mt-1">Requires reason</p>
        </div>
      </div>

      {/* Task List Section with Immediate Status Controls */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-indigo-600" />
              {filterType === 'today' ? "Today's Assigned Tasks" : filterType === 'completed' ? 'Completed Tasks' : filterType === 'pending' ? 'Pending Tasks' : 'All Assigned Tasks'}
            </h2>
            <p className="text-xs text-slate-500">
              Update task state directly. If you cannot finish a task, click "Pending / Not Completed" to record your explanation.
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs">
            <button
              onClick={() => setFilterType('today')}
              className={`px-3 py-1 rounded-md font-medium transition ${
                filterType === 'today' ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-xs' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Today ({todayTasks.length})
            </button>
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded-md font-medium transition ${
                filterType === 'all' ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-xs' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              All ({myAssignedTasks.length})
            </button>
            <button
              onClick={() => setFilterType('pending')}
              className={`px-3 py-1 rounded-md font-medium transition ${
                filterType === 'pending' ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-xs' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Pending ({pendingTasks.length})
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {displayedTasks.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <CheckCircle2 className="w-8 h-8 mx-auto text-slate-300" />
              <p>No tasks matching this filter.</p>
            </div>
          ) : (
            displayedTasks.map((t) => (
              <div
                key={t.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col md:flex-row md:items-center justify-between gap-4 transition hover:border-slate-300 dark:hover:border-slate-700"
              >
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
                        t.priority === 'urgent'
                          ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                          : t.priority === 'high'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {t.priority}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">Due: {t.dueDate}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">• {t.category}</span>
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
                  </div>

                  <h3
                    className={`text-base font-bold ${
                      t.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'
                    }`}
                  >
                    {t.title}
                  </h3>

                  {t.description && (
                    <p className="text-sm text-slate-600 dark:text-slate-400">{t.description}</p>
                  )}

                  {t.completedAt && (
                    <div className="text-xs text-emerald-600 font-medium">
                      ✓ Completed on {new Date(t.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  )}

                  {t.incompleteReason && (
                    <div className="p-2 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300 font-medium">
                      Incomplete Reason: {t.incompleteReason}
                    </div>
                  )}
                </div>

                {/* Status Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 self-end md:self-center">
                  <button
                    onClick={() => onMarkCompleted(t.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                      t.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 cursor-default'
                        : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    Completed
                  </button>

                  <button
                    onClick={() => onMarkInProgress(t.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                      t.status === 'in_progress'
                        ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 cursor-default'
                        : 'bg-sky-600 text-white hover:bg-sky-700 shadow-xs'
                    }`}
                  >
                    <Play className="w-3.5 h-3.5" />
                    In Progress
                  </button>

                  <button
                    onClick={() => onMarkNotCompleted(t.id)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-600 text-white hover:bg-amber-700 shadow-xs flex items-center gap-1.5 transition"
                  >
                    <AlertCircle className="w-3.5 h-3.5" />
                    Pending / Reason
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
