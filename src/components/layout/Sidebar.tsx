import React, { useState } from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  FileCheck2,
  UserCheck,
  Database,
  LogOut,
  Check,
  Plus,
  Sun,
  Moon,
  ShieldCheck,
  Users,
  Layers,
  FileText,
  Download,
  Loader2,
} from 'lucide-react';
import { ActiveNav, User } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { generateProjectDocumentationPDF } from '../../utils/projectDocsPdfGenerator';

interface SidebarProps {
  activeNav: ActiveNav;
  onSelectNav: (nav: ActiveNav) => void;
  user: User;
  onLogout: () => void;
  onQuickAddTask: () => void;
  todayPendingCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeNav,
  onSelectNav,
  user,
  onLogout,
  onQuickAddTask,
  todayPendingCount,
}) => {
  const { theme, toggleTheme } = useTheme();
  const [isGeneratingDocs, setIsGeneratingDocs] = useState(false);

  const handleDownloadDocsPDF = () => {
    try {
      setIsGeneratingDocs(true);
      const doc = generateProjectDocumentationPDF();
      doc.save('TaskFlow-Enterprise-Architecture-Documentation.pdf');
    } catch (err) {
      console.error('Failed to generate project docs PDF:', err);
    } finally {
      setTimeout(() => setIsGeneratingDocs(false), 800);
    }
  };

  const isSuperAdmin = user.role === 'super_admin';
  const isAdmin = user.role === 'admin';
  const isDbAdmin =
    isSuperAdmin ||
    user.email.toLowerCase() === 'soyxbshxikh@gmail.com' ||
    user.email.toLowerCase() === 'soyabdzyrisinfotech@gmail.com';

  const navItems = [
    {
      id: 'dashboard' as ActiveNav,
      label: isSuperAdmin ? 'Command Center' : isAdmin ? 'Admin Dashboard' : 'My Workspace',
      icon: LayoutDashboard,
    },
    {
      id: 'daily_tasks' as ActiveNav,
      label: isSuperAdmin ? 'All Tasks Matrix' : isAdmin ? 'Team & Directives' : 'My Daily Tasks',
      icon: CheckSquare,
      badge: todayPendingCount > 0 ? todayPendingCount : undefined,
    },
    ...(isSuperAdmin || isAdmin
      ? [
          {
            id: 'hierarchy' as ActiveNav,
            label: isSuperAdmin ? 'Hierarchy & Admins' : 'My Team Members',
            icon: Users,
          },
        ]
      : []),
    { id: 'calendar' as ActiveNav, label: 'Calendar View', icon: Calendar },
    {
      id: 'reports' as ActiveNav,
      label: isSuperAdmin ? 'Daily Reports Feed' : isAdmin ? 'Team Reports' : 'Daily Work Report',
      icon: FileCheck2,
    },
    ...(isDbAdmin ? [{ id: 'database' as ActiveNav, label: 'Cloud SQL DB', icon: Database }] : []),
    { id: 'profile' as ActiveNav, label: 'Profile & Settings', icon: UserCheck },
  ];

  const getRoleBadge = () => {
    if (user.role === 'super_admin') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300">
          <ShieldCheck className="w-3 h-3 text-amber-600 dark:text-amber-400" />
          Super Admin
        </span>
      );
    }
    if (user.role === 'admin') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-900 dark:bg-indigo-950 dark:text-indigo-300">
          <ShieldCheck className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
          Admin
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-300">
        Team User
      </span>
    );
  };

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 z-30 transition-colors">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100 dark:border-slate-800 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
            <Check className="w-5 h-5 stroke-[3]" />
          </div>
          <div>
            <span className="text-base font-bold text-slate-900 dark:text-white tracking-tight block">TaskFlow</span>
            <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500 block -mt-0.5">Enterprise RBAC</span>
          </div>
        </div>

        <button
          type="button"
          id="sidebar-theme-toggle-quick-btn"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>
      </div>

      {/* Quick Action */}
      <div className="px-4 pt-5 pb-3">
        <button
          type="button"
          id="sidebar-add-task-btn"
          onClick={onQuickAddTask}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Assign Task</span>
        </button>
      </div>

      {/* Nav List */}
      <nav className="flex-1 px-3 space-y-1.5 overflow-y-auto pt-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeNav === item.id;
          return (
            <button
              key={item.id}
              type="button"
              id={`sidebar-nav-${item.id}`}
              onClick={() => onSelectNav(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer ${
                isActive
                  ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* System Documentation PDF Download (Super Admin only) */}
      {isSuperAdmin && (
        <div className="px-3 py-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            id="sidebar-download-docs-pdf-btn"
            onClick={handleDownloadDocsPDF}
            disabled={isGeneratingDocs}
            title="Download complete project architecture, workflow diagrams & technical documentation as PDF"
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50/80 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-950/80 border border-indigo-200/70 dark:border-indigo-800/70 transition cursor-pointer disabled:opacity-60"
          >
            <div className="flex items-center gap-2 min-w-0">
              {isGeneratingDocs ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600 dark:text-indigo-400" />
              ) : (
                <FileText className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              )}
              <span className="truncate">{isGeneratingDocs ? 'Building PDF...' : 'System Docs (PDF)'}</span>
            </div>
            <Download className="w-3 h-3 text-indigo-500 shrink-0 ml-1" />
          </button>
        </div>
      )}

      {/* Bottom User Profile Card & Logout */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl">
          <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-bold text-sm flex items-center justify-center shrink-0 border border-indigo-200 dark:border-indigo-800">
            {user.fullName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{user.fullName}</p>
            </div>
            <div className="mt-0.5">{getRoleBadge()}</div>
          </div>
        </div>

        <button
          type="button"
          id="sidebar-logout-button"
          onClick={onLogout}
          className="mt-2 w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer"
        >
          <LogOut className="w-4 h-4 text-rose-500 dark:text-rose-400" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};
