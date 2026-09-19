import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Flag, Tag, CheckCircle } from 'lucide-react';
import { Priority, Task, TaskCategory, TaskStatus } from '../../types';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Omit<Task, 'id' | 'userId' | 'createdAt'>) => void;
  editingTask?: Task | null;
  defaultDate?: string;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingTask,
  defaultDate,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [status, setStatus] = useState<TaskStatus>('pending');
  const [incompleteReason, setIncompleteReason] = useState('');
  const [category, setCategory] = useState<TaskCategory>('Work');
  const [error, setError] = useState('');

  const categories: TaskCategory[] = ['Work', 'Personal', 'Study', 'Health', 'Finance', 'General'];

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description || '');
      setDueDate(editingTask.dueDate);
      setDueTime(editingTask.dueTime || '');
      setPriority(editingTask.priority);
      setStatus(editingTask.status);
      setIncompleteReason(editingTask.incompleteReason || '');
      setCategory(editingTask.category);
    } else {
      const today = new Date().toISOString().split('T')[0];
      setTitle('');
      setDescription('');
      setDueDate(defaultDate || today);
      setDueTime('12:00');
      setPriority('medium');
      setStatus('pending');
      setIncompleteReason('');
      setCategory('Work');
    }
    setError('');
  }, [editingTask, defaultDate, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please enter a task title');
      return;
    }
    if (!dueDate) {
      setError('Please pick a due date');
      return;
    }

    if (status === 'not_completed' && !incompleteReason.trim()) {
      setError('A mandatory reason is required when setting status to Not Completed.');
      return;
    }

    onSave({
      title: title.trim(),
      description: description.trim() || undefined,
      dueDate,
      dueTime: dueTime || undefined,
      priority,
      status,
      incompleteReason: status === 'not_completed' ? incompleteReason.trim() : undefined,
      category,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl max-w-lg w-full p-4 sm:p-6 shadow-2xl border border-slate-100 dark:border-slate-800 max-h-[92vh] flex flex-col relative transition-colors">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              {editingTask ? 'Edit Task' : 'Add New Daily Task'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {editingTask ? 'Modify details and update milestone progress' : 'Plan your next milestone, daily priority or chore'}
            </p>
          </div>
          <button
            type="button"
            id="close-task-modal-btn"
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            aria-label="Close task modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-4 pr-0.5 sm:pr-1 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Task Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Task Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="task-title-input"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. Complete client project presentation"
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 min-h-[44px]"
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Description (Optional)
            </label>
            <textarea
              id="task-description-input"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add extra context, links, or bullet points..."
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 resize-none"
            />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Due Date</span>
              </label>
              <input
                type="date"
                id="task-date-input"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 min-h-[44px]"
              />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Due Time</span>
              </label>
              <input
                type="time"
                id="task-time-input"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 min-h-[44px]"
              />
            </div>
          </div>

          {/* Priority & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                <Flag className="w-3.5 h-3.5 text-slate-400" />
                <span>Priority</span>
              </label>
              <select
                id="task-priority-select"
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-white bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 min-h-[44px]"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                <span>Category</span>
              </label>
              <select
                id="task-category-select"
                value={category}
                onChange={(e) => setCategory(e.target.value as TaskCategory)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-white bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 min-h-[44px]"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-slate-400" />
              <span>Status</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: 'pending', label: 'Pending' },
                  { id: 'completed', label: 'Completed' },
                  { id: 'not_completed', label: 'Not Done' },
                ] as const
              ).map((s) => (
                <button
                  key={s.id}
                  type="button"
                  id={`status-option-${s.id}`}
                  onClick={() => setStatus(s.id)}
                  className={`min-h-[44px] py-2 px-2 text-xs font-semibold rounded-xl border transition cursor-pointer text-center ${
                    status === s.id
                      ? s.id === 'completed'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : s.id === 'not_completed'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                        : 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Mandatory Reason for Not Completed */}
          {status === 'not_completed' && (
            <div className="p-3.5 rounded-xl bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50">
              <label className="block text-xs font-bold text-rose-900 dark:text-rose-300 uppercase tracking-wider mb-1">
                Reason for Not Completed <span className="text-rose-600 dark:text-rose-400">* (Mandatory)</span>
              </label>
              <textarea
                id="task-incomplete-reason-modal"
                rows={2}
                value={incompleteReason}
                onChange={(e) => {
                  setIncompleteReason(e.target.value);
                  if (error) setError('');
                }}
                placeholder="e.g. Required data was not received, client postponed, missing dependencies..."
                className="w-full rounded-xl border border-rose-300 dark:border-rose-800 px-3 py-2 text-sm text-slate-900 dark:text-white bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"
              />
              <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1 font-medium">
                Please specify why this task was not completed as scheduled.
              </p>
            </div>
          )}

          {/* Action buttons footer */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="save-task-submit-btn"
              className="min-h-[44px] px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-200 dark:shadow-none transition cursor-pointer text-center"
            >
              {editingTask ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
