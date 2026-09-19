import React, { useState, useEffect } from 'react';
import { X, AlertCircle, AlertTriangle } from 'lucide-react';
import { Task } from '../../types';

interface NotCompletedModalProps {
  isOpen: boolean;
  task: Task | null;
  onClose: () => void;
  onConfirm: (taskId: string, reason: string) => void;
}

export const NotCompletedModal: React.FC<NotCompletedModalProps> = ({
  isOpen,
  task,
  onClose,
  onConfirm,
}) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (task) {
      setReason(task.incompleteReason || '');
    } else {
      setReason('');
    }
    setError('');
  }, [task, isOpen]);

  if (!isOpen || !task) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('A reason is mandatory for marking a task as Not Completed.');
      return;
    }

    onConfirm(task.id, reason.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl max-w-md w-full p-4 sm:p-6 shadow-2xl border border-slate-100 dark:border-slate-800 relative animate-in fade-in zoom-in-95 duration-150 transition-colors">
        <button
          type="button"
          id="close-not-completed-modal-btn"
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-3.5 right-3.5 w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-3 pr-8">
          <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">Mark as Not Completed</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Provide a mandatory documented explanation</p>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl p-3 mb-4">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider block mb-0.5">
            Target Task
          </span>
          <p className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-2">{task.title}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Due Date: {task.dueDate}{task.dueTime ? ` at ${task.dueTime}` : ''}</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Mandatory Reason <span className="text-rose-600 dark:text-rose-400">*</span>
            </label>
            <textarea
              id="not-completed-reason-input"
              rows={3}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. Required data was not received, client rescheduled, blocker in dependency..."
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 resize-none"
              autoFocus
            />
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
              Please explain why this task could not be completed today. This will be stored with the task history.
            </p>
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] px-4 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="submit-not-completed-reason-btn"
              className="min-h-[44px] px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 shadow-sm shadow-rose-200 dark:shadow-none transition cursor-pointer text-center"
            >
              Save Reason & Mark Incomplete
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
