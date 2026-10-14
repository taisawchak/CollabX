import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import {
  SEED_USERS,
  SEED_PROJECTS,
  SEED_AREAS,
  SEED_APPLICATIONS,
  SEED_SAVED_PROJECT_IDS,
  SEED_MILESTONES,
  SEED_MEMBERS,
  SEED_FILES,
  SEED_MESSAGES,
  SEED_NOTIFICATIONS,
  SEED_PAPERS,
  SEED_CONTACT_MESSAGES,
  SEED_ACTIVITY_LOGS,
} from './src/data/seedData';
import { User, Project, Application, ProjectMember, Message, Notification, ActivityLog } from './src/types';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const DATA_DIR = path.resolve(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'collabx_db.json');

// Ensure database storage directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface CollabXDatabase {
  users: User[];
  projects: Project[];
  areas: typeof SEED_AREAS;
  applications: Application[];
  savedProjectIds: string[];
  milestones: typeof SEED_MILESTONES;
  members: ProjectMember[];
  files: typeof SEED_FILES;
  messages: Message[];
  notifications: Notification[];
  papers: typeof SEED_PAPERS;
  contactMessages: typeof SEED_CONTACT_MESSAGES;
  activityLogs: ActivityLog[];
  version: string;
  updatedAt: string;
}

// Password hashing helper (compatible with client SHA-256)
function hashPassword(password: string, salt: string): string {
  return crypto.createHash('sha256').update(password + salt).digest('hex');
}

function verifyPassword(password: string, hash?: string, salt?: string): boolean {
  if (!hash || !salt) return false;
  const computed = hashPassword(password, salt);
  return computed === hash;
}

// Load database from file or initialize with seed data
function loadDatabase(): CollabXDatabase {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf8');
      const parsed = JSON.parse(data) as CollabXDatabase;
      if (parsed && Array.isArray(parsed.users) && parsed.users.length > 0) {
        // Ensure admin user always exists
        const hasAdmin = parsed.users.some((u) => u.role === 'admin');
        if (!hasAdmin) {
          const seedAdmin = SEED_USERS.find((u) => u.role === 'admin');
          if (seedAdmin) parsed.users.push(seedAdmin);
        }
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading CollabX database file:', err);
  }

  // Initial seed
  const initialDb: CollabXDatabase = {
    users: [...SEED_USERS],
    projects: [...SEED_PROJECTS],
    areas: [...SEED_AREAS],
    applications: [...SEED_APPLICATIONS],
    savedProjectIds: [...SEED_SAVED_PROJECT_IDS],
    milestones: [...SEED_MILESTONES],
    members: [...SEED_MEMBERS],
    files: [...SEED_FILES],
    messages: [...SEED_MESSAGES],
    notifications: [...SEED_NOTIFICATIONS],
    papers: [...SEED_PAPERS],
    contactMessages: [...SEED_CONTACT_MESSAGES],
    activityLogs: [...SEED_ACTIVITY_LOGS],
    version: '1.0.0',
    updatedAt: new Date().toISOString(),
  };

  saveDatabase(initialDb);
  return initialDb;
}

function saveDatabase(db: CollabXDatabase): void {
  try {
    db.updatedAt = new Date().toISOString();
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing CollabX database file:', err);
  }
}

// In-memory reference loaded on boot
let db: CollabXDatabase = loadDatabase();

