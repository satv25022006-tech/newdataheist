import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { bureauStore } from '../lib/store';
import { useAuth } from '../context/AuthContext';
import { DifficultyLevel } from '../types';
import { StarRating } from '../components/common/StarRating';
import { 
  ChevronLeft, 
  Search, 
  Cpu, 
  Flame, 
  Play, 
  Lock, 
  Unlock,
  AlertCircle
} from 'lucide-react';

export const LevelSelectionPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const caseItem = id ? bureauStore.getCaseById(id) : bureauStore.getCases()[0];

  const [attempt] = useState(() => {
    if (!caseItem) return null;
    return bureauStore.getOrCreateAttempt(caseItem.id, user);
  });

  if (!caseItem || !attempt) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-slate-400">Case file not found.</p>
        <Link to="/" className="text-xs text-cyan-400 underline mt-2 inline-block">Return home</Link>
      </div>
    );
  }

  // Authoritative server-side unlock checks
  const isEasyUnlocked = bureauStore.isLevelUnlocked(caseItem.id, 'easy', user.id);
  const isMediumUnlocked = bureauStore.isLevelUnlocked(caseItem.id, 'medium', user.id);
  const isHardUnlocked = bureauStore.isLevelUnlocked(caseItem.id, 'hard', user.id);

  const tiers = [
    {
      level: 'easy' as DifficultyLevel,
      title: 'EASY',
      icon: Search,
      iconColor: 'text-cyan-400',
      unlocked: isEasyUnlocked,
      unlockNotice: 'Initial Stage',
      progress: attempt.levels.easy,
    },
    {
      level: 'medium' as DifficultyLevel,
      title: 'MEDIUM',
      icon: Cpu,
      iconColor: 'text-amber-400',
      unlocked: isMediumUnlocked,
      unlockNotice: 'Earn 2 stars on Easy',
      progress: attempt.levels.medium,
    },
    {
      level: 'hard' as DifficultyLevel,
      title: 'HARD',
      icon: Flame,
      iconColor: 'text-rose-400',
      unlocked: isHardUnlocked,
      unlockNotice: 'Earn 2 stars on Medium',
      progress: attempt.levels.hard,
    },
  ];

  const handleStartLevel = (level: DifficultyLevel, unlocked: boolean) => {
    if (!unlocked) return;
    navigate(`/case/${caseItem.id}/investigate/${level}`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-2">
      {/* Top Breadcrumb matching Page 4 */}
      <div className="flex items-center justify-between text-xs font-mono">
        <Link
          to={`/case/${caseItem.id}/briefing`}
          className="inline-flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Mission Briefing</span>
        </Link>

        <span className="text-slate-400">
          Active Case: <strong className="text-cyan-400">{caseItem.caseCode}</strong>
        </span>
      </div>

      {/* Centered Heading & Subtitle matching Page 4 */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl sm:text-4xl font-black text-slate-100 font-mono tracking-wide">
          Choose a case file
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
          Select your difficulty clearance tier. Clear questions accurately and swiftly to unlock higher stages.
        </p>
      </div>

      {/* 3 Tier Cards matching Page 4 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        {tiers.map((tier) => {
          const Icon = tier.icon;
          const starsEarned = tier.progress.bestStars || 0;

          return (
            <div
              key={tier.level}
              className={`rounded-2xl border p-6 flex flex-col items-center text-center justify-between transition-all space-y-6 ${
                tier.unlocked
                  ? 'border-sky-800/80 bg-[#0c1322] shadow-[0_0_20px_rgba(2,132,199,0.15)] hover:border-cyan-500/60'
                  : 'border-slate-800/70 bg-[#070b16] opacity-75'
              }`}
            >
              {/* Icon & Title */}
              <div className="space-y-4 w-full">
                <div className="w-14 h-14 rounded-2xl bg-sky-950/60 border border-slate-700 flex items-center justify-center mx-auto">
                  <Icon className={`w-7 h-7 ${tier.iconColor}`} />
                </div>

                <div>
                  <h3 className="text-xl font-black font-mono tracking-wider text-slate-100">
                    {tier.title}
                  </h3>
                  <div className="pt-2">
                    <StarRating score={starsEarned} maxStars={3} size="md" />
                  </div>
                  <div className="text-xs font-mono text-slate-400 mt-2">
                    3 Questions
                  </div>
                </div>
              </div>

              {/* Action Button matching Page 4 */}
              <div className="w-full pt-4">
                {tier.unlocked ? (
                  <button
                    onClick={() => handleStartLevel(tier.level, true)}
                    className="w-full py-2.5 px-4 rounded-xl cyber-glow-btn text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>PLAY</span>
                  </button>
                ) : (
                  <button
                    disabled
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-500 text-xs font-bold uppercase tracking-wider flex flex-col items-center justify-center gap-0.5 cursor-not-allowed"
                  >
                    <div className="flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-slate-500" />
                      <span>LOCKED</span>
                    </div>
                    <span className="text-[10px] text-slate-600 font-mono lowercase">
                      {tier.unlockNotice}
                    </span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
