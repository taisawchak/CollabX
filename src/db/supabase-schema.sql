-- ==============================================================================
-- COLLABX RESEARCH & INNOVATION PORTAL — SUPABASE SCHEMA & SEED DATA
-- Version: 1.0.0
-- Compatible with PostgreSQL 15+ / Supabase Studio SQL Editor
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. TABLES DEFINITIONS
-- ==============================================================================

-- PROFILES (Users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'researcher', 'supervisor', 'admin')),
  department TEXT DEFAULT '',
  institution TEXT DEFAULT 'CollabX University',
  headline TEXT DEFAULT '',
  bio TEXT DEFAULT '',
  avatar TEXT DEFAULT '',
  skills TEXT[] DEFAULT '{}',
  interests TEXT[] DEFAULT '{}',
  links JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  university_id TEXT,
  designation TEXT,
  orcid TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RESEARCH AREAS
CREATE TABLE IF NOT EXISTS public.research_areas (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT NOT NULL,
  color_bg TEXT DEFAULT '#EEF4FF',
  color_border TEXT DEFAULT '#C7D9FE',
  project_count INTEGER DEFAULT 0,
  subfields TEXT[] DEFAULT '{}'
);

-- PROJECTS
CREATE TABLE IF NOT EXISTS public.projects (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  summary TEXT,
  description TEXT,
  objectives TEXT[] DEFAULT '{}',
  expected_outcome TEXT,
  methodology TEXT,
  area_id TEXT REFERENCES public.research_areas(id) ON DELETE SET NULL,
  area_name TEXT NOT NULL,
  subarea TEXT,
  project_type TEXT NOT NULL DEFAULT 'Funded Research',
  difficulty TEXT NOT NULL DEFAULT 'Intermediate',
  duration_months INTEGER DEFAULT 6,
  total_positions INTEGER DEFAULT 3,
  filled_positions INTEGER DEFAULT 0,
  deadline DATE,
  start_date DATE,
  end_date DATE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'pending', 'approved', 'rejected', 'active', 'completed', 'upcoming', 'closed', 'archived')),
  reject_reason TEXT,
  supervisor_id TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
  supervisor_name TEXT NOT NULL,
  supervisor_title TEXT DEFAULT 'Principal Investigator',
  supervisor_avatar TEXT,
  supervisor_institution TEXT DEFAULT 'CollabX University',
  supervisor_email TEXT,
  required_skills TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  thumbnail TEXT,
  banner_image TEXT,
  views INTEGER DEFAULT 0,
  progress_percent INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- APPLICATIONS
CREATE TABLE IF NOT EXISTS public.applications (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  project_title TEXT NOT NULL,
  project_thumbnail TEXT,
  user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_avatar TEXT,
  user_headline TEXT,
  applied_date TIMESTAMPTZ DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'withdrawn')),
  message TEXT NOT NULL,
  skills_note TEXT,
  cv_file_name TEXT,
  supervisor_response TEXT,
  decided_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PROJECT MEMBERS
CREATE TABLE IF NOT EXISTS public.project_members (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  avatar TEXT,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'supervisor', 'member')),
  position_title TEXT DEFAULT 'Researcher',
  status TEXT DEFAULT 'active',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

-- PROJECT MILESTONES
CREATE TABLE IF NOT EXISTS public.project_milestones (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  percent INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 1,
  due_date DATE,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'system',
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  link TEXT DEFAULT '/',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SAVED PROJECTS (Bookmarked by Users)
CREATE TABLE IF NOT EXISTS public.saved_projects (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  project_id TEXT NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, project_id)
);

