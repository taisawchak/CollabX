import React, { useState } from 'react';
import {
  Users,
  FolderKanban,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingUp,
  MessageSquare,
  FileText,
  Send,
  Archive,
  CheckCircle,
  XCircle,
  Trash2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface MyProjectsPageProps {
  navigate: (path: string) => void;
}

export const MyProjectsPage: React.FC<MyProjectsPageProps> = ({ navigate }) => {
  const {
    currentUser,
    projects,
    members,
    submitProjectForModeration,
    archiveProject,
    closeProject,
    completeProject,
    deleteProject,
  } = useApp();
  const [activeTab, setActiveTab] = useState<'joined' | 'completed' | 'published'>(() => {
    if (currentUser?.role === 'supervisor' || currentUser?.role === 'researcher') {
      return 'published';
    }
    return 'joined';
  });
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  if (!currentUser) {
    return null;
  }

  // User's joined project IDs (matched by user ID or email)
  const joinedProjectIds = members
    .filter(
      (m) =>
        m.userId === currentUser.id ||
        (currentUser.email && m.email && m.email.toLowerCase() === currentUser.email.toLowerCase())
    )
    .map((m) => m.projectId);

  // Projects joined
  const joinedProjects = projects.filter((p) => joinedProjectIds.includes(p.id) && p.status !== 'completed');

  // Projects completed
  const completedProjects = projects.filter((p) => joinedProjectIds.includes(p.id) && p.status === 'completed');

  // Projects published by current user (matched by supervisor user ID or email)
  const publishedProjects = projects.filter(
    (p) =>
      p.supervisor.id === currentUser?.id ||
      (currentUser?.email && p.supervisor.email && p.supervisor.email.toLowerCase() === currentUser.email.toLowerCase()) ||
      (currentUser?.role === 'admin' && p.status === 'pending')
  );

  const displayList =
    activeTab === 'joined' ? joinedProjects : activeTab === 'completed' ? completedProjects : publishedProjects;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header & Tabs matching Page 10 */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-4 border-b border-[#E3EAF3]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0B2A55] tracking-tight">
            My Projects & Collaborations
          </h1>
          <p className="text-xs text-[#6B7A90] mt-1">
            Active laboratories, team workspaces, and funded research contributions
          </p>
        </div>

        {(currentUser?.role === 'supervisor' || currentUser?.role === 'researcher' || currentUser?.role === 'admin') && (
          <button
            onClick={() => navigate('/projects/new')}
            className="px-4 py-2.5 bg-[#0B6BE6] hover:bg-blue-600 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>+ Publish Project</span>
          </button>
        )}
      </div>

      {/* Tabs Row matching Page 10 */}
      <div className="flex items-center gap-2 border-b border-[#E3EAF3] pb-2 text-xs">
        <button
          onClick={() => setActiveTab('joined')}
          className={`px-4 py-2 rounded-xl font-bold transition-colors cursor-pointer ${
            activeTab === 'joined'
              ? 'bg-[#0E9F6E] text-white shadow-xs'
              : 'bg-white border border-[#E3EAF3] text-[#0B2A55] hover:bg-slate-50'
          }`}
        >
          Joined Projects ({joinedProjects.length})
        </button>

        <button
          onClick={() => setActiveTab('completed')}
          className={`px-4 py-2 rounded-xl font-bold transition-colors cursor-pointer ${
            activeTab === 'completed'
              ? 'bg-[#0E9F6E] text-white shadow-xs'
              : 'bg-white border border-[#E3EAF3] text-[#0B2A55] hover:bg-slate-50'
          }`}
        >
          Completed Projects ({completedProjects.length})
        </button>

        {(currentUser?.role === 'supervisor' || currentUser?.role === 'researcher' || currentUser?.role === 'admin') && (
          <button
            onClick={() => setActiveTab('published')}
            className={`px-4 py-2 rounded-xl font-bold transition-colors cursor-pointer ${
              activeTab === 'published'
                ? 'bg-[#0B6BE6] text-white shadow-xs'
                : 'bg-white border border-[#E3EAF3] text-[#0B2A55] hover:bg-slate-50'
            }`}
          >
            Published by Me ({publishedProjects.length})
          </button>
        )}
      </div>

      {/* Projects Cards Grid matching Page 10 */}
      {displayList.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-3xl border border-[#E3EAF3] space-y-3">
          <FolderKanban className="w-12 h-12 text-slate-300 mx-auto" />
          <h4 className="text-base font-bold text-[#0B2A55]">No projects in this category</h4>
          <p className="text-xs text-slate-500">Apply to open projects or join faculty laboratories to collaborate.</p>
          <button
            onClick={() => navigate('/projects')}
            className="mt-2 px-5 py-2.5 bg-[#0B6BE6] text-white text-xs font-bold rounded-xl"
          >
            Explore Projects
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {displayList.map((p) => {
            const memberInfo = members.find((m) => m.projectId === p.id && m.userId === currentUser?.id);
            const userRole = memberInfo?.role || (p.supervisor.id === currentUser?.id ? 'Supervisor' : 'Member');

            return (
              <div
                key={p.id}
                className="bg-white p-5 rounded-3xl border border-[#E3EAF3] shadow-xs hover:shadow-lg transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.thumbnail}
                        alt={p.title}
                        className="w-16 h-16 rounded-2xl object-cover shrink-0 border border-slate-100"
                      />
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#0B6BE6] bg-[#DCE6FB] px-2 py-0.5 rounded-md">
                          {p.areaName}
                        </span>
                        <h4
                          onClick={() => navigate(`/projects/${p.id}`)}
                          className="font-extrabold text-base text-[#0B2A55] hover:text-[#0B6BE6] transition-colors line-clamp-1 mt-1 cursor-pointer"
                        >
                          {p.title}
                        </h4>
                        <p className="text-xs text-slate-500">Supervisor: {p.supervisor.name}</p>
                      </div>
                    </div>

                    <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-[#DDF5EA] text-[#0E9F6E] shrink-0">
                      {p.status === 'approved' ? 'Active' : p.status}
                    </span>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400 block font-medium">Your Role</span>
                      <span className="font-bold text-[#0B2A55] capitalize">{userRole}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Team Members</span>
                      <span className="font-bold text-[#0B2A55]">{p.filledPositions}/{p.totalPositions} Members</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Progress</span>
                      <span className="font-bold text-[#0E9F6E]">{p.progressPercent}%</span>
                    </div>
                  </div>
                </div>

                {/* Supervisor Lifecycle Controls for Published Projects */}
                {activeTab === 'published' && (p.supervisor.id === currentUser?.id || currentUser?.role === 'admin') && (
                  <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {p.status === 'draft' && (
                        <button
                          onClick={() => submitProjectForModeration(p.id)}
                          className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Send className="w-3 h-3" />
                          <span>Submit for Moderation</span>
                        </button>
                      )}

                      {(p.status === 'approved' || p.status === 'active') && (
                        <>
                          <button
                            onClick={() => closeProject(p.id)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                            title="Close project to new applicants"
                          >
                            <XCircle className="w-3 h-3" />
                            <span>Close Seats</span>
                          </button>
                          <button
                            onClick={() => completeProject(p.id)}
                            className="px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                            title="Mark project as 100% completed"
                          >
                            <CheckCircle className="w-3 h-3" />
                            <span>Complete</span>
                          </button>
                        </>
                      )}

                      {p.status !== 'archived' && (
                        <button
                          onClick={() => archiveProject(p.id)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                          title="Archive project"
                        >
                          <Archive className="w-3 h-3" />
                          <span>Archive</span>
                        </button>
                      )}
                    </div>

                    <button
                      onClick={() => setDeleteConfirmId(p.id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete Project"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Quick Workspace Nav Actions matching Page 10 */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 text-xs">
                    <button
                      onClick={() => navigate(`/projects/${p.id}/discussion`)}
                      className="p-2 rounded-xl bg-slate-50 hover:bg-blue-50 text-[#0B6BE6] transition-colors"
                      title="Discussion"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => navigate(`/projects/${p.id}/progress`)}
                      className="p-2 rounded-xl bg-slate-50 hover:bg-emerald-50 text-[#0E9F6E] transition-colors"
                      title="Progress"
                    >
                      <TrendingUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => navigate(`/projects/${p.id}/team`)}
                      className="p-2 rounded-xl bg-slate-50 hover:bg-purple-50 text-purple-600 transition-colors"
                      title="Team"
                    >
                      <Users className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => navigate(`/projects/${p.id}`)}
                    className="px-4 py-2 bg-[#0B6BE6] hover:bg-blue-600 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <span>View Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-sm w-full rounded-2xl shadow-xl p-6 space-y-4">
            <h3 className="font-extrabold text-base text-[#0B2A55]">Confirm Project Deletion</h3>
            <p className="text-xs text-slate-600">
              Are you sure you want to permanently delete this project? All associated applications, member roles, milestones and progress records will be removed.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteProject(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="px-4 py-2 text-xs font-bold bg-[#E53935] hover:bg-red-700 text-white rounded-xl shadow-xs cursor-pointer"
              >
                Delete Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
