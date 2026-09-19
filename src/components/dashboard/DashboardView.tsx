import React, { useState } from 'react';
import {
  Plus,
  BarChart2,
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  AlertCircle,
  ListTodo,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Trash2,
  Tag,
  Check,
  Percent
} from 'lucide-react';
import { Task, User, TaskStatus, Priority } from '../../types';

interface DashboardViewProps {
  user: User;
  tasks: Task[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onToggleTask: (taskId: string) => void;
  onOpenAddTask: () => void;
  onOpenEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onOpenDailyReport: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  tasks,
  selectedDate,
  onSelectDate,
  onToggleTask,
  onOpenAddTask,
  onOpenEditTask,
  onDeleteTask,
  onOpenDailyReport,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const todayStr = new Date().toISOString().split('T')[0];
  const isToday = selectedDate === todayStr;

  // Filter tasks for the active date
  const dateTasks = tasks.filter((t) => t.dueDate === selectedDate);

  const totalCount = dateTasks.length;
  const completedCount = dateTasks.filter((t) => t.status === 'completed').length;
  const pendingCount = dateTasks.filter((t) => t.status === 'pending' || t.status === 'in_progress').length;
  const notCompletedCount = dateTasks.filter((t) => t.status === 'not_completed').length;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Formatted date string
  const parsedDate = new Date(`${selectedDate}T12:00:00`);
  const formattedDate = parsedDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  // Navigate dates
  const handleShiftDay = (direction: -1 | 1) => {
    const current = new Date(`${selectedDate}T12:00:00`);
    current.setDate(current.getDate() + direction);
    onSelectDate(current.toISOString().split('T')[0]);
  };

  // Filtered tasks display
  const displayedTasks = dateTasks.filter((t) => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'completed') return t.status === 'completed';
    if (filterStatus === 'pending') return t.status === 'pending' || t.status === 'in_progress';
    if (filterStatus === 'not_completed') return t.status === 'not_completed';
    return true;
  });

  const getPriorityBadge = (p: Priority) => {
    switch (p) {
      case 'urgent':
        return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'high':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'medium':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'low':
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-6">
      {/* Top Welcome Bar & Action Row */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Welcome back, {user.fullName}! 👋
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Today is <span className="font-semibold text-slate-700 dark:text-slate-300">{formattedDate}</span>. Here is your daily productivity overview.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            id="quick-add-task-btn"
            onClick={onOpenAddTask}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 min-h-[44px] px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm shadow-indigo-200 dark:shadow-none transition cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Task</span>
          </button>

          <button
            type="button"
            id="quick-daily-report-btn"
            onClick={onOpenDailyReport}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-semibold border border-slate-200 dark:border-slate-700 transition cursor-pointer"
          >
            <BarChart2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Daily Report</span>
          </button>
        </div>
      </div>

      {/* Date Navigator / Calendar Selector Bar */}
      <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors">
        <div className="flex items-center gap-2 min-w-0">
          <CalendarIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 shrink-0">Viewing Date:</span>
          <span className="text-xs sm:text-sm font-semibold text-indigo-900 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg truncate">
            {formattedDate} {isToday && <span className="text-indigo-600 dark:text-indigo-400 font-bold ml-1">(Today)</span>}
          </span>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => handleShiftDay(-1)}
            aria-label="Previous day"
            className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition cursor-pointer shrink-0"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {!isToday && (
            <button
              type="button"
              onClick={() => onSelectDate(todayStr)}
              className="min-h-[40px] px-2.5 py-1.5 rounded-xl text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 transition cursor-pointer"
            >
              Today
            </button>
          )}

          <input
            type="date"
            id="dashboard-date-picker"
            value={selectedDate}
            onChange={(e) => {
              if (e.target.value) onSelectDate(e.target.value);
            }}
            className="min-h-[40px] px-2.5 py-1 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium cursor-pointer"
          />

          <button
            type="button"
            onClick={() => handleShiftDay(1)}
            aria-label="Next day"
            className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition cursor-pointer shrink-0"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* Total Tasks */}
        <div id="stat-total-tasks" className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Tasks</span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
              <ListTodo className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">{totalCount}</span>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 block mt-0.5">Scheduled for this day</span>
          </div>
        </div>

        {/* Completed Tasks */}
        <div id="stat-completed-tasks" className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Completed</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">{completedCount}</span>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 block mt-0.5">Finished milestones</span>
          </div>
        </div>

        {/* Pending Tasks */}
        <div id="stat-pending-tasks" className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider">Pending</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-600 dark:text-amber-400">{pendingCount}</span>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 block mt-0.5">
              Scheduled pipeline
            </span>
          </div>
        </div>

        {/* Incomplete / Not Completed Tasks */}
        <div id="stat-incomplete-tasks" className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-700 dark:text-rose-400 uppercase tracking-wider">Not Completed</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-rose-600 dark:text-rose-400">{notCompletedCount}</span>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 block mt-0.5">With documented reasons</span>
          </div>
        </div>

        {/* Completion Percentage */}
        <div id="stat-completion-rate" className="col-span-2 lg:col-span-1 p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider">Completion</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">{completionPercentage}%</span>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{completedCount}/{totalCount}</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-indigo-600 dark:bg-indigo-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Today's Task Summary & Interactive Task List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden transition-colors">
        {/* Header and Filter Tabs */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <span>Today&apos;s Task Summary</span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {dateTasks.length}
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Interactive checklist with instant progress synchronization</p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'all', label: 'All' },
              { id: 'pending', label: 'Pending' },
              { id: 'completed', label: 'Completed' },
              { id: 'not_completed', label: 'Not Completed' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                id={`dashboard-filter-${tab.id}`}
                onClick={() => setFilterStatus(tab.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition cursor-pointer ${
                  filterStatus === tab.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Task Items List */}
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {displayedTasks.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3">
                <ListTodo className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No tasks found</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                {filterStatus === 'all'
                  ? 'No tasks scheduled for this day yet. Click below to add your first task.'
                  : `No tasks matching the "${filterStatus}" status for this date.`}
              </p>
              {filterStatus === 'all' && (
                <button
                  type="button"
                  onClick={onOpenAddTask}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add First Task</span>
                </button>
              )}
            </div>
          ) : (
            displayedTasks.map((task) => {
              const isCompleted = task.status === 'completed';
              return (
                <div
                  key={task.id}
                  id={`task-item-${task.id}`}
                  className={`p-4 sm:px-5 sm:py-4 flex items-start justify-between gap-3 hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition ${
                    isCompleted ? 'bg-slate-50/40 dark:bg-slate-800/20' : ''
                  }`}
                >
                  {/* Left: Checkbox + Content */}
                  <div className="flex items-start gap-2.5 sm:gap-3 flex-1 min-w-0">
                    <button
                      type="button"
                      id={`toggle-task-${task.id}`}
                      onClick={() => onToggleTask(task.id)}
                      aria-label={isCompleted ? 'Mark as pending' : 'Mark as completed'}
                      className={`mt-0.5 w-7 h-7 rounded-lg border flex items-center justify-center transition cursor-pointer shrink-0 ${
                        isCompleted
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-slate-300 dark:border-slate-600 hover:border-indigo-600 bg-white dark:bg-slate-800'
                      }`}
                    >
                      {isCompleted && <Check className="w-4 h-4 stroke-[3]" />}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                        <h4
                          className={`text-sm font-semibold text-slate-900 dark:text-white break-words sm:truncate ${
                            isCompleted ? 'line-through text-slate-400 dark:text-slate-500' : ''
                          }`}
                        >
                          {task.title}
                        </h4>

                        {/* Priority Badge */}
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${getPriorityBadge(
                            task.priority
                          )}`}
                        >
                          {task.priority}
                        </span>

                        {/* Category Pill */}
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center gap-1">
                          <Tag className="w-2.5 h-2.5 text-slate-400 dark:text-slate-500" />
                          <span>{task.category}</span>
                        </span>

                        {/* Status tag if in_progress or not_completed */}
                        {task.status === 'in_progress' && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                            In Progress
                          </span>
                        )}
                        {task.status === 'not_completed' && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                            Not Completed
                          </span>
                        )}
                      </div>

                      {task.description && (
                        <p
                          className={`text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 ${
                            isCompleted ? 'line-through text-slate-400 dark:text-slate-500' : ''
                          }`}
                        >
                          {task.description}
                        </p>
                      )}

                      {/* Incomplete reason if Not Completed */}
                      {task.status === 'not_completed' && task.incompleteReason && (
                        <div className="mt-1.5 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-900 dark:text-rose-300 flex items-start gap-2">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                          <div className="min-w-0 flex-1">
                            <span className="font-bold text-[10px] uppercase tracking-wider text-rose-950 dark:text-rose-200 block">Reason:</span>
                            <span className="italic break-words">"{task.incompleteReason}"</span>
                          </div>
                        </div>
                      )}

                      {/* Due Time */}
                      {task.dueTime && (
                        <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-slate-400 dark:text-slate-500">
                          <Clock className="w-3 h-3" />
                          <span>Scheduled for {task.dueTime}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Actions: Edit & Delete */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      id={`edit-task-${task.id}`}
                      onClick={() => onOpenEditTask(task)}
                      aria-label="Edit task"
                      className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      id={`delete-task-${task.id}`}
                      onClick={() => onDeleteTask(task.id)}
                      aria-label="Delete task"
                      className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
