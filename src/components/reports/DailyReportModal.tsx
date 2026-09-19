import React from 'react';
import { X, CheckCircle2, Clock, AlertTriangle, Printer, Copy, Check, BarChart2 } from 'lucide-react';
import { Task, User } from '../../types';

interface DailyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  dateStr: string;
  tasks: Task[];
  user: User;
}

export const DailyReportModal: React.FC<DailyReportModalProps> = ({
  isOpen,
  onClose,
  dateStr,
  tasks,
  user,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const dayTasks = tasks.filter((t) => t.dueDate === dateStr);
  const total = dayTasks.length;
  const completed = dayTasks.filter((t) => t.status === 'completed').length;
  const inProgress = dayTasks.filter((t) => t.status === 'in_progress').length;
  const pending = dayTasks.filter((t) => t.status === 'pending').length;
  const incomplete = total - completed;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Formatted date
  const parsedDate = new Date(`${dateStr}T12:00:00`);
  const formattedDate = parsedDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleCopySummary = () => {
    const text = `📋 DAILY TASK REPORT - ${formattedDate}
User: ${user.fullName} (${user.email})

Summary:
- Total Tasks: ${total}
- Completed: ${completed} (${percentage}%)
- In Progress: ${inProgress}
- Pending: ${pending}
- Incomplete Remaining: ${incomplete}

Completed Tasks:
${dayTasks.filter((t) => t.status === 'completed').map((t) => `  ✓ [${t.category}] ${t.title}`).join('\n') || '  (None yet)'}

Pending & Incomplete Tasks:
${dayTasks.filter((t) => t.status !== 'completed').map((t) => `  ⏳ [${t.priority.toUpperCase()}] ${t.title} ${t.dueTime ? `@ ${t.dueTime}` : ''}`).join('\n') || '  (All completed!)'}
`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] flex flex-col relative">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <BarChart2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Daily Task Report</h3>
              <p className="text-xs text-slate-500">{formattedDate}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              id="copy-daily-report-btn"
              onClick={handleCopySummary}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
              title="Copy text summary to clipboard"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              type="button"
              id="print-daily-report-btn"
              onClick={handlePrint}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
              title="Print report"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print</span>
            </button>

            <button
              type="button"
              id="close-daily-report-btn"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto py-5 space-y-6 flex-1 pr-1">
          {/* Executive KPI Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Total Tasks</span>
              <span className="text-2xl font-extrabold text-slate-900 mt-1 block">{total}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200/70">
              <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider block">Completed</span>
              <span className="text-2xl font-extrabold text-emerald-700 mt-1 block">{completed}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/70">
              <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider block">Pending</span>
              <span className="text-2xl font-extrabold text-amber-700 mt-1 block">{pending}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-200/70">
              <span className="text-[11px] font-semibold text-indigo-700 uppercase tracking-wider block">Completion</span>
              <span className="text-2xl font-extrabold text-indigo-700 mt-1 block">{percentage}%</span>
            </div>
          </div>

          {/* Visual Progress Bar */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <span>Overall Daily Completion Rate</span>
              <span>{percentage}%</span>
            </div>
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>{completed} finished</span>
              <span>{incomplete} remaining</span>
            </div>
          </div>

          {/* Completed Tasks */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 mb-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Completed Tasks ({completed})</span>
            </h4>
            {completed === 0 ? (
              <p className="text-xs text-slate-400 italic p-3 bg-slate-50 rounded-xl">No tasks marked as completed for this date yet.</p>
            ) : (
              <div className="space-y-2">
                {dayTasks
                  .filter((t) => t.status === 'completed')
                  .map((task) => (
                    <div
                      key={task.id}
                      className="p-3 rounded-xl border border-emerald-100 bg-emerald-50/30 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="font-semibold text-slate-800 line-through truncate">{task.title}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold shrink-0">
                        {task.category}
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Pending & In Progress Tasks */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 mb-2.5">
              <Clock className="w-4 h-4 text-amber-500" />
              <span>Pending & Incomplete Tasks ({incomplete})</span>
            </h4>
            {incomplete === 0 ? (
              <div className="p-3 bg-emerald-50 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>All tasks for this day are finished! Fantastic job.</span>
              </div>
            ) : (
              <div className="space-y-2">
                {dayTasks
                  .filter((t) => t.status !== 'completed')
                  .map((task) => (
                    <div
                      key={task.id}
                      className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                            task.priority === 'urgent'
                              ? 'bg-rose-500'
                              : task.priority === 'high'
                              ? 'bg-amber-500'
                              : task.priority === 'medium'
                              ? 'bg-indigo-500'
                              : 'bg-slate-400'
                          }`}
                        />
                        <span className="font-medium text-slate-800 truncate">{task.title}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {task.dueTime && (
                          <span className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {task.dueTime}
                          </span>
                        )}
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                            task.priority === 'urgent'
                              ? 'bg-rose-100 text-rose-800'
                              : task.priority === 'high'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {task.priority}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
};
