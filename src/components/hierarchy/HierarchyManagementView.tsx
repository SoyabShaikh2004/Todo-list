import React, { useState } from 'react';
import { User, Task } from '../../types';
import {
  ShieldCheck,
  Users,
  UserPlus,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  MoreVertical,
  Building,
  Mail,
  Phone,
  Power,
  Layers,
} from 'lucide-react';

interface HierarchyManagementViewProps {
  currentUser: User;
  superAdmin: User | null;
  admins: User[];
  users: User[];
  tasks: Task[];
  onOpenCreateAdmin: () => void;
  onOpenCreateUser: () => void;
  onReassignUserAdmin: (userId: string, newAdminId: string | null) => Promise<boolean>;
  onToggleUserStatus: (userId: string) => Promise<void>;
  onRefresh: () => void;
}

export const HierarchyManagementView: React.FC<HierarchyManagementViewProps> = ({
  currentUser,
  superAdmin,
  admins,
  users,
  tasks,
  onOpenCreateAdmin,
  onOpenCreateUser,
  onReassignUserAdmin,
  onToggleUserStatus,
  onRefresh,
}) => {
  const isSuperAdmin = currentUser.role === 'super_admin';
  const isAdmin = currentUser.role === 'admin';

  const [selectedUserForReassign, setSelectedUserForReassign] = useState<User | null>(null);
  const [newAdminId, setNewAdminId] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleReassignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForReassign) return;
    setIsProcessing(true);
    await onReassignUserAdmin(selectedUserForReassign.id, newAdminId || null);
    setIsProcessing(false);
    setSelectedUserForReassign(null);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-900 dark:bg-indigo-950 dark:text-indigo-300">
              3-Tier Role Hierarchy
            </span>
            <span className="text-xs text-slate-500">Super Admin → Admin → User</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Organization Hierarchy & Governance</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Enforce role boundaries, manage Admin leadership, assign Users to designated Admins, and govern account activity.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onRefresh}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
            title="Refresh Hierarchy Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          {isSuperAdmin && (
            <button
              onClick={onOpenCreateAdmin}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold bg-amber-600 text-white hover:bg-amber-700 shadow-xs"
            >
              <UserPlus className="w-4 h-4" />
              Create Admin
            </button>
          )}
          {(isSuperAdmin || isAdmin) && (
            <button
              onClick={onOpenCreateUser}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs"
            >
              <UserPlus className="w-4 h-4" />
              Create Team User
            </button>
          )}
        </div>
      </div>

      {/* LEVEL 1: SUPER ADMIN */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300 dark:border-amber-700/60 rounded-xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                  Level 1: Super Admin (1 Unique Account)
                </span>
                <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200">
                  Apex Authority
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {superAdmin?.fullName || 'Soyab Shaikh (Super Admin)'}
              </h3>
            </div>
          </div>
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
            {superAdmin?.email || 'soyxbshxikh@gmail.com'}
          </span>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-400">
          The Super Admin exercises master governance, assigns tasks to Admins, reviews daily submissions, and configures the organizational structure.
        </p>
      </div>

      {/* LEVEL 2: ADMINS AND THEIR USERS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-600" />
            Level 2: Admins & Delegated Teams ({admins.length} Admins)
          </h3>
          <span className="text-xs text-slate-500">Each Admin supervises their assigned Users</span>
        </div>

        <div className="space-y-6">
          {admins.map((admin) => {
            const usersUnderAdmin = users.filter((u) => u.adminId === admin.id);
            const adminTasks = tasks.filter((t) => t.adminId === admin.id || t.assignedToId === admin.id);

            return (
              <div
                key={admin.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4"
              >
                {/* Admin Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold">
                      {admin.fullName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-bold text-slate-900 dark:text-white">{admin.fullName}</h4>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                          Admin
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            admin.status === 'active'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                          }`}
                        >
                          {admin.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        {admin.email} • Department: {admin.department || 'Operations'}
                      </p>
                    </div>
                  </div>

                  {isSuperAdmin && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onToggleUserStatus(admin.id)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                          admin.status === 'active'
                            ? 'bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-950/40 dark:text-red-300'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300'
                        }`}
                      >
                        <Power className="w-3.5 h-3.5" />
                        {admin.status === 'active' ? 'Deactivate Admin' : 'Activate Admin'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Sub-Level 3: Users Under this Admin */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <span>Level 3: Users Assigned To {admin.fullName} ({usersUnderAdmin.length})</span>
                  </div>

                  {usersUnderAdmin.length === 0 ? (
                    <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/40 text-center text-xs text-slate-400">
                      No users assigned to this Admin yet.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {usersUnderAdmin.map((u) => {
                        const userTasks = tasks.filter((t) => t.userId === u.id || t.assignedToId === u.id);
                        const completed = userTasks.filter((t) => t.status === 'completed').length;

                        return (
                          <div
                            key={u.id}
                            className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between gap-3 text-xs"
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900 dark:text-white">{u.fullName}</span>
                                <span
                                  className={`px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                                    u.status === 'active'
                                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                      : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                                  }`}
                                >
                                  {u.status}
                                </span>
                              </div>
                              <p className="text-slate-500">{u.email}</p>
                              <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                                Tasks: {userTasks.length} ({completed} completed) • {u.department || 'General'}
                              </div>
                            </div>

                            {isSuperAdmin && (
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => {
                                    setSelectedUserForReassign(u);
                                    setNewAdminId(u.adminId || '');
                                  }}
                                  className="px-2 py-1 rounded text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100"
                                >
                                  Reassign
                                </button>
                                <button
                                  onClick={() => onToggleUserStatus(u.id)}
                                  className="p-1 rounded text-slate-400 hover:text-red-600"
                                  title="Toggle Active/Inactive"
                                >
                                  <Power className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* UNASSIGNED USERS (Directly under Super Admin or Pending Assignment) */}
        {(() => {
          const unassignedUsers = users.filter((u) => !u.adminId || !admins.some((a) => a.id === u.adminId));
          if (unassignedUsers.length === 0) return null;
          return (
            <div className="bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800/60 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    Unassigned Team Users ({unassignedUsers.length})
                  </h4>
                  <span className="text-xs text-slate-500">
                    Not currently allocated to any Admin
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {unassignedUsers.map((u) => (
                  <div
                    key={u.id}
                    className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white">{u.fullName}</span>
                        <span
                          className={`px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                            u.status === 'active'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                          }`}
                        >
                          {u.status}
                        </span>
                      </div>
                      <p className="text-slate-500">{u.email}</p>
                    </div>
                    {isSuperAdmin && (
                      <button
                        onClick={() => {
                          setSelectedUserForReassign(u);
                          setNewAdminId('');
                        }}
                        className="px-2.5 py-1 rounded text-[11px] font-semibold bg-indigo-600 text-white hover:bg-indigo-700"
                      >
                        Assign to Admin
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })()}
      </div>

      {/* REASSIGN ADMIN MODAL (For Super Admin) */}
      {selectedUserForReassign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-md w-full p-5 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Reassign User to Another Admin
            </h3>
            <p className="text-xs text-slate-500">
              Change the supervising Admin for <strong>{selectedUserForReassign.fullName}</strong>.
            </p>

            <form onSubmit={handleReassignSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Select New Supervising Admin
                </label>
                <select
                  value={newAdminId}
                  onChange={(e) => setNewAdminId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                >
                  <option value="">Unassigned (Direct to Super Admin)</option>
                  {admins.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.fullName} ({a.department || 'Operations'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedUserForReassign(null)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  {isProcessing ? 'Updating...' : 'Confirm Reassignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
