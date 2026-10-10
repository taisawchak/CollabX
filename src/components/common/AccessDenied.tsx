import React from 'react';
import { ShieldAlert, ArrowLeft, LayoutDashboard, Home } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface AccessDeniedProps {
  navigate: (path: string) => void;
  requiredRole?: string;
  userRole?: string;
  customMessage?: string;
}

export const AccessDenied: React.FC<AccessDeniedProps> = ({
  navigate,
  requiredRole = 'Administrator',
  userRole,
  customMessage,
}) => {
  const { currentUser } = useApp();
  const currentRole = userRole || currentUser?.role || 'Guest';

  const getDashboardPath = () => {
    if (!currentUser) return '/login';
    if (currentUser.role === 'admin') return '/admin';
    if (currentUser.role === 'supervisor' || currentUser.role === 'researcher') return '/researcher';
    return '/dashboard';
  };

  const getDashboardLabel = () => {
    if (!currentUser) return 'Sign In';
    if (currentUser.role === 'admin') return 'Admin Dashboard';
    if (currentUser.role === 'supervisor' || currentUser.role === 'researcher') return 'Researcher Dashboard';
    return 'Student Dashboard';
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-md w-full bg-white rounded-3xl border border-red-100 shadow-xl p-8 text-center space-y-6">
        {/* Shield Icon */}
        <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center mx-auto shadow-inner">
          <ShieldAlert className="w-9 h-9" />
        </div>

        {/* Status Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100/80 text-red-700 text-xs font-black tracking-wide uppercase">
          403 Access Denied
        </div>

        {/* Headings */}
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-[#0B2A55] tracking-tight">
            Restricted Area
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            {customMessage || (
              <>
                You do not have permission to access this page. This area requires{' '}
                <span className="font-bold text-[#0B2A55]">{requiredRole}</span> privileges.
              </>
            )}
          </p>
        </div>

        {/* Current Role Indicator */}
        <div className="p-3 bg-[#F5F8FC] rounded-2xl border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
          <span>Your Current Role:</span>
          <span className="font-bold uppercase tracking-wider text-[#0B6BE6] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
            {currentRole}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => navigate(getDashboardPath())}
            className="flex-1 py-3 px-4 bg-[#0B6BE6] hover:bg-blue-600 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <LayoutDashboard className="w-4 h-4" />
            {getDashboardLabel()}
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            Home Page
          </button>
        </div>
      </div>
    </div>
  );
};
