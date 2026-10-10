import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Role,
  User,
  Project,
  ProjectStatus,
  ResearchArea,
  Application,
  Milestone,
  ProjectMember,
  ProjectFile,
  Message,
  Notification,
  CalendarEvent,
  Paper,
  ContactMessage,
  AiDraft,
  ActivityLog,
} from '../types';
import {
  SEED_USERS,
  SEED_AREAS,
  SEED_PROJECTS,
  SEED_APPLICATIONS,
  SEED_SAVED_PROJECT_IDS,
  SEED_MILESTONES,
  SEED_MEMBERS,
  SEED_FILES,
  SEED_MESSAGES,
  SEED_NOTIFICATIONS,
  SEED_CALENDAR_EVENTS,
  SEED_PAPERS,
  SEED_CONTACT_MESSAGES,
  SEED_ACTIVITY_LOGS,
} from '../data/seedData';
import {
  DEFAULT_SEED_HASH,
  DEFAULT_PASSWORD_SALT,
  verifyPassword,
  hashPassword,
  validateEmail,
  validatePassword,
} from '../services/authService';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error' | 'warning';
}

interface AppContextType {
  currentUser: User | null;
  users: User[];
  projects: Project[];
  areas: ResearchArea[];
  applications: Application[];
  savedProjectIds: string[];
  milestones: Milestone[];
  members: ProjectMember[];
  files: ProjectFile[];
  messages: Message[];
  notifications: Notification[];
  calendarEvents: CalendarEvent[];
  papers: Paper[];
  contactMessages: ContactMessage[];
  aiDrafts: AiDraft[];
  activityLogs: ActivityLog[];
  toasts: Toast[];

  // Global search modal
  isGlobalSearchOpen: boolean;
  setIsGlobalSearchOpen: (open: boolean) => void;
  globalSearchQuery: string;
  setGlobalSearchQuery: (q: string) => void;

  // Strict Authentication
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; user?: User }>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    role: Role;
    universityId?: string;
    department?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;

  // Actions
  setCurrentUser: (user: User | null) => void;
  switchDemoUser: (roleOrId: string) => void;
  showToast: (message: string, type?: 'success' | 'info' | 'error' | 'warning') => void;
  addActivityLog: (log: Omit<ActivityLog, 'id' | 'createdAt'>) => void;
  updateUserProfile: (updates: Partial<User>) => void;
  applyToProject: (projectId: string, message: string, skillsNote: string, cvFileName?: string) => boolean;
  withdrawApplication: (appId: string) => void;
  updateApplicationStatus: (appId: string, status: 'approved' | 'rejected', responseNote?: string) => void;
  toggleSaveProject: (projectId: string) => void;
  publishProject: (projectData: Partial<Project>, options?: { isDraft?: boolean }) => Project;
  submitProjectForModeration: (projectId: string) => void;
  updateProject: (projectId: string, updates: Partial<Project>) => void;
  archiveProject: (projectId: string) => void;
  closeProject: (projectId: string) => void;
  completeProject: (projectId: string) => void;
  deleteProject: (projectId: string) => void;
  approveProjectByAdmin: (projectId: string) => void;
  rejectProjectByAdmin: (projectId: string, reason?: string) => void;
  addMilestone: (projectId: string, title: string, dueDate: string, percent?: number) => void;
  updateMilestone: (id: string, updates: Partial<Milestone>) => void;
  deleteMilestone: (id: string) => void;
  sendMessage: (projectId: string, body: string, attachment?: { name: string; size: string; url: string; type: string }) => void;
  markNotificationsRead: () => void;
  markNotificationAsRead: (id: string) => void;
  deleteNotification: (id: string) => void;
  addCalendarEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  deleteCalendarEvent: (id: string) => void;
  uploadPaper: (paperData: Partial<Paper>) => Paper;
  updatePaper: (paperId: string, updates: Partial<Paper>) => void;
  deletePaper: (paperId: string) => void;
  likePaper: (paperId: string) => void;
  incrementPaperDownload: (paperId: string) => void;
  submitContactMessage: (msg: Omit<ContactMessage, 'id' | 'status' | 'createdAt'>) => void;
  replyContactMessage: (msgId: string, replyText: string) => void;
  inviteTeamMember: (projectId: string, emailOrUserId: string, positionTitle: string) => void;
  removeTeamMember: (memberId: string) => void;
  addUserByAdmin: (userData: Partial<User>) => void;
  updateUserByAdmin: (userId: string, updates: Partial<User>) => void;
  deleteUserByAdmin: (userId: string) => void;
  saveAiDraft: (draft: AiDraft) => void;
  deleteAiDraft: (id: string) => void;
  getMatchScore: (project: Project, user?: User | null) => { score: number; reasons: string[] };
  resetToInitialSeed: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'collabx_db_v1_';

