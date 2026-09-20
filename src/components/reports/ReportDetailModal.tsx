import React from 'react';
import { DailyReport, Task } from '../../types';
import { X, CheckCircle2, Clock, XCircle, User, Calendar, FileText } from 'lucide-react';

interface ReportDetailModalProps {
  report: DailyReport | null;
  onClose: () => void;
}

export const ReportDetailModal: React.FC<ReportDetailModalProps> = ({ report, onClose }) => {
  if (!report) return null;

  let parsedTasks: Partial<Task>[] = [];
  try {
    if (report.tasksSummary) {
      parsedTasks = JSON.parse(report.tasksSummary);
    }
  } catch (err) {
    parsedTasks = [];
  }

  const total = report.completedCount + report.pendingCount + (report.inProgressCount || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Daily Work Report Details
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                  {report.role}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Submitted by {report.senderName || 'Staff Member'} on {report.date}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sender Info Card */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] text-slate-400 block font-medium">Author</span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {report.senderName}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] text-slate-400 block font-medium">Department</span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {report.department || 'Operations'}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] text-slate-400 block font-medium">Completed</span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              {report.completedCount} Tasks
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] text-slate-400 block font-medium">Pending/In-Prog</span>
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
              {report.pendingCount + (report.inProgressCount || 0)} Tasks
            </span>
          </div>
        </div>

        {/* Remarks */}
        {report.remarks && (
          <div className="p-3.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 space-y-1">
            <span className="text-xs font-bold text-indigo-900 dark:text-indigo-300">
              Executive Notes & Remarks:
            </span>
            <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
              {report.remarks}
            </p>
          </div>
        )}

        {/* Tasks Breakdown */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Audited Tasks ({parsedTasks.length})
          </h4>
          {parsedTasks.length === 0 ? (
            <p className="text-xs text-slate-400">No individual task breakdown attached.</p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {parsedTasks.map((t, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 dark:text-white">{t.title}</span>
                      <span className="text-[10px] font-bold uppercase text-slate-400">
                        {t.priority}
                      </span>
                    </div>
                    {t.incompleteReason && (
                      <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-0.5">
                        Incomplete Reason: {t.incompleteReason}
                      </p>
                    )}
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      t.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : t.status === 'not_completed'
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}
                  >
                    {t.status?.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-slate-800 dark:bg-slate-700 text-white hover:bg-slate-900"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
};
