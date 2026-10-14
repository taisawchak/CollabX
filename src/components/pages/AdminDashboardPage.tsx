import React, { useState } from 'react';
import {
  Users,
  FolderKanban,
  FileText,
  Layers,
  PieChart,
  Activity,
  UserCheck,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface AdminDashboardPageProps {
  navigate: (path: string) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ navigate }) => {
  const {
    currentUser,
    users,
    projects,
    areas,
    papers,
    applications,
    activityLogs,
    refreshUsersFromDatabase,
    showToast,
  } = useApp();

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await refreshUsersFromDatabase();
      showToast(`Database synced: ${res.count} user accounts loaded.`, 'success');
    } catch {
      showToast('Error syncing database.', 'error');
    } finally {
      setIsRefreshing(false);
    }
  };

  if (!currentUser || currentUser.role !== 'admin') {
    return null;
  }

  const totalUsers = users.length;
  const researchersCount = users.filter((u) => u.role === 'researcher' || u.role === 'supervisor').length;
  const studentsCount = users.filter((u) => u.role === 'student').length;
  const areasCount = areas.length;

  const activeProjectsCount = projects.filter((p) => p.status === 'approved' || p.status === 'active').length;
  const pendingProjectsCount = projects.filter((p) => p.status === 'pending').length;
  const rejectedProjectsCount = projects.filter((p) => p.status === 'rejected').length;
  const completedProjectsCount = projects.filter((p) => p.status === 'completed').length;
  const totalProj = projects.length || 1;

  // Format activity logs for live feed
  const displayActivities = (activityLogs || []).slice(0, 6).map((log) => {
    let timeStr = 'Recently';
    try {
      const diffSec = Math.floor((Date.now() - new Date(log.createdAt).getTime()) / 1000);
      if (diffSec < 60) timeStr = 'Just now';
      else if (diffSec < 3600) timeStr = `${Math.floor(diffSec / 60)} mins ago`;
      else if (diffSec < 86400) timeStr = `${Math.floor(diffSec / 3600)} hours ago`;
      else timeStr = `${Math.floor(diffSec / 86400)} days ago`;
    } catch {
      timeStr = 'Recently';
    }

    return {
      id: log.id,
      text: log.details || `${log.userName} performed ${log.action.replace(/_/g, ' ')} on "${log.targetTitle}"`,
      time: timeStr,
      user: log.userName,
    };
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-4 border-b border-[#E3EAF3]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-bold mb-2">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Administrator Control Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0B2A55] tracking-tight">System Overview</h1>
          <p className="text-xs text-[#6B7A90] mt-1">
            Global governance metrics for Port City International University collaboration network
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-3.5 py-2 bg-white border border-[#E3EAF3] hover:bg-slate-50 text-[#0B2A55] text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
            title="Force sync database"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-600' : 'text-slate-600'}`} />
            <span>Sync DB</span>
          </button>
          <button
            onClick={() => navigate('/admin/users')}
            className="px-4 py-2 bg-white border border-[#E3EAF3] hover:bg-slate-50 text-[#0B2A55] text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Manage Users
          </button>
          <button
            onClick={() => navigate('/admin/projects')}
            className="px-4 py-2 bg-[#0B2A55] hover:bg-[#0A1F44] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            Manage Projects
          </button>
        </div>
      </div>

      {/* 4 Stat Cards matching Page 18: Total Users, Researchers, Students, Research Areas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => navigate('/admin/users')}
          className="bg-white p-5 rounded-2xl border border-[#E3EAF3] shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Total Users</span>
            <Users className="w-4 h-4 text-[#0B6BE6]" />
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black text-[#0B2A55]">{totalUsers}</span>
            <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">Active accounts</p>
          </div>
        </div>

        <div
          onClick={() => navigate('/admin/users?role=researcher')}
          className="bg-white p-5 rounded-2xl border border-[#E3EAF3] shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Researchers & Faculty</span>
            <UserCheck className="w-4 h-4 text-[#0E9F6E]" />
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black text-[#0E9F6E]">{researchersCount}</span>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">Supervisors</p>
          </div>
        </div>

        <div
          onClick={() => navigate('/admin/users?role=student')}
          className="bg-white p-5 rounded-2xl border border-[#E3EAF3] shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Students</span>
            <Users className="w-4 h-4 text-purple-600" />
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black text-purple-800">{studentsCount}</span>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">Undergraduates</p>
          </div>
        </div>

        <div
          onClick={() => navigate('/research-areas')}
          className="bg-white p-5 rounded-2xl border border-[#E3EAF3] shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Research Areas</span>
            <Layers className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black text-amber-800">{areasCount}</span>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">50+ Subfields</p>
          </div>
        </div>
      </div>

      {/* Grid: Project Status Donut Chart + Recent Activity Feed matching Page 18 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 5 Cols: Project Status Donut Chart */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-7 rounded-3xl border border-[#E3EAF3] shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-extrabold text-base text-[#0B2A55] flex items-center gap-2">
              <PieChart className="w-4 h-4 text-[#0B6BE6]" />
              <span>Project Status Distribution</span>
            </h3>
            <span className="text-xs font-bold text-slate-400">{projects.length} Total</span>
          </div>

          <div className="flex items-center justify-center py-6">
            <div className="relative w-44 h-44 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" stroke="#0E9F6E" strokeWidth="10" fill="transparent" strokeDasharray="251.2" strokeDashoffset="100" />
                <circle cx="50" cy="50" r="40" stroke="#0B6BE6" strokeWidth="10" fill="transparent" strokeDasharray="251.2" strokeDashoffset="180" className="rotate-90 origin-center" />
                <circle cx="50" cy="50" r="40" stroke="#E53935" strokeWidth="10" fill="transparent" strokeDasharray="251.2" strokeDashoffset="225" className="rotate-180 origin-center" />
              </svg>
              <div className="absolute text-center">
                <span className="text-3xl font-black text-[#0B2A55]">{projects.length}</span>
                <span className="block text-[10px] text-slate-400 font-bold uppercase">Projects</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#0E9F6E]" />
              <span className="text-slate-600 font-medium">
                Active ({activeProjectsCount} · {Math.round((activeProjectsCount / totalProj) * 100)}%)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#0B6BE6]" />
              <span className="text-slate-600 font-medium">
                Pending ({pendingProjectsCount} · {Math.round((pendingProjectsCount / totalProj) * 100)}%)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#E53935]" />
              <span className="text-slate-600 font-medium">
                Rejected ({rejectedProjectsCount} · {Math.round((rejectedProjectsCount / totalProj) * 100)}%)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#FFC83D]" />
              <span className="text-slate-600 font-medium">
                Completed ({completedProjectsCount} · {Math.round((completedProjectsCount / totalProj) * 100)}%)
              </span>
            </div>
          </div>
        </div>

        {/* Right 7 Cols: Recent Activity Logs Feed matching Page 18 */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-7 rounded-3xl border border-[#E3EAF3] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-extrabold text-base text-[#0B2A55] flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#0E9F6E]" />
              <span>Recent Activity Feed</span>
            </h3>
            <span className="text-xs font-bold text-slate-400">Live Logs</span>
          </div>

          <div className="space-y-3">
            {displayActivities.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No activity recorded yet.</p>
            ) : (
              displayActivities.map((act) => (
                <div
                  key={act.id}
                  className="p-3.5 rounded-2xl bg-[#F5F8FC] border border-slate-100 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#0E9F6E]" />
                    <span className="font-medium text-[#0B2A55]">{act.text}</span>
                  </div>
                  <span className="text-[11px] text-slate-400 shrink-0">{act.time}</span>
                </div>
              ))
            )}
          </div>

          <div className="pt-2">
            <button
              onClick={() => navigate('/admin/projects')}
              className="text-xs font-bold text-[#0B6BE6] hover:underline flex items-center gap-1"
            >
              <span>View moderation queue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
