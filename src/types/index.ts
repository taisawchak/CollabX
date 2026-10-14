export type Role = 'student' | 'researcher' | 'supervisor' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  department: string;
  institution: string;
  headline: string;
  bio: string;
  avatar: string;
  skills: string[];
  interests: string[];
  links: {
    googleScholar?: string;
    orcid?: string;
    github?: string;
    linkedin?: string;
    researchgate?: string;
  };
  status: 'active' | 'inactive';
  createdAt: string;
  passwordHash?: string;
  passwordSalt?: string;
  universityId?: string;
  designation?: string;
  orcid?: string;
}

export interface ResearchArea {
  id: string;
  name: string;
  slug: string;
  icon: string;
  colorBg: string;
  colorBorder: string;
  projectCount: number;
  subfields: string[];
}

export type ProjectDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';
export type ProjectStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'active' | 'completed' | 'upcoming' | 'closed' | 'archived';
export type ProjectType = 'Thesis' | 'Funded Research' | 'Course Project' | 'Open Source' | 'Competition' | 'Industry';

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  action:
    | 'project_created'
    | 'project_draft_saved'
    | 'project_submitted'
    | 'project_approved'
    | 'project_rejected'
    | 'project_archived'
    | 'project_deleted'
    | 'project_closed'
    | 'project_completed'
    | 'application_submitted'
    | 'application_approved'
    | 'application_rejected'
    | 'application_withdrawn'
    | 'member_invited'
    | 'member_removed'
    | 'user_registered';
  targetType: 'project' | 'application' | 'team' | 'user' | 'system';
  targetId: string;
  targetTitle: string;
  details?: string;
  createdAt: string;
}

export interface SupervisorInfo {
  id: string;
  name: string;
  title: string;
  avatar: string;
  institution: string;
  email?: string;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  summary: string;
  description: string;
  objectives: string[];
  expectedOutcome: string;
  methodology: string;
  areaId: string;
  areaName: string;
  subarea: string;
  projectType: ProjectType;
  difficulty: ProjectDifficulty;
  durationMonths: number;
  totalPositions: number;
  filledPositions: number;
  deadline: string;
  startDate: string;
  endDate: string;
  status: ProjectStatus;
  rejectReason?: string;
  supervisor: SupervisorInfo;
  requiredSkills: string[];
  tags: string[];
  thumbnail: string;
  bannerImage?: string;
  views: number;
  progressPercent: number;
  createdAt: string;
}

export type ApplicationStatus = 'pending' | 'approved' | 'rejected' | 'withdrawn';

export interface Application {
  id: string;
  projectId: string;
  projectTitle: string;
  projectThumbnail: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userHeadline: string;
  appliedDate: string;
  status: ApplicationStatus;
  message: string;
  skillsNote: string;
  cvFileName?: string;
  supervisorResponse?: string;
  decidedAt?: string;
}

export interface Milestone {
  id: string;
  projectId: string;
  title: string;
  percent: number; // 0 to 100
  sortOrder: number;
  dueDate: string;
  completed: boolean;
}

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  name: string;
  email: string;
  avatar: string;
  role: 'supervisor' | 'member' | 'owner';
  positionTitle: string;
  status: 'active';
  joinedAt: string;
}

export interface ProjectFile {
  id: string;
  projectId: string;
  fileName: string;
  fileSize: string;
  fileType: string;
  uploadedBy: string;
  uploadedAt: string;
  downloadUrl: string;
}

export interface Message {
  id: string;
  projectId?: string;
  conversationId?: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  recipientId?: string;
  recipientName?: string;
  recipientAvatar?: string;
  body: string;
  attachment?: {
    name: string;
    size: string;
    url: string;
    type: string;
  };
  createdAt: string;
  isRead: boolean;
}

export type NotificationType =
  | 'approved'
  | 'rejected'
  | 'message'
  | 'deadline'
  | 'new_project'
  | 'member_added'
  | 'paper'
  | 'system';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  link: string;
  isRead: boolean;
  createdAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  type: 'meeting' | 'submission' | 'report' | 'presentation' | 'deadline';
  projectId?: string;
  projectName?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm AM/PM
  reminder?: string;
  description?: string;
}

export interface Paper {
  id: string;
  uploaderId: string;
  uploaderName: string;
  uploaderAvatar?: string;
  title: string;
  abstract: string;
  paperType: 'Journal' | 'Conference' | 'Thesis' | 'Preprint' | 'Report';
  areaId: string;
  areaName: string;
  year: number;
  doi?: string;
  pdfUrl: string;
  coverUrl?: string;
  visibility: 'public' | 'members' | 'private';
  status: 'published' | 'pending' | 'draft';
  aiAssisted: boolean;
  views: number;
  downloads: number;
  likes: number;
  authors: string[];
  keywords: string[];
  citationsAPA: string;
  citationsIEEE: string;
  citationsBibTeX: string;
  createdAt: string;
}

export interface ScholarlyExternalPaper {
  id: string;
  title: string;
  authors: string[];
  year: number;
  doi?: string;
  url: string;
  oaPdfUrl?: string;
  source: 'OpenAlex' | 'arXiv' | 'Crossref' | 'Semantic Scholar';
  citationsCount: number;
  abstractSnippet: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  category: string;
  message: string;
  status: 'new' | 'read' | 'replied';
  replyText?: string;
  createdAt: string;
}

export interface AiDraft {
  id: string;
  userId: string;
  title: string;
  topic: string;
  area: string;
  paperType: string;
  tone: string;
  citationStyle: 'APA' | 'IEEE';
  targetWordCount: number;
  outline: {
    id: string;
    title: string;
    points: string[];
  }[];
  content: Record<string, string>; // section title -> text
  references: {
    title: string;
    authors: string;
    year: string;
    doi?: string;
    source: string;
    verified: boolean;
  }[];
  updatedAt: string;
}
