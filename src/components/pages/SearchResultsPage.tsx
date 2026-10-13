import React, { useState, useEffect } from 'react';
import {
  Search,
  FolderKanban,
  FileText,
  Globe,
  User as UserIcon,
  Layers,
  BookOpen,
  Sparkles,
  ExternalLink,
  Copy,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { searchExternalScholarlyWorks } from '../../services/scholarlySearch';
import { ScholarlyExternalPaper } from '../../types';

interface SearchResultsPageProps {
  navigate: (path: string) => void;
  queryParam?: string;
}

export const SearchResultsPage: React.FC<SearchResultsPageProps> = ({ navigate, queryParam }) => {
  const { projects, papers, users, areas, showToast } = useApp();

  const [query, setQuery] = useState(queryParam || '');
  const [tab, setTab] = useState<'all' | 'projects' | 'papers' | 'scholarly' | 'people' | 'areas'>('all');
  const [scholarlyResults, setScholarlyResults] = useState<ScholarlyExternalPaper[]>([]);
  const [isLoadingScholarly, setIsLoadingScholarly] = useState(false);

  useEffect(() => {
    if (query.trim()) {
      setIsLoadingScholarly(true);
      searchExternalScholarlyWorks(query).then((res) => {
        setScholarlyResults(res);
        setIsLoadingScholarly(false);
      });
    }
  }, [query]);

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

  const filteredAreas = areas.filter(
    (a) => a.name.toLowerCase().includes(q) || a.subfields.some((s) => s.toLowerCase().includes(q))
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Search Input Bar */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-[#E3EAF3] shadow-xs space-y-4">
        <h1 className="text-xl sm:text-2xl font-black text-[#0B2A55]">Global Portal & Scholarly Search</h1>
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects, papers, scholarly literature (OpenAlex/arXiv), scholars..."
            className="w-full bg-[#F5F8FC] border border-[#E3EAF3] text-sm text-[#0B2A55] pl-11 pr-4 py-3 rounded-2xl focus:outline-hidden focus:border-[#0B6BE6]"
          />
          <Search className="w-5 h-5 text-[#0B6BE6] absolute left-4 top-1/2 -translate-y-1/2" />
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1">
          {[
            { id: 'all', label: 'All Results' },
            { id: 'projects', label: `Projects (${filteredProjects.length})` },
            { id: 'papers', label: `CollabX Papers (${filteredPapers.length})` },
            { id: 'scholarly', label: `Global Scholarly (${scholarlyResults.length})` },
            { id: 'people', label: `Researchers (${filteredUsers.length})` },
            { id: 'areas', label: `Areas (${filteredAreas.length})` },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as any)}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-colors cursor-pointer shrink-0 ${
                tab === t.id
                  ? 'bg-[#0B6BE6] text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results Content */}
      <div className="space-y-8">
        {/* Projects Section */}
        {(tab === 'all' || tab === 'projects') && filteredProjects.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-extrabold text-base text-[#0B2A55] flex items-center gap-2">
              <FolderKanban className="w-4 h-4 text-[#0B6BE6]" />
              <span>Matching Research Projects ({filteredProjects.length})</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredProjects.map((p) => (
                <div
                  key={p.id}
                  onClick={() => navigate(`/projects/${p.id}`)}
                  className="bg-white p-4 rounded-2xl border border-[#E3EAF3] hover:shadow-md cursor-pointer transition-all flex items-center gap-4"
                >
                  <img src={p.thumbnail} alt={p.title} className="w-16 h-14 object-cover rounded-xl shrink-0" />
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold text-[#0B6BE6] bg-[#DCE6FB] px-2 py-0.5 rounded">
                      {p.areaName}
                    </span>
                    <h4 className="font-bold text-sm text-[#0B2A55] truncate mt-1">{p.title}</h4>
                    <p className="text-xs text-slate-500">
                      Supervisor:{' '}
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/u/${p.supervisor.id}`);
                        }}
                        className="font-semibold text-[#0B2A55] hover:text-[#0B6BE6] hover:underline cursor-pointer"
                        title={`View ${p.supervisor.name}'s profile`}
                      >
                        {p.supervisor.name}
                      </span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Global Scholarly Papers Section (OpenAlex / arXiv / Crossref) */}
        {(tab === 'all' || tab === 'scholarly') && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-[#0B2A55] flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-600" />
                <span>Global Scholarly Literature (OpenAlex & arXiv Indexed)</span>
              </h3>
              {isLoadingScholarly && (
                <span className="text-xs text-blue-600 font-semibold animate-pulse">Searching global API...</span>
              )}
            </div>

            <div className="space-y-3">
              {scholarlyResults.map((ext) => (
                <div
                  key={ext.id}
                  className="bg-white p-5 rounded-2xl border border-blue-100 hover:border-blue-300 transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                          {ext.source}
                        </span>
                        <span className="text-xs text-slate-500">{ext.year}</span>
                        <span className="text-xs text-slate-400 font-medium">
                          {ext.citationsCount.toLocaleString()} citations
                        </span>
                      </div>
                      <h4 className="font-bold text-base text-[#0B2A55] leading-snug">{ext.title}</h4>
                      <p className="text-xs text-slate-600 leading-relaxed">{ext.abstractSnippet}</p>
                      <p className="text-[11px] text-slate-500">
                        Authors: <span className="font-semibold">{ext.authors.join(', ')}</span>
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-3 text-xs">
                    {ext.oaPdfUrl && (
                      <a
                        href={ext.oaPdfUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#0B6BE6] font-bold hover:underline flex items-center gap-1"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Open Access PDF</span>
                      </a>
                    )}
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(
                          `${ext.authors[0]} et al. (${ext.year}). ${ext.title}. ${ext.doi || ext.url}`
                        );
                        showToast('Citation copied!', 'success');
                      }}
                      className="text-slate-600 hover:text-[#0B2A55] font-semibold cursor-pointer flex items-center gap-1"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Citation</span>
                    </button>
                    <button
                      onClick={() => navigate(`/ai-writer?topic=${encodeURIComponent(ext.title)}`)}
                      className="text-amber-600 hover:text-amber-700 font-bold ml-auto flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Draft in AI Writer</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* People Section */}
        {(tab === 'all' || tab === 'people') && filteredUsers.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-extrabold text-base text-[#0B2A55] flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-[#0E9F6E]" />
              <span>Researchers & Students ({filteredUsers.length})</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {filteredUsers.map((u) => (
                <div
                  key={u.id}
                  onClick={() => navigate(`/u/${u.id}`)}
                  className="bg-white p-4 rounded-2xl border border-[#E3EAF3] hover:shadow-md cursor-pointer transition-all flex items-center gap-3"
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
