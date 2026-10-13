import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Users,
  Calendar,
  Clock,
  Award,
  Bookmark,
  Share2,
  Mail,
  User as UserIcon,
  CheckCircle2,
  Lock,
  MessageSquare,
  FileText,
  TrendingUp,
  Sparkles,
  Send,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import confetti from 'canvas-confetti';

interface ProjectDetailsPageProps {
  projectId: string;
  navigate: (path: string) => void;
  initialTab?: string;
}

export const ProjectDetailsPage: React.FC<ProjectDetailsPageProps> = ({ projectId, navigate, initialTab }) => {
  const {
    projects,
    currentUser,
    applications,
    applyToProject,
    toggleSaveProject,
    savedProjectIds,
    members,
    files,
    milestones,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'requirements' | 'team' | 'progress' | 'discussion' | 'files'>(
    (initialTab as any) || 'overview'
  );

  // Application Modal state
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [motivationMessage, setMotivationMessage] = useState('');
  const [skillsNote, setSkillsNote] = useState(currentUser?.skills.join(', ') || '');
  const [cvName, setCvName] = useState('My_Academic_CV.pdf');
  const [isSubmittingApply, setIsSubmittingApply] = useState(false);

  // Contact Supervisor modal state
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [contactSubject, setContactSubject] = useState('');
  const [contactBody, setContactBody] = useState('');

  const project = projects.find((p) => p.id === projectId) || projects[0];

  // Check if current user is member or supervisor or admin
  const isMember = members.some((m) => m.projectId === project.id && m.userId === currentUser?.id);
  const isSupervisor = project.supervisor.id === currentUser?.id;
  const isAdmin = currentUser?.role === 'admin';
  const hasWorkspaceAccess = isMember || isSupervisor || isAdmin;

  // Check if user has already applied
  const userApplication = applications.find(
    (a) => a.projectId === project.id && a.userId === currentUser?.id
  );

  const isSaved = savedProjectIds.includes(project.id);

  // Similar projects recommendations
  const similarProjects = projects.filter(
    (p) => p.id !== project.id && (p.areaId === project.areaId || p.difficulty === project.difficulty)
  ).slice(0, 3);

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingApply) return;
    if (!motivationMessage.trim()) {
      showToast('Please provide a brief statement of interest', 'error');
      return;
    }
    setIsSubmittingApply(true);
    try {
      const success = applyToProject(project.id, motivationMessage, skillsNote, cvName);
      if (success) {
        setIsApplyModalOpen(false);
        setMotivationMessage('');
        try {
          confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
        } catch (e) {}
      }
    } finally {
      setIsSubmittingApply(false);
    }
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showToast(`Inquiry sent directly to ${project.supervisor.name}`, 'success');
    setIsContactModalOpen(false);
    setContactBody('');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Back Button */}
      <button
        onClick={() => navigate('/projects')}
        className="inline-flex items-center gap-2 text-xs font-bold text-[#0B6BE6] hover:underline cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Projects</span>
      </button>

      {/* Top Banner & Header Section matching Page 4 */}
      <div className="bg-white rounded-3xl border border-[#E3EAF3] p-6 sm:p-8 shadow-xs relative overflow-hidden">
        {/* Faded banner image at top-right */}
        <div
          className="absolute -right-10 -top-10 w-96 h-96 opacity-15 pointer-events-none rounded-full bg-cover bg-center"
          style={{ backgroundImage: `url(${project.thumbnail})` }}
        />

        <div className="relative z-10 space-y-6">
          {/* Chips */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 text-xs font-bold rounded-full bg-[#DCE6FB] text-[#0B6BE6]">
              {project.areaName}
            </span>
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-700">
              {project.projectType}
            </span>
            <span className="px-3 py-1 text-xs font-bold rounded-full bg-[#DDF5EA] text-[#0E9F6E]">
              {project.status === 'approved' ? 'Open for Applications' : project.status}
            </span>
            {project.tags.map((tag) => (
              <span key={tag} className="px-2.5 py-0.5 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-500">
                #{tag}
              </span>
            ))}
          </div>

          {/* Big Project Title */}
          <h1 className="text-2xl sm:text-4xl font-black text-[#0B2A55] tracking-tight leading-tight max-w-4xl">
            {project.title}
          </h1>

          {/* Supervisor Card Block */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-100">
            <div
              onClick={() => navigate(`/u/${project.supervisor.id}`)}
              className="flex items-center gap-4 cursor-pointer group"
            >
              <img
                src={project.supervisor.avatar}
                alt={project.supervisor.name}
                className="w-14 h-14 rounded-full object-cover border-2 border-[#0B6BE6] shadow-xs group-hover:scale-105 transition-transform"
              />
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Supervisor</span>
                <h3 className="text-base font-extrabold text-[#0B2A55] group-hover:text-[#0B6BE6] transition-colors">{project.supervisor.name}</h3>
                <p className="text-xs text-[#6B7A90]">{project.supervisor.title} · {project.supervisor.institution}</p>
              </div>
            </div>

            {/* Supervisor Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(`/u/${project.supervisor.id}`)}
                className="px-4 py-2 bg-[#0B6BE6] hover:bg-blue-600 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                View Profile
              </button>
              <button
                onClick={() => {
                  if (!currentUser) {
                    navigate(`/login?redirect=${encodeURIComponent(`/projects/${project.id}`)}`);
                    return;
                  }
                  navigate(`/messages?user=${project.supervisor.id}`);
                }}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                title={`Send direct message to ${project.supervisor.name}`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Message</span>
              </button>
              <button
                onClick={() => setIsContactModalOpen(true)}
                className="px-4 py-2 border border-[#E3EAF3] hover:bg-slate-50 text-[#0B2A55] rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <span>Contact</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Info Cards with Icons matching Page 4 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#E3EAF3] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#0B6BE6] flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold">Positions</p>
            <p className="text-base font-extrabold text-[#0B2A55]">
              {project.filledPositions}/{project.totalPositions} Seats
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E3EAF3] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold">Difficulty</p>
            <p className="text-base font-extrabold text-[#0B2A55]">{project.difficulty}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E3EAF3] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold">Duration</p>
            <p className="text-base font-extrabold text-[#0B2A55]">{project.durationMonths} Months</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E3EAF3] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-50 text-[#E53935] flex items-center justify-center shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold">Deadline</p>
            <p className="text-base font-extrabold text-[#0B2A55]">
              {new Date(project.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Row (Overview, Requirements, Team, Progress, Discussion, Files) matching Page 4 */}
      <div className="flex items-center gap-2 border-b border-[#E3EAF3] pb-2 overflow-x-auto text-sm">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'requirements', label: 'Requirements' },
          { id: 'team', label: `Team (${members.filter((m) => m.projectId === project.id).length})` },
          { id: 'progress', label: `Progress (${project.progressPercent}%)` },
          { id: 'discussion', label: 'Discussion', locked: !hasWorkspaceAccess },
          { id: 'files', label: `Files (${files.filter((f) => f.projectId === project.id).length})`, locked: !hasWorkspaceAccess },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              if (tab.locked) {
                showToast('Please join this project team to access discussion and private files.', 'warning');
                return;
              }
              setActiveTab(tab.id as any);
            }}
            className={`px-4 py-2 rounded-xl font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
              activeTab === tab.id
                ? 'bg-[#FFC83D] text-[#0B2A55] shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-[#0B2A55]'
            }`}
          >
            <span>{tab.label}</span>
            {tab.locked && <Lock className="w-3.5 h-3.5 text-slate-400" />}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2 Cols: Tab Main Body */}
        <div className="lg:col-span-2 space-y-6">
          {activeTab === 'overview' && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E3EAF3] shadow-xs space-y-6">
              <div>
                <h3 className="text-lg font-extrabold text-[#0B2A55] mb-2">Description & Problem Statement</h3>
                <p className="text-sm text-slate-700 leading-relaxed">{project.description}</p>
              </div>

              <div>
                <h3 className="text-lg font-extrabold text-[#0B2A55] mb-2">Research Objectives</h3>
                <ul className="space-y-2">
                  {project.objectives.map((obj, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-[#0E9F6E] shrink-0 mt-0.5" />
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-extrabold text-[#0B2A55] mb-2">Expected Outcomes & Deliverables</h3>
                <p className="text-sm text-slate-700 leading-relaxed">{project.expectedOutcome}</p>
              </div>

              <div>
                <h3 className="text-lg font-extrabold text-[#0B2A55] mb-2">Methodology</h3>
                <p className="text-sm text-slate-700 leading-relaxed">{project.methodology}</p>
              </div>
            </div>
          )}

          {activeTab === 'requirements' && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E3EAF3] shadow-xs space-y-6">
              <div>
                <h3 className="text-lg font-extrabold text-[#0B2A55] mb-2">Required Technical Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {project.requiredSkills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1.5 rounded-xl bg-blue-50 text-[#0B6BE6] font-bold text-xs border border-blue-100"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-extrabold text-[#0B2A55] mb-2">Eligibility Criteria</h3>
                <ul className="space-y-2 text-sm text-slate-700 list-disc list-inside">
                  <li>Undergraduate or graduate student in CSE, EEE, or relevant computing department.</li>
                  <li>Minimum commitment of 8-10 hours per week for laboratory milestones.</li>
                  <li>Familiarity with version control (Git) and academic literature review practices.</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'team' && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E3EAF3] shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-extrabold text-[#0B2A55]">Project Team</h3>
                <button
                  onClick={() => navigate(`/projects/${project.id}/team`)}
                  className="text-xs font-bold text-[#0B6BE6] hover:underline"
                >
                  Full Team Management View →
                </button>
              </div>
              <div className="space-y-3">
                {members
                  .filter((m) => m.projectId === project.id)
                  .map((mem) => (
                    <div
                      key={mem.id}
                      className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100"
                    >
                      <div
                        onClick={() => navigate(`/u/${mem.userId}`)}
                        className="flex items-center gap-3 cursor-pointer group"
                      >
                        <img
                          src={mem.avatar}
                          alt={mem.name}
                          className="w-10 h-10 rounded-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div>
                          <p className="text-sm font-bold text-[#0B2A55] group-hover:text-[#0B6BE6] transition-colors">
                            {mem.name}
                          </p>
                          <p className="text-xs text-slate-500">{mem.positionTitle}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            if (!currentUser) {
                              navigate(`/login?redirect=${encodeURIComponent(`/projects/${project.id}`)}`);
                              return;
                            }
                            navigate(`/messages?user=${mem.userId}`);
                          }}
                          className="p-1.5 text-slate-400 hover:text-[#0B6BE6] rounded-lg cursor-pointer"
                          title={`Message ${mem.name}`}
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-[#0B6BE6] capitalize">
                          {mem.role}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {activeTab === 'progress' && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E3EAF3] shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-extrabold text-[#0B2A55]">Milestones & Progress</h3>
                <button
                  onClick={() => navigate(`/projects/${project.id}/progress`)}
                  className="text-xs font-bold text-[#0B6BE6] hover:underline"
                >
                  Interactive Progress Workspace →
                </button>
              </div>
              <div className="space-y-3">
                {milestones
                  .filter((m) => m.projectId === project.id)
                  .map((ms) => (
                    <div
                      key={ms.id}
                      className="p-3.5 rounded-2xl border border-slate-100 bg-[#F5F8FC] flex items-center justify-between"
                    >
                      <div>
                        <p className="text-sm font-bold text-[#0B2A55]">{ms.title}</p>
                        <p className="text-xs text-slate-400">Due: {ms.dueDate}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#0B2A55]">{ms.percent}%</span>
                        <div className="w-20 bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-[#0E9F6E] h-full rounded-full"
                            style={{ width: `${ms.percent}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {activeTab === 'discussion' && (
            <div className="bg-white p-6 rounded-3xl border border-[#E3EAF3] text-center space-y-3">
              <MessageSquare className="w-10 h-10 text-[#0B6BE6] mx-auto" />
              <h4 className="text-base font-bold text-[#0B2A55]">Project Discussion Channel</h4>
              <p className="text-xs text-slate-500">
                You have active collaborator access. Jump into the live multi-channel chat room.
              </p>
              <button
                onClick={() => navigate(`/projects/${project.id}/discussion`)}
                className="px-5 py-2.5 bg-[#0B6BE6] text-white text-xs font-bold rounded-xl"
              >
                Open Project Chat Room
              </button>
            </div>
          )}

          {activeTab === 'files' && (
            <div className="bg-white p-6 rounded-3xl border border-[#E3EAF3] space-y-4">
              <h4 className="text-base font-bold text-[#0B2A55]">Project Files & Datasets</h4>
              <div className="space-y-2">
                {files
                  .filter((f) => f.projectId === project.id)
                  .map((f) => (
                    <div
                      key={f.id}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#0B6BE6]" />
                        <span className="font-bold text-[#0B2A55]">{f.fileName}</span>
                        <span className="text-slate-400">({f.fileSize})</span>
                      </div>
                      <button
                        onClick={() => showToast(`Downloaded ${f.fileName}`, 'info')}
                        className="text-[#0B6BE6] font-bold hover:underline cursor-pointer"
                      >
                        Download
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Right 1 Col: Application Action Box & Saved Toggle */}
        <div className="space-y-6">
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#E3EAF3] shadow-xs space-y-5">
            <h3 className="text-base font-extrabold text-[#0B2A55]">Join Research Group</h3>

            {/* Application status notice */}
            {userApplication && userApplication.status !== 'withdrawn' ? (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-800">
                  <AlertCircle className="w-4 h-4" />
                  <span>Application Status: {userApplication.status.toUpperCase()}</span>
                </div>
                <p className="text-[11px] text-amber-700">
                  Submitted on {userApplication.appliedDate}.
                  {userApplication.status === 'pending'
                    ? ' You will receive a notification upon supervisor review.'
                    : userApplication.status === 'approved'
                    ? ' Your application was approved!'
                    : ` Decision: ${userApplication.supervisorResponse || 'Declined'}`}
                </p>
                {userApplication.status === 'approved' && (
                  <button
                    onClick={() => navigate(`/projects/${project.id}/discussion`)}
                    className="w-full py-2 bg-[#0E9F6E] hover:bg-emerald-600 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    Enter Project Workspace →
                  </button>
                )}
              </div>
            ) : isSupervisor ? (
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-800 font-medium">
                You are the supervisor of this project.
              </div>
            ) : isMember ? (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 space-y-2">
                <p className="font-bold">You are an active collaborator on this project.</p>
                <button
                  onClick={() => navigate(`/projects/${project.id}/discussion`)}
                  className="w-full py-2 bg-[#0E9F6E] hover:bg-emerald-600 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Enter Project Workspace →
                </button>
              </div>
            ) : project.status !== 'approved' && project.status !== 'active' ? (
              <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 text-xs text-slate-700">
                This project is currently not open for applications ({project.status}).
              </div>
            ) : project.filledPositions >= project.totalPositions ? (
              <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 text-xs text-slate-700">
                All available seats for this project have been filled.
              </div>
            ) : (
              <button
                onClick={() => {
                  if (!currentUser) {
                    showToast('Please log in to apply for research projects', 'info');
                    navigate('/login');
                    return;
                  }
                  setIsApplyModalOpen(true);
                }}
                className="w-full py-3.5 bg-[#F05A28] hover:bg-orange-600 text-white font-extrabold text-sm rounded-2xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Apply to Join</span>
                <Send className="w-4 h-4" />
              </button>
            )}

            {/* Save Project Toggle Button */}
            <button
              onClick={() => toggleSaveProject(project.id)}
              className={`w-full py-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                isSaved
                  ? 'bg-red-50 border-red-200 text-[#E53935]'
                  : 'bg-white border-[#E3EAF3] text-[#0B2A55] hover:bg-slate-50'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-[#E53935]' : ''}`} />
              <span>{isSaved ? 'Saved in Your Library' : 'Save Project'}</span>
            </button>

            {/* Quick Share */}
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                showToast('Project link copied to clipboard!', 'success');
              }}
              className="w-full py-2.5 rounded-2xl text-xs text-slate-500 hover:text-[#0B2A55] hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Project</span>
            </button>
          </div>

          {/* Similar Projects Section matching Page 4 */}
          <div className="bg-white p-6 rounded-3xl border border-[#E3EAF3] shadow-xs space-y-4">
            <h4 className="text-sm font-extrabold text-[#0B2A55] flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#FFC83D]" />
              <span>Similar Projects</span>
            </h4>
            <div className="space-y-3">
              {similarProjects.map((sim) => (
                <div
                  key={sim.id}
                  onClick={() => navigate(`/projects/${sim.id}`)}
                  className="p-3 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-[#F5F8FC] cursor-pointer transition-colors space-y-1"
                >
                  <p className="text-xs font-bold text-[#0B2A55] line-clamp-1">{sim.title}</p>
                  <p className="text-[11px] text-slate-500">{sim.areaName} · {sim.filledPositions}/{sim.totalPositions} seats</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Apply to Join Modal */}
      {isApplyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-lg text-[#0B2A55]">Apply to Join Project</h3>
              <button onClick={() => setIsApplyModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleApplySubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-[#0B2A55] block mb-1">Applying For:</label>
                <p className="p-2.5 bg-slate-50 rounded-xl font-medium text-slate-800">{project.title}</p>
              </div>

              <div>
                <label className="font-bold text-[#0B2A55] block mb-1">Statement of Motivation / Interest *</label>
                <textarea
                  rows={4}
                  required
                  value={motivationMessage}
                  onChange={(e) => setMotivationMessage(e.target.value)}
                  placeholder="Explain why you are interested in this topic and how your background aligns with the objectives..."
                  className="w-full bg-[#F5F8FC] border border-[#E3EAF3] p-3 rounded-xl focus:outline-hidden focus:border-[#0B6BE6] text-slate-800"
                />
              </div>

              <div>
                <label className="font-bold text-[#0B2A55] block mb-1">Relevant Skills & Experience</label>
                <input
                  type="text"
                  value={skillsNote}
                  onChange={(e) => setSkillsNote(e.target.value)}
                  placeholder="e.g. Python, PyTorch, SQL, Git"
                  className="w-full bg-[#F5F8FC] border border-[#E3EAF3] p-2.5 rounded-xl text-slate-800"
                />
              </div>

              <div>
                <label className="font-bold text-[#0B2A55] block mb-1">Curriculum Vitae (PDF)</label>
                <div className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <FileText className="w-4 h-4 text-[#0B6BE6]" />
                  <span className="font-medium text-slate-700 flex-1 truncate">{cvName}</span>
                  <label className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg font-bold text-slate-600 hover:bg-slate-100 cursor-pointer">
                    Change
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) setCvName(e.target.files[0].name);
                      }}
                    />
                  </label>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsApplyModalOpen(false)}
                  className="px-4 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingApply}
                  className="px-6 py-2.5 bg-[#F05A28] hover:bg-orange-600 disabled:opacity-50 text-white font-extrabold rounded-xl shadow-xs cursor-pointer flex items-center gap-2"
                >
                  {isSubmittingApply ? <span>Submitting...</span> : <span>Submit Application</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Contact Supervisor Modal */}
      {isContactModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-3xl shadow-2xl p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-[#0B2A55]">Message {project.supervisor.name}</h3>
              <button onClick={() => setIsContactModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleContactSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-[#0B2A55] block mb-1">Subject</label>
                <input
                  type="text"
                  required
                  placeholder={`Inquiry regarding ${project.title}`}
                  className="w-full bg-[#F5F8FC] border border-[#E3EAF3] p-2.5 rounded-xl"
                />
              </div>
              <div>
                <label className="font-bold text-[#0B2A55] block mb-1">Message</label>
                <textarea
                  rows={4}
                  required
                  value={contactBody}
                  onChange={(e) => setContactBody(e.target.value)}
                  placeholder="Dear Dr. Fahim Rahman, I would like to inquire about..."
                  className="w-full bg-[#F5F8FC] border border-[#E3EAF3] p-3 rounded-xl"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsContactModalOpen(false)}
                  className="px-4 py-2 font-bold text-slate-500"
                >
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-[#0B6BE6] text-white font-bold rounded-xl">
                  Send Inquiry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
