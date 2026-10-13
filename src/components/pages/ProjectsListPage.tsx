import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Calendar,
  Users,
  ChevronDown,
  RotateCcw,
  Sparkles,
  Bookmark,
  CheckCircle2,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface ProjectsListPageProps {
  navigate: (path: string) => void;
  initialAreaSlug?: string;
}

export const ProjectsListPage: React.FC<ProjectsListPageProps> = ({ navigate, initialAreaSlug }) => {
  const { projects, areas, currentUser, toggleSaveProject, savedProjectIds, getMatchScore } = useApp();

  // Search & Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArea, setSelectedArea] = useState<string>(() => {
    if (initialAreaSlug) {
      const match = areas.find((a) => a.slug === initialAreaSlug);
      return match ? match.id : 'all';
    }
    return 'all';
  });
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(['Active', 'Upcoming']);
  const [sortBy, setSortBy] = useState<'latest' | 'deadline' | 'popular' | 'best_match'>('latest');
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Available skills collected from projects
  const allSkills = useMemo(() => {
    const counts: Record<string, number> = {};
    projects.forEach((p) => {
      p.requiredSkills.forEach((s) => {
        counts[s] = (counts[s] || 0) + 1;
      });
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [projects]);

  const handleSkillToggle = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const handleStatusToggle = (status: string) => {
    setSelectedStatuses((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
  };

  const resetFilters = () => {
    setSelectedArea('all');
    setSelectedType('all');
    setSelectedSkills([]);
    setSelectedStatuses(['Active', 'Upcoming']);
    setSearchQuery('');
  };

  // Filter & Sort Logic
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = p.title.toLowerCase().includes(q);
        const matchesSummary = p.summary.toLowerCase().includes(q);
        const matchesArea = p.areaName.toLowerCase().includes(q);
        const matchesSupervisor = p.supervisor.name.toLowerCase().includes(q);
        const matchesSkill = p.requiredSkills.some((s) => s.toLowerCase().includes(q));
        if (!matchesTitle && !matchesSummary && !matchesArea && !matchesSupervisor && !matchesSkill) {
          return false;
        }
      }

      // Area
      if (selectedArea !== 'all' && p.areaId !== selectedArea) {
        return false;
      }

      // Project Type
      if (selectedType !== 'all' && p.projectType !== selectedType) {
        return false;
      }

      // Skills
      if (selectedSkills.length > 0) {
        const hasSkill = selectedSkills.some((sk) =>
          p.requiredSkills.some((ps) => ps.toLowerCase() === sk.toLowerCase())
        );
        if (!hasSkill) return false;
      }

      // Status
      if (selectedStatuses.length > 0) {
        const isOwner = currentUser && (
          p.supervisor.id === currentUser.id ||
          (currentUser.email && p.supervisor.email && p.supervisor.email.toLowerCase() === currentUser.email.toLowerCase()) ||
          currentUser.role === 'admin'
        );
        const pStatus = p.status === 'approved' ? 'Active' : p.status.charAt(0).toUpperCase() + p.status.slice(1);
        if (!selectedStatuses.includes(pStatus) && !isOwner) {
          return false;
        }
      }

      return true;
    });
  }, [projects, searchQuery, selectedArea, selectedType, selectedSkills, selectedStatuses]);

  // Sort
  const sortedProjects = useMemo(() => {
    const list = [...filteredProjects];
    if (sortBy === 'deadline') {
      return list.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
    }
    if (sortBy === 'popular') {
      return list.sort((a, b) => b.views - a.views);
    }
    if (sortBy === 'best_match') {
      return list.sort((a, b) => {
        const scoreA = getMatchScore(a, currentUser).score;
        const scoreB = getMatchScore(b, currentUser).score;
        return scoreB - scoreA;
      });
    }
    // Default: latest
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [filteredProjects, sortBy, currentUser, getMatchScore]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Bar with Wide Search matching Page 3 */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-4 border-b border-[#E3EAF3]">
        <div className="relative flex-1 max-w-2xl">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects, labs, areas, researchers..."
            className="w-full bg-white border border-[#E3EAF3] text-sm text-[#0B2A55] placeholder-slate-400 pl-11 pr-4 py-3 rounded-2xl shadow-2xs focus:outline-hidden focus:border-[#0B6BE6]"
          />
          <Search className="w-5 h-5 text-[#0B6BE6] absolute left-4 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          <button
            onClick={() => setIsMobileFiltersOpen(true)}
            className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-white border border-[#E3EAF3] rounded-xl text-xs font-semibold text-[#0B2A55] shadow-2xs"
          >
            <Filter className="w-4 h-4 text-[#0B6BE6]" />
            <span>Filters ({selectedSkills.length + (selectedArea !== 'all' ? 1 : 0)})</span>
          </button>

          {(currentUser?.role === 'supervisor' || currentUser?.role === 'researcher' || currentUser?.role === 'admin') && (
            <button
              onClick={() => navigate('/projects/new')}
              className="px-4 py-2.5 bg-[#0B6BE6] hover:bg-blue-600 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>+ Publish Project</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Left Filter Panel + Right Projects List */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Left Filter Panel (Desktop) */}
        <div className="hidden lg:block bg-white p-5 rounded-2xl border border-[#E3EAF3] shadow-xs space-y-6 sticky top-20">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-extrabold text-base text-[#0B2A55] flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#0B6BE6]" />
              <span>Filters</span>
            </h3>
            <button
              onClick={resetFilters}
              className="text-xs text-slate-500 hover:text-red-500 flex items-center gap-1 cursor-pointer font-medium"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          {/* Research Area Select */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#0B2A55] uppercase tracking-wider">Research Area</label>
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="w-full bg-[#F5F8FC] border border-[#E3EAF3] text-xs font-medium text-[#0B2A55] p-2.5 rounded-xl focus:outline-hidden"
            >
              <option value="all">All Research Areas</option>
              {areas.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.projectCount})
                </option>
              ))}
            </select>
          </div>

          {/* Project Type Select */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#0B2A55] uppercase tracking-wider">Project Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full bg-[#F5F8FC] border border-[#E3EAF3] text-xs font-medium text-[#0B2A55] p-2.5 rounded-xl focus:outline-hidden"
            >
              <option value="all">All Project Types</option>
              <option value="Thesis">Thesis</option>
              <option value="Funded Research">Funded Research</option>
              <option value="Course Project">Course Project</option>
              <option value="Open Source">Open Source</option>
              <option value="Competition">Competition</option>
              <option value="Industry">Industry</option>
            </select>
          </div>

          {/* Required Skills Checkboxes */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#0B2A55] uppercase tracking-wider">Required Skills</label>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {allSkills.slice(0, 8).map(([skill, count]) => {
                const checked = selectedSkills.includes(skill);
                return (
                  <label
                    key={skill}
                    className="flex items-center justify-between text-xs text-[#0B2A55] hover:bg-slate-50 p-1.5 rounded-lg cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => handleSkillToggle(skill)}
                        className="rounded border-slate-300 text-[#0B6BE6] focus:ring-[#0B6BE6]"
                      />
                      <span className="font-medium">{skill}</span>
                    </div>
                    <span className="text-[11px] text-slate-400">({count})</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Status Checkboxes */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="text-xs font-bold text-[#0B2A55] uppercase tracking-wider">Status</label>
            <div className="space-y-1.5">
              {['Active', 'Upcoming', 'Pending', 'Completed'].map((status) => {
                const checked = selectedStatuses.includes(status);
                return (
                  <label
                    key={status}
                    className="flex items-center gap-2 text-xs text-[#0B2A55] hover:bg-slate-50 p-1.5 rounded-lg cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleStatusToggle(status)}
                      className="rounded border-slate-300 text-[#0E9F6E] focus:ring-[#0E9F6E]"
                    />
                    <span className="font-medium">{status}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Yellow Apply Filters Button matching Page 3 */}
          <button
            onClick={() => {}}
            className="w-full py-2.5 rounded-xl bg-[#FFC83D] hover:bg-amber-400 text-[#0B2A55] font-extrabold text-xs shadow-xs transition-colors cursor-pointer"
          >
            Apply Filters
          </button>
        </div>

        {/* Right Projects List */}
        <div className="lg:col-span-3 space-y-4">
          {/* Header Row: Result Count + Sort by Dropdown */}
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-[#E3EAF3] text-xs">
            <span className="font-bold text-[#0B2A55]">
              Showing <span className="text-[#0B6BE6]">{sortedProjects.length}</span> research projects
            </span>

            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-[#F5F8FC] border border-[#E3EAF3] text-xs font-semibold text-[#0B2A55] py-1.5 px-3 rounded-xl focus:outline-hidden"
              >
                <option value="latest">Latest</option>
                <option value="deadline">Deadline soon</option>
                <option value="popular">Most popular</option>
                <option value="best_match">Best match (Profile AI)</option>
              </select>
            </div>
          </div>

          {/* Project Rows Matching Page 3 screenshot */}
          {sortedProjects.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-[#E3EAF3] space-y-3">
              <Filter className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-base font-bold text-[#0B2A55]">No projects match your filter criteria</p>
              <p className="text-xs text-slate-500">Try loosening your skill tags or resetting the filters.</p>
              <button
                onClick={resetFilters}
                className="mt-2 px-4 py-2 bg-[#DCE6FB] text-[#0B6BE6] text-xs font-bold rounded-xl"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedProjects.map((p) => {
                const isSaved = savedProjectIds.includes(p.id);
                const match = getMatchScore(p, currentUser);

                return (
                  <div
                    key={p.id}
                    onClick={() => navigate(`/projects/${p.id}`)}
                    className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E3EAF3] hover:border-blue-300 hover:shadow-md transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
                  >
                    {/* Left: 140x105 Thumbnail + Details */}
                    <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
                      {/* 140x105 Thumbnail */}
                      <img
                        src={p.thumbnail}
                        alt={p.title}
                        className="w-28 sm:w-[140px] h-20 sm:h-[105px] object-cover rounded-xl shrink-0 border border-slate-100 group-hover:scale-102 transition-transform"
                      />

                      <div className="space-y-1.5 min-w-0">
                        {/* Chips row */}
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-[#DCE6FB] text-[#0B6BE6]">
                            {p.areaName}
                          </span>
                          <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-slate-100 text-slate-600">
                            {p.projectType}
                          </span>
                          {match.score >= 80 && (
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-100 text-emerald-800">
                              {match.score}% match
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <h4 className="font-extrabold text-base text-[#0B2A55] group-hover:text-[#0B6BE6] transition-colors leading-snug line-clamp-1">
                          {p.title}
                        </h4>

                        {/* Supervisor info & seat counter */}
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-0.5">
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/u/${p.supervisor.id}`);
                            }}
                            className="flex items-center gap-1.5 cursor-pointer group/sup hover:text-[#0B6BE6]"
                            title={`View ${p.supervisor.name}'s profile`}
                          >
                            <img
                              src={p.supervisor.avatar}
                              alt={p.supervisor.name}
                              className="w-5 h-5 rounded-full object-cover group-hover/sup:ring-1 group-hover/sup:ring-[#0B6BE6]"
                            />
                            <span className="font-semibold text-[#0B2A55] group-hover/sup:text-[#0B6BE6] group-hover/sup:underline">
                              {p.supervisor.name}
                            </span>
                          </div>
                          <span>·</span>
                          <div className="flex items-center gap-1 text-slate-600">
                            <Users className="w-3.5 h-3.5 text-slate-400" />
                            <span>
                              {p.filledPositions}/{p.totalPositions} seats
                            </span>
                          </div>
                        </div>

                        {/* Required skills */}
                        <div className="flex flex-wrap gap-1 pt-1">
                          {p.requiredSkills.slice(0, 3).map((sk) => (
                            <span key={sk} className="text-[10px] px-1.5 py-0.5 bg-slate-50 border border-slate-200 rounded text-slate-600">
                              {sk}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Open Badge + Deadline + Save Heart */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      <div className="flex items-center gap-2">
                        {p.filledPositions >= p.totalPositions ? (
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-200 text-slate-700">
                            Full
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#DDF5EA] text-[#0E9F6E]">
                            Open
                          </span>
                        )}

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSaveProject(p.id);
                          }}
                          className={`p-1.5 rounded-full border transition-colors cursor-pointer ${
                            isSaved
                              ? 'bg-red-50 border-red-200 text-[#E53935]'
                              : 'bg-white border-slate-200 text-slate-400 hover:text-red-500'
                          }`}
                          title={isSaved ? 'Remove from Saved' : 'Save Project'}
                        >
                          <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-[#E53935]' : ''}`} />
                        </button>
                      </div>

                      {/* Red calendar outline icon + deadline date */}
                      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                        <Calendar className="w-3.5 h-3.5 text-[#E53935]" />
                        <span>Deadline: {new Date(p.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Offcanvas Filter Modal */}
      {isMobileFiltersOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex justify-end">
          <div className="bg-white w-full max-w-sm h-full p-6 space-y-6 overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-[#0B2A55]">Filters</h3>
              <button onClick={() => setIsMobileFiltersOpen(false)} className="p-1">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            {/* Same filter items */}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#0B2A55]">Research Area</label>
                <select
                  value={selectedArea}
                  onChange={(e) => setSelectedArea(e.target.value)}
                  className="w-full mt-1 bg-slate-50 border border-slate-200 text-xs p-2 rounded-xl"
                >
                  <option value="all">All Areas</option>
                  {areas.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => setIsMobileFiltersOpen(false)}
                className="w-full py-3 bg-[#FFC83D] text-[#0B2A55] font-bold text-xs rounded-xl"
              >
                Apply & View ({sortedProjects.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