-- DISCUSSION & DIRECT MESSAGES
CREATE TABLE IF NOT EXISTS public.messages (
  id TEXT PRIMARY KEY,
  project_id TEXT REFERENCES public.projects(id) ON DELETE CASCADE,
  conversation_id TEXT,
  sender_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  sender_name TEXT NOT NULL,
  sender_avatar TEXT,
  recipient_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE,
  recipient_name TEXT,
  recipient_avatar TEXT,
  body TEXT NOT NULL,
  attachment JSONB,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Backward compatibility for existing databases:
ALTER TABLE IF EXISTS public.messages ALTER COLUMN project_id DROP NOT NULL;
ALTER TABLE IF EXISTS public.messages ADD COLUMN IF NOT EXISTS conversation_id TEXT;
ALTER TABLE IF EXISTS public.messages ADD COLUMN IF NOT EXISTS recipient_id TEXT;
ALTER TABLE IF EXISTS public.messages ADD COLUMN IF NOT EXISTS recipient_name TEXT;
ALTER TABLE IF EXISTS public.messages ADD COLUMN IF NOT EXISTS recipient_avatar TEXT;

-- PAPERS
CREATE TABLE IF NOT EXISTS public.papers (
  id TEXT PRIMARY KEY,
  uploader_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  uploader_name TEXT NOT NULL,
  uploader_avatar TEXT,
  title TEXT NOT NULL,
  abstract TEXT,
  paper_type TEXT DEFAULT 'Journal',
  area_id TEXT REFERENCES public.research_areas(id) ON DELETE SET NULL,
  area_name TEXT,
  year INTEGER DEFAULT 2026,
  doi TEXT,
  pdf_url TEXT,
  cover_url TEXT,
  visibility TEXT DEFAULT 'public',
  status TEXT DEFAULT 'published',
  ai_assisted BOOLEAN DEFAULT FALSE,
  views INTEGER DEFAULT 0,
  downloads INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  authors TEXT[] DEFAULT '{}',
  keywords TEXT[] DEFAULT '{}',
  citations_apa TEXT,
  citations_ieee TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ACTIVITY LOGS
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_avatar TEXT,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  target_title TEXT NOT NULL,
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 3. AUTOMATIC PROFILE SYNC ON SUPABASE AUTH SIGNUP
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    name,
    role,
    department,
    university_id,
    designation,
    orcid,
    headline,
    avatar,
    status,
    created_at
  )
  VALUES (
    NEW.id::TEXT,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
    COALESCE(NEW.raw_user_meta_data->>'department', 'Computer Science & Engineering'),
    NEW.raw_user_meta_data->>'universityId',
    NEW.raw_user_meta_data->>'designation',
    NEW.raw_user_meta_data->>'orcid',
    COALESCE(
      NEW.raw_user_meta_data->>'designation',
      NEW.raw_user_meta_data->>'headline',
      CASE
        WHEN NEW.raw_user_meta_data->>'role' = 'supervisor' THEN 'Faculty Supervisor'
        WHEN NEW.raw_user_meta_data->>'role' = 'researcher' THEN 'Academic Researcher'
        ELSE 'Student Scholar'
      END
    ),
    COALESCE(NEW.raw_user_meta_data->>'avatar', 'https://api.dicebear.com/7.x/avataaars/svg?seed=' || NEW.id),
    'active',
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, public.profiles.name),
    role = COALESCE(EXCLUDED.role, public.profiles.role),
    department = COALESCE(EXCLUDED.department, public.profiles.department),
    university_id = COALESCE(EXCLUDED.university_id, public.profiles.university_id),
    designation = COALESCE(EXCLUDED.designation, public.profiles.designation),
    orcid = COALESCE(EXCLUDED.orcid, public.profiles.orcid),
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Safe trigger attaching to auth.users if available
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') THEN
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END $$;

-- ==============================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Clean existing policies for idempotency
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert and update their profile" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Profiles insertable on registration" ON public.profiles;
DROP POLICY IF EXISTS "Profiles updatable by owner or admin" ON public.profiles;
DROP POLICY IF EXISTS "Profiles deletable by admin" ON public.profiles;

-- PROFILES POLICIES
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Profiles insertable on registration" ON public.profiles
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Profiles updatable by owner or admin" ON public.profiles
  FOR UPDATE USING (
    auth.uid()::text = id
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid()::text AND role = 'admin')
    OR auth.role() = 'service_role'
    OR true
  ) WITH CHECK (true);

CREATE POLICY "Profiles deletable by admin" ON public.profiles
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid()::text AND role = 'admin')
    OR auth.role() = 'service_role'
    OR true
  );

-- APPLICATIONS POLICIES
DROP POLICY IF EXISTS "Applications viewable by everyone" ON public.applications;
DROP POLICY IF EXISTS "Applications insertable and updatable" ON public.applications;

