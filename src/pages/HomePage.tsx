import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { bureauStore } from '../lib/store';
import { DossierCard, CaseStamp } from '../components/common/DossierCard';
import { StarRating } from '../components/common/StarRating';
import { 
  Fingerprint, 
  ChevronRight, 
  Clock, 
  ShieldAlert, 
  Cpu, 
  FolderLock,
  Layers,
  Sparkles
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [cases, setCases] = useState(bureauStore.getCases());

  React.useEffect(() => {
    const handleDataUpdate = () => {
      setCases(bureauStore.getCases());
    };
    window.addEventListener('bureau-data-updated', handleDataUpdate);
    bureauStore.loadFromFirebase().then(() => setCases(bureauStore.getCases()));
    return () => window.removeEventListener('bureau-data-updated', handleDataUpdate);
  }, []);

  return (
    <div className="space-y-10 max-w-5xl mx-auto py-2">
      {/* Top Banner Matching Screenshot (Page 1): INFO XTREME 26 // CYBER CRIME BUREAU */}
      <div className="flex flex-col items-center text-center space-y-4">
        {/* Glowing Cyber Crime Bureau Poster Graphic */}
        <div className="relative w-full max-w-xl rounded-2xl overflow-hidden border border-cyan-500/40 bg-gradient-to-b from-sky-950/80 via-[#0a1428] to-[#050813] p-8 shadow-[0_0_35px_rgba(6,182,212,0.25)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(14,165,233,0.15),transparent_70%)] pointer-events-none" />
          
          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-sky-950 border-2 border-cyan-400 text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.6)] mx-auto">
              <Cpu className="w-8 h-8" />
            </div>

            <div>
              <div className="text-2xl sm:text-3xl font-black font-mono tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-400">
                INFO XTREME 26
              </div>
              <div className="text-xs font-mono tracking-[0.3em] text-cyan-400/90 font-bold uppercase mt-0.5">
                CODE HEIST
              </div>
            </div>

            <div className="pt-2">
              <span className="inline-block px-3 py-1 rounded-full text-[11px] font-mono text-cyan-300/80 bg-sky-950/90 border border-sky-800">
                CODE HEIST // FORENSIC CRIME BUREAU
              </span>
            </div>
          </div>
        </div>

        {/* Heading & Subtitle matching Screenshot */}
        <div className="space-y-2 pt-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-100 tracking-tight">
            Choose a case file
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
            Select an active criminal investigation below. Review case exhibits, analyze forensic posters, decrypt rogue data, and submit your official team score.
          </p>
        </div>
      </div>

      {/* Case File Cards Grid */}
      {cases.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {cases.map((c) => (
            <div
              key={c.id}
              className="rounded-2xl border border-sky-900/60 bg-[#0c1322] p-6 space-y-6 shadow-xl hover:border-cyan-500/50 hover:shadow-[0_0_25px_rgba(6,182,212,0.2)] transition-all flex flex-col justify-between"
            >
              {/* Top Badges */}
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                  <span className="text-[11px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/60 font-semibold">
                    {c.badgeTag || 'CYBER FORENSICS'}
                  </span>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-semibold">
                    {c.subTag || 'Active Tournament'}
                  </span>
                </div>

                {/* Fingerprint Emblem */}
                <div className="w-12 h-12 rounded-xl bg-sky-950/70 border border-sky-600/40 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(56,189,248,0.25)]">
                  <Fingerprint className="w-6 h-6" />
                </div>

                {/* Title & Acronym matching Page 1 */}
                <div>
                  <h2 className="text-xl font-black text-slate-100 font-mono tracking-wide">
                    {c.caseCode}
                  </h2>
                  <div className="text-xs font-mono text-cyan-400 uppercase tracking-widest font-semibold">
                    {c.acronym || c.title}
                  </div>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  {c.summary}
                </p>

                {/* Footer specs */}
                <div className="flex items-center justify-between text-xs font-mono text-slate-400 pt-2 border-t border-slate-800/60">
                  <span>Stages: <strong>3 Levels</strong></span>
                  <span>Est: <strong>{c.estimatedMinutes || 15} Mins</strong></span>
                </div>
              </div>

              {/* Select Case Button (Page 1) */}
              <div className="pt-2">
                <button
                  onClick={() => navigate(`/case/${c.id}/rules`)}
                  className="w-full py-3 px-4 rounded-xl cyber-glow-btn text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <span>SELECT CASE & VIEW RULES</span>
                  <ChevronRight className="w-4 h-4 stroke-[3]" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-sky-900/60 bg-[#0c1322] p-8 text-center space-y-4 max-w-xl mx-auto font-mono shadow-2xl">
          <FolderLock className="w-10 h-10 text-cyan-400 mx-auto" />
          <h2 className="text-lg font-bold text-slate-100">No Active Case Files</h2>
          <p className="text-xs text-slate-400 font-sans leading-relaxed">
            All sample data has been cleared. Go to Admin Portal to configure or import new case files.
          </p>
          <button
            onClick={() => navigate('/admin')}
            className="py-2.5 px-5 rounded-xl cyber-glow-btn text-xs font-bold uppercase tracking-wider cursor-pointer"
          >
            Go to Admin Portal
          </button>
        </div>
      )}
    </div>
  );
};
