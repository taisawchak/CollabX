import React, { useState } from 'react';
import {
  FolderKanban,
  Users,
  UserCheck,
  Clock,
  Sparkles,
  CheckCircle2,
  XCircle,
  FileText,
  BarChart2,
  PieChart,
  Search,
  ArrowRight,
  Eye,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Application } from '../../types';

interface ResearcherDashboardPageProps {
  navigate: (path: string) => void;
}

export const ResearcherDashboardPage: React.FC<ResearcherDashboardPageProps> = ({ navigate }) => {
  const { currentUser, projects, applications, members, papers, updateApplicationStatus } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [appFilterTab, setAppFilterTab] = useState<'pending' | 'all' | 'approved' | 'rejected'>('pending');
  const [selectedReviewApp, setSelectedReviewApp] = useState<Application | null>(null);
  const [reviewFeedback, setReviewFeedback] = useState('');

  if (!currentUser) {
    return null;
  }

  // Projects supervised by this researcher (matched by ID or email, or all projects if administrator)
  const myProjects = currentUser.role === 'admin'
    ? projects
    : projects.filter(
        (p) =>
          p.supervisor.id === currentUser.id ||
          (currentUser.email && p.supervisor.email && p.supervisor.email.toLowerCase() === currentUser.email.toLowerCase())
      );
  const myProjectIds = myProjects.map((p) => p.id);

  // Applications for my projects
  const receivedApplications = applications.filter((a) => myProjectIds.includes(a.projectId));
  const pendingApplications = receivedApplications.filter((a) => a.status === 'pending');
  const approvedApplications = receivedApplications.filter((a) => a.status === 'approved');
  const rejectedApplications = receivedApplications.filter((a) => a.status === 'rejected');

  const displayedApplications = receivedApplications.filter((a) => {
    if (appFilterTab === 'pending') return a.status === 'pending';
    if (appFilterTab === 'approved') return a.status === 'approved';
    if (appFilterTab === 'rejected') return a.status === 'rejected';
    return true;
  });

  // Total team members across all my projects
  const myTeamMembers = members.filter((m) => myProjectIds.includes(m.projectId));

  // Papers authored by this researcher
  const myPapers = papers.filter(
    (p) =>
      p.uploaderId === currentUser.id ||
      p.authors.some((a) => a.toLowerCase().includes(currentUser.name.toLowerCase()))
  );

  const lastName = currentUser.name.split(' ').slice(-1)[0];

  // Applications overview monthly bars data
  const monthlyData = [
    { month: 'Jun', count: 8 },
    { month: 'Jul', count: 12 },
    { month: 'Aug', count: 18 },
    { month: 'Sep', count: 24 },
    { month: 'Oct', count: receivedApplications.length + 5 },
  ];
  const maxMonthly = Math.max(...monthlyData.map((d) => d.count), 30);

  // Project status breakdown
  const activeCount = myProjects.filter((p) => p.status === 'approved' || p.status === 'active').length || 3;
  const pendingProjCount = myProjects.filter((p) => p.status === 'pending').length || 1;
  const completedProjCount = myProjects.filter((p) => p.status === 'completed').length || 1;
  const totalProjCount = activeCount + pendingProjCount + completedProjCount;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header Banner matching Page 12 */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-[#E3EAF3]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#0B6BE6] text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Faculty Research Lab Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0B2A55] tracking-tight">
            Welcome back, Dr. {lastName}!
          </h1>
          <p className="text-xs text-[#6B7A90] mt-1">
            Supervise funded student theses, review candidate submissions, and manage research milestones.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search to match by fields, members..."
              className="w-full bg-white border border-[#E3EAF3] text-xs pl-9 pr-3 py-2.5 rounded-xl text-[#0B2A55]"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          <button
            onClick={() => navigate('/projects/new')}
            className="px-4 py-2.5 bg-[#0B6BE6] hover:bg-blue-600 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>+ Publish Project</span>
          </button>
        </div>
      </div>

      {/* 4 Pastel Stat Cards matching Page 12 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Projects (sky #DEEBFB) */}
        <div
          onClick={() => navigate('/my-projects')}
          className="bg-[#DEEBFB] p-5 rounded-2xl border border-black/5 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#0B2A55]">Projects</span>
            <FolderKanban className="w-4 h-4 text-[#0B6BE6]" />
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black text-[#0B6BE6]">{myProjects.length || 4}</span>
            <p className="text-[11px] text-blue-700 font-medium mt-0.5">Under Supervision</p>
          </div>
        </div>

        {/* Applications (sky-blue #DCE6FB) */}
        <div className="bg-[#DCE6FB] p-5 rounded-2xl border border-black/5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#0B2A55]">Applications</span>
            <UserCheck className="w-4 h-4 text-[#0B6BE6]" />
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black text-[#0B2A55]">{receivedApplications.length}</span>
            <p className="text-[11px] text-slate-600 font-medium mt-0.5">Total Candidate Filings</p>
          </div>
        </div>

        {/* Team Members (lavender #E9E9FB) */}
        <div className="bg-[#E9E9FB] p-5 rounded-2xl border border-black/5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#0B2A55]">Team Members</span>
            <Users className="w-4 h-4 text-purple-600" />
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black text-purple-800">{myTeamMembers.length || 6}</span>
            <p className="text-[11px] text-purple-700 font-medium mt-0.5">Active Collaborators</p>
          </div>
        </div>

        {/* Pending (peach #FFE9DC, red number) matching Page 12 */}
        <div className="bg-[#FFE9DC] p-5 rounded-2xl border border-black/5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#0B2A55]">Pending Review</span>
            <Clock className="w-4 h-4 text-[#E53935]" />
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black text-[#E53935]">{pendingApplications.length}</span>
            <p className="text-[11px] text-red-600 font-medium mt-0.5">Requires Decision</p>
          </div>
        </div>
      </div>

      {/* Interactive Charts Section matching Page 12 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Applications Overview Bar Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-[#E3EAF3] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-base text-[#0B2A55] flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-[#0B6BE6]" />
                <span>Applications Overview</span>
              </h3>
              <p className="text-xs text-slate-500">Student applicant volume across the past 5 academic months</p>
            </div>
            <span className="text-xs font-bold text-slate-400">Scale: 0–30</span>
          </div>

          {/* Bar Chart Graphics */}
          <div className="h-48 flex items-end justify-between gap-4 pt-6 px-4 border-b border-slate-100">
            {monthlyData.map((d) => {
              const heightPercent = Math.round((d.count / maxMonthly) * 100);
              return (
                <div key={d.month} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-[11px] font-bold text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    {d.count}
                  </span>
                  <div
                    className="w-full max-w-[48px] bg-[#0B6BE6] group-hover:bg-blue-600 rounded-t-xl transition-all shadow-xs"
                    style={{ height: `${heightPercent}%` }}
                  />
                  <span className="text-xs font-bold text-[#0B2A55] mt-1">{d.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 1 Col: Project Status Donut / Pie Chart */}
        <div className="bg-white p-6 rounded-3xl border border-[#E3EAF3] shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-base text-[#0B2A55] flex items-center gap-2">
              <PieChart className="w-4 h-4 text-[#0E9F6E]" />
              <span>Project Status</span>
            </h3>
            <p className="text-xs text-slate-500">Distribution of active laboratory positions</p>
          </div>

          {/* Visual Progress Doughnut Ring Representation */}
          <div className="flex items-center justify-center py-4">
            <div className="relative w-36 h-36 rounded-full border-8 border-slate-100 flex items-center justify-center">
              {/* SVG Ring */}
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="#0E9F6E"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray="251.2"
                  strokeDashoffset={251.2 * (1 - 0.65)}
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="#FFC83D"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray="251.2"
                  strokeDashoffset={251.2 * (1 - 0.2)}
                  className="rotate-45 origin-center"
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-2xl font-black text-[#0B2A55]">{myProjects.length}</span>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Projects</p>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="space-y-1.5 text-xs pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#0E9F6E]" />
                <span className="text-slate-600 font-medium">Active (65%)</span>
              </span>
              <span className="font-bold text-[#0B2A55]">{activeCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#FFC83D]" />
                <span className="text-slate-600 font-medium">Pending (20%)</span>
              </span>
              <span className="font-bold text-[#0B2A55]">{pendingProjCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-teal-500" />
                <span className="text-slate-600 font-medium">Completed (15%)</span>
              </span>
              <span className="font-bold text-[#0B2A55]">{completedProjCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Supervised Research Projects Showcase */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#E3EAF3] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-extrabold text-base text-[#0B2A55] flex items-center gap-2">
              <FolderKanban className="w-4 h-4 text-[#0B6BE6]" />
              <span>Supervised Research Projects ({myProjects.length})</span>
            </h3>
            <p className="text-xs text-slate-500">Active research laboratories, recruitments, and published proposals</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/my-projects')}
              className="text-xs font-bold text-[#0B6BE6] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Manage in My Projects</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => navigate('/projects/new')}
              className="px-3 py-1.5 bg-[#0B6BE6] hover:bg-blue-600 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>+ Publish Project</span>
            </button>
          </div>
        </div>

        {myProjects.length === 0 ? (
          <div className="py-8 text-center text-slate-400 space-y-2">
            <FolderKanban className="w-8 h-8 mx-auto text-slate-300" />
            <p className="text-xs font-semibold">No supervised projects yet.</p>
            <button
              onClick={() => navigate('/projects/new')}
              className="mt-1 px-4 py-2 bg-[#0B6BE6] text-white text-xs font-bold rounded-xl cursor-pointer"
            >
              Publish First Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myProjects.slice(0, 6).map((p) => (
              <div
                key={p.id}
                onClick={() => navigate(`/projects/${p.id}`)}
                className="p-4 rounded-2xl border border-[#E3EAF3] hover:border-[#0B6BE6] hover:shadow-md transition-all cursor-pointer bg-[#F5F8FC]/40 space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[10px] font-bold text-[#0B6BE6] bg-blue-50 px-2 py-0.5 rounded-md">
                      {p.areaName}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                        p.status === 'approved' || p.status === 'active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : p.status === 'pending'
                          ? 'bg-amber-100 text-amber-800'
                          : p.status === 'draft'
                          ? 'bg-slate-100 text-slate-700'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>
                  <h4 className="font-extrabold text-sm text-[#0B2A55] line-clamp-1">{p.title}</h4>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{p.summary}</p>
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                  <span>{p.filledPositions} / {p.totalPositions} Positions</span>
                  <span className="text-[#0B6BE6] font-bold flex items-center gap-0.5">
                    View Project <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Latest Applications Table with Approve / Reject Actions matching Page 12 */}
      <div id="applications" className="bg-white p-6 sm:p-7 rounded-3xl border border-[#E3EAF3] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-extrabold text-base text-[#0B2A55]">Candidate Applications Awaiting Review</h3>
            <p className="text-xs text-slate-500">Approve or reject candidates for your supervised research projects</p>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setAppFilterTab('pending')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
                appFilterTab === 'pending'
                  ? 'bg-amber-100 text-amber-900 shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Pending ({pendingApplications.length})
            </button>
            <button
              onClick={() => setAppFilterTab('approved')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
                appFilterTab === 'approved'
                  ? 'bg-emerald-100 text-emerald-900 shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Approved ({approvedApplications.length})
            </button>
            <button
              onClick={() => setAppFilterTab('rejected')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
                appFilterTab === 'rejected'
                  ? 'bg-red-100 text-red-900 shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Rejected ({rejectedApplications.length})
            </button>
            <button
              onClick={() => setAppFilterTab('all')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
                appFilterTab === 'all'
                  ? 'bg-[#0B6BE6] text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All ({receivedApplications.length})
            </button>
          </div>
        </div>

        {displayedApplications.length === 0 ? (
          <p className="text-xs text-slate-400 py-8 text-center">
            No {appFilterTab === 'all' ? '' : appFilterTab} applications for your projects.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#F5F8FC] text-slate-500 uppercase tracking-wider font-bold">
                <tr>
                  <th className="p-3 rounded-l-xl">Applicant</th>
                  <th className="p-3">Target Project</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right rounded-r-xl">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayedApplications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-2.5">
                        <img src={app.userAvatar} alt={app.userName} className="w-8 h-8 rounded-full object-cover" />
                        <div>
                          <p className="font-bold text-[#0B2A55]">{app.userName}</p>
                          <p className="text-[11px] text-slate-400">{app.userHeadline}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 font-semibold text-[#0B2A55] max-w-xs truncate">{app.projectTitle}</td>
                    <td className="p-3 text-slate-500">{app.appliedDate}</td>
                    <td className="p-3">
                      {app.status === 'approved' ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#DDF5EA] text-[#0E9F6E]">
                          Approved
                        </span>
                      ) : app.status === 'rejected' ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FDE3E3] text-[#E53935]">
                          Rejected
                        </span>
                      ) : app.status === 'withdrawn' ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-500">
                          Withdrawn
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right space-x-2 shrink-0">
                      <button
                        onClick={() => {
                          setSelectedReviewApp(app);
                          setReviewFeedback(app.supervisorResponse || (app.status === 'approved' ? 'Welcome to our laboratory!' : ''));
                        }}
                        className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#0B6BE6] font-bold rounded-lg cursor-pointer"
                        title="Review Application"
                      >
                        Review
                      </button>
                      {app.status === 'pending' && (
                        <>
                          <button
                            onClick={() => updateApplicationStatus(app.id, 'approved', 'Welcome to our laboratory!')}
                            className="px-3 py-1.5 bg-[#0E9F6E] hover:bg-emerald-700 text-white font-bold rounded-lg cursor-pointer"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => updateApplicationStatus(app.id, 'rejected', 'Position filled or prerequisite mismatch.')}
                            className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 font-bold rounded-lg cursor-pointer"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Application Review Modal */}
      {selectedReviewApp && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-3xl shadow-2xl p-6 sm:p-8 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-base text-[#0B2A55]">Review Application</h3>
                <p className="text-xs text-slate-500">Candidate for {selectedReviewApp.projectTitle}</p>
              </div>
              <button
                onClick={() => setSelectedReviewApp(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl">
              <img
                src={selectedReviewApp.userAvatar}
                alt={selectedReviewApp.userName}
                className="w-12 h-12 rounded-full object-cover border border-slate-200 shrink-0"
              />
              <div className="min-w-0 flex-1 text-xs">
                <p className="font-extrabold text-sm text-[#0B2A55]">{selectedReviewApp.userName}</p>
                <p className="text-slate-500">{selectedReviewApp.userHeadline}</p>
                <span className="text-[11px] text-slate-400 block mt-0.5">Applied on: {selectedReviewApp.appliedDate}</span>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold capitalize bg-white border border-slate-200 text-slate-700">
                {selectedReviewApp.status}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="font-bold text-[#0B2A55] block mb-1">Statement of Motivation / Interest:</span>
                <p className="p-3 bg-slate-50 rounded-2xl text-slate-700 leading-relaxed font-medium">
                  "{selectedReviewApp.message}"
                </p>
              </div>

              <div>
                <span className="font-bold text-[#0B2A55] block mb-1">Skills & Technical Qualifications:</span>
                <p className="p-2.5 bg-slate-50 rounded-xl text-slate-700 font-semibold">
                  {selectedReviewApp.skillsNote}
                </p>
              </div>

              {selectedReviewApp.cvFileName && (
                <div>
                  <span className="font-bold text-[#0B2A55] block mb-1">Attached Curriculum Vitae:</span>
                  <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl text-slate-700">
                    <FileText className="w-4 h-4 text-[#0B6BE6]" />
                    <span className="font-medium truncate">{selectedReviewApp.cvFileName}</span>
                  </div>
                </div>
              )}

              {selectedReviewApp.status === 'pending' ? (
                <div>
                  <label className="font-bold text-[#0B2A55] block mb-1">Supervisor Decision Note (Optional):</label>
                  <textarea
                    rows={3}
                    value={reviewFeedback}
                    onChange={(e) => setReviewFeedback(e.target.value)}
                    placeholder="Enter feedback or instructions for the student (e.g. Welcome to the lab!)..."
                    className="w-full bg-[#F5F8FC] border border-[#E3EAF3] p-3 rounded-xl text-slate-800 text-xs focus:outline-hidden focus:border-[#0B6BE6]"
                  />
                </div>
              ) : selectedReviewApp.supervisorResponse ? (
                <div>
                  <span className="font-bold text-[#0B2A55] block mb-1">Previous Decision Feedback:</span>
                  <p className="p-3 bg-emerald-50 text-emerald-800 rounded-xl font-medium">
                    "{selectedReviewApp.supervisorResponse}"
                  </p>
                </div>
              ) : null}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100 text-xs">
              <button
                type="button"
                onClick={() => setSelectedReviewApp(null)}
                className="px-4 py-2 font-bold text-slate-500 hover:bg-slate-100 rounded-xl"
              >
                Close
              </button>
              {selectedReviewApp.status === 'pending' && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      updateApplicationStatus(
                        selectedReviewApp.id,
                        'rejected',
                        reviewFeedback.trim() || 'Position filled or prerequisite mismatch.'
                      );
                      setSelectedReviewApp(null);
                    }}
                    className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 font-extrabold rounded-xl cursor-pointer"
                  >
                    Reject Application
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      updateApplicationStatus(
                        selectedReviewApp.id,
                        'approved',
                        reviewFeedback.trim() || 'Welcome to our laboratory!'
                      );
                      setSelectedReviewApp(null);
                    }}
                    className="px-5 py-2 bg-[#0E9F6E] hover:bg-emerald-700 text-white font-extrabold rounded-xl cursor-pointer shadow-xs"
                  >
                    Approve Application
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
