import React from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  FileCheck2,
  Plus,
} from 'lucide-react';
import { ActiveNav } from '../../types';

interface MobileBottomNavProps {
  activeNav: ActiveNav;
  onSelectNav: (nav: ActiveNav) => void;
  onQuickAddTask: () => void;
  todayPendingCount: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeNav,
  onSelectNav,
  onQuickAddTask,
  todayPendingCount,
}) => {
  const navItems: Array<{
    id: ActiveNav;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
  }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    {
      id: 'daily_tasks',
      label: 'Tasks',
      icon: CheckSquare,
      badge: todayPendingCount > 0 ? todayPendingCount : undefined,
    },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'reports', label: 'Report', icon: FileCheck2 },
  ];

  return (
    <nav
      id="mobile-bottom-navigation"
      aria-label="Mobile Bottom Navigation"
      className="md:hidden fixed bottom-0 inset-x-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/90 dark:border-slate-800/90 z-40 px-2 pt-1 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] shadow-lg shadow-slate-900/5 transition-colors"
    >
      <div className="flex items-center justify-around relative max-w-md mx-auto">
        {/* First 2 items (Dashboard, Tasks) */}
        {navItems.slice(0, 2).map((item) => {
          const Icon = item.icon;
          const isActive = activeNav === item.id;
          return (
            <button
              key={item.id}
              type="button"
              id={`mobile-tab-${item.id}`}
              onClick={() => onSelectNav(item.id)}
              className={`flex-1 min-h-[48px] py-1 flex flex-col items-center justify-center relative rounded-xl transition-all cursor-pointer ${
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? 'scale-110 stroke-[2.5]' : 'stroke-2'
                  }`}
                />
                {item.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-4 h-4 px-1 rounded-full bg-amber-500 text-white text-[9px] font-black flex items-center justify-center shadow-xs">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight leading-none">
                {item.label}
              </span>
              {isActive && (
                <span className="w-4 h-0.5 rounded-full bg-indigo-600 dark:bg-indigo-400 mt-0.5" />
              )}
            </button>
          );
        })}

        {/* Prominent Center Action Button (Add Task FAB) */}
        <div className="flex-1 flex flex-col items-center justify-center -mt-5">
          <button
            type="button"
            id="mobile-center-add-task-fab"
            onClick={onQuickAddTask}
            aria-label="Add new daily task"
            className="w-12 h-12 rounded-full bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white flex items-center justify-center shadow-md shadow-indigo-600/30 border-4 border-white dark:border-slate-900 transition-all cursor-pointer"
          >
            <Plus className="w-6 h-6 stroke-[2.75]" />
          </button>
          <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 mt-1 leading-none">
            Add
          </span>
        </div>

        {/* Last 2 items (Calendar, Reports) */}
        {navItems.slice(2, 4).map((item) => {
          const Icon = item.icon;
          const isActive = activeNav === item.id;
          return (
            <button
              key={item.id}
              type="button"
              id={`mobile-tab-${item.id}`}
              onClick={() => onSelectNav(item.id)}
              className={`flex-1 min-h-[48px] py-1 flex flex-col items-center justify-center relative rounded-xl transition-all cursor-pointer ${
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium'
              }`}
            >
              <Icon
                className={`w-5 h-5 transition-transform ${
                  isActive ? 'scale-110 stroke-[2.5]' : 'stroke-2'
                }`}
              />
              <span className="text-[10px] mt-1 tracking-tight leading-none">
                {item.label}
              </span>
              {isActive && (
                <span className="w-4 h-0.5 rounded-full bg-indigo-600 dark:bg-indigo-400 mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
