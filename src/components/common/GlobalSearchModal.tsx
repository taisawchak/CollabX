import React, { useState, useEffect } from 'react';
import {
  Search,
  X,
  FileText,
  FolderKanban,
  User as UserIcon,
  Globe,
  ExternalLink,
  Sparkles,
  BookOpen,
  ArrowRight,
  Layers,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { searchExternalScholarlyWorks } from '../../services/scholarlySearch';
import { ScholarlyExternalPaper } from '../../types';

interface GlobalSearchModalProps {
  navigate: (path: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ navigate }) => {
  const {
    isGlobalSearchOpen,
    setIsGlobalSearchOpen,
    globalSearchQuery,
    setGlobalSearchQuery,
    projects,
    papers,
    users,
    areas,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'all' | 'projects' | 'papers' | 'scholarly' | 'people' | 'areas'>('all');
  const [scholarlyResults, setScholarlyResults] = useState<ScholarlyExternalPaper[]>([]);
  const [isLoadingScholarly, setIsLoadingScholarly] = useState(false);

  // Keyboard shortcut listener for Ctrl+K or /
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsGlobalSearchOpen(true);
      } else if (e.key === 'Escape' && isGlobalSearchOpen) {
        setIsGlobalSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isGlobalSearchOpen, setIsGlobalSearchOpen]);

  // Debounced search query
  useEffect(() => {
    if (!isGlobalSearchOpen) return;
    const timer = setTimeout(() => {
      if (globalSearchQuery.trim()) {
        setIsLoadingScholarly(true);
        searchExternalScholarlyWorks(globalSearchQuery).then((res) => {
          setScholarlyResults(res);
          setIsLoadingScholarly(false);
        });
      } else {
        setScholarlyResults([]);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [globalSearchQuery, isGlobalSearchOpen]);

  if (!isGlobalSearchOpen) return null;

  const q = globalSearchQuery.toLowerCase().trim();

  const filteredProjects = projects.filter(
    (p) =>
      p.title.toLowerCase().includes(q) ||
      p.summary.toLowerCase().includes(q) ||
      p.areaName.toLowerCase().includes(q) ||
      p.requiredSkills.some((s) => s.toLowerCase().includes(q))
  );

  const filteredPapers = papers.filter(
    (p) =>
      p.title.toLowerCase().includes(q) ||
      p.abstract.toLowerCase().includes(q) ||
      p.keywords.some((k) => k.toLowerCase().includes(q)) ||
      p.authors.some((a) => a.toLowerCase().includes(q)) ||
      p.uploaderName.toLowerCase().includes(q)
  );

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(q) ||
      u.headline.toLowerCase().includes(q) ||
      u.department.toLowerCase().includes(q) ||
      u.skills.some((s) => s.toLowerCase().includes(q))
  );

  const filteredAreas = areas.filter(
    (a) =>
      a.name.toLowerCase().includes(q) ||
      a.subfields.some((s) => s.toLowerCase().includes(q))
  );

  const handleSelectProject = (id: string) => {
    setIsGlobalSearchOpen(false);
    navigate(`/projects/${id}`);
  };

  const handleSelectPaper = (id: string) => {
    setIsGlobalSearchOpen(false);
    navigate(`/papers?id=${id}`);
  };

  const handleSelectUser = (id: string) => {
    setIsGlobalSearchOpen(false);
    navigate(`/u/${id}`);
  };

  const handleSelectArea = (slug: string) => {
    setIsGlobalSearchOpen(false);
    navigate(`/projects?area=${slug}`);
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (globalSearchQuery.trim()) {
      setIsGlobalSearchOpen(false);
      navigate(`/search?q=${encodeURIComponent(globalSearchQuery.trim())}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-[#E3EAF3] overflow-hidden flex flex-col max-h-[82vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Search Input */}
        <form onSubmit={handleSearchSubmit} className="p-4 border-b border-[#E3EAF3] flex items-center gap-3">
          <Search className="w-5 h-5 text-[#0B6BE6]" />
          <input
            type="text"
            autoFocus
            value={globalSearchQuery}
            onChange={(e) => setGlobalSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearchSubmit();
              }
            }}
            placeholder="Search projects, papers, areas, scholars globally..."
            className="w-full text-base font-medium text-[#0B2A55] placeholder-slate-400 focus:outline-hidden"
          />
          {globalSearchQuery && (
            <button
              onClick={() => setGlobalSearchQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setIsGlobalSearchOpen(false)}
            className="px-2 py-1 text-xs font-semibold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-md"
          >
            ESC
          </button>
        </form>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 px-4 py-2 bg-slate-50 border-b border-[#E3EAF3] overflow-x-auto text-xs">
          {[
            { id: 'all', label: 'All Results' },
            { id: 'projects', label: `Projects (${filteredProjects.length})` },
            { id: 'papers', label: `CollabX Papers (${filteredPapers.length})` },
            { id: 'scholarly', label: `Global Scholarly (${scholarlyResults.length})` },
            { id: 'people', label: `People (${filteredUsers.length})` },
            { id: 'areas', label: `Areas (${filteredAreas.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-full font-medium transition-colors shrink-0 cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#0B6BE6] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Results Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {!q && (
            <div className="py-8 text-center text-slate-400 space-y-2">
              <Search className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-sm font-medium">Type a search term to find projects, papers, or researchers.</p>
              <p className="text-xs text-slate-400">
                Quick keywords: "AI", "IoT", "Healthcare", "Dr. Fahim", "PyTorch", "Blockchain"
              </p>
            </div>
          )}

          {/* Section: Projects */}
          {(activeTab === 'all' || activeTab === 'projects') && filteredProjects.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <FolderKanban className="w-3.5 h-3.5 text-[#0B6BE6]" />
                  Projects
                </span>
                <span className="text-[11px] text-slate-400">{filteredProjects.length} found</span>
              </div>
              <div className="space-y-2">
                {filteredProjects.slice(0, 4).map((p) => (
                  <div
                    key={p.id}
                    onClick={() => handleSelectProject(p.id)}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#F5F8FC] border border-transparent hover:border-[#E3EAF3] cursor-pointer transition-colors"
                  >
                    <img
                      src={p.thumbnail}
                      alt={p.title}
                      className="w-12 h-10 object-cover rounded-lg shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-[#0B2A55] truncate">{p.title}</p>
                      <p className="text-xs text-[#6B7A90] truncate">
                        {p.areaName} · Supervisor: {p.supervisor.name} · {p.filledPositions}/{p.totalPositions} seats
                      </p>
                    </div>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Open
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section: CollabX Papers */}
          {(activeTab === 'all' || activeTab === 'papers') && filteredPapers.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-purple-600" />
                  CollabX Papers
                </span>
                <span className="text-[11px] text-slate-400">{filteredPapers.length} found</span>
              </div>
              <div className="space-y-2">
                {filteredPapers.slice(0, 6).map((paper) => (
                  <div
                    key={paper.id}
                    onClick={() => handleSelectPaper(paper.id)}
                    className="p-3 rounded-xl hover:bg-[#F5F8FC] border border-slate-100 hover:border-[#E3EAF3] cursor-pointer transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800">
                            {paper.paperType}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            {paper.year} · {paper.areaName}
                          </span>
                        </div>
                        <p className="text-sm font-bold text-[#0B2A55] line-clamp-1 mt-1">{paper.title}</p>
                        <p className="text-xs text-[#6B7A90] mt-0.5 line-clamp-2">
                          {paper.abstract}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Authors: {paper.authors.join(', ')} · Uploader: {paper.uploaderName}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section: Global Scholarly Papers (OpenAlex, arXiv, Crossref) */}
          {(activeTab === 'all' || activeTab === 'scholarly') && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-blue-600" />
                  Global Scholarly Database (OpenAlex & arXiv)
                </span>
                {isLoadingScholarly ? (
                  <span className="text-xs text-blue-600 animate-pulse">Querying scholarly index...</span>
                ) : (
                  <span className="text-[11px] text-slate-400">{scholarlyResults.length} indexed</span>
                )}
              </div>
              <div className="space-y-2">
                {scholarlyResults.slice(0, 3).map((ext) => (
                  <div
                    key={ext.id}
                    className="p-3 rounded-xl border border-blue-50 bg-blue-50/20 hover:bg-blue-50/40 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                            {ext.source}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            {ext.citationsCount.toLocaleString()} citations
                          </span>
                        </div>
                        <h5 className="text-sm font-bold text-[#0B2A55] mt-1">{ext.title}</h5>
                        <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">{ext.abstractSnippet}</p>
                        <p className="text-[11px] text-slate-500 mt-1">
                          By: {ext.authors.join(', ')} ({ext.year})
                        </p>
                      </div>
                    </div>

                    {/* Quick actions for external scholarly papers */}
                    <div className="flex items-center gap-3 mt-2 pt-2 border-t border-slate-200/50 text-xs">
                      {ext.oaPdfUrl && (
                        <a
                          href={ext.oaPdfUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#0B6BE6] hover:underline flex items-center gap-1 font-semibold"
                        >
                          <BookOpen className="w-3 h-3" />
                          Open Access PDF
                        </a>
                      )}
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(
                            `${ext.authors[0]} et al. (${ext.year}). ${ext.title}. ${ext.doi || ext.url}`
                          );
                          showToast('Citation copied to clipboard!', 'success');
                        }}
                        className="text-slate-600 hover:text-slate-900 cursor-pointer"
                      >
                        Copy Citation
                      </button>
                      <button
                        onClick={() => {
                          setIsGlobalSearchOpen(false);
                          navigate(`/ai-writer?topic=${encodeURIComponent(ext.title)}`);
                        }}
                        className="text-amber-600 hover:text-amber-700 font-semibold cursor-pointer flex items-center gap-1 ml-auto"
                      >
                        <Sparkles className="w-3 h-3" />
                        Cite in AI Writer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section: People */}
          {(activeTab === 'all' || activeTab === 'people') && filteredUsers.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <UserIcon className="w-3.5 h-3.5 text-[#0E9F6E]" />
                  Researchers & Students
                </span>
                <span className="text-[11px] text-slate-400">{filteredUsers.length} found</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {filteredUsers.slice(0, 4).map((u) => (
                  <div
                    key={u.id}
                    onClick={() => handleSelectUser(u.id)}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#F5F8FC] border border-slate-100 hover:border-[#E3EAF3] cursor-pointer"
                  >
                    <img
                      src={u.avatar}
                      alt={u.name}
                      className="w-9 h-9 rounded-full object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[#0B2A55] truncate">{u.name}</p>
                      <p className="text-[11px] text-[#6B7A90] truncate">{u.headline}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section: Research Areas */}
          {(activeTab === 'all' || activeTab === 'areas') && filteredAreas.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-amber-500" />
                  Research Areas
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {filteredAreas.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => handleSelectArea(a.slug)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-[#DCE6FB] text-[#0B2A55] transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <span>{a.name}</span>
                    <span className="text-slate-400">({a.projectCount})</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Helper Bar */}
        <div className="p-3 bg-slate-50 border-t border-[#E3EAF3] text-xs text-slate-500 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>Press</span>
            <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-bold">ESC</kbd>
            <span>to close</span>
          </div>
          <button
            onClick={() => {
              setIsGlobalSearchOpen(false);
              navigate(`/search?q=${encodeURIComponent(globalSearchQuery)}`);
            }}
            className="text-[#0B6BE6] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View Full Results Page</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