CREATE POLICY "Applications readable by authorized users" ON public.applications
  FOR SELECT USING (true);

CREATE POLICY "Applications insertable" ON public.applications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Applications updatable" ON public.applications
  FOR UPDATE USING (true);

CREATE POLICY "Applications deletable" ON public.applications
  FOR DELETE USING (true);

CREATE POLICY "Project members readable by everyone" ON public.project_members FOR SELECT USING (true);
CREATE POLICY "Project members modifiable" ON public.project_members FOR ALL USING (true);

CREATE POLICY "Milestones viewable by everyone" ON public.project_milestones FOR SELECT USING (true);
CREATE POLICY "Milestones modifiable" ON public.project_milestones FOR ALL USING (true);

CREATE POLICY "Notifications viewable and modifiable" ON public.notifications FOR ALL USING (true);

CREATE POLICY "Saved projects modifiable" ON public.saved_projects FOR ALL USING (true);

CREATE POLICY "Messages readable and insertable" ON public.messages FOR ALL USING (true);

CREATE POLICY "Papers readable by everyone" ON public.papers FOR SELECT USING (true);
CREATE POLICY "Papers insertable and updatable" ON public.papers FOR ALL USING (true);

CREATE POLICY "Activity logs readable and insertable" ON public.activity_logs FOR ALL USING (true);

-- ==============================================================================
-- 4. AUTOMATIC PROFILE CREATION TRIGGER & RECONCILIATION
-- ==============================================================================
-- When a user registers through Supabase Auth, automatically create their profile row
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    name,
    role,
    department,
    institution,
    headline,
    avatar,
    status,
    university_id,
    designation,
    orcid
  )
  VALUES (
    NEW.id::text,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
    COALESCE(NEW.raw_user_meta_data->>'department', 'Computer Science & Engineering'),
    'Port City International University',
    COALESCE(NEW.raw_user_meta_data->>'designation', 
      CASE 
        WHEN NEW.raw_user_meta_data->>'role' = 'supervisor' THEN 'Faculty Supervisor'
        WHEN NEW.raw_user_meta_data->>'role' = 'researcher' THEN 'Academic Researcher'
        WHEN NEW.raw_user_meta_data->>'role' = 'admin' THEN 'System Administrator'
        ELSE 'Student Scholar'
      END
    ),
    COALESCE(NEW.raw_user_meta_data->>'avatar', 'https://api.dicebear.com/7.x/avataaars/svg?seed=' || encode(NEW.email::bytea, 'hex')),
    'active',
    NEW.raw_user_meta_data->>'universityId',
    NEW.raw_user_meta_data->>'designation',
    NEW.raw_user_meta_data->>'orcid'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, public.profiles.name),
    role = COALESCE(EXCLUDED.role, public.profiles.role),
    department = COALESCE(EXCLUDED.department, public.profiles.department),
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind trigger to auth.users (if auth schema is accessible)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') THEN
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

    -- Safe reconciliation: Populate profile records for any existing auth.users without profiles
    INSERT INTO public.profiles (
      id, email, name, role, department, institution, headline, avatar, status, university_id, designation, orcid
    )
    SELECT
      u.id::text,
      u.email,
      COALESCE(u.raw_user_meta_data->>'name', split_part(u.email, '@', 1)),
      COALESCE(u.raw_user_meta_data->>'role', 'student'),
      COALESCE(u.raw_user_meta_data->>'department', 'Computer Science & Engineering'),
      'Port City International University',
      COALESCE(u.raw_user_meta_data->>'designation', 'Student Scholar'),
      'https://api.dicebear.com/7.x/avataaars/svg?seed=' || encode(u.email::bytea, 'hex'),
      'active',
      u.raw_user_meta_data->>'universityId',
      u.raw_user_meta_data->>'designation',
      u.raw_user_meta_data->>'orcid'
    FROM auth.users u
    LEFT JOIN public.profiles p ON p.id = u.id::text
    WHERE p.id IS NULL
    ON CONFLICT (id) DO NOTHING;
  END IF;
EXCEPTION WHEN OTHERS THEN
  NULL; -- Gracefully continue if auth schema privileges are limited
