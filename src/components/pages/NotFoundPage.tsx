import React from 'react';
import {
  FileQuestion,
  Home,
  FolderGit2,
  Compass,
  FileText,
  Search,
  ArrowLeft,
  HelpCircle,
} from 'lucide-react';

interface NotFoundPageProps {
  navigate: (path: string) => void;
  currentPath?: string;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ navigate, currentPath }) => {
  const displayPath = currentPath || window.location.pathname || '';

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full bg-white rounded-3xl border border-slate-200/80 shadow-xl p-8 sm:p-10 text-center space-y-6">
        {/* Animated / styled Icon */}
        <div className="relative inline-block mx-auto">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#0B2A55]/10 via-[#0B6BE6]/15 to-[#FFC83D]/20 border border-blue-100 flex items-center justify-center text-[#0B6BE6] shadow-inner mx-auto">
            <FileQuestion className="w-10 h-10 text-[#0B6BE6]" />
          </div>
          <span className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full bg-[#E53935] text-white text-[10px] font-black tracking-wider uppercase shadow-xs">
            404
          </span>
        </div>

        {/* Status Badge */}
        <div>
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-50 text-[#0B6BE6] border border-blue-200/60 text-xs font-bold tracking-wide uppercase">
            Page Not Found
          </span>
        </div>

        {/* Headings */}
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-[#0B2A55] tracking-tight sm:text-4xl">
            Lost in the Research Lab?
          </h1>
          <p className="text-slate-600 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
            The page or research asset you requested does not exist, may have been relocated, or the URL contains a typo.
          </p>
        </div>

        {/* Requested URL snippet */}
        {displayPath && (
          <div className="inline-block max-w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-500 truncate">
            Requested: <span className="text-[#0B2A55] font-semibold">{displayPath}</span>
          </div>
        )}

        {/* Quick Navigation Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2 text-left">
          <button
            onClick={() => navigate('/')}
            className="p-3 rounded-xl border border-slate-200 hover:border-[#0B6BE6] hover:bg-blue-50/50 transition-all group cursor-pointer text-left"
          >
            <div className="flex items-center gap-2 mb-1">
              <Home className="w-4 h-4 text-[#0B6BE6]" />
              <span className="text-xs font-bold text-[#0B2A55] group-hover:text-[#0B6BE6]">Home</span>
            </div>
            <p className="text-[11px] text-slate-500 line-clamp-1">Portal landing page</p>
          </button>

          <button
            onClick={() => navigate('/projects')}
            className="p-3 rounded-xl border border-slate-200 hover:border-[#0B6BE6] hover:bg-blue-50/50 transition-all group cursor-pointer text-left"
          >
            <div className="flex items-center gap-2 mb-1">
              <FolderGit2 className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold text-[#0B2A55] group-hover:text-[#0B6BE6]">Projects</span>
            </div>
            <p className="text-[11px] text-slate-500 line-clamp-1">Browse initiatives</p>
          </button>

          <button
            onClick={() => navigate('/research-areas')}
            className="p-3 rounded-xl border border-slate-200 hover:border-[#0B6BE6] hover:bg-blue-50/50 transition-all group cursor-pointer text-left"
          >
            <div className="flex items-center gap-2 mb-1">
              <Compass className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-bold text-[#0B2A55] group-hover:text-[#0B6BE6]">Areas</span>
            </div>
            <p className="text-[11px] text-slate-500 line-clamp-1">Research domains</p>
          </button>

          <button
            onClick={() => navigate('/papers')}
            className="p-3 rounded-xl border border-slate-200 hover:border-[#0B6BE6] hover:bg-blue-50/50 transition-all group cursor-pointer text-left"
          >
            <div className="flex items-center gap-2 mb-1">
              <FileText className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-bold text-[#0B2A55] group-hover:text-[#0B6BE6]">Papers</span>
            </div>
            <p className="text-[11px] text-slate-500 line-clamp-1">Scholarly library</p>
          </button>

          <button
            onClick={() => navigate('/search')}
            className="p-3 rounded-xl border border-slate-200 hover:border-[#0B6BE6] hover:bg-blue-50/50 transition-all group cursor-pointer text-left"
          >
            <div className="flex items-center gap-2 mb-1">
              <Search className="w-4 h-4 text-violet-600" />
              <span className="text-xs font-bold text-[#0B2A55] group-hover:text-[#0B6BE6]">Search</span>
            </div>
            <p className="text-[11px] text-slate-500 line-clamp-1">Find publications</p>
          </button>

          <button
            onClick={() => navigate('/contact')}
            className="p-3 rounded-xl border border-slate-200 hover:border-[#0B6BE6] hover:bg-blue-50/50 transition-all group cursor-pointer text-left"
          >
            <div className="flex items-center gap-2 mb-1">
              <HelpCircle className="w-4 h-4 text-sky-600" />
              <span className="text-xs font-bold text-[#0B2A55] group-hover:text-[#0B6BE6]">Support</span>
            </div>
            <p className="text-[11px] text-slate-500 line-clamp-1">Contact team</p>
          </button>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => window.history.back()}
            className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex-1 py-3 px-4 bg-[#0B6BE6] hover:bg-blue-600 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            Return to Homepage
          </button>
        </div>
      </div>
    </div>
  );
};
