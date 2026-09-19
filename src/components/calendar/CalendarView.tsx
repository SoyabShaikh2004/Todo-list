import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  Tag,
  Check,
  Calendar as CalendarIcon,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { Task, Priority } from '../../types';
import { NotCompletedModal } from '../tasks/NotCompletedModal';

interface CalendarViewProps {
  tasks: Task[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onToggleTask: (taskId: string) => void;
  onMarkCompleted: (taskId: string) => void;
  onMarkNotCompleted: (taskId: string, reason: string) => void;
  onMarkPending: (taskId: string) => void;
  onOpenAddTaskForDate: (date: string) => void;
  onNavigateToDailyTasks: (date: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  tasks,
  selectedDate,
  onSelectDate,
  onToggleTask,
  onMarkCompleted,
  onMarkNotCompleted,
  onMarkPending,
  onOpenAddTaskForDate,
  onNavigateToDailyTasks,
}) => {
  const [currentMonthDate, setCurrentMonthDate] = useState(() => {
    const d = new Date(`${selectedDate}T12:00:00`);
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const [notCompletedTask, setNotCompletedTask] = useState<Task | null>(null);

  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();

  const monthName = currentMonthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Compute days in month
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentMonthDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonthDate(new Date(year, month + 1, 1));
  };

  const handleGoToCurrentMonth = () => {
    const now = new Date();
    setCurrentMonthDate(new Date(now.getFullYear(), now.getMonth(), 1));
    onSelectDate(now.toISOString().split('T')[0]);
  };

  const todayStr = new Date().toISOString().split('T')[0];

  // Tasks for the entire visible month
  const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;
  const monthTasks = tasks.filter((t) => t.dueDate.startsWith(monthPrefix));
  const monthCompleted = monthTasks.filter((t) => t.status === 'completed').length;
  const monthPending = monthTasks.filter((t) => t.status === 'pending' || t.status === 'in_progress').length;
  const monthNotCompleted = monthTasks.filter((t) => t.status === 'not_completed').length;

  // Selected date tasks
  const selectedDayTasks = tasks.filter((t) => t.dueDate === selectedDate);
  const selectedDayCompleted = selectedDayTasks.filter((t) => t.status === 'completed').length;
  const selectedDayPending = selectedDayTasks.filter((t) => t.status === 'pending' || t.status === 'in_progress').length;
  const selectedDayNotCompleted = selectedDayTasks.filter((t) => t.status === 'not_completed').length;

  const selectedFormatted = new Date(`${selectedDate}T12:00:00`).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
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
    <div className="space-y-4 sm:space-y-6 pb-16">
      {/* Top Header */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-colors">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Monthly Calendar</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Visual status indicators across days. Tap any date to view and manage its daily tasks.
          </p>
        </div>

        {/* Month Navigation & Today Shortcut */}
        <div className="flex items-center justify-between sm:justify-start gap-1.5 sm:gap-2">
          <button
            type="button"
            id="calendar-prev-month-btn"
            onClick={handlePrevMonth}
            aria-label="Previous Month"
            className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center transition cursor-pointer shrink-0"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white min-w-[130px] sm:min-w-[150px] text-center">
            {monthName}
          </span>

          <button
            type="button"
            id="calendar-next-month-btn"
            onClick={handleNextMonth}
            aria-label="Next Month"
            className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center transition cursor-pointer shrink-0"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <button
            type="button"
            id="calendar-today-shortcut-btn"
            onClick={handleGoToCurrentMonth}
            className="min-h-[40px] px-3 sm:px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition cursor-pointer shrink-0"
          >
            This Month
          </button>
        </div>
      </div>

      {/* Month Overview Metrics & Visual Indicator Legend */}
      <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 transition-colors">
        {/* Month counters */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs font-semibold">
          <span className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px] sm:text-[11px] w-full sm:w-auto">
            {monthName} Totals:
          </span>
          <span className="text-slate-800 dark:text-slate-200 font-bold bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
            {monthTasks.length} Total
          </span>
          <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-200/70 dark:border-emerald-800/70">
            <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
            <span>{monthCompleted} Done</span>
          </span>
          <span className="flex items-center gap-1.5 text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 rounded-lg border border-amber-200/70 dark:border-amber-800/70">
            <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
            <span>{monthPending} Pending</span>
          </span>
          <span className="flex items-center gap-1.5 text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 px-2.5 py-1 rounded-lg border border-rose-200/70 dark:border-rose-800/70">
            <span className="w-2 h-2 rounded-full bg-rose-600 shrink-0" />
            <span>{monthNotCompleted} Incomplete</span>
          </span>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[11px] font-medium text-slate-500 dark:text-slate-400 border-t md:border-t-0 pt-2 md:pt-0">
          <span className="text-slate-400 dark:text-slate-500">Legend:</span>
          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Done
          </span>
          <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
            <span className="w-2 h-2 rounded-full bg-amber-500" /> Pending
          </span>
          <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400">
            <span className="w-2 h-2 rounded-full bg-rose-500" /> Incomplete
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
        {/* Calendar Grid */}
        <div className="xl:col-span-2 bg-white dark:bg-slate-900 p-3 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 gap-1 text-center font-bold text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Calendar Day Cells */}
          <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
            {/* Blank padding cells before month starts */}
            {Array.from({ length: firstDayOfMonth }).map((_, idx) => (
              <div key={`blank-${idx}`} className="min-h-[58px] sm:min-h-[88px] rounded-xl bg-slate-50/40 dark:bg-slate-800/30 border border-transparent" />
            ))}

            {/* Days in Month */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const isSelected = dateKey === selectedDate;
              const isCurrentToday = dateKey === todayStr;

              const dayTasks = tasks.filter((t) => t.dueDate === dateKey);
              const dayCompleted = dayTasks.filter((t) => t.status === 'completed').length;
              const dayNotCompleted = dayTasks.filter((t) => t.status === 'not_completed').length;
              const dayPending = dayTasks.filter((t) => t.status === 'pending' || t.status === 'in_progress').length;

              return (
                <button
                  key={dateKey}
                  type="button"
                  id={`calendar-day-${dateKey}`}
                  onClick={() => onSelectDate(dateKey)}
                  onDoubleClick={() => onNavigateToDailyTasks(dateKey)}
                  title={`Select ${dateKey}`}
                  className={`min-h-[58px] sm:min-h-[88px] p-1 sm:p-2 rounded-xl text-left border flex flex-col justify-between transition cursor-pointer relative group ${
                    isSelected
                      ? 'border-indigo-600 dark:border-indigo-500 ring-2 ring-indigo-600/30 dark:ring-indigo-500/30 bg-indigo-50/50 dark:bg-indigo-950/40 shadow-xs'
                      : isCurrentToday
                      ? 'border-indigo-300 dark:border-indigo-600 bg-indigo-50/20 dark:bg-indigo-950/25 hover:border-indigo-500'
                      : 'border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800/50 hover:bg-slate-50/70 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`text-[11px] sm:text-xs font-bold rounded-lg w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center transition ${
                        isCurrentToday
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : isSelected
                          ? 'text-indigo-700 dark:text-indigo-300 font-extrabold bg-indigo-100/70 dark:bg-indigo-900/50'
                          : 'text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white'
                      }`}
                    >
                      {dayNum}
                    </span>

                    {/* Total task badge */}
                    {dayTasks.length > 0 && (
                      <span className="text-[9px] sm:text-[10px] font-extrabold px-1 sm:px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                        {dayTasks.length}
                      </span>
                    )}
                  </div>

                  {/* Visual Status Indicators on Calendar Date */}
                  <div className="space-y-0.5 w-full mt-1">
                    {/* Pending Indicator */}
                    {dayPending > 0 && (
                      <div className="flex items-center gap-0.5 sm:gap-1 text-[8px] sm:text-[10px] text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 px-1 py-0.2 rounded font-semibold truncate border border-amber-200/50 dark:border-amber-800/50">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                        <span className="truncate hidden sm:inline">{dayPending} pend</span>
                        <span className="truncate sm:hidden">{dayPending}</span>
                      </div>
                    )}

                    {/* Completed Indicator */}
                    {dayCompleted > 0 && (
                      <div className="flex items-center gap-0.5 sm:gap-1 text-[8px] sm:text-[10px] text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-1 py-0.2 rounded font-semibold truncate border border-emerald-200/50 dark:border-emerald-800/50">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                        <span className="truncate hidden sm:inline">{dayCompleted} done</span>
                        <span className="truncate sm:hidden">{dayCompleted}</span>
                      </div>
                    )}

                    {/* Incomplete Indicator */}
                    {dayNotCompleted > 0 && (
                      <div className="flex items-center gap-0.5 sm:gap-1 text-[8px] sm:text-[10px] text-rose-800 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/50 px-1 py-0.2 rounded font-semibold truncate border border-rose-200/50 dark:border-rose-800/50">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                        <span className="truncate hidden sm:inline">{dayNotCompleted} missed</span>
                        <span className="truncate sm:hidden">{dayNotCompleted}</span>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Date Detail Panel */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col h-full transition-colors">
          {/* Header */}
          <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Selected Date
              </span>
              <button
                type="button"
                id="calendar-add-task-btn"
                onClick={() => onOpenAddTaskForDate(selectedDate)}
                className="min-h-[36px] px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Task</span>
              </button>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-1">{selectedFormatted}</h3>

            {/* Counts for selected day */}
            <div className="grid grid-cols-3 gap-2 mt-3 text-center">
              <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/60">
                <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-400 block">Completed</span>
                <span className="text-base sm:text-lg font-extrabold text-emerald-700 dark:text-emerald-300">{selectedDayCompleted}</span>
              </div>
              <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/60">
                <span className="text-[10px] font-bold text-amber-800 dark:text-amber-400 block">Pending</span>
                <span className="text-base sm:text-lg font-extrabold text-amber-700 dark:text-amber-300">{selectedDayPending}</span>
              </div>
              <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/60">
                <span className="text-[10px] font-bold text-rose-800 dark:text-rose-400 block">Incomplete</span>
                <span className="text-base sm:text-lg font-extrabold text-rose-700 dark:text-rose-300">{selectedDayNotCompleted}</span>
              </div>
            </div>

            {/* Quick jump to Daily Tasks */}
            <button
              type="button"
              id="open-in-daily-tasks-btn"
              onClick={() => onNavigateToDailyTasks(selectedDate)}
              className="mt-3 w-full min-h-[44px] py-2.5 px-3 rounded-xl bg-slate-900 dark:bg-indigo-600 hover:bg-indigo-600 dark:hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
            >
              <span>Open in Daily Tasks Page</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Task list for selected date */}
          <div className="mt-4 flex-1 overflow-y-auto space-y-2.5 max-h-[480px]">
            {selectedDayTasks.length === 0 ? (
              <div className="text-center py-10 text-slate-400 dark:text-slate-500">
                <CalendarIcon className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">No tasks for this date</p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Click Add Task to assign work for {selectedFormatted}</p>
                <button
                  type="button"
                  onClick={() => onOpenAddTaskForDate(selectedDate)}
                  className="mt-3 min-h-[36px] px-3 py-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer"
                >
                  + Add task for this day
                </button>
              </div>
            ) : (
              selectedDayTasks.map((task) => {
                const isCompleted = task.status === 'completed';
                const isNotCompleted = task.status === 'not_completed';
                return (
                  <div
                    key={task.id}
                    id={`calendar-task-item-${task.id}`}
                    className={`p-3 rounded-xl border transition flex flex-col gap-2 ${
                      isCompleted
                        ? 'bg-emerald-50/20 dark:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-900/60'
                        : isNotCompleted
                        ? 'bg-rose-50/20 dark:bg-rose-950/20 border-rose-200/80 dark:border-rose-900/60'
                        : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      {/* Checkbox button */}
                      <button
                        type="button"
                        aria-label={isCompleted ? 'Mark as Pending' : 'Mark as Completed'}
                        onClick={() => {
                          if (isCompleted) {
                            onMarkPending(task.id);
                          } else {
                            onMarkCompleted(task.id);
                          }
                        }}
                        className={`mt-0.5 w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 cursor-pointer transition ${
                          isCompleted
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'border-slate-300 dark:border-slate-600 hover:border-indigo-600 bg-white dark:bg-slate-700'
                        }`}
                      >
                        {isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>

                      <div className="min-w-0 flex-1">
                        <p
                          className={`text-xs font-bold text-slate-800 dark:text-slate-100 leading-snug break-words ${
                            isCompleted ? 'line-through text-slate-400 dark:text-slate-500' : ''
                          }`}
                        >
                          {task.title}
                        </p>

                        <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[10px]">
                          <span
                            className={`px-1.5 py-0.2 rounded font-extrabold uppercase border ${getPriorityBadge(
                              task.priority
                            )}`}
                          >
                            {task.priority}
                          </span>

                          <span className="text-slate-500 dark:text-slate-400 font-medium">
                            {task.category}
                          </span>

                          {task.dueTime && (
                            <span className="text-slate-400 dark:text-slate-500 flex items-center gap-0.5">
                              <Clock className="w-2.5 h-2.5" />
                              <span>{task.dueTime}</span>
                            </span>
                          )}

                          {isCompleted && (
                            <span className="text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-1 rounded">
                              Done
                            </span>
                          )}

                          {isNotCompleted && (
                            <span className="text-rose-700 dark:text-rose-300 font-bold bg-rose-50 dark:bg-rose-950/60 px-1 rounded">
                              Incomplete
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Incomplete reason display */}
                    {isNotCompleted && task.incompleteReason && (
                      <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-[11px] text-rose-900 dark:text-rose-300 flex items-start gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                        <div className="break-words">
                          <strong className="text-rose-950 dark:text-rose-200 font-bold">Reason:</strong>{' '}
                          <span className="italic">"{task.incompleteReason}"</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Mandatory Reason Modal */}
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
