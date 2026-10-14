import React, { useState, useEffect } from 'react';
import {
  FolderKanban,
  Search,
  CheckCircle2,
  XCircle,
  Eye,
  Edit2,
  Trash2,
  Plus,
  ArrowRight,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Project } from '../../types';

interface AdminManageProjectsPageProps {
  navigate: (path: string) => void;
}

export const AdminManageProjectsPage: React.FC<AdminManageProjectsPageProps> = ({ navigate }) => {
  const {
    currentUser,
    projects,
    approveProjectByAdmin,
    rejectProjectByAdmin,
    deleteProject,
    refreshUsersFromDatabase,
    showToast,
  } = useApp();

  if (!currentUser || currentUser.role !== 'admin') {
    return null;
  }

  const [tab, setTab] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshUsersFromDatabase();
      showToast('Database synced: Projects and users up to date.', 'success');
    } catch {
      showToast('Error syncing database.', 'error');
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    handleRefresh();
  }, []);

  const pendingCount = projects.filter((p) => p.status === 'pending').length;
  const approvedCount = projects.filter((p) => p.status === 'approved' || p.status === 'active').length;
  const rejectedCount = projects.filter((p) => p.status === 'rejected').length;

  const filteredProjects = projects.filter((p) => {
    if (tab === 'pending') return p.status === 'pending';
    if (tab === 'approved') return p.status === 'approved' || p.status === 'active';
    if (tab === 'rejected') return p.status === 'rejected';
    if (searchQuery.trim()) {
      return (
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.areaName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.supervisor.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return true;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header & Add Project matching Page 19 */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-4 border-b border-[#E3EAF3]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0B2A55] tracking-tight">Manage Projects</h1>
          <p className="text-xs text-[#6B7A90] mt-1">Review research submissions, moderate project status, and audit labs</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects..."
              className="w-full bg-white border border-[#E3EAF3] text-xs pl-9 pr-3 py-2 rounded-xl text-[#0B2A55]"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2.5 bg-white border border-[#E3EAF3] hover:bg-slate-50 text-[#0B2A55] rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
            title="Force sync database"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-600' : 'text-slate-600'}`} />
            <span className="hidden sm:inline font-bold text-xs">Sync DB</span>
          </button>

          <button
            onClick={() => navigate('/projects/new')}
            className="px-4 py-2 bg-[#0B6BE6] hover:bg-blue-600 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Project</span>
          </button>
        </div>
      </div>

      {/* Tabs matching Page 19: All · Pending · Approved · Rejected */}
      <div className="flex items-center gap-2 border-b border-[#E3EAF3] pb-2 text-xs">
        <button
          onClick={() => setTab('all')}
          className={`px-4 py-2 rounded-xl font-bold transition-colors cursor-pointer ${
            tab === 'all'
              ? 'bg-[#0B2A55] text-white shadow-xs'
              : 'bg-white border border-[#E3EAF3] text-[#0B2A55] hover:bg-slate-50'
          }`}
        >
          All ({projects.length})
        </button>
        <button
          onClick={() => setTab('pending')}
          className={`px-4 py-2 rounded-xl font-bold transition-colors cursor-pointer ${
            tab === 'pending'
              ? 'bg-[#F05A28] text-white shadow-xs'
              : 'bg-white border border-[#E3EAF3] text-[#0B2A55] hover:bg-slate-50'
          }`}
        >
          Pending ({pendingCount})
        </button>
        <button
          onClick={() => setTab('approved')}
          className={`px-4 py-2 rounded-xl font-bold transition-colors cursor-pointer ${
            tab === 'approved'
              ? 'bg-[#0E9F6E] text-white shadow-xs'
              : 'bg-white border border-[#E3EAF3] text-[#0B2A55] hover:bg-slate-50'
          }`}
        >
          Approved ({approvedCount})
        </button>
        <button
          onClick={() => setTab('rejected')}
          className={`px-4 py-2 rounded-xl font-bold transition-colors cursor-pointer ${
            tab === 'rejected'
              ? 'bg-[#E53935] text-white shadow-xs'
              : 'bg-white border border-[#E3EAF3] text-[#0B2A55] hover:bg-slate-50'
          }`}
        >
          Rejected ({rejectedCount})
        </button>
      </div>

      {/* Projects Table matching Page 19 */}
      <div className="bg-white rounded-3xl border border-[#E3EAF3] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#DEEBFB]/50 text-[#0B2A55] uppercase tracking-wider font-extrabold border-b border-[#E3EAF3]">
              <tr>
                <th className="p-4">Title</th>
                <th className="p-4">Area</th>
                <th className="p-4">Supervisor</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProjects.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3 max-w-sm">
                      <img src={p.thumbnail} alt={p.title} className="w-12 h-10 object-cover rounded-lg shrink-0 border border-slate-100" />
                      <span className="font-extrabold text-[#0B2A55] truncate">{p.title}</span>
                    </div>
                  </td>
                  <td className="p-4 font-semibold text-slate-600">{p.areaName}</td>
                  <td className="p-4 text-slate-700">
                    <div className="flex items-center gap-2">
                      <img src={p.supervisor.avatar} alt={p.supervisor.name} className="w-6 h-6 rounded-full object-cover" />
                      <span className="font-bold">{p.supervisor.name}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        p.status === 'approved' || p.status === 'active'
                          ? 'bg-[#DDF5EA] text-[#0E9F6E]'
                          : p.status === 'rejected'
                          ? 'bg-[#FDE3E3] text-[#E53935]'
                          : 'bg-[#FFE9DC] text-[#F05A28]'
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-1.5 shrink-0">
                    {/* 4 Soft Icon Buttons matching Page 19 (View, Edit, Approve/Reject, Delete) */}
                    <button
                      onClick={() => navigate(`/projects/${p.id}`)}
                      className="p-1.5 hover:bg-blue-100 text-[#0B6BE6] rounded-lg cursor-pointer"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {p.status === 'pending' ? (
                      <button
                        onClick={() => approveProjectByAdmin(p.id)}
                        className="p-1.5 hover:bg-emerald-100 text-[#0E9F6E] rounded-lg cursor-pointer"
                        title="Approve Project"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => rejectProjectByAdmin(p.id, 'Moderated by administrator')}
                        className="p-1.5 hover:bg-red-100 text-[#E53935] rounded-lg cursor-pointer"
                        title="Reject Project"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => setDeleteConfirmId(p.id)}
                      className="p-1.5 hover:bg-slate-200 text-slate-400 hover:text-red-500 rounded-lg cursor-pointer"
                      title="Delete Project"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-sm w-full rounded-2xl shadow-xl p-6 space-y-4">
            <h3 className="font-extrabold text-base text-[#0B2A55]">Confirm Deletion</h3>
            <p className="text-xs text-slate-600">
              Are you sure you want to delete this project? This will remove all associated applications and milestones.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-xs font-bold text-slate-500"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteProject(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="px-4 py-2 text-xs font-bold bg-[#E53935] text-white rounded-xl shadow-xs"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