// Sanitize user before returning to client (omit password hash & salt)
function sanitizeUser(user: User): User {
  const { passwordHash, passwordSalt, ...safe } = user;
  return safe as User;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  // ============================================================================
  // REST API: Shared Persistent Database Endpoints
  // ============================================================================

  // System Health & Diagnostics
  app.get('/api/status', (_req, res) => {
    res.json({
      status: 'online',
      service: 'CollabX Unified Database Server',
      version: db.version,
      usersCount: db.users.length,
      projectsCount: db.projects.length,
      applicationsCount: db.applications.length,
      updatedAt: db.updatedAt,
      supabaseConfigured: Boolean(
        process.env.VITE_SUPABASE_URL &&
        !process.env.VITE_SUPABASE_URL.includes('placeholder')
      ),
    });
  });

  // Complete Database Synchronization (Fetched on client mount & live updates)
  app.get('/api/db/sync', (_req, res) => {
    // Re-read file in case of multi-process or external edit
    db = loadDatabase();
    res.json({
      success: true,
      data: {
        users: db.users.map(sanitizeUser),
        projects: db.projects,
        areas: db.areas,
        applications: db.applications,
        savedProjectIds: db.savedProjectIds,
        milestones: db.milestones,
        members: db.members,
        files: db.files,
        messages: db.messages,
        notifications: db.notifications,
        papers: db.papers,
        contactMessages: db.contactMessages,
        activityLogs: db.activityLogs,
      },
      meta: {
        totalUsers: db.users.length,
        updatedAt: db.updatedAt,
      },
    });
  });

  // User Registration (Shared across all devices)
  app.post('/api/auth/register', (req, res) => {
    try {
      const { name, email, password, role, department, universityId, designation, orcid } = req.body;

      const cleanName = (name || '').trim();
      const cleanEmail = (email || '').trim().toLowerCase();
      const cleanRole = (role || 'student').trim();

      if (!cleanName) {
        return res.status(400).json({ success: false, error: 'Full name is required.' });
      }
      if (!cleanEmail || !cleanEmail.includes('@')) {
        return res.status(400).json({ success: false, error: 'Valid academic email is required.' });
      }
      if (!password || password.length < 8) {
        return res.status(400).json({ success: false, error: 'Password must be at least 8 characters long.' });
      }
      if (cleanRole === 'admin') {
        return res.status(403).json({ success: false, error: 'Public registration as Administrator is not permitted.' });
      }
      if (!['student', 'researcher', 'supervisor'].includes(cleanRole)) {
        return res.status(400).json({ success: false, error: 'Invalid registration role.' });
      }

      // Check uniqueness in shared database
      const existingEmail = db.users.find((u) => u.email.toLowerCase() === cleanEmail);
      if (existingEmail) {
        return res.status(409).json({ success: false, error: 'An account with this email address already exists.' });
      }

      if (universityId) {
        const cleanUid = universityId.trim().toLowerCase();
        const existingUid = db.users.find((u) => u.universityId && u.universityId.toLowerCase() === cleanUid);
        if (existingUid) {
          return res.status(409).json({ success: false, error: 'An account with this University ID already exists.' });
        }
      }

      // Generate cryptographically secure salt and SHA-256 hash
      const salt = crypto.randomBytes(16).toString('hex');
      const passwordHash = hashPassword(password, salt);

      const userId = (req.body.id && typeof req.body.id === 'string')
        ? req.body.id
        : 'user-' + Date.now().toString(36) + '-' + crypto.randomBytes(3).toString('hex');

      const newUser: User = {
        id: userId,
        name: cleanName,
        email: cleanEmail,
        role: cleanRole as any,
        department: (department || 'Computer Science & Engineering').trim(),
        institution: 'Port City International University',
        headline:
          (designation || '').trim() ||
          (cleanRole === 'student'
            ? 'Student Scholar'
            : cleanRole === 'supervisor'
            ? 'Faculty Supervisor'
            : 'Academic Researcher'),
        bio: 'Member of the CollabX research and innovation portal.',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(cleanEmail)}`,
        skills: ['Python', 'Research Writing'],
        interests: ['Artificial Intelligence', 'Data Science'],
        links: orcid ? { orcid: orcid.trim() } : {},
        status: 'active',
        createdAt: new Date().toISOString(),
        passwordHash,
        passwordSalt: salt,
        universityId: universityId ? universityId.trim() : undefined,
        designation: designation ? designation.trim() : undefined,
        orcid: orcid ? orcid.trim() : undefined,
      };

      db.users.push(newUser);

      // Record activity log
      db.activityLogs.unshift({
        id: 'act-' + Date.now(),
        userId: newUser.id,
        userName: newUser.name,
        userAvatar: newUser.avatar,
        action: 'user_registered',
        targetType: 'user',
        targetId: newUser.id,
        targetTitle: newUser.name,
        details: `New account registered as ${cleanRole} (${newUser.department})`,
        createdAt: new Date().toISOString(),
      });

      saveDatabase(db);

      console.log(`[Shared DB] New user registered: ${newUser.name} <${newUser.email}> (${newUser.role})`);
      res.status(201).json({ success: true, user: sanitizeUser(newUser) });
    } catch (err: any) {
      console.error('Registration server error:', err);
      res.status(500).json({ success: false, error: err.message || 'Internal registration error.' });
    }
  });

  // User Login (Authenticates against shared persistent database)
  app.post('/api/auth/login', (req, res) => {
    try {
      const { email, password } = req.body;
      const cleanEmail = (email || '').trim().toLowerCase();

      if (!cleanEmail || !password) {
        return res.status(400).json({ success: false, error: 'Email and password are required.' });
      }

      const user = db.users.find((u) => u.email.toLowerCase() === cleanEmail);
      if (!user) {
        return res.status(401).json({ success: false, error: 'Invalid email or password.' });
      }

      if (user.status !== 'active') {
        return res.status(403).json({ success: false, error: 'Your account has been deactivated. Please contact an administrator.' });
      }

      // Password check: supports salted SHA-256 hash or fallback demo seed
      const isValid = verifyPassword(password, user.passwordHash, user.passwordSalt);
      if (!isValid) {
        return res.status(401).json({ success: false, error: 'Invalid email or password.' });
      }

      res.json({ success: true, user: sanitizeUser(user) });
    } catch (err: any) {
      console.error('Login server error:', err);
      res.status(500).json({ success: false, error: 'Internal login error.' });
    }
  });

  // Client Migration (Migrate any previously offline/local storage accounts into shared database)
  app.post('/api/auth/migrate-local', (req, res) => {
    try {
      const { localUsers } = req.body;
      if (!Array.isArray(localUsers)) {
        return res.status(400).json({ success: false, error: 'Expected array of localUsers' });
      }

      let migratedCount = 0;
      for (const lu of localUsers) {
        if (!lu.email) continue;
        const exists = db.users.some((u) => u.email.toLowerCase() === lu.email.toLowerCase() || u.id === lu.id);
        if (!exists) {
          db.users.push(lu);
          migratedCount++;
        }
      }

      if (migratedCount > 0) {
        saveDatabase(db);
        console.log(`[Shared DB] Migrated ${migratedCount} local users into persistent database`);
      }

      res.json({ success: true, migratedCount, totalUsers: db.users.length });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Users Management API
  app.get('/api/users', (_req, res) => {
    res.json({ success: true, users: db.users.map(sanitizeUser) });
  });

  app.post('/api/users', (req, res) => {
    try {
      const userData = req.body;
      const cleanEmail = (userData.email || '').trim().toLowerCase();

      if (!userData.name || !cleanEmail) {
        return res.status(400).json({ success: false, error: 'Name and email are required.' });
      }

      const exists = db.users.some((u) => u.email.toLowerCase() === cleanEmail);
      if (exists) {
        return res.status(409).json({ success: false, error: 'User with this email already exists.' });
      }

      const salt = crypto.randomBytes(16).toString('hex');
      const passwordHash = hashPassword('CollabX2026!', salt);

      const newUser: User = {
        id: userData.id || 'user-' + Date.now().toString(36),
        name: userData.name.trim(),
        email: cleanEmail,
        role: userData.role || 'student',
        department: userData.department || 'Computer Science & Engineering',
        institution: userData.institution || 'Port City International University',
        headline: userData.headline || (userData.role === 'supervisor' ? 'Faculty Supervisor' : 'Student Scholar'),
        bio: userData.bio || '',
        avatar: userData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(cleanEmail)}`,
        skills: userData.skills || ['Python'],
        interests: userData.interests || ['Artificial Intelligence'],
        links: userData.links || {},
        status: userData.status || 'active',
        createdAt: new Date().toISOString(),
        passwordHash,
        passwordSalt: salt,
        universityId: userData.universityId,
        designation: userData.designation,
        orcid: userData.orcid,
      };

      db.users.push(newUser);
      saveDatabase(db);
      res.status(201).json({ success: true, user: sanitizeUser(newUser) });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.put('/api/users/:id', (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const index = db.users.findIndex((u) => u.id === id);

      if (index === -1) {
        return res.status(404).json({ success: false, error: 'User not found.' });
      }

      // Do not allow overwriting password unless explicitly requested
      const existing = db.users[index];
      db.users[index] = {
        ...existing,
        ...updates,
        passwordHash: updates.passwordHash || existing.passwordHash,
        passwordSalt: updates.passwordSalt || existing.passwordSalt,
      };

      saveDatabase(db);
      res.json({ success: true, user: sanitizeUser(db.users[index]) });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.delete('/api/users/:id', (req, res) => {
    try {
      const { id } = req.params;
      const initialLen = db.users.length;
      db.users = db.users.filter((u) => u.id !== id);

      if (db.users.length === initialLen) {
        return res.status(404).json({ success: false, error: 'User not found.' });
      }

      saveDatabase(db);
      res.json({ success: true, message: 'User deleted successfully.' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Projects API
  app.post('/api/projects', (req, res) => {
    try {
      const newProj: Project = req.body;
      if (!newProj.id || !newProj.title) {
        return res.status(400).json({ success: false, error: 'Project ID and title are required.' });
      }

      db.projects.unshift(newProj);
      db.activityLogs.unshift({
        id: 'act-' + Date.now(),
        userId: newProj.supervisor?.id || 'system',
        userName: newProj.supervisor?.name || 'Faculty',
        userAvatar: newProj.supervisor?.avatar,
        action: 'project_created',
        targetType: 'project',
        targetId: newProj.id,
        targetTitle: newProj.title,
        details: `Published research project "${newProj.title}"`,
        createdAt: new Date().toISOString(),
      });

      saveDatabase(db);
      res.status(201).json({ success: true, project: newProj });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.put('/api/projects/:id', (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const index = db.projects.findIndex((p) => p.id === id);

      if (index === -1) {
        return res.status(404).json({ success: false, error: 'Project not found.' });
      }

      db.projects[index] = { ...db.projects[index], ...updates };
      saveDatabase(db);
      res.json({ success: true, project: db.projects[index] });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.delete('/api/projects/:id', (req, res) => {
    try {
      const { id } = req.params;
      db.projects = db.projects.filter((p) => p.id !== id);
      saveDatabase(db);
      res.json({ success: true, message: 'Project removed.' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Applications API (Students apply, Supervisors/Admins review)
  app.post('/api/applications', (req, res) => {
    try {
      const newApp: Application = req.body;
      if (!newApp.id || !newApp.projectId || !newApp.userId) {
        return res.status(400).json({ success: false, error: 'Missing application details.' });
      }

      // Check duplicate application
      const existing = db.applications.find(
        (a) => a.projectId === newApp.projectId && a.userId === newApp.userId && a.status !== 'withdrawn'
      );
      if (existing) {
        return res.status(409).json({ success: false, error: 'You have already submitted an application for this project.' });
      }

      db.applications.unshift(newApp);

      // Notification to project supervisor
      const project = db.projects.find((p) => p.id === newApp.projectId);
      if (project?.supervisor?.id) {
        db.notifications.unshift({
          id: 'notif-' + Date.now(),
          userId: project.supervisor.id,
          type: 'new_project',
          title: 'New Student Application',
          body: `${newApp.userName} applied to join "${project.title}"`,
          link: `/researcher#applications`,
          isRead: false,
          createdAt: new Date().toISOString(),
        });
      }

      saveDatabase(db);
      res.status(201).json({ success: true, application: newApp });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.put('/api/applications/:id', (req, res) => {
    try {
      const { id } = req.params;
      const { status, responseNote } = req.body;
      const index = db.applications.findIndex((a) => a.id === id);

      if (index === -1) {
        return res.status(404).json({ success: false, error: 'Application not found.' });
      }

      const appRecord = db.applications[index];
      appRecord.status = status;
      if (responseNote !== undefined) {
        appRecord.supervisorResponse = responseNote;
      }
      if (status === 'approved' || status === 'rejected') {
        appRecord.decidedAt = new Date().toISOString();
      }

      // If approved, add student to project members
      if (status === 'approved') {
        const isAlreadyMember = db.members.some(
          (m) => m.projectId === appRecord.projectId && m.userId === appRecord.userId
        );
        if (!isAlreadyMember) {
          const studentUser = db.users.find((u) => u.id === appRecord.userId);
          db.members.push({
            id: 'mem-' + Date.now(),
            projectId: appRecord.projectId,
            userId: appRecord.userId,
            name: appRecord.userName,
            email: studentUser?.email || `${appRecord.userId}@collabx.local`,
            role: 'member',
            positionTitle: 'Research Assistant',
            avatar: appRecord.userAvatar,
            status: 'active',
            joinedAt: new Date().toISOString(),
          });

          // Update filled seats count on project
          const pIdx = db.projects.findIndex((p) => p.id === appRecord.projectId);
          if (pIdx !== -1) {
            db.projects[pIdx].filledPositions = Math.min(
              db.projects[pIdx].totalPositions,
              (db.projects[pIdx].filledPositions || 0) + 1
            );
          }
        }

        // Notification to student
        db.notifications.unshift({
          id: 'notif-' + Date.now(),
          userId: appRecord.userId,
          type: 'approved',
          title: 'Application Approved! 🎉',
          body: `Your application for "${appRecord.projectTitle}" has been approved! Welcome to the team.`,
          link: `/projects/${appRecord.projectId}`,
          isRead: false,
          createdAt: new Date().toISOString(),
        });
      } else if (status === 'rejected') {
        db.notifications.unshift({
          id: 'notif-' + Date.now(),
          userId: appRecord.userId,
          type: 'rejected',
          title: 'Application Decision',
          body: `Your application for "${appRecord.projectTitle}" was not selected at this time.`,
          link: `/applications`,
          isRead: false,
          createdAt: new Date().toISOString(),
        });
      }

      saveDatabase(db);
      res.json({ success: true, application: appRecord });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.delete('/api/applications/:id', (req, res) => {
    try {
      const { id } = req.params;
      const initialLen = db.applications.length;
      db.applications = db.applications.filter((a) => a.id !== id);
      if (db.applications.length === initialLen) {
        return res.status(404).json({ success: false, error: 'Application not found.' });
      }
      saveDatabase(db);
      res.json({ success: true, message: 'Application deleted.' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Messages API (Live collaboration and direct messaging)
  app.post('/api/messages', (req, res) => {
    try {
      const newMsg: Message = req.body;
      db.messages.push(newMsg);
      saveDatabase(db);
      res.status(201).json({ success: true, message: newMsg });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Notifications API
  app.post('/api/notifications', (req, res) => {
    try {
      const notif: Notification = req.body;
      db.notifications.unshift(notif);
      saveDatabase(db);
      res.status(201).json({ success: true, notification: notif });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.put('/api/notifications/:id/read', (req, res) => {
    try {
      const { id } = req.params;
      const notif = db.notifications.find((n) => n.id === id);
      if (notif) notif.isRead = true;
      saveDatabase(db);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ============================================================================
  // Vite Integration & Static Frontend Serving
  // ============================================================================

  if (process.env.NODE_ENV === 'production') {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0', port: PORT },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[CollabX] Full-Stack server running at http://0.0.0.0:${PORT}`);
    console.log(`[CollabX] Persistent database initialized with ${db.users.length} users and ${db.projects.length} projects.`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