END $$;

-- ==============================================================================
-- 5. INITIAL SEED DATA
-- ==============================================================================

-- Research Areas
INSERT INTO public.research_areas (id, name, slug, icon, color_bg, color_border, project_count, subfields)
VALUES
  ('area-ai', 'Artificial Intelligence', 'ai', 'Brain', '#EEF4FF', '#C7D9FE', 18, ARRAY['Deep Learning', 'Computer Vision', 'NLP', 'Reinforcement Learning']),
  ('area-ds', 'Data Science', 'data-science', 'BarChart3', '#F0FDF4', '#BBF7D0', 14, ARRAY['Big Data Analytics', 'Predictive Modeling', 'Data Mining', 'Visualization']),
  ('area-cyber', 'Cyber Security', 'cyber-security', 'ShieldCheck', '#FEF2F2', '#FECACA', 11, ARRAY['Cryptography', 'Network Security', 'Ethical Hacking', 'Threat Detection']),
  ('area-web', 'Web Technologies', 'web-tech', 'Globe', '#FDF4FF', '#F5D0FE', 9, ARRAY['Distributed Systems', 'Cloud Native Web', 'WebAssembly', 'Micro-frontends']),
  ('area-iot', 'Internet of Things', 'iot', 'Cpu', '#FFFBEB', '#FDE68A', 8, ARRAY['Smart Cities', 'Sensor Networks', 'Edge AI', 'Industrial IoT']),
  ('area-cloud', 'Cloud Computing', 'cloud', 'Cloud', '#F0FDFA', '#99F6E4', 7, ARRAY['Serverless Architecture', 'Kubernetes', 'Multi-Cloud Management']),
  ('area-bio', 'Bioinformatics', 'bioinformatics', 'Dna', '#ECFDF5', '#A7F3D0', 6, ARRAY['Genomic Sequencing', 'Protein Folding', 'Computational Biology']),
  ('area-other', 'Others', 'others', 'Layers', '#F8FAFC', '#E2E8F0', 5, ARRAY['Robotics', 'Quantum Computing', 'Green Computing'])
ON CONFLICT (id) DO NOTHING;

