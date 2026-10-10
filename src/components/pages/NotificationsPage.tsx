import React, { useState } from 'react';
import {
  Bell,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Clock,
  Sparkles,
  UserPlus,
  FileText,
  Trash2,
  Check,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Notification } from '../../types';

interface NotificationsPageProps {
  navigate: (path: string) => void;
}

export const NotificationsPage: React.FC<NotificationsPageProps> = ({ navigate }) => {
  const { currentUser, notifications, markNotificationsRead, markNotificationAsRead, deleteNotification } = useApp();

  if (!currentUser) {
    return null;
  }

  const [tab, setTab] = useState<'all' | 'unread' | 'read'>('all');

  const userNotifications = notifications.filter((n) => n.userId === currentUser.id);
  const unreadCount = userNotifications.filter((n) => !n.isRead).length;
  const readCount = userNotifications.filter((n) => n.isRead).length;

  const filtered = userNotifications.filter((n) => {
    if (tab === 'unread') return !n.isRead;
    if (tab === 'read') return n.isRead;
    return true;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'approved':
        return (
          <div className="w-10 h-10 rounded-2xl bg-[#DDF5EA] text-[#0E9F6E] flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        );
      case 'rejected':
        return (
          <div className="w-10 h-10 rounded-2xl bg-[#FDE3E3] text-[#E53935] flex items-center justify-center shrink-0">
            <XCircle className="w-5 h-5" />
          </div>
        );
      case 'message':
        return (
          <div className="w-10 h-10 rounded-2xl bg-[#DCE6FB] text-[#0B6BE6] flex items-center justify-center shrink-0">
            <MessageSquare className="w-5 h-5" />
          </div>
        );
      case 'deadline':
        return (
          <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
        );
      case 'paper':
        return (
          <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
        );
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      {/* Header & Actions matching Page 16 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E3EAF3]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0B2A55] tracking-tight">Notifications</h1>
          <p className="text-xs text-[#6B7A90] mt-1">Updates on applications, lab messages, milestone dates, and publications</p>
        </div>

        <button
          onClick={markNotificationsRead}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-[#0B2A55] text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Check className="w-3.5 h-3.5" />
          <span>Mark all as read</span>
        </button>
      </div>

      {/* Tabs matching Page 16: All (10) · Unread (3) · Read */}
      <div className="flex items-center gap-2 border-b border-[#E3EAF3] pb-2 text-xs">
        <button
          onClick={() => setTab('all')}
          className={`px-4 py-2 rounded-xl font-bold transition-colors cursor-pointer ${
            tab === 'all'
              ? 'bg-[#0E9F6E] text-white shadow-xs'
              : 'bg-white border border-[#E3EAF3] text-[#0B2A55] hover:bg-slate-50'
          }`}
        >
          All ({userNotifications.length})
        </button>
        <button
          onClick={() => setTab('unread')}
          className={`px-4 py-2 rounded-xl font-bold transition-colors cursor-pointer ${
            tab === 'unread'
              ? 'bg-[#0E9F6E] text-white shadow-xs'
              : 'bg-white border border-[#E3EAF3] text-[#0B2A55] hover:bg-slate-50'
          }`}
        >
          Unread ({unreadCount})
        </button>
        <button
          onClick={() => setTab('read')}
          className={`px-4 py-2 rounded-xl font-bold transition-colors cursor-pointer ${
            tab === 'read'
              ? 'bg-[#0E9F6E] text-white shadow-xs'
              : 'bg-white border border-[#E3EAF3] text-[#0B2A55] hover:bg-slate-50'
          }`}
        >
          Read ({readCount})
        </button>
      </div>

      {/* Notifications List matching Page 16 cards */}
      {filtered.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-3xl border border-[#E3EAF3] space-y-3">
          <Bell className="w-12 h-12 text-slate-300 mx-auto" />
          <h4 className="text-base font-bold text-[#0B2A55]">No notifications in this view</h4>
          <p className="text-xs text-slate-500">You are completely up to date with your research notices.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-[#E3EAF3] shadow-xs divide-y divide-slate-100 overflow-hidden">
          {filtered.map((n) => (
            <div
              key={n.id}
              onClick={() => {
                markNotificationAsRead(n.id);
                navigate(n.link);
              }}
              className={`p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors cursor-pointer ${
                !n.isRead ? 'bg-blue-50/20' : ''
              }`}
            >
              <div className="flex items-center gap-4 min-w-0">
                {getIcon(n.type)}
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-sm text-[#0B2A55] truncate">{n.title}</h4>
                    {!n.isRead && (
                      <span className="w-2 h-2 rounded-full bg-[#0B6BE6] shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-[#6B7A90] line-clamp-1">{n.body}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="text-[11px] text-slate-400">
                  {new Date(n.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(n.id);
                  }}
                  className="p-1.5 text-slate-300 hover:text-red-500 rounded-lg cursor-pointer"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
