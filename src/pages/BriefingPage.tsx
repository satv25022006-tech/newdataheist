import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { bureauStore } from '../lib/store';
import { CaseTarget, CaseItem } from '../types';
import { 
  ChevronLeft, 
  Play, 
  Clock, 
  Crosshair, 
  Radio
} from 'lucide-react';

export const BriefingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [caseItem, setCaseItem] = useState<CaseItem | undefined>(() => 
    id ? bureauStore.getCaseById(id) : bureauStore.getCases()[0]
  );

  const [briefingTimeLeft, setBriefingTimeLeft] = useState(caseItem?.briefingTimerSeconds || 180);

  useEffect(() => {
    const current = id ? bureauStore.getCaseById(id) : bureauStore.getCases()[0];
    if (current) {
      setCaseItem(current);
      setBriefingTimeLeft(current.briefingTimerSeconds || 180);
    }
  }, [id]);

  useEffect(() => {
    if (briefingTimeLeft <= 0) return;
    const interval = setInterval(() => {
      setBriefingTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [briefingTimeLeft]);

  const handlePlayGame = () => {
    if (caseItem) {
      navigate(`/case/${caseItem.id}/levels`);
    } else {
      navigate('/');
    }
  };

  const targets = caseItem?.targets && caseItem.targets.length === 3 ? caseItem.targets : [
    {
      id: 'target-1',
      label: 'TARGET 1: EVIDENCE',
      description: 'Inspect forensic posters, network topologies, and evidence frames.',
    },
    {
      id: 'target-2',
      label: 'TARGET 2: DECRYPTION',
      description: 'Detect cloned RFID badges, spectral toxins, and rogue payloads.',
    },
    {
      id: 'target-3',
      label: 'TARGET 3: NEUTRALIZE',
      description: 'Disarm laser arrays and intercept the getaway craft before extraction.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-2">
      {/* Top Breadcrumb */}
      <div>
        <Link
          to={caseItem ? `/case/${caseItem.id}/rules` : '/rules-guide'}
          className="inline-flex items-center gap-1.5 text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Rules and Regulations</span>
        </Link>
      </div>

      {/* Main Briefing Container */}
      <div className="rounded-2xl border border-sky-900/60 bg-[#0c1322] p-6 sm:p-8 space-y-6 shadow-2xl">
        {/* Top Header Split: Case Info on Left, Live Countdown Box on Right */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 border-b border-slate-800/80 pb-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/60 font-semibold">
                {caseItem?.badgeTag || 'CYBER FORENSICS'}
              </span>
              <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-semibold">
                {caseItem?.subTag || 'Active Tournament'}
              </span>
            </div>

            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-100 font-mono tracking-wide">
                {caseItem?.caseCode}
              </h1>
              <div className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-widest mt-1">
                OPERATION BRIEFING // {caseItem?.acronym || 'jw'}
              </div>
            </div>
          </div>

          {/* Right Live Briefing Countdown Box */}
          <div className="w-full md:w-64 p-4 rounded-xl border border-sky-600/40 bg-[#070e1c] space-y-2.5 shadow-[0_0_15px_rgba(56,189,248,0.15)]">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span className="flex items-center gap-1 text-cyan-400 font-bold">
                <Clock className="w-3.5 h-3.5" /> BRIEFING TIMER: {caseItem?.briefingTimerSeconds || 180}S
              </span>
            </div>

            <div className="font-mono text-2xl font-black text-cyan-300 tracking-wider">
              00:{briefingTimeLeft.toString().padStart(3, '0')} <span className="text-xs text-slate-400 font-normal">({briefingTimeLeft}s)</span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-sky-400 to-cyan-400 h-full transition-all duration-300"
                style={{ width: `${(briefingTimeLeft / (caseItem?.briefingTimerSeconds || 180)) * 100}%` }}
              />
            </div>

            <div className="text-[10px] font-mono text-slate-500 pt-0.5">
              Auto-start: game open countdown expiry
            </div>
          </div>
        </div>

        {/* Mission Briefing & Incident Synopsis Box */}
        <div className="space-y-2">
          <div className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5" />
            <span>MISSION BRIEFING &amp; INCIDENT SYNOPSIS</span>
          </div>

          <div className="p-4 rounded-xl border border-slate-800 bg-[#080d19] text-sm text-slate-300 leading-relaxed whitespace-pre-line">
            {caseItem?.incidentDescription || 'Analyze digital and physical artifacts to solve the bureau case.'}
          </div>
        </div>

        {/* 3 Targets Cards Grid */}
        <div className="space-y-2">
          <div className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
            INVESTIGATION TARGET STAGES
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {targets.map((tgt) => (
              <div
                key={tgt.id}
                className="p-4 rounded-xl border border-slate-800 bg-[#080d19] space-y-1.5 hover:border-sky-800 transition-colors"
              >
                <div className="text-xs font-mono font-bold text-cyan-400 flex items-center gap-1.5">
                  <Crosshair className="w-3.5 h-3.5" />
                  <span>{tgt.label}</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {tgt.description}
                </p>
              </div>
            ))}
          </div>
        </div>



        {/* Bottom Action Strip */}
        <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs font-mono text-slate-400">
            Target Stages: <span className="text-slate-200">3 Investigation Levels (Easy, Medium, Hard)</span>
          </div>

          <button
            onClick={handlePlayGame}
            className="w-full sm:w-auto py-3 px-8 rounded-xl cyber-glow-btn text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>PLAY GAME</span>
          </button>
        </div>
      </div>
    </div>
  );
};
