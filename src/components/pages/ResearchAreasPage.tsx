import React, { useState } from 'react';
import {
  Brain,
  BarChart3,
  ShieldCheck,
  Globe,
  Cpu,
  Cloud,
  Dna,
  Layers,
  ArrowRight,
  Search,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface ResearchAreasPageProps {
  navigate: (path: string) => void;
}

export const ResearchAreasPage: React.FC<ResearchAreasPageProps> = ({ navigate }) => {
  const { areas, projects } = useApp();
  const [searchFilter, setSearchFilter] = useState('');

  // Icon mapper
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Brain':
        return <Brain className="w-8 h-8 text-[#E53935]" />;
      case 'BarChart3':
        return <BarChart3 className="w-8 h-8 text-[#0E9F6E]" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-8 h-8 text-[#0B6BE6]" />;
      case 'Globe':
        return <Globe className="w-8 h-8 text-[#F05A28]" />;
      case 'Cpu':
        return <Cpu className="w-8 h-8 text-[#0B6BE6]" />;
      case 'Cloud':
        return <Cloud className="w-8 h-8 text-[#0E9F6E]" />;
      case 'Dna':
        return <Dna className="w-8 h-8 text-emerald-600" />;
      default:
        return <Layers className="w-8 h-8 text-slate-600" />;
    }
  };

  const filteredAreas = areas.filter(
    (a) =>
      a.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      a.subfields.some((s) => s.toLowerCase().includes(searchFilter.toLowerCase()))
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Top Header & Search matching Page 2 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#E3EAF3]">
        <div>
          <h1 className="text-3xl font-extrabold text-[#0B2A55] tracking-tight">Explore Research Areas</h1>
          <p className="text-sm text-[#6B7A90] mt-1">
            Find domains that match your interests, discover faculty-led projects, and connect with peers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full md:w-72">
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search research fields..."
              className="w-full bg-white border border-[#E3EAF3] text-sm text-[#0B2A55] placeholder-slate-400 pl-9 pr-4 py-2 rounded-xl focus:outline-hidden focus:border-[#0B6BE6]"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          <button
            onClick={() => navigate('/about')}
            className="p-2 text-slate-400 hover:text-[#0B2A55] hover:bg-white rounded-xl border border-[#E3EAF3] transition-colors"
            title="Help & Guidelines"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 4x2 Pastel Grid Matching Page 2 screenshot */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredAreas.map((area) => {
          // Live count of approved projects in this area
          const liveProjectCount = projects.filter((p) => p.areaId === area.id || p.areaName.toLowerCase() === area.name.toLowerCase()).length;
          const displayCount = Math.max(area.projectCount, liveProjectCount);

          return (
            <div
              key={area.id}
              onClick={() => navigate(`/projects?area=${area.slug}`)}
              style={{ backgroundColor: area.colorBg }}
              className="p-6 rounded-2xl border border-black/5 hover:shadow-xl transition-all transform hover:-translate-y-1 cursor-pointer flex flex-col justify-between group min-h-[200px]"
            >
              <div>
                {/* Icon Container */}
                <div className="w-14 h-14 rounded-2xl bg-white/80 shadow-xs flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  {getIcon(area.icon)}
                </div>

                <h3 className="font-extrabold text-xl text-[#0B2A55] leading-snug">{area.name}</h3>

                {/* Subfields Preview */}
                <div className="flex flex-wrap gap-1 mt-3">
                  {area.subfields.slice(0, 3).map((sub) => (
                    <span
                      key={sub}
                      className="text-[10px] bg-white/70 text-[#0B2A55] px-2 py-0.5 rounded-full font-medium"
                    >
                      {sub}
                    </span>
                  ))}
                  {area.subfields.length > 3 && (
                    <span className="text-[10px] text-slate-500 font-semibold self-center">
                      +{area.subfields.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-black/5 flex items-center justify-between">
                <span className="text-xs font-bold text-[#6B7A90]">
                  {displayCount} Projects
                </span>
                <span className="text-xs font-bold text-[#0B6BE6] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  <span>Explore</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Suggestion Banner */}
      <div className="bg-linear-to-r from-[#0B2A55] to-[#0A1F44] text-white p-6 sm:p-8 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6 shadow-lg">
        <div className="space-y-2 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[#FFC83D] text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Propose an Interdisciplinary Domain</span>
          </div>
          <h4 className="text-xl font-bold">Don't see your specific research specialization?</h4>
          <p className="text-xs text-slate-300 max-w-xl">
            CollabX administrators regularly configure newly emerging sub-domains upon faculty and student thesis
            proposals. Contact the portal coordinator to request a specialization tag.
          </p>
        </div>
        <button
          onClick={() => navigate('/contact')}
          className="px-5 py-2.5 bg-[#FFC83D] hover:bg-amber-400 text-[#0B2A55] font-bold text-xs rounded-xl shadow-md transition-all shrink-0 cursor-pointer"
        >
          Contact Coordinator
        </button>
      </div>
    </div>
  );
};
