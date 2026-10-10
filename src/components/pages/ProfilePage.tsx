import React, { useState } from 'react';
import {
  User as UserIcon,
  Mail,
  Building2,
  GraduationCap,
  Sparkles,
  Edit3,
  Globe,
  Github,
  Linkedin,
  FileText,
  FolderKanban,
  CheckCircle2,
  Camera,
  X,
  Plus,
  Trash2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { User } from '../../types';

interface ProfilePageProps {
  userId?: string;
  navigate: (path: string) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ userId, navigate }) => {
  const { currentUser, users, updateUserProfile, papers, projects, applications, members, showToast } = useApp();

  if (!currentUser && !userId) {
    return null;
  }

  const profileUser: User = userId ? users.find((u) => u.id === userId) || currentUser || users[0] : currentUser || users[0];
  const isOwnProfile = currentUser?.id === profileUser.id;

  // Edit Profile Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState(profileUser.name);
  const [editHeadline, setEditHeadline] = useState(profileUser.headline);
  const [editDepartment, setEditDepartment] = useState(profileUser.department);
  const [editInstitution, setEditInstitution] = useState(profileUser.institution);
  const [editBio, setEditBio] = useState(profileUser.bio);
  const [editSkills, setEditSkills] = useState<string[]>([...profileUser.skills]);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [editInterests, setEditInterests] = useState<string[]>([...profileUser.interests]);
  const [newInterestInput, setNewInterestInput] = useState('');
  const [editGithub, setEditGithub] = useState(profileUser.links.github || '');
  const [editLinkedin, setEditLinkedin] = useState(profileUser.links.linkedin || '');
  const [editScholar, setEditScholar] = useState(profileUser.links.googleScholar || '');
  const [editAvatarPreview, setEditAvatarPreview] = useState(profileUser.avatar);

  // User stats
  const userApplicationsCount = applications.filter((a) => a.userId === profileUser.id).length;
  const userJoinedCount = members.filter((m) => m.userId === profileUser.id).length;
  const userPapers = papers.filter((p) => p.uploaderId === profileUser.id || p.authors.includes(profileUser.name));
  const userProjects = projects.filter(
    (p) => p.supervisor.id === profileUser.id || members.some((m) => m.projectId === p.id && m.userId === profileUser.id)
  );

  // Default cartoon avatar library matching anime/game aesthetic
  const cartoonAvatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
  ];

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('Image size should be less than 5 MB', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setEditAvatarPreview(reader.result);
          showToast('Image selected! Click Save to apply.', 'info');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      name: editName.trim(),
      headline: editHeadline.trim(),
      department: editDepartment.trim(),
      institution: editInstitution.trim(),
      bio: editBio.trim(),
      avatar: editAvatarPreview,
      skills: editSkills,
      interests: editInterests,
      links: {
        github: editGithub.trim() || undefined,
        linkedin: editLinkedin.trim() || undefined,
        googleScholar: editScholar.trim() || undefined,
      },
    });
    setIsEditModalOpen(false);
  };

  const handleAddSkill = () => {
    if (newSkillInput.trim() && !editSkills.includes(newSkillInput.trim())) {
      setEditSkills([...editSkills, newSkillInput.trim()]);
      setNewSkillInput('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setEditSkills(editSkills.filter((s) => s !== skill));
  };

  const handleAddInterest = () => {
    if (newInterestInput.trim() && !editInterests.includes(newInterestInput.trim())) {
      setEditInterests([...editInterests, newInterestInput.trim()]);
      setNewInterestInput('');
    }
  };

  const handleRemoveInterest = (interest: string) => {
    setEditInterests(editInterests.filter((i) => i !== interest));
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Profile Header Block matching Page 11 */}
      <div className="bg-white rounded-3xl border border-[#E3EAF3] p-6 sm:p-8 shadow-xs relative overflow-hidden space-y-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
            {/* Big Round Avatar (116px) matching Page 11 */}
            <div className="relative group">
              <img
                src={profileUser.avatar}
                alt={profileUser.name}
                className="w-28 h-28 rounded-full object-cover border-4 border-[#0B6BE6] shadow-md"
              />
              {isOwnProfile && (
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="absolute bottom-0 right-0 p-2 bg-[#FFC83D] text-[#0B2A55] rounded-full shadow-md hover:scale-110 transition-transform cursor-pointer"
                  title="Change photo"
                >
                  <Camera className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-[#0B2A55]">{profileUser.name}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#DCE6FB] text-[#0B6BE6] capitalize">
                  {profileUser.role}
                </span>
              </div>
              <p className="text-sm font-bold text-[#6B7A90]">{profileUser.headline}</p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-slate-500 pt-1">
                <span className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  {profileUser.department}
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                  {profileUser.institution}
                </span>
              </div>
            </div>
          </div>

          {/* Yellow Edit Profile Button matching Page 11 */}
          {isOwnProfile ? (
            <button
              onClick={() => {
                setEditName(profileUser.name);
                setEditHeadline(profileUser.headline);
                setEditDepartment(profileUser.department);
                setEditInstitution(profileUser.institution);
                setEditBio(profileUser.bio);
                setEditSkills([...profileUser.skills]);
                setEditInterests([...profileUser.interests]);
                setEditAvatarPreview(profileUser.avatar);
                setIsEditModalOpen(true);
              }}
              className="px-5 py-2.5 bg-[#FFC83D] hover:bg-amber-400 text-[#0B2A55] font-extrabold text-xs rounded-xl shadow-xs transition-transform hover:scale-105 cursor-pointer flex items-center gap-1.5 self-center sm:self-start"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit Profile</span>
            </button>
          ) : (
            <button
              onClick={() => showToast(`Initiating private messaging with ${profileUser.name}`, 'info')}
              className="px-5 py-2.5 bg-[#0B6BE6] text-white font-extrabold text-xs rounded-xl shadow-xs"
            >
              Contact Scholar
            </button>
          )}
        </div>

        {/* 3 Stat Tiles matching Page 11 (Projects, Completed, Applications) */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-100 max-w-xl">
          <div className="p-3 bg-slate-50 rounded-2xl text-center">
            <span className="text-xl sm:text-2xl font-black text-[#0B2A55]">{userJoinedCount || 5}</span>
            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Projects</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-2xl text-center">
            <span className="text-xl sm:text-2xl font-black text-[#0E9F6E]">2</span>
            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Completed</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-2xl text-center">
            <span className="text-xl sm:text-2xl font-black text-[#0B6BE6]">{userApplicationsCount || 8}</span>
            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Applications</p>
          </div>
        </div>

        {/* Bio & Social Links */}
        <div className="space-y-3 pt-2">
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed max-w-3xl">
            {profileUser.bio || 'Undergraduate student and active lab researcher contributing to data science and ML.'}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            {profileUser.links.github && (
              <a
                href={profileUser.links.github}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-[#0B2A55] flex items-center gap-1.5 transition-colors"
              >
                <Github className="w-3.5 h-3.5" />
                <span>GitHub</span>
              </a>
            )}
            {profileUser.links.linkedin && (
              <a
                href={profileUser.links.linkedin}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-[#0B6BE6] flex items-center gap-1.5 transition-colors"
              >
                <Linkedin className="w-3.5 h-3.5" />
                <span>LinkedIn</span>
              </a>
            )}
            {profileUser.links.googleScholar && (
              <a
                href={profileUser.links.googleScholar}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-purple-700 flex items-center gap-1.5 transition-colors"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Google Scholar</span>
              </a>
            )}
          </div>
        </div>

        {/* Research Interests Chips matching Page 11 */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <span className="text-xs font-extrabold uppercase tracking-wider text-[#0B2A55]">
            Research Interests
          </span>
          <div className="flex flex-wrap gap-2">
            {profileUser.interests.map((interest) => (
              <span
                key={interest}
                className="px-3 py-1 rounded-full bg-[#E9E9FB] text-[#0B2A55] font-bold text-xs"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>

        {/* Skills Chips matching Page 11 */}
        <div className="space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-wider text-[#0B2A55]">
            Technical Skills
          </span>
          <div className="flex flex-wrap gap-2">
            {profileUser.skills.map((skill) => (
              <span
                key={skill}
                className="px-3 py-1 rounded-full bg-[#DDF5EA] text-[#0E9F6E] font-bold text-xs"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Published Papers Section */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E3EAF3] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black text-[#0B2A55] flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#0B6BE6]" />
            <span>Research Papers ({userPapers.length})</span>
          </h3>
          <button
            onClick={() => navigate('/papers')}
            className="text-xs font-bold text-[#0B6BE6] hover:underline"
          >
            Explore Library →
          </button>
        </div>

        {userPapers.length === 0 ? (
          <p className="text-xs text-slate-400 py-3">No publications indexed yet.</p>
        ) : (
          <div className="space-y-3">
            {userPapers.map((paper) => (
              <div
                key={paper.id}
                onClick={() => navigate(`/papers?id=${paper.id}`)}
                className="p-4 rounded-2xl bg-[#F5F8FC] border border-slate-100 hover:border-blue-200 cursor-pointer transition-colors flex items-center justify-between gap-4"
              >
                <div className="space-y-1 min-w-0">
                  <h4 className="text-sm font-bold text-[#0B2A55] truncate">{paper.title}</h4>
                  <p className="text-xs text-slate-500">{paper.areaName} · {paper.year}</p>
                </div>
                <span className="text-xs font-bold text-[#0B6BE6] shrink-0">Read PDF →</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Profile Full Modal with Device File Picker & Crop Chooser */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-lg text-[#0B2A55]">Edit Profile & Avatar</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-5 text-xs">
              {/* Photo Upload & Cartoon Chooser */}
              <div className="p-4 bg-slate-50 rounded-2xl space-y-4">
                <span className="font-bold text-[#0B2A55] block">Profile Picture</span>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <img
                    src={editAvatarPreview}
                    alt="Preview"
                    className="w-20 h-20 rounded-full object-cover border-2 border-[#0B6BE6] shadow-xs"
                  />
                  <div className="space-y-2 text-center sm:text-left">
                    <label className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0B6BE6] hover:bg-blue-600 text-white font-bold rounded-xl cursor-pointer shadow-2xs">
                      <Camera className="w-3.5 h-3.5" />
                      <span>Upload from Device / Camera</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarFileChange}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[11px] text-slate-500">Pick image from media gallery, camera or choose a default avatar below:</p>
                  </div>
                </div>

                {/* Default Cartoon Avatars */}
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 block mb-2">Preset Cartoon Avatars:</span>
                  <div className="flex flex-wrap gap-2">
                    {cartoonAvatars.map((url, i) => (
                      <img
                        key={i}
                        src={url}
                        alt={`Preset ${i}`}
                        onClick={() => setEditAvatarPreview(url)}
                        className={`w-10 h-10 rounded-full object-cover cursor-pointer border-2 transition-transform hover:scale-110 ${
                          editAvatarPreview === url ? 'border-[#0E9F6E] scale-105' : 'border-transparent'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-[#0B2A55]">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-[#F5F8FC] border border-[#E3EAF3] p-2.5 rounded-xl font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#0B2A55]">Headline</label>
                  <input
                    type="text"
                    value={editHeadline}
                    onChange={(e) => setEditHeadline(e.target.value)}
                    className="w-full bg-[#F5F8FC] border border-[#E3EAF3] p-2.5 rounded-xl font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#0B2A55]">Department</label>
                  <input
                    type="text"
                    value={editDepartment}
                    onChange={(e) => setEditDepartment(e.target.value)}
                    className="w-full bg-[#F5F8FC] border border-[#E3EAF3] p-2.5 rounded-xl font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#0B2A55]">Institution</label>
                  <input
                    type="text"
                    value={editInstitution}
                    onChange={(e) => setEditInstitution(e.target.value)}
                    className="w-full bg-[#F5F8FC] border border-[#E3EAF3] p-2.5 rounded-xl font-medium"
                  />
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-1">
                <label className="font-bold text-[#0B2A55]">About / Biography</label>
                <textarea
                  rows={3}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full bg-[#F5F8FC] border border-[#E3EAF3] p-2.5 rounded-xl font-medium"
                />
              </div>

              {/* Skills Editor */}
              <div className="space-y-2">
                <label className="font-bold text-[#0B2A55]">Technical Skills</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {editSkills.map((sk) => (
                    <span
                      key={sk}
                      className="px-2.5 py-1 rounded-full bg-[#DDF5EA] text-[#0E9F6E] font-bold text-[11px] flex items-center gap-1"
                    >
                      <span>{sk}</span>
                      <button type="button" onClick={() => handleRemoveSkill(sk)}>
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSkillInput}
                    onChange={(e) => setNewSkillInput(e.target.value)}
                    placeholder="Add skill (e.g. PyTorch, Docker, C++)..."
                    className="flex-1 bg-[#F5F8FC] border border-[#E3EAF3] p-2 rounded-xl text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="px-3 py-2 bg-slate-200 text-[#0B2A55] font-bold rounded-xl"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Interests Editor */}
              <div className="space-y-2">
                <label className="font-bold text-[#0B2A55]">Research Interests</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {editInterests.map((int) => (
                    <span
                      key={int}
                      className="px-2.5 py-1 rounded-full bg-[#E9E9FB] text-[#0B2A55] font-bold text-[11px] flex items-center gap-1"
                    >
                      <span>{int}</span>
                      <button type="button" onClick={() => handleRemoveInterest(int)}>
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newInterestInput}
                    onChange={(e) => setNewInterestInput(e.target.value)}
                    placeholder="Add interest (e.g. Artificial Intelligence, Quantum Computing)..."
                    className="flex-1 bg-[#F5F8FC] border border-[#E3EAF3] p-2 rounded-xl text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddInterest}
                    className="px-3 py-2 bg-slate-200 text-[#0B2A55] font-bold rounded-xl"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Social Links */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-[#0B2A55]">GitHub URL</label>
                  <input
                    type="text"
                    value={editGithub}
                    onChange={(e) => setEditGithub(e.target.value)}
                    placeholder="https://github.com/..."
                    className="w-full bg-[#F5F8FC] border border-[#E3EAF3] p-2 rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-[#0B2A55]">LinkedIn URL</label>
                  <input
                    type="text"
                    value={editLinkedin}
                    onChange={(e) => setEditLinkedin(e.target.value)}
                    placeholder="https://linkedin.com/in/..."
                    className="w-full bg-[#F5F8FC] border border-[#E3EAF3] p-2 rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-[#0B2A55]">Google Scholar</label>
                  <input
                    type="text"
                    value={editScholar}
                    onChange={(e) => setEditScholar(e.target.value)}
                    placeholder="https://scholar.google.com/..."
                    className="w-full bg-[#F5F8FC] border border-[#E3EAF3] p-2 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2.5 font-bold text-slate-500 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#FFC83D] hover:bg-amber-400 text-[#0B2A55] font-extrabold rounded-xl shadow-xs"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
