import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { bureauStore } from '../lib/store';
import { DossierCard, CaseStamp } from '../components/common/DossierCard';
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Globe, 
  ShieldCheck, 
  FileText,
  AlertCircle
} from 'lucide-react';

export const RulesPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const caseItem = id ? bureauStore.getCaseById(id) : bureauStore.getCases()[0];

  const [ruleCountdown, setRuleCountdown] = useState(30);

  useEffect(() => {
    if (ruleCountdown <= 0) return;
    const timer = setInterval(() => {
      setRuleCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [ruleCountdown]);

  const handleNext = () => {
    if (caseItem) {
      navigate(`/case/${caseItem.id}/briefing`);
    } else {
      navigate('/');
    }
  };

  const rulesList = [
    {
      number: 'Rule 1',
      title: 'Time limit for Rules & Regulations is 120s',
      detail: 'Investigators must review protocol directives before proceeding to operational briefing.',
    },
    {
      number: 'Rule 2',
      title: 'Easy stage is open immediately; earn 2 stars to unlock Medium',
      detail: 'Higher clearance stages remain locked until satisfactory investigative accuracy is proven.',
    },
    {
      number: 'Rule 3',
      title: 'Each question has a strict countdown timer and auto-closes on timeout',
      detail: 'Responses must be confirmed before the clock reaches zero or deduction defaults.',
    },
    {
      number: 'Rule 4',
      title: 'Upon completing all levels, submit college team credentials for the official symposium record',
      detail: 'Candidate name, roll number, college name, and team designation are required for persistence.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-2">
      {/* Breadcrumb matching Page 2: <- Choose a Different Case File */}
      <div>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Choose a Different Case File</span>
        </Link>
      </div>

      {/* Main Container matching Page 2 */}
      <div className="rounded-2xl border border-sky-900/60 bg-[#0c1322] p-6 sm:p-8 space-y-6 shadow-2xl">
        {/* Header Strip with Language Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-800/80 pb-5">
          <div className="space-y-1">
            <span className="text-[11px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded bg-sky-950 text-cyan-300 border border-sky-800 font-semibold inline-block">
              OFFICIAL BUREAU PROTOCOLS
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-100 font-mono tracking-wide pt-1">
              RULES AND REGULATIONS
            </h1>
            <div className="text-xs font-mono text-slate-400">
              ACTIVE CASE DOSSIER: <span className="text-cyan-400 font-bold">{caseItem?.caseCode}</span>
            </div>
          </div>

          {/* Right Language Badge matching Page 2 */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-950/80 text-xs font-mono text-slate-300">
            <Globe className="w-3.5 h-3.5 text-sky-400" />
            <span className="text-slate-500">RESPECTIVE LANGUAGE:</span>
            <span className="text-cyan-400 font-semibold">ENGLISH (EN)</span>
          </div>
        </div>

        {/* Numbered Rule Cards matching Page 2 */}
        <div className="space-y-3">
          {rulesList.map((r) => (
            <div
              key={r.number}
              className="p-4 rounded-xl border border-slate-800 bg-[#080d19] flex items-start gap-3.5 hover:border-slate-700 transition-colors"
            >
              <div className="w-7 h-7 rounded-lg bg-sky-950 border border-sky-700/60 flex items-center justify-center text-cyan-400 font-mono text-xs font-bold shrink-0">
                <FileText className="w-3.5 h-3.5" />
              </div>
              <div className="space-y-0.5">
                <div className="text-xs font-mono font-bold text-cyan-400 uppercase">
                  {r.number}
                </div>
                <div className="text-sm font-semibold text-slate-200">
                  {r.title}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Action Strip matching Page 2 */}
        <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs font-mono text-slate-400">
            Next Protocol: <span className="text-slate-200">Mission Briefing & Incident Synopsis ({ruleCountdown}s)</span>
          </div>

          <button
            onClick={handleNext}
            className="w-full sm:w-auto py-3 px-6 rounded-xl cyber-glow-btn text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg"
          >
            <span>NEXT: MISSION BRIEFING & INCIDENT SYNOPSIS ({ruleCountdown}S)</span>
            <ChevronRight className="w-4 h-4 stroke-[3]" />
          </button>
        </div>
      </div>
    </div>
  );
};
