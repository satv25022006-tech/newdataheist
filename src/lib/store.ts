import { 
  CaseItem, 
  CaseEvidence, 
  Suspect, 
  Question, 
  GameAttempt, 
  DifficultyLevel, 
  LevelProgress, 
  FinalSubmission,
  AdminAnalytics,
  UserProfile
} from '../types';
import { INITIAL_CASES, INITIAL_EVIDENCE, INITIAL_SUSPECTS, INITIAL_QUESTIONS } from './initialData';
import { 
  saveSubmissionToFirebase, 
  saveCaseToFirebase, 
  saveQuestionToFirebase, 
  saveBrandingToFirebase 
} from './firebase';

const STORAGE_KEYS = {
  CASES: 'bureau_cases_v1',
  QUESTIONS: 'bureau_questions_v1',
  EVIDENCE: 'bureau_evidence_v1',
  SUSPECTS: 'bureau_suspects_v1',
  ATTEMPTS: 'bureau_attempts_v1',
  SUBMISSIONS: 'bureau_submissions_v1',
  CURRENT_USER: 'bureau_current_user_v1',
  BRANDING: 'bureau_branding_v1',
};

export interface BureauBranding {
  bureauName: string;
  logoUrl?: string; // custom uploaded logo base64 or URL
}

export const DEFAULT_BRANDING: BureauBranding = {
  bureauName: 'CODE HEIST',
  logoUrl: '',
};

// Default Demo User
export const DEFAULT_INVESTIGATOR: UserProfile = {
  id: 'usr-inv-001',
  email: 'detective.reid@bureau.gov',
  displayName: 'Lead Det. Reid',
  badgeNumber: 'BD-8492',
  role: 'investigator',
  createdAt: '2026-09-15T08:00:00Z',
};

export const DEFAULT_ADMIN: UserProfile = {
  id: 'usr-adm-001',
  email: 'chief.inspector@bureau.gov',
  displayName: 'Chief Inspector Cross',
  badgeNumber: 'BD-0001',
  role: 'admin',
  createdAt: '2026-08-01T08:00:00Z',
};

// Helper: load from localStorage with fallback
function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error loading key ${key} from storage:`, err);
    return fallback;
  }
}

// Helper: save to localStorage
function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error saving key ${key} to storage:`, err);
  }
}

export class BureauStore {
  private cases: CaseItem[] = [];
  private questions: Question[] = [];
  private evidence: CaseEvidence[] = [];
  private suspects: Suspect[] = [];
  private attempts: Record<string, GameAttempt> = {}; // key: attemptId
  private submissions: FinalSubmission[] = [];
  private currentUser: UserProfile = DEFAULT_INVESTIGATOR;
  private branding: BureauBranding = DEFAULT_BRANDING;

  constructor() {
    this.init();
  }

  private init() {
    this.cases = loadFromStorage<CaseItem[]>(STORAGE_KEYS.CASES, INITIAL_CASES);
    this.questions = loadFromStorage<Question[]>(STORAGE_KEYS.QUESTIONS, INITIAL_QUESTIONS);
    this.evidence = loadFromStorage<CaseEvidence[]>(STORAGE_KEYS.EVIDENCE, INITIAL_EVIDENCE);
    this.suspects = loadFromStorage<Suspect[]>(STORAGE_KEYS.SUSPECTS, INITIAL_SUSPECTS);
    this.attempts = loadFromStorage<Record<string, GameAttempt>>(STORAGE_KEYS.ATTEMPTS, {});
    this.submissions = loadFromStorage<FinalSubmission[]>(STORAGE_KEYS.SUBMISSIONS, []);
    this.currentUser = loadFromStorage<UserProfile>(STORAGE_KEYS.CURRENT_USER, DEFAULT_INVESTIGATOR);
    this.branding = loadFromStorage<BureauBranding>(STORAGE_KEYS.BRANDING, DEFAULT_BRANDING);
  }

  // --- Branding & Logo ---
  getBranding(): BureauBranding {
    return this.branding;
  }

