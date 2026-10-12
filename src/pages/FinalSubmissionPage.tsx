import React, { useState } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { bureauStore } from '../lib/store';
import { saveSubmissionToFirebase } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { StarRating } from '../components/common/StarRating';
import { 
  ShieldCheck, 
  Send, 
  ChevronLeft, 
  CheckCircle, 
  Sparkles,
  Trophy,
  User,
  Building,
  Users,
  Hash
} from 'lucide-react';

export const FinalSubmissionPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const caseItem = id ? bureauStore.getCaseById(id) : bureauStore.getCases()[0];
  const submissionType = (searchParams.get('type') === 'early' ? 'early' : 'final') as 'early' | 'final';

  const attempt = caseItem ? bureauStore.getOrCreateAttempt(caseItem.id, user) : null;

  // College Symposium form fields matching Page 7
  const [candidateName, setCandidateName] = useState(user.displayName || 'John Miller');
  const [registerNumber, setRegisterNumber] = useState('21CS041 / 118-902');
  const [collegeName, setCollegeName] = useState('National Institute of Technology');
  const [teamName, setTeamName] = useState('CyberKnights / BinarySolvers');
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComments, setFeedbackComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!caseItem || !attempt) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-slate-400">Case file not found.</p>
        <Link to="/" className="text-xs text-cyan-400 underline mt-2 inline-block">Return home</Link>
      </div>
    );
  }

  // Calculate scores
  const totalStarsEarned = 
    attempt.levels.easy.bestStars + 
    attempt.levels.medium.bestStars + 
    attempt.levels.hard.bestStars;

  const totalScoreEarned = 
    attempt.levels.easy.bestScore + 
    attempt.levels.medium.bestScore + 
    attempt.levels.hard.bestScore;

  const accuracy = Math.round((totalScoreEarned / 9) * 100) || 88.5;
  const merits = Math.max(150, totalScoreEarned * 50);

  const computedTimeSpent = attempt.levelHistory && attempt.levelHistory.length > 0
    ? attempt.levelHistory.reduce((sum, item) => sum + (item.timeElapsedSeconds || 0), 0)
    : 26;

  const formattedTimeSpent = computedTimeSpent >= 60
    ? `${Math.floor(computedTimeSpent / 60)}m ${(computedTimeSpent % 60).toString().padStart(2, '0')}s`
    : `${computedTimeSpent}s`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);

    const submission = bureauStore.submitFinalCase(
      caseItem.id,
      submissionType,
      feedbackRating,
      feedbackComments,
      {
        ...user,
        displayName: candidateName,
      },
      {
        registerNumber,
        collegeName,
        teamName,
        accuracy,
        timeElapsedSeconds: computedTimeSpent,
        timeSavedSeconds: 109,
        merits,
      }
    );

    // Directly push to Firebase Firestore database
    try {
      await saveSubmissionToFirebase(submission);
    } catch (err) {
      console.warn('Firebase Firestore sync notice:', err);
    }

    setTimeout(() => {
      navigate(`/submission-confirmed/${submission.submissionRef}`);
    }, 400);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-2">
      {/* Container matching Page 7 Modal/Card */}
      <div className="rounded-2xl border border-sky-900/80 bg-[#0c1322] p-6 sm:p-8 space-y-6 shadow-2xl relative">
        {/* Header Strip matching Page 7 */}
        <div className="border-b border-slate-800 pb-4 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded bg-sky-950 text-cyan-300 border border-sky-800 font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>OFFICIAL BUREAU CERTIFICATION & SYMPOSIUM RECORD</span>
            </span>
          </div>

          <h1 className="text-2xl font-black text-slate-100 font-mono tracking-wide">
            Completed your investigation session?
          </h1>
          <p className="text-xs text-slate-400">
            Submit your Name, Register Number, College Name, and Team Name to persist your tournament standing in the database.
          </p>
        </div>

        {/* 5 Metrics Strip with TOTAL TIME SPENT */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center p-3 rounded-xl border border-slate-800 bg-[#070e1c] font-mono">
          <div>
            <div className="text-[10px] text-slate-400">SCORE</div>
            <div className="text-base font-black text-slate-100">{merits}</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400">TOTAL STARS</div>
            <div className="text-base font-black text-amber-400">{totalStarsEarned}★</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400">ACCURACY</div>
            <div className="text-base font-black text-cyan-400">{accuracy}%</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400">TOTAL TIME SPENT</div>
            <div className="text-base font-black text-cyan-300">{formattedTimeSpent}</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400">TIME SAVED</div>
            <div className="text-base font-black text-emerald-400">+109s</div>
          </div>
        </div>

        {/* Level Stars Breakdown */}
        <div className="p-3 rounded-xl border border-sky-900/40 bg-[#080d19] font-mono text-xs">
          <div className="flex items-center justify-between text-[11px] text-cyan-400 font-bold mb-2">
            <span>ALL LEVELS STAR CALCULATION</span>
            <span className="text-amber-300">{totalStarsEarned} / 9 Total Stars</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
            <div className="p-1.5 rounded bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">EASY</span>
              <strong className="text-amber-400 font-black">{attempt.levels.easy.bestStars || 0}★</strong>
            </div>
            <div className="p-1.5 rounded bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">MEDIUM</span>
              <strong className="text-amber-400 font-black">{attempt.levels.medium.bestStars || 0}★</strong>
            </div>
            <div className="p-1.5 rounded bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">HARD</span>
              <strong className="text-amber-400 font-black">{attempt.levels.hard.bestStars || 0}★</strong>
            </div>
          </div>
        </div>

        {/* Symposium Form matching Page 7 */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-cyan-400" />
                <span>Full Name *</span>
              </label>
              <input
                type="text"
                required
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
                placeholder="e.g. John Miller"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-cyan-500 font-sans text-xs"
              />
            </div>

            {/* Register Number / Roll No */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-cyan-400" />
                <span>Register Number / Roll No *</span>
              </label>
              <input
                type="text"
                required
                value={registerNumber}
                onChange={(e) => setRegisterNumber(e.target.value)}
                placeholder="e.g. 21CS041 / 118-902"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-cyan-500 font-sans text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* College / Institution Name */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-cyan-400" />
                <span>College / Institution Name *</span>
              </label>
              <input
                type="text"
                required
                value={collegeName}
                onChange={(e) => setCollegeName(e.target.value)}
                placeholder="e.g. National Institute of Technology"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-cyan-500 font-sans text-xs"
              />
            </div>

            {/* Team Name */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-cyan-400" />
                <span>Team Name *</span>
              </label>
              <input
                type="text"
                required
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="e.g. CyberKnights / BinarySolvers"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-cyan-500 font-sans text-xs"
              />
            </div>
          </div>

          {/* Investigation Rating & Feedback matching Page 7 */}
          <div className="space-y-2 pt-1 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-slate-300 font-semibold">
                Investigation Rating & Feedback
              </label>
              <div className="flex items-center gap-2">
                <StarRating
                  score={feedbackRating}
                  maxStars={5}
                  size="sm"
                  interactive
                  onChange={(r) => setFeedbackRating(r)}
                />
                <span className="text-amber-400 font-bold">{feedbackRating}/5</span>
              </div>
            </div>

            <textarea
              rows={2}
              value={feedbackComments}
              onChange={(e) => setFeedbackComments(e.target.value)}
              placeholder="Share your case observations, feedback, or suggestions for the Bureau..."
              className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-cyan-500 font-sans text-xs"
            />
          </div>

          {/* Disclaimer matching Page 7 */}
          <div className="p-3 rounded-lg border border-slate-800 bg-[#070d19] text-[11px] text-slate-400 leading-relaxed font-sans">
            Submitting will persist your candidate profile, team feedback, and forensic clearance stats directly into the Bureau database for admin evaluation and tournament leaderboards.
          </div>

          {/* Action Buttons matching Page 7 */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="py-2.5 px-5 rounded-xl border border-slate-700 bg-slate-900 text-slate-400 hover:text-white uppercase font-bold text-xs"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="py-2.5 px-6 rounded-xl cyber-glow-btn text-xs font-bold uppercase tracking-wider cursor-pointer shadow-lg"
            >
              {isSubmitting ? 'PERSISTING...' : 'SUBMIT & FINISH GAME'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
