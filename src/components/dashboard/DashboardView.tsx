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
  const pendingCount = dateTasks.filter((t) => t.status === 'pending').length;
  const inProgressCount = dateTasks.filter((t) => t.status === 'in_progress').length;
  const incompleteCount = totalCount - completedCount;
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
    if (filterStatus === 'pending') return t.status === 'pending';
    if (filterStatus === 'in_progress') return t.status === 'in_progress';
    if (filterStatus === 'incomplete') return t.status !== 'completed';
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
    <div className="space-y-6 pb-12">
      {/* Top Welcome Bar & Action Row */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Welcome back, {user.fullName}! 👋
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Today is <span className="font-semibold text-slate-700">{formattedDate}</span>. Here is your daily productivity overview.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            id="quick-add-task-btn"
            onClick={onOpenAddTask}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm shadow-indigo-200 transition cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>+ Add Task</span>
          </button>

          <button
            type="button"
            id="quick-daily-report-btn"
            onClick={onOpenDailyReport}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold border border-slate-200 transition cursor-pointer"
          >
            <BarChart2 className="w-4 h-4 text-indigo-600" />
            <span>Daily Report</span>
          </button>
        </div>
      </div>

      {/* Date Navigator / Calendar Selector Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-indigo-600" />
          <span className="text-sm font-bold text-slate-800">Viewing Date:</span>
          <span className="text-sm font-semibold text-indigo-900 bg-indigo-50 px-2.5 py-1 rounded-lg">
            {formattedDate} {isToday && <span className="text-indigo-600 font-bold ml-1">(Today)</span>}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleShiftDay(-1)}
            aria-label="Previous day"
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {!isToday && (
            <button
              type="button"
              onClick={() => onSelectDate(todayStr)}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold text-indigo-600 hover:bg-indigo-50 border border-indigo-200 transition cursor-pointer"
            >
              Go to Today
            </button>
          )}

          <input
            type="date"
            id="dashboard-date-picker"
            value={selectedDate}
            onChange={(e) => {
              if (e.target.value) onSelectDate(e.target.value);
            }}
            className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium cursor-pointer"
          />

          <button
            type="button"
            onClick={() => handleShiftDay(1)}
            aria-label="Next day"
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* Total Tasks */}
        <div id="stat-total-tasks" className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Tasks</span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <ListTodo className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">{totalCount}</span>
            <span className="text-[11px] text-slate-400 block mt-0.5">Scheduled for this day</span>
          </div>
        </div>

        {/* Completed Tasks */}
        <div id="stat-completed-tasks" className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Completed</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600">{completedCount}</span>
            <span className="text-[11px] text-slate-400 block mt-0.5">Finished milestones</span>
          </div>
        </div>

        {/* Pending Tasks */}
        <div id="stat-pending-tasks" className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Pending</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-600">{pendingCount}</span>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              {inProgressCount > 0 ? `+${inProgressCount} in progress` : 'Waiting to start'}
            </span>
          </div>
        </div>

        {/* Incomplete Tasks */}
        <div id="stat-incomplete-tasks" className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-700 uppercase tracking-wider">Incomplete</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-rose-600">{incompleteCount}</span>
            <span className="text-[11px] text-slate-400 block mt-0.5">Requires completion</span>
          </div>
        </div>

        {/* Completion Percentage */}
        <div id="stat-completion-rate" className="col-span-2 lg:col-span-1 p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-indigo-700 uppercase tracking-wider">Completion</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-extrabold text-indigo-600">{completionPercentage}%</span>
              <span className="text-xs font-bold text-slate-500">{completedCount}/{totalCount}</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Today's Task Summary & Interactive Task List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Header and Filter Tabs */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Today&apos;s Task Summary</span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                {dateTasks.length}
              </span>
            </h2>
            <p className="text-xs text-slate-500">Interactive checklist with instant progress synchronization</p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'all', label: 'All' },
              { id: 'pending', label: 'Pending' },
              { id: 'in_progress', label: 'In Progress' },
              { id: 'completed', label: 'Completed' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                id={`dashboard-filter-${tab.id}`}
                onClick={() => setFilterStatus(tab.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition cursor-pointer ${
                  filterStatus === tab.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Task Items List */}
        <div className="divide-y divide-slate-100">
          {displayedTasks.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
                <ListTodo className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">No tasks found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {filterStatus === 'all'
                  ? 'No tasks scheduled for this day yet. Click below to add your first task.'
                  : `No tasks matching the "${filterStatus}" status for this date.`}
              </p>
              {filterStatus === 'all' && (
                <button
                  type="button"
                  onClick={onOpenAddTask}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition cursor-pointer"
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
                  className={`p-4 sm:px-5 sm:py-4 flex items-start justify-between gap-3 hover:bg-slate-50/70 transition ${
                    isCompleted ? 'bg-slate-50/40' : ''
                  }`}
                >
                  {/* Left: Checkbox + Content */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <button
                      type="button"
                      id={`toggle-task-${task.id}`}
                      onClick={() => onToggleTask(task.id)}
                      aria-label={isCompleted ? 'Mark as pending' : 'Mark as completed'}
                      className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center transition cursor-pointer shrink-0 ${
                        isCompleted
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-slate-300 hover:border-indigo-600 bg-white'
                      }`}
                    >
                      {isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4
                          className={`text-sm font-semibold text-slate-900 truncate ${
                            isCompleted ? 'line-through text-slate-400' : ''
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
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-600 flex items-center gap-1">
                          <Tag className="w-2.5 h-2.5 text-slate-400" />
                          <span>{task.category}</span>
                        </span>

                        {/* Status tag if in_progress */}
                        {task.status === 'in_progress' && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-100 text-amber-800">
                            In Progress
                          </span>
                        )}
                      </div>

                      {task.description && (
                        <p
                          className={`text-xs text-slate-500 mt-1 line-clamp-2 ${
                            isCompleted ? 'line-through text-slate-400' : ''
                          }`}
                        >
                          {task.description}
                        </p>
                      )}

                      {/* Due Time */}
                      {task.dueTime && (
                        <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-slate-400">
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
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      id={`delete-task-${task.id}`}
                      onClick={() => onDeleteTask(task.id)}
                      aria-label="Delete task"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
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
