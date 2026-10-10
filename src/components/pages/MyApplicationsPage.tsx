import React, { useState } from 'react';
import {
  FolderKanban,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  ArrowRight,
  FileText,
  RotateCcw,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Application } from '../../types';

interface MyApplicationsPageProps {
  navigate: (path: string) => void;
  currentPath?: string;
}

export const MyApplicationsPage: React.FC<MyApplicationsPageProps> = ({ navigate, currentPath }) => {
  const { currentUser, applications, withdrawApplication } = useApp();

  if (!currentUser) {
    return null;
  }

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'withdrawn'>(() => {
    const search = currentPath?.includes('?')
      ? currentPath.split('?')[1]
      : typeof window !== 'undefined'
      ? window.location.search
      : '';
    const s = new URLSearchParams(search).get('status')?.toLowerCase();
    if (s === 'pending' || s === 'approved' || s === 'rejected' || s === 'withdrawn') {
      return s;
    }
    return 'all';
  });
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  React.useEffect(() => {
    const search = currentPath?.includes('?')
      ? currentPath.split('?')[1]
      : typeof window !== 'undefined'
      ? window.location.search
      : '';
    const s = new URLSearchParams(search).get('status')?.toLowerCase();
    if (s === 'pending' || s === 'approved' || s === 'rejected' || s === 'withdrawn') {
      setStatusFilter(s);
    } else if (s === 'all') {
      setStatusFilter('all');
    }
  }, [currentPath]);

  const userApps = applications.filter((a) => a.userId === currentUser.id);

  const pendingCount = userApps.filter((a) => a.status === 'pending').length;
  const approvedCount = userApps.filter((a) => a.status === 'approved').length;
  const rejectedCount = userApps.filter((a) => a.status === 'rejected').length;
  const withdrawnCount = userApps.filter((a) => a.status === 'withdrawn').length;

  const filteredApps = userApps.filter((app) => {
    if (statusFilter !== 'all' && app.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      return app.projectTitle.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#DDF5EA] text-[#0E9F6E] flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Approved</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#FDE3E3] text-[#E53935] flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5" />
            <span>Rejected</span>
          </span>
        );
      case 'withdrawn':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-500">
            Withdrawn
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#FFE9DC] text-[#F05A28] flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Pending</span>
          </span>
        );
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Search & Header matching Page 8 */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-4 border-b border-[#E3EAF3]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0B2A55] tracking-tight">My Applications</h1>
          <p className="text-xs text-[#6B7A90] mt-1">Review the status and supervisor feedback for all project submissions</p>
        </div>

        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects..."
            className="w-full bg-white border border-[#E3EAF3] text-xs text-[#0B2A55] placeholder-slate-400 pl-9 pr-4 py-2.5 rounded-xl focus:outline-hidden focus:border-[#0B6BE6]"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Filter Pills with Live Accurate Counts matching Page 8 */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-4 py-2 rounded-xl font-bold transition-colors cursor-pointer ${
            statusFilter === 'all'
              ? 'bg-[#0B6BE6] text-white shadow-xs'
              : 'bg-white border border-[#E3EAF3] text-[#0B2A55] hover:bg-slate-50'
          }`}
        >
          All ({userApps.length})
        </button>
        <button
          onClick={() => setStatusFilter('pending')}
          className={`px-4 py-2 rounded-xl font-bold transition-colors cursor-pointer ${
            statusFilter === 'pending'
              ? 'bg-[#F05A28] text-white shadow-xs'
              : 'bg-white border border-[#E3EAF3] text-[#0B2A55] hover:bg-slate-50'
          }`}
        >
          Pending ({pendingCount})
        </button>
        <button
          onClick={() => setStatusFilter('approved')}
          className={`px-4 py-2 rounded-xl font-bold transition-colors cursor-pointer ${
            statusFilter === 'approved'
              ? 'bg-[#0E9F6E] text-white shadow-xs'
              : 'bg-white border border-[#E3EAF3] text-[#0B2A55] hover:bg-slate-50'
          }`}
        >
          Approved ({approvedCount})
        </button>
        <button
          onClick={() => setStatusFilter('rejected')}
          className={`px-4 py-2 rounded-xl font-bold transition-colors cursor-pointer ${
            statusFilter === 'rejected'
              ? 'bg-[#E53935] text-white shadow-xs'
              : 'bg-white border border-[#E3EAF3] text-[#0B2A55] hover:bg-slate-50'
          }`}
        >
          Rejected ({rejectedCount})
        </button>
        <button
          onClick={() => setStatusFilter('withdrawn')}
          className={`px-4 py-2 rounded-xl font-bold transition-colors cursor-pointer ${
            statusFilter === 'withdrawn'
              ? 'bg-slate-600 text-white shadow-xs'
              : 'bg-white border border-[#E3EAF3] text-[#0B2A55] hover:bg-slate-50'
          }`}
        >
          Withdrawn ({withdrawnCount})
        </button>
      </div>

      {/* Applications List matching Page 8 */}
      {filteredApps.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-3xl border border-[#E3EAF3] space-y-3">
          <FolderKanban className="w-12 h-12 text-slate-300 mx-auto" />
          <h4 className="text-base font-bold text-[#0B2A55]">No applications found</h4>
          <p className="text-xs text-slate-500">Explore open projects to submit your research statement.</p>
          <button
            onClick={() => navigate('/projects')}
            className="mt-2 px-5 py-2.5 bg-[#0B6BE6] text-white text-xs font-bold rounded-xl"
          >
            Explore Projects Catalog
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-[#E3EAF3] shadow-xs divide-y divide-slate-100 overflow-hidden">
          {filteredApps.map((app) => (
            <div
              key={app.id}
              className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
            >
              <div className="flex items-center gap-4 min-w-0">
                <img
                  src={app.projectThumbnail}
                  alt={app.projectTitle}
                  className="w-16 h-14 object-cover rounded-xl shrink-0 border border-slate-100"
                />
                <div className="space-y-1 min-w-0">
                  <h4
                    onClick={() => navigate(`/projects/${app.projectId}`)}
                    className="font-extrabold text-sm sm:text-base text-[#0B2A55] hover:text-[#0B6BE6] transition-colors truncate cursor-pointer"
                  >
                    {app.projectTitle}
                  </h4>
                  <p className="text-xs text-slate-500">
                    Application submitted: {app.appliedDate}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                {getStatusBadge(app.status)}

                {/* Soft Blue View Button matching Page 8 */}
                <button
                  onClick={() => setSelectedApp(app)}
                  className="px-4 py-2 bg-[#DCE6FB] hover:bg-blue-200 text-[#0B6BE6] text-xs font-extrabold rounded-xl transition-colors cursor-pointer"
                >
                  View
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Application Detail Drawer / Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-lg text-[#0B2A55]">Application Details</h3>
              <button onClick={() => setSelectedApp(null)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <span className="text-slate-400 font-semibold block mb-1">Target Project</span>
                <p className="font-extrabold text-sm text-[#0B2A55]">{selectedApp.projectTitle}</p>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
                <div>
                  <span className="text-slate-400 font-semibold block">Submission Date</span>
                  <span className="font-bold text-slate-700">{selectedApp.appliedDate}</span>
                </div>
                <div>{getStatusBadge(selectedApp.status)}</div>
              </div>

              <div>
                <span className="text-slate-400 font-semibold block mb-1">Your Motivation Statement</span>
                <p className="p-3 bg-slate-50 rounded-2xl text-slate-700 leading-relaxed font-medium">
                  "{selectedApp.message}"
                </p>
              </div>

              <div>
                <span className="text-slate-400 font-semibold block mb-1">Submitted Skills</span>
                <p className="font-bold text-slate-700">{selectedApp.skillsNote}</p>
              </div>

              {selectedApp.supervisorResponse && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1">
                  <span className="font-bold text-emerald-800 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Supervisor Feedback:</span>
                  </span>
                  <p className="text-emerald-700 leading-relaxed font-medium">
                    "{selectedApp.supervisorResponse}"
                  </p>
                </div>
              )}

              {selectedApp.status === 'approved' && (
                <div className="pt-2">
                  <button
                    onClick={() => {
                      const pId = selectedApp.projectId;
                      setSelectedApp(null);
                      navigate(`/projects/${pId}/discussion`);
                    }}
                    className="w-full py-3 bg-[#0B6BE6] text-white font-extrabold rounded-xl shadow-xs"
                  >
                    Open Project Workspace & Discussion →
                  </button>
                </div>
              )}

              {selectedApp.status === 'pending' && (
                <div className="pt-2 flex justify-between items-center border-t border-slate-100">
                  <button
                    onClick={() => {
                      withdrawApplication(selectedApp.id);
                      setSelectedApp(null);
                    }}
                    className="text-red-500 hover:text-red-700 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Withdraw Application</span>
                  </button>

                  <button
                    onClick={() => setSelectedApp(null)}
                    className="px-4 py-2 bg-slate-100 text-slate-600 font-bold rounded-xl"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
