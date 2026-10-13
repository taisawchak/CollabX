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
import {
  supabase,
  isSupabaseConfigured,
  mapProfileToUser,
  mapProjectFromRow,
  mapApplicationFromRow,
  mapMemberFromRow,
  mapNotificationFromRow,
  mapPaperFromRow,
  mapMessageFromRow,
  safeSupabaseCall,
} from '../lib/supabase';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error' | 'warning';
}

interface AppContextType {
  isSupabaseConnected: boolean;
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
    designation?: string;
    orcid?: string;
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
  sendMessage: (
    targetId: string,
    body: string,
    attachment?: { name: string; size: string; url: string; type: string },
    recipient?: { id: string; name: string; avatar: string }
  ) => void;
  markConversationAsRead: (conversationId: string) => void;
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
    return loadFromStorage<string | null>('currentUserId', null);
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
  const [isSupabaseConnected, setIsSupabaseConnected] = useState<boolean>(false);

  // Supabase Data Initialization & Real-Time Channel Subscription
  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) return;
    const client = supabase;
    let isMounted = true;

    const syncWithSupabase = async () => {
      try {
        const [profilesRes, projectsRes, appsRes, membersRes, notifsRes, papersRes, messagesRes] = await Promise.all([
          client.from('profiles').select('*'),
          client.from('projects').select('*'),
          client.from('applications').select('*'),
          client.from('project_members').select('*'),
          client.from('notifications').select('*'),
          client.from('papers').select('*'),
          client.from('messages').select('*').order('created_at', { ascending: true }),
        ]);

        if (!isMounted) return;

        if (!profilesRes.error && profilesRes.data && profilesRes.data.length > 0) {
          const remoteUsers = profilesRes.data.map(mapProfileToUser);
          setUsers((prev) => {
            const map = new Map(prev.map((u) => [u.id, u]));
            remoteUsers.forEach((ru) => map.set(ru.id, ru));
            return Array.from(map.values());
          });
        }

        if (!projectsRes.error && projectsRes.data && projectsRes.data.length > 0) {
          const remoteProjects = projectsRes.data.map(mapProjectFromRow);
          setProjects((prev) => {
            const map = new Map(prev.map((p) => [p.id, p]));
            remoteProjects.forEach((rp) => map.set(rp.id, rp));
            return Array.from(map.values());
          });
        }

        if (!appsRes.error && appsRes.data && appsRes.data.length > 0) {
          const remoteApps = appsRes.data.map(mapApplicationFromRow);
          setApplications((prev) => {
            const map = new Map(prev.map((a) => [a.id, a]));
            remoteApps.forEach((ra) => map.set(ra.id, ra));
            return Array.from(map.values());
          });
        }

        if (!membersRes.error && membersRes.data && membersRes.data.length > 0) {
          const remoteMembers = membersRes.data.map(mapMemberFromRow);
          setMembers((prev) => {
            const map = new Map(prev.map((m) => [`${m.projectId}_${m.userId}`, m]));
            remoteMembers.forEach((rm) => map.set(`${rm.projectId}_${rm.userId}`, rm));
            return Array.from(map.values());
          });
        }

        if (!notifsRes.error && notifsRes.data && notifsRes.data.length > 0) {
          const remoteNotifs = notifsRes.data.map(mapNotificationFromRow);
          setNotifications((prev) => {
            const map = new Map(prev.map((n) => [n.id, n]));
            remoteNotifs.forEach((rn) => map.set(rn.id, rn));
            return Array.from(map.values());
          });
        }

        if (!papersRes.error && papersRes.data && papersRes.data.length > 0) {
          const remotePapers = papersRes.data.map(mapPaperFromRow);
          setPapers((prev) => {
            const map = new Map(prev.map((p) => [p.id, p]));
            remotePapers.forEach((rp) => map.set(rp.id, rp));
            return Array.from(map.values());
          });
        }

        if (!messagesRes.error && messagesRes.data && messagesRes.data.length > 0) {
          const remoteMessages = messagesRes.data.map(mapMessageFromRow);
          setMessages((prev) => {
            const map = new Map(prev.map((m) => [m.id, m]));
            remoteMessages.forEach((rm) => map.set(rm.id, rm));
            return Array.from(map.values());
          });
        }

        setIsSupabaseConnected(true);

        // Check for active Supabase Auth session to restore credentials persistently
        try {
          const { data: sessionData } = await client.auth.getSession();
          if (sessionData?.session?.user && isMounted) {
            const authUser = sessionData.session.user;
            const userProfile = profilesRes.data?.find((p: any) => p.id === authUser.id);
            const mappedUser = userProfile ? mapProfileToUser(userProfile) : {
              id: authUser.id,
              name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'Researcher',
              email: authUser.email || '',
              role: (authUser.user_metadata?.role as Role) || 'student',
              department: authUser.user_metadata?.department || 'Computer Science & Engineering',
              institution: 'CollabX University',
              headline: authUser.user_metadata?.role === 'supervisor' ? 'Faculty Supervisor' : 'Researcher',
              bio: '',
              avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${authUser.email || authUser.id}`,
              skills: ['Python', 'Research Writing'],
              interests: ['Artificial Intelligence'],
              links: {},
              status: 'active' as const,
              createdAt: authUser.created_at || new Date().toISOString(),
            };
            setUsers((prev) => [mappedUser, ...prev.filter((u) => u.id !== mappedUser.id)]);
            setCurrentUserId(authUser.id);
          }
        } catch (sessErr) {
          console.warn('Could not inspect Supabase session:', sessErr);
        }

        // Realtime Subscription
        const channel = client
          .channel('collabx_realtime_sync')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'applications' }, (payload) => {
            if (payload.eventType === 'INSERT') {
              const newApp = mapApplicationFromRow(payload.new);
              setApplications((prev) => [newApp, ...prev.filter((a) => a.id !== newApp.id)]);
            } else if (payload.eventType === 'UPDATE') {
              const updatedApp = mapApplicationFromRow(payload.new);
              setApplications((prev) => prev.map((a) => (a.id === updatedApp.id ? updatedApp : a)));
            } else if (payload.eventType === 'DELETE' && payload.old?.id) {
              setApplications((prev) => prev.filter((a) => a.id !== payload.old.id));
            }
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, (payload) => {
            if (payload.eventType === 'INSERT') {
              const newProj = mapProjectFromRow(payload.new);
              setProjects((prev) => [newProj, ...prev.filter((p) => p.id !== newProj.id)]);
            } else if (payload.eventType === 'UPDATE') {
              const updatedProj = mapProjectFromRow(payload.new);
              setProjects((prev) => prev.map((p) => (p.id === updatedProj.id ? updatedProj : p)));
            } else if (payload.eventType === 'DELETE' && payload.old?.id) {
              setProjects((prev) => prev.filter((p) => p.id !== payload.old.id));
            }
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, (payload) => {
            if (payload.eventType === 'INSERT') {
              const newNotif = mapNotificationFromRow(payload.new);
              setNotifications((prev) => [newNotif, ...prev.filter((n) => n.id !== newNotif.id)]);
            } else if (payload.eventType === 'UPDATE') {
              const updatedNotif = mapNotificationFromRow(payload.new);
              setNotifications((prev) => prev.map((n) => (n.id === updatedNotif.id ? updatedNotif : n)));
            }
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'project_members' }, (payload) => {
            if (payload.eventType === 'INSERT') {
              const newMem = mapMemberFromRow(payload.new);
              setMembers((prev) => [...prev.filter((m) => m.id !== newMem.id), newMem]);
            } else if (payload.eventType === 'DELETE' && payload.old?.id) {
              setMembers((prev) => prev.filter((m) => m.id !== payload.old.id));
            }
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'papers' }, (payload) => {
            if (payload.eventType === 'INSERT') {
              const newPaper = mapPaperFromRow(payload.new);
              setPapers((prev) => [newPaper, ...prev.filter((p) => p.id !== newPaper.id)]);
            } else if (payload.eventType === 'UPDATE') {
              const updatedPaper = mapPaperFromRow(payload.new);
              setPapers((prev) => prev.map((p) => (p.id === updatedPaper.id ? updatedPaper : p)));
            } else if (payload.eventType === 'DELETE' && payload.old?.id) {
              setPapers((prev) => prev.filter((p) => p.id !== payload.old.id));
            }
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, (payload) => {
            if (payload.eventType === 'INSERT') {
              const newMsg = mapMessageFromRow(payload.new);
              setMessages((prev) => [...prev.filter((m) => m.id !== newMsg.id), newMsg]);
            } else if (payload.eventType === 'UPDATE') {
              const updatedMsg = mapMessageFromRow(payload.new);
              setMessages((prev) => prev.map((m) => (m.id === updatedMsg.id ? updatedMsg : m)));
            } else if (payload.eventType === 'DELETE' && payload.old?.id) {
              setMessages((prev) => prev.filter((m) => m.id !== payload.old.id));
            }
          })
          .subscribe();

        // Listen for Auth changes in real time
        const { data: authSub } = client.auth.onAuthStateChange(async (event, session) => {
          if (!isMounted) return;
          if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user) {
            const { data: pRow } = await client.from('profiles').select('*').eq('id', session.user.id).maybeSingle();
            if (pRow) {
              const u = mapProfileToUser(pRow);
              setUsers((prev) => [u, ...prev.filter((x) => x.id !== u.id)]);
              setCurrentUserId(u.id);
            }
          } else if (event === 'SIGNED_OUT') {
            setCurrentUserId(null);
          }
        });

        return () => {
          authSub.subscription.unsubscribe();
          client.removeChannel(channel);
        };
      } catch (err) {
        console.warn('Supabase initial fetch skipped or failed:', err);
      }
    };

    syncWithSupabase();

    return () => {
      isMounted = false;
    };
  }, []);


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

  // If currentUser is loaded and found to be deactivated/inactive, end the session
  useEffect(() => {
    if (currentUserId && currentUser && currentUser.status === 'inactive') {
      setCurrentUserId(null);
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem(STORAGE_KEY_PREFIX + 'currentUserId');
      }
      showToast('Your session has ended because this account has been deactivated.', 'warning');
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

    // 0. Supabase Authentication (Cloud Backend)
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (authError) {
          // If email confirmation is required, report that to the user clearly
          if (authError.message.toLowerCase().includes('email not confirmed')) {
            return {
              success: false,
              error: 'Email not confirmed. Please check your inbox or disable email confirmation in your Supabase Auth settings.',
            };
          }
          // If credentials error, check if this is a known local seed demo user
          const isDemoSeed = SEED_USERS.some((su) => su.email.toLowerCase() === cleanEmail);
          if (!isDemoSeed) {
            return { success: false, error: authError.message || 'Invalid email or password.' };
          }
        } else if (authData?.user) {
          const { data: profileRow } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authData.user.id)
            .maybeSingle();

          const authenticatedUser = profileRow
            ? mapProfileToUser(profileRow)
            : {
                id: authData.user.id,
                name: authData.user.user_metadata?.name || cleanEmail.split('@')[0],
                email: cleanEmail,
                role: (authData.user.user_metadata?.role as Role) || 'student',
                department: authData.user.user_metadata?.department || 'Computer Science & Engineering',
                institution: 'CollabX University',
                headline: 'Researcher',
                bio: '',
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${cleanEmail}`,
                skills: ['Python', 'Research Writing'],
                interests: ['Artificial Intelligence'],
                links: {},
                status: 'active' as const,
                createdAt: new Date().toISOString(),
              };

          setUsers((prev) => [authenticatedUser, ...prev.filter((u) => u.id !== authenticatedUser.id)]);
          setCurrentUserId(authenticatedUser.id);
          showToast(`Welcome back, ${authenticatedUser.name}! (Supabase Auth)`, 'success');
          return { success: true, user: authenticatedUser };
        }
      } catch (err: any) {
        console.warn('Supabase auth attempt encountered an issue:', err);
      }
    }

    // 1. Local Database / Seed account lookup (Fallback & Demo Accounts)
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
   * 5. Connects to Supabase Auth & profiles table if configured.
   * 6. Saves new user to records with active status.
   * 7. Does NOT authenticate session automatically (visitor is redirected to Login).
   */
  const register = async (data: {
    name: string;
    email: string;
    password: string;
    role: Role;
    universityId?: string;
    department?: string;
    designation?: string;
    orcid?: string;
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

    let supabaseUserId: string | null = null;

    // Optional Supabase Registration
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
          email: cleanEmail,
          password: data.password,
          options: {
            data: {
              name: cleanName,
              role: data.role,
              department: data.department || 'Computer Science & Engineering',
              universityId: data.universityId,
              designation: data.designation,
              orcid: data.orcid,
            },
          },
        });

        if (signUpErr) {
          if (signUpErr.message.toLowerCase().includes('already registered')) {
            return { success: false, error: 'An account with this email address already exists in Supabase Auth.' };
          }
          return { success: false, error: signUpErr.message || 'Supabase authentication registration failed.' };
        } else if (signUpData?.user) {
          supabaseUserId = signUpData.user.id;
          const { error: profErr } = await supabase.from('profiles').upsert({
            id: supabaseUserId,
            email: cleanEmail,
            name: cleanName,
            role: data.role,
            department: data.department?.trim() || 'Computer Science & Engineering',
            institution: 'CollabX University',
            headline:
              data.designation?.trim() ||
              (data.role === 'student'
                ? 'Student Scholar'
                : data.role === 'supervisor'
                ? 'Faculty Supervisor'
                : 'Academic Researcher'),
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${cleanName}`,
            status: 'active',
            university_id: data.universityId?.trim(),
            links: data.orcid?.trim() ? { orcid: data.orcid.trim() } : {},
          });
          if (profErr) {
            console.warn('Profile sync warning in Supabase:', profErr.message);
          }
        }
      } catch (err: any) {
        console.warn('Supabase signUp error fallback to local storage:', err);
        return { success: false, error: err.message || 'Error communicating with Supabase authentication server.' };
      }
    }

    // Salt and hash the password
    const salt = Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
    const passwordHash = await hashPassword(data.password, salt);

    const newUser: User = {
      id: supabaseUserId || 'user-' + Date.now().toString(36),
      name: cleanName,
      email: cleanEmail,
      role: data.role,
      department: data.department?.trim() || 'Computer Science & Engineering',
      institution: 'CollabX University',
      headline:
        data.designation?.trim() ||
        (data.role === 'student'
          ? 'Student Scholar'
          : data.role === 'supervisor'
          ? 'Faculty Supervisor'
          : 'Academic Researcher'),
      bio: 'Member of the CollabX research community.',
      avatar:
        data.role === 'student'
          ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
      skills: ['Python', 'Research Writing'],
      interests: ['Artificial Intelligence', 'Data Science'],
      links: data.orcid?.trim() ? { orcid: data.orcid.trim() } : {},
      status: 'active',
      createdAt: new Date().toISOString(),
      passwordHash,
      passwordSalt: salt,
      universityId: data.universityId?.trim(),
      designation: data.designation?.trim(),
      orcid: data.orcid?.trim(),
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
    if (isSupabaseConfigured() && supabase) {
      supabase.auth.signOut().catch(() => {});
    }
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

    // Sync to Supabase if configured
    safeSupabaseCall(async (client) => {
      await client.from('applications').upsert({
        id: appRecord.id,
        project_id: appRecord.projectId,
        project_title: appRecord.projectTitle,
        project_thumbnail: appRecord.projectThumbnail,
        user_id: appRecord.userId,
        user_name: appRecord.userName,
        user_avatar: appRecord.userAvatar,
        user_headline: appRecord.userHeadline,
        applied_date: appRecord.appliedDate,
        status: appRecord.status,
        message: appRecord.message,
        skills_note: appRecord.skillsNote,
        cv_file_name: appRecord.cvFileName,
      });

      await client.from('notifications').insert({
        id: newNotif.id,
        user_id: newNotif.userId,
        type: newNotif.type,
        title: newNotif.title,
        body: newNotif.body,
        link: newNotif.link,
        is_read: false,
      });
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

    // Sync to Supabase if configured
    safeSupabaseCall(async (client) => {
      await client.from('applications').update({ status: 'withdrawn' }).eq('id', appId);
    });

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

      // 6. Supabase Cloud Sync (Approved)
      safeSupabaseCall(async (client) => {
        await client
          .from('applications')
          .update({
            status: 'approved',
            supervisor_response: responseNote || null,
            decided_at: new Date().toISOString(),
          })
          .eq('id', appId);

        await client
          .from('project_members')
          .upsert({
            id: newMember.id,
            project_id: newMember.projectId,
            user_id: newMember.userId,
            name: newMember.name,
            email: newMember.email,
            avatar: newMember.avatar,
            role: 'member',
            position_title: newMember.positionTitle,
            status: 'active',
          });

        await client
          .from('projects')
          .update({
            filled_positions: Math.min(project.totalPositions, project.filledPositions + 1),
          })
          .eq('id', project.id);

        await client
          .from('notifications')
          .insert({
            id: notif.id,
            user_id: notif.userId,
            type: notif.type,
            title: notif.title,
            body: notif.body,
            link: notif.link,
            is_read: false,
          });
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

      // Supabase Cloud Sync (Rejected)
      safeSupabaseCall(async (client) => {
        await client
          .from('applications')
          .update({
            status: 'rejected',
            supervisor_response: responseNote || null,
            decided_at: new Date().toISOString(),
          })
          .eq('id', appId);

        await client
          .from('notifications')
          .insert({
            id: notif.id,
            user_id: notif.userId,
            type: notif.type,
            title: notif.title,
            body: notif.body,
            link: notif.link,
            is_read: false,
          });
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
    // Faculty (supervisors & researchers) and administrators publish directly as approved/active
    let initialStatus: ProjectStatus = 'pending';
    if (options?.isDraft) {
      initialStatus = 'draft';
    } else if (currentUser?.role === 'admin' || currentUser?.role === 'supervisor' || currentUser?.role === 'researcher') {
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

    // Supabase Cloud Sync
    safeSupabaseCall(async (client) => {
      // Ensure supervisor profile exists in profiles table before inserting project
      await client.from('profiles').upsert({
        id: supervisor.id,
        email: supervisor.email,
        name: supervisor.name,
        role: supervisor.role,
        department: supervisor.department || 'Computer Science & Engineering',
        institution: supervisor.institution || 'Port City International University',
        headline: supervisor.headline || 'Faculty Supervisor',
        avatar: supervisor.avatar,
        status: 'active',
      });

      const { error: projErr } = await client
        .from('projects')
        .insert({
          id: newProj.id,
          title: newProj.title,
          slug: newProj.slug,
          summary: newProj.summary,
          description: newProj.description,
          objectives: newProj.objectives,
          expected_outcome: newProj.expectedOutcome,
          methodology: newProj.methodology,
          area_id: newProj.areaId,
          area_name: newProj.areaName,
          subarea: newProj.subarea,
          project_type: newProj.projectType,
          difficulty: newProj.difficulty,
          duration_months: newProj.durationMonths,
          total_positions: newProj.totalPositions,
          filled_positions: newProj.filledPositions,
          deadline: newProj.deadline || null,
          start_date: newProj.startDate || null,
          end_date: newProj.endDate || null,
          status: newProj.status,
          supervisor_id: newProj.supervisor.id,
          supervisor_name: newProj.supervisor.name,
          supervisor_title: newProj.supervisor.title,
          supervisor_avatar: newProj.supervisor.avatar,
          supervisor_institution: newProj.supervisor.institution,
          supervisor_email: newProj.supervisor.email,
          required_skills: newProj.requiredSkills,
          tags: newProj.tags,
          thumbnail: newProj.thumbnail,
          views: newProj.views,
          progress_percent: newProj.progressPercent,
        });

      await client
        .from('project_members')
        .insert({
          id: newMember.id,
          project_id: newMember.projectId,
          user_id: newMember.userId,
          name: newMember.name,
          email: newMember.email,
          avatar: newMember.avatar,
          role: 'supervisor',
          position_title: newMember.positionTitle,
          status: 'active',
        });
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

    // Supabase Cloud Sync
    safeSupabaseCall(async (client) => {
      await client.from('projects').update({ status: 'pending' }).eq('id', projectId);
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

    safeSupabaseCall(async (client) => {
      const payload: Record<string, any> = {};
      if (updates.title !== undefined) payload.title = updates.title;
      if (updates.summary !== undefined) payload.summary = updates.summary;
      if (updates.description !== undefined) payload.description = updates.description;
      if (updates.objectives !== undefined) payload.objectives = updates.objectives;
      if (updates.expectedOutcome !== undefined) payload.expected_outcome = updates.expectedOutcome;
      if (updates.methodology !== undefined) payload.methodology = updates.methodology;
      if (updates.areaId !== undefined) payload.area_id = updates.areaId;
      if (updates.areaName !== undefined) payload.area_name = updates.areaName;
      if (updates.difficulty !== undefined) payload.difficulty = updates.difficulty;
      if (updates.status !== undefined) payload.status = updates.status;
      if (updates.deadline !== undefined) payload.deadline = updates.deadline || null;
      if (updates.totalPositions !== undefined) payload.total_positions = updates.totalPositions;
      if (updates.filledPositions !== undefined) payload.filled_positions = updates.filledPositions;
      if (updates.requiredSkills !== undefined) payload.required_skills = updates.requiredSkills;
      if (updates.tags !== undefined) payload.tags = updates.tags;
      if (updates.thumbnail !== undefined) payload.thumbnail = updates.thumbnail;
      if (updates.progressPercent !== undefined) payload.progress_percent = updates.progressPercent;
      if (Object.keys(payload).length > 0) {
        await client.from('projects').update(payload).eq('id', projectId);
      }
    });

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

    safeSupabaseCall(async (client) => {
      await client.from('projects').update({ status: 'archived' }).eq('id', projectId);
    });

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

      safeSupabaseCall(async (client) => {
        await client.from('notifications').insert({
          id: notif.id,
          user_id: notif.userId,
          type: notif.type,
          title: notif.title,
          body: notif.body,
          link: notif.link,
          is_read: false,
        });
      });
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

    safeSupabaseCall(async (client) => {
      await client.from('projects').update({ status: 'closed' }).eq('id', projectId);
    });

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

    safeSupabaseCall(async (client) => {
      await client.from('projects').update({ status: 'completed', progress_percent: 100 }).eq('id', projectId);
    });

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

    safeSupabaseCall(async (client) => {
      await client.from('projects').delete().eq('id', projectId);
    });

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

    safeSupabaseCall(async (client) => {
      await client.from('projects').update({ status: 'approved', reject_reason: null }).eq('id', projectId);
      await client.from('notifications').insert({
        id: notif.id,
        user_id: notif.userId,
        type: notif.type,
        title: notif.title,
        body: notif.body,
        link: notif.link,
        is_read: false,
      });
    });

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

    safeSupabaseCall(async (client) => {
      await client.from('projects').update({ status: 'rejected', reject_reason: reason || null }).eq('id', projectId);
      await client.from('notifications').insert({
        id: notif.id,
        user_id: notif.userId,
        type: notif.type,
        title: notif.title,
        body: notif.body,
        link: notif.link,
        is_read: false,
      });
    });

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

  const markConversationAsRead = (conversationId: string) => {
    if (!currentUser) return;
    setMessages((prev) =>
      prev.map((m) => {
        const matches = m.conversationId === conversationId || m.projectId === conversationId;
        if (matches && !m.isRead && (m.recipientId === currentUser.id || !m.recipientId)) {
          return { ...m, isRead: true };
        }
        return m;
      })
    );

    safeSupabaseCall(async (client) => {
      await client
        .from('messages')
        .update({ is_read: true })
        .eq('conversation_id', conversationId)
        .eq('recipient_id', currentUser.id);
    });
  };

  const sendMessage = (
    targetId: string,
    body: string,
    attachment?: { name: string; size: string; url: string; type: string },
    recipient?: { id: string; name: string; avatar: string }
  ) => {
    if (!currentUser) return;
    const cleanBody = body.trim();
    if (!cleanBody && !attachment) return;

    // Determine if target is a project group or a direct conversation
    const isProject = projects.some((p) => p.id === targetId);
    const isDirect = !isProject || Boolean(recipient) || targetId.startsWith('dm_');

    let convId = targetId;
    let recId = recipient?.id;
    let recName = recipient?.name;
    let recAvatar = recipient?.avatar;

    if (isDirect) {
      if (!recId && targetId.startsWith('dm_')) {
        const parts = targetId.split('_').filter((p) => p !== 'dm');
        recId = parts.find((id) => id !== currentUser.id) || parts[0];
      }
      if (recId) {
        convId = ['dm', ...[currentUser.id, recId].sort()].join('_');
        if (!recName) {
          const recUser = users.find((u) => u.id === recId);
          recName = recUser?.name || 'Collaborator';
          recAvatar = recUser?.avatar || '';
        }
      }
    }

    const newMsg: Message = {
      id: 'msg-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      projectId: isProject ? targetId : '',
      conversationId: convId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      recipientId: isDirect ? recId : undefined,
      recipientName: isDirect ? recName : undefined,
      recipientAvatar: isDirect ? recAvatar : undefined,
      body: cleanBody,
      attachment,
      createdAt: new Date().toISOString(),
      isRead: isDirect ? false : true,
    };

    setMessages((prev) => [...prev, newMsg]);

    // Dispatch real-time in-app notification to receiver
    if (isDirect && recId && recId !== currentUser.id) {
      const directNotif: Notification = {
        id: 'notif-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        userId: recId,
        type: 'message',
        title: `Message from ${currentUser.name}`,
        body: cleanBody.length > 70 ? cleanBody.substring(0, 67) + '...' : cleanBody,
        link: `/messages?user=${currentUser.id}`,
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      setNotifications((prev) => [directNotif, ...prev]);

      safeSupabaseCall(async (client) => {
        await client.from('notifications').insert({
          id: directNotif.id,
          user_id: directNotif.userId,
          type: directNotif.type,
          title: directNotif.title,
          body: directNotif.body,
          link: directNotif.link,
          is_read: false,
        });
      });
    } else if (isProject) {
      const projectMembers = members.filter((m) => m.projectId === targetId && m.userId !== currentUser.id);
      const targetProj = projects.find((p) => p.id === targetId);
      const memberNotifsToInsert: any[] = [];

      projectMembers.forEach((mem) => {
        const projNotif: Notification = {
          id: 'notif-' + Date.now() + '-' + mem.userId,
          userId: mem.userId,
          type: 'message',
          title: `Discussion in ${targetProj?.title || 'Project'}`,
          body: `${currentUser.name}: ${cleanBody.length > 60 ? cleanBody.substring(0, 57) + '...' : cleanBody}`,
          link: `/projects/${targetId}/discussion`,
          isRead: false,
          createdAt: new Date().toISOString(),
        };
        setNotifications((prev) => [projNotif, ...prev]);
        memberNotifsToInsert.push({
          id: projNotif.id,
          user_id: projNotif.userId,
          type: projNotif.type,
          title: projNotif.title,
          body: projNotif.body,
          link: projNotif.link,
          is_read: false,
        });
      });

      if (memberNotifsToInsert.length > 0) {
        safeSupabaseCall(async (client) => {
          await client.from('notifications').insert(memberNotifsToInsert);
        });
      }
    }

    safeSupabaseCall(async (client) => {
      // Ensure sender profile exists in profiles table
      await client.from('profiles').upsert({
        id: currentUser.id,
        email: currentUser.email,
        name: currentUser.name,
        role: currentUser.role,
        department: currentUser.department || 'Computer Science & Engineering',
        institution: currentUser.institution || 'Port City International University',
        headline: currentUser.headline || '',
        avatar: currentUser.avatar,
        status: 'active',
      });

      // If direct message recipient, ensure recipient profile exists
      if (recId) {
        const recUser = users.find((u) => u.id === recId);
        if (recUser) {
          await client.from('profiles').upsert({
            id: recUser.id,
            email: recUser.email,
            name: recUser.name,
            role: recUser.role,
            department: recUser.department || 'Computer Science & Engineering',
            institution: recUser.institution || 'Port City International University',
            headline: recUser.headline || '',
            avatar: recUser.avatar,
            status: 'active',
          });
        }
      }

      const { error: msgErr } = await client.from('messages').insert({
        id: newMsg.id,
        project_id: isProject ? targetId : null,
        conversation_id: newMsg.conversationId,
        sender_id: newMsg.senderId,
        sender_name: newMsg.senderName,
        sender_avatar: newMsg.senderAvatar,
        recipient_id: newMsg.recipientId || null,
        recipient_name: newMsg.recipientName || null,
        recipient_avatar: newMsg.recipientAvatar || null,
        body: newMsg.body,
        attachment: newMsg.attachment || null,
        is_read: newMsg.isRead,
      });

      if (msgErr) {
        console.warn('Supabase message insert notice:', msgErr.message);
      }
    });
  };

  const markNotificationsRead = () => {
    if (!currentUser) return;
    setNotifications((prev) =>
      prev.map((n) => (n.userId === currentUser.id ? { ...n, isRead: true } : n))
    );
    safeSupabaseCall(async (client) => {
      await client
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', currentUser.id);
    });
    showToast('All notifications marked as read', 'info');
  };

  const markNotificationAsRead = (id: string) => {
    if (!currentUser) return;
    setNotifications((prev) =>
      prev.map((n) => (n.id === id && (n.userId === currentUser.id || currentUser.role === 'admin') ? { ...n, isRead: true } : n))
    );
    safeSupabaseCall(async (client) => {
      await client
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);
    });
  };

  const deleteNotification = (id: string) => {
    if (!currentUser) return;
    setNotifications((prev) =>
      prev.filter((n) => !(n.id === id && (n.userId === currentUser.id || currentUser.role === 'admin')))
    );
    safeSupabaseCall(async (client) => {
      await client
        .from('notifications')
        .delete()
        .eq('id', id);
    });
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

    // Supabase Cloud Sync
    safeSupabaseCall(async (client) => {
      // Ensure uploader profile exists in profiles table before inserting paper
      await client.from('profiles').upsert({
        id: uploader.id,
        email: uploader.email,
        name: uploader.name,
        role: uploader.role,
        department: uploader.department || 'Computer Science & Engineering',
        institution: uploader.institution || 'Port City International University',
        headline: uploader.headline || 'Faculty Researcher',
        avatar: uploader.avatar,
        status: 'active',
      });

      const { error: paperErr } = await client.from('papers').insert({
        id: newPaper.id,
        uploader_id: newPaper.uploaderId,
        uploader_name: newPaper.uploaderName,
        uploader_avatar: newPaper.uploaderAvatar || null,
        title: newPaper.title,
        abstract: newPaper.abstract,
        paper_type: newPaper.paperType,
        area_id: newPaper.areaId,
        area_name: newPaper.areaName,
        year: newPaper.year,
        doi: newPaper.doi || null,
        pdf_url: newPaper.pdfUrl,
        cover_url: newPaper.coverUrl || null,
        visibility: newPaper.visibility,
        status: newPaper.status,
        ai_assisted: newPaper.aiAssisted,
        views: newPaper.views,
        downloads: newPaper.downloads,
        likes: newPaper.likes,
        authors: newPaper.authors,
        keywords: newPaper.keywords,
        citations_apa: newPaper.citationsAPA,
        citations_ieee: newPaper.citationsIEEE,
      });

      if (paperErr) {
        console.error('Supabase paper insert error:', paperErr);
      }
    });

    showToast('Research paper published successfully!', 'success');
    return newPaper;
  };

  const updatePaper = (paperId: string, updates: Partial<Paper>) => {
    setPapers((prev) => prev.map((p) => (p.id === paperId ? { ...p, ...updates } : p)));

    safeSupabaseCall(async (client) => {
      const payload: Record<string, any> = {};
      if (updates.title !== undefined) payload.title = updates.title;
      if (updates.abstract !== undefined) payload.abstract = updates.abstract;
      if (updates.paperType !== undefined) payload.paper_type = updates.paperType;
      if (updates.areaId !== undefined) payload.area_id = updates.areaId;
      if (updates.areaName !== undefined) payload.area_name = updates.areaName;
      if (updates.authors !== undefined) payload.authors = updates.authors;
      if (updates.keywords !== undefined) payload.keywords = updates.keywords;
      if (updates.status !== undefined) payload.status = updates.status;
      if (updates.likes !== undefined) payload.likes = updates.likes;
      if (updates.downloads !== undefined) payload.downloads = updates.downloads;
      if (updates.views !== undefined) payload.views = updates.views;
      if (Object.keys(payload).length > 0) {
        await client.from('papers').update(payload).eq('id', paperId);
      }
    });

    showToast('Paper details updated', 'success');
  };

  const deletePaper = (paperId: string) => {
    setPapers((prev) => prev.filter((p) => p.id !== paperId));

    safeSupabaseCall(async (client) => {
      await client.from('papers').delete().eq('id', paperId);
    });

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

    // Supabase Cloud Sync
    safeSupabaseCall(async (client) => {
      await client
        .from('project_members')
        .upsert({
          id: newMember.id,
          project_id: newMember.projectId,
          user_id: newMember.userId,
          name: newMember.name,
          email: newMember.email,
          avatar: newMember.avatar,
          role: 'member',
          position_title: newMember.positionTitle,
          status: 'active',
        });

      await client
        .from('projects')
        .update({
          filled_positions: Math.min(project.totalPositions, members.filter((m) => m.projectId === projectId).length + 1),
        })
        .eq('id', project.id);

      if (user) {
        await client
          .from('notifications')
          .insert({
            id: 'notif-' + uniqueSuffix,
            user_id: user.id,
            type: 'member_added',
            title: 'Team Invitation',
            body: `You have been added to the team for "${project.title}" as ${newMember.positionTitle}.`,
            link: `/projects/${project.id}`,
            is_read: false,
          });
      }
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

      safeSupabaseCall(async (client) => {
        await client
          .from('notifications')
          .insert({
            id: 'notif-' + uniqueSuffix,
            user_id: member.userId,
            type: 'system',
            title: 'Team Membership Update',
            body: `You have been removed from the team for "${project.title}".`,
            link: '/my-projects',
            is_read: false,
          });
      });
    }

    // Supabase Cloud Sync
    safeSupabaseCall(async (client) => {
      await client
        .from('project_members')
        .delete()
        .eq('id', memberId);

      const remainingCount = members.filter((m) => m.projectId === member.projectId && m.id !== memberId).length;
      await client
        .from('projects')
        .update({
          filled_positions: Math.max(1, remainingCount),
        })
        .eq('id', member.projectId);
    });

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
        isSupabaseConnected,
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
        markConversationAsRead,
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
