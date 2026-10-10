import React, { useState } from 'react';
import { UserCheck, Shield, GraduationCap, RotateCcw, ChevronDown, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const DemoSwitcher: React.FC = () => {
  const { currentUser, switchDemoUser, resetToInitialSeed } = useApp();
  const [isOpen, setIsOpen] = useState(false);

  const demoAccounts = [
    { id: 'user-ash', name: 'Ash Ketchum', role: 'student', desc: 'Undergraduate ML Student' },
    { id: 'user-fahim', name: 'Dr. Fahim Rahman', role: 'supervisor', desc: 'AI Lab Director & Supervisor' },
    { id: 'user-sarhan', name: 'Dr. Sarhan', role: 'supervisor', desc: 'IoT Solutions Professor' },
    { id: 'user-admin', name: 'Admin CollabX', role: 'admin', desc: 'System Moderator & Admin' },
  ];

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <div className="relative">
        {isOpen && (
          <div className="absolute bottom-12 right-0 w-72 bg-white rounded-2xl shadow-2xl border border-[#E3EAF3] p-3 animate-in fade-in slide-in-from-bottom-2 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
              <span className="font-bold text-[#0B2A55]">Quick Role Switcher</span>
              <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-semibold">
                Demo Bar
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mb-2">
              Select an identity to test student, supervisor, and administrator capabilities:
            </p>
            <div className="space-y-1">
              {demoAccounts.map((acc) => {
                const isCurrent = currentUser?.id === acc.id;
                return (
                  <button
                    key={acc.id}
                    onClick={() => {
                      switchDemoUser(acc.id);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left p-2 rounded-xl flex items-center justify-between transition-colors cursor-pointer ${
                      isCurrent ? 'bg-[#DCE6FB] text-[#0B6BE6] font-bold' : 'hover:bg-slate-50 text-[#0B2A55]'
                    }`}
                  >
                    <div>
                      <p className="font-semibold text-xs flex items-center gap-1.5">
                        {acc.role === 'admin' ? (
                          <Shield className="w-3.5 h-3.5 text-red-500" />
                        ) : acc.role === 'supervisor' ? (
                          <UserCheck className="w-3.5 h-3.5 text-blue-500" />
                        ) : (
                          <GraduationCap className="w-3.5 h-3.5 text-emerald-500" />
                        )}
                        {acc.name}
                      </p>
                      <p className="text-[10px] text-slate-500">{acc.desc}</p>
                    </div>
                    {isCurrent && <Check className="w-4 h-4 text-[#0B6BE6]" />}
                  </button>
                );
              })}
            </div>

            <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => {
                  switchDemoUser('guest');
                  setIsOpen(false);
                }}
                className="text-[11px] text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                Log Out (Guest Mode)
              </button>
              <button
                onClick={() => {
                  resetToInitialSeed();
                  setIsOpen(false);
                }}
                className="text-[11px] text-red-500 hover:text-red-700 flex items-center gap-1 cursor-pointer font-semibold"
                title="Reset database to seed state"
              >
                <RotateCcw className="w-3 h-3" />
                Reset Data
              </button>
            </div>
          </div>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 bg-[#0B2A55] text-white hover:bg-[#0A1F44] rounded-full shadow-lg border border-white/20 text-xs font-semibold cursor-pointer transition-transform hover:scale-105"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>Role: {currentUser ? currentUser.name.split(' ')[0] : 'Guest'}</span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>
    </div>
  );
};
