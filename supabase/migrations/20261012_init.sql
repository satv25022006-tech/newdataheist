-- ==============================================================================
-- DETECTIVE CASE FILE — INVESTIGATION BUREAU
-- SUPABASE POSTGRESQL DATABASE SCHEMA & ROW LEVEL SECURITY MIGRATION
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Enumerated Types
CREATE TYPE user_role_type AS ENUM ('investigator', 'admin');
CREATE TYPE case_status_type AS ENUM ('draft', 'published', 'archived');
CREATE TYPE difficulty_level_type AS ENUM ('easy', 'medium', 'hard');
CREATE TYPE submission_classification_type AS ENUM ('early', 'final');
CREATE TYPE attempt_status_type AS ENUM ('in_progress', 'submitted_early', 'submitted_final');

-- 3. Profiles & User Roles
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  badge_number TEXT NOT NULL UNIQUE,
  role user_role_type NOT NULL DEFAULT 'investigator',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role user_role_type NOT NULL,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(user_id, role)
);

-- 4. Cases
CREATE TABLE cases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  incident_description TEXT NOT NULL,
  briefing TEXT NOT NULL,
  status case_status_type NOT NULL DEFAULT 'published',
  category TEXT NOT NULL DEFAULT 'General Investigation',
  time_limit_seconds INT NOT NULL DEFAULT 90,
  questions_per_level INT NOT NULL DEFAULT 3,
  star_threshold_1 INT NOT NULL DEFAULT 1,
  star_threshold_2 INT NOT NULL DEFAULT 2,
  star_threshold_3 INT NOT NULL DEFAULT 3,
  retries_allowed BOOLEAN NOT NULL DEFAULT true,
  banner_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. Case Evidence & Suspects
CREATE TABLE case_evidence (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  evidence_code TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'physical',
  analysis_notes TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE suspects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  alibi TEXT NOT NULL,
  motive TEXT NOT NULL,
  statement TEXT NOT NULL,
  suspicion_score INT NOT NULL DEFAULT 5,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. Questions & Multiple-Choice Options
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  level difficulty_level_type NOT NULL,
  order_number INT NOT NULL,
  prompt TEXT NOT NULL,
  hint TEXT,
  explanation TEXT NOT NULL,
  evidence_ref TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(case_id, level, order_number)
);

CREATE TABLE question_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  option_label CHAR(1) NOT NULL CHECK (option_label IN ('A', 'B', 'C', 'D')),
  option_text TEXT NOT NULL,
  UNIQUE(question_id, option_label)
);

-- 7. Private Answer Keys (Isolated from public queries)
CREATE TABLE private_answer_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE UNIQUE,
  correct_option_label CHAR(1) NOT NULL CHECK (correct_option_label IN ('A', 'B', 'C', 'D')),
  internal_notes TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. Game Attempts & Progression State
CREATE TABLE game_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  player_name TEXT NOT NULL,
  status attempt_status_type NOT NULL DEFAULT 'in_progress',
  started_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  submitted_at TIMESTAMPTZ,
  submission_ref TEXT,
  UNIQUE(case_id, user_id)
);

CREATE TABLE level_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  attempt_id UUID NOT NULL REFERENCES game_attempts(id) ON DELETE CASCADE,
  level difficulty_level_type NOT NULL,
  unlocked BOOLEAN NOT NULL DEFAULT false,
  completed BOOLEAN NOT NULL DEFAULT false,
  attempts_count INT NOT NULL DEFAULT 0,
  best_score INT NOT NULL DEFAULT 0,
  best_stars INT NOT NULL DEFAULT 0,
  last_attempt_at TIMESTAMPTZ,
  UNIQUE(attempt_id, level)
);

CREATE TABLE level_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  attempt_id UUID NOT NULL REFERENCES game_attempts(id) ON DELETE CASCADE,
  level difficulty_level_type NOT NULL,
  score INT NOT NULL,
  max_score INT NOT NULL,
  stars_earned INT NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE player_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  level_attempt_id UUID NOT NULL REFERENCES level_attempts(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  selected_option_label CHAR(1) NOT NULL,
  is_correct BOOLEAN NOT NULL,
  answered_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 9. Final Submissions & Feedback
CREATE TABLE final_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_ref TEXT NOT NULL UNIQUE,
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  case_code TEXT NOT NULL,
  case_title TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  player_name TEXT NOT NULL,
  badge_number TEXT NOT NULL,
  submission_type submission_classification_type NOT NULL,
  is_completed BOOLEAN NOT NULL,
  easy_score INT NOT NULL,
  easy_stars INT NOT NULL,
  medium_score INT,
  medium_stars INT,
  hard_score INT,
  hard_stars INT,
  total_score_earned INT NOT NULL,
  total_attempted_possible INT NOT NULL,
  full_case_max_score INT NOT NULL DEFAULT 9,
  total_stars_earned INT NOT NULL,
  completion_percentage INT NOT NULL,
  feedback_rating INT NOT NULL CHECK (feedback_rating BETWEEN 1 AND 5),
  feedback_comments TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  reviewed_by_admin BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE suspects ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE private_answer_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE level_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE level_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE final_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function: Check if current user is admin
CREATE OR REPLACE FUNCTION is_admin(user_uid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles WHERE id = user_uid AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. Profiles: Users can read own; Admins can read all
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id OR is_admin(auth.uid()));

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- 2. Cases: Public can read published; Admins have full access
CREATE POLICY "Public read published cases" ON cases
  FOR SELECT USING (status = 'published' OR is_admin(auth.uid()));

CREATE POLICY "Admins full manage cases" ON cases
  FOR ALL USING (is_admin(auth.uid()));

-- 3. Evidence & Suspects: Read permitted for case investigators
CREATE POLICY "Read evidence" ON case_evidence
  FOR SELECT USING (true);

CREATE POLICY "Admins manage evidence" ON case_evidence
  FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "Read suspects" ON suspects
  FOR SELECT USING (true);

CREATE POLICY "Admins manage suspects" ON suspects
  FOR ALL USING (is_admin(auth.uid()));

-- 4. Questions & Options: Read allowed; Private answer keys strictly locked
CREATE POLICY "Read questions" ON questions
  FOR SELECT USING (true);

CREATE POLICY "Admins manage questions" ON questions
  FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "Read options" ON question_options
  FOR SELECT USING (true);

CREATE POLICY "Admins manage options" ON question_options
  FOR ALL USING (is_admin(auth.uid()));

-- PRIVATE ANSWER KEYS: ONLY ADMINS & EDGE FUNCTIONS CAN READ
CREATE POLICY "Admins read answer keys" ON private_answer_keys
  FOR ALL USING (is_admin(auth.uid()));

-- 5. Game Attempts: Players only access own
CREATE POLICY "Users access own game attempts" ON game_attempts
  FOR ALL USING (auth.uid() = user_id OR is_admin(auth.uid()));

CREATE POLICY "Users access own level progress" ON level_progress
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM game_attempts ga WHERE ga.id = level_progress.attempt_id AND ga.user_id = auth.uid())
    OR is_admin(auth.uid())
  );

CREATE POLICY "Users access own final submissions" ON final_submissions
  FOR SELECT USING (auth.uid() = user_id OR is_admin(auth.uid()));

CREATE POLICY "Users insert own final submissions" ON final_submissions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins manage submissions" ON final_submissions
  FOR ALL USING (is_admin(auth.uid()));

-- Audit Logs
CREATE POLICY "Admins view audit logs" ON audit_logs
  FOR SELECT USING (is_admin(auth.uid()));
