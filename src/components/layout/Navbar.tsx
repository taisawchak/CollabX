import React, { useState } from 'react';
import {
  Search,
  Bell,
  Menu,
  X,
  User as UserIcon,
  LogOut,
  FolderKanban,
  FileText,
  Sparkles,
  Settings,
  ChevronDown,
  LayoutDashboard,
  Bookmark,
  Users,
  Check,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface NavbarProps {
  currentPath: string;
  navigate: (path: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, navigate }) => {
  const { currentUser, logout, notifications, markNotificationsRead, markNotificationAsRead, setIsGlobalSearchOpen } = useApp();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const userNotifs = currentUser ? notifications.filter((n) => n.userId === currentUser.id) : [];
  const unreadCount = userNotifs.filter((n) => !n.isRead).length;

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Research Areas', path: '/research-areas' },
    { label: 'Projects', path: '/projects' },
    { label: 'Papers', path: '/papers' },
    { label: 'AI Writer', path: '/ai-writer', badge: 'AI' },
    { label: 'About', path: '/about' },
  ];

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    navigate('/');
  };

  const getDashboardPath = () => {
    if (!currentUser) return '/login';
    if (currentUser.role === 'admin') return '/admin';
    if (currentUser.role === 'supervisor' || currentUser.role === 'researcher') return '/researcher';
    return '/dashboard';
  };

  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E3EAF3] shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Brand Logo */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 group cursor-pointer focus:outline-hidden"
            >
              <div className="relative w-8 h-8 rounded-full overflow-hidden border-[2.5px] border-[#0B2A55] shadow-xs flex flex-col transition-transform group-hover:scale-105">
                <div className="h-1/2 bg-[#E53935]" />
                <div className="h-1/2 bg-white" />
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[2.5px] bg-[#0B2A55]" />
                <div className="absolute inset-0 m-auto w-3 h-3 rounded-full bg-white border-[2.5px] border-[#0B2A55] flex items-center justify-center">
                  <div className="w-1 h-1 rounded-full bg-white" />
                </div>
              </div>
              <span className="font-black text-2xl tracking-tight text-[#0B2A55]">
                Collab<span className="text-[#FFC83D]">X</span>
              </span>
            </button>

            {/* Desktop Center Nav Links matching screenshot */}
            <div className="hidden md:flex items-center gap-6 lg:gap-8 ml-6">
              {[
                { label: 'Home', path: '/' },
                { label: 'Research Areas', path: '/research-areas' },
                { label: 'Projects', path: '/projects' },
                { label: 'About', path: '/about' },
              ].map((link) => {
                const isActive = currentPath === link.path;
                return (
                  <button
                    key={link.path}
                    onClick={() => navigate(link.path)}
                    className={`text-sm font-medium transition-colors cursor-pointer ${
                      isActive
                        ? 'text-[#0B6BE6] font-bold'
                        : 'text-[#0B2A55] hover:text-[#0B6BE6]'
                    }`}
                  >
                    {link.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Action Icons & Auth */}
          <div className="flex items-center gap-4">
            {/* Search Icon */}
            <button
              onClick={() => setIsGlobalSearchOpen(true)}
              className="p-1.5 text-slate-600 hover:text-[#0B2A55] transition-colors cursor-pointer"
              title="Search (Ctrl+K)"
            >
              <Search className="w-5 h-5" />
            </button>

            {currentUser ? (
              <div className="flex items-center gap-3">
                {/* Notification Bell & Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setIsNotifDropdownOpen(!isNotifDropdownOpen);
                      setIsUserMenuOpen(false);
                    }}
                    className="relative p-2 rounded-full text-[#6B7A90] hover:text-[#0B2A55] hover:bg-slate-100 transition-colors cursor-pointer"
                    title="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#E53935] text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {isNotifDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-[#E3EAF3] py-2 z-30 animate-in fade-in-50 zoom-in-95">
                      <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-[#0B2A55]">Notifications</span>
                          {unreadCount > 0 && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-[#E53935]">
                              {unreadCount} unread
                            </span>
                          )}
                        </div>
                        {unreadCount > 0 && (
                          <button
                            onClick={() => markNotificationsRead()}
                            className="text-[11px] font-bold text-[#0B6BE6] hover:underline cursor-pointer"
                          >
                            Mark all as read
                          </button>
                        )}
                      </div>

                      <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                        {userNotifs.length === 0 ? (
                          <div className="p-6 text-center text-xs text-slate-400">
                            No notifications yet
                          </div>
                        ) : (
                          userNotifs.slice(0, 5).map((n) => (
                            <div
                              key={n.id}
                              onClick={() => {
                                markNotificationAsRead(n.id);
                                setIsNotifDropdownOpen(false);
                                navigate(n.link);
                              }}
                              className={`p-3.5 hover:bg-slate-50 transition-colors cursor-pointer flex items-start gap-3 ${
                                !n.isRead ? 'bg-blue-50/20' : ''
                              }`}
                            >
                              <span
                                className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                                  !n.isRead ? 'bg-[#0B6BE6]' : 'bg-transparent'
                                }`}
                              />
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold text-[#0B2A55] line-clamp-1">{n.title}</p>
                                <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{n.body}</p>
                                <span className="text-[10px] text-slate-400 mt-1 block">
                                  {new Date(n.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      <div className="px-4 py-2 border-t border-slate-100 text-center">
                        <button
                          onClick={() => {
                            setIsNotifDropdownOpen(false);
                            navigate('/notifications');
                          }}
                          className="text-xs font-bold text-[#0B6BE6] hover:underline cursor-pointer w-full py-1"
                        >
                          View all notifications →
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* User Avatar & Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 p-1 pl-2 rounded-full hover:bg-slate-100 transition-colors cursor-pointer border border-[#E3EAF3]"
                  >
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-7 h-7 rounded-full object-cover border border-slate-200"
                    />
                    <span className="hidden lg:block text-xs font-semibold text-[#0B2A55] max-w-[100px] truncate">
                      {currentUser.name.split(' ')[0]}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-[#6B7A90]" />
                  </button>

                  {/* Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div
                      className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-[#E3EAF3] py-2 z-50 animate-in fade-in slide-in-from-top-2"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <div className="px-4 py-2 border-b border-[#E3EAF3]">
                        <p className="text-sm font-bold text-[#0B2A55] truncate">{currentUser.name}</p>
                        <p className="text-xs text-[#6B7A90] truncate">{currentUser.email}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-semibold rounded-full bg-[#DCE6FB] text-[#0B6BE6] capitalize">
                          {currentUser.role}
                        </span>
                      </div>

                      <div className="py-1">
                        <button
                          onClick={() => navigate(getDashboardPath())}
                          className="w-full px-4 py-2 text-left text-xs text-[#0B2A55] hover:bg-[#F5F8FC] flex items-center gap-2"
                        >
                          <LayoutDashboard className="w-4 h-4 text-[#0B6BE6]" />
                          Dashboard
                        </button>
                        <button
                          onClick={() => navigate('/profile')}
                          className="w-full px-4 py-2 text-left text-xs text-[#0B2A55] hover:bg-[#F5F8FC] flex items-center gap-2"
                        >
                          <UserIcon className="w-4 h-4 text-[#0E9F6E]" />
                          Profile
                        </button>
                        {currentUser.role === 'student' && (
                          <>
                            <button
                              onClick={() => navigate('/applications')}
                              className="w-full px-4 py-2 text-left text-xs text-[#0B2A55] hover:bg-[#F5F8FC] flex items-center gap-2"
                            >
                              <FolderKanban className="w-4 h-4 text-[#FFC83D]" />
                              My Applications
                            </button>
                            <button
                              onClick={() => navigate('/saved')}
                              className="w-full px-4 py-2 text-left text-xs text-[#0B2A55] hover:bg-[#F5F8FC] flex items-center gap-2"
                            >
                              <Bookmark className="w-4 h-4 text-[#E53935]" />
                              Saved Projects
                            </button>
                          </>
                        )}
                        {(currentUser.role === 'supervisor' || currentUser.role === 'researcher') && (
                          <button
                            onClick={() => navigate('/projects/new')}
                            className="w-full px-4 py-2 text-left text-xs text-[#0B2A55] hover:bg-[#F5F8FC] flex items-center gap-2"
                          >
                            <Sparkles className="w-4 h-4 text-[#0B6BE6]" />
                            Publish Project
                          </button>
                        )}
                        {currentUser.role === 'admin' && (
                          <button
                            onClick={() => navigate('/admin/users')}
                            className="w-full px-4 py-2 text-left text-xs text-[#0B2A55] hover:bg-[#F5F8FC] flex items-center gap-2"
                          >
                            <Users className="w-4 h-4 text-[#0E9F6E]" />
                            Manage Users
                          </button>
                        )}
                        <button
                          onClick={() => navigate('/calendar')}
                          className="w-full px-4 py-2 text-left text-xs text-[#0B2A55] hover:bg-[#F5F8FC] flex items-center gap-2"
                        >
                          <Settings className="w-4 h-4 text-slate-500" />
                          Calendar & Deadlines
                        </button>
                      </div>

                      <div className="border-t border-[#E3EAF3] pt-1 mt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full px-4 py-2 text-left text-xs text-[#E53935] hover:bg-red-50 flex items-center gap-2"
                        >
                          <LogOut className="w-4 h-4" />
                          Log Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 sm:gap-2.5">
                <button
                  onClick={() => navigate('/login')}
                  className={`px-4 sm:px-5 py-2 text-sm font-bold rounded-xl transition-colors cursor-pointer ${
                    currentPath.startsWith('/login')
                      ? 'bg-[#0B2A55] text-white shadow-xs'
                      : 'text-white bg-[#0B6BE6] hover:bg-blue-600 shadow-xs'
                  }`}
                >
                  Login
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className={`hidden sm:inline-flex px-4 py-2 text-sm font-bold rounded-xl transition-colors cursor-pointer ${
                    currentPath.startsWith('/register')
                      ? 'bg-[#0B2A55] text-white shadow-xs'
                      : 'text-[#0B6BE6] border border-[#0B6BE6] hover:bg-blue-50'
                  }`}
                >
                  Sign Up
                </button>
              </div>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-[#6B7A90] hover:text-[#0B2A55] focus:outline-hidden"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Offcanvas Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-[#E3EAF3] px-4 pt-2 pb-4 space-y-1 animate-in slide-in-from-top duration-200">
          {navLinks.map((link) => (
            <button
              key={link.path}
              onClick={() => {
                navigate(link.path);
                setIsMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${
                currentPath === link.path
                  ? 'text-[#0B6BE6] bg-[#DCE6FB]/50 font-bold'
                  : 'text-[#6B7A90] hover:bg-slate-50'
              }`}
            >
              {link.label}
            </button>
          ))}
          {!currentUser && (
            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => {
                  navigate('/login');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full py-2 text-center text-sm font-semibold text-white bg-[#0B6BE6] rounded-lg"
              >
                Login
              </button>
              <button
                onClick={() => {
                  navigate('/register');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full py-2 text-center text-sm font-semibold text-[#0B6BE6] border border-[#0B6BE6] rounded-lg"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
