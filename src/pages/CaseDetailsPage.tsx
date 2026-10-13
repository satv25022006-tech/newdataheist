import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { bureauStore } from '../lib/store';
import { CaseStamp } from '../components/common/DossierCard';
import { 
  FileText, 
  ArrowRight, 
  Users, 
  Fingerprint, 
  Clock, 
  ChevronLeft
} from 'lucide-react';

export const CaseDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const caseItem = bureauStore.getCaseById(id || '');

  const [activeTab, setActiveTab] = useState<'overview' | 'suspects' | 'evidence'>('overview');

  if (!caseItem) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-100 font-mono">Case Dossier Not Found</h2>
        <p className="text-xs text-slate-400 font-mono">The requested case code does not exist in the active archives.</p>
        <Link to="/" className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-400 hover:underline">
          <ChevronLeft className="w-4 h-4" /> Return to Case Index
        </Link>
      </div>
    );
  }

  const evidenceList = bureauStore.getEvidenceForCase(caseItem.id);
  const suspectList = bureauStore.getSuspectsForCase(caseItem.id);

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-2 font-mono text-slate-100">
      {/* Top Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <Link to="/" className="hover:text-cyan-400 transition-colors">
          Archives
        </Link>
        <span>/</span>
        <span className="text-cyan-400 font-bold">{caseItem.caseCode}</span>
        <span>/</span>
        <span className="text-slate-200">Case File Details</span>
      </div>

      {/* Main Dossier Header */}
      <div className="rounded-2xl border border-sky-900/60 bg-[#0c1322] p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <CaseStamp label={caseItem.caseCode} variant="active" />
              <span className="text-xs text-slate-400 uppercase tracking-wider">CLASSIFIED INVESTIGATION</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-wide">
              {caseItem.title}
            </h1>
            <div className="text-xs text-slate-400 flex items-center gap-3 pt-1">
              <span>Category: <strong className="text-slate-200">{caseItem.category}</strong></span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                {caseItem.timeLimitSeconds > 0 ? `${caseItem.timeLimitSeconds}s Timer` : 'Untimed'}
              </span>
              <span>·</span>
              <span>3 Tiers (Easy · Med · Hard)</span>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <button
              onClick={() => navigate(`/case/${caseItem.id}/rules`)}
              className="py-3 px-6 rounded-xl cyber-glow-btn text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg"
            >
              <span>Start Case File</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl max-w-md border border-slate-800">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-1.5 px-3 text-xs font-bold rounded-lg transition-colors ${
              activeTab === 'overview'
                ? 'bg-cyan-500 text-slate-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Incident Overview
          </button>
          <button
            onClick={() => setActiveTab('suspects')}
            className={`flex-1 py-1.5 px-3 text-xs font-bold rounded-lg transition-colors ${
              activeTab === 'suspects'
                ? 'bg-cyan-500 text-slate-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Suspects ({suspectList.length})
          </button>
          <button
            onClick={() => setActiveTab('evidence')}
            className={`flex-1 py-1.5 px-3 text-xs font-bold rounded-lg transition-colors ${
              activeTab === 'evidence'
                ? 'bg-cyan-500 text-slate-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Evidence ({evidenceList.length})
          </button>
        </div>

        {/* Tab Content 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6 pt-2 font-sans">
            <div className="space-y-2">
              <h2 className="text-xs font-bold font-mono text-cyan-400 uppercase tracking-wider">
                Official Incident Summary
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed bg-[#080d19] p-4 rounded-xl border border-slate-800">
                {caseItem.incidentDescription}
              </p>
            </div>

            <div className="space-y-2">
              <h2 className="text-xs font-bold font-mono text-cyan-400 uppercase tracking-wider">
                Field Briefing Directive
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed bg-[#080d19] p-4 rounded-xl border border-slate-800">
                {caseItem.briefing}
              </p>
            </div>
          </div>
        )}

        {/* Tab Content 2: Suspects */}
        {activeTab === 'suspects' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 font-sans">
            {suspectList.map((s) => (
              <div
                key={s.id}
                className="rounded-xl border border-slate-800 p-4 bg-[#080d19] space-y-2.5"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="font-bold text-sm text-slate-100 font-mono">{s.name}</div>
                  <div className="text-[11px] font-mono text-cyan-400">Suspicion: {s.suspicionScore}/10</div>
                </div>
                <div className="text-xs text-sky-400 font-medium">{s.role}</div>

                <div className="space-y-1 text-xs">
                  <span className="font-semibold text-slate-300">Motive:</span>
                  <p className="text-slate-400 leading-normal">{s.motive}</p>
                </div>

                <div className="space-y-1 text-xs">
                  <span className="font-semibold text-slate-300">Alibi on Record:</span>
                  <p className="text-slate-400 leading-normal">{s.alibi}</p>
                </div>

                <div className="p-2.5 rounded bg-slate-950 border border-slate-800/80 text-xs text-slate-300 italic">
                  "{s.statement}"
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab Content 3: Evidence */}
        {activeTab === 'evidence' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 font-sans">
            {evidenceList.map((e) => (
              <div
                key={e.id}
                className="rounded-xl border border-slate-800 p-4 bg-[#080d19] space-y-2"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="font-bold text-sm text-slate-100 font-mono">{e.title}</div>
                  <CaseStamp label={e.evidenceCode} variant="neutral" />
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {e.description}
                </p>
                {e.analysisNotes && (
                  <div className="pt-2 border-t border-slate-800 text-xs text-slate-300">
                    <span className="font-semibold text-cyan-400 font-mono">Lab Analysis: </span>
                    {e.analysisNotes}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Footer Controls */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <Link
            to="/"
            className="text-xs font-semibold text-slate-400 hover:text-cyan-400 transition-colors flex items-center gap-1.5"
          >
            <ChevronLeft className="w-4 h-4" /> Return to Cases
          </Link>

          <button
            onClick={() => navigate(`/case/${caseItem.id}/rules`)}
            className="py-2.5 px-6 rounded-xl cyber-glow-btn text-xs font-bold uppercase tracking-wider flex items-center gap-2"
          >
            <span>Proceed to Rules & Regulations</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
