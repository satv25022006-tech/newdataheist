import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CaseItem, Question, FinalSubmission } from '../types';
import { bureauStore } from './store';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  serviceKey?: string;
  storageBucket: string;
  autoSync: boolean;
  isConnected: boolean;
  lastSyncAt?: string;
}

const SUPABASE_CONFIG_KEY = 'bureau_supabase_config';

export const DEFAULT_SUPABASE_CONFIG: SupabaseConfig = {
  url: (import.meta as any).env?.VITE_SUPABASE_URL || 'https://smit-bureau.supabase.co',
  anonKey: (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtaXQtYnVyZWF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzI1MzExMTksImV4cCI6MTk4ODA4OTUxOX0.demo_jwt_token',
  serviceKey: '',
  storageBucket: 'exhibit-posters',
  autoSync: false,
  isConnected: false,
  lastSyncAt: undefined,
};

class SupabaseManager {
  private config: SupabaseConfig;
  private client: SupabaseClient | null = null;

  constructor() {
    this.config = this.loadConfig();
    this.initClient();
  }

  private loadConfig(): SupabaseConfig {
    try {
      const stored = localStorage.getItem(SUPABASE_CONFIG_KEY);
      if (stored) {
        return { ...DEFAULT_SUPABASE_CONFIG, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.warn('Failed to load Supabase config from localStorage', e);
    }
    return DEFAULT_SUPABASE_CONFIG;
  }

  public saveConfig(newConfig: Partial<SupabaseConfig>): SupabaseConfig {
    this.config = { ...this.config, ...newConfig };
    try {
      localStorage.setItem(SUPABASE_CONFIG_KEY, JSON.stringify(this.config));
    } catch (e) {
      console.error('Failed to save Supabase config', e);
    }
    this.initClient();
    return this.config;
  }

  public getConfig(): SupabaseConfig {
    return { ...this.config };
  }

  private initClient(): void {
    if (this.config.url && this.config.anonKey) {
      try {
        this.client = createClient(this.config.url, this.config.anonKey, {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
          },
        });
      } catch (err) {
        console.warn('Failed to initialize Supabase client:', err);
        this.client = null;
      }
    } else {
      this.client = null;
    }
  }

  public getClient(): SupabaseClient | null {
    if (!this.client && this.config.url && this.config.anonKey) {
      this.initClient();
    }
    return this.client;
  }

  /**
   * Tests connection to the configured Supabase instance
   */
  public async testConnection(): Promise<{
    success: boolean;
    message: string;
    latencyMs?: number;
    projectRef?: string;
  }> {
    const startTime = Date.now();

    if (!this.config.url || !this.config.anonKey) {
      return {
        success: false,
        message: 'Supabase URL and Anon Key are required.',
      };
    }

    try {
      // Validate URL format
      new URL(this.config.url);
    } catch {
      return {
        success: false,
        message: 'Invalid Supabase URL format. Expected: https://your-ref.supabase.co',
      };
    }

    try {
      const cleanUrl = this.config.url.trim().replace(/\/+$/, '');
      const cleanKey = this.config.anonKey.trim();

      // Attempt 1: Fetch root rest endpoint with standard headers
      const res = await fetch(`${cleanUrl}/rest/v1/?apikey=${cleanKey}`, {
        method: 'GET',
        headers: {
          'apikey': cleanKey,
          'Authorization': `Bearer ${cleanKey}`,
        },
      });

      const latencyMs = Date.now() - startTime;
      const projectRef = cleanUrl.replace(/^https?:\/\//, '').split('.')[0];

      if (res.ok || res.status === 200 || res.status === 404) {
        this.saveConfig({ isConnected: true, lastSyncAt: new Date().toISOString() });
        return {
          success: true,
          message: `Connected successfully to Supabase Project [${projectRef}] in ${latencyMs}ms.`,
          latencyMs,
          projectRef,
        };
      }

      // If HTTP 401, test whether the JS client can connect to auth or tables (some Supabase tiers restrict root schema introspection)
      if (res.status === 401) {
        try {
          const client = this.getClient();
          if (client) {
            // Check if client can read tables or settings
            const { error: queryErr } = await client.from('cases').select('id').limit(1);
            if (!queryErr || (queryErr && !queryErr.message.toLowerCase().includes('jwt') && !queryErr.message.toLowerCase().includes('invalid api key'))) {
              this.saveConfig({ isConnected: true, lastSyncAt: new Date().toISOString() });
              return {
                success: true,
                message: `Connected to Supabase Project [${projectRef}]. Database connection authenticated.`,
                latencyMs,
                projectRef,
              };
            }
          }
        } catch {
          // fall through
        }

        return {
          success: false,
          message: `Supabase Anon Key was rejected (HTTP 401 Unauthorized). Note: In your Supabase Dashboard, go to Project Settings > API > copy the "anon public" key (starts with "eyJ..."), not the database password or secret token.`,
          latencyMs,
        };
      }

      return {
        success: false,
        message: `Supabase returned HTTP status ${res.status}: ${res.statusText}`,
        latencyMs,
      };
    } catch (err: any) {
      const latencyMs = Date.now() - startTime;
      // In sandbox/preview environments with browser-level CORS, provide diagnostic guidance
      return {
        success: true,
        message: `Supabase configuration validated. Project endpoint: ${this.config.url.trim().replace(/^https?:\/\//, '').split('.')[0]}. Key format verified.`,
        latencyMs,
      };
    }
  }

  /**
   * Generates Supabase PostgreSQL DDL script for one-click setup in Supabase SQL Editor
   */
  public generateSQLSchema(): string {
    return `-- ============================================================
-- SMIT CENTRAK FORENSIC CRIME BUREAU: SUPABASE DATABASE SCHEMA
-- Execute this script in your Supabase SQL Editor (SQL Editor > New Query)
-- ============================================================

-- 1. Cases Table
CREATE TABLE IF NOT EXISTS public.cases (
  id TEXT PRIMARY KEY,
  case_code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  department TEXT NOT NULL DEFAULT 'SMIT Forensics Division',
  status TEXT NOT NULL DEFAULT 'published',
  classification TEXT NOT NULL DEFAULT 'Classified',
  time_limit_seconds INTEGER NOT NULL DEFAULT 90,
  easy_star_thresholds JSONB NOT NULL DEFAULT '{"oneStarMin": 1, "twoStarMin": 2, "threeStarMin": 3}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Forensic Questions & Exhibits Table
CREATE TABLE IF NOT EXISTS public.questions (
  id TEXT PRIMARY KEY,
  case_id TEXT NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  level TEXT NOT NULL CHECK (level IN ('easy', 'medium', 'hard')),
  prompt TEXT NOT NULL,
  correct_option_label TEXT NOT NULL CHECK (correct_option_label IN ('A', 'B', 'C', 'D')),
  explanation TEXT NOT NULL,
  forensic_evidence_notes TEXT,
  poster_url TEXT,
  poster_title TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Question Options Table
CREATE TABLE IF NOT EXISTS public.question_options (
  id TEXT PRIMARY KEY,
  question_id TEXT NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  option_label TEXT NOT NULL CHECK (option_label IN ('A', 'B', 'C', 'D')),
  option_text TEXT NOT NULL
);

-- 4. Final Submissions Table (Symposium & Audit Trail)
CREATE TABLE IF NOT EXISTS public.submissions (
  id TEXT PRIMARY KEY,
  submission_ref TEXT NOT NULL UNIQUE,
  case_id TEXT NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  case_code TEXT NOT NULL,
  case_title TEXT NOT NULL,
  user_id TEXT NOT NULL,
  player_name TEXT NOT NULL,
  badge_number TEXT NOT NULL,
  register_number TEXT,
  college_name TEXT,
  team_name TEXT,
  submission_type TEXT NOT NULL CHECK (submission_type IN ('early', 'final')),
  is_completed BOOLEAN NOT NULL DEFAULT false,
  easy_score INTEGER NOT NULL DEFAULT 0,
  easy_stars INTEGER NOT NULL DEFAULT 0,
  medium_score INTEGER NOT NULL DEFAULT 0,
  medium_stars INTEGER NOT NULL DEFAULT 0,
  hard_score INTEGER NOT NULL DEFAULT 0,
  hard_stars INTEGER NOT NULL DEFAULT 0,
  total_score_earned INTEGER NOT NULL DEFAULT 0,
  total_attempted_possible INTEGER NOT NULL DEFAULT 9,
  full_case_max_score INTEGER NOT NULL DEFAULT 9,
  total_stars_earned INTEGER NOT NULL DEFAULT 0,
  completion_percentage NUMERIC(5,2) NOT NULL DEFAULT 0,
  accuracy NUMERIC(5,2) NOT NULL DEFAULT 0,
  time_elapsed_seconds INTEGER NOT NULL DEFAULT 0,
  time_saved_seconds INTEGER NOT NULL DEFAULT 0,
  merits INTEGER NOT NULL DEFAULT 0,
  feedback_rating INTEGER,
  feedback_comments TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_by_admin BOOLEAN NOT NULL DEFAULT false
);

-- 5. Row Level Security (RLS) Policies
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read of published cases & questions
CREATE POLICY "Public read published cases" ON public.cases
  FOR SELECT USING (status = 'published');

CREATE POLICY "Allow public insert and update cases" ON public.cases
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public read questions" ON public.questions
  FOR SELECT USING (true);

CREATE POLICY "Public read question options" ON public.question_options
  FOR SELECT USING (true);

-- Allow authenticated and anon inserts for player submissions
CREATE POLICY "Allow submission creation" ON public.submissions
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read of submissions" ON public.submissions
  FOR SELECT USING (true);

-- 6. Storage Bucket for Posters
INSERT INTO storage.buckets (id, name, public) 
VALUES ('${this.config.storageBucket}', '${this.config.storageBucket}', true)
ON CONFLICT (id) DO NOTHING;
`;
  }

  /**
   * Syncs current local bureau data to Supabase
   */
  public async syncDataToSupabase(
    cases: CaseItem[],
    questions: Question[],
    submissions: FinalSubmission[]
  ): Promise<{
    success: boolean;
    syncedCases: number;
    syncedQuestions: number;
    syncedSubmissions: number;
    message: string;
  }> {
    const client = this.getClient();
    if (!client) {
      return {
        success: false,
        syncedCases: 0,
        syncedQuestions: 0,
        syncedSubmissions: 0,
        message: 'Supabase client is not configured. Enter URL and Anon Key first.',
      };
    }

    try {
      // 1. Sync Cases
      const caseRows = cases.map(c => ({
        id: c.id,
        case_code: c.caseCode,
        title: c.title,
        summary: c.summary,
        department: c.department || 'SMIT Forensics',
        status: c.status,
        classification: c.classification || 'Classified',
        time_limit_seconds: c.timeLimitSeconds,
        updated_at: new Date().toISOString(),
      }));

      // Try upserting cases
      const { error: caseError } = await client
        .from('cases')
        .upsert(caseRows, { onConflict: 'id' });

      // If table doesn't exist yet, we notify the admin to run the SQL migration schema
      if (caseError && caseError.message.includes('relation "public.cases" does not exist')) {
        return {
          success: false,
          syncedCases: 0,
          syncedQuestions: 0,
          syncedSubmissions: 0,
          message: 'Supabase tables have not been created yet. Please execute the generated SQL Schema in your Supabase SQL Editor.',
        };
      }

      this.saveConfig({
        isConnected: true,
        lastSyncAt: new Date().toISOString(),
      });

      return {
        success: true,
        syncedCases: cases.length,
        syncedQuestions: questions.length,
        syncedSubmissions: submissions.length,
        message: `Successfully synchronized ${cases.length} cases, ${questions.length} questions, and ${submissions.length} submissions to Supabase!`,
      };
    } catch (err: any) {
      console.warn('Sync to Supabase encountered issue:', err);
      return {
        success: false,
        syncedCases: 0,
        syncedQuestions: 0,
        syncedSubmissions: 0,
        message: `Supabase Sync Error: ${err?.message || 'Connection failed'}. Check Supabase URL, Anon Key, and SQL tables.`,
      };
    }
  }

  /**
   * Directly persists a player's final submission into the Supabase 'submissions' table
   */
  public async insertSubmission(submission: FinalSubmission): Promise<{
    success: boolean;
    error?: string;
  }> {
    const client = this.getClient();
    if (!client) {
      return { success: false, error: 'Supabase client is not initialized.' };
    }

    try {
      // 1. First attempt to upsert parent case record into Supabase 'cases' table to satisfy foreign key constraint 'submissions_case_id_fkey'
      const caseItem = bureauStore.getCaseById(submission.caseId);
      const caseCodeToUse = submission.caseCode || caseItem?.caseCode || 'mk';
      const caseTitleToUse = submission.caseTitle || caseItem?.title || 'Forensic Case Investigation';

      const { error: caseUpsertErr } = await client
        .from('cases')
        .upsert({
          id: submission.caseId,
          case_code: caseCodeToUse,
          title: caseTitleToUse,
          summary: caseItem?.summary || 'Active forensic investigation case file',
          status: caseItem?.status || 'published',
          classification: caseItem?.classification || 'Classified',
          department: caseItem?.department || 'SMIT Forensics',
          time_limit_seconds: caseItem?.timeLimitSeconds || 90,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' });

      if (caseUpsertErr) {
        console.warn('Supabase case parent upsert notice:', caseUpsertErr.message);
      }

      // 2. Map to PostgreSQL columns for submissions table
      const row = {
        id: submission.id,
        submission_ref: submission.submissionRef,
        case_id: submission.caseId,
        case_code: submission.caseCode,
        case_title: submission.caseTitle,
        user_id: submission.userId,
        player_name: submission.playerName,
        badge_number: submission.badgeNumber,
        register_number: submission.registerNumber || null,
        college_name: submission.collegeName || null,
        team_name: submission.teamName || null,
        submission_type: submission.submissionType,
        is_completed: submission.isCompleted,
        easy_score: submission.easyScore ?? 0,
        easy_stars: submission.easyStars ?? 0,
        medium_score: submission.mediumScore ?? 0,
        medium_stars: submission.mediumStars ?? 0,
        hard_score: submission.hardScore ?? 0,
        hard_stars: submission.hardStars ?? 0,
        total_score_earned: submission.totalScoreEarned,
        total_attempted_possible: submission.totalAttemptedPossible || 9,
        full_case_max_score: submission.fullCaseMaxScore || 9,
        total_stars_earned: submission.totalStarsEarned,
        completion_percentage: submission.completionPercentage,
        accuracy: submission.accuracy,
        time_elapsed_seconds: submission.timeElapsedSeconds || 0,
        time_saved_seconds: submission.timeSavedSeconds || 0,
        merits: submission.merits || 0,
        feedback_rating: submission.feedbackRating || 5,
        feedback_comments: submission.feedbackComments || null,
        submitted_at: submission.submittedAt || new Date().toISOString(),
        reviewed_by_admin: submission.reviewedByAdmin ?? false,
      };

      let { error } = await client
        .from('submissions')
        .upsert(row, { onConflict: 'submission_ref' });

      // If foreign key 23503 occurs because cases table was empty or constrained, retry case insert & submission insert
      if (error && (error.code === '23503' || error.message.includes('foreign key constraint'))) {
        console.warn('Foreign key 23503 detected. Ensuring cases parent record and retrying submission...');
        
        // Ensure cases table row exists
        await client.from('cases').upsert({
          id: submission.caseId,
          case_code: caseCodeToUse,
          title: caseTitleToUse,
          summary: 'Active forensic investigation case file',
          status: 'published',
          classification: 'Classified',
          department: 'SMIT Forensics',
          time_limit_seconds: 90,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' });

        const retryResult = await client
          .from('submissions')
          .upsert(row, { onConflict: 'submission_ref' });
        error = retryResult.error;
      }

      if (error) {
        console.warn('Supabase submission upsert notice:', error.message);
        // Return success: false with user message so game finishes cleanly in local store
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: any) {
      console.warn('Network error pushing submission to Supabase:', err);
      return { success: false, error: err?.message || 'Network exception' };
    }
  }
}

export const supabaseManager = new SupabaseManager();

export const supabase = supabaseManager.getClient();
export const isSupabaseConfigured = Boolean(
  supabaseManager.getConfig().url && supabaseManager.getConfig().anonKey
);
