import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  CheckCircle2,
  Clock,
  Tag,
  Check,
  Calendar as CalendarIcon
} from 'lucide-react';
import { Task } from '../../types';

interface CalendarViewProps {
  tasks: Task[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onToggleTask: (taskId: string) => void;
  onOpenAddTaskForDate: (date: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  tasks,
  selectedDate,
  onSelectDate,
  onToggleTask,
  onOpenAddTaskForDate,
}) => {
  const [currentMonthDate, setCurrentMonthDate] = useState(() => {
    const d = new Date(`${selectedDate}T12:00:00`);
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

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

  const todayStr = new Date().toISOString().split('T')[0];

  // Selected date tasks
  const selectedDayTasks = tasks.filter((t) => t.dueDate === selectedDate);
  const selectedFormatted = new Date(`${selectedDate}T12:00:00`).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Calendar Planner</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            View, schedule, and track daily tasks across the month
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-bold text-slate-800 min-w-[140px] text-center">
            {monthName}
          </span>
          <button
            type="button"
            onClick={handleNextMonth}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid (2 cols on desktop) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-slate-400 uppercase tracking-wider mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Calendar Day Cells */}
          <div className="grid grid-cols-7 gap-1">
            {/* Blank padding cells before month starts */}
            {Array.from({ length: firstDayOfMonth }).map((_, idx) => (
              <div key={`blank-${idx}`} className="h-20 sm:h-24 rounded-xl bg-slate-50/50" />
            ))}

            {/* Days */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const isSelected = dateKey === selectedDate;
              const isCurrentToday = dateKey === todayStr;

              const dayTasks = tasks.filter((t) => t.dueDate === dateKey);
              const completedCount = dayTasks.filter((t) => t.status === 'completed').length;
              const pendingCount = dayTasks.length - completedCount;

              return (
                <button
                  key={dateKey}
                  type="button"
                  onClick={() => onSelectDate(dateKey)}
                  className={`h-20 sm:h-24 p-1.5 sm:p-2 rounded-xl text-left border flex flex-col justify-between transition cursor-pointer ${
                    isSelected
                      ? 'border-indigo-600 ring-2 ring-indigo-600/20 bg-indigo-50/40'
                      : isCurrentToday
                      ? 'border-indigo-300 bg-indigo-50/10 hover:border-indigo-400'
                      : 'border-slate-100 hover:border-slate-300 bg-white hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`text-xs font-bold rounded-md w-6 h-6 flex items-center justify-center ${
                        isCurrentToday
                          ? 'bg-indigo-600 text-white'
                          : isSelected
                          ? 'text-indigo-700 font-extrabold'
                          : 'text-slate-700'
                      }`}
                    >
                      {dayNum}
                    </span>
                    {dayTasks.length > 0 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600">
                        {dayTasks.length}
                      </span>
                    )}
                  </div>

                  {/* Task Indicators */}
                  <div className="space-y-1 w-full mt-1">
                    {pendingCount > 0 && (
                      <div className="flex items-center gap-1 text-[10px] text-amber-700 bg-amber-50 px-1 py-0.5 rounded truncate font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                        <span className="truncate">{pendingCount} pending</span>
                      </div>
                    )}
                    {completedCount > 0 && (
                      <div className="flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded truncate font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                        <span className="truncate">{completedCount} done</span>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Date Task Panel */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Selected Day
              </span>
              <h3 className="text-sm font-bold text-slate-900 mt-0.5">{selectedFormatted}</h3>
            </div>
            <button
              type="button"
              onClick={() => onOpenAddTaskForDate(selectedDate)}
              className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>

          <div className="mt-4 flex-1 overflow-y-auto space-y-2.5">
            {selectedDayTasks.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <CalendarIcon className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                <p className="text-xs font-medium">No tasks for this date</p>
                <button
                  type="button"
                  onClick={() => onOpenAddTaskForDate(selectedDate)}
                  className="mt-3 text-xs text-indigo-600 font-semibold hover:underline"
                >
                  + Add task for this day
                </button>
              </div>
            ) : (
              selectedDayTasks.map((task) => {
                const isCompleted = task.status === 'completed';
                return (
                  <div
                    key={task.id}
                    className={`p-3 rounded-xl border transition flex items-start gap-2.5 ${
                      isCompleted ? 'bg-slate-50/50 border-slate-200' : 'bg-white border-slate-200'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => onToggleTask(task.id)}
                      className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 cursor-pointer ${
                        isCompleted
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-slate-300 hover:border-indigo-600 bg-white'
                      }`}
                    >
                      {isCompleted && <Check className="w-3 h-3 stroke-[3]" />}
                    </button>
                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-xs font-semibold text-slate-800 truncate ${
                          isCompleted ? 'line-through text-slate-400' : ''
                        }`}
                      >
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                        <span className="capitalize text-slate-600 font-medium">{task.priority}</span>
                        <span>•</span>
                        <span>{task.category}</span>
                        {task.dueTime && (
                          <>
                            <span>•</span>
                            <span>{task.dueTime}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
