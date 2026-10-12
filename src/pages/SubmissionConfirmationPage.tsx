import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { bureauStore } from '../lib/store';
import confetti from 'canvas-confetti';
import { 
  Trophy, 
  ShieldCheck, 
  Award, 
  Clock, 
  User, 
  Building, 
  Users, 
  CheckCircle, 
  RotateCcw,
  Zap,
  Lock,
  Sparkles,
  Key
} from 'lucide-react';

export const SubmissionConfirmationPage: React.FC = () => {
  const { ref } = useParams<{ id?: string; ref?: string }>();
  const submission = ref ? bureauStore.getSubmissionByRef(ref) : bureauStore.getSubmissions()[0];

  useEffect(() => {
    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 }
      });
    } catch (e) {
      // silent
    }
  }, []);

  if (!submission) {
    return (
      <div className="text-center py-12 text-slate-400">
        <p>No active certification record located.</p>
        <Link to="/" className="text-cyan-400 underline text-xs mt-2 inline-block">Return to Hub</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-4">
      {/* Container matching Page 8: CHIEF INSPECTOR STANDING */}
      <div className="rounded-2xl border border-sky-900/60 bg-[#0c1322] p-6 sm:p-10 space-y-8 shadow-2xl text-center relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-cyan-500/10 blur-3xl pointer-events-none" />

        {/* Top Commendation Badge matching Page 8 */}
        <div className="space-y-3 relative z-10">
          <span className="text-[11px] font-mono uppercase tracking-widest px-3 py-1 rounded bg-sky-950 text-cyan-300 border border-sky-800 font-bold inline-block">
            BUREAU COMMENDATION // CASE CLOSED
          </span>

          <h1 className="text-3xl sm:text-5xl font-black text-amber-300 font-mono tracking-tight drop-shadow-[0_0_20px_rgba(251,191,36,0.4)]">
            CHIEF INSPECTOR STANDING
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            "Outstanding forensic excellence, Agent. You have successfully solved all published case files, pierced criminal syndicate encryption, and preserved international security."
          </p>
        </div>

        {/* Global Bureau Rank #1 Card matching Page 8 */}
        <div className="w-48 mx-auto p-4 rounded-2xl border border-sky-700/60 bg-[#070e1c] shadow-[0_0_25px_rgba(56,189,248,0.2)] space-y-1">
          <div className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">
            GLOBAL BUREAU RANK
          </div>
          <div className="text-3xl font-black font-mono text-cyan-400 tracking-wider">
            #1
          </div>
        </div>

        {/* 4 Metric Columns matching Page 8 */}
        {(() => {
          // Accurately calculate total stars and points across all completed levels
          const computedTotalStars = 
            (typeof submission.totalStarsEarned === 'number' && submission.totalStarsEarned > 0)
              ? submission.totalStarsEarned
              : (submission.easyStars || 0) + (submission.mediumStars || 0) + (submission.hardStars || 0);

          const computedTotalScore =
            (typeof submission.totalScoreEarned === 'number' && submission.totalScoreEarned > 0)
              ? submission.totalScoreEarned
              : (submission.easyScore || 0) + (submission.mediumScore || 0) + (submission.hardScore || 0);

          return (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center border-y border-slate-800/80 py-4 font-mono">
                <div className="p-2 rounded-xl bg-slate-900/40 border border-slate-800/80">
                  <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                    <Award className="w-3.5 h-3.5 text-amber-400" />
                    <span>TOTAL STARS</span>
                  </div>
                  <div className="text-2xl font-black text-amber-300 mt-0.5">{computedTotalStars} ★</div>
                  <div className="text-[10px] text-slate-500 font-mono">Max 9 Stars</div>
                </div>

                <div className="p-2 rounded-xl bg-slate-900/40 border border-slate-800/80">
                  <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                    <Trophy className="w-3.5 h-3.5 text-cyan-400" />
                    <span>TOTAL POINTS</span>
                  </div>
                  <div className="text-2xl font-black text-slate-100 mt-0.5">{computedTotalScore} / {submission.totalAttemptedPossible || 9}</div>
                  <div className="text-[10px] text-cyan-400/80 font-mono">{submission.accuracy || 100}% Accuracy</div>
                </div>

                <div className="p-2 rounded-xl bg-slate-900/40 border border-slate-800/80">
                  <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-emerald-400" />
                    <span>TIME SAVED</span>
                  </div>
                  <div className="text-2xl font-black text-emerald-400 mt-0.5">+{submission.timeSavedSeconds || 109}s</div>
                  <div className="text-[10px] text-emerald-500/80 font-mono">Speed Bonus</div>
                </div>

                <div className="p-2 rounded-xl bg-slate-900/40 border border-slate-800/80">
                  <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>TIME SPENT</span>
                  </div>
                  <div className="text-2xl font-black text-slate-100 mt-0.5">{submission.timeElapsedSeconds || 26}s</div>
                  <div className="text-[10px] text-slate-500 font-mono">Deduction Pace</div>
                </div>
              </div>

              {/* Comprehensive Stage Clearance Breakdown (All Levels Calculated) */}
              <div className="p-4 rounded-xl border border-sky-900/50 bg-[#080f1e] text-left font-mono space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[11px] uppercase tracking-wider text-cyan-400 font-bold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>All Investigation Stages Star Breakdown</span>
                  </span>
                  <span className="text-[11px] text-amber-300 font-bold">
                    Combined Star Rating: {computedTotalStars} / 9 Stars
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                  {/* Easy Stage */}
                  <div className="p-2.5 rounded-lg border border-slate-800 bg-[#060b16] flex items-center justify-between">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400">STAGE 1: EASY</div>
                      <div className="text-slate-200 font-semibold text-xs mt-0.5">
                        Score: {submission.easyScore ?? 3} / 3
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-black text-amber-300">
                        {submission.easyStars ?? 3} ★
                      </span>
                    </div>
                  </div>

                  {/* Medium Stage */}
                  <div className="p-2.5 rounded-lg border border-slate-800 bg-[#060b16] flex items-center justify-between">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400">STAGE 2: MEDIUM</div>
                      <div className="text-slate-200 font-semibold text-xs mt-0.5">
                        Score: {submission.mediumScore ?? 3} / 3
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-black text-amber-300">
                        {submission.mediumStars ?? 3} ★
                      </span>
                    </div>
                  </div>

                  {/* Hard Stage */}
                  <div className="p-2.5 rounded-lg border border-slate-800 bg-[#060b16] flex items-center justify-between">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400">STAGE 3: HARD</div>
                      <div className="text-slate-200 font-semibold text-xs mt-0.5">
                        Score: {submission.hardScore ?? 3} / 3
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-black text-amber-300">
                        {submission.hardStars ?? 3} ★
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Participant Clearance Certificate matching Page 8 */}
        <div className="text-left rounded-2xl border border-sky-800/70 bg-[#070e1c] p-6 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold">
                OFFICIAL COLLEGE SYMPOSIUM ACCREDITATION
              </div>
              <h2 className="text-lg font-bold text-slate-100 font-mono">
                Participant Clearance Certificate
              </h2>
            </div>

            <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold self-start sm:self-center">
              PERSISTED IN DATABASE
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
            <div>
              <span className="text-[10px] text-slate-500 uppercase">CANDIDATE NAME</span>
              <div className="font-bold text-slate-200 mt-0.5 flex items-center gap-1">
                <User className="w-3 h-3 text-cyan-400" />
                <span>{submission.playerName}</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 uppercase">REGISTER NUMBER</span>
              <div className="font-bold text-slate-200 mt-0.5">
                {submission.registerNumber || '21CS041'}
              </div>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 uppercase">COLLEGE / INSTITUTION</span>
              <div className="font-bold text-slate-200 mt-0.5 flex items-center gap-1">
                <Building className="w-3 h-3 text-cyan-400" />
                <span>{submission.collegeName || 'National Tech'}</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 uppercase">TEAM DESIGNATION</span>
              <div className="font-bold text-slate-200 mt-0.5 flex items-center gap-1">
                <Users className="w-3 h-3 text-cyan-400" />
                <span>{submission.teamName || 'BinarySolvers'}</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] font-mono text-slate-400">
            <div>
              Reference Token: <strong className="text-slate-200 font-mono">{submission.submissionRef}</strong>
            </div>
            <div>
              Recorded: {new Date(submission.submittedAt).toLocaleTimeString()}
            </div>
          </div>
        </div>

        {/* Bureau Honors & Badges matching Page 8 */}
        <div className="text-left space-y-3">
          <div className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-400" />
            <span>Bureau Honors & Badges</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
            <div className="p-3.5 rounded-xl border border-slate-800 bg-[#080d19] flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-sky-950 border border-sky-800 flex items-center justify-center text-cyan-400 shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-slate-200">Cyber Vanguard</div>
                <div className="text-[10px] text-slate-500">Solved the Apex Codec heist</div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-800 bg-[#080d19] flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-sky-950 border border-sky-800 flex items-center justify-center text-cyan-400 shrink-0">
                <Key className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-slate-200">Master Cryptographer</div>
                <div className="text-[10px] text-slate-500">Decoded Blackwood study cipher</div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-800 bg-[#080d19] flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-sky-950 border border-sky-800 flex items-center justify-center text-cyan-400 shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-slate-200">Syndicate Nemesis</div>
                <div className="text-[10px] text-slate-500">Neutralized Chamber 7 deep vault</div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-amber-900/60 bg-amber-950/20 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-950 border border-amber-700 flex items-center justify-center text-amber-400 shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-amber-300">Supersonic Deduction</div>
                <div className="text-[10px] text-amber-500">Saved over 30 seconds of time</div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button matching Page 8 */}
        <div className="pt-4">
          <Link
            to="/"
            className="w-full py-3.5 px-6 rounded-xl cyber-glow-btn text-xs font-bold uppercase tracking-wider inline-flex items-center justify-center gap-2 shadow-xl"
          >
            <RotateCcw className="w-4 h-4" />
            <span>FINISH ALL CASES & RESTART GAME TO BEGINNING</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
