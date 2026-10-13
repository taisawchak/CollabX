import React, { useState } from 'react';
import {
  FileText,
  Search,
  Download,
  Share2,
  Bookmark,
  Sparkles,
  BookOpen,
  Copy,
  Check,
  Eye,
  Heart,
  Plus,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Paper } from '../../types';

interface PapersListPageProps {
  navigate: (path: string) => void;
  selectedPaperId?: string;
}

export const PapersListPage: React.FC<PapersListPageProps> = ({ navigate, selectedPaperId }) => {
  const { papers, uploadPaper, incrementPaperDownload, likePaper, showToast, areas, currentUser, users } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArea, setSelectedArea] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [sortBy, setSortBy] = useState<'latest' | 'views' | 'downloads'>('latest');

  const renderAuthorList = (authorNames: string[]) => {
    return authorNames.map((name, idx) => {
      const cleanName = name.trim();
      const matchedUser = users.find(
        (u) =>
          u.name.toLowerCase() === cleanName.toLowerCase() ||
          cleanName.toLowerCase().includes(u.name.toLowerCase()) ||
          u.name.toLowerCase().includes(cleanName.toLowerCase())
      );

      return (
        <React.Fragment key={idx}>
          {idx > 0 && ', '}
          {matchedUser ? (
            <span
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/u/${matchedUser.id}`);
              }}
              className="text-[#0B2A55] hover:text-[#0B6BE6] hover:underline font-semibold cursor-pointer"
              title={`View ${matchedUser.name}'s profile`}
            >
              {cleanName}
            </span>
          ) : (
            <span>{cleanName}</span>
          )}
        </React.Fragment>
      );
    });
  };

  // Reader Modal
  const [readingPaper, setReadingPaper] = useState<Paper | null>(() => {
    if (selectedPaperId) return papers.find((p) => p.id === selectedPaperId) || null;
    return null;
  });

  // Keep reader in sync when selectedPaperId changes via URL navigation or search
  React.useEffect(() => {
    if (selectedPaperId) {
      const match = papers.find((p) => p.id === selectedPaperId);
      if (match) setReadingPaper(match);
    }
  }, [selectedPaperId, papers]);

  // Citation Tab State in Reader Modal
  const [citationFormat, setCitationFormat] = useState<'apa' | 'ieee' | 'bibtex'>('apa');
  const [copiedCitation, setCopiedCitation] = useState(false);

  // Upload Paper Modal
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [upTitle, setUpTitle] = useState('');
  const [upAbstract, setUpAbstract] = useState('');
  const [upAreaId, setUpAreaId] = useState('area-ai');
  const [upType, setUpType] = useState<Paper['paperType']>('Journal');
  const [upAuthors, setUpAuthors] = useState(currentUser?.name || 'Dr. Fahim Rahman');
  const [upKeywords, setUpKeywords] = useState('Deep Learning, Machine Learning');
  const [upIsAiAssisted, setUpIsAiAssisted] = useState(false);

  const filteredPapers = papers.filter((p) => {
    if (selectedArea !== 'all' && p.areaId !== selectedArea) return false;
    if (selectedType !== 'all' && p.paperType !== selectedType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchAbstract = p.abstract.toLowerCase().includes(q);
      const matchAuthors = p.authors.some((a) => a.toLowerCase().includes(q));
      const matchKeyword = p.keywords.some((k) => k.toLowerCase().includes(q));
      if (!matchTitle && !matchAbstract && !matchAuthors && !matchKeyword) return false;
    }
    return true;
  }).sort((a, b) => {
    if (sortBy === 'views') return b.views - a.views;
    if (sortBy === 'downloads') return b.downloads - a.downloads;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!upTitle.trim() || !upAbstract.trim()) return;

    const matchedArea = areas.find((a) => a.id === upAreaId);

    const newP = uploadPaper({
      title: upTitle.trim(),
      abstract: upAbstract.trim(),
      areaId: upAreaId,
      areaName: matchedArea?.name || 'Computer Science',
      paperType: upType,
      authors: upAuthors.split(',').map((a) => a.trim()).filter(Boolean),
      keywords: upKeywords.split(',').map((k) => k.trim()).filter(Boolean),
      aiAssisted: upIsAiAssisted,
    });

    setIsUploadModalOpen(false);
    setUpTitle('');
    setUpAbstract('');
    setReadingPaper(newP);
  };

  const handleCopyCitation = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCitation(true);
    showToast('Citation copied to clipboard!', 'success');
    setTimeout(() => setCopiedCitation(false), 2000);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header & Upload Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-4 border-b border-[#E3EAF3]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Open Access Scholarly Repository</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0B2A55] tracking-tight">Research Papers</h1>
          <p className="text-xs text-[#6B7A90] mt-1">
            Discover, read, cite, and publish peer-reviewed papers by Port City International University scholars
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/ai-writer')}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Paper Writer</span>
          </button>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="px-4 py-2.5 bg-[#0B6BE6] hover:bg-blue-600 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Upload Paper</span>
          </button>
        </div>
      </div>

      {/* Search & Filters Row */}
      <div className="bg-white p-4 rounded-2xl border border-[#E3EAF3] shadow-xs flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search papers by title, abstract, authors, keywords..."
            className="w-full bg-[#F5F8FC] border border-[#E3EAF3] pl-9 pr-3 py-2 rounded-xl text-[#0B2A55]"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={selectedArea}
            onChange={(e) => setSelectedArea(e.target.value)}
            className="bg-[#F5F8FC] border border-[#E3EAF3] px-3 py-2 rounded-xl text-[#0B2A55] font-medium"
          >
            <option value="all">All Research Areas</option>
            {areas.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-[#F5F8FC] border border-[#E3EAF3] px-3 py-2 rounded-xl text-[#0B2A55] font-medium"
          >
            <option value="all">All Paper Types</option>
            <option value="Journal">Journal</option>
            <option value="Conference">Conference</option>
            <option value="Thesis">Thesis</option>
            <option value="Preprint">Preprint</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-[#F5F8FC] border border-[#E3EAF3] px-3 py-2 rounded-xl text-[#0B2A55] font-semibold"
          >
            <option value="latest">Latest</option>
            <option value="views">Most Viewed</option>
            <option value="downloads">Most Downloaded</option>
          </select>
        </div>
      </div>

      {/* Papers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPapers.map((paper) => (
          <div
            key={paper.id}
            onClick={() => setReadingPaper(paper)}
            className="bg-white p-6 rounded-3xl border border-[#E3EAF3] shadow-xs hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#DCE6FB] text-[#0B6BE6]">
                  {paper.paperType}
                </span>
                <span className="text-xs text-slate-400 font-semibold">{paper.year}</span>
                {paper.aiAssisted && (
                  <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold ml-auto">
                    AI-Assisted
                  </span>
                )}
              </div>

              <h3 className="font-extrabold text-base text-[#0B2A55] group-hover:text-[#0B6BE6] transition-colors line-clamp-2 leading-snug">
                {paper.title}
              </h3>

              <p className="text-xs text-[#6B7A90] line-clamp-3 leading-relaxed">
                {paper.abstract}
              </p>

              <div className="flex flex-wrap gap-1 pt-1">
                {paper.keywords.slice(0, 3).map((kw) => (
                  <span key={kw} className="text-[10px] px-2 py-0.5 bg-slate-50 border border-slate-100 rounded-md text-slate-500">
                    {kw}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <div className="truncate max-w-[200px] font-medium">
                {renderAuthorList(paper.authors)}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[#0B6BE6] font-bold group-hover:underline">Read PDF →</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* In-Browser PDF Reader & Citation Modal */}
      {readingPaper && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-4xl w-full max-h-[92vh] overflow-y-auto rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 animate-in zoom-in-95">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-[#DCE6FB] text-[#0B6BE6]">
                    {readingPaper.paperType}
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">{readingPaper.year}</span>
                  {readingPaper.doi && (
                    <span className="text-xs text-slate-500 font-mono">DOI: {readingPaper.doi}</span>
                  )}
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-[#0B2A55]">{readingPaper.title}</h2>
                <div className="text-xs text-slate-500 flex flex-wrap items-center gap-2">
                  <span>Authors:</span>
                  <span className="font-bold text-[#0B2A55]">{renderAuthorList(readingPaper.authors)}</span>
                  {readingPaper.uploaderId && (
                    <span className="pl-2 border-l border-slate-200">
                      Uploaded by{' '}
                      <span
                        onClick={() => {
                          setReadingPaper(null);
                          navigate(`/u/${readingPaper.uploaderId}`);
                        }}
                        className="text-[#0B6BE6] hover:underline font-bold cursor-pointer"
                        title={`View ${readingPaper.uploaderName}'s profile`}
                      >
                        {readingPaper.uploaderName}
                      </span>
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => setReadingPaper(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full"
              >
                ✕
              </button>
            </div>

            {/* Quick Stats & Action Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 rounded-2xl text-xs">
              <div className="flex items-center gap-4 text-slate-600">
                <span>{readingPaper.views} Views</span>
                <span>·</span>
                <span>{readingPaper.downloads} Downloads</span>
                <span>·</span>
                <button
                  onClick={() => likePaper(readingPaper.id)}
                  className="flex items-center gap-1 text-red-500 hover:text-red-600 font-bold cursor-pointer"
                >
                  <Heart className="w-3.5 h-3.5 fill-red-500" />
                  <span>{readingPaper.likes}</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    incrementPaperDownload(readingPaper.id);
                    window.open(readingPaper.pdfUrl, '_blank');
                    showToast('Initiating manuscript download', 'info');
                  }}
                  className="px-4 py-2 bg-[#0B6BE6] hover:bg-blue-600 text-white font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>
              </div>
            </div>

            {/* Abstract */}
            <div className="space-y-2">
              <h4 className="font-extrabold text-sm text-[#0B2A55]">Abstract</h4>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed p-4 bg-[#F5F8FC] rounded-2xl border border-slate-100">
                {readingPaper.abstract}
              </p>
            </div>

            {/* In-Browser PDF Reader Preview Frame */}
            <div className="space-y-2">
              <h4 className="font-extrabold text-sm text-[#0B2A55] flex items-center justify-between">
                <span>In-Browser PDF Viewer Preview</span>
                <span className="text-xs text-slate-400 font-normal">Official Academic Document</span>
              </h4>
              <div className="w-full h-80 sm:h-96 rounded-2xl border border-[#E3EAF3] bg-slate-100 overflow-hidden relative">
                <iframe
                  src={`${readingPaper.pdfUrl}#toolbar=0`}
                  title="PDF Reader"
                  className="w-full h-full"
                />
              </div>
            </div>

            {/* Citation Generator */}
            <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-sm text-[#0B2A55]">Cite This Work</h4>
                <div className="flex items-center gap-1">
                  {(['apa', 'ieee', 'bibtex'] as const).map((fmt) => (
                    <button
                      key={fmt}
                      onClick={() => setCitationFormat(fmt)}
                      className={`px-2.5 py-1 rounded-lg font-bold uppercase text-[10px] cursor-pointer ${
                        citationFormat === fmt ? 'bg-[#0B6BE6] text-white' : 'bg-white text-slate-600'
                      }`}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative p-3 bg-white border border-slate-200 rounded-xl font-mono text-[11px] text-slate-700">
                <p>
                  {citationFormat === 'apa'
                    ? readingPaper.citationsAPA
                    : citationFormat === 'ieee'
                    ? readingPaper.citationsIEEE
                    : readingPaper.citationsBibTeX}
                </p>
                <button
                  onClick={() =>
                    handleCopyCitation(
                      citationFormat === 'apa'
                        ? readingPaper.citationsAPA
                        : citationFormat === 'ieee'
                        ? readingPaper.citationsIEEE
                        : readingPaper.citationsBibTeX
                    )
                  }
                  className="absolute right-2 top-2 p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 cursor-pointer"
                  title="Copy Citation"
                >
                  {copiedCitation ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Paper Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl p-6 sm:p-8 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-[#0B2A55]">Publish Research Paper</h3>
              <button onClick={() => setIsUploadModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-[#0B2A55] block mb-1">Paper Title *</label>
                <input
                  type="text"
                  required
                  value={upTitle}
                  onChange={(e) => setUpTitle(e.target.value)}
                  placeholder="e.g. Federated Edge Intelligence in Wireless Sensor Networks"
                  className="w-full bg-[#F5F8FC] border border-[#E3EAF3] p-2.5 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-[#0B2A55] block mb-1">Abstract *</label>
                <textarea
                  rows={4}
                  required
                  value={upAbstract}
                  onChange={(e) => setUpAbstract(e.target.value)}
                  placeholder="Provide the complete paper abstract describing background, methods, results, and conclusion..."
                  className="w-full bg-[#F5F8FC] border border-[#E3EAF3] p-2.5 rounded-xl font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#0B2A55] block mb-1">Research Area</label>
                  <select
                    value={upAreaId}
                    onChange={(e) => setUpAreaId(e.target.value)}
                    className="w-full bg-[#F5F8FC] border border-[#E3EAF3] p-2.5 rounded-xl font-medium"
                  >
                    {areas.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#0B2A55] block mb-1">Paper Type</label>
                  <select
                    value={upType}
                    onChange={(e) => setUpType(e.target.value as any)}
                    className="w-full bg-[#F5F8FC] border border-[#E3EAF3] p-2.5 rounded-xl font-medium"
                  >
                    <option value="Journal">Journal</option>
                    <option value="Conference">Conference</option>
                    <option value="Thesis">Thesis</option>
                    <option value="Preprint">Preprint</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-[#0B2A55] block mb-1">Authors (Comma-separated)</label>
                <input
                  type="text"
                  value={upAuthors}
                  onChange={(e) => setUpAuthors(e.target.value)}
                  className="w-full bg-[#F5F8FC] border border-[#E3EAF3] p-2.5 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-[#0B2A55] block mb-1">Keywords</label>
                <input
                  type="text"
                  value={upKeywords}
                  onChange={(e) => setUpKeywords(e.target.value)}
                  className="w-full bg-[#F5F8FC] border border-[#E3EAF3] p-2.5 rounded-xl font-medium"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="aiCheck"
                  checked={upIsAiAssisted}
                  onChange={(e) => setUpIsAiAssisted(e.target.checked)}
                  className="rounded border-slate-300 text-amber-500"
                />
                <label htmlFor="aiCheck" className="text-slate-600 font-medium">
                  This work incorporates AI-assisted research drafting (AI disclosure compliance)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 font-bold text-slate-500"
                >
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-[#0B6BE6] text-white font-bold rounded-xl shadow-xs">
                  Publish to Repository
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
