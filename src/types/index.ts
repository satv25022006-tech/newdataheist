export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export type UserRole = 'investigator' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  badgeNumber: string;
  role: UserRole;
  createdAt: string;
}

export interface CaseEvidence {
  id: string;
  caseId: string;
  evidenceCode: string; // e.g. "EV-01"
  title: string;
  description: string;
  category: 'physical' | 'digital' | 'forensic' | 'document';
  analysisNotes?: string;
  imageUrl?: string;
}

export interface Suspect {
  id: string;
  caseId: string;
  name: string;
  role: string;
  alibi: string;
  motive: string;
  statement: string;
  suspicionScore: number; // 1-10
  avatarUrl?: string;
}

export interface QuestionOption {
  id: string;
  questionId: string;
  optionLabel: 'A' | 'B' | 'C' | 'D';
  optionText: string;
}

export interface Question {
  id: string;
  caseId: string;
  level: DifficultyLevel;
  orderNumber: number;
  prompt: string;
  hint?: string;
  explanation: string;
  evidenceRef?: string;
  posterUrl?: string; // Poster image URL or base64 uploaded image
  posterTitle?: string; // e.g. "Forensic Evidence Poster"
  forensicEvidenceNotes?: string; // Forensic evidence notes & lab logs
  timeLimitSeconds?: number; // Per-question countdown timer (e.g. 30s, 45s, 60s, 90s)
  points?: number; // Merit points awarded for correct answer (e.g. 10, 25, 50, 100 pts)
  options: QuestionOption[];
  correctOptionLabel?: 'A' | 'B' | 'C' | 'D'; // Kept private on server/admin
}

export interface CaseTarget {
  id: string;
  label: string; // e.g. "TARGET 1: EVIDENCE"
  description: string;
}

export interface CaseItem {
  id: string;
  caseCode: string; // e.g. "mk" or "CASE-2026-BK7"
  title: string;
  acronym?: string; // e.g. "jw"
  summary: string;
  incidentDescription: string;
  briefing: string;
  department?: string;
  classification?: string;
  status: 'draft' | 'published' | 'archived';
  category: string;
  badgeTag: string; // e.g. "CYBER FORENSICS"
  subTag: string; // e.g. "Active Tournament"
  estimatedMinutes: number; // e.g. 15
  rulesTimerSeconds: number; // e.g. 120
  briefingTimerSeconds: number; // e.g. 180
  timeLimitSeconds: number; // 0 for untimed, or e.g. 90
  questionsPerLevel: number; // default 3
  starThresholds: {
    oneStarMin: number; // default 1
    twoStarMin: number; // default 2
    threeStarMin: number; // default 3
  };
  retriesAllowed: boolean;
  bannerGradient: string;
  bannerUrl?: string;
  rulesAndRegulations?: string[];
  targets?: CaseTarget[];
  createdAt: string;
  updatedAt: string;
}

export interface LevelProgress {
  level: DifficultyLevel;
  unlocked: boolean;
  completed: boolean;
  score: number;
  maxScore: number;
  stars: number;
  attemptsCount: number;
  bestScore: number;
  bestStars: number;
  lastAttemptAt?: string;
}

export interface PlayerAnswerRecord {
  questionId: string;
  orderNumber: number;
  selectedOptionLabel: 'A' | 'B' | 'C' | 'D';
  isCorrect: boolean;
  timestamp: string;
}

export interface LevelAttemptRecord {
  attemptId: string;
  caseId: string;
  level: DifficultyLevel;
  score: number;
  maxScore: number;
  starsEarned: number;
  accuracy: number;
  timeElapsedSeconds: number;
  timeSavedSeconds: number;
  merits: number;
  answers: PlayerAnswerRecord[];
  completedAt: string;
}

export interface GameAttempt {
  id: string;
  caseId: string;
  userId: string;
  playerName: string;
  status: 'in_progress' | 'submitted_early' | 'submitted_final';
  levels: {
    easy: LevelProgress;
    medium: LevelProgress;
    hard: LevelProgress;
  };
  levelHistory: LevelAttemptRecord[];
  startedAt: string;
  submittedAt?: string;
  submissionRef?: string;
}

export interface FinalSubmission {
  id: string;
  submissionRef: string; // e.g. "SUB-2026-BK7-7891"
  caseId: string;
  caseCode: string;
  caseTitle: string;
  userId: string;
  playerName: string;
  badgeNumber: string;
  // College Symposium specific registration details:
  registerNumber?: string;
  collegeName?: string;
  teamName?: string;
  submissionType: 'early' | 'final';
  isCompleted: boolean;
  easyScore: number;
  easyStars: number;
  mediumScore?: number;
  mediumStars?: number;
  hardScore?: number;
  hardStars?: number;
  totalScoreEarned: number;
  totalAttemptedPossible: number;
  fullCaseMaxScore: number; // 9
  totalStarsEarned: number; // out of 9
  completionPercentage: number;
  accuracy: number;
  timeElapsedSeconds: number;
  timeSavedSeconds: number;
  merits: number;
  feedbackRating: number; // 1-5
  feedbackComments?: string;
  submittedAt: string;
  reviewedByAdmin?: boolean;
}

export interface AdminAnalytics {
  totalCases: number;
  publishedCases: number;
  registeredPlayers: number;
  totalAttempts: number;
  completedInvestigations: number;
  earlySubmissions: number;
  averageScore: number;
  scoreDistribution: { range: string; count: number }[];
  submissionsByDay: { date: string; count: number }[];
}
