import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  FolderKanban,
  FileText,
  Users,
  Calendar,
  Image,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ProjectDifficulty, ProjectType } from '../../types';
import confetti from 'canvas-confetti';

interface PublishProjectPageProps {
  navigate: (path: string) => void;
}

export const PublishProjectPage: React.FC<PublishProjectPageProps> = ({ navigate }) => {
  const { areas, publishProject, currentUser, showToast } = useApp();

  if (!currentUser) {
    return null;
  }

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Basics
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [areaId, setAreaId] = useState('area-ai');
  const [projectType, setProjectType] = useState<ProjectType>('Thesis');

  // Step 2: Details
  const [description, setDescription] = useState('');
  const [objectives, setObjectives] = useState('Formulate theoretical framework\nDevelop benchmarking baseline\nPublish IEEE symposium paper');
  const [expectedOutcome, setExpectedOutcome] = useState('A deployable open-source artifact and published academic manuscript.');
  const [methodology, setMethodology] = useState('Empirical benchmarking combined with stratified cross-validation.');

  // Step 3: Requirements
  const [skills, setSkills] = useState('Python, Machine Learning, PyTorch');
  const [difficulty, setDifficulty] = useState<ProjectDifficulty>('Intermediate');
  const [durationMonths, setDurationMonths] = useState(6);
  const [totalPositions, setTotalPositions] = useState(4);
  const [deadline, setDeadline] = useState('2026-12-30');

  // Step 4: Thumbnail
  const [thumbnailUrl, setThumbnailUrl] = useState('https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&auto=format&fit=crop&q=80');

  const presetThumbnails = [
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=500&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?w=500&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=500&auto=format&fit=crop&q=80',
  ];

  const handleSaveDraft = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('Please provide at least a project title to save draft', 'error');
      return;
    }
    const matchedArea = areas.find((a) => a.id === areaId);
    const newProj = publishProject(
      {
        title: title.trim(),
        summary: summary.trim(),
        description: description.trim() || 'Draft research proposal in formulation.',
        objectives: objectives.split('\n').filter(Boolean),
        expectedOutcome: expectedOutcome.trim(),
        methodology: methodology.trim(),
        areaId,
        areaName: matchedArea?.name || 'Computer Science',
        projectType,
        difficulty,
        durationMonths,
        totalPositions,
        deadline,
        requiredSkills: skills.split(',').map((s) => s.trim()).filter(Boolean),
        thumbnail: thumbnailUrl,
      },
      { isDraft: true }
    );
    navigate('/my-projects');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      showToast('Please fill out all required fields', 'error');
      return;
    }

    const matchedArea = areas.find((a) => a.id === areaId);

    const newProj = publishProject({
      title: title.trim(),
      summary: summary.trim(),
      description: description.trim(),
      objectives: objectives.split('\n').filter(Boolean),
      expectedOutcome: expectedOutcome.trim(),
      methodology: methodology.trim(),
      areaId,
      areaName: matchedArea?.name || 'Computer Science',
      projectType,
      difficulty,
      durationMonths,
      totalPositions,
      deadline,
      requiredSkills: skills.split(',').map((s) => s.trim()).filter(Boolean),
      thumbnail: thumbnailUrl,
    }, { isDraft: false });

    try {
      confetti({ particleCount: 75, spread: 60, origin: { y: 0.7 } });
    } catch (e) {}

    navigate(`/projects/${newProj.id}`);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-4 border-b border-[#E3EAF3]">
        <div>
          <button
            onClick={() => navigate('/my-projects')}
            className="text-xs font-bold text-[#0B6BE6] hover:underline flex items-center gap-1 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to My Projects</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0B2A55] tracking-tight">Publish Research Project</h1>
          <p className="text-xs text-[#6B7A90] mt-1">
            Initiate a faculty-guided research opportunity and recruit qualified student contributors
          </p>
        </div>

        {/* Progress Step Indicator */}
        <div className="flex items-center gap-2 text-xs font-bold">
          {[
            { num: 1, label: 'Basics' },
            { num: 2, label: 'Details' },
            { num: 3, label: 'Criteria' },
            { num: 4, label: 'Media' },
          ].map((s) => (
            <div
              key={s.num}
              className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 ${
                step === s.num
                  ? 'bg-[#0B6BE6] text-white shadow-xs'
                  : step > s.num
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-slate-100 text-slate-400'
              }`}
            >
              <span>0{s.num}</span>
              <span className="hidden sm:inline">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E3EAF3] shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-6 text-xs">
          {/* Step 1: Basics */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="font-extrabold text-base text-[#0B2A55]">Step 1: Project Basics</h3>

              <div className="space-y-1">
                <label className="font-bold text-[#0B2A55]">Project Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Autonomous Robotic Navigation in Precision Agriculture"
                  className="w-full bg-[#F5F8FC] border border-[#E3EAF3] p-3 rounded-xl font-medium text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#0B2A55]">Short Summary / Hook *</label>
                <textarea
                  rows={3}
                  required
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="A concise 2-sentence overview that appears on project catalog cards..."
                  className="w-full bg-[#F5F8FC] border border-[#E3EAF3] p-3 rounded-xl font-medium text-slate-800"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-[#0B2A55]">Research Domain</label>
                  <select
                    value={areaId}
                    onChange={(e) => setAreaId(e.target.value)}
                    className="w-full bg-[#F5F8FC] border border-[#E3EAF3] p-2.5 rounded-xl font-medium"
                  >
                    {areas.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#0B2A55]">Project Type</label>
                  <select
                    value={projectType}
                    onChange={(e) => setProjectType(e.target.value as ProjectType)}
                    className="w-full bg-[#F5F8FC] border border-[#E3EAF3] p-2.5 rounded-xl font-medium"
                  >
                    <option value="Thesis">Thesis</option>
                    <option value="Funded Research">Funded Research</option>
                    <option value="Course Project">Course Project</option>
                    <option value="Open Source">Open Source</option>
                    <option value="Competition">Competition</option>
                    <option value="Industry">Industry</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    if (!title.trim() || !summary.trim()) {
                      showToast('Please provide title and summary', 'error');
                      return;
                    }
                    setStep(2);
                  }}
                  className="px-6 py-2.5 bg-[#0B6BE6] text-white font-bold rounded-xl shadow-xs flex items-center gap-1.5"
                >
                  <span>Next: Details & Methodology</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Details */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="font-extrabold text-base text-[#0B2A55]">Step 2: Problem Statement & Objectives</h3>

              <div className="space-y-1">
                <label className="font-bold text-[#0B2A55]">Comprehensive Description *</label>
                <textarea
                  rows={5}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Elaborate on the scientific background, theoretical significance, and research methodology..."
                  className="w-full bg-[#F5F8FC] border border-[#E3EAF3] p-3 rounded-xl font-medium text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#0B2A55]">Objectives (One per line)</label>
                <textarea
                  rows={3}
                  value={objectives}
                  onChange={(e) => setObjectives(e.target.value)}
                  className="w-full bg-[#F5F8FC] border border-[#E3EAF3] p-3 rounded-xl font-medium text-slate-800 font-mono text-[11px]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-[#0B2A55]">Expected Outcomes</label>
                  <input
                    type="text"
                    value={expectedOutcome}
                    onChange={(e) => setExpectedOutcome(e.target.value)}
                    className="w-full bg-[#F5F8FC] border border-[#E3EAF3] p-2.5 rounded-xl font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#0B2A55]">Methodology</label>
                  <input
                    type="text"
                    value={methodology}
                    onChange={(e) => setMethodology(e.target.value)}
                    className="w-full bg-[#F5F8FC] border border-[#E3EAF3] p-2.5 rounded-xl font-medium"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 font-bold text-slate-500 hover:bg-slate-100 rounded-xl"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!description.trim()) {
                      showToast('Please provide a project description', 'error');
                      return;
                    }
                    setStep(3);
                  }}
                  className="px-6 py-2.5 bg-[#0B6BE6] text-white font-bold rounded-xl shadow-xs flex items-center gap-1.5"
                >
                  <span>Next: Candidate Requirements</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Requirements */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="font-extrabold text-base text-[#0B2A55]">Step 3: Eligibility & Positions</h3>

              <div className="space-y-1">
                <label className="font-bold text-[#0B2A55]">Required Technical Skills (Comma-separated)</label>
                <input
                  type="text"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="e.g. Python, Machine Learning, ROS, C++"
                  className="w-full bg-[#F5F8FC] border border-[#E3EAF3] p-2.5 rounded-xl font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-[#0B2A55]">Difficulty Level</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as ProjectDifficulty)}
                    className="w-full bg-[#F5F8FC] border border-[#E3EAF3] p-2.5 rounded-xl font-medium"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#0B2A55]">Duration (Months)</label>
                  <input
                    type="number"
                    min="1"
                    max="24"
                    value={durationMonths}
                    onChange={(e) => setDurationMonths(Number(e.target.value))}
                    className="w-full bg-[#F5F8FC] border border-[#E3EAF3] p-2.5 rounded-xl font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#0B2A55]">Total Available Seats / Positions</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={totalPositions}
                    onChange={(e) => setTotalPositions(Number(e.target.value))}
                    className="w-full bg-[#F5F8FC] border border-[#E3EAF3] p-2.5 rounded-xl font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#0B2A55]">Application Deadline</label>
                  <input
                    type="date"
                    required
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full bg-[#F5F8FC] border border-[#E3EAF3] p-2.5 rounded-xl font-medium"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2 font-bold text-slate-500 hover:bg-slate-100 rounded-xl"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="px-6 py-2.5 bg-[#0B6BE6] text-white font-bold rounded-xl shadow-xs flex items-center gap-1.5"
                >
                  <span>Next: Project Media</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Media & Publish */}
          {step === 4 && (
            <div className="space-y-5">
              <h3 className="font-extrabold text-base text-[#0B2A55]">Step 4: Media & Final Review</h3>

              <div className="space-y-3">
                <label className="font-bold text-[#0B2A55] block">Project Thumbnail (4:3 ratio)</label>
                <div className="flex items-center gap-4">
                  <img
                    src={thumbnailUrl}
                    alt="Preview"
                    className="w-32 h-24 object-cover rounded-2xl border border-slate-200 shadow-xs"
                  />
                  <div className="space-y-2 flex-1">
                    <input
                      type="text"
                      value={thumbnailUrl}
                      onChange={(e) => setThumbnailUrl(e.target.value)}
                      placeholder="Paste image URL..."
                      className="w-full bg-[#F5F8FC] border border-[#E3EAF3] p-2 rounded-xl text-xs"
                    />
                    <div className="flex flex-wrap gap-2">
                      {presetThumbnails.map((url, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setThumbnailUrl(url)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-[10px] font-bold text-slate-600"
                        >
                          Preset {i + 1}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Review Summary */}
              <div className="p-4 bg-slate-50 rounded-2xl space-y-2 border border-slate-100">
                <p className="font-bold text-[#0B2A55]">Review Project Card Summary:</p>
                <p className="font-extrabold text-sm text-[#0B2A55]">{title}</p>
                <p className="text-slate-600 text-[11px] leading-relaxed">{summary}</p>
                <div className="flex flex-wrap gap-3 text-[11px] text-slate-500 pt-1">
                  <span>Seats: {totalPositions}</span>
                  <span>·</span>
                  <span>Duration: {durationMonths} Mo</span>
                  <span>·</span>
                  <span>Deadline: {deadline}</span>
                </div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row justify-between items-center gap-3">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-4 py-2 font-bold text-slate-500 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Back
                </button>
                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    className="flex-1 sm:flex-initial px-5 py-3 bg-slate-100 hover:bg-slate-200 text-[#0B2A55] font-bold text-xs rounded-xl transition-all cursor-pointer"
                  >
                    Save as Draft
                  </button>
                  <button
                    type="submit"
                    className="flex-1 sm:flex-initial px-7 py-3 bg-[#0E9F6E] hover:bg-emerald-600 text-white font-black text-sm rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Publish / Submit for Moderation</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
