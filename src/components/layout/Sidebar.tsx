import React from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  BarChart3,
  UserCheck,
  LogOut,
  Check,
  Plus
} from 'lucide-react';
import { ActiveNav, User } from '../../types';

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
  const navItems = [
    { id: 'dashboard' as ActiveNav, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'daily_tasks' as ActiveNav, label: 'Daily Tasks', icon: CheckSquare, badge: todayPendingCount > 0 ? todayPendingCount : undefined },
    { id: 'calendar' as ActiveNav, label: 'Calendar', icon: Calendar },
    { id: 'reports' as ActiveNav, label: 'Reports', icon: BarChart3 },
    { id: 'profile' as ActiveNav, label: 'Profile', icon: UserCheck },
  ];

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-white border-r border-slate-200/80 z-30">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-100 gap-3">
        <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
          <Check className="w-5 h-5 stroke-[3]" />
        </div>
        <div>
          <span className="text-base font-bold text-slate-900 tracking-tight block">TaskFlow</span>
          <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400 block -mt-0.5">Daily Planner</span>
        </div>
      </div>

      {/* Quick Action */}
      <div className="px-4 pt-5 pb-3">
        <button
          type="button"
          id="sidebar-add-task-btn"
          onClick={onQuickAddTask}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm shadow-indigo-200 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Task</span>
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
                  ? 'bg-indigo-50 text-indigo-700 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom User Profile Card & Logout */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl">
          <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm flex items-center justify-center shrink-0 border border-indigo-200">
            {user.fullName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-800 truncate">{user.fullName}</p>
            <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
          </div>
        </div>

        <button
          type="button"
          id="sidebar-logout-button"
          onClick={onLogout}
          className="mt-2 w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition cursor-pointer"
        >
          <LogOut className="w-4 h-4 text-rose-500" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};
