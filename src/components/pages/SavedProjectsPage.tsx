import React, { useState } from 'react';
import {
  Bookmark,
  Search,
  Users,
  Calendar,
  Heart,
  Eye,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Project } from '../../types';

interface SavedProjectsPageProps {
  navigate: (path: string) => void;
}

export const SavedProjectsPage: React.FC<SavedProjectsPageProps> = ({ navigate }) => {
  const { currentUser, projects, savedProjectIds, toggleSaveProject } = useApp();

  if (!currentUser) {
    return null;
  }

  const [searchQuery, setSearchQuery] = useState('');
  const [quickViewProject, setQuickViewProject] = useState<Project | null>(null);

  const savedProjects = projects.filter((p) => savedProjectIds.includes(p.id));

  const filtered = savedProjects.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.areaName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.supervisor.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Search & Header matching Page 9 */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-4 border-b border-[#E3EAF3]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0B2A55] tracking-tight">My Saved Projects</h1>
          <p className="text-xs text-[#6B7A90] mt-1">Bookmarked research projects for upcoming application cycles</p>
        </div>

        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search saved projects..."
            className="w-full bg-white border border-[#E3EAF3] text-xs text-[#0B2A55] placeholder-slate-400 pl-9 pr-4 py-2.5 rounded-xl focus:outline-hidden focus:border-[#0B6BE6]"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Saved Projects List matching Page 9 */}
      {filtered.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-3xl border border-[#E3EAF3] space-y-3">
          <Bookmark className="w-12 h-12 text-slate-300 mx-auto" />
          <h4 className="text-base font-bold text-[#0B2A55]">No saved projects yet</h4>
          <p className="text-xs text-slate-500">
            Browse our project catalog and click the bookmark star to save projects to this list.
          </p>
          <button
            onClick={() => navigate('/projects')}
            className="mt-2 px-5 py-2.5 bg-[#0B6BE6] text-white text-xs font-bold rounded-xl"
          >
            Browse Projects
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-[#E3EAF3] shadow-xs divide-y divide-slate-100 overflow-hidden">
          {filtered.map((p) => (
            <div
              key={p.id}
              className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
            >
              {/* Left: Red Heart + Thumbnail + Details matching Page 9 */}
              <div className="flex items-center gap-4 min-w-0">
                {/* Red filled heart button to unsave */}
                <button
                  onClick={() => toggleSaveProject(p.id)}
                  className="p-2 text-[#E53935] hover:scale-110 transition-transform cursor-pointer shrink-0"
                  title="Remove from saved"
                >
                  <Heart className="w-5 h-5 fill-[#E53935]" />
                </button>

                <img
                  src={p.thumbnail}
                  alt={p.title}
                  className="w-16 h-14 object-cover rounded-xl shrink-0 border border-slate-100"
                />

                <div className="space-y-1 min-w-0">
                  <h4
                    onClick={() => navigate(`/projects/${p.id}`)}
                    className="font-extrabold text-sm sm:text-base text-[#0B2A55] hover:text-[#0B6BE6] transition-colors truncate cursor-pointer"
                  >
                    {p.title}
                  </h4>
                  <p className="text-xs text-slate-500 truncate">
                    Supervisor: <span className="font-semibold text-slate-700">{p.supervisor.name}</span> · {p.areaName}
                  </p>
                </div>
              </div>

              {/* Right: Soft-blue View button + View Details button matching Page 9 */}
              <div className="flex items-center justify-end gap-2.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                <button
                  onClick={() => setQuickViewProject(p)}
                  className="px-3.5 py-2 bg-[#DCE6FB] hover:bg-blue-200 text-[#0B6BE6] text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Quick View
                </button>
                <button
                  onClick={() => navigate(`/projects/${p.id}`)}
                  className="px-4 py-2 bg-[#0B6BE6] hover:bg-blue-600 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span>View Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick View Modal */}
      {quickViewProject && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-3xl shadow-2xl p-6 sm:p-8 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#DCE6FB] text-[#0B6BE6]">
                {quickViewProject.areaName}
              </span>
              <button onClick={() => setQuickViewProject(null)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <h3 className="font-black text-lg text-[#0B2A55]">{quickViewProject.title}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{quickViewProject.summary}</p>

            <div className="grid grid-cols-2 gap-3 text-xs p-3 bg-slate-50 rounded-2xl">
              <div>
                <span className="text-slate-400 block font-medium">Supervisor:</span>
                <span className="font-bold text-[#0B2A55]">{quickViewProject.supervisor.name}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Deadline:</span>
                <span className="font-bold text-red-600">{quickViewProject.deadline}</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                onClick={() => setQuickViewProject(null)}
                className="px-4 py-2 text-xs font-bold text-slate-500"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const id = quickViewProject.id;
                  setQuickViewProject(null);
                  navigate(`/projects/${id}`);
                }}
                className="px-5 py-2 text-xs font-bold bg-[#0B6BE6] text-white rounded-xl shadow-xs"
              >
                Go to Full Details →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
