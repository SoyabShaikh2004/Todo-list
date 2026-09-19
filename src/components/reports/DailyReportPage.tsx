import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Download,
  FileCheck2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  User as UserIcon,
  FileText,
  Sparkles,
  AlertTriangle,
  RotateCcw,
  Plus
} from 'lucide-react';
import { Task, User } from '../../types';
import { generateDailyReportPDF } from '../../utils/pdfGenerator';
import { NotCompletedModal } from '../tasks/NotCompletedModal';

interface DailyReportPageProps {
  user: User;
  tasks: Task[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onMarkCompleted: (taskId: string) => void;
  onMarkNotCompleted: (taskId: string, reason: string) => void;
  onMarkPending: (taskId: string) => void;
  onOpenAddTaskForDate: (date: string) => void;
}

export const DailyReportPage: React.FC<DailyReportPageProps> = ({
  user,
  tasks,
  selectedDate,
  onSelectDate,
  onMarkCompleted,
  onMarkNotCompleted,
  onMarkPending,
  onOpenAddTaskForDate,
}) => {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [reportGeneratedAt, setReportGeneratedAt] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [activeReasonModalTask, setActiveReasonModalTask] = useState<Task | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Date Calculations
  const currentDateObj = new Date(`${selectedDate}T12:00:00`);
  const formattedFullDate = currentDateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const handlePrevDay = () => {
    const d = new Date(`${selectedDate}T12:00:00`);
    d.setDate(d.getDate() - 1);
    onSelectDate(d.toISOString().split('T')[0]);
    setValidationError(null);
    setSuccessBanner(null);
  };

  const handleNextDay = () => {
    const d = new Date(`${selectedDate}T12:00:00`);
    d.setDate(d.getDate() + 1);
    onSelectDate(d.toISOString().split('T')[0]);
    setValidationError(null);
    setSuccessBanner(null);
  };

  const handleToday = () => {
    onSelectDate(new Date().toISOString().split('T')[0]);
    setValidationError(null);
    setSuccessBanner(null);
  };

  // Day Tasks
  const dayTasks = tasks.filter((t) => t.dueDate === selectedDate);
  const totalTasks = dayTasks.length;
  const completedTasks = dayTasks.filter((t) => t.status === 'completed');
  const notCompletedTasks = dayTasks.filter((t) => t.status === 'not_completed');
  const pendingTasks = dayTasks.filter((t) => t.status === 'pending' || t.status === 'in_progress');

  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;

  // Verification & End Day Report Flow
  const handleEndDayGenerateReport = () => {
    setValidationError(null);
    setSuccessBanner(null);

    if (totalTasks === 0) {
      setValidationError('No tasks exist for this date. Please add and record your daily tasks before generating an End-of-Day report.');
      return;
    }

    // Check for pending tasks
    if (pendingTasks.length > 0) {
      setValidationError(
        `Action Required: There ${pendingTasks.length === 1 ? 'is 1 task' : `are ${pendingTasks.length} tasks`} still pending for this date. To ensure report accuracy, all tasks must be marked as either Completed or Not Completed with a mandatory reason.`
      );
      return;
    }

    // Check for not_completed tasks missing a reason
    const missingReasonTask = notCompletedTasks.find(
      (t) => !t.incompleteReason || t.incompleteReason.trim() === ''
    );
    if (missingReasonTask) {
      setActiveReasonModalTask(missingReasonTask);
      setValidationError(`Mandatory reason missing for task: "${missingReasonTask.title}". Please provide a documented reason.`);
      return;
    }

    const timestamp = new Date().toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    setReportGeneratedAt(timestamp);
    setSuccessBanner('End-of-Day Performance Report generated successfully! Ready for download.');
  };

  const handleDownloadPDF = () => {
    if (totalTasks === 0) {
      setValidationError('Cannot download an empty report. No tasks found for this date.');
      return;
    }

    // Ensure pending check
    if (pendingTasks.length > 0) {
      setValidationError(
        `Cannot generate PDF: ${pendingTasks.length} task(s) are still pending. Please resolve each pending task before downloading.`
      );
      return;
    }

    const missingReasonTask = notCompletedTasks.find(
      (t) => !t.incompleteReason || t.incompleteReason.trim() === ''
    );
    if (missingReasonTask) {
      setActiveReasonModalTask(missingReasonTask);
      setValidationError(`Mandatory reason missing for task: "${missingReasonTask.title}". Please provide a documented reason.`);
      return;
    }

    try {
      setIsGeneratingPDF(true);
      const timestamp = reportGeneratedAt || new Date().toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      const doc = generateDailyReportPDF({
        user,
        dateStr: selectedDate,
        tasks: dayTasks,
        generationTime: timestamp,
      });

      doc.save(`Daily_Task_Report_${user.fullName.replace(/\s+/g, '_')}_${selectedDate}.pdf`);
      setSuccessBanner('PDF report generated and downloaded successfully!');
    } catch (err) {
      console.error('PDF generation error:', err);
      setValidationError('Failed to generate PDF. Please check data and try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-6xl mx-auto pb-16">
      {/* Top Header & Calendar Date Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div>
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block mb-1">
            Performance Audit
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <FileCheck2 className="w-6 h-6 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <span>Daily Task Report</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Audit daily execution metrics, review completion times and documented reasons, and download your official PDF.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2.5">
          <button
            type="button"
            id="end-day-generate-report-btn"
            onClick={handleEndDayGenerateReport}
            className="min-h-[44px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-sm shadow-indigo-200 dark:shadow-none transition cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-indigo-200" />
            <span>End Day / Verify</span>
          </button>

          <button
            type="button"
            id="download-pdf-report-btn"
            onClick={handleDownloadPDF}
            disabled={isGeneratingPDF}
            className="min-h-[44px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-semibold shadow-xs transition cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>{isGeneratingPDF ? 'Preparing PDF...' : 'Download PDF'}</span>
          </button>
        </div>
      </div>

      {/* Date Navigation Strip */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-3.5 sm:p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 transition-colors">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            id="report-prev-day-btn"
            onClick={handlePrevDay}
            aria-label="Previous Day"
            className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center transition cursor-pointer shrink-0"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex-1 sm:flex-none flex items-center gap-2 px-3 min-h-[40px] rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <CalendarIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <input
              type="date"
              id="report-date-picker"
              value={selectedDate}
              onChange={(e) => {
                if (e.target.value) onSelectDate(e.target.value);
              }}
              className="w-full text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 bg-transparent focus:outline-none cursor-pointer"
            />
          </div>

          <button
            type="button"
            id="report-next-day-btn"
            onClick={handleNextDay}
            aria-label="Next Day"
            className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center transition cursor-pointer shrink-0"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            id="report-today-btn"
            onClick={handleToday}
            className="min-h-[40px] px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition cursor-pointer shrink-0"
          >
            Today
          </button>
        </div>

        <div className="text-left sm:text-right pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
          <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white block">{formattedFullDate}</span>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 block">
            {reportGeneratedAt ? `Audit Timestamp: ${reportGeneratedAt}` : 'Real-time telemetry'}
          </span>
        </div>
      </div>

      {/* Validation / Alert Message */}
      {validationError && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 text-amber-900 dark:text-amber-200 flex items-start gap-3 text-xs sm:text-sm animate-in fade-in">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <span className="font-bold block">Incomplete Day Verification</span>
            <p className="mt-0.5 text-amber-800 dark:text-amber-300 break-words">{validationError}</p>
          </div>
          <button
            type="button"
            onClick={() => setValidationError(null)}
            className="min-h-[32px] px-2 text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100 text-xs font-bold shrink-0 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Success Notification */}
      {successBanner && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 text-emerald-900 dark:text-emerald-200 flex items-center justify-between text-xs sm:text-sm animate-in fade-in">
          <div className="flex items-center gap-2.5 min-w-0">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="font-medium truncate">{successBanner}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessBanner(null)}
            className="min-h-[32px] px-2 text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 dark:hover:text-emerald-100 text-xs font-bold shrink-0 cursor-pointer"
          >
            Close
          </button>
        </div>
      )}

      {/* Main Daily Task Report Metadata Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-6 shadow-xs transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 sm:pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800 flex items-center justify-center font-bold text-lg shrink-0">
              {user.fullName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Report For:</span>
                <span className="text-base font-bold text-slate-900 dark:text-white truncate">{user.fullName}</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex flex-wrap items-center gap-1.5">
                <span className="truncate">{user.email}</span>
                {user.mobile && <span>• {user.mobile}</span>}
              </p>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-left sm:text-right">
            <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Selected Date</span>
            <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white block">{selectedDate}</span>
          </div>
        </div>

        {/* 5 KPI Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-4 mt-4 sm:mt-6">
          {/* Total Tasks */}
          <div className="p-3 sm:p-4 rounded-xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 flex flex-col justify-between">
            <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total</span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">{totalTasks}</span>
              <FileText className="w-4 h-4 text-slate-400 dark:text-slate-500" />
            </div>
          </div>

          {/* Completed Tasks */}
          <div className="p-3 sm:p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 flex flex-col justify-between">
            <span className="text-[10px] sm:text-[11px] font-semibold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">Done</span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">{completedTasks.length}</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
          </div>

          {/* Not Completed Tasks */}
          <div className="p-3 sm:p-4 rounded-xl bg-rose-50/60 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-800/60 flex flex-col justify-between">
            <span className="text-[10px] sm:text-[11px] font-semibold text-rose-800 dark:text-rose-400 uppercase tracking-wider">Not Done</span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-extrabold text-rose-600 dark:text-rose-400">{notCompletedTasks.length}</span>
              <XCircle className="w-4 h-4 text-rose-500" />
            </div>
          </div>

          {/* Pending Tasks */}
          <div className="p-3 sm:p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 flex flex-col justify-between">
            <span className="text-[10px] sm:text-[11px] font-semibold text-amber-800 dark:text-amber-400 uppercase tracking-wider">Pending</span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-extrabold text-amber-600 dark:text-amber-400">{pendingTasks.length}</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
          </div>

          {/* Completion Percentage */}
          <div className="p-3 sm:p-4 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/60 flex flex-col justify-between col-span-2 lg:col-span-1">
            <span className="text-[10px] sm:text-[11px] font-semibold text-indigo-800 dark:text-indigo-400 uppercase tracking-wider">Rate</span>
            <div className="mt-2">
              <div className="flex items-baseline justify-between">
                <span className="text-2xl sm:text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">{completionPercentage}%</span>
                <span className="text-xs font-semibold text-indigo-500 dark:text-indigo-400">{completedTasks.length}/{totalTasks}</span>
              </div>
              <div className="w-full bg-indigo-100 dark:bg-indigo-950 rounded-full h-1.5 mt-2 overflow-hidden">
                <div
                  className="bg-indigo-600 dark:bg-indigo-500 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Tasks Prompt / Action Section (if any tasks are still pending) */}
      {pendingTasks.length > 0 && (
        <div className="bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/80 rounded-2xl p-4 sm:p-5 shadow-xs transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-amber-200/80 dark:border-amber-800/80 gap-1">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0" />
              <h2 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                Pending Tasks Requiring Resolution ({pendingTasks.length})
              </h2>
            </div>
            <span className="text-xs font-medium text-amber-800 dark:text-amber-400">
              Resolve before end-of-day report
            </span>
          </div>

          <div className="mt-3 divide-y divide-amber-200/60 dark:divide-amber-800/60">
            {pendingTasks.map((task) => (
              <div key={task.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white break-words">{task.title}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 uppercase">
                      {task.priority}
                    </span>
                  </div>
                  {task.description && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 break-words">{task.description}</p>
                  )}
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                    Scheduled: {task.dueTime || 'Anytime'} • Category: {task.category}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => onMarkCompleted(task.id)}
                    className="flex-1 sm:flex-none min-h-[38px] flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Complete</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveReasonModalTask(task)}
                    className="flex-1 sm:flex-none min-h-[38px] flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Not Completed</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 1: Completed Tasks */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-6 shadow-xs transition-colors">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">Completed Tasks</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tasks executed and verified
              </p>
            </div>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            {completedTasks.length} {completedTasks.length === 1 ? 'task' : 'tasks'}
          </span>
        </div>

        {completedTasks.length === 0 ? (
          <div className="py-8 sm:py-10 text-center">
            <CheckCircle2 className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">No tasks completed for this date.</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Tasks marked as complete will appear here with completion time.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800 mt-2">
            {completedTasks.map((task) => (
              <div key={task.id} className="py-3.5 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold line-through text-slate-400 dark:text-slate-500 break-words">
                      {task.title}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {task.category}
                    </span>
                  </div>
                  {task.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 break-words">{task.description}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[11px] text-slate-400 dark:text-slate-500 pt-0.5">
                    <span>Assigned: <strong className="text-slate-600 dark:text-slate-300 font-semibold">{task.dueTime || 'Anytime'}</strong></span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-semibold">
                      <Clock className="w-3.5 h-3.5" />
                      Done: {task.completedAt ? new Date(task.completedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'Recorded'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    Completed
                  </span>
                  <button
                    type="button"
                    onClick={() => onMarkPending(task.id)}
                    aria-label="Reset to Pending"
                    className="w-9 h-9 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 2: Not Completed Tasks */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-6 shadow-xs transition-colors">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
              <XCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">Not Completed Tasks</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tasks marked unfulfilled with explanation
              </p>
            </div>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            {notCompletedTasks.length} {notCompletedTasks.length === 1 ? 'task' : 'tasks'}
          </span>
        </div>

        {notCompletedTasks.length === 0 ? (
          <div className="py-8 sm:py-10 text-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Zero missed tasks!</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">No tasks were marked as not completed on this date.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800 mt-2">
            {notCompletedTasks.map((task) => (
              <div key={task.id} className="py-3.5 sm:py-4 space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-slate-900 dark:text-white break-words">{task.title}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 uppercase">
                      {task.priority}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {task.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-xs font-bold border border-rose-200 dark:border-rose-800">
                      <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                      Not Completed
                    </span>
                    <button
                      type="button"
                      onClick={() => onMarkCompleted(task.id)}
                      className="min-h-[36px] px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-xl transition cursor-pointer"
                    >
                      Mark Done
                    </button>
                  </div>
                </div>

                {task.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 break-words">{task.description}</p>
                )}

                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                  Assigned Time: <strong className="text-slate-600 dark:text-slate-300 font-semibold">{task.dueTime || 'Not specified'}</strong>
                </p>

                {/* Documented Incomplete Reason */}
                <div className="p-3 rounded-xl bg-rose-50/70 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <span className="font-bold text-rose-900 dark:text-rose-200 block mb-0.5">Documented Incomplete Reason:</span>
                    <p className="text-rose-800 dark:text-rose-300 font-medium break-words">
                      {task.incompleteReason ? `"${task.incompleteReason}"` : 'Reason missing — click below to provide mandatory explanation.'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveReasonModalTask(task)}
                    className="min-h-[32px] px-2 py-1 text-xs font-bold text-rose-700 dark:text-rose-300 hover:underline shrink-0 cursor-pointer"
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Empty State when no tasks exist on that day */}
      {totalTasks === 0 && (
        <div className="p-8 sm:p-10 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center shadow-xs transition-colors">
          <FileText className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-white">No Tasks Scheduled for This Date</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-sm mx-auto">
            You don't have any daily tasks assigned for {selectedDate}. Add your tasks to track daily performance.
          </p>
          <button
            type="button"
            onClick={() => onOpenAddTaskForDate(selectedDate)}
            className="mt-4 inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Task for {selectedDate}</span>
          </button>
        </div>
      )}

      {/* Mandatory Reason Modal */}
      {activeReasonModalTask && (
        <NotCompletedModal
          isOpen={true}
          task={activeReasonModalTask}
          onClose={() => setActiveReasonModalTask(null)}
          onConfirm={(taskId: string, reason: string) => {
            onMarkNotCompleted(taskId, reason);
            setActiveReasonModalTask(null);
            setValidationError(null);
            setSuccessBanner('Incomplete reason documented successfully.');
          }}
        />
      )}
    </div>
  );
};
