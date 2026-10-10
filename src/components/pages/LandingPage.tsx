import React, { useState } from 'react';
import {
  Search,
  ArrowRight,
  Sparkles,
  BookOpen,
  Users,
  Building2,
  FolderKanban,
  CheckCircle,
  Calendar,
  Layers,
  Award,
  Brain,
  BarChart3,
  ShieldCheck,
  Globe,
  Cpu,
  Cloud,
  Dna,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface LandingPageProps {
  navigate: (path: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ navigate }) => {
  const { projects, areas, papers, setIsGlobalSearchOpen, setGlobalSearchQuery } = useApp();
  const [searchInput, setSearchInput] = useState('');

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setGlobalSearchQuery(searchInput);
      navigate(`/search?q=${encodeURIComponent(searchInput)}`);
    } else {
      navigate('/projects');
    }
  };

  const featuredProjects = projects.slice(0, 4);
  const featuredPapers = papers.slice(0, 3);

  // Icon mapper matching ResearchAreasPage
  const getAreaIcon = (iconName: string, areaName?: string) => {
    switch (iconName) {
      case 'Brain':
        return <Brain className="w-7 h-7 sm:w-8 sm:h-8 text-[#E53935]" />;
      case 'BarChart3':
        return <BarChart3 className="w-7 h-7 sm:w-8 sm:h-8 text-[#0E9F6E]" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-7 h-7 sm:w-8 sm:h-8 text-[#0B6BE6]" />;
      case 'Globe':
        return <Globe className="w-7 h-7 sm:w-8 sm:h-8 text-[#F05A28]" />;
      case 'Cpu':
        return <Cpu className="w-7 h-7 sm:w-8 sm:h-8 text-[#0B6BE6]" />;
      case 'Cloud':
        return <Cloud className="w-7 h-7 sm:w-8 sm:h-8 text-[#0E9F6E]" />;
      case 'Dna':
        return <Dna className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-600" />;
      case 'Layers':
        return <Layers className="w-7 h-7 sm:w-8 sm:h-8 text-slate-600" />;
      default: {
        const n = (areaName || '').toLowerCase();
        if (n.includes('artificial') || n.includes('intelligence')) {
          return <Brain className="w-7 h-7 sm:w-8 sm:h-8 text-[#E53935]" />;
        }
        if (n.includes('data')) {
          return <BarChart3 className="w-7 h-7 sm:w-8 sm:h-8 text-[#0E9F6E]" />;
        }
        if (n.includes('cyber') || n.includes('security')) {
          return <ShieldCheck className="w-7 h-7 sm:w-8 sm:h-8 text-[#0B6BE6]" />;
        }
        if (n.includes('web')) {
          return <Globe className="w-7 h-7 sm:w-8 sm:h-8 text-[#F05A28]" />;
        }
        if (n.includes('iot') || n.includes('internet')) {
          return <Cpu className="w-7 h-7 sm:w-8 sm:h-8 text-[#0B6BE6]" />;
        }
        if (n.includes('cloud')) {
          return <Cloud className="w-7 h-7 sm:w-8 sm:h-8 text-[#0E9F6E]" />;
        }
        if (n.includes('bio')) {
          return <Dna className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-600" />;
        }
        return <Layers className="w-7 h-7 sm:w-8 sm:h-8 text-slate-600" />;
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F8FC]">
      {/* 1. HERO SECTION (Pixel-matched to reference screenshot) */}
      <section className="relative min-h-[580px] lg:min-h-[640px] bg-slate-900 overflow-hidden flex items-center">
        {/* Hero Background Anime Artwork matching screenshot */}
        <div
          className="absolute inset-0 bg-cover bg-[position:70%_center] lg:bg-center"
          style={{
            backgroundImage: `url('/hero.jpg')`,
          }}
        />

        {/* Content Container */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 w-full z-10">
          <div className="w-full max-w-[540px]">
            {/* Left Glass Card matching screenshot */}
            <div className="bg-[#0B2545]/85 backdrop-blur-md p-8 sm:p-10 lg:p-12 rounded-[28px] border border-white/10 shadow-2xl space-y-6">
              {/* H1 3 Lines */}
              <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-black tracking-tight leading-[1.08]">
                <span className="block text-white">Research Ideas</span>
                <span className="block text-[#FFC83D] mt-1">Connect People</span>
                <span className="block text-white mt-1">Build the Future</span>
              </h1>

              {/* Subtitle paragraph */}
              <p className="text-slate-100 text-sm sm:text-base leading-relaxed font-normal">
                A platform for students and researchers to discover opportunities, collaborate and turn ideas into impact.
              </p>

              {/* Search Pill Input matching screenshot */}
              <form onSubmit={handleHeroSearch} className="relative flex items-center">
                <div className="relative w-full">
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search projects, areas or skills..."
                    className="w-full bg-white text-[#0B2A55] placeholder-slate-400 text-sm font-medium pl-11 pr-4 py-3.5 rounded-2xl shadow-sm focus:outline-hidden"
                  />
                  <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </form>

              {/* Yellow Explore Projects Button matching screenshot */}
              <div>
                <button
                  onClick={() => navigate('/projects')}
                  className="px-7 py-3.5 rounded-xl bg-[#FFC83D] hover:bg-[#ffc107] text-[#0B2A55] font-black text-base shadow-sm transition-all hover:scale-102 cursor-pointer"
                >
                  Explore Projects
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. STATS BAR (Pixel-matched to reference screenshot) */}
      <div className="w-full bg-white border-b border-[#E3EAF3] shadow-xs">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
          <div className="text-center py-7 px-4">
            <div className="text-3xl sm:text-4xl lg:text-[40px] font-black text-[#0B2A55] tracking-tight">500+</div>
            <div className="text-base sm:text-lg font-semibold text-[#0B2A55] mt-1">
              Projects
            </div>
          </div>
          <div className="text-center py-7 px-4">
            <div className="text-3xl sm:text-4xl lg:text-[40px] font-black text-[#0B2A55] tracking-tight">50+</div>
            <div className="text-base sm:text-lg font-semibold text-[#0B2A55] mt-1">
              Research Areas
            </div>
          </div>
          <div className="text-center py-7 px-4">
            <div className="text-3xl sm:text-4xl lg:text-[40px] font-black text-[#0B2A55] tracking-tight">1000+</div>
            <div className="text-base sm:text-lg font-semibold text-[#0B2A55] mt-1">
              Active Users
            </div>
          </div>
          <div className="text-center py-7 px-4">
            <div className="text-3xl sm:text-4xl lg:text-[40px] font-black text-[#0B2A55] tracking-tight">10+</div>
            <div className="text-base sm:text-lg font-semibold text-[#0B2A55] mt-1">
              Departments
            </div>
          </div>
        </div>
      </div>

      {/* 3. FEATURED RESEARCH AREAS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10">
          <div>
            <div className="text-xs font-bold text-[#0B6BE6] uppercase tracking-wider mb-1">
              Exploration
            </div>
            <h2 className="text-3xl font-extrabold text-[#0B2A55]">Featured Research Areas</h2>
            <p className="text-sm text-[#6B7A90] mt-1">Discover dynamic fields led by PCIU faculty researchers</p>
          </div>
          <button
            onClick={() => navigate('/research-areas')}
            className="mt-4 sm:mt-0 text-sm font-bold text-[#0B6BE6] hover:underline flex items-center gap-1"
          >
            <span>View All Areas</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* 8 Pastel Area Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {areas.map((area) => {
            const liveProjectCount = projects.filter(
              (p) => p.areaId === area.id || p.areaName?.toLowerCase() === area.name.toLowerCase()
            ).length;
            const displayCount = Math.max(area.projectCount, liveProjectCount);

            return (
              <div
                key={area.id}
                onClick={() => navigate(`/projects?area=${area.slug}`)}
                style={{ backgroundColor: area.colorBg }}
                className="p-5 sm:p-6 rounded-2xl border border-black/5 hover:shadow-lg transition-all transform hover:-translate-y-1 cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/80 shadow-xs flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    {getAreaIcon(area.icon, area.name)}
                  </div>
                  <h3 className="font-bold text-base text-[#0B2A55] leading-snug">{area.name}</h3>
                </div>
                <div className="mt-4 pt-3 border-t border-black/5 flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#6B7A90]">{displayCount} Projects</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#0B2A55] group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. LATEST ACTIVE PROJECTS */}
      <section className="bg-white py-16 border-y border-[#E3EAF3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10">
            <div>
              <div className="text-xs font-bold text-[#0E9F6E] uppercase tracking-wider mb-1">
                Opportunities
              </div>
              <h2 className="text-3xl font-extrabold text-[#0B2A55]">Latest Research Projects</h2>
              <p className="text-sm text-[#6B7A90] mt-1">Apply to join high-impact academic and funded initiatives</p>
            </div>
            <button
              onClick={() => navigate('/projects')}
              className="mt-4 sm:mt-0 text-sm font-bold text-[#0B6BE6] hover:underline flex items-center gap-1"
            >
              <span>Browse All Projects</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProjects.map((p) => (
              <div
                key={p.id}
                onClick={() => navigate(`/projects/${p.id}`)}
                className="bg-white rounded-2xl border border-[#E3EAF3] overflow-hidden shadow-xs hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-44 overflow-hidden">
                    <img
                      src={p.thumbnail}
                      alt={p.title}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                    <span className="absolute top-3 right-3 px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-500 text-white shadow-xs">
                      Open
                    </span>
                    <span className="absolute bottom-3 left-3 px-2 py-0.5 text-[11px] font-semibold rounded-md bg-white/90 text-[#0B2A55] backdrop-blur-xs">
                      {p.areaName}
                    </span>
                  </div>

                  <div className="p-4 space-y-2">
                    <h3 className="font-bold text-base text-[#0B2A55] line-clamp-2 leading-snug">
                      {p.title}
                    </h3>
                    <p className="text-xs text-[#6B7A90] line-clamp-2">{p.summary}</p>
                  </div>
                </div>

                <div className="p-4 pt-0 border-t border-slate-100 mt-2">
                  <div className="flex items-center justify-between text-xs text-slate-500 pt-3">
                    <div className="flex items-center gap-2">
                      <img
                        src={p.supervisor.avatar}
                        alt={p.supervisor.name}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      <span className="font-medium text-[#0B2A55] truncate max-w-[90px]">
                        {p.supervisor.name.split(' ')[0]} {p.supervisor.name.split(' ')[1]}
                      </span>
                    </div>
                    <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      {p.filledPositions}/{p.totalPositions} Seats
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. HOW IT WORKS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-[#FFC83D] bg-[#0B2A55] px-3 py-1 rounded-full">
            Collaboration Pipeline
          </span>
          <h2 className="text-3xl font-extrabold text-[#0B2A55] mt-3">How CollabX Works</h2>
          <p className="text-sm text-[#6B7A90] mt-2">
            Seamlessly bridging academic interest with real research publication
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              step: '01',
              title: 'Create Account',
              desc: 'Sign up as a Student, Researcher, or Supervisor with your institutional profile.',
              color: 'bg-blue-50 text-blue-600',
            },
            {
              step: '02',
              title: 'Explore & Match',
              desc: 'Discover projects aligned with your skills and get weighted recommendation match scores.',
              color: 'bg-amber-50 text-amber-600',
            },
            {
              step: '03',
              title: 'Apply & Join Team',
              desc: 'Submit your statement and CV. Supervisors review and accept qualified contributors.',
              color: 'bg-emerald-50 text-emerald-600',
            },
            {
              step: '04',
              title: 'Publish & Impact',
              desc: 'Track milestones, chat in project rooms, draft with AI tools, and publish peer-reviewed papers.',
              color: 'bg-purple-50 text-purple-600',
            },
          ].map((item) => (
            <div
              key={item.step}
              className="bg-white p-6 rounded-2xl border border-[#E3EAF3] shadow-xs hover:shadow-md transition-shadow relative"
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg mb-4 ${item.color}`}
              >
                {item.step}
              </div>
              <h4 className="text-base font-bold text-[#0B2A55] mb-2">{item.title}</h4>
              <p className="text-xs text-[#6B7A90] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. LATEST RESEARCH PAPERS PREVIEW */}
      <section className="bg-[#DEEBFB]/30 py-16 border-t border-[#E3EAF3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8">
            <div>
              <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
                Open Access Library
              </div>
              <h2 className="text-3xl font-extrabold text-[#0B2A55]">Recent Research Papers</h2>
              <p className="text-sm text-[#6B7A90] mt-1">
                Peer-reviewed contributions authored by PCIU faculty and student scholars
              </p>
            </div>
            <button
              onClick={() => navigate('/papers')}
              className="mt-4 sm:mt-0 text-sm font-bold text-[#0B6BE6] hover:underline flex items-center gap-1"
            >
              <span>Explore All Papers</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredPapers.map((paper) => (
              <div
                key={paper.id}
                onClick={() => navigate(`/papers?id=${paper.id}`)}
                className="bg-white p-6 rounded-2xl border border-[#E3EAF3] shadow-xs hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#DCE6FB] text-[#0B6BE6]">
                      {paper.paperType}
                    </span>
                    <span className="text-xs text-slate-400">·</span>
                    <span className="text-xs text-slate-500">{paper.year}</span>
                    {paper.aiAssisted && (
                      <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-semibold ml-auto">
                        AI-Assisted
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-base text-[#0B2A55] line-clamp-2 mb-2 leading-snug">
                    {paper.title}
                  </h4>
                  <p className="text-xs text-[#6B7A90] line-clamp-3 mb-4 leading-relaxed">
                    {paper.abstract}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="truncate max-w-[170px]">{paper.authors.join(', ')}</span>
                  <span className="font-semibold text-[#0B6BE6] hover:underline">Read PDF →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
