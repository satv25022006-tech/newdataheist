import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { bureauStore } from '../lib/store';
import { FinalSubmission } from '../types';
import { StarRating } from '../components/common/StarRating';
import { 
  Search, 
  Eye, 
  X,
  FileCheck2,
  Building,
  Users,
  Award
} from 'lucide-react';

export const PublicSubmissionsPage: React.FC = () => {
  const [submissions] = useState<FinalSubmission[]>(bureauStore.getSubmissions());
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'final' | 'early'>('all');
  const [selectedSub, setSelectedSub] = useState<FinalSubmission | null>(null);

  const filtered = submissions.filter((s) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      s.submissionRef.toLowerCase().includes(term) ||
      s.playerName.toLowerCase().includes(term) ||
      (s.teamName && s.teamName.toLowerCase().includes(term)) ||
      (s.collegeName && s.collegeName.toLowerCase().includes(term)) ||
      s.caseTitle.toLowerCase().includes(term);

    const matchesType = typeFilter === 'all' || s.submissionType === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-2 text-slate-100 font-mono">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-sky-950 text-cyan-300 border border-sky-800 font-bold">
              BUREAU SYMPOSIUM REGISTRY
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-wide">
            Official Investigation Submissions
          </h1>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Certified tournament clearance records registered by teams and investigators.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#0c1322] p-4 rounded-xl border border-sky-900/60">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search candidate, team, or college..."
            className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-slate-700 bg-slate-950 text-slate-200"
          />
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg w-full sm:w-auto">
          <button
            onClick={() => setTypeFilter('all')}
            className={`flex-1 sm:flex-initial px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
              typeFilter === 'all'
                ? 'bg-cyan-500 text-slate-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Filings
          </button>
          <button
            onClick={() => setTypeFilter('final')}
            className={`flex-1 sm:flex-initial px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
              typeFilter === 'final'
                ? 'bg-cyan-500 text-slate-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Completed Cases
          </button>
          <button
            onClick={() => setTypeFilter('early')}
            className={`flex-1 sm:flex-initial px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
              typeFilter === 'early'
                ? 'bg-cyan-500 text-slate-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Early Filings
          </button>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="rounded-xl border border-sky-900/60 bg-[#0c1322] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950 text-[10px] uppercase text-slate-400">
                <th className="py-3 px-4">Reference Code</th>
                <th className="py-3 px-4">Candidate / Team</th>
                <th className="py-3 px-4">Institution</th>
                <th className="py-3 px-4 text-center">Score</th>
                <th className="py-3 px-4 text-center">Stars</th>
                <th className="py-3 px-4 text-center">Total Time Spent</th>
                <th className="py-3 px-4 text-right">Filed Date</th>
                <th className="py-3 px-4 text-center">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    No matching investigation records found.
                  </td>
                </tr>
              ) : (
                filtered.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-900/50">
                    <td className="py-3 px-4 font-bold text-cyan-400">{sub.submissionRef}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-100">{sub.playerName}</div>
                      <div className="text-[10px] text-slate-400">{sub.teamName || sub.badgeNumber}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-300">{sub.collegeName || 'National Tech'}</td>
                    <td className="py-3 px-4 text-center font-bold text-slate-100">{sub.totalScoreEarned} / {sub.totalAttemptedPossible}</td>
                    <td className="py-3 px-4 text-center font-bold text-amber-400">{sub.totalStarsEarned}★</td>
                    <td className="py-3 px-4 text-center font-bold text-cyan-300 font-mono">
                      {sub.timeElapsedSeconds >= 60
                        ? `${Math.floor(sub.timeElapsedSeconds / 60)}m ${sub.timeElapsedSeconds % 60}s`
                        : `${sub.timeElapsedSeconds || 26}s`}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-400 text-[10px]">{new Date(sub.submittedAt).toLocaleDateString()}</td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => setSelectedSub(sub)}
                        className="p-1 hover:text-cyan-300 text-slate-400"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect Modal */}
      {selectedSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl border border-sky-800 bg-[#0c1322] text-slate-100 p-6 relative text-xs">
            <button
              onClick={() => setSelectedSub(null)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-4">
              <div className="border-b border-slate-800 pb-2">
                <span className="text-cyan-400 font-bold">{selectedSub.submissionRef}</span>
                <h3 className="font-bold text-base text-slate-100 mt-1">{selectedSub.caseTitle}</h3>
                <p className="text-slate-400">
                  {selectedSub.playerName} · {selectedSub.teamName} ({selectedSub.collegeName})
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                  <div className="text-[10px] text-slate-400">Easy</div>
                  <div className="font-bold">{selectedSub.easyScore}/3 pts ({selectedSub.easyStars}★)</div>
                </div>
                <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                  <div className="text-[10px] text-slate-400">Medium</div>
                  <div className="font-bold">{selectedSub.mediumScore !== undefined ? `${selectedSub.mediumScore}/3 pts (${selectedSub.mediumStars}★)` : '—'}</div>
                </div>
                <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                  <div className="text-[10px] text-slate-400">Hard</div>
                  <div className="font-bold">{selectedSub.hardScore !== undefined ? `${selectedSub.hardScore}/3 pts (${selectedSub.hardStars}★)` : '—'}</div>
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between font-bold">
                <span className="text-slate-300">Total Score: {selectedSub.totalScoreEarned} / {selectedSub.totalAttemptedPossible} pts</span>
                <span className="text-amber-400">{selectedSub.totalStarsEarned}/9 Stars</span>
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between font-bold text-cyan-300">
                <span className="text-slate-300">Total Time Spent:</span>
                <span>
                  {selectedSub.timeElapsedSeconds >= 60
                    ? `${Math.floor(selectedSub.timeElapsedSeconds / 60)}m ${selectedSub.timeElapsedSeconds % 60}s`
                    : `${selectedSub.timeElapsedSeconds || 26}s`}
                </span>
              </div>

              {selectedSub.feedbackComments && (
                <div className="p-3 rounded bg-slate-950 border border-slate-800 text-slate-300 italic font-sans">
                  "{selectedSub.feedbackComments}"
                </div>
              )}

              <div className="pt-2 text-right">
                <button
                  onClick={() => setSelectedSub(null)}
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