function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return defaultValue;
    }
    const item = localStorage.getItem(STORAGE_KEY_PREFIX + key);
    if (!item) {
      return defaultValue;
    }
    const trimmed = item.trim();
    if (trimmed === 'undefined' || trimmed === 'null' || trimmed === 'NaN' || trimmed === '') {
      return defaultValue;
    }
    return JSON.parse(item);
  } catch {
    try {
      localStorage.removeItem(STORAGE_KEY_PREFIX + key);
    } catch {}
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, value: T) {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }
    if (value === undefined || value === null) {
      localStorage.removeItem(STORAGE_KEY_PREFIX + key);
      return;
    }
    localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(value));
  } catch {
    // Ignore quota or storage errors silently
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => loadFromStorage('users', SEED_USERS));
  // Authenticated user ID - Defaults strictly to null (visitor starts logged out)
  const [currentUserId, setCurrentUserId] = useState<string | null>(() => {
    const saved = loadFromStorage<string | null>('currentUserId', null);
    if (!saved) return null;
    const usersList = loadFromStorage<User[]>('users', SEED_USERS);
    const validUser = usersList.find((u) => u.id === saved && u.status !== 'inactive');
    if (!validUser) {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem(STORAGE_KEY_PREFIX + 'currentUserId');
      }
      return null;
    }
    return saved;
  });
  const [projects, setProjects] = useState<Project[]>(() => loadFromStorage('projects', SEED_PROJECTS));
  const [areas, setAreas] = useState<ResearchArea[]>(() => loadFromStorage('areas', SEED_AREAS));
  const [applications, setApplications] = useState<Application[]>(() => loadFromStorage('applications', SEED_APPLICATIONS));
  const [savedProjectIds, setSavedProjectIds] = useState<string[]>(() => loadFromStorage('savedProjectIds', SEED_SAVED_PROJECT_IDS));
  const [milestones, setMilestones] = useState<Milestone[]>(() => loadFromStorage('milestones', SEED_MILESTONES));
  const [members, setMembers] = useState<ProjectMember[]>(() => loadFromStorage('members', SEED_MEMBERS));
  const [files, setFiles] = useState<ProjectFile[]>(() => loadFromStorage('files', SEED_FILES));
  const [messages, setMessages] = useState<Message[]>(() => loadFromStorage('messages', SEED_MESSAGES));
  const [notifications, setNotifications] = useState<Notification[]>(() => loadFromStorage('notifications', SEED_NOTIFICATIONS));
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(() => loadFromStorage('calendarEvents', SEED_CALENDAR_EVENTS));
  const [papers, setPapers] = useState<Paper[]>(() => loadFromStorage('papers', SEED_PAPERS));
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>(() => loadFromStorage('contactMessages', SEED_CONTACT_MESSAGES));
  const [aiDrafts, setAiDrafts] = useState<AiDraft[]>(() => loadFromStorage('aiDrafts', []));
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => loadFromStorage('activity_logs', SEED_ACTIVITY_LOGS));

  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');

  // Persist to storage on change
  useEffect(() => saveToStorage('users', users), [users]);
  useEffect(() => {
    if (currentUserId) {
      saveToStorage('currentUserId', currentUserId);
    } else {
      localStorage.removeItem(STORAGE_KEY_PREFIX + 'currentUserId');
    }
  }, [currentUserId]);
  useEffect(() => saveToStorage('projects', projects), [projects]);
  useEffect(() => saveToStorage('areas', areas), [areas]);
  useEffect(() => saveToStorage('applications', applications), [applications]);
  useEffect(() => saveToStorage('savedProjectIds', savedProjectIds), [savedProjectIds]);
  useEffect(() => saveToStorage('milestones', milestones), [milestones]);
  useEffect(() => saveToStorage('members', members), [members]);
  useEffect(() => saveToStorage('files', files), [files]);
  useEffect(() => saveToStorage('messages', messages), [messages]);
  useEffect(() => saveToStorage('notifications', notifications), [notifications]);
  useEffect(() => saveToStorage('calendarEvents', calendarEvents), [calendarEvents]);
  useEffect(() => saveToStorage('papers', papers), [papers]);
  useEffect(() => saveToStorage('contactMessages', contactMessages), [contactMessages]);
  useEffect(() => saveToStorage('aiDrafts', aiDrafts), [aiDrafts]);
  useEffect(() => saveToStorage('activity_logs', activityLogs), [activityLogs]);

  const addActivityLog = (log: Omit<ActivityLog, 'id' | 'createdAt'>) => {
    const newLog: ActivityLog = {
      ...log,
      id: 'act-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      createdAt: new Date().toISOString(),
    };
    setActivityLogs((prev) => [newLog, ...prev]);
  };

  const currentUser = users.find((u) => u.id === currentUserId && u.status !== 'inactive') || null;

  // Safeguard: If currentUserId exists but user cannot be found or is inactive, purge session
  useEffect(() => {
    if (currentUserId && !currentUser) {
      setCurrentUserId(null);
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem(STORAGE_KEY_PREFIX + 'currentUserId');
      }
    }
  }, [currentUserId, currentUser]);

  const showToast = (message: string, type: 'success' | 'info' | 'error' | 'warning' = 'success') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  /**
   * STRICT LOGIN:
   * 1. Reads email and password.
   * 2. Finds user account using case-insensitive email match.
   * 3. Checks if account is inactive or disabled.
   * 4. Cryptographically verifies password against stored salt and SHA-256 hash.
   * 5. Sets authenticated session ONLY upon verified credentials.
   * 6. Rejects unknown emails, incorrect passwords, and disabled accounts.
   */
  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string; user?: User }> => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      return { success: false, error: 'Please enter both your email address and password.' };
    }

    // 1. Database account lookup
    const user = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!user) {
      return { success: false, error: 'Invalid email or password.' };
    }

    // 2. Account status check
    if (user.status !== 'active') {
      return { success: false, error: 'Your account has been deactivated. Please contact an administrator.' };
    }

    // 3. Cryptographic password verification
    const isPasswordValid = await verifyPassword(
      password,
      user.passwordHash || DEFAULT_SEED_HASH,
      user.passwordSalt || DEFAULT_PASSWORD_SALT
    );

    if (!isPasswordValid) {
      return { success: false, error: 'Invalid email or password.' };
    }

    // 4. Authenticate session
    setCurrentUserId(user.id);
    showToast(`Welcome back, ${user.name}!`, 'success');
    return { success: true, user };
  };

  /**
   * STRICT REGISTRATION:
   * 1. Validates required fields, email format, and password length.
   * 2. Rejects public registration attempts as Admin.
   * 3. Enforces email and university ID uniqueness against database records.
   * 4. Hashes password securely using salted SHA-256.
   * 5. Saves new user to records with active status.
   * 6. Does NOT authenticate session automatically (visitor is redirected to Login).
   */
  const register = async (data: {
    name: string;
    email: string;
    password: string;
    role: Role;
    universityId?: string;
    department?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    const cleanName = data.name.trim();
    const cleanEmail = data.email.trim().toLowerCase();

    if (!cleanName) {
      return { success: false, error: 'Full name is required.' };
    }

    if (!validateEmail(cleanEmail)) {
      return { success: false, error: 'Please enter a valid institutional email address.' };
    }

    const pwdCheck = validatePassword(data.password);
    if (!pwdCheck.valid) {
      return { success: false, error: pwdCheck.error || 'Password must be at least 8 characters long.' };
    }

    // Prevent public registration as Administrator
    if (data.role === 'admin') {
      return { success: false, error: 'Public registration as Administrator is not permitted.' };
    }

    const allowedRoles: Role[] = ['student', 'researcher', 'supervisor'];
    if (!allowedRoles.includes(data.role)) {
      return { success: false, error: 'Invalid role selected.' };
    }

    // Check unique email constraint
    const existingEmail = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existingEmail) {
      return { success: false, error: 'An account with this email address already exists.' };
    }

    // Check unique university ID constraint if provided
    if (data.universityId) {
      const cleanUid = data.universityId.trim().toLowerCase();
      const existingUid = users.find((u) => u.universityId && u.universityId.toLowerCase() === cleanUid);
      if (existingUid) {
        return { success: false, error: 'An account with this University ID already exists.' };
      }
    }

    // Salt and hash the password
    const salt = Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
    const passwordHash = await hashPassword(data.password, salt);

    const newUser: User = {
      id: 'user-' + Date.now().toString(36),
      name: cleanName,
      email: cleanEmail,
      role: data.role,
      department: data.department?.trim() || 'Computer Science & Engineering',
      institution: 'Port City International University',
      headline:
        data.role === 'student'
          ? 'CSE Student · Researcher'
          : data.role === 'supervisor'
          ? 'Faculty Supervisor & Professor'
          : 'Faculty Researcher',
      bio: 'Member of the Port City International University research community.',
      avatar:
        data.role === 'student'
          ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
      skills: ['Python', 'Research Writing'],
      interests: ['Artificial Intelligence', 'Data Science'],
      links: {},
      status: 'active',
      createdAt: new Date().toISOString(),
      passwordHash,
      passwordSalt: salt,
      universityId: data.universityId?.trim(),
    };

    setUsers((prev) => [...prev, newUser]);
    showToast('Registration successful! Please log in with your credentials.', 'success');
    return { success: true };
  };

  /**
   * SECURE LOGOUT:
   * Clears authenticated session and removes stored session identifier.
   */
  const logout = () => {
    setCurrentUserId(null);
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'currentUserId');
    showToast('You have been logged out.', 'info');
  };

  const switchDemoUser = (roleOrId: string) => {
    if (roleOrId === 'guest') {
      logout();
      return;
    }
    let found = users.find((u) => u.id === roleOrId);
    if (!found) {
      if (roleOrId === 'student') found = users.find((u) => u.role === 'student');
      else if (roleOrId === 'researcher' || roleOrId === 'supervisor') found = users.find((u) => u.role === 'supervisor');
      else if (roleOrId === 'admin') found = users.find((u) => u.role === 'admin');
    }
    if (found) {
      setCurrentUserId(found.id);
      showToast(`Authenticated as ${found.name} (${found.role})`, 'info');
    }
  };

  const setCurrentUser = (user: User | null) => {
    if (user) {
      setCurrentUserId(user.id);
      setUsers((prev) => {
        const idx = prev.findIndex((u) => u.id === user.id);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = user;
          return updated;
        }
        return [...prev, user];
      });
    } else {
      logout();
    }
  };

  const updateUserProfile = (updates: Partial<User>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...updates };
    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updated : u)));
    showToast('Profile updated successfully!', 'success');
  };

  // Recommendations algorithm
  const getMatchScore = (project: Project, user?: User | null): { score: number; reasons: string[] } => {
    const targetUser = user || currentUser;
    if (!targetUser) return { score: 70, reasons: ['Popular in research community'] };

    let score = 50;
    const reasons: string[] = [];

    // 1. Area overlap
    if (targetUser.interests.some((i) => i.toLowerCase() === project.areaName.toLowerCase())) {
      score += 25;
      reasons.push(`Matches your interest in ${project.areaName}`);
    }

    // 2. Skill coverage
    const matchedSkills = project.requiredSkills.filter((s) =>
      targetUser.skills.some((us) => us.toLowerCase() === s.toLowerCase())
    );
    if (matchedSkills.length > 0) {
      const skillScore = Math.round((matchedSkills.length / project.requiredSkills.length) * 20);
      score += skillScore;
      reasons.push(`Covers ${matchedSkills.length} of ${project.requiredSkills.length} required skills`);
    }

    // 3. Status bonus
    if (project.status === 'approved' && project.filledPositions < project.totalPositions) {
      score += 5;
    }

    // Cap at 98
    const finalScore = Math.min(98, Math.max(35, score));
    return { score: finalScore, reasons };
  };

  const applyToProject = (projectId: string, message: string, skillsNote: string, cvFileName?: string): boolean => {
    if (!currentUser) {
      showToast('Please log in to apply for projects', 'error');
      return false;
    }
    if (currentUser.role === 'admin') {
      showToast('Administrators cannot apply to join student research projects', 'warning');
      return false;
    }
    const project = projects.find((p) => p.id === projectId);
    if (!project) {
      showToast('Target project not found', 'error');
      return false;
    }
    if (project.supervisor.id === currentUser.id) {
      showToast('You are the supervisor of this project', 'warning');
      return false;
    }
    // Must be approved or active to accept applications
    if (project.status !== 'approved' && project.status !== 'active') {
      showToast(`Cannot apply: This project is not currently accepting applications (${project.status})`, 'error');
      return false;
    }
    // Check if seats are full
    if (project.filledPositions >= project.totalPositions) {
      showToast('Cannot apply: All available positions for this project have already been filled', 'error');
      return false;
    }
    // Check if already an active member
    const alreadyMember = members.some((m) => m.projectId === projectId && m.userId === currentUser.id);
    if (alreadyMember) {
      showToast('You are already an active team member of this project', 'warning');
      return false;
    }
    // Check duplicate application
    const existing = applications.find((a) => a.projectId === projectId && a.userId === currentUser.id);
    if (existing) {
      if (existing.status === 'pending') {
        showToast('You already have a pending application awaiting review for this project', 'warning');
        return false;
      }
      if (existing.status === 'approved') {
        showToast('Your application for this project has already been approved', 'warning');
        return false;
      }
    }

    const uniqueIdSuffix = Date.now() + '-' + Math.random().toString(36).substring(2, 8);
    const appRecord: Application = {
      id: existing ? existing.id : 'app-' + uniqueIdSuffix,
      projectId: project.id,
      projectTitle: project.title,
      projectThumbnail: project.thumbnail,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      userHeadline: currentUser.headline || 'Student Researcher',
      appliedDate: new Date().toISOString().split('T')[0],
      status: 'pending',
      message: message.trim(),
      skillsNote: skillsNote.trim() || 'General Research & Development',
      cvFileName: cvFileName || `${currentUser.name.replace(/\s+/g, '_')}_CV.pdf`,
      supervisorResponse: undefined,
      decidedAt: undefined,
    };

    if (existing) {
      setApplications((prev) => [appRecord, ...prev.filter((a) => a.id !== existing.id)]);
    } else {
      setApplications((prev) => [appRecord, ...prev]);
    }

    // Send notification to supervisor with direct anchor to applications table
    const newNotif: Notification = {
      id: 'notif-' + uniqueIdSuffix,
      userId: project.supervisor.id,
      type: 'new_project',
      title: 'New Application Received',
      body: `${currentUser.name} applied for "${project.title}"`,
      link: '/researcher#applications',
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [newNotif, ...prev]);

    // Record activity log
    addActivityLog({
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      action: 'application_submitted',
      targetType: 'application',
      targetId: appRecord.id,
      targetTitle: project.title,
      details: `Submitted application with motivation: "${message.trim().slice(0, 60)}"`,
    });

    showToast('Application submitted successfully!', 'success');
    return true;
  };

  const withdrawApplication = (appId: string) => {
    if (!currentUser) {
      showToast('Please log in to manage applications', 'error');
      return;
    }
    const targetApp = applications.find((a) => a.id === appId);
    if (!targetApp) return;

    if (targetApp.userId !== currentUser.id && currentUser.role !== 'admin') {
      showToast('Permission denied: You can only withdraw your own applications', 'error');
      return;
    }

    if (targetApp.status !== 'pending') {
      showToast(`Cannot withdraw application that is already ${targetApp.status}`, 'warning');
      return;
    }

    setApplications((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, status: 'withdrawn' } : a))
    );

    addActivityLog({
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      action: 'application_withdrawn',
      targetType: 'application',
      targetId: targetApp.id,
      targetTitle: targetApp.projectTitle,
      details: 'Withdrew pending application',
    });

    showToast('Application withdrawn', 'info');
  };

  const updateApplicationStatus = (appId: string, status: 'approved' | 'rejected', responseNote?: string) => {
    if (!currentUser) {
      showToast('Please log in to review applications', 'error');
      return;
    }
    const targetApp = applications.find((a) => a.id === appId);
    if (!targetApp) {
      showToast('Application not found', 'error');
      return;
    }

    const project = projects.find((p) => p.id === targetApp.projectId);
    if (!project) {
      showToast('Associated project record not found', 'error');
      return;
    }

    // STRICT PERMISSION CHECK: Only the supervisor of the project or an administrator can review applications
    const isAuthorized = project.supervisor.id === currentUser.id || currentUser.role === 'admin';
    if (!isAuthorized) {
      showToast('Permission denied: Only the assigned supervisor or an administrator can review applications for this project', 'error');
      return;
    }

    // STRICT STATUS CHECK: Must be pending
    if (targetApp.status !== 'pending') {
      showToast(`Application has already been decided (${targetApp.status})`, 'warning');
      return;
    }

    if (status === 'approved') {
      // Check available positions to prevent overbooking
      if (project.filledPositions >= project.totalPositions) {
        showToast('Cannot approve: All available positions for this project have already been filled', 'error');
        return;
      }

      // Check duplicate membership
      const isAlreadyMember = members.some((m) => m.projectId === targetApp.projectId && m.userId === targetApp.userId);
      if (isAlreadyMember) {
        showToast('Applicant is already an active member of this project', 'warning');
        return;
      }

      // 1. Mark application as Approved
      setApplications((prev) =>
        prev.map((a) =>
          a.id === appId
            ? {
                ...a,
                status: 'approved',
                supervisorResponse: responseNote,
                decidedAt: new Date().toISOString(),
              }
            : a
        )
      );

      // 2. Increment filled positions on project
      setProjects((prev) =>
        prev.map((p) =>
          p.id === targetApp.projectId
            ? { ...p, filledPositions: Math.min(p.totalPositions, p.filledPositions + 1) }
            : p
        )
      );

      // 3. Add applicant to project members
      const applicantUser = users.find((u) => u.id === targetApp.userId);
      const uniqueSuffix = Date.now() + '-' + Math.random().toString(36).substring(2, 8);
      const newMember: ProjectMember = {
        id: 'mem-' + uniqueSuffix,
        projectId: targetApp.projectId,
        userId: targetApp.userId,
        name: applicantUser ? applicantUser.name : targetApp.userName,
        email: applicantUser ? applicantUser.email : `${targetApp.userName.toLowerCase().replace(/\s+/g, '')}@collabx.test`,
        avatar: applicantUser ? applicantUser.avatar : targetApp.userAvatar,
        role: 'member',
        positionTitle: 'Research Assistant',
        status: 'active',
        joinedAt: new Date().toISOString(),
      };
      setMembers((prev) => [...prev, newMember]);

      // 4. Notify the applicant
      const notif: Notification = {
        id: 'notif-' + uniqueSuffix,
        userId: targetApp.userId,
        type: 'approved',
        title: 'Application Approved! 🎉',
        body: `Your application for "${targetApp.projectTitle}" has been approved!`,
        link: `/projects/${targetApp.projectId}`,
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      setNotifications((prev) => [notif, ...prev]);

      // 5. Record the action in activity log
      addActivityLog({
        userId: currentUser.id,
        userName: currentUser.name,
        userAvatar: currentUser.avatar,
        action: 'application_approved',
        targetType: 'application',
        targetId: targetApp.id,
        targetTitle: targetApp.projectTitle,
        details: `Approved application for ${targetApp.userName}`,
      });

      showToast(`Application approved! ${targetApp.userName} is now a team member.`, 'success');
    } else {
      // Rejection branch: updates status and optional feedback, does NOT add to members
      setApplications((prev) =>
        prev.map((a) =>
          a.id === appId
            ? {
                ...a,
                status: 'rejected',
                supervisorResponse: responseNote,
                decidedAt: new Date().toISOString(),
              }
            : a
        )
      );

      // Notify the applicant with direct destination to their applications list
      const uniqueSuffix = Date.now() + '-' + Math.random().toString(36).substring(2, 8);
      const notif: Notification = {
        id: 'notif-' + uniqueSuffix,
        userId: targetApp.userId,
        type: 'rejected',
        title: 'Application Update',
        body: `Your application for "${targetApp.projectTitle}" was declined.${responseNote ? ` Reason: ${responseNote}` : ''}`,
        link: `/applications?status=rejected`,
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      setNotifications((prev) => [notif, ...prev]);

      // Record in activity log
      addActivityLog({
        userId: currentUser.id,
        userName: currentUser.name,
        userAvatar: currentUser.avatar,
        action: 'application_rejected',
        targetType: 'application',
        targetId: targetApp.id,
        targetTitle: targetApp.projectTitle,
        details: `Rejected application for ${targetApp.userName}.${responseNote ? ` Reason: ${responseNote}` : ''}`,
      });

      showToast('Application marked as rejected', 'info');
    }
  };

  const toggleSaveProject = (projectId: string) => {
    setSavedProjectIds((prev) => {
      const exists = prev.includes(projectId);
      if (exists) {
        showToast('Removed from saved projects', 'info');
        return prev.filter((id) => id !== projectId);
      } else {
        showToast('Project saved to your list', 'success');
        return [...prev, projectId];
      }
    });
  };

  const publishProject = (projectData: Partial<Project>, options?: { isDraft?: boolean }): Project => {
    if (currentUser?.role === 'student') {
      showToast('Students cannot create faculty research projects', 'error');
    }
    const supervisor: User =
      (currentUser && (currentUser.role === 'supervisor' || currentUser.role === 'researcher' || currentUser.role === 'admin'))
        ? currentUser
        : users.find((u) => u.role === 'supervisor') || users[0];

    // Determine configured moderation status:
    // Draft -> Pending -> Approved
    let initialStatus: ProjectStatus = 'pending';
    if (options?.isDraft) {
      initialStatus = 'draft';
    } else if (currentUser?.role === 'admin') {
      initialStatus = 'approved';
    }

    const newProj: Project = {
      id: 'proj-' + Date.now(),
      title: projectData.title || 'Untitled Project',
      slug: (projectData.title || 'untitled').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      summary: projectData.summary || '',
      description: projectData.description || '',
      objectives: projectData.objectives || ['Conduct systematic literature review', 'Implement benchmark architecture'],
      expectedOutcome: projectData.expectedOutcome || 'Peer-reviewed manuscript and open software tool.',
      methodology: projectData.methodology || 'Empirical experimental analysis.',
      areaId: projectData.areaId || 'area-ai',
      areaName: projectData.areaName || 'Artificial Intelligence',
      subarea: projectData.subarea || 'Applied Intelligence',
      projectType: projectData.projectType || 'Thesis',
      difficulty: projectData.difficulty || 'Intermediate',
      durationMonths: projectData.durationMonths || 6,
      totalPositions: projectData.totalPositions || 4,
      filledPositions: 1,
      deadline: projectData.deadline || '2026-12-31',
      startDate: projectData.startDate || '2026-10-01',
      endDate: projectData.endDate || '2027-04-01',
      status: initialStatus,
      supervisor: {
        id: supervisor.id,
        name: supervisor.name,
        title: supervisor.headline || 'Research Lead',
        avatar: supervisor.avatar,
        institution: supervisor.institution || 'Port City International University',
        email: supervisor.email,
      },
      requiredSkills: projectData.requiredSkills || ['Python', 'Data Analysis'],
      tags: projectData.tags || ['Research', 'CollabX'],
      thumbnail: projectData.thumbnail || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&auto=format&fit=crop&q=80',
      views: 1,
      progressPercent: 0,
      createdAt: new Date().toISOString(),
    };

    setProjects((prev) => [newProj, ...prev]);

    // Add supervisor as first team member
    const newMember: ProjectMember = {
      id: 'mem-' + Date.now(),
      projectId: newProj.id,
      userId: supervisor.id,
      name: supervisor.name,
      email: supervisor.email,
      avatar: supervisor.avatar,
      role: 'supervisor',
      positionTitle: 'Principal Investigator',
      status: 'active',
      joinedAt: new Date().toISOString(),
    };
    setMembers((prev) => [...prev, newMember]);

    // Initial milestones
    const defaultMilestones: Milestone[] = [
      { id: 'ms-' + Date.now() + '-1', projectId: newProj.id, title: 'Literature Review & Formulation', percent: 0, sortOrder: 1, dueDate: '2026-11-01', completed: false },
      { id: 'ms-' + Date.now() + '-2', projectId: newProj.id, title: 'Data Collection & Pipeline Setup', percent: 0, sortOrder: 2, dueDate: '2026-12-01', completed: false },
      { id: 'ms-' + Date.now() + '-3', projectId: newProj.id, title: 'Evaluation & Final Manuscript', percent: 0, sortOrder: 3, dueDate: '2027-03-01', completed: false },
    ];
    setMilestones((prev) => [...prev, ...defaultMilestones]);

    // If submitted for moderation (pending), notify administrator
    if (initialStatus === 'pending') {
      const adminUsers = users.filter((u) => u.role === 'admin');
      adminUsers.forEach((admin) => {
        const adminNotif: Notification = {
          id: 'notif-' + Date.now() + '-' + admin.id,
          userId: admin.id,
          type: 'new_project',
          title: 'Project Proposal Awaiting Moderation',
          body: `"${newProj.title}" was submitted by ${supervisor.name} for approval.`,
          link: '/admin/projects',
          isRead: false,
          createdAt: new Date().toISOString(),
        };
        setNotifications((prev) => [adminNotif, ...prev]);
      });
    }

    // Record activity log
    addActivityLog({
      userId: supervisor.id,
      userName: supervisor.name,
      userAvatar: supervisor.avatar,
      action: initialStatus === 'draft' ? 'project_draft_saved' : 'project_created',
      targetType: 'project',
      targetId: newProj.id,
      targetTitle: newProj.title,
      details: initialStatus === 'draft' ? 'Saved project as draft' : `Submitted project for moderation (${initialStatus})`,
    });

    if (initialStatus === 'draft') {
      showToast('Project saved as draft!', 'info');
    } else if (initialStatus === 'pending') {
      showToast('Project submitted for admin moderation!', 'success');
    } else {
      showToast('Project published successfully!', 'success');
    }
    return newProj;
  };

  const submitProjectForModeration = (projectId: string) => {
    if (!currentUser) {
      showToast('Please log in to submit projects', 'error');
      return;
    }
    const project = projects.find((p) => p.id === projectId);
    if (!project) return;

    if (project.supervisor.id !== currentUser.id && currentUser.role !== 'admin') {
      showToast('Permission denied: You can only submit your own project proposals', 'error');
      return;
    }

    if (project.status !== 'draft') {
      showToast(`Project is already ${project.status}`, 'warning');
      return;
    }

    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, status: 'pending' } : p))
    );

    // Notify administrators
    const adminUsers = users.filter((u) => u.role === 'admin');
    adminUsers.forEach((admin) => {
      const notif: Notification = {
        id: 'notif-' + Date.now() + '-' + admin.id,
        userId: admin.id,
        type: 'new_project',
        title: 'Project Proposal Submitted',
        body: `"${project.title}" was submitted by ${project.supervisor.name} for moderation.`,
        link: '/admin/projects',
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      setNotifications((prev) => [notif, ...prev]);
    });

    addActivityLog({
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      action: 'project_submitted',
      targetType: 'project',
      targetId: project.id,
      targetTitle: project.title,
      details: 'Submitted draft project for admin approval',
    });

    showToast('Project submitted for moderation!', 'success');
  };

  const updateProject = (projectId: string, updates: Partial<Project>) => {
    if (!currentUser) {
      showToast('Please log in to manage projects', 'error');
      return;
    }
    const project = projects.find((p) => p.id === projectId);
    if (!project) return;

    if (project.supervisor.id !== currentUser.id && currentUser.role !== 'admin') {
      showToast('Permission denied: You can only edit your own projects', 'error');
      return;
    }

    setProjects((prev) => prev.map((p) => (p.id === projectId ? { ...p, ...updates } : p)));
    showToast('Project updated successfully', 'success');
  };

  const archiveProject = (projectId: string) => {
    if (!currentUser) {
      showToast('Please log in to manage projects', 'error');
      return;
    }
    const project = projects.find((p) => p.id === projectId);
    if (!project) return;

    if (project.supervisor.id !== currentUser.id && currentUser.role !== 'admin') {
      showToast('Permission denied: You can only archive your own projects', 'error');
      return;
    }

    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, status: 'archived' } : p))
    );

    // Notify active project members
    const projectMembers = members.filter((m) => m.projectId === projectId && m.userId !== currentUser.id);
    projectMembers.forEach((mem) => {
      const notif: Notification = {
        id: 'notif-' + Date.now() + '-' + mem.userId,
        userId: mem.userId,
        type: 'system',
        title: 'Project Archived',
        body: `"${project.title}" has been moved to archive status.`,
        link: `/my-projects`,
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      setNotifications((prev) => [notif, ...prev]);
    });

    addActivityLog({
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      action: 'project_archived',
      targetType: 'project',
      targetId: project.id,
      targetTitle: project.title,
      details: 'Archived research project',
    });

    showToast('Project archived successfully', 'info');
  };

  const closeProject = (projectId: string) => {
    if (!currentUser) {
      showToast('Please log in to manage projects', 'error');
      return;
    }
    const project = projects.find((p) => p.id === projectId);
    if (!project) return;

    if (project.supervisor.id !== currentUser.id && currentUser.role !== 'admin') {
      showToast('Permission denied: You can only close applications for your own projects', 'error');
      return;
    }

    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, status: 'closed' } : p))
    );

    addActivityLog({
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      action: 'project_closed',
      targetType: 'project',
      targetId: project.id,
      targetTitle: project.title,
      details: 'Closed project to new applications',
    });

    showToast('Project applications closed', 'info');
  };

  const completeProject = (projectId: string) => {
    if (!currentUser) {
      showToast('Please log in to manage projects', 'error');
      return;
    }
    const project = projects.find((p) => p.id === projectId);
    if (!project) return;

    if (project.supervisor.id !== currentUser.id && currentUser.role !== 'admin') {
      showToast('Permission denied: You can only complete your own projects', 'error');
      return;
    }

    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, status: 'completed', progressPercent: 100 } : p))
    );

    addActivityLog({
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      action: 'project_completed',
      targetType: 'project',
      targetId: project.id,
      targetTitle: project.title,
      details: 'Marked project milestones as 100% completed',
    });

    showToast('Project marked as completed!', 'success');
  };

  const deleteProject = (projectId: string) => {
    if (!currentUser) {
      showToast('Please log in to manage projects', 'error');
      return;
    }
    const project = projects.find((p) => p.id === projectId);
    if (!project) return;

    // Unauthorized users cannot delete someone else's project
    if (project.supervisor.id !== currentUser.id && currentUser.role !== 'admin') {
      showToast('Permission denied: You cannot delete a project you do not own or administer', 'error');
      return;
    }

    setProjects((prev) => prev.filter((p) => p.id !== projectId));
    // Clean up dependent records
    setApplications((prev) => prev.filter((a) => a.projectId !== projectId));
    setMembers((prev) => prev.filter((m) => m.projectId !== projectId));
    setMilestones((prev) => prev.filter((m) => m.projectId !== projectId));
    setFiles((prev) => prev.filter((f) => f.projectId !== projectId));
    setMessages((prev) => prev.filter((m) => m.projectId !== projectId));

    addActivityLog({
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      action: 'project_deleted',
      targetType: 'project',
      targetId: project.id,
      targetTitle: project.title,
      details: 'Deleted research project and dependent records',
    });

    showToast('Project deleted successfully', 'info');
  };

  const approveProjectByAdmin = (projectId: string) => {
    if (currentUser?.role !== 'admin') {
      showToast('Permission denied: Only system administrators can moderate project proposals', 'error');
      return;
    }
    const project = projects.find((p) => p.id === projectId);
    if (!project) return;

    // Approve project proposal without automatically approving all applications
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, status: 'approved', rejectReason: undefined } : p))
    );

    // Notify project supervisor
    const notif: Notification = {
      id: 'notif-' + Date.now(),
      userId: project.supervisor.id,
      type: 'approved',
      title: 'Project Proposal Approved! 🎉',
      body: `Your project proposal "${project.title}" has been approved and published to the catalog.`,
      link: `/projects/${project.id}`,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [notif, ...prev]);

    addActivityLog({
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      action: 'project_approved',
      targetType: 'project',
      targetId: project.id,
      targetTitle: project.title,
      details: 'Approved project proposal for publication',
    });

    showToast('Project proposal approved by admin!', 'success');
  };

  const rejectProjectByAdmin = (projectId: string, reason?: string) => {
    if (currentUser?.role !== 'admin') {
      showToast('Permission denied: Only system administrators can moderate project proposals', 'error');
      return;
    }
    const project = projects.find((p) => p.id === projectId);
    if (!project) return;

    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, status: 'rejected', rejectReason: reason } : p))
    );

    // Notify project supervisor
    const notif: Notification = {
      id: 'notif-' + Date.now(),
      userId: project.supervisor.id,
      type: 'rejected',
      title: 'Project Proposal Update',
      body: `Your project "${project.title}" was not approved by administration.${reason ? ` Reason: ${reason}` : ''}`,
      link: `/my-projects`,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [notif, ...prev]);

    addActivityLog({
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      action: 'project_rejected',
      targetType: 'project',
      targetId: project.id,
      targetTitle: project.title,
      details: `Rejected project proposal.${reason ? ` Reason: ${reason}` : ''}`,
    });

    showToast('Project status marked as rejected', 'warning');
  };

  const addMilestone = (projectId: string, title: string, dueDate: string, percent = 0) => {
    const newM: Milestone = {
      id: 'ms-' + Date.now(),
      projectId,
      title,
      dueDate,
      percent,
      sortOrder: milestones.filter((m) => m.projectId === projectId).length + 1,
      completed: percent === 100,
    };
    setMilestones((prev) => [...prev, newM]);

    // Recalculate project progress
    const projectMilestones = [...milestones.filter((m) => m.projectId === projectId), newM];
    const avg = Math.round(projectMilestones.reduce((acc, m) => acc + m.percent, 0) / projectMilestones.length);
    setProjects((prev) => prev.map((p) => (p.id === projectId ? { ...p, progressPercent: avg } : p)));

    showToast('Milestone created', 'success');
  };

  const updateMilestone = (id: string, updates: Partial<Milestone>) => {
    setMilestones((prev) => {
      const updated = prev.map((m) => {
        if (m.id === id) {
          const newPercent = updates.percent !== undefined ? updates.percent : m.percent;
          return { ...m, ...updates, completed: newPercent === 100 };
        }
        return m;
      });

      // Recalculate project progress
      const target = updated.find((m) => m.id === id);
      if (target) {
        const projMilestones = updated.filter((m) => m.projectId === target.projectId);
        const avg = Math.round(projMilestones.reduce((acc, m) => acc + m.percent, 0) / projMilestones.length);
        setProjects((pList) => pList.map((p) => (p.id === target.projectId ? { ...p, progressPercent: avg } : p)));
      }

      return updated;
    });
    showToast('Milestone updated', 'success');
  };

  const deleteMilestone = (id: string) => {
    setMilestones((prev) => prev.filter((m) => m.id !== id));
    showToast('Milestone deleted', 'info');
  };

  const sendMessage = (projectId: string, body: string, attachment?: { name: string; size: string; url: string; type: string }) => {
    if (!currentUser) return;
    const newMsg: Message = {
      id: 'msg-' + Date.now(),
      projectId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      body,
      attachment,
      createdAt: new Date().toISOString(),
      isRead: true,
    };
    setMessages((prev) => [...prev, newMsg]);
  };

  const markNotificationsRead = () => {
    if (!currentUser) return;
    setNotifications((prev) =>
      prev.map((n) => (n.userId === currentUser.id ? { ...n, isRead: true } : n))
    );
    showToast('All notifications marked as read', 'info');
  };

  const markNotificationAsRead = (id: string) => {
    if (!currentUser) return;
    setNotifications((prev) =>
      prev.map((n) => (n.id === id && (n.userId === currentUser.id || currentUser.role === 'admin') ? { ...n, isRead: true } : n))
    );
  };

  const deleteNotification = (id: string) => {
    if (!currentUser) return;
    setNotifications((prev) =>
      prev.filter((n) => !(n.id === id && (n.userId === currentUser.id || currentUser.role === 'admin')))
    );
  };

  const addCalendarEvent = (event: Omit<CalendarEvent, 'id'>) => {
    const newEvt: CalendarEvent = {
      ...event,
      id: 'evt-' + Date.now(),
    };
    setCalendarEvents((prev) => [...prev, newEvt]);
    showToast('Event added to calendar', 'success');
  };

  const deleteCalendarEvent = (id: string) => {
    setCalendarEvents((prev) => prev.filter((e) => e.id !== id));
    showToast('Event removed', 'info');
  };

  const uploadPaper = (paperData: Partial<Paper>): Paper => {
    const uploader = currentUser || users[0];
    const newPaper: Paper = {
      id: 'paper-' + Date.now(),
      uploaderId: uploader.id,
      uploaderName: uploader.name,
      uploaderAvatar: uploader.avatar,
      title: paperData.title || 'Untitled Paper',
      abstract: paperData.abstract || '',
      paperType: paperData.paperType || 'Journal',
      areaId: paperData.areaId || 'area-ai',
      areaName: paperData.areaName || 'Artificial Intelligence',
      year: paperData.year || new Date().getFullYear(),
      doi: paperData.doi || `10.1109/PCIU.${new Date().getFullYear()}.${Math.floor(100000 + Math.random() * 900000)}`,
      pdfUrl: paperData.pdfUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      coverUrl: paperData.coverUrl || 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&auto=format&fit=crop&q=80',
      visibility: paperData.visibility || 'public',
      status: 'published',
      aiAssisted: !!paperData.aiAssisted,
      views: 1,
      downloads: 0,
      likes: 0,
      authors: paperData.authors?.length ? paperData.authors : [uploader.name],
      keywords: paperData.keywords || ['Research', 'CollabX'],
      citationsAPA: `${uploader.name} (${new Date().getFullYear()}). ${paperData.title}. Port City International University Publications.`,
      citationsIEEE: `${uploader.name}, "${paperData.title}," PCIU Res. Trans., ${new Date().getFullYear()}.`,
      citationsBibTeX: `@article{paper_${Date.now()},
  title={${paperData.title}},
  author={${uploader.name}},
  year={${new Date().getFullYear()}}
}`,
      createdAt: new Date().toISOString(),
    };

    setPapers((prev) => [newPaper, ...prev]);
    showToast('Research paper published successfully!', 'success');
    return newPaper;
  };

  const updatePaper = (paperId: string, updates: Partial<Paper>) => {
    setPapers((prev) => prev.map((p) => (p.id === paperId ? { ...p, ...updates } : p)));
    showToast('Paper details updated', 'success');
  };

  const deletePaper = (paperId: string) => {
    setPapers((prev) => prev.filter((p) => p.id !== paperId));
    showToast('Paper removed', 'info');
  };

  const likePaper = (paperId: string) => {
    setPapers((prev) => prev.map((p) => (p.id === paperId ? { ...p, likes: p.likes + 1 } : p)));
    showToast('Liked paper', 'info');
  };

  const incrementPaperDownload = (paperId: string) => {
    setPapers((prev) => prev.map((p) => (p.id === paperId ? { ...p, downloads: p.downloads + 1 } : p)));
  };

  const submitContactMessage = (msg: Omit<ContactMessage, 'id' | 'status' | 'createdAt'>) => {
    const newMsg: ContactMessage = {
      ...msg,
      id: 'cnt-' + Date.now(),
      status: 'new',
      createdAt: new Date().toISOString(),
    };
    setContactMessages((prev) => [newMsg, ...prev]);
    showToast('Message sent! Our support team will respond shortly.', 'success');
  };

  const replyContactMessage = (msgId: string, replyText: string) => {
    setContactMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, status: 'replied', replyText } : m))
    );
    showToast('Reply dispatched to inquirer', 'success');
  };

  const inviteTeamMember = (projectId: string, emailOrUserId: string, positionTitle: string) => {
    if (!currentUser) {
      showToast('Please log in to manage team members', 'error');
      return;
    }
    const project = projects.find((p) => p.id === projectId);
    if (!project) return;

    if (project.supervisor.id !== currentUser.id && currentUser.role !== 'admin') {
      showToast('Permission denied: Only the supervisor or an administrator can invite members', 'error');
      return;
    }

    if (project.filledPositions >= project.totalPositions) {
      showToast('Cannot invite: All available positions for this project have already been filled', 'error');
      return;
    }

    const cleanInput = emailOrUserId.trim();
    const user = users.find((u) => u.id === cleanInput || u.email.toLowerCase() === cleanInput.toLowerCase());

    const isAlreadyMember = members.some(
      (m) => m.projectId === projectId && (m.userId === user?.id || m.email.toLowerCase() === cleanInput.toLowerCase())
    );
    if (isAlreadyMember) {
      showToast('User is already an active member of this project team', 'warning');
      return;
    }

    const uniqueSuffix = Date.now() + '-' + Math.random().toString(36).substring(2, 8);
    const newMember: ProjectMember = {
      id: 'mem-' + uniqueSuffix,
      projectId,
      userId: user ? user.id : 'user-' + uniqueSuffix,
      name: user ? user.name : cleanInput.split('@')[0],
      email: user ? user.email : cleanInput,
      avatar: user ? user.avatar : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
      role: 'member',
      positionTitle: positionTitle || 'Research Member',
      status: 'active',
      joinedAt: new Date().toISOString(),
    };
    setMembers((prev) => [...prev, newMember]);

    // Update positions
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p;
        const count = members.filter((m) => m.projectId === projectId).length + 1;
        return { ...p, filledPositions: Math.min(p.totalPositions, count) };
      })
    );

    if (user) {
      const notif: Notification = {
        id: 'notif-' + uniqueSuffix,
        userId: user.id,
        type: 'member_added',
        title: 'Team Invitation',
        body: `You have been added to the team for "${project.title}" as ${newMember.positionTitle}.`,
        link: `/projects/${project.id}`,
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      setNotifications((prev) => [notif, ...prev]);
    }

    addActivityLog({
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      action: 'member_invited',
      targetType: 'team',
      targetId: newMember.id,
      targetTitle: project.title,
      details: `Added ${newMember.name} as ${newMember.positionTitle}`,
    });

    showToast(`Invitation sent to ${newMember.name}!`, 'success');
  };

  const removeTeamMember = (memberId: string) => {
    if (!currentUser) {
      showToast('Please log in to manage team members', 'error');
      return;
    }
    const member = members.find((m) => m.id === memberId);
    if (!member) return;

    const project = projects.find((p) => p.id === member.projectId);
    if (!project) return;

    const isSupervisor = project.supervisor.id === currentUser.id;
    const isAdmin = currentUser.role === 'admin';
    const isSelf = member.userId === currentUser.id;

    if (!isSupervisor && !isAdmin && !isSelf) {
      showToast('Permission denied: You cannot remove this team member', 'error');
      return;
    }

    if (member.role === 'supervisor') {
      showToast('Cannot remove the project supervisor from the team', 'warning');
      return;
    }

    setMembers((prev) => prev.filter((m) => m.id !== memberId));
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== member.projectId) return p;
        const count = members.filter((m) => m.projectId === member.projectId && m.id !== memberId).length;
        return { ...p, filledPositions: Math.max(1, count) };
      })
    );

    if (!isSelf && member.userId) {
      const uniqueSuffix = Date.now() + '-' + Math.random().toString(36).substring(2, 8);
      const notif: Notification = {
        id: 'notif-' + uniqueSuffix,
        userId: member.userId,
        type: 'system',
        title: 'Team Membership Update',
        body: `You have been removed from the team for "${project.title}".`,
        link: '/my-projects',
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      setNotifications((prev) => [notif, ...prev]);
    }

    addActivityLog({
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      action: 'member_removed',
      targetType: 'team',
      targetId: member.id,
      targetTitle: project.title,
      details: `Removed ${member.name} from project team`,
    });

    showToast('Member removed from project team', 'info');
  };

  const addUserByAdmin = (userData: Partial<User>) => {
    const newUser: User = {
      id: 'user-' + Date.now(),
      name: userData.name || 'New User',
      email: userData.email || `user${Date.now()}@collabx.test`,
      role: userData.role || 'student',
      department: userData.department || 'Computer Science & Engineering',
      institution: userData.institution || 'Port City International University',
      headline: userData.headline || 'Student / Researcher',
      bio: userData.bio || '',
      avatar: userData.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
      skills: userData.skills || ['Python', 'Data Analysis'],
      interests: userData.interests || ['Artificial Intelligence'],
      links: {},
      status: userData.status || 'active',
      createdAt: new Date().toISOString(),
    };
    setUsers((prev) => [newUser, ...prev]);
    showToast(`User ${newUser.name} created!`, 'success');
  };

  const updateUserByAdmin = (userId: string, updates: Partial<User>) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, ...updates } : u)));
    showToast('User record updated', 'success');
  };

  const deleteUserByAdmin = (userId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    showToast('User deleted', 'info');
  };

  const saveAiDraft = (draft: AiDraft) => {
    setAiDrafts((prev) => {
      const idx = prev.findIndex((d) => d.id === draft.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = draft;
        return copy;
      }
      return [draft, ...prev];
    });
    showToast('AI draft saved', 'success');
  };

  const deleteAiDraft = (id: string) => {
    setAiDrafts((prev) => prev.filter((d) => d.id !== id));
    showToast('Draft deleted', 'info');
  };

  const resetToInitialSeed = () => {
    localStorage.clear();
    setUsers(SEED_USERS);
    setCurrentUserId(null);
    setProjects(SEED_PROJECTS);
    setAreas(SEED_AREAS);
    setApplications(SEED_APPLICATIONS);
    setSavedProjectIds(SEED_SAVED_PROJECT_IDS);
    setMilestones(SEED_MILESTONES);
    setMembers(SEED_MEMBERS);
    setFiles(SEED_FILES);
    setMessages(SEED_MESSAGES);
    setNotifications(SEED_NOTIFICATIONS);
    setCalendarEvents(SEED_CALENDAR_EVENTS);
    setPapers(SEED_PAPERS);
    setContactMessages(SEED_CONTACT_MESSAGES);
    setAiDrafts([]);
    showToast('Reset data to initial fresh state (Logged Out)!', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        projects,
        areas,
        applications,
        savedProjectIds,
        milestones,
        members,
        files,
        messages,
        notifications,
        calendarEvents,
        papers,
        contactMessages,
        aiDrafts,
        activityLogs,
        toasts,
        isGlobalSearchOpen,
        setIsGlobalSearchOpen,
        globalSearchQuery,
        setGlobalSearchQuery,
        login,
        register,
        logout,
        setCurrentUser,
        switchDemoUser,
        showToast,
        addActivityLog,
        updateUserProfile,
        applyToProject,
        withdrawApplication,
        updateApplicationStatus,
        toggleSaveProject,
        publishProject,
        submitProjectForModeration,
        updateProject,
        archiveProject,
        closeProject,
        completeProject,
        deleteProject,
        approveProjectByAdmin,
        rejectProjectByAdmin,
        addMilestone,
        updateMilestone,
        deleteMilestone,
        sendMessage,
        markNotificationsRead,
        markNotificationAsRead,
        deleteNotification,
        addCalendarEvent,
        deleteCalendarEvent,
        uploadPaper,
        updatePaper,
        deletePaper,
        likePaper,
        incrementPaperDownload,
        submitContactMessage,
        replyContactMessage,
        inviteTeamMember,
        removeTeamMember,
        addUserByAdmin,
        updateUserByAdmin,
        deleteUserByAdmin,
        saveAiDraft,
        deleteAiDraft,
        getMatchScore,
        resetToInitialSeed,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
