import React, { useState } from 'react';
import { X, CheckCircle2, Clock, AlertTriangle, Printer, Copy, Check, BarChart2, Send, ShieldCheck } from 'lucide-react';
import { Task, User } from '../../types';

interface DailyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  dateStr: string;
  tasks: Task[];
  user: User;
  supervisingAdmin?: User | null;
  onSubmitReport?: (reportData: {
    date: string;
    completedCount: number;
    pendingCount: number;
    inProgressCount: number;
    tasksSummary: any[];
    remarks: string;
    recipientId?: string | null;
  }) => void;
}

export const DailyReportModal: React.FC<DailyReportModalProps> = ({
  isOpen,
  onClose,
  dateStr,
  tasks,
  user,
  supervisingAdmin,
  onSubmitReport,
}) => {
  const [copied, setCopied] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const dayTasks = tasks.filter((t) => t.dueDate === dateStr);
  const total = dayTasks.length;
  const completed = dayTasks.filter((t) => t.status === 'completed').length;
  const inProgress = dayTasks.filter((t) => t.status === 'in_progress').length;
  const pending = dayTasks.filter((t) => t.status === 'pending').length;
  const notCompleted = dayTasks.filter((t) => t.status === 'not_completed').length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  const parsedDate = new Date(`${dateStr}T12:00:00`);
  const formattedDate = parsedDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleCopySummary = () => {
    const text = `📋 DAILY TASK REPORT - ${formattedDate}
Employee: ${user.fullName} (${user.email}) - Role: ${user.role.toUpperCase()}
Supervised by: ${supervisingAdmin ? supervisingAdmin.fullName : 'Admin Supervisor'}

Summary:
- Total Tasks: ${total}
- Completed: ${completed} (${percentage}%)
- In Progress: ${inProgress}
- Pending / Not Completed: ${pending + notCompleted}

Completed Tasks:
${dayTasks.filter((t) => t.status === 'completed').map((t) => `  ✓ [${t.category}] ${t.title}`).join('\n') || '  (None yet)'}

Unfinished Tasks with Reasons:
${dayTasks.filter((t) => t.status === 'not_completed' || t.status === 'pending').map((t) => `  ✕ [${t.priority.toUpperCase()}] ${t.title} - Reason: "${t.incompleteReason || 'Pending execution'}"`).join('\n') || '  (None)'}

Remarks: ${remarks || 'None'}
`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSendReport = async () => {
    if (!onSubmitReport) return;
    setIsSubmitting(true);

    const tasksSummary = dayTasks.map((t) => ({
      id: t.id,
      title: t.title,
      status: t.status,
      priority: t.priority,
      incompleteReason: t.incompleteReason || null,
    }));

    onSubmitReport({
      date: dateStr,
      completedCount: completed,
      pendingCount: pending + notCompleted,
      inProgressCount: inProgress,
      tasksSummary,
      remarks: remarks.trim(),
      recipientId: supervisingAdmin?.id || user.adminId || null,
    });

    setIsSubmitting(false);
    setSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] flex flex-col relative">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <BarChart2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Daily Work Report</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {user.role.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs text-slate-500">{formattedDate}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              id="copy-daily-report-btn"
              onClick={handleCopySummary}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
              title="Copy text summary to clipboard"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              type="button"
              id="print-daily-report-btn"
              onClick={handlePrint}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
              title="Print report"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print</span>
            </button>

            <button
              type="button"
              id="close-daily-report-btn"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto py-4 space-y-5 flex-1 pr-1">
          {/* Supervisor Information Banner */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between text-xs">
            <span className="text-slate-600 dark:text-slate-400">
              Recipient Supervisor: <strong className="text-slate-900 dark:text-white">{supervisingAdmin ? supervisingAdmin.fullName : 'Direct Supervisor'}</strong>
            </span>
            <span className="text-slate-500 dark:text-slate-400">
              {supervisingAdmin ? supervisingAdmin.email : ''}
            </span>
          </div>

          {/* Executive KPI Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700 text-center">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">Total</span>
              <span className="text-xl font-extrabold text-slate-900 dark:text-white mt-1 block">{total}</span>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200/70 dark:border-emerald-800 text-center">
              <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider block">Completed</span>
              <span className="text-xl font-extrabold text-emerald-700 dark:text-emerald-400 mt-1 block">{completed}</span>
            </div>
            <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/40 border border-amber-200/70 dark:border-amber-800 text-center">
              <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-300 uppercase tracking-wider block">Pending</span>
              <span className="text-xl font-extrabold text-amber-700 dark:text-amber-400 mt-1 block">{pending + inProgress}</span>
            </div>
            <div className="p-3 rounded-xl bg-rose-50/60 dark:bg-rose-950/40 border border-rose-200/70 dark:border-rose-800 text-center">
              <span className="text-[10px] font-semibold text-rose-700 dark:text-rose-300 uppercase tracking-wider block">Incomplete</span>
              <span className="text-xl font-extrabold text-rose-700 dark:text-rose-400 mt-1 block">{notCompleted}</span>
            </div>
            <div className="p-3 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200/70 dark:border-indigo-800 text-center col-span-2 sm:col-span-1">
              <span className="text-[10px] font-semibold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider block">Rate</span>
              <span className="text-xl font-extrabold text-indigo-700 dark:text-indigo-400 mt-1 block">{percentage}%</span>
            </div>
          </div>

          {/* Tasks List */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Tasks Assigned For {formattedDate} ({dayTasks.length})
            </h4>
            <div className="space-y-2">
              {dayTasks.length === 0 ? (
                <p className="text-xs text-slate-400 italic p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  No tasks assigned for this date.
                </p>
              ) : (
                dayTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 flex flex-col gap-1 text-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className={`font-bold ${task.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                        {task.title}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          task.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {task.status.replace('_', ' ')}
                      </span>
                    </div>
                    {task.incompleteReason && (
                      <div className="text-[11px] text-red-600 dark:text-red-400 font-medium">
                        Reason: {task.incompleteReason}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Daily Remarks for Supervisor */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Remarks & Summary for Your Supervisor ({supervisingAdmin ? supervisingAdmin.fullName : 'Admin'})
            </label>
            <textarea
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Provide a brief summary of what was completed today and any blockers..."
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition cursor-pointer"
          >
            Close
          </button>

          {onSubmitReport && (
            <button
              type="button"
              id="btn-submit-daily-report-modal"
              disabled={isSubmitting || submitted}
              onClick={handleSendReport}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition disabled:opacity-50"
            >
              {submitted ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  Submitted!
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  {isSubmitting ? 'Submitting...' : 'Submit Report to Supervisor'}
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
