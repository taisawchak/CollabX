import React from 'react';
import {
  LayoutDashboard,
  FolderKanban,
  Bookmark,
  Users,
  Bell,
  Calendar,
  Settings,
  Sparkles,
  FileText,
  MessageSquare,
  ShieldAlert,
  BarChart2,
  TrendingUp,
  UserCheck,
  GraduationCap,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface SidebarProps {
  currentPath: string;
  navigate: (path: string) => void;
  projectId?: string;
  context?: 'project_workspace' | 'default';
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPath, navigate, projectId, context }) => {
  const { currentUser, notifications } = useApp();
  if (!currentUser) return null;

  const unreadCount = notifications.filter((n) => n.userId === currentUser.id && !n.isRead).length;

  // Determine items based on user role and context
  const role = currentUser.role;

  const getMenuItems = () => {
    // If in project workspace context (Pages 13, 14, 15)
    if (context === 'project_workspace' || currentPath.includes('/projects/') && (currentPath.includes('/discussion') || currentPath.includes('/progress') || currentPath.includes('/team'))) {
      const pId = projectId || 'proj-1';
      return [
        { label: 'Overview', path: `/projects/${pId}`, icon: LayoutDashboard },
        { label: 'Progress', path: `/projects/${pId}/progress`, icon: TrendingUp },
        { label: 'Discussion', path: `/projects/${pId}/discussion`, icon: MessageSquare },
        { label: 'Team Members', path: `/projects/${pId}/team`, icon: Users },
        { label: 'Files', path: `/projects/${pId}?tab=files`, icon: FileText },
        { label: 'Back to My Projects', path: '/my-projects', icon: FolderKanban },
      ];
    }

    if (role === 'admin') {
      return [
        { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
        { label: 'Manage Users', path: '/admin/users', icon: Users },
        { label: 'Manage Projects', path: '/admin/projects', icon: FolderKanban },
        { label: 'Research Areas', path: '/research-areas', icon: BarChart2 },
        { label: 'All Papers', path: '/papers', icon: FileText },
        { label: 'Contact Inquiries', path: '/contact', icon: MessageSquare },
        { label: 'Site Settings', path: '/settings', icon: Settings },
      ];
    }

    if (role === 'supervisor' || role === 'researcher') {
      return [
        { label: 'Dashboard', path: '/researcher', icon: LayoutDashboard },
        { label: 'My Projects', path: '/my-projects', icon: FolderKanban },
        { label: 'Applications', path: '/researcher#applications', icon: UserCheck },
        { label: 'Publish Project', path: '/projects/new', icon: Sparkles },
        { label: 'Research Papers', path: '/papers', icon: FileText },
        { label: 'AI Paper Writer', path: '/ai-writer', icon: Sparkles, badge: 'AI' },
        { label: 'Calendar', path: '/calendar', icon: Calendar },
        { label: 'Notifications', path: '/notifications', icon: Bell, badgeCount: unreadCount },
        { label: 'Profile', path: '/profile', icon: GraduationCap },
      ];
    }

    // Default Student role (Pages 7, 8, 9, 10, 11, 16, 17)
    return [
      { label: 'Welcome', path: '/dashboard', icon: LayoutDashboard },
      { label: 'My Applications', path: '/applications', icon: FolderKanban },
      { label: 'Saved Projects', path: '/saved', icon: Bookmark },
      { label: 'My Projects', path: '/my-projects', icon: Users },
      { label: 'Research Papers', path: '/papers', icon: FileText },
      { label: 'AI Paper Writer', path: '/ai-writer', icon: Sparkles, badge: 'AI' },
      { label: 'Notifications', path: '/notifications', icon: Bell, badgeCount: unreadCount },
      { label: 'Calendar', path: '/calendar', icon: Calendar },
      { label: 'Profile', path: '/profile', icon: GraduationCap },
    ];
  };

  const menuItems = getMenuItems();

  const getActiveStyle = (path: string) => {
    const isActive = currentPath === path || (path !== '/' && currentPath.startsWith(path) && path.length > 5);

    if (!isActive) {
      return 'text-[#6B7A90] hover:text-[#0B2A55] hover:bg-slate-100/70';
    }

    // Screenshot match:
    // Green highlight for Welcome dashboard, Notifications, Calendar, Admin dashboard
    if (
      path === '/dashboard' ||
      path === '/admin' ||
      path === '/researcher' ||
      path === '/notifications' ||
      path === '/calendar'
    ) {
      return 'bg-[#0E9F6E] text-white shadow-xs font-semibold';
    }

    // Solid blue for My Applications, Saved, My Projects
    if (path === '/applications' || path === '/saved' || path === '/my-projects') {
      return 'bg-[#0B6BE6] text-white shadow-xs font-semibold';
    }

    // Progress page: teal gradient
    if (path.includes('/progress')) {
      return 'bg-linear-to-r from-teal-500 to-emerald-500 text-white shadow-xs font-semibold';
    }

    // Team members: pale blue
    if (path.includes('/team')) {
      return 'bg-[#DCE6FB] text-[#0B6BE6] font-semibold border-l-4 border-[#0B6BE6]';
    }

    // Manage projects: navy
    if (path === '/admin/projects') {
      return 'bg-[#0B2A55] text-white shadow-xs font-semibold';
    }

    // Default active: blue
    return 'bg-[#0B6BE6] text-white shadow-xs font-semibold';
  };

  return (
    <aside className="w-64 shrink-0 bg-white border-r border-[#E3EAF3] min-h-[calc(100vh-4rem)] flex flex-col justify-between p-4 hidden md:flex">
      <div>
        {/* Navigation Items */}
        <div className="space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const activeClass = getActiveStyle(item.path);

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm transition-all cursor-pointer ${activeClass}`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-full bg-linear-to-r from-amber-400 to-orange-500 text-white">
                    {item.badge}
                  </span>
                )}
                {item.badgeCount !== undefined && item.badgeCount > 0 && (
                  <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-[#E53935] text-white">
                    {item.badgeCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Profile Mini Card */}
      {currentUser && (
        <div className="mt-8 pt-4 border-t border-[#E3EAF3]">
          <div
            onClick={() => navigate('/profile')}
            className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-10 h-10 rounded-full object-cover border border-[#E3EAF3]"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-[#0B2A55] truncate">{currentUser.name}</p>
              <p className="text-[11px] text-[#6B7A90] capitalize truncate">{currentUser.role} · PCIU</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
