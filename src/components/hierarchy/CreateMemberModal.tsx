import React, { useState } from 'react';
import { User, UserRole } from '../../types';
import { UserPlus, X, ShieldCheck, AlertCircle } from 'lucide-react';

interface CreateMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetRole: 'admin' | 'user';
  currentUser: User;
  admins: User[];
  onCreateAdmin: (data: { fullName: string; email: string; mobile?: string; password: string; department?: string }) => Promise<{ success: boolean; message: string }>;
  onCreateUser: (data: { fullName: string; email: string; mobile?: string; password: string; adminId?: string | null; department?: string }) => Promise<{ success: boolean; message: string }>;
}

export const CreateMemberModal: React.FC<CreateMemberModalProps> = ({
  isOpen,
  onClose,
  targetRole,
  currentUser,
  admins,
  onCreateAdmin,
  onCreateUser,
}) => {
  if (!isOpen) return null;

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState(targetRole === 'admin' ? 'Operations' : 'Engineering');
  const [assignedAdminId, setAssignedAdminId] = useState(
    currentUser.role === 'admin' ? currentUser.id : admins[0]?.id || ''
  );
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !password) {
      setError('Please fill in all required fields.');
      return;
    }
    setIsSubmitting(true);
    setError('');

    let res;
    if (targetRole === 'admin') {
      res = await onCreateAdmin({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        mobile: mobile.trim(),
        password,
        department: department.trim(),
      });
    } else {
      res = await onCreateUser({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        mobile: mobile.trim(),
        password,
        adminId: currentUser.role === 'admin' ? currentUser.id : assignedAdminId || null,
        department: department.trim(),
      });
    }

    setIsSubmitting(false);
    if (res.success) {
      onClose();
    } else {
      setError(res.message || 'Failed to create member');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              targetRole === 'admin' ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'
            }`}>
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Create New {targetRole === 'admin' ? 'Admin' : 'Team User'}
              </h3>
              <p className="text-xs text-slate-500">
                {targetRole === 'admin'
                  ? 'Works directly under Super Admin authority'
                  : `Supervised by ${currentUser.role === 'admin' ? currentUser.fullName : 'designated Admin'}`}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Marcus Vance"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. marcus@company.com"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Mobile Number
            </label>
            <input
              type="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="e.g. +1 555 123 4567"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Password *
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Secure password"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Department
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Operations"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
              />
            </div>
          </div>

          {targetRole === 'user' && currentUser.role === 'super_admin' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Assign to Supervising Admin *
              </label>
              <select
                value={assignedAdminId}
                onChange={(e) => setAssignedAdminId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
              >
                {admins.map((a) => (
                  <option key={a.id} value={a.id}>
                    Admin: {a.fullName} ({a.department || 'Operations'})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-2 rounded-lg text-sm font-semibold text-white transition shadow-xs ${
                targetRole === 'admin' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {isSubmitting ? 'Creating...' : `Create ${targetRole === 'admin' ? 'Admin' : 'User'}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
