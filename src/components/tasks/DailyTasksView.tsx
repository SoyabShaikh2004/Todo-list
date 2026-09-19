import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Check,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Edit2,
  Trash2,
  Clock,
  Tag,
  Search,
  RotateCcw,
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { Task, Priority, TaskCategory } from '../../types';
import { NotCompletedModal } from './NotCompletedModal';

interface DailyTasksViewProps {
  tasks: Task[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onToggleTask: (taskId: string) => void;
  onMarkCompleted: (taskId: string) => void;
  onMarkNotCompleted: (taskId: string, reason: string) => void;
  onMarkPending: (taskId: string) => void;
  onOpenAddTask: (date?: string) => void;
  onOpenEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

export const DailyTasksView: React.FC<DailyTasksViewProps> = ({
  tasks,
  selectedDate,
  onSelectDate,
  onToggleTask,
  onMarkCompleted,
  onMarkNotCompleted,
  onMarkPending,
  onOpenAddTask,
  onOpenEditTask,
  onDeleteTask,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'completed' | 'not_completed'>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  // Modal for Reason when marking Not Completed
  const [notCompletedTask, setNotCompletedTask] = useState<Task | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];
  const isToday = selectedDate === todayStr;

  // Date navigation helpers
  const handlePrevDay = () => {
    const d = new Date(`${selectedDate}T12:00:00`);
    d.setDate(d.getDate() - 1);
    onSelectDate(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(`${selectedDate}T12:00:00`);
    d.setDate(d.getDate() + 1);
    onSelectDate(d.toISOString().split('T')[0]);
  };

  const handleToday = () => {
    onSelectDate(todayStr);
  };

  // Formatted date label
  const dateFormatted = new Date(`${selectedDate}T12:00:00`).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  // Filter tasks strictly for the selected date
  const dayTasks = tasks.filter((t) => t.dueDate === selectedDate);

  const completedTasks = dayTasks.filter((t) => t.status === 'completed');
  const notCompletedTasks = dayTasks.filter((t) => t.status === 'not_completed');
  const pendingTasks = dayTasks.filter((t) => t.status === 'pending' || t.status === 'in_progress');

  const totalCount = dayTasks.length;
  const completedCount = completedTasks.length;
  const notCompletedCount = notCompletedTasks.length;
  const pendingCount = pendingTasks.length;

  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Filter according to search and tabs
  const filteredTasks = dayTasks.filter((t) => {
    if (activeTab === 'pending' && t.status !== 'pending' && t.status !== 'in_progress') return false;
    if (activeTab === 'completed' && t.status !== 'completed') return false;
    if (activeTab === 'not_completed' && t.status !== 'not_completed') return false;

    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchDesc = t.description?.toLowerCase().includes(q);
      const matchReason = t.incompleteReason?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchReason) return false;
    }

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
      {/* Top Header & Date Navigation Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Daily Tasks</h1>
              {isToday && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300">
                  Today
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Organize, track deadlines, and record status for <span className="font-semibold text-slate-700 dark:text-slate-300">{dateFormatted}</span>
            </p>
          </div>

          {/* Action Buttons: Add Task */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              id="daily-add-task-btn"
              onClick={() => onOpenAddTask(selectedDate)}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm shadow-indigo-200 dark:shadow-none transition cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add Task</span>
            </button>
          </div>
        </div>

        {/* Date Selector Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-3.5 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Previous Day */}
            <button
              type="button"
              id="prev-day-btn"
              onClick={handlePrevDay}
              aria-label="Previous Day"
              className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center transition cursor-pointer shrink-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Date Input with Calendar Icon */}
            <div className="relative flex-1 sm:flex-none flex items-center">
              <div className="absolute left-3 pointer-events-none text-slate-400">
                <CalendarIcon className="w-4 h-4" />
              </div>
              <input
                type="date"
                id="daily-date-picker-input"
                value={selectedDate}
                onChange={(e) => {
                  if (e.target.value) onSelectDate(e.target.value);
                }}
                className="w-full sm:w-auto pl-9 pr-3 min-h-[40px] rounded-xl border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs sm:text-sm font-bold bg-slate-50/50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition cursor-pointer"
              />
            </div>

            {/* Next Day */}
            <button
              type="button"
              id="next-day-btn"
              onClick={handleNextDay}
              aria-label="Next Day"
              className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center transition cursor-pointer shrink-0"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Today Button */}
            <button
              type="button"
              id="today-shortcut-btn"
              onClick={handleToday}
              className={`min-h-[40px] px-3 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                isToday
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
              }`}
            >
              Today
            </button>
          </div>

          {/* Current Date Badge */}
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100/70 dark:bg-slate-800/80 px-3 py-2 rounded-xl border border-slate-200/60 dark:border-slate-700/60 truncate">
            Schedule: <span className="text-slate-900 dark:text-slate-200 font-bold">{dateFormatted}</span>
          </div>
        </div>
      </div>

      {/* Metrics Overview Cards for Selected Day */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
          <div className="text-slate-500 dark:text-slate-400 text-xs font-medium">Total Tasks</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{totalCount}</div>
          <div className="text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Assigned today</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
          <div className="text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Completed</span>
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{completedCount}</div>
          <div className="text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
            {totalCount > 0 ? `${completionRate}% finished` : 'No tasks'}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
          <div className="text-amber-600 dark:text-amber-400 text-xs font-semibold flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Pending</span>
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{pendingCount}</div>
          <div className="text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Awaiting action</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
          <div className="text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5" />
            <span>Not Done</span>
          </div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">{notCompletedCount}</div>
          <div className="text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">With reason logged</div>
        </div>
      </div>

      {/* Filter and Tab Navigation */}
      <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3 transition-colors">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {[
              { id: 'all', label: 'All Tasks', count: totalCount },
              { id: 'pending', label: 'Pending', count: pendingCount },
              { id: 'completed', label: 'Completed', count: completedCount },
              { id: 'not_completed', label: 'Not Done', count: notCompletedCount },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                id={`tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id as any)}
                className={`min-h-[36px] px-3 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === tab.id
                    ? tab.id === 'completed'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : tab.id === 'not_completed'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    activeTab === tab.id
                      ? 'bg-white/25 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              id="search-daily-tasks-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title, details, reason..."
              className="w-full min-h-[38px] pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
          </div>
        </div>

        {/* Priority Filter */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <span className="text-slate-400 dark:text-slate-500 font-medium mr-1">Priority:</span>
          {['all', 'urgent', 'high', 'medium', 'low'].map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPriorityFilter(p)}
              className={`min-h-[32px] px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition cursor-pointer ${
                priorityFilter === p
                  ? 'bg-slate-900 dark:bg-indigo-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {p === 'all' ? 'All' : p}
            </button>
          ))}
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-8 sm:p-12 text-center shadow-xs transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-white">No tasks found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              {dayTasks.length === 0
                ? `No tasks scheduled for ${dateFormatted}. Create one now to organize your day.`
                : 'No tasks match your selected status tab or search filter.'}
            </p>
            <button
              type="button"
              id="empty-state-add-task-btn"
              onClick={() => onOpenAddTask(selectedDate)}
              className="mt-4 inline-flex items-center justify-center gap-1.5 min-h-[44px] px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm shadow-indigo-200 dark:shadow-none transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Task for {dateFormatted}</span>
            </button>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isCompleted = task.status === 'completed';
            const isNotCompleted = task.status === 'not_completed';
            const isPending = task.status === 'pending' || task.status === 'in_progress';

            const completionTimeStr = task.completedAt
              ? new Date(task.completedAt).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : null;

            return (
              <div
                key={task.id}
                id={`daily-task-item-${task.id}`}
                className={`bg-white dark:bg-slate-900 rounded-2xl border p-3.5 sm:p-5 transition shadow-xs flex flex-col gap-3 ${
                  isCompleted
                    ? 'border-emerald-200/80 dark:border-emerald-900/60 bg-emerald-50/15 dark:bg-emerald-950/20'
                    : isNotCompleted
                    ? 'border-rose-200/80 dark:border-rose-900/60 bg-rose-50/15 dark:bg-rose-950/20'
                    : 'border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {/* Main Task Row */}
                <div className="flex items-start justify-between gap-2.5 sm:gap-3">
                  <div className="flex items-start gap-2.5 sm:gap-3 flex-1 min-w-0">
                    {/* Complete button / checkbox */}
                    <button
                      type="button"
                      id={`complete-task-btn-${task.id}`}
                      onClick={() => {
                        if (isCompleted) {
                          onMarkPending(task.id);
                        } else {
                          onMarkCompleted(task.id);
                        }
                      }}
                      aria-label={isCompleted ? 'Mark as Pending' : 'Mark as Completed'}
                      className={`mt-0.5 w-7 h-7 rounded-xl border flex items-center justify-center transition cursor-pointer shrink-0 ${
                        isCompleted
                          ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs shadow-emerald-200 dark:shadow-none'
                          : 'border-slate-300 dark:border-slate-600 hover:border-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 bg-white dark:bg-slate-800'
                      }`}
                    >
                      {isCompleted && <Check className="w-4 h-4 stroke-[3]" />}
                    </button>

                    {/* Task Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                        {/* Title */}
                        <h4
                          className={`text-sm sm:text-base font-bold text-slate-900 dark:text-white break-words ${
                            isCompleted ? 'line-through text-slate-400 dark:text-slate-500' : ''
                          }`}
                        >
                          {task.title}
                        </h4>

                        {/* Priority Badge */}
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase border ${getPriorityBadge(
                            task.priority
                          )}`}
                        >
                          {task.priority}
                        </span>

                        {/* Status Badge */}
                        {isCompleted && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Completed</span>
                          </span>
                        )}

                        {isNotCompleted && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800 flex items-center gap-1">
                            <XCircle className="w-3 h-3" />
                            <span>Not Completed</span>
                          </span>
                        )}

                        {isPending && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>Pending</span>
                          </span>
                        )}

                        {/* Category */}
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center gap-1">
                          <Tag className="w-2.5 h-2.5 text-slate-400 dark:text-slate-500" />
                          <span>{task.category}</span>
                        </span>
                      </div>

                      {/* Description / details */}
                      {task.description && (
                        <p
                          className={`text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed break-words ${
                            isCompleted ? 'line-through text-slate-400 dark:text-slate-500' : ''
                          }`}
                        >
                          {task.description}
                        </p>
                      )}

                      {/* Deadline / Time and Completion Info */}
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2 text-xs text-slate-400 dark:text-slate-500 font-medium">
                        {task.dueTime && (
                          <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                            <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                            <span>Assigned: <strong className="text-slate-800 dark:text-slate-100 font-semibold">{task.dueTime}</strong></span>
                          </div>
                        )}

                        {isCompleted && completionTimeStr && (
                          <div className="flex items-center gap-1 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md border border-emerald-200/60 dark:border-emerald-800/60 font-semibold text-[11px]">
                            <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                            <span>Done at {completionTimeStr}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions: Edit & Delete */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      id={`edit-task-btn-${task.id}`}
                      onClick={() => onOpenEditTask(task)}
                      aria-label="Edit Task"
                      className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      id={`delete-task-btn-${task.id}`}
                      onClick={() => onDeleteTask(task.id)}
                      aria-label="Delete Task"
                      className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Not Completed Reason Display Banner */}
                {isNotCompleted && task.incompleteReason && (
                  <div className="mt-1 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-900 dark:text-rose-300 flex items-start justify-between gap-2.5">
                    <div className="flex items-start gap-2 min-w-0 flex-1">
                      <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <span className="font-bold text-rose-950 dark:text-rose-200 uppercase tracking-wider text-[10px] block">
                          Reason for Not Completed:
                        </span>
                        <p className="mt-0.5 font-medium italic text-rose-900 dark:text-rose-300 break-words">
                          "{task.incompleteReason}"
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      id={`edit-reason-btn-${task.id}`}
                      onClick={() => setNotCompletedTask(task)}
                      className="min-h-[32px] px-2 py-1 text-[11px] font-bold text-rose-700 dark:text-rose-400 hover:text-rose-900 dark:hover:text-rose-200 hover:underline shrink-0 cursor-pointer"
                    >
                      Update
                    </button>
                  </div>
                )}

                {/* Task Status Action Bar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    {/* Mark as Not Completed Action */}
                    {!isCompleted && !isNotCompleted && (
                      <button
                        type="button"
                        id={`mark-not-completed-btn-${task.id}`}
                        onClick={() => setNotCompletedTask(task)}
                        className="flex-1 sm:flex-none min-h-[36px] px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 font-semibold border border-rose-200/80 dark:border-rose-800/80 flex items-center justify-center gap-1.5 transition cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Mark as Not Completed</span>
                      </button>
                    )}

                    {/* Reset to Pending Action if completed or not completed */}
                    {(isCompleted || isNotCompleted) && (
                      <button
                        type="button"
                        id={`reopen-task-btn-${task.id}`}
                        onClick={() => onMarkPending(task.id)}
                        className="flex-1 sm:flex-none min-h-[36px] px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reset to Pending</span>
                      </button>
                    )}

                    {/* Quick Complete if Not Completed */}
                    {isNotCompleted && (
                      <button
                        type="button"
                        id={`resolve-complete-btn-${task.id}`}
                        onClick={() => onMarkCompleted(task.id)}
                        className="flex-1 sm:flex-none min-h-[36px] px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-200/80 dark:border-emerald-800/80 flex items-center justify-center gap-1.5 transition cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Mark as Completed Now</span>
                      </button>
                    )}
                  </div>

                  <div className="text-[11px] text-slate-400 dark:text-slate-500 text-right sm:text-left">
                    Created on {new Date(task.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Mandatory Reason Modal for Not Completed */}
      <NotCompletedModal
        isOpen={!!notCompletedTask}
        task={notCompletedTask}
        onClose={() => setNotCompletedTask(null)}
        onConfirm={(taskId, reason) => {
          onMarkNotCompleted(taskId, reason);
          setNotCompletedTask(null);
        }}
      />
    </div>
  );
};
