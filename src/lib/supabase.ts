import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  User,
  Project,
  Application,
  ProjectMember,
  Notification,
  Milestone,
  Paper,
  Message,
} from '../types';

// Retrieve environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

// Check if valid credentials are provided
export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith('https://') &&
    !supabaseUrl.includes('placeholder') &&
    !supabaseUrl.includes('your-project') &&
    supabaseAnonKey.length > 20
  );
};

// Create client safely or null if not configured
export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

/**
 * Data Mapping Helpers:
 * Translates between frontend camelCase types and PostgreSQL snake_case columns
 */

export const mapProfileToUser = (row: any): User => ({
  id: row.id,
  name: row.name || 'Anonymous User',
  email: row.email,
  role: row.role || 'student',
  department: row.department || '',
  institution: row.institution || 'CollabX University',
  headline: row.headline || '',
  bio: row.bio || '',
  avatar: row.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${row.name || 'User'}`,
  skills: Array.isArray(row.skills) ? row.skills : [],
  interests: Array.isArray(row.interests) ? row.interests : [],
  links: row.links || {},
  status: row.status || 'active',
  createdAt: row.created_at || new Date().toISOString(),
  universityId: row.university_id,
  designation: row.designation || row.headline,
  orcid: row.orcid || row.links?.orcid,
});

export const mapProjectFromRow = (row: any): Project => ({
  id: row.id,
  title: row.title,
  slug: row.slug || row.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
  summary: row.summary || '',
  description: row.description || '',
  objectives: Array.isArray(row.objectives) ? row.objectives : [],
  expectedOutcome: row.expected_outcome || '',
  methodology: row.methodology || '',
  areaId: row.area_id || 'area-ai',
  areaName: row.area_name || 'Artificial Intelligence',
  subarea: row.subarea || '',
  projectType: row.project_type || 'Funded Research',
  difficulty: row.difficulty || 'Intermediate',
  durationMonths: Number(row.duration_months) || 6,
  totalPositions: Number(row.total_positions) || 3,
  filledPositions: Number(row.filled_positions) || 0,
  deadline: row.deadline || '',
  startDate: row.start_date || '',
  endDate: row.end_date || '',
  status: row.status || 'active',
  rejectReason: row.reject_reason,
  supervisor: {
    id: row.supervisor_id || 'user-fahim',
    name: row.supervisor_name || 'Faculty Supervisor',
    title: row.supervisor_title || 'Lead Researcher',
    avatar: row.supervisor_avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fahim',
    institution: row.supervisor_institution || 'CollabX Lab',
    email: row.supervisor_email,
  },
  requiredSkills: Array.isArray(row.required_skills) ? row.required_skills : [],
  tags: Array.isArray(row.tags) ? row.tags : [],
  thumbnail: row.thumbnail || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
  bannerImage: row.banner_image,
  views: Number(row.views) || 0,
  progressPercent: Number(row.progress_percent) || 0,
  createdAt: row.created_at || new Date().toISOString(),
});

export const mapApplicationFromRow = (row: any): Application => ({
  id: row.id,
  projectId: row.project_id,
  projectTitle: row.project_title || '',
  projectThumbnail: row.project_thumbnail || '',
  userId: row.user_id,
  userName: row.user_name || '',
  userAvatar: row.user_avatar || '',
  userHeadline: row.user_headline || '',
  appliedDate: row.applied_date || row.created_at || new Date().toISOString(),
  status: row.status || 'pending',
  message: row.message || '',
  skillsNote: row.skills_note || '',
  cvFileName: row.cv_file_name,
  supervisorResponse: row.supervisor_response,
  decidedAt: row.decided_at,
});

export const mapMemberFromRow = (row: any): ProjectMember => ({
  id: row.id,
  projectId: row.project_id,
  userId: row.user_id,
  name: row.name || 'Member',
  email: row.email || '',
  avatar: row.avatar || '',
  role: row.role || 'member',
  positionTitle: row.position_title || 'Researcher',
  status: 'active',
  joinedAt: row.joined_at || row.created_at || new Date().toISOString(),
});

export const mapNotificationFromRow = (row: any): Notification => ({
  id: row.id,
  userId: row.user_id,
  type: row.type || 'system',
  title: row.title,
  body: row.body || '',
  link: row.link || '/',
  isRead: Boolean(row.is_read),
  createdAt: row.created_at || new Date().toISOString(),
});

export const mapMilestoneFromRow = (row: any): Milestone => ({
  id: row.id,
  projectId: row.project_id,
  title: row.title,
  percent: Number(row.percent) || 0,
  sortOrder: Number(row.sort_order) || 1,
  dueDate: row.due_date || '',
  completed: Boolean(row.completed),
});

export const mapPaperFromRow = (row: any): Paper => ({
  id: row.id,
  uploaderId: row.uploader_id,
  uploaderName: row.uploader_name || 'Researcher',
  uploaderAvatar: row.uploader_avatar,
  title: row.title,
  abstract: row.abstract || '',
  paperType: row.paper_type || 'Journal',
  areaId: row.area_id || 'area-ai',
  areaName: row.area_name || 'Artificial Intelligence',
  year: Number(row.year) || new Date().getFullYear(),
  doi: row.doi,
  pdfUrl: row.pdf_url || '',
  coverUrl: row.cover_url,
  visibility: row.visibility || 'public',
  status: row.status || 'published',
  aiAssisted: Boolean(row.ai_assisted),
  views: Number(row.views) || 0,
  downloads: Number(row.downloads) || 0,
  likes: Number(row.likes) || 0,
  authors: Array.isArray(row.authors) ? row.authors : [],
  keywords: Array.isArray(row.keywords) ? row.keywords : [],
  citationsAPA: row.citations_apa || '',
  citationsIEEE: row.citations_ieee || '',
  citationsBibTeX: row.citations_bibtex || '',
  createdAt: row.created_at || new Date().toISOString(),
});

export const mapMessageFromRow = (row: any): Message => ({
  id: row.id,
  projectId: row.project_id || '',
  conversationId:
    row.conversation_id ||
    row.project_id ||
    (row.recipient_id && row.sender_id ? ['dm', ...[row.sender_id, row.recipient_id].sort()].join('_') : ''),
  senderId: row.sender_id,
  senderName: row.sender_name || 'User',
  senderAvatar: row.sender_avatar || '',
  recipientId: row.recipient_id || undefined,
  recipientName: row.recipient_name || undefined,
  recipientAvatar: row.recipient_avatar || undefined,
  body: row.body || '',
  attachment: row.attachment,
  createdAt: row.created_at || new Date().toISOString(),
  isRead: Boolean(row.is_read),
});

/**
 * Safely executes an async Supabase database or auth operation.
 * Silently catches and logs network or permission issues without disrupting UI flow.
 * Returns the resolved data or null with the logged error.
 */
export const safeSupabaseCall = async <T = any>(
  operation: (client: SupabaseClient) => PromiseLike<T> | Promise<T>
): Promise<{ data: T | null; error: any }> => {
  if (!supabase) return { data: null, error: new Error('Supabase not configured') };
  try {
    const res = await operation(supabase);
    return { data: res, error: null };
  } catch (err) {
    console.warn('Supabase operation warning:', err);
    return { data: null, error: err };
  }
};
