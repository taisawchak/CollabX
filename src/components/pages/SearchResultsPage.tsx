import React, { useState, useEffect } from 'react';
import {
  Search,
  FolderKanban,
  FileText,
  Globe,
  User as UserIcon,
  BookOpen,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  Building,
  GraduationCap,
  Filter,
  Layers,
  ArrowRight,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { searchExternalScholarlyWorks, formatCitation } from '../../services/scholarlySearch';
import { ScholarlyExternalPaper } from '../../types';

interface SearchResultsPageProps {
  navigate: (path: string) => void;
  queryParam?: string;
}

export const SearchResultsPage: React.FC<SearchResultsPageProps> = ({ navigate, queryParam }) => {
  const { projects, papers, users, showToast } = useApp();

  const [query, setQuery] = useState(queryParam || '');
  const [tab, setTab] = useState<'all' | 'scholarly' | 'thesis' | 'projects' | 'papers' | 'people'>('all');
  const [workTypeFilter, setWorkTypeFilter] = useState<string>('all');
  const [scholarlyResults, setScholarlyResults] = useState<ScholarlyExternalPaper[]>([]);
  const [isLoadingScholarly, setIsLoadingScholarly] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Sync with incoming queryParam
  useEffect(() => {
    if (queryParam !== undefined) {
      setQuery(queryParam);
    }
  }, [queryParam]);

  useEffect(() => {
    let cancelled = false;
    setIsLoadingScholarly(true);

    // Keep URL in sync when typing on /search
    if (window.location.pathname === '/search') {
      const targetUrl = query.trim() ? `/search?q=${encodeURIComponent(query.trim())}` : '/search';
      if (window.location.pathname + window.location.search !== targetUrl) {
        window.history.replaceState({}, '', targetUrl);
      }
    }

    const timer = setTimeout(() => {
      const targetType = tab === 'thesis' ? 'thesis' : workTypeFilter;
      searchExternalScholarlyWorks(query, {
        workType: targetType,
        limit: 24,
      }).then((res) => {
        if (!cancelled) {
          setScholarlyResults(res);
          setIsLoadingScholarly(false);
        }
      });
    }, 220);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, tab, workTypeFilter]);

  const q = query.toLowerCase().trim();

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
      p.authors.some((a) => a.toLowerCase().includes(q))
  );

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(q) ||
      u.headline.toLowerCase().includes(q) ||
      u.department.toLowerCase().includes(q) ||
      u.skills.some((s) => s.toLowerCase().includes(q))
  );

  const handleCopyCitation = (paper: ScholarlyExternalPaper, style: 'APA' | 'IEEE' | 'BibTeX' = 'APA') => {
    const text = formatCitation(paper, style);
    navigator.clipboard.writeText(text);
    setCopiedId(paper.id);
    showToast(`Citation (${style}) copied to clipboard!`, 'success');
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
    'Quantum Key Distribution',
    'CRISPR Gene Therapy',
    'Precision Agriculture & IoT',
    'Geopolymer Concrete Dissertation',
    'Renewable Biohydrogen Thesis',
    'Bengali NLP Morphological Analysis',
    'Macroeconomic Supply Chain Models',
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Search Banner */}
      <div className="bg-white p-5 sm:p-8 rounded-3xl border border-[#E3EAF3] shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#0B6BE6] text-xs font-bold mb-2">
              <Globe className="w-3.5 h-3.5" />
              <span>Universal Academic Search (250M+ Works Worldwide)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#0B2A55] tracking-tight">
              Global Scholarly & Literature Discovery
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Find every type of research paper, master's thesis, doctoral dissertation, conference proceeding, and preprint across all disciplines.
            </p>
          </div>
        </div>

        {/* Search Input Box */}
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search ANY research topic, thesis title, author, DOI, or keyword across the world..."
            className="w-full bg-[#F5F8FC] border border-[#E3EAF3] text-sm sm:text-base font-medium text-[#0B2A55] pl-12 pr-10 py-3.5 rounded-2xl focus:outline-hidden focus:border-[#0B6BE6] focus:bg-white transition-all shadow-inner"
          />
          <Search className="w-5 h-5 text-[#0B6BE6] absolute left-4 top-1/2 -translate-y-1/2" />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-full cursor-pointer"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick Topic Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-1 text-xs">
          <span className="text-slate-400 font-bold uppercase tracking-wider shrink-0">Explore Topics:</span>
          {sampleSearchTopics.map((topic) => (
            <button
              key={topic}
              onClick={() => setQuery(topic)}
              className="px-3 py-1 rounded-full bg-slate-100 hover:bg-blue-50 hover:text-[#0B6BE6] text-slate-700 font-medium transition-colors shrink-0 cursor-pointer border border-slate-200/60"
            >
              {topic}
            </button>
          ))}
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1">
            {[
              { id: 'all', label: 'All Results' },
              { id: 'scholarly', label: `Global Papers & Theses (${scholarlyResults.length})` },
              { id: 'thesis', label: 'Theses & Dissertations' },
              { id: 'projects', label: `CollabX Projects (${filteredProjects.length})` },
              { id: 'papers', label: `Local Repo (${filteredPapers.length})` },
              { id: 'people', label: `Researchers (${filteredUsers.length})` },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id as any)}
                className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer shrink-0 ${
                  tab === t.id
                    ? 'bg-[#0B2A55] text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Work Type Filter Sub-Bar */}
          {(tab === 'all' || tab === 'scholarly') && (
            <div className="flex items-center gap-1 text-xs bg-slate-50 p-1 rounded-xl border border-slate-200">
              <span className="text-slate-400 px-2 font-semibold">Filter Type:</span>
              {[
                { id: 'all', label: 'All Types' },
                { id: 'thesis', label: 'Thesis' },
                { id: 'journal', label: 'Journal' },
                { id: 'conference', label: 'Conference' },
                { id: 'preprint', label: 'Preprint' },
                { id: 'book', label: 'Book' },
              ].map((ft) => (
                <button
                  key={ft.id}
                  onClick={() => setWorkTypeFilter(ft.id)}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                    workTypeFilter === ft.id
                      ? 'bg-white text-[#0B6BE6] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {ft.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Results Content Area */}
      <div className="space-y-8">
        {/* GLOBAL SCHOLARLY PAPERS & THESES */}
        {(tab === 'all' || tab === 'scholarly' || tab === 'thesis') && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-100 text-[#0B6BE6]">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg text-[#0B2A55]">
                    Global Academic Papers, Theses & Dissertations
                  </h3>
                  <p className="text-xs text-slate-500">
                    Live indexing from Crossref, DOAJ, Europe PMC, arXiv & OpenAlex across every discipline worldwide
                  </p>
                </div>
              </div>
              {isLoadingScholarly ? (
                <span className="text-xs text-[#0B6BE6] font-bold animate-pulse">
                  Querying world academic index...
                </span>
              ) : (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">
                  {scholarlyResults.length} global records found
                </span>
              )}
            </div>

            {!isLoadingScholarly && scholarlyResults.length === 0 ? (
              <div className="bg-white p-8 rounded-3xl border border-dashed border-slate-300 text-center space-y-2">
                <Globe className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="font-bold text-sm text-[#0B2A55]">No global scholarly records matched "{query}"</p>
                <p className="text-xs text-slate-500">
                  Try adjusting your keywords or selecting "All Types" to search across journals, theses, conferences, books, and preprints.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
              {scholarlyResults.map((ext) => (
                <div
                  key={ext.id}
                  className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 hover:border-blue-300 transition-all shadow-xs space-y-3.5"
                >
                  {/* Top line: Type Badge, Source, Citations, Venue */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-lg text-xs font-black uppercase tracking-wider border ${getWorkTypeBadgeStyle(
                          ext.workType
                        )}`}
                      >
                        {ext.workType || 'Research Paper'}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        {ext.year} · Indexed by {ext.source}
                      </span>
                      {ext.citationsCount > 0 && (
                        <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                          {ext.citationsCount.toLocaleString()} citations
                        </span>
                      )}
                    </div>

                    {ext.venueOrHost && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium truncate max-w-md">
                        <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{ext.venueOrHost}</span>
                      </div>
                    )}
                  </div>

                  {/* Title */}
                  <h4 className="font-bold text-base sm:text-lg text-[#0B2A55] leading-snug">
                    {ext.title}
                  </h4>

                  {/* Abstract snippet */}
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {ext.abstractSnippet}
                  </p>

                  {/* Authors and Concepts/Fields */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
                    <div className="text-slate-500">
                      Authors: <span className="font-semibold text-slate-800">{ext.authors.join(', ')}</span>
                    </div>

                    {ext.fieldsOfStudy && ext.fieldsOfStudy.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5">
                        {ext.fieldsOfStudy.map((f) => (
                          <span
                            key={f}
                            className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-600"
                          >
                            {f}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Action Bar */}
                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-3 text-xs">
                    {ext.oaPdfUrl && (
                      <a
                        href={ext.oaPdfUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#0B6BE6] font-bold flex items-center gap-1.5 transition-colors"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Download Open-Access PDF</span>
                      </a>
                    )}

                    {ext.url && (
                      <a
                        href={ext.url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Publisher / DOI</span>
                      </a>
                    )}

                    <button
                      onClick={() => handleCopyCitation(ext, 'APA')}
                      className="px-3 py-1.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-semibold cursor-pointer flex items-center gap-1.5 transition-colors"
                    >
                      {copiedId === ext.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700">Copied APA!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Citation</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleCopyCitation(ext, 'BibTeX')}
                      className="px-2.5 py-1.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 text-[11px] font-mono cursor-pointer"
                      title="Copy BibTeX code"
                    >
                      BibTeX
                    </button>

                    <button
                      onClick={() => navigate(`/ai-writer?topic=${encodeURIComponent(ext.title)}`)}
                      className="ml-auto px-3.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>Draft with AI Paper Writer</span>
                    </button>
                  </div>
                </div>
              ))}
              </div>
            )}
          </div>
        )}

        {/* COLLABX PROJECTS SECTION */}
        {(tab === 'all' || tab === 'projects') && filteredProjects.length > 0 && (
          <div className="space-y-4 pt-4">
            <h3 className="font-extrabold text-base sm:text-lg text-[#0B2A55] flex items-center gap-2">
              <FolderKanban className="w-5 h-5 text-[#0B6BE6]" />
              <span>CollabX Research Projects ({filteredProjects.length})</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredProjects.map((p) => (
                <div
                  key={p.id}
                  onClick={() => navigate(`/projects/${p.id}`)}
                  className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 hover:border-[#E3EAF3] hover:shadow-md cursor-pointer transition-all flex items-center gap-4"
                >
                  <img src={p.thumbnail} alt={p.title} className="w-18 h-16 object-cover rounded-xl shrink-0" />
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold text-[#0B6BE6] bg-[#DCE6FB] px-2 py-0.5 rounded">
                      {p.areaName}
                    </span>
                    <h4 className="font-bold text-sm text-[#0B2A55] truncate mt-1">{p.title}</h4>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      Supervisor: <span className="font-semibold text-slate-700">{p.supervisor.name}</span>
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {p.filledPositions}/{p.totalPositions} seats filled · {p.difficulty}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* COLLABX PAPERS REPOSITORY SECTION */}
        {(tab === 'all' || tab === 'papers') && filteredPapers.length > 0 && (
          <div className="space-y-4 pt-4">
            <h3 className="font-extrabold text-base sm:text-lg text-[#0B2A55] flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-600" />
              <span>CollabX University Repository Papers ({filteredPapers.length})</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPapers.map((paper) => (
                <div
                  key={paper.id}
                  onClick={() => navigate(`/papers?id=${paper.id}`)}
                  className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 hover:border-purple-300 hover:shadow-md cursor-pointer transition-all space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800">
                      {paper.paperType}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      {paper.year} · {paper.areaName}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-[#0B2A55] line-clamp-1">{paper.title}</h4>
                  <p className="text-xs text-slate-600 line-clamp-2">{paper.abstract}</p>
                  <p className="text-[11px] text-slate-500">By {paper.authors.join(', ')}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PEOPLE SECTION */}
        {(tab === 'all' || tab === 'people') && filteredUsers.length > 0 && (
          <div className="space-y-4 pt-4">
            <h3 className="font-extrabold text-base sm:text-lg text-[#0B2A55] flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-[#0E9F6E]" />
              <span>Researchers & Scholars ({filteredUsers.length})</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {filteredUsers.map((u) => (
                <div
                  key={u.id}
                  onClick={() => navigate(`/u/${u.id}`)}
                  className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-emerald-300 hover:shadow-md cursor-pointer transition-all flex items-center gap-3"
                >
                  <img src={u.avatar} alt={u.name} className="w-12 h-12 rounded-full object-cover shrink-0" />
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-sm text-[#0B2A55] truncate">{u.name}</h4>
                    <p className="text-xs text-slate-500 truncate">{u.headline}</p>
                    <p className="text-[11px] text-[#0B6BE6] capitalize font-medium">{u.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
