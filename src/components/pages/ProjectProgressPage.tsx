import React, { useState } from 'react';
import {
  TrendingUp,
  CheckCircle2,
  Clock,
  Circle,
  Calendar,
  Plus,
  ArrowLeft,
  Sparkles,
  Edit2,
  Trash2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import confetti from 'canvas-confetti';

interface ProjectProgressPageProps {
  projectId: string;
  navigate: (path: string) => void;
}

export const ProjectProgressPage: React.FC<ProjectProgressPageProps> = ({ projectId, navigate }) => {
  const { projects, milestones, updateMilestone, addMilestone, deleteMilestone, currentUser } = useApp();

  if (!currentUser) {
    return null;
  }

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [newPercent, setNewPercent] = useState(0);

  const project = projects.find((p) => p.id === projectId) || projects[0];
  const projectMilestones = milestones.filter((m) => m.projectId === project.id);

  const isSupervisorOrOwner = project.supervisor.id === currentUser?.id || currentUser?.role === 'admin';

  // Overall completion percentage
  const overallPercent = projectMilestones.length > 0
    ? Math.round(projectMilestones.reduce((acc, m) => acc + m.percent, 0) / projectMilestones.length)
    : project.progressPercent;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    addMilestone(project.id, newTitle.trim(), newDueDate || '2026-12-30', Number(newPercent));
    setIsAddModalOpen(false);
    setNewTitle('');
    setNewPercent(0);
    try {
      confetti({ particleCount: 50, spread: 60 });
    } catch (e) {}
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header Back navigation */}
      <div className="flex items-center justify-between pb-2">
        <button
          onClick={() => navigate(`/projects/${project.id}`)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0B6BE6] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to {project.title}</span>
        </button>

        {isSupervisorOrOwner && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-[#0E9F6E] hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add Milestone</span>
          </button>
        )}
      </div>

      {/* Main Progress Card Matching Page 14 screenshot */}
      <div className="bg-white rounded-3xl border border-[#E3EAF3] p-6 sm:p-10 shadow-xs space-y-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 pb-8 border-b border-slate-100">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-xs font-extrabold uppercase tracking-wider text-teal-600 bg-teal-50 px-3 py-1 rounded-full">
              Milestone Tracking
            </span>
            <h1 className="text-3xl font-black text-[#0B2A55] tracking-tight">Project Progress</h1>
            <p className="text-xs sm:text-sm text-[#6B7A90] max-w-md">
              Monitoring research deliverable timelines, dataset preparation, baseline benchmarking, and paper drafting.
            </p>
          </div>

          {/* Circular Progress Ring & Pikachu Mascot matching Page 14 */}
          <div className="flex items-center gap-6 bg-linear-to-r from-teal-50/60 to-emerald-50/60 p-6 rounded-3xl border border-teal-100">
            {/* Circular Ring SVG */}
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  stroke="#E2E8F0"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  stroke="#0E9F6E"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray="264"
                  strokeDashoffset={264 * (1 - overallPercent / 100)}
                  strokeLinecap="round"
                  className="transition-all duration-700"
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-3xl font-black text-[#0B2A55]">{overallPercent}%</span>
                <span className="block text-[10px] text-slate-400 font-bold uppercase">Overall</span>
              </div>
            </div>

            {/* Pikachu mascot badge matching Page 14 */}
            <div className="text-center space-y-1">
              <div className="w-16 h-16 rounded-2xl bg-amber-400 border-2 border-[#0B2A55] flex flex-col items-center justify-center shadow-md relative overflow-hidden mx-auto">
                <div className="flex gap-4 mb-1">
                  <div className="w-2 h-2 rounded-full bg-[#0B2A55]" />
                  <div className="w-2 h-2 rounded-full bg-[#0B2A55]" />
                </div>
                <div className="w-1.5 h-1 bg-[#E53935] rounded-full" />
                <div className="flex justify-between w-full px-2 absolute bottom-2">
                  <div className="w-2 h-2 rounded-full bg-[#E53935]" />
                  <div className="w-2 h-2 rounded-full bg-[#E53935]" />
                </div>
              </div>
              <p className="text-[11px] font-black text-[#0B2A55]">Pikachu Cheer</p>
              <p className="text-[10px] text-emerald-700 font-bold">On Schedule! ⚡</p>
            </div>
          </div>
        </div>

        {/* Milestones List matching Page 14 */}
        <div className="space-y-4">
          <h3 className="font-black text-lg text-[#0B2A55]">Milestone Checklist</h3>

          <div className="space-y-3">
            {projectMilestones.map((ms) => {
              const isDone = ms.percent === 100;
              const isInProgress = ms.percent > 0 && ms.percent < 100;

              return (
                <div
                  key={ms.id}
                  className="p-4 sm:p-5 rounded-2xl border border-[#E3EAF3] bg-white hover:border-slate-300 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    {/* Status Icon matching Page 14 */}
                    {isDone ? (
                      <div className="w-9 h-9 rounded-full bg-[#DDF5EA] text-[#0E9F6E] flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                    ) : isInProgress ? (
                      <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 font-bold text-xs">
                        {ms.percent}%
                      </div>
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center shrink-0">
                        <Circle className="w-5 h-5" />
                      </div>
                    )}

                    <div>
                      <h4 className="font-extrabold text-sm sm:text-base text-[#0B2A55] leading-snug">
                        {ms.title}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">Due Date: {ms.dueDate}</p>
                    </div>
                  </div>

                  {/* Percentage & Controls */}
                  <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="w-32 sm:w-40 bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isDone ? 'bg-[#0E9F6E]' : 'bg-[#FFC83D]'
                        }`}
                        style={{ width: `${ms.percent}%` }}
                      />
                    </div>

                    <span className="text-sm font-extrabold text-[#0B2A55] w-12 text-right">
                      {ms.percent}%
                    </span>

                    {/* Supervisor control to tweak % */}
                    {isSupervisorOrOwner && (
                      <div className="flex items-center gap-1">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="10"
                          value={ms.percent}
                          onChange={(e) => updateMilestone(ms.id, { percent: Number(e.target.value) })}
                          className="w-20 cursor-pointer accent-[#0E9F6E]"
                          title="Slide to update percent"
                        />
                        <button
                          onClick={() => deleteMilestone(ms.id)}
                          className="p-1.5 text-slate-300 hover:text-red-500 rounded-lg cursor-pointer"
                          title="Delete Milestone"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Start Date / End Date with Calendar Icons at the bottom matching Page 14 */}
        <div className="pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl">
            <Calendar className="w-5 h-5 text-[#0B6BE6]" />
            <div>
              <span className="text-slate-400 font-bold uppercase tracking-wider block text-[10px]">Project Kickoff</span>
              <span className="font-extrabold text-sm text-[#0B2A55]">
                {new Date(project.startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl">
            <Calendar className="w-5 h-5 text-[#E53935]" />
            <div>
              <span className="text-slate-400 font-bold uppercase tracking-wider block text-[10px]">Final Deadline</span>
              <span className="font-extrabold text-sm text-[#0B2A55]">
                {new Date(project.endDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Add Milestone Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-3xl shadow-2xl p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-[#0B2A55]">Add Project Milestone</h3>
              <button onClick={() => setIsAddModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-[#0B2A55] block mb-1">Milestone Title *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Model Architecture Profiling"
                  className="w-full bg-[#F5F8FC] border border-[#E3EAF3] p-2.5 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-[#0B2A55] block mb-1">Target Due Date</label>
                <input
                  type="date"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="w-full bg-[#F5F8FC] border border-[#E3EAF3] p-2.5 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-[#0B2A55] block mb-1">Initial Completion: {newPercent}%</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="10"
                  value={newPercent}
                  onChange={(e) => setNewPercent(Number(e.target.value))}
                  className="w-full accent-[#0E9F6E]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 font-bold text-slate-500"
                >
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-[#0E9F6E] text-white font-bold rounded-xl">
                  Add Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