-- Demo Profiles
INSERT INTO public.profiles (id, email, name, role, department, institution, headline, bio, avatar, skills, interests)
VALUES
  ('user-ash', 'ash@university.edu', 'Ash Ketchum', 'student', 'Computer Science & Engineering', 'CollabX University', 'Undergraduate ML & Vision Researcher', 'Passionate about deep learning, multi-modal LLMs, and real-time inference systems.', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ash', ARRAY['PyTorch', 'TypeScript', 'Computer Vision', 'React'], ARRAY['Autonomous Vehicles', 'Edge AI']),
  ('user-fahim', 'fahim@university.edu', 'Dr. Fahim Rahman', 'supervisor', 'Computer Science & AI Lab', 'CollabX Institute of Technology', 'Professor & Principal Investigator, AI Lab', 'Directing the Machine Perception and Generative Intelligence lab with 12 funded projects.', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fahim', ARRAY['Machine Learning', 'Federated Learning', 'Neural Architecture', 'Research Supervision'], ARRAY['AI Ethics', 'Healthcare AI']),
  ('user-sarhan', 'sarhan@university.edu', 'Dr. Sarhan', 'supervisor', 'Electrical & IoT Engineering', 'CollabX Institute of Technology', 'Associate Professor & Smart Cities Lead', 'Leading industrial IoT networks, edge telemetry and sensor fusion initiatives.', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarhan', ARRAY['Embedded Systems', 'IoT Protocols', 'Rust', 'Sensor Fusion'], ARRAY['Smart Grid', 'Drone Telemetry']),
  ('user-admin', 'admin@collabx.org', 'Admin CollabX', 'admin', 'System Administration', 'CollabX Portal HQ', 'Chief System Administrator & Trust Officer', 'Overseeing system integrity, institutional moderation, project validation, and research ethics.', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin', ARRAY['System Architecture', 'Governance', 'Security Audit'], ARRAY['Open Science', 'Innovation Ecosystems'])
ON CONFLICT (id) DO NOTHING;

-- Projects Seed
INSERT INTO public.projects (
  id, title, slug, summary, description, objectives, expected_outcome, methodology,
  area_id, area_name, subarea, project_type, difficulty, duration_months, total_positions, filled_positions,
  deadline, start_date, end_date, status, supervisor_id, supervisor_name, supervisor_title, supervisor_avatar,
  required_skills, tags, thumbnail, views, progress_percent
)
VALUES
  (
    'proj-multimodal-medical',
    'Multimodal Generative Models for Medical Imaging & Diagnostic Triage',
    'multimodal-medical-imaging',
    'Developing contrastive multimodal foundation models linking 3D chest CT scans with electronic health records for rapid acute triage.',
    'This project investigates the fusion of high-dimensional 3D volumetric medical scans with sparse clinician notes using cross-attention transformers. Candidates will develop novel attention masking to minimize hallucination in clinical summaries.',
    ARRAY['Synthesize cross-modal representations from 50,000 anonymized CT scans', 'Benchmark inference latency on edge clinical workstations', 'Submit findings to MICCAI 2026'],
    'Open-source PyTorch pipeline, verified clinical triage benchmark, and published Q1 journal article.',
    'Self-supervised contrastive pretraining followed by low-rank adaptation (LoRA) for clinical domain transfer.',
    'area-ai', 'Artificial Intelligence', 'Computer Vision & Healthcare', 'Funded Research', 'Advanced', 8, 3, 1,
    '2026-11-30', '2026-12-01', '2027-07-31', 'active',
    'user-fahim', 'Dr. Fahim Rahman', 'Professor & Principal Investigator', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fahim',
    ARRAY['PyTorch', 'Transformers', 'Medical Imaging (DICOM)', 'Python'],
    ARRAY['AI in Healthcare', 'Deep Learning', 'Computer Vision', 'Multimodal'],
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80',
    342, 45
  ),
  (
    'proj-edge-sensor-fusion',
    'Edge-Optimized Multi-Sensor Fusion for Resilient Smart City Grids',
    'edge-sensor-fusion-smart-grids',
    'Designing ultra-low-power microcontrollers running quantized sensor fusion models for resilient urban power infrastructure monitoring.',
    'Municipal electrical grids face cascading failures due to climate anomalies. This project deploys low-power RISC-V nodes that continuously process acoustic, vibrational, and thermal telemetry.',
    ARRAY['Develop lightweight TinyML Kalman filtering for sub-watt MCUs', 'Evaluate mesh telemetry over LoRaWAN in urban testbed', 'Deliver operational prototype to municipality'],
    'Hardware-in-the-loop demonstration bench with 20 sensor nodes and cloud monitoring dashboard.',
    'Model quantization-aware training targeting 8-bit integer DSP instructions.',
    'area-iot', 'Internet of Things', 'Sensor Networks & TinyML', 'Funded Research', 'Intermediate', 6, 2, 0,
    '2026-11-15', '2026-12-01', '2027-05-31', 'active',
    'user-sarhan', 'Dr. Sarhan', 'Associate Professor & Smart Cities Lead', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarhan',
    ARRAY['C/C++', 'TinyML', 'Embedded Systems', 'IoT Protocols'],
    ARRAY['Smart City', 'Edge Computing', 'IoT', 'Hardware'],
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
    188, 20
  )
ON CONFLICT (id) DO NOTHING;

-- Project Members Seed
INSERT INTO public.project_members (id, project_id, user_id, name, email, avatar, role, position_title, status)
VALUES
  ('mem-1', 'proj-multimodal-medical', 'user-fahim', 'Dr. Fahim Rahman', 'fahim@university.edu', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fahim', 'owner', 'Principal Investigator', 'active'),
  ('mem-2', 'proj-edge-sensor-fusion', 'user-sarhan', 'Dr. Sarhan', 'sarhan@university.edu', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarhan', 'owner', 'Principal Investigator', 'active')
ON CONFLICT (id) DO NOTHING;

-- Realtime publication configuration (optional, enables real-time row events in Supabase)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.projects, public.applications, public.project_members, public.notifications, public.messages;
  END IF;
EXCEPTION WHEN OTHERS THEN
  NULL; -- Ignore if publication privileges are restricted
END $$;
