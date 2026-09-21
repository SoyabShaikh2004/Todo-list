import React, { useState } from 'react';
import {
  Menu,
  X,
  LayoutDashboard,
  CheckSquare,
  Calendar,
  FileCheck2,
  UserCheck,
  Database,
  LogOut,
  Plus,
  Check,
  Sun,
  Moon,
  ShieldCheck,
  Users,
  FileText,
  Download,
  Loader2,
} from 'lucide-react';
import { ActiveNav, User } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { generateProjectDocumentationPDF } from '../../utils/projectDocsPdfGenerator';

interface MobileNavProps {
  activeNav: ActiveNav;
  onSelectNav: (nav: ActiveNav) => void;
  user: User;
  onLogout: () => void;
  onQuickAddTask: () => void;
  todayPendingCount: number;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  activeNav,
  onSelectNav,
  user,
  onLogout,
  onQuickAddTask,
  todayPendingCount,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isGeneratingDocs, setIsGeneratingDocs] = useState(false);
  const { theme, toggleTheme } = useTheme();

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
      label: isSuperAdmin ? 'All Tasks Matrix' : isAdmin ? 'Team & Directives' : 'Daily Tasks',
      icon: CheckSquare,
      badge: todayPendingCount > 0 ? todayPendingCount : undefined,
    },
    ...(isSuperAdmin || isAdmin
      ? [
          {
            id: 'hierarchy' as ActiveNav,
            label: isSuperAdmin ? 'Hierarchy & Admins' : 'Team Members',
            icon: Users,
          },
        ]
      : []),
    { id: 'calendar' as ActiveNav, label: 'Calendar View', icon: Calendar },
    {
      id: 'reports' as ActiveNav,
      label: isSuperAdmin ? 'Reports Feed' : isAdmin ? 'Team Reports' : 'Daily Work Report',
      icon: FileCheck2,
    },
    ...(isDbAdmin ? [{ id: 'database' as ActiveNav, label: 'Cloud SQL DB', icon: Database }] : []),
    { id: 'profile' as ActiveNav, label: 'Profile & Settings', icon: UserCheck },
  ];

  const handleSelect = (nav: ActiveNav) => {
    onSelectNav(nav);
    setIsOpen(false);
  };

  return (
    <header className="md:hidden sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="flex items-center justify-between px-3.5 sm:px-4 h-16">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            id="mobile-menu-button"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle navigation menu"
            className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Check className="w-4 h-4 stroke-[3]" />
            </div>
            <div>
              <span className="font-bold text-slate-900 dark:text-white text-base leading-none block">TaskFlow</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-none block mt-0.5">
                {user.role === 'super_admin' ? 'Super Admin' : user.role === 'admin' ? 'Admin Lead' : 'Team User'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            id="mobile-theme-toggle-quick-btn"
            onClick={toggleTheme}
            aria-label="Toggle theme mode"
            className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600 dark:text-slate-300" />}
          </button>

          <button
            type="button"
            id="mobile-header-profile-btn"
            onClick={() => handleSelect('profile')}
            aria-label="Open Profile & Settings"
            className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-sm flex items-center justify-center border border-indigo-200 dark:border-indigo-800 active:scale-95 transition cursor-pointer"
          >
            {user.fullName.charAt(0).toUpperCase()}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white dark:bg-slate-900 shadow-xl z-10 border-r border-slate-100 dark:border-slate-800">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                  <Check className="w-5 h-5 stroke-[3]" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white text-sm">TaskFlow</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 capitalize">{user.role.replace('_', ' ')}</p>
                </div>
              </div>
              <button
                type="button"
                id="close-mobile-menu"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeNav === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    id={`mobile-nav-${item.id}`}
                    onClick={() => handleSelect(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition cursor-pointer ${
                      isActive
                        ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* System Documentation PDF Download (Super Admin only) */}
            {isSuperAdmin && (
              <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  id="mobile-download-docs-pdf-btn"
                  onClick={handleDownloadDocsPDF}
                  disabled={isGeneratingDocs}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50/80 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-950/80 border border-indigo-200/70 dark:border-indigo-800/70 transition cursor-pointer disabled:opacity-60"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {isGeneratingDocs ? (
                      <Loader2 className="w-4 h-4 animate-spin text-indigo-600 dark:text-indigo-400" />
                    ) : (
                      <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    )}
                    <span className="truncate">{isGeneratingDocs ? 'Building PDF...' : 'System Docs (PDF)'}</span>
                  </div>
                  <Download className="w-3.5 h-3.5 text-indigo-500 shrink-0 ml-1" />
                </button>
              </div>
            )}

            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-sm flex items-center justify-center border border-indigo-200 dark:border-indigo-800">
                  {user.fullName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{user.fullName}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                </div>
              </div>

              <button
                type="button"
                id="mobile-logout-button"
                onClick={() => {
                  setIsOpen(false);
                  onLogout();
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 transition cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
