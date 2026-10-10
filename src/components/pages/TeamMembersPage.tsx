import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Mail,
  MoreVertical,
  ArrowLeft,
  Shield,
  Sparkles,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface TeamMembersPageProps {
  projectId: string;
  navigate: (path: string) => void;
}

export const TeamMembersPage: React.FC<TeamMembersPageProps> = ({ projectId, navigate }) => {
  const { projects, members, users, inviteTeamMember, removeTeamMember, currentUser, showToast } = useApp();

  if (!currentUser) {
    return null;
  }

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmailOrUser, setInviteEmailOrUser] = useState('');
  const [positionTitle, setPositionTitle] = useState('Research Assistant');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const project = projects.find((p) => p.id === projectId) || projects[0];
  const projectMembers = members.filter((m) => m.projectId === project.id);

  const isSupervisorOrAdmin = project.supervisor.id === currentUser?.id || currentUser?.role === 'admin';
  const openSeats = Math.max(0, project.totalPositions - projectMembers.length);

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmailOrUser.trim()) return;
    inviteTeamMember(project.id, inviteEmailOrUser.trim(), positionTitle);
    setIsInviteModalOpen(false);
    setInviteEmailOrUser('');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header back button & title */}
      <div className="flex items-center justify-between pb-2">
        <button
          onClick={() => navigate(`/projects/${project.id}`)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0B6BE6] hover:underline cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to {project.title}</span>
        </button>

        {isSupervisorOrAdmin && (
          <button
            onClick={() => setIsInviteModalOpen(true)}
            className="px-4 py-2 bg-[#0B6BE6] hover:bg-blue-600 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Invite Member</span>
          </button>
        )}
      </div>

      {/* Main Team Card matching Page 15 */}
      <div className="bg-white rounded-3xl border border-[#E3EAF3] p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h1 className="text-2xl font-black text-[#0B2A55] tracking-tight">
              Project Team ({projectMembers.length}/{project.totalPositions})
            </h1>
            <p className="text-xs text-[#6B7A90] mt-0.5">
              Principal investigators, student research assistants, and data analysts
            </p>
          </div>

          <span className="text-xs font-bold px-3 py-1 bg-blue-50 text-[#0B6BE6] rounded-full">
            {openSeats} Open {openSeats === 1 ? 'Seat' : 'Seats'}
          </span>
        </div>

        {/* Members List matching Page 15 cards */}
        <div className="space-y-3">
          {projectMembers.map((mem) => {
            const isLead = mem.role === 'supervisor';

            return (
              <div
                key={mem.id}
                className="p-4 sm:p-5 rounded-2xl border border-[#E3EAF3] hover:border-slate-300 transition-all flex items-center justify-between gap-4 bg-white"
              >
                {/* Left: Avatar + Name + Position */}
                <div className="flex items-center gap-4 min-w-0">
                  <img
                    src={mem.avatar}
                    alt={mem.name}
                    className="w-12 h-12 rounded-full object-cover border border-slate-200 shrink-0"
                  />
                  <div className="space-y-0.5 min-w-0">
                    <h4 className="font-extrabold text-sm sm:text-base text-[#0B2A55] truncate">
                      {mem.name}
                    </h4>
                    <p className="text-xs text-slate-500 truncate">{mem.positionTitle}</p>
                    <p className="text-[11px] text-slate-400 truncate">{mem.email}</p>
                  </div>
                </div>

                {/* Right: Badge + Actions */}
                <div className="flex items-center gap-3 shrink-0">
                  {isLead ? (
                    <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-[#DCE6FB] text-[#0B6BE6]">
                      Supervisor
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-[#DDF5EA] text-[#0E9F6E]">
                      Active
                    </span>
                  )}

                  {/* Actions Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setActiveMenuId(activeMenuId === mem.id ? null : mem.id)}
                      className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {activeMenuId === mem.id && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-[#E3EAF3] py-2 z-20 text-xs">
                        <button
                          onClick={() => {
                            setActiveMenuId(null);
                            navigate(`/u/${mem.userId}`);
                          }}
                          className="w-full px-4 py-2 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>View Profile</span>
                        </button>
                        <button
                          onClick={() => {
                            setActiveMenuId(null);
                            navigate(`/projects/${project.id}/discussion`);
                          }}
                          className="w-full px-4 py-2 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          <span>Direct Message</span>
                        </button>
                        {isSupervisorOrAdmin && !isLead && (
                          <button
                            onClick={() => {
                              setActiveMenuId(null);
                              removeTeamMember(mem.id);
                            }}
                            className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-slate-100"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove from Team</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Open Seat Card with dashed avatar matching Page 15 */}
          {openSeats > 0 && (
            <div className="p-4 sm:p-5 rounded-2xl border-2 border-dashed border-[#A3BFF5] bg-[#F5F8FC] flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full border-2 border-dashed border-blue-400 flex items-center justify-center text-blue-500 font-bold shrink-0">
                  +
                </div>
                <div>
                  <h4 className="font-extrabold text-sm sm:text-base text-[#0B2A55]">
                    Open Seat ({openSeats} {openSeats === 1 ? 'position' : 'positions'} available)
                  </h4>
                  <p className="text-xs text-[#6B7A90]">
                    Accept candidates from applications or invite directly by email
                  </p>
                </div>
              </div>

              {isSupervisorOrAdmin && (
                <button
                  onClick={() => setIsInviteModalOpen(true)}
                  className="px-4 py-2 bg-[#0B6BE6] hover:bg-blue-600 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Invite
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Invite Member Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-3xl shadow-2xl p-6 sm:p-8 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-[#0B2A55]">Invite Collaborator</h3>
              <button onClick={() => setIsInviteModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleInviteSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-[#0B2A55] block mb-1">Scholar or Student Email *</label>
                <input
                  type="text"
                  required
                  value={inviteEmailOrUser}
                  onChange={(e) => setInviteEmailOrUser(e.target.value)}
                  placeholder="e.g. gary@collabx.test or full name"
                  className="w-full bg-[#F5F8FC] border border-[#E3EAF3] p-2.5 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-[#0B2A55] block mb-1">Project Role / Position Title</label>
                <input
                  type="text"
                  value={positionTitle}
                  onChange={(e) => setPositionTitle(e.target.value)}
                  placeholder="e.g. Lead ML Research Assistant"
                  className="w-full bg-[#F5F8FC] border border-[#E3EAF3] p-2.5 rounded-xl font-medium"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="px-4 py-2 font-bold text-slate-500"
                >
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-[#0B6BE6] text-white font-bold rounded-xl">
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
