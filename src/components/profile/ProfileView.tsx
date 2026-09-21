import React, { useState } from 'react';
import {
  UserCheck,
  Shield,
  KeyRound,
  Save,
  CheckCircle2,
  AlertCircle,
  Phone,
  Mail,
  User as UserIcon,
  LogOut,
  Sliders,
  Bell,
  Trash2,
  Eye,
  EyeOff,
  AlertTriangle,
  Clock,
  Sun,
  Moon,
  Check,
  Palette
} from 'lucide-react';
import { User, Priority } from '../../types';
import { updateUserProfile, clearAllUserTasks } from '../../services/storage';
import { useTheme } from '../../context/ThemeContext';

interface ProfileViewProps {
  user: User;
  onUpdateUser: (updated: User) => void;
  onLogout: () => void;
  onTasksCleared?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  onUpdateUser,
  onLogout,
  onTasksCleared,
}) => {
  const { theme, setTheme, toggleTheme } = useTheme();

  const [fullName, setFullName] = useState(user.fullName);
  const [mobile, setMobile] = useState(user.mobile);
  
  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Preferences & Account Settings
  const [reminderEnabled, setReminderEnabled] = useState(() => {
    return localStorage.getItem(`pref_reminder_${user.id}`) === 'true';
  });
  const [defaultPriority, setDefaultPriority] = useState<Priority>(() => {
    return (localStorage.getItem(`pref_priority_${user.id}`) as Priority) || 'medium';
  });
  const [autoSaveReports, setAutoSaveReports] = useState(() => {
    return localStorage.getItem(`pref_autosave_${user.id}`) !== 'false';
  });

  // Modal / Feedback state
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isConfirmClearModalOpen, setIsConfirmClearModalOpen] = useState(false);
  const [isConfirmLogoutModalOpen, setIsConfirmLogoutModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!fullName.trim()) {
      setMessage({ type: 'error', text: 'Full Name cannot be empty.' });
      return;
    }

    if (!mobile.trim()) {
      setMessage({ type: 'error', text: 'Mobile Number cannot be empty.' });
      return;
    }

    // Password validation if user entered a new password
    const hasExistingPassword = Boolean(user.passwordHash);
    if (newPassword) {
      if (hasExistingPassword && !currentPassword) {
        setMessage({ type: 'error', text: 'Please enter your current password to authorize changing it.' });
        return;
      }
      if (newPassword.length < 6) {
        setMessage({ type: 'error', text: 'New password must be at least 6 characters long.' });
        return;
      }
      if (newPassword !== confirmPassword) {
        setMessage({ type: 'error', text: 'New password confirmation does not match.' });
        return;
      }
    }

    setIsSaving(true);
    try {
      const res = updateUserProfile(user.id, {
        fullName,
        mobile,
        currentPassword: currentPassword || undefined,
        newPassword: newPassword || undefined,
      });

      if (res.success && res.user) {
        onUpdateUser(res.user);
        // Persist preferences
        localStorage.setItem(`pref_reminder_${user.id}`, String(reminderEnabled));
        localStorage.setItem(`pref_priority_${user.id}`, defaultPriority);
        localStorage.setItem(`pref_autosave_${user.id}`, String(autoSaveReports));

        setMessage({ type: 'success', text: 'Profile and account settings saved successfully!' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setMessage({ type: 'error', text: res.message });
      }
    } catch {
      setMessage({ type: 'error', text: 'An unexpected error occurred while saving.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearAllTasks = () => {
    clearAllUserTasks(user.id);
    setIsConfirmClearModalOpen(false);
    setMessage({ type: 'success', text: 'All personal tasks have been cleared from your account storage.' });
    if (onTasksCleared) {
      onTasksCleared();
    }
  };

  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Recently';

  return (
    <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto pb-16">
      {/* Top Header Card */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
        <div>
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block mb-1">
            Account Security & Preferences
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <UserCheck className="w-6 h-6 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <span>Profile & Settings</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Update your personal details, secure your password, configure light/dark theme, and manage daily task preferences.
          </p>
        </div>

        <button
          type="button"
          id="profile-logout-top-btn"
          onClick={() => setIsConfirmLogoutModalOpen(true)}
          className="min-h-[44px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs sm:text-sm font-semibold transition cursor-pointer self-stretch sm:self-auto"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Feedback Message */}
      {message && (
        <div
          className={`p-4 rounded-2xl text-xs sm:text-sm flex items-start gap-3 shadow-xs animate-in fade-in ${
            message.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
              : 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          )}
          <span className="flex-1 font-medium break-words">{message.text}</span>
          <button
            type="button"
            onClick={() => setMessage(null)}
            className="min-h-[32px] px-2 text-xs font-bold opacity-75 hover:opacity-100 shrink-0 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Theme Toggle & Appearance Section */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-7 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 sm:space-y-5 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Theme & Appearance</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Choose between clean high-contrast Light mode or eye-friendly Dark mode
              </p>
            </div>
          </div>

          {/* Quick toggle switch */}
          <div className="flex items-center gap-3 self-stretch sm:self-auto justify-between sm:justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              {theme === 'dark' ? 'Dark Mode Active' : 'Light Mode Active'}
            </span>
            <button
              type="button"
              id="theme-toggle-switch"
              role="switch"
              aria-checked={theme === 'dark'}
              onClick={toggleTheme}
              className={`relative inline-flex h-8 w-15 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 ${
                theme === 'dark' ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'
              }`}
            >
              <span className="sr-only">Toggle theme mode</span>
              <span
                className={`pointer-events-none flex h-7 w-7 transform items-center justify-center rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  theme === 'dark' ? 'translate-x-7 text-indigo-600' : 'translate-x-0 text-amber-500'
                }`}
              >
                {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </span>
            </button>
          </div>
        </div>

        {/* Visual Selectable Theme Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-1">
          {/* Light Theme Card */}
          <button
            type="button"
            id="select-light-theme-btn"
            onClick={() => setTheme('light')}
            className={`min-h-[72px] p-4 rounded-2xl border text-left transition cursor-pointer relative flex flex-col justify-between gap-3 ${
              theme === 'light'
                ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/20 ring-2 ring-indigo-600/20'
                : 'border-slate-200 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-600'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shadow-xs shrink-0">
                  <Sun className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Light Mode</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Bright, high-contrast clarity</p>
                </div>
              </div>
              {theme === 'light' && (
                <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              )}
            </div>

            {/* Visual mini-canvas preview */}
            <div className="rounded-xl border border-slate-200 bg-white p-2.5 shadow-xs flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-indigo-600 shrink-0" />
              <div className="h-2 w-16 bg-slate-200 rounded-full" />
              <div className="h-2 w-8 bg-emerald-100 rounded-full ml-auto" />
            </div>
          </button>

          {/* Dark Theme Card */}
          <button
            type="button"
            id="select-dark-theme-btn"
            onClick={() => setTheme('dark')}
            className={`min-h-[72px] p-4 rounded-2xl border text-left transition cursor-pointer relative flex flex-col justify-between gap-3 ${
              theme === 'dark'
                ? 'border-indigo-600 bg-indigo-950/30 ring-2 ring-indigo-600/30'
                : 'border-slate-200 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-600'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-950 text-indigo-400 border border-indigo-800 flex items-center justify-center shadow-xs shrink-0">
                  <Moon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Dark Mode</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Deep slate tones, reduces eye fatigue</p>
                </div>
              </div>
              {theme === 'dark' && (
                <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              )}
            </div>

            {/* Visual mini-canvas preview */}
            <div className="rounded-xl border border-slate-700 bg-slate-900 p-2.5 shadow-xs flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-indigo-500 shrink-0" />
              <div className="h-2 w-16 bg-slate-700 rounded-full" />
              <div className="h-2 w-8 bg-emerald-950 rounded-full ml-auto" />
            </div>
          </button>
        </div>
      </div>

      {/* Main Profile Form */}
      <form onSubmit={handleSaveProfile} className="space-y-4 sm:space-y-6">
        {/* User Identity Banner */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-7 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
          <div className="flex items-center gap-3.5 sm:gap-4 pb-4 sm:pb-6 border-b border-slate-100 dark:border-slate-800">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-indigo-600 text-white font-extrabold text-xl sm:text-2xl flex items-center justify-center shadow-md shadow-indigo-100 dark:shadow-none border-2 border-white dark:border-slate-800 shrink-0">
              {user.fullName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">{user.fullName}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5 truncate">
                <Mail className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                <span className="truncate">{user.email}</span>
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400 dark:text-slate-500 shrink-0" />
                <span>Account registered {memberSince}</span>
              </p>
            </div>
          </div>

          {/* Form Fields: Full Name, Email, Mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 mt-4 sm:mt-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                <input
                  type="text"
                  id="profile-fullname-input"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full min-h-[44px] pl-10 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Mobile Number <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                <input
                  type="tel"
                  id="profile-mobile-input"
                  required
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full min-h-[44px] pl-10 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-colors"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Email Address (Account Identifier)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="w-full min-h-[44px] pl-10 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                />
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                Your email address is your verified unique ID used for partitioned task isolation and data privacy.
              </p>
            </div>
          </div>
        </div>

        {/* Change Password Card */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-7 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3.5 sm:space-y-4 transition-colors">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <KeyRound className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Change Password</h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Leave blank if you do not want to modify your login password.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4 pt-1">
            {/* Current Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  id="profile-current-password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Current password"
                  className="w-full min-h-[44px] pl-3.5 pr-11 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  aria-label={showCurrentPassword ? 'Hide current password' : 'Show current password'}
                  className="w-10 h-10 absolute right-1 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 flex items-center justify-center cursor-pointer"
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  id="profile-new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full min-h-[44px] pl-3.5 pr-11 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}
                  className="w-10 h-10 absolute right-1 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 flex items-center justify-center cursor-pointer"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="profile-confirm-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-type password"
                  className="w-full min-h-[44px] pl-3.5 pr-11 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Hide confirmed password' : 'Show confirmed password'}
                  className="w-10 h-10 absolute right-1 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 flex items-center justify-center cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Account Settings & Preferences Card */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-7 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 transition-colors">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Sliders className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Task Preferences</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Default Priority */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Default Priority for New Tasks
              </label>
              <select
                id="pref-default-priority"
                value={defaultPriority}
                onChange={(e) => setDefaultPriority(e.target.value as Priority)}
                className="w-full min-h-[44px] px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-600 cursor-pointer"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
                <option value="urgent">Urgent Priority</option>
              </select>
            </div>

            {/* End of Day Auto-Audit Check */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Daily Report Validation
              </label>
              <label className="min-h-[44px] flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoSaveReports}
                  onChange={(e) => setAutoSaveReports(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded border-slate-300 dark:border-slate-600 focus:ring-indigo-500"
                />
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Enforce reasons before report generation
                </span>
              </label>
            </div>
          </div>

          {/* Daily Reminders Notification Toggle */}
          <div className="pt-1">
            <label className="min-h-[44px] flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white block">
                    Daily Schedule Notifications
                  </span>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 block">
                    Display alerts when today's tasks are pending
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={reminderEnabled}
                onChange={(e) => setReminderEnabled(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded border-slate-300 dark:border-slate-600 focus:ring-indigo-500"
              />
            </label>
          </div>
        </div>

        {/* Data Security & Privacy Banner */}
        <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/60 text-xs text-slate-600 dark:text-slate-300 flex items-start gap-3">
          <Shield className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-indigo-900 dark:text-indigo-300">User Data Partitioning & Privacy:</span>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Your tasks, dates, completion metrics, and incomplete reasons are isolated exclusively to your authenticated user identifier.
            </p>
          </div>
        </div>

        {/* Submit & Reset Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          <button
            type="button"
            id="clear-all-tasks-btn"
            onClick={() => setIsConfirmClearModalOpen(true)}
            className="min-h-[44px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-semibold transition cursor-pointer w-full sm:w-auto"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Reset / Clear All My Tasks</span>
          </button>

          <button
            type="submit"
            id="save-profile-btn"
            disabled={isSaving}
            className="min-h-[44px] flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-sm shadow-indigo-200 dark:shadow-none transition cursor-pointer w-full sm:w-auto disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Profile & Settings'}</span>
          </button>
        </div>
      </form>

      {/* Clear Tasks Confirmation Modal */}
      {isConfirmClearModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-100 dark:border-slate-800">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Clear All Tasks?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Are you sure you want to delete all tasks associated with your account? This will permanently remove your scheduled and completed tasks.
                </p>
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 mt-6 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsConfirmClearModalOpen(false)}
                className="min-h-[44px] px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer flex items-center justify-center"
              >
                Cancel
              </button>
              <button
                type="button"
                id="confirm-clear-all-tasks-btn"
                onClick={handleClearAllTasks}
                className="min-h-[44px] px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs cursor-pointer flex items-center justify-center"
              >
                Yes, Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {isConfirmLogoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-100 dark:border-slate-800">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0">
                <LogOut className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Sign Out of TaskFlow?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  You will need to sign in again with your email and password to access your daily tasks.
                </p>
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 mt-6 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsConfirmLogoutModalOpen(false)}
                className="min-h-[44px] px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer flex items-center justify-center"
              >
                Stay Signed In
              </button>
              <button
                type="button"
                id="confirm-signout-btn"
                onClick={() => {
                  setIsConfirmLogoutModalOpen(false);
                  onLogout();
                }}
                className="min-h-[44px] px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs cursor-pointer flex items-center justify-center"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
