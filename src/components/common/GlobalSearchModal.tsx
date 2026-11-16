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
  GraduationCap,
  Copy,
  Check,
  Tag,
  Compass,
  Building,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { searchExternalScholarlyWorks, formatCitation } from '../../services/scholarlySearch';
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
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'all' | 'scholarly' | 'thesis' | 'projects' | 'papers' | 'people'>('all');
  const [selectedWorkType, setSelectedWorkType] = useState<string>('all');
  const [scholarlyResults, setScholarlyResults] = useState<ScholarlyExternalPaper[]>([]);
  const [isLoadingScholarly, setIsLoadingScholarly] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Keyboard shortcut listener for Ctrl+K, Cmd+K, or Escape
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

  // Debounced search query across global scholarly catalog (Crossref, DOAJ, Europe PMC, arXiv, OpenAlex)
  useEffect(() => {
    if (!isGlobalSearchOpen) return;
    let cancelled = false;
    const timer = setTimeout(() => {
      const filterType = activeTab === 'thesis' ? 'thesis' : selectedWorkType;
      if (globalSearchQuery.trim()) {
        setIsLoadingScholarly(true);
        searchExternalScholarlyWorks(globalSearchQuery, {
          workType: filterType,
          limit: 18,
        }).then((res) => {
          if (!cancelled) {
            setScholarlyResults(res);
            setIsLoadingScholarly(false);
          }
        });
      } else {
        setIsLoadingScholarly(false);
        searchExternalScholarlyWorks('', {
          workType: filterType,
          limit: 8,
        }).then((res) => {
          if (!cancelled) {
            setScholarlyResults(res);
          }
        });
      }
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [globalSearchQuery, isGlobalSearchOpen, activeTab, selectedWorkType]);

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

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (globalSearchQuery.trim()) {
      setIsGlobalSearchOpen(false);
      navigate(`/search?q=${encodeURIComponent(globalSearchQuery.trim())}`);
    }
  };

  const handleCopyCitation = (paper: ScholarlyExternalPaper) => {
    const citation = formatCitation(paper, 'APA');
    navigator.clipboard.writeText(citation);
    setCopiedId(paper.id);
    showToast('Citation (APA) copied to clipboard!', 'success');
    setTimeout(() => setCopiedId(null), 2500);
  };

  const getWorkTypeBadgeStyle = (type?: string) => {
    switch (type) {
      case 'Thesis / Dissertation':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Conference Proceeding':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Preprint':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Journal Article':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Book / Chapter':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const sampleSearchTopics = [
    'Thesis on Machine Learning',
    'Quantum Computing',
    'Agricultural Soil Agronomy',
    'CRISPR Therapeutics',
    'Renewable Solar Energy',
    'Bengali NLP Dissertation',
    'Civil Engineering Concrete',
    'Macroeconomic Inflation',
  ];

  return (
    <div
      onClick={() => setIsGlobalSearchOpen(false)}
      className="fixed inset-0 z-50 flex items-start justify-center pt-10 sm:pt-16 px-3 sm:px-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div
        className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-[#E3EAF3] overflow-hidden flex flex-col max-h-[88vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Search Input */}
        <form onSubmit={handleSearchSubmit} className="p-4 sm:p-5 border-b border-[#E3EAF3] flex items-center gap-3 bg-white">
          <Search className="w-5 h-5 text-[#0B6BE6] shrink-0" />
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
            placeholder="Search ANY topic: research paper, thesis paper, dissertation, journal, author..."
            className="w-full text-sm sm:text-base font-semibold text-[#0B2A55] placeholder-slate-400 focus:outline-hidden"
          />
          {globalSearchQuery && (
            <button
              type="button"
              onClick={() => setGlobalSearchQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsGlobalSearchOpen(false)}
            className="px-2.5 py-1 text-xs font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
          >
            ESC
          </button>
        </form>

        {/* Global Scope Notice Banner */}
        <div className="px-4 py-2 bg-gradient-to-r from-blue-50 via-slate-50 to-indigo-50 border-b border-[#E3EAF3] flex flex-wrap items-center justify-between gap-2 text-[11px] sm:text-xs">
          <div className="flex items-center gap-2 text-slate-700">
            <Globe className="w-3.5 h-3.5 text-[#0B6BE6]" />
            <span className="font-semibold">Universal Global Discovery:</span>
            <span className="text-slate-600 hidden sm:inline">
              Unrestricted by preset portal categories · Indexing 250M+ research papers, theses, & preprints
            </span>
          </div>
          {isLoadingScholarly && (
            <span className="text-[#0B6BE6] font-bold animate-pulse flex items-center gap-1">
              <Compass className="w-3 h-3 animate-spin" /> Querying world scholarly graph...
            </span>
          )}
        </div>

        {/* Primary Filter Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-slate-50 border-b border-[#E3EAF3] text-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {[
              { id: 'all', label: 'All Results' },
              { id: 'scholarly', label: `Global Papers (${scholarlyResults.length})` },
              { id: 'thesis', label: 'Theses & Dissertations' },
              { id: 'projects', label: `CollabX Projects (${filteredProjects.length})` },
              { id: 'papers', label: `Local Repo (${filteredPapers.length})` },
              { id: 'people', label: `Researchers (${filteredUsers.length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-[#0B2A55] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {(activeTab === 'all' || activeTab === 'scholarly') && (
            <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200 overflow-x-auto">
              {[
                { id: 'all', label: 'All Types' },
                { id: 'thesis', label: 'Thesis' },
                { id: 'journal', label: 'Journal' },
                { id: 'conference', label: 'Conference' },
                { id: 'preprint', label: 'Preprint' },
                { id: 'book', label: 'Book' },
              ].map((wt) => (
                <button
                  key={wt.id}
                  onClick={() => setSelectedWorkType(wt.id)}
                  className={`px-2 py-1 rounded-md text-[11px] font-bold transition-colors shrink-0 cursor-pointer ${
                    selectedWorkType === wt.id
                      ? 'bg-[#0B6BE6] text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {wt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quick Topic Chips (when query is empty or exploring) */}
        {!q && (
          <div className="px-4 py-3 bg-white border-b border-slate-100 flex items-center gap-2 overflow-x-auto">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              Try Any Topic:
            </span>
            {sampleSearchTopics.map((topic) => (
              <button
                key={topic}
                onClick={() => setGlobalSearchQuery(topic)}
                className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 hover:bg-blue-50 hover:text-[#0B6BE6] text-slate-700 transition-colors shrink-0 cursor-pointer border border-slate-200/60"
              >
                {topic}
              </button>
            ))}
          </div>
        )}

        {/* Results Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6">
          {/* SECTION 1: GLOBAL SCHOLARLY PAPERS, THESIS & DISSERTATIONS */}
          {(activeTab === 'all' || activeTab === 'scholarly' || activeTab === 'thesis') && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-lg bg-blue-100 text-[#0B6BE6]">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-[#0B2A55] flex items-center gap-2">
                      <span>Global Academic Index (Papers & Theses Across All Disciplines)</span>
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Covers doctoral dissertations, master's theses, peer-reviewed journals, and preprints
                    </p>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                  {scholarlyResults.length} indexed
                </span>
              </div>

              {/* Scholarly Cards */}
              {!isLoadingScholarly && scholarlyResults.length === 0 ? (
                <div className="p-6 rounded-2xl border border-dashed border-slate-300 text-center text-xs text-slate-500">
                  No global papers or theses matched "{globalSearchQuery}" for this document type filter. Try switching to "All Types" or broadening your keywords.
                </div>
              ) : (
                <div className="space-y-3">
                  {scholarlyResults.map((ext) => (
                    <div
                      key={ext.id}
                      className="p-4 rounded-2xl border border-slate-200 hover:border-blue-300 bg-white hover:bg-[#F9FBFE] transition-all shadow-xs space-y-2.5"
                    >
                    {/* Header: Type Badge, Source & Citations */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border ${getWorkTypeBadgeStyle(
                            ext.workType
                          )}`}
                        >
                          {ext.workType || 'Research Paper'}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">
                          {ext.year} · {ext.source}
                        </span>
                        {ext.citationsCount > 0 && (
                          <span className="text-[11px] font-semibold text-slate-500">
                            · {ext.citationsCount.toLocaleString()} citations
                          </span>
                        )}
                      </div>

                      {ext.venueOrHost && (
                        <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium truncate max-w-xs">
                          <Building className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{ext.venueOrHost}</span>
                        </div>
                      )}
                    </div>

                    {/* Title */}
                    <h4 className="text-sm sm:text-base font-bold text-[#0B2A55] leading-snug">
                      {ext.title}
                    </h4>

                    {/* Abstract snippet */}
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                      {ext.abstractSnippet}
                    </p>

                    {/* Authors & Fields of Study */}
                    <div className="flex flex-wrap items-center gap-y-1.5 gap-x-3 text-xs text-slate-500">
                      <div>
                        Authors: <span className="font-semibold text-slate-700">{ext.authors.join(', ')}</span>
                      </div>
                      {ext.fieldsOfStudy && ext.fieldsOfStudy.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 ml-auto">
                          {ext.fieldsOfStudy.slice(0, 3).map((f) => (
                            <span
                              key={f}
                              className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600"
                            >
                              {f}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Action Bar */}
                    <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
                      {ext.oaPdfUrl && (
                        <a
                          href={ext.oaPdfUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#0B6BE6] font-bold flex items-center gap-1.5 transition-colors"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Open Access PDF</span>
                        </a>
                      )}

                      {ext.url && (
                        <a
                          href={ext.url}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-semibold flex items-center gap-1 transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Official Source</span>
                        </a>
                      )}

                      <button
                        onClick={() => handleCopyCitation(ext)}
                        className="px-2.5 py-1 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-semibold cursor-pointer flex items-center gap-1 transition-colors"
                      >
                        {copiedId === ext.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Citation</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => {
                          setIsGlobalSearchOpen(false);
                          navigate(`/ai-writer?topic=${encodeURIComponent(ext.title)}`);
                        }}
                        className="ml-auto px-3 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Cite in AI Writer</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              )}
            </div>
          )}

          {/* SECTION 2: COLLABX RESEARCH PROJECTS */}
          {(activeTab === 'all' || activeTab === 'projects') && filteredProjects.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-lg bg-blue-100 text-[#0B6BE6]">
                    <FolderKanban className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-extrabold text-[#0B2A55]">
                    CollabX Research Projects ({filteredProjects.length})
                  </h3>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredProjects.slice(0, 4).map((p) => (
                  <div
                    key={p.id}
                    onClick={() => handleSelectProject(p.id)}
                    className="flex items-center gap-3 p-3 rounded-2xl hover:bg-[#F5F8FC] border border-slate-200 hover:border-[#E3EAF3] cursor-pointer transition-colors bg-white"
                  >
                    <img
                      src={p.thumbnail}
                      alt={p.title}
                      className="w-14 h-12 object-cover rounded-xl shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-bold text-[#0B6BE6] bg-blue-50 px-1.5 py-0.5 rounded">
                        {p.areaName}
                      </span>
                      <p className="text-xs font-bold text-[#0B2A55] truncate mt-0.5">{p.title}</p>
                      <p className="text-[11px] text-slate-500 truncate">
                        Supervisor: {p.supervisor.name}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 3: COLLABX INTERNAL REPOSITORY PAPERS */}
          {(activeTab === 'all' || activeTab === 'papers') && filteredPapers.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-lg bg-purple-100 text-purple-700">
                    <FileText className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-extrabold text-[#0B2A55]">
                    CollabX Repository Papers ({filteredPapers.length})
                  </h3>
                </div>
              </div>
              <div className="space-y-2">
                {filteredPapers.slice(0, 3).map((paper) => (
                  <div
                    key={paper.id}
                    onClick={() => handleSelectPaper(paper.id)}
                    className="p-3 rounded-2xl hover:bg-[#F5F8FC] border border-slate-200 hover:border-[#E3EAF3] cursor-pointer transition-colors bg-white flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-purple-100 text-purple-800">
                          {paper.paperType}
                        </span>
                        <span className="text-[11px] text-slate-500">{paper.year}</span>
                      </div>
                      <p className="text-xs font-bold text-[#0B2A55] truncate mt-1">{paper.title}</p>
                      <p className="text-[11px] text-slate-500 truncate">
                        By {paper.authors.join(', ')}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 4: RESEARCHERS & SCHOLARS */}
          {(activeTab === 'all' || activeTab === 'people') && filteredUsers.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-lg bg-emerald-100 text-emerald-700">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-extrabold text-[#0B2A55]">
                    Researchers & Scholars ({filteredUsers.length})
                  </h3>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredUsers.slice(0, 4).map((u) => (
                  <div
                    key={u.id}
                    onClick={() => handleSelectUser(u.id)}
                    className="flex items-center gap-3 p-3 rounded-2xl hover:bg-[#F5F8FC] border border-slate-200 hover:border-[#E3EAF3] cursor-pointer transition-colors bg-white"
                  >
                    <img
                      src={u.avatar}
                      alt={u.name}
                      className="w-10 h-10 rounded-full object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[#0B2A55] truncate">{u.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{u.headline}</p>
                      <span className="text-[10px] font-semibold text-[#0B6BE6] capitalize">{u.role}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Helper Bar */}
        <div className="p-3.5 bg-slate-50 border-t border-[#E3EAF3] text-xs text-slate-500 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span>Press</span>
            <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-bold">ESC</kbd>
            <span>to close or</span>
            <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-bold">ENTER</kbd>
            <span>for full page</span>
          </div>
          <button
            onClick={() => {
              setIsGlobalSearchOpen(false);
              navigate(`/search?q=${encodeURIComponent(globalSearchQuery)}`);
            }}
            className="text-[#0B6BE6] font-bold hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Explore All Search Results Page</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