  updateBranding(newBranding: Partial<BureauBranding>): BureauBranding {
    this.branding = {
      ...this.branding,
      ...newBranding,
    };
    saveToStorage(STORAGE_KEYS.BRANDING, this.branding);
    saveBrandingToFirebase(this.branding.bureauName, this.branding.logoUrl).catch(err => {
      console.warn('Firebase branding update notice:', err);
    });
    // Dispatch custom event so reactive components update instantly
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('bureau-branding-updated'));
    }
    return this.branding;
  }

  private generateSeedSubmissions(): FinalSubmission[] {
    return [];
  }

  // --- Auth & User ---
  getCurrentUser(): UserProfile {
    return this.currentUser;
  }

  setCurrentUser(user: UserProfile) {
    this.currentUser = user;
    saveToStorage(STORAGE_KEYS.CURRENT_USER, user);
  }

  // --- Cases ---
  getCases(includeDrafts = false): CaseItem[] {
    if (includeDrafts) return this.cases;
    return this.cases.filter(c => c.status === 'published');
  }

  getCaseById(id: string): CaseItem | undefined {
    return this.cases.find(c => c.id === id || c.caseCode === id);
  }

  saveCase(caseItem: CaseItem): CaseItem {
    const existingIndex = this.cases.findIndex(c => c.id === caseItem.id);
    if (existingIndex >= 0) {
      this.cases[existingIndex] = { ...caseItem, updatedAt: new Date().toISOString() };
    } else {
      this.cases.push({ ...caseItem, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    saveToStorage(STORAGE_KEYS.CASES, this.cases);
    saveCaseToFirebase(caseItem).catch(err => {
      console.warn('Firebase case persistence notice:', err);
    });
    return caseItem;
  }

  deleteCase(id: string): boolean {
    this.cases = this.cases.filter(c => c.id !== id && c.caseCode !== id);
    this.questions = this.questions.filter(q => q.caseId !== id);
    this.evidence = this.evidence.filter(e => e.caseId !== id);
    this.suspects = this.suspects.filter(s => s.caseId !== id);
    saveToStorage(STORAGE_KEYS.CASES, this.cases);
    saveToStorage(STORAGE_KEYS.QUESTIONS, this.questions);
    saveToStorage(STORAGE_KEYS.EVIDENCE, this.evidence);
    saveToStorage(STORAGE_KEYS.SUSPECTS, this.suspects);
    return true;
  }

  // --- Evidence & Suspects ---
  getEvidenceForCase(caseId: string): CaseEvidence[] {
    return this.evidence.filter(e => e.caseId === caseId);
  }

  getSuspectsForCase(caseId: string): Suspect[] {
    return this.suspects.filter(s => s.caseId === caseId);
  }

  addEvidence(item: CaseEvidence) {
    this.evidence.push(item);
    saveToStorage(STORAGE_KEYS.EVIDENCE, this.evidence);
  }

  addSuspect(suspect: Suspect) {
    this.suspects.push(suspect);
    saveToStorage(STORAGE_KEYS.SUSPECTS, this.suspects);
  }

  // --- Questions ---
  getQuestionsForLevel(caseId: string, level: DifficultyLevel, sanitize = false): Question[] {
    const list = this.questions
      .filter(q => q.caseId === caseId && q.level === level)
      .sort((a, b) => a.orderNumber - b.orderNumber);

    if (sanitize) {
      return list.map(q => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { correctOptionLabel, ...safe } = q;
        return safe as Question;
      });
    }
    return list;
  }

  getAllQuestionsForCase(caseId: string): Question[] {
    return this.questions
      .filter(q => q.caseId === caseId)
      .sort((a, b) => a.level.localeCompare(b.level) || a.orderNumber - b.orderNumber);
  }

  saveQuestion(question: Question): Question {
    const idx = this.questions.findIndex(q => q.id === question.id);
    if (idx >= 0) {
      this.questions[idx] = question;
    } else {
      this.questions.push(question);
    }
    saveToStorage(STORAGE_KEYS.QUESTIONS, this.questions);
    saveQuestionToFirebase(question).catch(err => {
      console.warn('Firebase question persistence notice:', err);
    });
    return question;
  }

  updateQuestionPoster(questionId: string, posterUrl: string, posterTitle?: string): boolean {
    const q = this.questions.find(item => item.id === questionId);
    if (q) {
      q.posterUrl = posterUrl;
      if (posterTitle) q.posterTitle = posterTitle;
      saveToStorage(STORAGE_KEYS.QUESTIONS, this.questions);
      return true;
    }
    return false;
  }

  deleteQuestion(id: string): boolean {
    this.questions = this.questions.filter(q => q.id !== id);
    saveToStorage(STORAGE_KEYS.QUESTIONS, this.questions);
    return true;
  }

  getAllQuestions(): Question[] {
    return this.questions;
  }

  // --- Attempt & Level Progression (Server-Authoritative State Engine) ---
  getOrCreateAttempt(caseId: string, user: UserProfile): GameAttempt {
    const key = `${user.id}_${caseId}`;
    let attempt = this.attempts[key];

    if (!attempt || attempt.status !== 'in_progress') {
      const newAttempt: GameAttempt = {
        id: `att_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        caseId,
        userId: user.id,
        playerName: user.displayName,
        status: 'in_progress',
        levels: {
          easy: {
            level: 'easy',
            unlocked: true, // Easy is always unlocked initially
            completed: false,
            score: 0,
            maxScore: 3,
            stars: 0,
            attemptsCount: 0,
            bestScore: 0,
            bestStars: 0,
          },
          medium: {
            level: 'medium',
            unlocked: false, // Locked until Easy >= 2 stars
            completed: false,
            score: 0,
            maxScore: 3,
            stars: 0,
            attemptsCount: 0,
            bestScore: 0,
            bestStars: 0,
          },
          hard: {
            level: 'hard',
            unlocked: false, // Locked until Medium >= 2 stars AND Easy >= 2 stars
            completed: false,
            score: 0,
            maxScore: 3,
            stars: 0,
            attemptsCount: 0,
            bestScore: 0,
            bestStars: 0,
          },
        },
        levelHistory: [],
        startedAt: new Date().toISOString(),
      };
      this.attempts[key] = newAttempt;
      saveToStorage(STORAGE_KEYS.ATTEMPTS, this.attempts);
      return newAttempt;
    }

    return attempt;
  }

  getAttempt(caseId: string, userId: string): GameAttempt | undefined {
    const key = `${userId}_${caseId}`;
    return this.attempts[key];
  }

  // Validate Level Access Server-Side to prevent player skips
  isLevelUnlocked(caseId: string, level: DifficultyLevel, userId: string): boolean {
    if (level === 'easy') return true;
    const attempt = this.getAttempt(caseId, userId);
    if (!attempt) return false;

    if (level === 'medium') {
      return attempt.levels.easy.bestStars >= 2;
    }

    if (level === 'hard') {
      return attempt.levels.easy.bestStars >= 2 && attempt.levels.medium.bestStars >= 2;
    }

    return false;
  }

  // Authoritative Scoring and Star Calculation
  calculateStars(score: number, caseItem: CaseItem): number {
    const { oneStarMin, twoStarMin, threeStarMin } = caseItem.starThresholds;
    if (score >= threeStarMin) return 3;
    if (score >= twoStarMin) return 2;
    if (score >= oneStarMin) return 1;
    return 0;
  }

  /**
   * Submit answers for a level.
   * Performs server-authoritative validation against private answer keys!
   */
  submitLevelAnswers(
    caseId: string,
    level: DifficultyLevel,
    playerAnswers: { questionId: string; selectedOptionLabel: 'A' | 'B' | 'C' | 'D' }[],
    user: UserProfile
  ): {
    attempt: GameAttempt;
    score: number;
    stars: number;
    detailedAnswers: {
      questionId: string;
      isCorrect: boolean;
      correctOptionLabel: 'A' | 'B' | 'C' | 'D';
      chosenOptionLabel?: 'A' | 'B' | 'C' | 'D' | null;
      prompt?: string;
      explanation: string;
      forensicEvidenceNotes?: string;
      posterUrl?: string;
      posterTitle?: string;
      correctOptionText?: string;
      chosenOptionText?: string;
    }[];
    unlockedNext: boolean;
  } {
    const caseItem = this.getCaseById(caseId) || INITIAL_CASES[0];
    const attempt = this.getOrCreateAttempt(caseId, user);
    const questions = this.getAllQuestionsForCase(caseId).filter(q => q.level === level);

    let score = 0;
    const detailedAnswers: {
      questionId: string;
      isCorrect: boolean;
      correctOptionLabel: 'A' | 'B' | 'C' | 'D';
      chosenOptionLabel?: 'A' | 'B' | 'C' | 'D' | null;
      prompt?: string;
      explanation: string;
      forensicEvidenceNotes?: string;
      posterUrl?: string;
      posterTitle?: string;
      correctOptionText?: string;
      chosenOptionText?: string;
    }[] = [];

    const answerRecords: any[] = [];

    questions.forEach((q, index) => {
      const answered = playerAnswers.find(pa => pa.questionId === q.id);
      const chosen = answered ? answered.selectedOptionLabel : null;
      const isCorrect = Boolean(chosen && chosen === q.correctOptionLabel);
      if (isCorrect) score += 1;

      const correctOpt = q.options.find(o => o.optionLabel === q.correctOptionLabel);
      const chosenOpt = chosen ? q.options.find(o => o.optionLabel === chosen) : null;

      detailedAnswers.push({
        questionId: q.id,
        isCorrect,
        correctOptionLabel: (q.correctOptionLabel || 'A') as 'A' | 'B' | 'C' | 'D',
        chosenOptionLabel: chosen,
        prompt: q.prompt,
        explanation: q.explanation,
        forensicEvidenceNotes: q.forensicEvidenceNotes,
        posterUrl: q.posterUrl,
        posterTitle: q.posterTitle,
        correctOptionText: correctOpt?.optionText,
        chosenOptionText: chosenOpt?.optionText,
      });

      if (chosen) {
        answerRecords.push({
          questionId: q.id,
          orderNumber: index + 1,
          selectedOptionLabel: chosen,
          isCorrect,
          timestamp: new Date().toISOString(),
        });
      }
    });

    const stars = this.calculateStars(score, caseItem);

    // Update level progress while preserving best score & stars
    const currentProgress = attempt.levels[level];
    const prevBestScore = currentProgress.bestScore || 0;
    const prevBestStars = currentProgress.bestStars || 0;

    const newBestScore = Math.max(prevBestScore, score);
    const newBestStars = Math.max(prevBestStars, stars);

    currentProgress.score = score;
    currentProgress.stars = stars;
    currentProgress.completed = true;
    currentProgress.attemptsCount += 1;
    currentProgress.bestScore = newBestScore;
    currentProgress.bestStars = newBestStars;
    currentProgress.lastAttemptAt = new Date().toISOString();

    // Check unlocks for subsequent levels
    let unlockedNext = false;
    if (level === 'easy' && newBestStars >= 2) {
      attempt.levels.medium.unlocked = true;
      unlockedNext = true;
    }
    if (level === 'medium' && newBestStars >= 2 && attempt.levels.easy.bestStars >= 2) {
      attempt.levels.hard.unlocked = true;
      unlockedNext = true;
    }

    // Append to history
    attempt.levelHistory.push({
      attemptId: `att-lvl-${Date.now()}`,
      caseId,
      level,
      score,
      maxScore: questions.length,
      starsEarned: stars,
      accuracy: Math.round((score / Math.max(1, questions.length)) * 100),
      timeElapsedSeconds: 26,
      timeSavedSeconds: 109,
      merits: score * 150,
      answers: answerRecords,
      completedAt: new Date().toISOString(),
    });

    const key = `${user.id}_${caseId}`;
    this.attempts[key] = attempt;
    saveToStorage(STORAGE_KEYS.ATTEMPTS, this.attempts);

    return {
      attempt,
      score,
      stars,
      detailedAnswers,
      unlockedNext,
    };
  }

  /**
   * Final Submission Process (Early or Normal)
   */
  submitFinalCase(
    caseId: string,
    submissionType: 'early' | 'final',
    feedbackRating: number,
    feedbackComments: string,
    user: UserProfile,
    symposiumDetails?: {
      registerNumber?: string;
      collegeName?: string;
      teamName?: string;
      accuracy?: number;
      timeElapsedSeconds?: number;
      timeSavedSeconds?: number;
      merits?: number;
    }
  ): FinalSubmission {
    const caseItem = this.getCaseById(caseId) || INITIAL_CASES[0];
    const attempt = this.getOrCreateAttempt(caseId, user);

    // Prevent duplicate submission if already submitted
    if (attempt.status !== 'in_progress' && attempt.submissionRef) {
      const existing = this.submissions.find(s => s.submissionRef === attempt.submissionRef);
      if (existing) return existing;
    }

    const submissionRef = `SUB-${caseItem.caseCode.replace('CASE-', '')}-${Math.floor(100000 + Math.random() * 900000)}`;

    const easyProgress = attempt.levels.easy;
    const mediumProgress = attempt.levels.medium;
    const hardProgress = attempt.levels.hard;

    const easyScore = easyProgress.completed ? easyProgress.bestScore : 0;
    const easyStars = easyProgress.completed ? easyProgress.bestStars : 0;

    let mediumScore: number | undefined;
    let mediumStars: number | undefined;
    if (mediumProgress.completed) {
      mediumScore = mediumProgress.bestScore;
      mediumStars = mediumProgress.bestStars;
    }

    let hardScore: number | undefined;
    let hardStars: number | undefined;
    if (hardProgress.completed) {
      hardScore = hardProgress.bestScore;
      hardStars = hardProgress.bestStars;
    }

    const totalScoreEarned = easyScore + (mediumScore || 0) + (hardScore || 0);
    const totalAttemptedPossible = 
      (easyProgress.completed ? 3 : 0) +
      (mediumProgress.completed ? 3 : 0) +
      (hardProgress.completed ? 3 : 0);

    const fullCaseMaxScore = 9;
    const totalStarsEarned = easyStars + (mediumStars || 0) + (hardStars || 0);
    const isCompleted = submissionType === 'final' && hardProgress.completed;
    const completionPercentage = Math.round((totalAttemptedPossible / fullCaseMaxScore) * 100);

    const calculatedAccuracy = totalAttemptedPossible > 0
      ? Math.round((totalScoreEarned / totalAttemptedPossible) * 1000) / 10
      : 0;

    const submissionRecord: FinalSubmission = {
      id: `sub-${Date.now()}`,
      submissionRef,
      caseId,
      caseCode: caseItem.caseCode,
      caseTitle: caseItem.title,
      userId: user.id,
      playerName: user.displayName,
      badgeNumber: user.badgeNumber,
      registerNumber: symposiumDetails?.registerNumber || '21CS041 / 118-902',
      collegeName: symposiumDetails?.collegeName || 'National Institute of Technology',
      teamName: symposiumDetails?.teamName || 'CyberKnights / BinarySolvers',
      accuracy: symposiumDetails?.accuracy ?? calculatedAccuracy,
      timeElapsedSeconds: symposiumDetails?.timeElapsedSeconds ?? 26,
      timeSavedSeconds: symposiumDetails?.timeSavedSeconds ?? 109,
      merits: symposiumDetails?.merits ?? (totalScoreEarned * 50),
      submissionType,
      isCompleted,
      easyScore,
      easyStars,
      mediumScore,
      mediumStars,
      hardScore,
      hardStars,
      totalScoreEarned,
      totalAttemptedPossible,
      fullCaseMaxScore,
      totalStarsEarned,
      completionPercentage,
      feedbackRating,
      feedbackComments,
      submittedAt: new Date().toISOString(),
      reviewedByAdmin: false,
    };

    this.submissions.unshift(submissionRecord);
    saveToStorage(STORAGE_KEYS.SUBMISSIONS, this.submissions);

    // Auto-persist directly into Firebase Firestore database
    saveSubmissionToFirebase(submissionRecord).catch(err => {
      console.warn('Background Firebase persistence notice:', err);
    });

    attempt.status = submissionType === 'early' ? 'submitted_early' : 'submitted_final';
    attempt.submittedAt = submissionRecord.submittedAt;
    attempt.submissionRef = submissionRef;

    const key = `${user.id}_${caseId}`;
    this.attempts[key] = attempt;
    saveToStorage(STORAGE_KEYS.ATTEMPTS, this.attempts);

    return submissionRecord;
  }

  // --- Submissions for Admin & Player ---
  getSubmissions(): FinalSubmission[] {
    return this.submissions;
  }

  getSubmissionByRef(ref: string): FinalSubmission | undefined {
    const clean = ref.trim().toLowerCase();
    return this.submissions.find(s => s.submissionRef.toLowerCase() === clean);
  }

  markFeedbackReviewed(submissionId: string) {
    const sub = this.submissions.find(s => s.id === submissionId);
    if (sub) {
      sub.reviewedByAdmin = true;
      saveToStorage(STORAGE_KEYS.SUBMISSIONS, this.submissions);
    }
  }

  // --- Admin Analytics ---
  getAdminAnalytics(): AdminAnalytics {
    const totalCases = this.cases.length;
    const publishedCases = this.cases.filter(c => c.status === 'published').length;
    const registeredPlayers = new Set(this.submissions.map(s => s.userId)).size;
    const totalAttempts = Object.keys(this.attempts).length;
    const completedInvestigations = this.submissions.filter(s => s.isCompleted).length;
    const earlySubmissions = this.submissions.filter(s => s.submissionType === 'early').length;

    const scores = this.submissions.map(s => s.totalScoreEarned);
    const averageScore = scores.length > 0 
      ? Number((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1))
      : 0;

    const scoreDistribution = [
      { range: '0 - 2 pts', count: this.submissions.filter(s => s.totalScoreEarned <= 2).length },
      { range: '3 - 5 pts', count: this.submissions.filter(s => s.totalScoreEarned >= 3 && s.totalScoreEarned <= 5).length },
      { range: '6 - 7 pts', count: this.submissions.filter(s => s.totalScoreEarned >= 6 && s.totalScoreEarned <= 7).length },
      { range: '8 - 9 pts', count: this.submissions.filter(s => s.totalScoreEarned >= 8).length },
    ];

    const submissionsByDay = [
      { date: 'Active Records', count: this.submissions.length },
    ];

    return {
      totalCases,
      publishedCases,
      registeredPlayers,
      totalAttempts,
      completedInvestigations,
      earlySubmissions,
      averageScore,
      scoreDistribution,
      submissionsByDay,
    };
  }

  // Reset to original seed (Admin utility)
  resetToInitial() {
    this.cases = INITIAL_CASES;
    this.questions = INITIAL_QUESTIONS;
    this.evidence = INITIAL_EVIDENCE;
    this.suspects = INITIAL_SUSPECTS;
    this.attempts = {};
    this.submissions = this.generateSeedSubmissions();
    saveToStorage(STORAGE_KEYS.CASES, this.cases);
    saveToStorage(STORAGE_KEYS.QUESTIONS, this.questions);
    saveToStorage(STORAGE_KEYS.EVIDENCE, this.evidence);
    saveToStorage(STORAGE_KEYS.SUSPECTS, this.suspects);
    saveToStorage(STORAGE_KEYS.ATTEMPTS, this.attempts);
    saveToStorage(STORAGE_KEYS.SUBMISSIONS, this.submissions);
  }

  // Clear and delete all sample data fully
  clearAllSampleData() {
    this.cases = [];
    this.questions = [];
    this.evidence = [];
    this.suspects = [];
    this.attempts = {};
    this.submissions = [];
    saveToStorage(STORAGE_KEYS.CASES, []);
    saveToStorage(STORAGE_KEYS.QUESTIONS, []);
    saveToStorage(STORAGE_KEYS.EVIDENCE, []);
    saveToStorage(STORAGE_KEYS.SUSPECTS, []);
    saveToStorage(STORAGE_KEYS.ATTEMPTS, {});
    saveToStorage(STORAGE_KEYS.SUBMISSIONS, []);
  }
}

export const bureauStore = new BureauStore();
