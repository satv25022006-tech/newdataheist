import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { bureauStore } from '../lib/store';
import { 
  CaseItem, 
  Question, 
  FinalSubmission, 
  DifficultyLevel 
} from '../types';
import { DossierCard, CaseStamp } from '../components/common/DossierCard';
import { StarRating } from '../components/common/StarRating';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid, 
  LineChart, 
  Line 
} from 'recharts';
import { 
  LayoutDashboard, 
  FolderKanban, 
  HelpCircle, 
  FileCheck2, 
  MessageSquare, 
  Settings, 
  ShieldAlert, 
  Plus, 
  Edit3, 
  Trash2, 
  Download, 
  Eye, 
  Check, 
  X, 
  Clock, 
  Search,
  KeyRound,
  Upload,
  Image as ImageIcon,
  Database,
  Server,
  RefreshCw,
  Copy,
  ExternalLink,
  CheckCircle2,
  FileText
} from 'lucide-react';
import firebaseConfig from '../../firebase-applet-config.json';
import { 
  saveCaseToFirebase, 
  saveQuestionToFirebase, 
  saveSubmissionToFirebase, 
  testFirestoreConnection,
  firebaseManager 
} from '../lib/firebase';

export const AdminPage: React.FC = () => {
  const { user, isAdmin, login, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'cases' | 'questions' | 'submissions' | 'firebase' | 'feedback' | 'settings'
  >('dashboard');

  // Firebase Integration state
  const [firebaseStatusMsg, setFirebaseStatusMsg] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [isSyncingFirebase, setIsSyncingFirebase] = useState(false);

  const [analytics, setAnalytics] = useState(bureauStore.getAdminAnalytics());
  const [cases, setCases] = useState<CaseItem[]>(bureauStore.getCases(true));
  const [submissions, setSubmissions] = useState<FinalSubmission[]>(bureauStore.getSubmissions());

  // Direct Admin login state
  const [adminInputId, setAdminInputId] = useState('');
  const [adminInputPass, setAdminInputPass] = useState('');
  const [adminAuthError, setAdminAuthError] = useState<string | null>(null);

  // Case edit state
  const [editingCase, setEditingCase] = useState<CaseItem | null>(null);
  const [isCaseModalOpen, setIsCaseModalOpen] = useState(false);

  // Question edit state with poster upload
  const [selectedCaseId, setSelectedCaseId] = useState<string>(cases[0]?.id || 'case-mk-cyber');
  const [selectedLevel, setSelectedLevel] = useState<DifficultyLevel>('easy');
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);

  // Submissions search & inspection
  const [subSearch, setSubSearch] = useState('');
  const [inspectingSub, setInspectingSub] = useState<FinalSubmission | null>(null);

  const refreshData = () => {
    setAnalytics(bureauStore.getAdminAnalytics());
    setCases(bureauStore.getCases(true));
    setSubmissions(bureauStore.getSubmissions());
  };

  if (!isAdmin) {
    const handleAdminUnlock = async (e: React.FormEvent) => {
      e.preventDefault();
      setAdminAuthError(null);
      const res = await login(adminInputId, adminInputPass);
      if (!res.success) {
        setAdminAuthError(res.message);
      }
    };

    return (
      <div className="max-w-md mx-auto py-12 space-y-4">
        <div className="rounded-2xl border border-sky-900 bg-[#0c1322] p-8 text-center space-y-5 shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-sky-950 border border-sky-600/50 flex items-center justify-center text-cyan-400 mx-auto shadow-[0_0_15px_rgba(56,189,248,0.3)]">
            <KeyRound className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-100 font-mono uppercase tracking-wide">
              Admin Clearance Gate
            </h2>
            <p className="text-xs text-slate-400">
              Enter authorized Admin ID and Password to unlock bureau management controls.
            </p>
          </div>

          <form onSubmit={handleAdminUnlock} className="space-y-3.5 text-left font-mono text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Admin ID</label>
              <input
                type="text"
                required
                value={adminInputId}
                onChange={(e) => setAdminInputId(e.target.value)}
                placeholder="admin"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-slate-100 placeholder:text-slate-600 focus:ring-2 focus:ring-cyan-500 text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Admin Password</label>
              <input
                type="password"
                required
                value={adminInputPass}
                onChange={(e) => setAdminInputPass(e.target.value)}
                placeholder="admin123"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-slate-100 placeholder:text-slate-600 focus:ring-2 focus:ring-cyan-500 text-xs font-mono"
              />
            </div>

            <div className="p-2.5 rounded-lg border border-slate-800 bg-[#070e1c] text-[11px] text-slate-400 font-sans flex items-center justify-between">
              <span>Admin ID: <strong className="text-cyan-400 font-mono">admin</strong></span>
              <span>Password: <strong className="text-cyan-400 font-mono">admin123</strong></span>
            </div>

            {adminAuthError && (
              <div className="p-2 rounded bg-rose-950/60 border border-rose-800 text-rose-300 text-[11px]">
                {adminAuthError}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl cyber-glow-btn text-xs font-bold uppercase tracking-wider cursor-pointer shadow-lg"
            >
              AUTHENTICATE ADMIN ACCESS
            </button>
          </form>

          <div className="pt-1">
            <Link to="/" className="text-xs text-cyan-400 hover:underline font-mono">
              &lt; Return to Active Cases
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleSaveCase = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingCase) return;
    bureauStore.saveCase(editingCase);
    setIsCaseModalOpen(false);
    setEditingCase(null);
    refreshData();
  };

  const handleTogglePublish = (c: CaseItem) => {
    const updated: CaseItem = {
      ...c,
      status: c.status === 'published' ? 'draft' : 'published',
    };
    bureauStore.saveCase(updated);
    refreshData();
  };

  const handleDeleteCase = (id: string) => {
    if (confirm('Confirm deletion of this case file?')) {
      bureauStore.deleteCase(id);
      refreshData();
    }
  };

  // Question save
  const handleSaveQuestion = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingQuestion) return;
    bureauStore.saveQuestion(editingQuestion);
    setIsQuestionModalOpen(false);
    setEditingQuestion(null);
    refreshData();
  };

  // Image / Poster file upload handler (converts to data URL)
  const handlePosterFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editingQuestion) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setEditingQuestion({
            ...editingQuestion,
            posterUrl: reader.result,
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDirectPosterUpload = (questionId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          bureauStore.updateQuestionPoster(questionId, reader.result, `Poster: ${file.name}`);
          refreshData();
        }
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    }
  };

  const handleExportCSV = () => {
    const headers = [
      'SubmissionRef',
      'CaseCode',
      'CaseTitle',
      'PlayerName',
      'RegisterNumber',
      'CollegeName',
      'TeamName',
      'Type',
      'TotalScore',
      'TotalStars',
      'SubmittedAt'
    ];
    const rows = submissions.map(s => [
      s.submissionRef,
      `"${s.caseCode}"`,
      `"${s.caseTitle.replace(/"/g, '""')}"`,
      `"${s.playerName}"`,
      `"${s.registerNumber || ''}"`,
      `"${s.collegeName || ''}"`,
      `"${s.teamName || ''}"`,
      s.submissionType,
      s.totalScoreEarned,
      s.totalStarsEarned,
      s.submittedAt
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + 
      [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `smit_bureau_submissions_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleTestFirebaseConnection = async () => {
    setFirebaseStatusMsg({ type: 'info', text: 'Testing connection to Firebase Firestore...' });
    try {
      await testFirestoreConnection();
      setFirebaseStatusMsg({
        type: 'success',
        text: `Successfully connected to Firebase Project [${firebaseConfig.projectId}] and Firestore Database [${firebaseConfig.firestoreDatabaseId}]!`,
      });
    } catch (err: any) {
      setFirebaseStatusMsg({
        type: 'error',
        text: err?.message || 'Failed to ping Firebase Cloud Firestore.',
      });
    }
  };

  const handleSyncToFirebase = async () => {
    setIsSyncingFirebase(true);
    setFirebaseStatusMsg({ type: 'info', text: 'Syncing cases, forensic exhibits, posters, and submissions to Firebase Cloud Firestore...' });
    try {
      const allQs = bureauStore.getAllQuestions();
      const res = await firebaseManager.syncDataToFirebase(cases, allQs, submissions);
      if (res.success) {
        setFirebaseStatusMsg({
          type: 'success',
          text: res.message,
        });
      } else {
        setFirebaseStatusMsg({
          type: 'error',
          text: res.message,
        });
      }
    } catch (err: any) {
      setFirebaseStatusMsg({
        type: 'error',
        text: err?.message || 'Firebase sync failed.',
      });
    } finally {
      setIsSyncingFirebase(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 py-2 text-slate-100">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-sky-950 text-cyan-300 border border-sky-800 font-bold">
              ADMINISTRATION CLEARANCE
            </span>
            <span className="text-xs font-mono text-slate-400">SMIT CENTRAK HEADQUARTERS</span>
          </div>
          <h1 className="text-2xl font-black text-slate-100 font-mono tracking-wide">
            Bureau Operations & Case Management
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs text-slate-400 font-mono">
            Active: <strong className="text-cyan-400">{user.displayName}</strong> ({user.badgeNumber})
          </div>
          <button
            onClick={() => logout()}
            className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-slate-300 hover:text-white text-xs font-mono cursor-pointer"
          >
            Log out Admin
          </button>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-800">
        {[
          { id: 'dashboard', label: 'Dashboard Analytics', icon: LayoutDashboard },
          { id: 'cases', label: 'Case Management', icon: FolderKanban },
          { id: 'questions', label: 'Questions & Poster Uploads', icon: HelpCircle },
          { id: 'submissions', label: 'Submissions Audit', icon: FileCheck2 },
          { id: 'firebase', label: 'Firebase Integration', icon: Database },
          { id: 'feedback', label: 'Player Feedback', icon: MessageSquare },
          { id: 'settings', label: 'Bureau Settings', icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer uppercase font-mono ${
                isActive
                  ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: DASHBOARD ANALYTICS */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-xl border border-sky-900/60 bg-[#0c1322] p-4 space-y-1 font-mono">
              <span className="text-[10px] uppercase text-slate-400">Total Cases</span>
              <div className="text-2xl font-black text-slate-100">{analytics.totalCases}</div>
              <div className="text-[11px] text-cyan-400">{analytics.publishedCases} published</div>
            </div>

            <div className="rounded-xl border border-sky-900/60 bg-[#0c1322] p-4 space-y-1 font-mono">
              <span className="text-[10px] uppercase text-slate-400">Field Attempts</span>
              <div className="text-2xl font-black text-slate-100">{analytics.totalAttempts}</div>
              <div className="text-[11px] text-slate-400">active sessions</div>
            </div>

            <div className="rounded-xl border border-sky-900/60 bg-[#0c1322] p-4 space-y-1 font-mono">
              <span className="text-[10px] uppercase text-slate-400">Submissions</span>
              <div className="text-2xl font-black text-slate-100">{submissions.length}</div>
              <div className="text-[11px] text-emerald-400">{analytics.completedInvestigations} completed</div>
            </div>

            <div className="rounded-xl border border-sky-900/60 bg-[#0c1322] p-4 space-y-1 font-mono">
              <span className="text-[10px] uppercase text-slate-400">Average Score</span>
              <div className="text-2xl font-black text-amber-400">{analytics.averageScore} / 9</div>
              <div className="text-[11px] text-slate-400">bureau merit rating</div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-sky-900/60 bg-[#0c1322] p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
                  Investigator Score Distribution
                </h3>
              </div>
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.scoreDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="range" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0c1322', borderRadius: 8, borderColor: '#0284c7', color: '#f8fafc', fontSize: 12 }}
                    />
                    <Bar dataKey="count" fill="#38bdf8" radius={[4, 4, 0, 0]} name="Submissions" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-2xl border border-sky-900/60 bg-[#0c1322] p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
                  Daily Submissions Volume
                </h3>
              </div>
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics.submissionsByDay}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0c1322', borderRadius: 8, borderColor: '#0284c7', color: '#f8fafc', fontSize: 12 }}
                    />
                    <Line type="monotone" dataKey="count" stroke="#00f0ff" strokeWidth={2.5} name="Filings" dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CASE MANAGEMENT */}
      {activeTab === 'cases' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold font-mono uppercase tracking-wider text-slate-200">
              Published Cases ({cases.length})
            </h2>
            <button
              onClick={() => {
                setEditingCase({
                  id: `case-${Date.now()}`,
                  caseCode: `mk_${Math.floor(10 + Math.random() * 89)}`,
                  title: 'New Forensic Case',
                  acronym: 'jw',
                  summary: 'Analyze digital and physical artifacts to solve the bureau case.',
                  incidentDescription: '',
                  briefing: '',
                  status: 'draft',
                  category: 'Cyber Forensics',
                  badgeTag: 'CYBER FORENSICS',
                  subTag: 'Active Tournament',
                  estimatedMinutes: 15,
                  rulesTimerSeconds: 120,
                  briefingTimerSeconds: 180,
                  timeLimitSeconds: 90,
                  questionsPerLevel: 3,
                  starThresholds: { oneStarMin: 1, twoStarMin: 2, threeStarMin: 3 },
                  retriesAllowed: true,
                  bannerGradient: 'from-sky-950 to-slate-950',
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                });
                setIsCaseModalOpen(true);
              }}
              className="py-2 px-3.5 rounded-xl cyber-glow-btn text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create New Case</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cases.map((c) => (
              <div key={c.id} className="rounded-xl border border-sky-900/60 bg-[#0c1322] p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-cyan-400 bg-sky-950 border border-sky-800 px-2 py-0.5 rounded">
                    {c.caseCode} // {c.acronym || 'jw'}
                  </span>
                  <button
                    onClick={() => handleTogglePublish(c)}
                    className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${
                      c.status === 'published'
                        ? 'border-emerald-700 bg-emerald-950/60 text-emerald-300'
                        : 'border-slate-700 bg-slate-900 text-slate-400'
                    }`}
                  >
                    {c.status}
                  </button>
                </div>

                <div>
                  <h3 className="font-bold text-base text-slate-100">{c.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1">{c.summary}</p>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingCase(c);
                        setIsCaseModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg border border-slate-700 bg-slate-900 hover:border-cyan-500 text-slate-300 text-xs font-mono flex items-center gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-cyan-400" /> Edit Case
                    </button>
                    <Link
                      to={`/case/${c.id}/rules`}
                      className="p-1.5 rounded-lg border border-slate-700 bg-slate-900 hover:border-amber-500 text-amber-300 text-xs font-mono flex items-center gap-1"
                    >
                      <FileText className="w-3.5 h-3.5 text-amber-400" /> Rules
                    </Link>
                    <Link
                      to={`/case/${c.id}`}
                      className="p-1.5 rounded-lg border border-slate-700 bg-slate-900 hover:border-cyan-500 text-slate-300 text-xs font-mono flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5 text-cyan-400" /> Preview
                    </Link>
                  </div>

                  <button
                    onClick={() => handleDeleteCase(c.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: QUESTIONS & POSTER UPLOADS (Every question has poster to upload!) */}
      {activeTab === 'questions' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0c1322] p-4 rounded-xl border border-sky-900/60">
            <div className="flex items-center gap-3">
              <label className="text-xs font-mono text-slate-300">Case:</label>
              <select
                value={selectedCaseId}
                onChange={(e) => setSelectedCaseId(e.target.value)}
                className="text-xs rounded-lg border border-slate-700 bg-slate-950 text-slate-200 py-1.5 px-3 font-mono"
              >
                {cases.map((c) => (
                  <option key={c.id} value={c.id}>{c.caseCode} — {c.title}</option>
                ))}
              </select>

              <label className="text-xs font-mono text-slate-300 ml-2">Tier:</label>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value as DifficultyLevel)}
                className="text-xs rounded-lg border border-slate-700 bg-slate-950 text-slate-200 py-1.5 px-3 font-mono"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <button
              onClick={() => {
                const currentCaseQuestions = bureauStore.getAllQuestionsForCase(selectedCaseId)
                  .filter(q => q.level === selectedLevel);

                setEditingQuestion({
                  id: `q-${Date.now()}`,
                  caseId: selectedCaseId,
                  level: selectedLevel,
                  orderNumber: currentCaseQuestions.length + 1,
                  prompt: '',
                  hint: '',
                  explanation: '',
                  evidenceRef: `EXHIBIT #${currentCaseQuestions.length + 1}`,
                  posterTitle: `Forensic Evidence Poster: Exhibit #${currentCaseQuestions.length + 1}`,
                  posterUrl: '',
                  correctOptionLabel: 'A',
                  options: [
                    { id: `opt-${Date.now()}-a`, questionId: '', optionLabel: 'A', optionText: '' },
                    { id: `opt-${Date.now()}-b`, questionId: '', optionLabel: 'B', optionText: '' },
                    { id: `opt-${Date.now()}-c`, questionId: '', optionLabel: 'C', optionText: '' },
                    { id: `opt-${Date.now()}-d`, questionId: '', optionLabel: 'D', optionText: '' },
                  ]
                });
                setIsQuestionModalOpen(true);
              }}
              className="py-2 px-3.5 rounded-xl cyber-glow-btn text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Question & Poster</span>
            </button>
          </div>

          <div className="space-y-4">
            {bureauStore
              .getAllQuestionsForCase(selectedCaseId)
              .filter(q => q.level === selectedLevel)
              .map((q) => (
                <div key={q.id} className="rounded-xl border border-sky-900/60 bg-[#0c1322] p-5 space-y-4">
                  {/* Top Bar */}
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-2 font-mono text-xs">
                      <span className="font-bold text-cyan-400 bg-sky-950 border border-sky-800 px-2 py-0.5 rounded">
                        Q{q.orderNumber}
                      </span>
                      <span className="text-slate-400">{q.evidenceRef}</span>
                      <span className="text-slate-500 font-sans text-xs">· {q.posterTitle}</span>
                    </div>

                    <div className="flex items-center gap-2 font-mono text-xs">
                      <span className="text-emerald-400 font-bold bg-emerald-950 border border-emerald-800 px-2 py-0.5 rounded">
                        Key: {q.correctOptionLabel}
                      </span>
                      <button
                        onClick={() => {
                          setEditingQuestion(q);
                          setIsQuestionModalOpen(true);
                        }}
                        className="p-1 text-slate-400 hover:text-cyan-300"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Delete this question?')) {
                            bureauStore.deleteQuestion(q.id);
                            refreshData();
                          }
                        }}
                        className="p-1 text-slate-500 hover:text-rose-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Poster Thumbnail & Prompt Split */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Poster Preview with Quick Upload */}
                    <div className="w-full sm:w-48 h-28 rounded-lg border border-slate-800 bg-slate-950 overflow-hidden flex items-center justify-center shrink-0 relative group">
                      {q.posterUrl ? (
                        <img
                          src={q.posterUrl}
                          alt={q.posterTitle || 'Poster'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-[10px] text-slate-600 font-mono text-center p-2">
                          No poster uploaded
                        </div>
                      )}

                      {/* Quick Poster Upload Overlay */}
                      <label className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1 text-cyan-300 text-xs font-mono cursor-pointer transition-opacity">
                        <Upload className="w-4 h-4 text-cyan-400" />
                        <span className="text-[11px] font-bold">Upload Poster</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleDirectPosterUpload(q.id, e)}
                        />
                      </label>
                    </div>

                    {/* Question details */}
                    <div className="space-y-2 flex-1">
                      <p className="text-xs sm:text-sm font-bold text-slate-100">{q.prompt}</p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {q.options.map((opt) => (
                          <div
                            key={opt.id}
                            className={`p-2 rounded border font-mono ${
                              opt.optionLabel === q.correctOptionLabel
                                ? 'border-emerald-700 bg-emerald-950/40 text-emerald-300 font-bold'
                                : 'border-slate-800 bg-[#070e1c] text-slate-400'
                            }`}
                          >
                            <span className="mr-1.5">{opt.optionLabel}.</span>
                            <span>{opt.optionText}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* TAB 4: SUBMISSIONS AUDIT */}
      {activeTab === 'submissions' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0c1322] p-4 rounded-xl border border-sky-900/60">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={subSearch}
                onChange={(e) => setSubSearch(e.target.value)}
                placeholder="Search candidate, team, or college..."
                className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-slate-700 bg-slate-950 text-slate-200 font-mono"
              />
            </div>

            <button
              onClick={handleExportCSV}
              className="py-2 px-4 rounded-xl cyber-glow-btn text-xs font-bold uppercase tracking-wider flex items-center gap-2"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Submissions (CSV)</span>
            </button>
          </div>

          <div className="rounded-xl border border-sky-900/60 bg-[#0c1322] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950 text-[10px] uppercase text-slate-400">
                    <th className="p-3">Reference</th>
                    <th className="p-3">Candidate / Team</th>
                    <th className="p-3">College</th>
                    <th className="p-3 text-center">Score</th>
                    <th className="p-3 text-center">Stars</th>
                    <th className="p-3 text-right">Date</th>
                    <th className="p-3 text-center">Inspect</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {submissions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-900/50">
                      <td className="p-3 font-bold text-cyan-400">{sub.submissionRef}</td>
                      <td className="p-3">
                        <div className="font-bold text-slate-200">{sub.playerName}</div>
                        <div className="text-[10px] text-slate-400">{sub.teamName || sub.badgeNumber}</div>
                      </td>
                      <td className="p-3 text-slate-300">{sub.collegeName || 'National Tech'}</td>
                      <td className="p-3 text-center font-bold text-slate-200">{sub.totalScoreEarned} / {sub.totalAttemptedPossible}</td>
                      <td className="p-3 text-center font-bold text-amber-400">{sub.totalStarsEarned}★</td>
                      <td className="p-3 text-right text-slate-400 text-[10px]">{new Date(sub.submittedAt).toLocaleDateString()}</td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => setInspectingSub(sub)}
                          className="p-1 hover:text-cyan-300 text-slate-400"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: FIREBASE CLOUD INTEGRATION */}
      {activeTab === 'firebase' && (
        <div className="space-y-6">
          {/* Header & Connection Status Banner */}
          <div className="rounded-2xl border border-sky-900/60 bg-[#0c1322] p-6 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-cyan-400" />
                  <h2 className="text-base sm:text-lg font-bold font-mono text-slate-100 uppercase tracking-wide">
                    Firebase Cloud Firestore Integration
                  </h2>
                </div>
                <p className="text-xs text-slate-400">
                  Live cloud persistence for case files, forensic exhibits, question posters, and player tournament submissions.
                </p>
              </div>

              {/* Status Badge */}
              <div className="px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold bg-emerald-950/80 border border-emerald-500 text-emerald-300 flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>FIRESTORE CLOUD CONNECTED</span>
              </div>
            </div>

            {/* Status Alert Banner */}
            {firebaseStatusMsg && (
              <div
                className={`p-3.5 rounded-xl border text-xs font-mono flex items-center gap-2.5 animate-in fade-in duration-150 ${
                  firebaseStatusMsg.type === 'success'
                    ? 'border-emerald-600 bg-emerald-950/60 text-emerald-200'
                    : firebaseStatusMsg.type === 'error'
                    ? 'border-rose-600 bg-rose-950/60 text-rose-200'
                    : 'border-cyan-600 bg-cyan-950/60 text-cyan-200'
                }`}
              >
                {firebaseStatusMsg.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : firebaseStatusMsg.type === 'error' ? (
                  <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                ) : (
                  <RefreshCw className="w-4 h-4 text-cyan-400 shrink-0 animate-spin" />
                )}
                <span>{firebaseStatusMsg.text}</span>
              </div>
            )}

            {/* Grid of Settings & Pipeline */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
              {/* Firebase Environment Info */}
              <div className="lg:col-span-7 space-y-4">
                <div className="border border-slate-800 bg-[#070e1c] p-5 rounded-xl space-y-4 font-mono text-xs">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Server className="w-3.5 h-3.5" />
                      Provisioned Firebase Parameters
                    </span>
                    <span className="text-[10px] text-emerald-400 font-bold">Active SDK</span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-slate-400 text-[11px] mb-1">Firebase Project ID</label>
                      <input
                        type="text"
                        readOnly
                        value={firebaseConfig.projectId}
                        className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-cyan-300 font-mono text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 text-[11px] mb-1">Firestore Database ID</label>
                      <input
                        type="text"
                        readOnly
                        value={firebaseConfig.firestoreDatabaseId}
                        className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-cyan-300 font-mono text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 text-[11px] mb-1">Auth Domain</label>
                      <input
                        type="text"
                        readOnly
                        value={firebaseConfig.authDomain}
                        className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-slate-300 font-mono text-xs"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleTestFirebaseConnection}
                      className="py-2.5 px-5 rounded-xl border border-cyan-500/60 bg-sky-950/80 hover:bg-sky-900 text-cyan-300 font-bold uppercase tracking-wider text-xs cursor-pointer transition-all flex items-center gap-2"
                    >
                      <Server className="w-3.5 h-3.5" />
                      <span>Test &amp; Ping Firestore Endpoint</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Data Sync & Pipeline Column */}
              <div className="lg:col-span-5 space-y-4">
                <div className="border border-slate-800 bg-[#070e1c] p-5 rounded-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                      <RefreshCw className="w-3.5 h-3.5" />
                      Live Data Sync Pipeline
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">Online</span>
                  </div>

                  <p className="text-xs text-slate-400 font-mono">
                    Synchronize cases, forensic exhibits, uploaded posters, rules & regulations, and tournament submissions directly into Firestore collections.
                  </p>

                  {/* Sync Metrics */}
                  <div className="grid grid-cols-3 gap-2.5 font-mono text-center">
                    <div className="p-3 rounded-xl border border-slate-800 bg-slate-950">
                      <div className="text-[10px] text-slate-500 uppercase">Cases</div>
                      <div className="text-lg font-black text-cyan-300 mt-0.5">{cases.length}</div>
                    </div>

                    <div className="p-3 rounded-xl border border-slate-800 bg-slate-950">
                      <div className="text-[10px] text-slate-500 uppercase">Questions</div>
                      <div className="text-lg font-black text-cyan-300 mt-0.5">{bureauStore.getAllQuestions().length}</div>
                    </div>

                    <div className="p-3 rounded-xl border border-slate-800 bg-slate-950">
                      <div className="text-[10px] text-slate-500 uppercase">Submissions</div>
                      <div className="text-lg font-black text-emerald-400 mt-0.5">{submissions.length}</div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      disabled={isSyncingFirebase}
                      onClick={handleSyncToFirebase}
                      className="w-full py-3 px-4 rounded-xl cyber-glow-btn text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                    >
                      {isSyncingFirebase ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Pushing Records to Firebase...</span>
                        </>
                      ) : (
                        <>
                          <Database className="w-3.5 h-3.5" />
                          <span>Push Bureau Data to Firebase</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: FEEDBACK */}
      {activeTab === 'feedback' && (
        <div className="space-y-3">
          {submissions.map((sub) => (
            <div key={sub.id} className="rounded-xl border border-sky-900/60 bg-[#0c1322] p-4 space-y-2 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-slate-200">{sub.playerName} ({sub.teamName || sub.collegeName})</span>
                <span className="text-amber-400 font-bold">{sub.feedbackRating}/5 Stars</span>
              </div>
              <p className="text-slate-300 italic font-sans">
                "{sub.feedbackComments || 'No written comments.'}"
              </p>
            </div>
          ))}
        </div>
      )}

      {/* TAB 6: SETTINGS & LOGO / BRANDING MANAGEMENT */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          {/* Logo & Bureau Name Customizer matching user request */}
          <div className="rounded-2xl border border-sky-900/60 bg-[#0c1322] p-6 space-y-5 font-mono text-xs shadow-xl">
            <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-cyan-400 uppercase tracking-wide flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-cyan-400" />
                  <span>Navbar Brand & Logo Customization</span>
                </h2>
                <p className="text-slate-400 font-sans mt-0.5">
                  Change the bureau wordmark and upload a custom logo image for the top navigation bar.
                </p>
              </div>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-sky-950 text-cyan-300 border border-sky-800">
                Live Navbar Sync
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Bureau Name Input */}
              <div className="space-y-2">
                <label className="block text-slate-300 font-bold">
                  Bureau / Navigation Brand Title
                </label>
                <input
                  type="text"
                  value={bureauStore.getBranding().bureauName}
                  onChange={(e) => {
                    bureauStore.updateBranding({ bureauName: e.target.value });
                    refreshData();
                  }}
                  placeholder="e.g. CODE HEIST"
                  className="w-full text-xs font-mono p-2.5 rounded-xl border border-slate-700 bg-slate-950 text-slate-100 focus:border-cyan-400 focus:outline-none"
                />
                <p className="text-[11px] text-slate-500">
                  Current wordmark displayed in navbar: <strong className="text-cyan-300">{bureauStore.getBranding().bureauName}</strong>
                </p>
              </div>

              {/* Logo Upload Box */}
              <div className="space-y-2">
                <label className="block text-slate-300 font-bold">
                  Upload Custom Navbar Logo
                </label>
                
                <div className="flex items-center gap-4">
                  {/* Current Logo Preview */}
                  <div className="w-16 h-16 rounded-xl border-2 border-sky-800/80 bg-slate-950 flex items-center justify-center overflow-hidden shrink-0 shadow-md">
                    {bureauStore.getBranding().logoUrl ? (
                      <img
                        src={bureauStore.getBranding().logoUrl}
                        alt="Current Navbar Logo"
                        className="w-full h-full object-contain p-1"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-600 text-[10px]">
                        <ImageIcon className="w-5 h-5 text-slate-500 mb-0.5" />
                        <span>No Logo</span>
                      </div>
                    )}
                  </div>

                  {/* Upload Controls */}
                  <div className="space-y-2 flex-1">
                    <label className="inline-flex items-center gap-2 py-2 px-3.5 rounded-xl border border-cyan-500/60 bg-sky-950 hover:bg-sky-900 text-cyan-300 cursor-pointer font-bold text-xs uppercase tracking-wider transition-colors shadow-sm">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Choose Logo File</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              if (typeof reader.result === 'string') {
                                bureauStore.updateBranding({ logoUrl: reader.result });
                                refreshData();
                              }
                            };
                            reader.readAsDataURL(file);
                            e.target.value = '';
                          }
                        }}
                      />
                    </label>

                    {bureauStore.getBranding().logoUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          bureauStore.updateBranding({ logoUrl: '' });
                          refreshData();
                        }}
                        className="block text-[11px] text-rose-400 hover:text-rose-300 underline cursor-pointer"
                      >
                        Reset to default badge icon
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 font-sans">
                  Supported formats: PNG, JPG, SVG, WebP. File is converted and persisted instantly in local bureau storage.
                </p>
              </div>
            </div>
          </div>

          {/* Operational Parameters */}
          <div className="rounded-2xl border border-sky-900/60 bg-[#0c1322] p-6 space-y-4 font-mono text-xs shadow-xl">
            <h2 className="text-sm font-bold text-cyan-400 uppercase">
              Bureau Operational Parameters
            </h2>
            <p className="text-slate-400">
              Current tournament engine operating in dark cyber crime bureau tournament configuration.
            </p>
            <div className="pt-2">
              <button
                onClick={() => {
                  if (confirm('Reset to initial factory cyber cases & posters?')) {
                    bureauStore.resetToInitial();
                    refreshData();
                  }
                }}
                className="py-2.5 px-5 rounded-xl border border-rose-800 bg-rose-950/40 text-rose-300 hover:bg-rose-900 font-bold cursor-pointer"
              >
                Reset to Factory Seed Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CASE CREATE / EDIT (RULES & REGULATIONS MANAGEMENT) */}
      {isCaseModalOpen && editingCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-2xl rounded-2xl border border-sky-800 bg-[#0c1322] text-slate-100 shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsCaseModalOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-md text-slate-400 hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-slate-800 pb-3 mb-4">
              <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
                CASE FILE CONFIGURATOR
              </span>
              <h3 className="text-base font-bold font-mono text-slate-100">
                Edit Case Parameters & Rules and Regulations
              </h3>
            </div>

            <form onSubmit={handleSaveCase} className="space-y-4 text-xs font-mono">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Case Title *</label>
                  <input
                    type="text"
                    required
                    value={editingCase.title}
                    onChange={(e) => setEditingCase({ ...editingCase, title: e.target.value })}
                    className="w-full border border-slate-700 bg-slate-950 rounded-xl p-2.5 text-slate-100 font-sans"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Case Code (e.g. mk, BK7) *</label>
                  <input
                    type="text"
                    required
                    value={editingCase.caseCode}
                    onChange={(e) => setEditingCase({ ...editingCase, caseCode: e.target.value })}
                    className="w-full border border-slate-700 bg-slate-950 rounded-xl p-2.5 text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Brief Case Summary</label>
                <textarea
                  rows={2}
                  required
                  value={editingCase.summary}
                  onChange={(e) => setEditingCase({ ...editingCase, summary: e.target.value })}
                  className="w-full border border-slate-700 bg-slate-950 rounded-xl p-2.5 text-slate-200 font-sans"
                />
              </div>

              {/* Rules and Regulations Management Section */}
              <div className="p-4 rounded-xl border border-sky-800/80 bg-[#070e1c] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-cyan-400 font-bold uppercase tracking-wider text-xs">
                    <FileText className="w-4 h-4 text-cyan-400" />
                    <span>Rules and Regulations Configuration</span>
                  </div>
                  <span className="text-[10px] text-slate-400 bg-sky-950 border border-sky-800 px-2 py-0.5 rounded font-bold">
                    Official Bureau Protocols
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1">Rules & Protocol Read Timer (Seconds)</label>
                    <input
                      type="number"
                      required
                      min={10}
                      max={600}
                      value={editingCase.rulesTimerSeconds || 120}
                      onChange={(e) => setEditingCase({ ...editingCase, rulesTimerSeconds: Number(e.target.value) })}
                      className="w-full border border-slate-700 bg-slate-950 rounded-lg p-2 text-slate-100 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Briefing Review Timer (Seconds)</label>
                    <input
                      type="number"
                      required
                      min={10}
                      max={600}
                      value={editingCase.briefingTimerSeconds || 180}
                      onChange={(e) => setEditingCase({ ...editingCase, briefingTimerSeconds: Number(e.target.value) })}
                      className="w-full border border-slate-700 bg-slate-950 rounded-lg p-2 text-slate-100 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Incident Briefing & Rules Context</label>
                  <textarea
                    rows={2}
                    value={editingCase.briefing || ''}
                    onChange={(e) => setEditingCase({ ...editingCase, briefing: e.target.value })}
                    placeholder="Specify case briefing guidelines and investigation directives..."
                    className="w-full border border-slate-700 bg-slate-950 rounded-xl p-2.5 text-slate-200 font-sans"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1 flex items-center justify-between">
                    <span>Case Rules & Regulations (One rule per line)</span>
                    <span className="text-[10px] text-cyan-400 font-mono font-bold">RULES & REGULATIONS</span>
                  </label>
                  <textarea
                    rows={4}
                    value={(editingCase.rulesAndRegulations || []).join('\n')}
                    onChange={(e) => {
                      const lines = e.target.value.split('\n');
                      setEditingCase({ ...editingCase, rulesAndRegulations: lines });
                    }}
                    placeholder="1. All investigators must register using official credentials.&#10;2. Time limits are strictly enforced (90s per level).&#10;3. Earn 2 stars on preceding levels to unlock higher clearance levels."
                    className="w-full border border-slate-700 bg-slate-950 rounded-xl p-2.5 text-slate-200 font-sans text-xs"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Enter each regulation on a separate line. These will be formatted dynamically in the Rules & Regulations protocol view.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Category</label>
                  <input
                    type="text"
                    required
                    value={editingCase.category}
                    onChange={(e) => setEditingCase({ ...editingCase, category: e.target.value })}
                    className="w-full border border-slate-700 bg-slate-950 rounded-xl p-2 text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Status</label>
                  <select
                    value={editingCase.status}
                    onChange={(e) => setEditingCase({ ...editingCase, status: e.target.value as any })}
                    className="w-full border border-slate-700 bg-slate-950 rounded-xl p-2 text-slate-200 font-bold"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Time Limit (Seconds)</label>
                  <input
                    type="number"
                    required
                    value={editingCase.timeLimitSeconds}
                    onChange={(e) => setEditingCase({ ...editingCase, timeLimitSeconds: Number(e.target.value) })}
                    className="w-full border border-slate-700 bg-slate-950 rounded-xl p-2 text-slate-200 font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCaseModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-700 bg-slate-900 text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl cyber-glow-btn font-bold uppercase tracking-wider"
                >
                  Save Case Parameters
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: QUESTION CREATE / EDIT WITH POSTER UPLOAD */}
      {isQuestionModalOpen && editingQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-xl rounded-2xl border border-sky-800 bg-[#0c1322] text-slate-100 shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsQuestionModalOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-md text-slate-400 hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold font-mono text-cyan-400 border-b border-slate-800 pb-3 mb-4">
              Edit Question & Forensic Evidence Poster
            </h3>

            <form onSubmit={handleSaveQuestion} className="space-y-4 text-xs font-mono">
              {/* Evidence Poster Upload Section (Mandatory User Feature) */}
              <div className="p-4 rounded-xl border border-sky-700/60 bg-[#070e1c] space-y-3">
                <div className="flex items-center gap-2 text-cyan-400 font-bold">
                  <ImageIcon className="w-4 h-4" />
                  <span>Forensic Evidence Poster (Upload or Image URL)</span>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Poster Title / Code</label>
                  <input
                    type="text"
                    value={editingQuestion.posterTitle || ''}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, posterTitle: e.target.value })}
                    placeholder="e.g. Forensic Evidence Poster: Exhibit #1"
                    className="w-full border border-slate-700 bg-slate-950 rounded-lg p-2 text-slate-200"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                  <div>
                    <label className="block text-slate-400 mb-1">Upload Poster Image File</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePosterFileUpload}
                      className="w-full text-[11px] text-slate-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-cyan-500 file:text-slate-950 file:cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Or Paste Poster Image URL</label>
                    <input
                      type="text"
                      value={editingQuestion.posterUrl || ''}
                      onChange={(e) => setEditingQuestion({ ...editingQuestion, posterUrl: e.target.value })}
                      placeholder="https://... or data:image/..."
                      className="w-full border border-slate-700 bg-slate-950 rounded-lg p-2 text-slate-200 text-[11px]"
                    />
                  </div>
                </div>

                {/* Poster Preview */}
                {editingQuestion.posterUrl && (
                  <div className="rounded-lg border border-slate-800 bg-slate-950 p-2 text-center">
                    <span className="text-[10px] text-slate-500 block mb-1">Live Poster Preview</span>
                    <img
                      src={editingQuestion.posterUrl}
                      alt="Preview"
                      className="max-h-36 mx-auto rounded object-cover"
                    />
                  </div>
                )}
              </div>

              {/* Question Prompt */}
              <div>
                <label className="block text-slate-400 mb-1">Question Prompt</label>
                <textarea
                  rows={2}
                  required
                  value={editingQuestion.prompt}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, prompt: e.target.value })}
                  placeholder="Enter investigative question..."
                  className="w-full border border-slate-700 bg-slate-950 rounded-lg p-2 text-slate-100 font-sans"
                />
              </div>

              {/* 4 Options */}
              <div className="space-y-2">
                <label className="block text-slate-400">Multiple-Choice Options</label>
                {(['A', 'B', 'C', 'D'] as const).map((label, idx) => (
                  <div key={label} className="flex items-center gap-2">
                    <span className="font-bold text-cyan-400 w-5">{label}</span>
                    <input
                      type="text"
                      required
                      value={editingQuestion.options[idx]?.optionText || ''}
                      onChange={(e) => {
                        const newOpts = [...editingQuestion.options];
                        newOpts[idx] = {
                          ...newOpts[idx],
                          optionLabel: label,
                          optionText: e.target.value,
                        };
                        setEditingQuestion({ ...editingQuestion, options: newOpts });
                      }}
                      placeholder={`Option ${label} text...`}
                      className="flex-1 border border-slate-700 bg-slate-950 rounded-lg p-2 text-slate-200 font-sans"
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-emerald-400 mb-1 font-bold">
                  Correct Answer Key (Kept Private)
                </label>
                <select
                  value={editingQuestion.correctOptionLabel}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, correctOptionLabel: e.target.value as any })}
                  className="w-full border border-emerald-600 bg-emerald-950/60 rounded-lg p-2 font-bold text-emerald-300"
                >
                  <option value="A">Option A</option>
                  <option value="B">Option B</option>
                  <option value="C">Option C</option>
                  <option value="D">Option D</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Forensic Explanation</label>
                <textarea
                  rows={2}
                  required
                  value={editingQuestion.explanation}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, explanation: e.target.value })}
                  className="w-full border border-slate-700 bg-slate-950 rounded-lg p-2 text-slate-200 font-sans"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsQuestionModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-700 bg-slate-900 text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl cyber-glow-btn uppercase font-bold"
                >
                  Save Question & Poster
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INSPECT SUBMISSION MODAL */}
      {inspectingSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl border border-sky-800 bg-[#0c1322] text-slate-100 p-6 relative font-mono text-xs">
            <button
              onClick={() => setInspectingSub(null)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-4">
              <div className="border-b border-slate-800 pb-2">
                <span className="text-cyan-400 font-bold">{inspectingSub.submissionRef}</span>
                <h3 className="font-bold text-base text-slate-100 mt-1">{inspectingSub.caseTitle}</h3>
                <p className="text-slate-400">
                  {inspectingSub.playerName} · {inspectingSub.teamName} ({inspectingSub.collegeName})
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                  <div className="text-[10px] text-slate-400">Easy</div>
                  <div className="font-bold">{inspectingSub.easyScore}/3 pts ({inspectingSub.easyStars}★)</div>
                </div>
                <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                  <div className="text-[10px] text-slate-400">Medium</div>
                  <div className="font-bold">{inspectingSub.mediumScore !== undefined ? `${inspectingSub.mediumScore}/3 pts (${inspectingSub.mediumStars}★)` : '—'}</div>
                </div>
                <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                  <div className="text-[10px] text-slate-400">Hard</div>
                  <div className="font-bold">{inspectingSub.hardScore !== undefined ? `${inspectingSub.hardScore}/3 pts (${inspectingSub.hardStars}★)` : '—'}</div>
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between font-bold">
                <span className="text-slate-300">Total Score: {inspectingSub.totalScoreEarned} / {inspectingSub.totalAttemptedPossible} pts</span>
                <span className="text-amber-400">{inspectingSub.totalStarsEarned}/9 Stars</span>
              </div>

              <div className="pt-2 text-right">
                <button
                  onClick={() => setInspectingSub(null)}
                  className="px-4 py-2 bg-slate-900 border border-slate-700 text-slate-300 rounded-lg"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
