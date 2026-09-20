import React, { useState } from 'react';
import { User, Task, DailyReport } from '../../types';
import { Send, X, CheckCircle2, Clock, AlertCircle, FileText } from 'lucide-react';

interface AdminConsolidatedReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  admin: User;
  superAdmin: User | null;
  tasks: Task[];
  teamUsers: User[];
  onSubmitReport: (payload: {
    date: string;
    completedCount: number;
    pendingCount: number;
    inProgressCount: number;
    tasksSummary: any[];
    remarks: string;
    recipientId?: string | null;
  }) => void;
}

export const AdminConsolidatedReportModal: React.FC<AdminConsolidatedReportModalProps> = ({
  isOpen,
  onClose,
  admin,
  superAdmin,
  tasks,
  teamUsers,
  onSubmitReport,
}) => {
  if (!isOpen) return null;

  const todayStr = new Date().toISOString().split('T')[0];
  const [reportDate, setReportDate] = useState(todayStr);
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Compile tasks for this admin and their team
  const relevantTasks = tasks;
  const completedTasks = relevantTasks.filter((t) => t.status === 'completed');
  const inProgressTasks = relevantTasks.filter((t) => t.status === 'in_progress');
  const pendingTasks = relevantTasks.filter((t) => t.status === 'pending' || t.status === 'not_completed');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const tasksSummary = relevantTasks.map((t) => ({
      id: t.id,
      title: t.title,
      status: t.status,
      priority: t.priority,
      assignee: t.assigneeName || 'Self',
      incompleteReason: t.incompleteReason || null,
    }));

    onSubmitReport({
      date: reportDate,
      completedCount: completedTasks.length,
      pendingCount: pendingTasks.length,
      inProgressCount: inProgressTasks.length,
      tasksSummary,
      remarks: remarks.trim(),
      recipientId: superAdmin?.id || null,
    });

    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-xl max-w-2xl w-full p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Submit Consolidated Daily Report to Super Admin
              </h3>
              <p className="text-xs text-slate-500">
                Reporting directly to {superAdmin?.fullName || 'Super Admin'} ({superAdmin?.email || 'Executive Lead'})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center justify-between gap-4 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg">
            <div>
              <span className="text-xs font-medium text-slate-500">Report Date:</span>
              <div className="text-sm font-bold text-slate-900 dark:text-white">{reportDate}</div>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="text-emerald-600">✓ {completedTasks.length} Completed</span>
              <span className="text-sky-600">⚡ {inProgressTasks.length} In Progress</span>
              <span className="text-amber-600">⏱ {pendingTasks.length} Pending</span>
            </div>
          </div>

          {/* Task Breakdown */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Department Work Breakdown ({relevantTasks.length} Tasks)
            </label>
            <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
              {relevantTasks.map((t) => (
                <div key={t.id} className="p-2.5 text-xs flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{t.title}</span>
                    <div className="text-[11px] text-slate-500">
                      Assigned: {t.assigneeName || 'Admin'} • {t.priority.toUpperCase()}
                      {t.incompleteReason && (
                        <span className="text-red-500 ml-2 font-medium">Reason: {t.incompleteReason}</span>
                      )}
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      t.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : t.status === 'in_progress'
                        ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}
                  >
                    {t.status.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Executive Remarks to Super Admin */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Admin Executive Summary & Remarks to Super Admin *
            </label>
            <textarea
              rows={4}
              required
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Detail accomplishments, blockers, team velocity, or resources needed from Super Admin..."
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
            >
              <Send className="w-4 h-4" />
              Submit to Super Admin
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
