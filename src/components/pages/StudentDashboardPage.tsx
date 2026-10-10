import React from 'react';
import {
  FolderKanban,
  CheckCircle,
  Clock,
  XCircle,
  Bookmark,
  Sparkles,
  ArrowRight,
  Calendar,
  BookOpen,
  Users,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface StudentDashboardPageProps {
  navigate: (path: string) => void;
}

export const StudentDashboardPage: React.FC<StudentDashboardPageProps> = ({ navigate }) => {
  const { currentUser, applications, savedProjectIds, projects, papers, calendarEvents, getMatchScore } = useApp();

  if (!currentUser) {
    return null;
  }

  const userApps = applications.filter((a) => a.userId === currentUser.id);
  const approvedCount = userApps.filter((a) => a.status === 'approved').length;
  const pendingCount = userApps.filter((a) => a.status === 'pending').length;
  const rejectedCount = userApps.filter((a) => a.status === 'rejected').length;
  const totalAppsCount = userApps.length;
  const savedCount = savedProjectIds.length;

  // Recommended Projects for this student (matching interests & skills)
  const recommendedProjects = projects
    .filter((p) => !userApps.some((a) => a.projectId === p.id && a.status === 'approved'))
    .map((p) => ({
      project: p,
      match: getMatchScore(p, currentUser),
    }))
    .sort((a, b) => b.match.score - a.match.score)
    .slice(0, 4);

  // Recommended Papers
  const recommendedPapers = papers.slice(0, 2);

  // Upcoming deadlines
  const upcomingDeadlines = calendarEvents.slice(0, 3);

  const firstName = currentUser.name.split(' ')[0];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header Banner with Pikachu Mascot Wave matching Page 7 */}
      <div className="bg-white rounded-3xl border border-[#E3EAF3] p-6 sm:p-8 shadow-xs relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DDF5EA] text-[#0E9F6E] text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Student Researcher Portal</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-[#0B2A55] tracking-tight">
            Welcome back, {firstName}!
          </h1>
          <p className="text-xs sm:text-sm text-[#6B7A90] leading-relaxed">
            Track your research applications, laboratory milestones, and personalized AI project recommendations.
          </p>
        </div>

        {/* Mascot Pikachu Waving Graphic matching Page 7 */}
        <div className="relative z-10 flex items-center gap-4 bg-linear-to-r from-amber-50 to-orange-50 border border-amber-200/60 p-4 rounded-2xl shadow-2xs">
          {/* Pikachu stylized avatar */}
          <div className="w-16 h-16 rounded-2xl bg-amber-400 border-2 border-[#0B2A55] flex flex-col items-center justify-center shadow-md relative overflow-hidden shrink-0">
            {/* Cute Pikachu face */}
            <div className="flex gap-4 mb-1">
              <div className="w-2.5 h-2.5 rounded-full bg-[#0B2A55]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#0B2A55]" />
            </div>
            <div className="w-1.5 h-1 bg-[#E53935] rounded-full mb-1" />
            <div className="flex justify-between w-full px-2 absolute bottom-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#E53935]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#E53935]" />
            </div>
          </div>
          <div>
            <p className="text-xs font-black text-[#0B2A55] flex items-center gap-1">
              <span>Pikachu</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-200 text-amber-900 font-bold">Lab Mascot</span>
            </p>
            <p className="text-[11px] text-slate-600 mt-0.5">
              3 new projects match your ML & PyTorch profile!
            </p>
            <button
              onClick={() => navigate('/projects')}
              className="text-[11px] font-bold text-[#0B6BE6] hover:underline mt-1 inline-block"
            >
              Explore Matches →
            </button>
          </div>
        </div>
      </div>

      {/* 5 Pastel Stat Cards Matching Page 7 screenshot */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* 1. Applications (lavender #E9E9FB) */}
        <div
          onClick={() => navigate('/applications')}
          className="bg-[#E9E9FB] p-5 rounded-2xl border border-black/5 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#0B2A55]">Applications</span>
            <FolderKanban className="w-4 h-4 text-purple-600" />
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black text-[#0B2A55]">{totalAppsCount}</span>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">Total Submitted</p>
          </div>
        </div>

        {/* 2. Approved (mint #DDF5EA) */}
        <div
          onClick={() => navigate('/applications?status=approved')}
          className="bg-[#DDF5EA] p-5 rounded-2xl border border-black/5 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#0B2A55]">Approved</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black text-emerald-800">{approvedCount}</span>
            <p className="text-[11px] text-emerald-600 font-medium mt-0.5">Active Positions</p>
          </div>
        </div>

        {/* 3. Pending (green #D9F7E3 - fixed typo from screenshot) */}
        <div
          onClick={() => navigate('/applications?status=pending')}
          className="bg-[#D9F7E3] p-5 rounded-2xl border border-black/5 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#0B2A55]">Pending</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black text-amber-800">{pendingCount}</span>
            <p className="text-[11px] text-amber-700 font-medium mt-0.5">Under Review</p>
          </div>
        </div>

        {/* 4. Rejected (pink #FDE3E3) */}
        <div
          onClick={() => navigate('/applications?status=rejected')}
          className="bg-[#FDE3E3] p-5 rounded-2xl border border-black/5 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#0B2A55]">Rejected</span>
            <XCircle className="w-4 h-4 text-red-500" />
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black text-red-800">{rejectedCount}</span>
            <p className="text-[11px] text-red-600 font-medium mt-0.5">Decided</p>
          </div>
        </div>

        {/* 5. Saved (sky #DEEBFB) */}
        <div
          onClick={() => navigate('/saved')}
          className="bg-[#DEEBFB] p-5 rounded-2xl border border-black/5 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#0B2A55]">Saved</span>
            <Bookmark className="w-4 h-4 text-[#0B6BE6]" />
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black text-[#0B6BE6]">{savedCount}</span>
            <p className="text-[11px] text-blue-600 font-medium mt-0.5">In Bookmarks</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Recommended Projects + Right Deadlines & Papers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2 Cols: Recommended Projects Matching Page 7 */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-[#0B2A55]">Recommended Projects</h3>
              <p className="text-xs text-[#6B7A90]">Grounded on your research interests and skill overlap</p>
            </div>
            <button
              onClick={() => navigate('/projects')}
              className="text-xs font-bold text-[#0B6BE6] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>See all recommendations</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-[#E3EAF3] divide-y divide-slate-100 shadow-xs overflow-hidden">
            {recommendedProjects.map(({ project, match }) => (
              <div
                key={project.id}
                className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <img
                    src={project.thumbnail}
                    alt={project.title}
                    className="w-16 h-14 object-cover rounded-xl shrink-0 border border-slate-100"
                  />
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-[#0E9F6E] bg-[#DDF5EA] px-2 py-0.5 rounded-full">
                        ({match.score}% match)
                      </span>
                      <span className="text-[11px] text-slate-400 truncate">{project.areaName}</span>
                    </div>
                    <h4
                      onClick={() => navigate(`/projects/${project.id}`)}
                      className="font-extrabold text-sm text-[#0B2A55] hover:text-[#0B6BE6] transition-colors truncate cursor-pointer"
                    >
                      {project.title}
                    </h4>
                    <p className="text-[11px] text-[#6B7A90] truncate">
                      Supervisor: {project.supervisor.name} · {project.filledPositions}/{project.totalPositions} positions
                    </p>
                  </div>
                </div>

                {/* Soft Blue View Button matching Page 7 */}
                <button
                  onClick={() => navigate(`/projects/${project.id}`)}
                  className="px-4 py-2 bg-[#DCE6FB] hover:bg-blue-200 text-[#0B6BE6] text-xs font-extrabold rounded-xl shrink-0 transition-colors cursor-pointer"
                >
                  View
                </button>
              </div>
            ))}
          </div>

          {/* Recommended Papers Block */}
          <div className="pt-4">
            <h3 className="text-base font-black text-[#0B2A55] mb-3">Recommended Research Papers</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recommendedPapers.map((paper) => (
                <div
                  key={paper.id}
                  onClick={() => navigate(`/papers?id=${paper.id}`)}
                  className="bg-white p-4 rounded-2xl border border-[#E3EAF3] hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-700">
                      {paper.areaName}
                    </span>
                    <h5 className="font-bold text-xs text-[#0B2A55] line-clamp-2 mt-2 leading-snug">
                      {paper.title}
                    </h5>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span>{paper.year}</span>
                    <span className="text-[#0B6BE6] font-bold">Read PDF →</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Upcoming Deadlines Mini Card */}
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-3xl border border-[#E3EAF3] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="font-extrabold text-sm text-[#0B2A55] flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#E53935]" />
                <span>Upcoming Deadlines</span>
              </h4>
              <button
                onClick={() => navigate('/calendar')}
                className="text-xs text-[#0B6BE6] font-bold hover:underline"
              >
                Calendar
              </button>
            </div>

            <div className="space-y-3">
              {upcomingDeadlines.map((evt) => (
                <div key={evt.id} className="p-3 bg-[#F5F8FC] rounded-2xl border border-slate-100 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      {evt.type}
                    </span>
                    <span className="text-[10px] text-red-600 font-bold bg-red-50 px-1.5 py-0.2 rounded">
                      {evt.date}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-[#0B2A55] leading-snug">{evt.title}</p>
                  {evt.projectName && (
                    <p className="text-[11px] text-slate-500 truncate">{evt.projectName}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Quick AI Paper Writer Promo */}
          <div className="bg-linear-to-br from-amber-500/10 via-orange-500/10 to-amber-500/5 p-5 rounded-3xl border border-amber-200/60 space-y-3">
            <div className="flex items-center gap-2 text-amber-700 font-black text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>AI Research Assistant</span>
            </div>
            <h4 className="font-bold text-sm text-[#0B2A55]">Draft Your Next Paper</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Generate structured academic outlines, verify scholarly citations via OpenAlex, and export to DOCX or PDF.
            </p>
            <button
              onClick={() => navigate('/ai-writer')}
              className="w-full py-2.5 bg-[#FFC83D] hover:bg-amber-400 text-[#0B2A55] font-extrabold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Launch AI Paper Writer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
