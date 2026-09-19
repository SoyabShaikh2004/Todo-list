import React from 'react';
import { BarChart3, CheckCircle2, Clock, AlertTriangle, TrendingUp, Award, Calendar } from 'lucide-react';
import { Task, User } from '../../types';

interface ReportsViewProps {
  tasks: Task[];
  user: User;
  onOpenDailyReport: () => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ tasks, user, onOpenDailyReport }) => {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const pendingTasks = tasks.filter((t) => t.status === 'pending').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress').length;
  const incompleteTasks = totalTasks - completedTasks;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Priority distribution
  const urgentCount = tasks.filter((t) => t.priority === 'urgent').length;
  const highCount = tasks.filter((t) => t.priority === 'high').length;
  const mediumCount = tasks.filter((t) => t.priority === 'medium').length;
  const lowCount = tasks.filter((t) => t.priority === 'low').length;

  // Category distribution
  const categories = ['Work', 'Personal', 'Study', 'Health', 'Finance', 'General'] as const;
  const categoryCounts = categories.map((cat) => ({
    name: cat,
    count: tasks.filter((t) => t.category === cat).length,
    completed: tasks.filter((t) => t.category === cat && t.status === 'completed').length,
  }));

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Performance & Reports</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Historical analytics, task distribution, and completion rates
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenDailyReport}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm shadow-indigo-200 transition cursor-pointer self-start sm:self-auto"
        >
          <Calendar className="w-4 h-4" />
          <span>View Today&apos;s Full Report</span>
        </button>
      </div>

      {/* Top Level KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">All Time Tasks</span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-3">{totalTasks}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Recorded in your profile</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Completed</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-emerald-600 mt-3">{completedTasks}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Successfully resolved</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Pending / WIP</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-amber-600 mt-3">{pendingTasks + inProgressTasks}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Active pipeline</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-indigo-700 uppercase tracking-wider">Completion Rate</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-indigo-600 mt-3">{completionRate}%</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Ratio of done tasks</span>
        </div>
      </div>

      {/* Analytics Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Priority Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 mb-4">Task Priority Distribution</h3>
          <div className="space-y-3">
            {[
              { label: 'Urgent', count: urgentCount, color: 'bg-rose-500', bg: 'bg-rose-50', text: 'text-rose-700' },
              { label: 'High', count: highCount, color: 'bg-amber-500', bg: 'bg-amber-50', text: 'text-amber-700' },
              { label: 'Medium', count: mediumCount, color: 'bg-blue-500', bg: 'bg-blue-50', text: 'text-blue-700' },
              { label: 'Low', count: lowCount, color: 'bg-slate-400', bg: 'bg-slate-50', text: 'text-slate-700' },
            ].map((p) => {
              const pct = totalTasks > 0 ? Math.round((p.count / totalTasks) * 100) : 0;
              return (
                <div key={p.label} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className={p.text}>{p.label} Priority</span>
                    <span className="text-slate-500">
                      {p.count} tasks ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${p.color} rounded-full`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 mb-4">Tasks by Category</h3>
          <div className="space-y-3">
            {categoryCounts.map((cat) => {
              const pct = totalTasks > 0 ? Math.round((cat.count / totalTasks) * 100) : 0;
              return (
                <div key={cat.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-800">{cat.name}</span>
                    <span className="text-slate-500">
                      {cat.completed}/{cat.count} completed
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Productivity Highlights Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-900 to-slate-900 text-white shadow-md flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
          <Award className="w-6 h-6 text-amber-400" />
        </div>
        <div>
          <h4 className="font-bold text-base">User Productivity Score: {completionRate}%</h4>
          <p className="text-xs text-slate-300 mt-0.5">
            {user.fullName}, you have resolved {completedTasks} out of {totalTasks} total daily goals. Keep your streak alive!
          </p>
        </div>
      </div>
    </div>
  );
};
