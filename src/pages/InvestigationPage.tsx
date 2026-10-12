import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { bureauStore } from '../lib/store';
import { useAuth } from '../context/AuthContext';
import { DifficultyLevel, Question } from '../types';
import { StarRating } from '../components/common/StarRating';
import confetti from 'canvas-confetti';
import { 
  Clock, 
  Trophy, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  ChevronLeft, 
  ArrowRight, 
  RotateCcw, 
  Send, 
  Image as ImageIcon,
  Maximize2,
  FileCheck2,
  Layers,
  Sparkles,
  Award,
  Upload,
  CheckCircle2,
  FileText,
  ShieldAlert
} from 'lucide-react';

export const InvestigationPage: React.FC = () => {
  const { id, level } = useParams<{ id: string; level: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const currentLevel = (level as DifficultyLevel) || 'easy';
  const caseItem = id ? bureauStore.getCaseById(id) : bureauStore.getCases()[0];

  // Server-authoritative unlock guard
  useEffect(() => {
    if (caseItem) {
      const isUnlocked = bureauStore.isLevelUnlocked(caseItem.id, currentLevel, user.id);
      if (!isUnlocked) {
        navigate(`/case/${caseItem.id}/levels`, { replace: true });
      }
    }
  }, [caseItem, currentLevel, user.id, navigate]);

  const [questions, setQuestions] = useState<Question[]>(() => {
    if (!caseItem) return [];
    return bureauStore.getQuestionsForLevel(caseItem.id, currentLevel, false);
  });

  // Re-fetch questions and reset all investigation states whenever currentLevel or case changes
  useEffect(() => {
    if (caseItem) {
      const freshQuestions = bureauStore.getQuestionsForLevel(caseItem.id, currentLevel, false);
      setQuestions(freshQuestions);
      setCurrentIndex(0);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
      setCollectedAnswers([]);
      setIsLevelFinished(false);
      setResultData(null);
      setTimeLeft(caseItem.timeLimitSeconds || 90);
      setTimeElapsed(0);
    }
  }, [caseItem?.id, currentLevel]);

  // Poster upload state for questions
  const posterFileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState<string | null>(null);

  const handleUploadPoster = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const targetQ = questions[currentIndex];
      if (dataUrl && targetQ) {
        bureauStore.updateQuestionPoster(
          targetQ.id,
          dataUrl,
          `Uploaded Evidence Poster #${currentIndex + 1} (${file.name})`
        );
        setQuestions((prev) =>
          prev.map((q) =>
            q.id === targetQ.id
              ? {
                  ...q,
                  posterUrl: dataUrl,
                  posterTitle: `Uploaded Evidence: ${file.name}`,
                }
              : q
          )
        );
        setUploadSuccessMsg(`Poster uploaded successfully for Exhibit #${currentIndex + 1}!`);
        setTimeout(() => setUploadSuccessMsg(null), 3500);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Gameplay state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<'A' | 'B' | 'C' | 'D' | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [collectedAnswers, setCollectedAnswers] = useState<{
    questionId: string;
    selectedOptionLabel: 'A' | 'B' | 'C' | 'D';
  }[]>([]);

  // Time tracking
  const [timeLeft, setTimeLeft] = useState(caseItem?.timeLimitSeconds || 90);
  const [timeElapsed, setTimeElapsed] = useState(0);

  // Result state
  const [isLevelFinished, setIsLevelFinished] = useState(false);
  const [resultData, setResultData] = useState<{
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
  } | null>(null);

  // Poster expand modal
  const [isPosterExpanded, setIsPosterExpanded] = useState(false);

  // Countdown timer
  useEffect(() => {
    if (isAnswerSubmitted || isLevelFinished || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleAutoSubmitOnTimeout();
          return 0;
        }
        return prev - 1;
      });
      setTimeElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isAnswerSubmitted, isLevelFinished, timeLeft]);

  const handleAutoSubmitOnTimeout = () => {
    if (!isAnswerSubmitted && questions.length > 0) {
      const currentQ = questions[currentIndex];
      const fallback = selectedOption || 'A';
      setSelectedOption(fallback);
      setIsAnswerSubmitted(true);
      setCollectedAnswers((prev) => [
        ...prev.filter(a => a.questionId !== currentQ.id),
        { questionId: currentQ.id, selectedOptionLabel: fallback }
      ]);
    }
  };

  if (!caseItem || questions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-slate-400">No questions found for this stage.</p>
        <Link to="/" className="text-xs text-cyan-400 underline mt-2 inline-block">Return home</Link>
      </div>
    );
  }

  const currentQ = questions[currentIndex];

  const handleConfirmDeduction = () => {
    if (!selectedOption || isAnswerSubmitted) return;
    setIsAnswerSubmitted(true);
    setCollectedAnswers((prev) => [
      ...prev.filter(a => a.questionId !== currentQ.id),
      { questionId: currentQ.id, selectedOptionLabel: selectedOption }
    ]);
  };

  const handleNextExhibit = () => {
    if (!isAnswerSubmitted) return;

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
      setTimeLeft(caseItem.timeLimitSeconds || 90);
    } else {
      finishStage();
    }
  };

  const finishStage = () => {
    const finalAnswers = [
      ...collectedAnswers.filter(a => a.questionId !== currentQ.id),
      { questionId: currentQ.id, selectedOptionLabel: selectedOption || 'A' }
    ];

    const result = bureauStore.submitLevelAnswers(
      caseItem.id,
      currentLevel,
      finalAnswers,
      user
    );

    setResultData(result);
    setIsLevelFinished(true);

    if (result.stars >= 2) {
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // silent
      }
    }
  };

  const handleRetry = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setCollectedAnswers([]);
    setIsLevelFinished(false);
    setResultData(null);
    setTimeLeft(caseItem.timeLimitSeconds || 90);
    setTimeElapsed(0);
  };

  const getNextLevelName = (): DifficultyLevel | null => {
    if (currentLevel === 'easy') return 'medium';
    if (currentLevel === 'medium') return 'hard';
    return null;
  };

  const handleStartNextLevel = () => {
    const nextLevel = getNextLevelName();
    if (!nextLevel || !caseItem) return;
    
    // Reset all local investigation game state so medium question screen opens immediately
    const nextQuestions = bureauStore.getQuestionsForLevel(caseItem.id, nextLevel, false);
    setQuestions(nextQuestions);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setCollectedAnswers([]);
    setIsLevelFinished(false);
    setResultData(null);
    setTimeLeft(caseItem.timeLimitSeconds || 90);
    setTimeElapsed(0);

    navigate(`/case/${caseItem.id}/investigate/${nextLevel}`);
  };

  // Helper metrics for Page 6
  const totalScore = resultData?.score || 0;
  const accuracy = Math.round((totalScore / 3) * 100);
  const timeSaved = Math.max(0, 135 - timeElapsed);
  const bureauMerits = totalScore * 150;

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-2">
      {!isLevelFinished ? (
        /* ============================================================ */
        /* PAGE 5: ACTIVE QUESTION / FORENSIC EXHIBIT SCREEN             */
        /* ============================================================ */
        <div className="space-y-4">
          {/* Top Header Strip matching Page 5 */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="text-slate-300">
                Case File: <strong className="text-white">{caseItem.caseCode}</strong> - {currentLevel.toUpperCase()} Clearance Stage
              </span>
              <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold uppercase text-[10px]">
                {currentLevel}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-slate-400">
                Exhibit <strong className="text-white">{currentIndex + 1} of {questions.length}</strong> ({caseItem.badgeTag})
              </span>

              <div className="flex items-center gap-2 px-3 py-1 rounded-lg border border-sky-800 bg-[#070e1c] text-cyan-300">
                <Clock className="w-3.5 h-3.5" />
                <span>0{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg border border-amber-800/80 bg-amber-950/40 text-amber-300 font-bold">
                <Trophy className="w-3.5 h-3.5" />
                <span>18 pts</span>
              </div>
            </div>
          </div>

          {/* Main Question Card matching Page 5 */}
          <div className="rounded-2xl border border-sky-900/60 bg-[#0c1322] p-6 space-y-5 shadow-2xl">
            {/* Forensic Evidence Poster Section matching Page 5 */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-cyan-400 font-semibold border-b border-slate-800 pb-2">
                <div className="flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span className="truncate max-w-[280px] sm:max-w-md">{currentQ.posterTitle || 'Forensic Evidence Poster'}</span>
                </div>
                <div className="flex items-center gap-2">
                  {/* Upload Poster Button for this question */}
                  <button
                    type="button"
                    onClick={() => posterFileInputRef.current?.click()}
                    className="text-slate-300 hover:text-cyan-300 bg-slate-900 hover:bg-sky-950 border border-slate-700 hover:border-cyan-500/70 px-2.5 py-1 rounded-lg flex items-center gap-1 text-[11px] transition-colors cursor-pointer"
                    title="Upload custom poster or crime scene photo for this question"
                  >
                    <Upload className="w-3 h-3 text-cyan-400" />
                    <span>Upload Poster</span>
                  </button>
                  <input
                    ref={posterFileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleUploadPoster}
                  />

                  <button
                    type="button"
                    onClick={() => setIsPosterExpanded(!isPosterExpanded)}
                    className="text-slate-400 hover:text-cyan-300 flex items-center gap-1 text-[11px]"
                  >
                    <Maximize2 className="w-3 h-3" />
                    <span>{isPosterExpanded ? 'Minimize' : 'Expand Poster'}</span>
                  </button>
                </div>
              </div>

              {/* Upload Success Alert */}
              {uploadSuccessMsg && (
                <div className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-700/60 text-emerald-300 text-xs font-mono flex items-center gap-2 animate-in fade-in">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{uploadSuccessMsg}</span>
                </div>
              )}

              {/* Render Poster Image */}
              <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center">
                {currentQ.posterUrl ? (
                  <img
                    src={currentQ.posterUrl}
                    alt={currentQ.posterTitle || 'Forensic Evidence Poster'}
                    className={`w-full object-cover transition-all duration-200 ${
                      isPosterExpanded ? 'max-h-[500px]' : 'max-h-[220px]'
                    }`}
                  />
                ) : (
                  <div className="py-12 text-slate-500 text-xs font-mono flex flex-col items-center gap-2">
                    <span>[Forensic Evidence Diagram #0{currentIndex + 1}]</span>
                    <button
                      type="button"
                      onClick={() => posterFileInputRef.current?.click()}
                      className="text-cyan-400 underline hover:text-cyan-300 text-[11px]"
                    >
                      Click to upload evidence poster
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Question Prompt matching Page 5 */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between">
                <div className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                  Question {currentIndex + 1}: Forensic Exhibit #{currentIndex + 1}
                </div>
              </div>
              <p className="text-base font-bold text-slate-100 leading-snug">
                {currentQ.prompt}
              </p>
            </div>

            {/* Multiple Choice Answer Options */}
            <div className="space-y-2.5 pt-1">
              {currentQ.options.map((opt) => {
                const isSelected = selectedOption === opt.optionLabel;
                const isCorrect = opt.optionLabel === currentQ.correctOptionLabel;
                const isPlayerChoiceWrong = isAnswerSubmitted && isSelected && !isCorrect;

                let cardStyle = 'border-slate-800 bg-[#070d19] text-slate-300 hover:border-slate-700 hover:bg-[#091122]';
                let badgeStyle = 'border-slate-700 bg-slate-900 text-slate-400';

                if (!isAnswerSubmitted) {
                  // Standard clean selection highlight prior to confirming deduction
                  if (isSelected) {
                    cardStyle = 'border-cyan-400 bg-sky-950/70 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.3)] ring-1 ring-cyan-400';
                    badgeStyle = 'border-cyan-400 bg-cyan-500 text-slate-950 font-black';
                  }
                } else {
                  // After deduction is confirmed: reveal RIGHT and WRONG clearly
                  if (isCorrect) {
                    cardStyle = 'border-emerald-500 bg-emerald-950/80 text-emerald-100 shadow-[0_0_25px_rgba(16,185,129,0.45)] ring-2 ring-emerald-500';
                    badgeStyle = 'border-emerald-400 bg-emerald-500 text-slate-950 font-black';
                  } else if (isPlayerChoiceWrong) {
                    cardStyle = 'border-rose-500 bg-rose-950/80 text-rose-100 shadow-[0_0_22px_rgba(244,63,94,0.45)] ring-2 ring-rose-500';
                    badgeStyle = 'border-rose-400 bg-rose-600 text-white font-black';
                  } else {
                    cardStyle = 'border-slate-800/60 bg-[#060a14]/60 text-slate-500 opacity-50';
                    badgeStyle = 'border-slate-800 bg-slate-900 text-slate-600';
                  }
                }

                return (
                  <button
                    key={opt.id}
                    type="button"
                    disabled={isAnswerSubmitted}
                    onClick={() => setSelectedOption(opt.optionLabel)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3.5 ${cardStyle} ${
                      isAnswerSubmitted ? 'cursor-default' : 'cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-6 h-6 rounded-md font-mono text-xs font-bold flex items-center justify-center shrink-0 border ${badgeStyle}`}
                      >
                        {opt.optionLabel}
                      </span>
                      <span className="text-xs sm:text-sm font-medium">
                        {opt.optionText}
                      </span>
                    </div>

                    {/* Post-deduction status badges on option card */}
                    {isAnswerSubmitted && (
                      <div className="shrink-0 flex items-center gap-1.5 font-mono text-[10px] font-bold">
                        {isCorrect && (
                          <span className="px-2 py-0.5 rounded bg-emerald-900/90 text-emerald-200 border border-emerald-500/80 flex items-center gap-1 shadow-sm">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            VERIFIED CORRECT
                          </span>
                        )}
                        {isPlayerChoiceWrong && (
                          <span className="px-2 py-0.5 rounded bg-rose-900/90 text-rose-200 border border-rose-500/80 flex items-center gap-1 shadow-sm">
                            <XCircle className="w-3 h-3 text-rose-400" />
                            YOUR CHOICE (WRONG)
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Instant RIGHT or WRONG Forensic Indication Banner */}
            {isAnswerSubmitted && (
              <div
                className={`p-4 rounded-xl border-2 shadow-xl animate-in fade-in zoom-in-95 duration-200 space-y-2.5 ${
                  selectedOption === currentQ.correctOptionLabel
                    ? 'border-emerald-500/90 bg-emerald-950/40 text-emerald-100 shadow-[0_0_25px_rgba(16,185,129,0.25)]'
                    : 'border-rose-500/90 bg-rose-950/40 text-rose-100 shadow-[0_0_25px_rgba(244,63,94,0.25)]'
                }`}
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2 font-mono font-black text-sm uppercase tracking-wider">
                    {selectedOption === currentQ.correctOptionLabel ? (
                      <>
                        <div className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <span className="text-emerald-300">DEDUCTION VERIFIED — RIGHT!</span>
                      </>
                    ) : (
                      <>
                        <div className="w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center">
                          <XCircle className="w-4 h-4" />
                        </div>
                        <span className="text-rose-300">INCONCLUSIVE DEDUCTION — WRONG!</span>
                      </>
                    )}
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold border ${
                      selectedOption === currentQ.correctOptionLabel
                        ? 'bg-emerald-900/80 border-emerald-500 text-emerald-200'
                        : 'bg-rose-900/80 border-rose-500 text-rose-200'
                    }`}
                  >
                    {selectedOption === currentQ.correctOptionLabel
                      ? '+100 BUREAU MERITS'
                      : '0 BUREAU MERITS'}
                  </span>
                </div>

                {/* Forensic finding rationale */}
                <div className="text-xs space-y-1.5 pt-1 border-t border-slate-800">
                  {selectedOption !== currentQ.correctOptionLabel && (
                    <div className="text-rose-200 font-medium">
                      <span className="font-mono font-bold text-rose-400">CORRECT FORENSIC ANSWER: </span>
                      Option {currentQ.correctOptionLabel} &mdash;{' '}
                      {currentQ.options.find((o) => o.optionLabel === currentQ.correctOptionLabel)?.optionText}
                    </div>
                  )}

                  <div className="text-slate-200 leading-relaxed">
                    <span className="font-mono font-bold text-cyan-400">FORENSIC RATIONALE: </span>
                    {currentQ.explanation}
                  </div>

                  {currentQ.forensicEvidenceNotes && (
                    <div className="text-[11px] font-mono text-cyan-300/80 flex items-center gap-1.5 pt-0.5">
                      <FileText className="w-3.5 h-3.5 shrink-0" />
                      <span>Evidence Record: {currentQ.forensicEvidenceNotes}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons matching Page 5 */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
              {!isAnswerSubmitted ? (
                <button
                  type="button"
                  disabled={!selectedOption}
                  onClick={handleConfirmDeduction}
                  className={`py-2.5 px-6 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                    selectedOption
                      ? 'cyber-glow-btn cursor-pointer'
                      : 'bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed'
                  }`}
                >
                  Confirm Deduction
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNextExhibit}
                  className="py-2.5 px-6 rounded-xl cyber-glow-btn text-xs font-bold uppercase tracking-wider cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                >
                  {currentIndex + 1 < questions.length ? 'Next Exhibit >' : 'View Clearance Report >'}
                </button>
              )}
            </div>

            {/* Footer metadata matching Page 5 */}
            <div className="pt-2 flex items-center justify-between text-[11px] font-mono text-slate-500">
              <Link to={`/case/${caseItem.id}/levels`} className="hover:text-slate-300">
                Abort Investigation
              </Link>
              <span>CASE ID: att_stage_{currentLevel}_{caseItem.caseCode}</span>
            </div>
          </div>
        </div>
      ) : (
        /* ============================================================ */
        /* PAGE 6: LEVEL CLEARANCE REPORT / STAGE RESULTS SCREEN        */
        /* ============================================================ */
        <div className="space-y-6">
          <div className="rounded-2xl border border-sky-900/60 bg-[#0c1322] p-6 sm:p-8 space-y-6 shadow-2xl">
            {/* Header Badge & Title matching Page 6 */}
            <div className="text-center space-y-3 pb-4 border-b border-slate-800">
              <span
                className={`text-[11px] font-mono uppercase tracking-widest px-3 py-1 rounded border font-bold inline-block ${
                  resultData && resultData.stars >= 2
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                    : 'bg-rose-950/70 text-rose-300 border-rose-800'
                }`}
              >
                {resultData && resultData.stars >= 2
                  ? 'CASE SOLVED // BUREAU COMMENDED'
                  : 'CASE COLD // INSUFFICIENT EVIDENCE'}
              </span>

              <h1 className="text-2xl sm:text-3xl font-black text-slate-100 font-mono tracking-wide">
                Case Clearance Report: {caseItem.caseCode} - {currentLevel.charAt(0).toUpperCase() + currentLevel.slice(1)} Clearance Stage
              </h1>

              {/* Glowing Stars in Center */}
              <div className="py-2 flex justify-center">
                <StarRating score={resultData?.stars || 0} maxStars={3} size="lg" />
              </div>
            </div>

            {/* 4 Metric Boxes matching Page 6 */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3.5 rounded-xl border border-slate-800 bg-[#080d19]">
                <div className="text-[10px] font-mono uppercase text-slate-400">BUREAU MERITS</div>
                <div className="text-lg font-black font-mono text-slate-100 mt-0.5">{bureauMerits}</div>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-800 bg-[#080d19]">
                <div className="text-[10px] font-mono uppercase text-slate-400">ACCURACY</div>
                <div className="text-lg font-black font-mono text-cyan-400 mt-0.5">{accuracy}%</div>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-800 bg-[#080d19]">
                <div className="text-[10px] font-mono uppercase text-slate-400">TOTAL TIME SPENT</div>
                <div className="text-lg font-black font-mono text-cyan-300 mt-0.5">
                  {timeElapsed >= 60 ? `${Math.floor(timeElapsed / 60)}m ${timeElapsed % 60}s` : `${timeElapsed}s`}
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-800 bg-[#080d19]">
                <div className="text-[10px] font-mono uppercase text-slate-400">TIME SAVED</div>
                <div className="text-lg font-black font-mono text-emerald-400 mt-0.5">+{timeSaved}s</div>
              </div>
            </div>

            {/* Comprehensive Forensic Explanation Dossier matching User Request */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
                  <h3 className="text-xs sm:text-sm font-mono font-bold text-slate-100 uppercase tracking-wider">
                    Official Forensic Explanations & Evidence Dossier
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-cyan-400 font-semibold bg-sky-950/80 px-2.5 py-1 rounded-md border border-sky-800">
                  {resultData?.detailedAnswers.filter(a => a.isCorrect).length || 0} / {resultData?.detailedAnswers.length || 3} Deductions Verified
                </span>
              </div>

              <div className="space-y-3.5">
                {resultData?.detailedAnswers.map((ans, idx) => {
                  const matchingQ = questions.find(q => q.id === ans.questionId);
                  const exhibitPrompt = ans.prompt || matchingQ?.prompt;
                  const exhibitPoster = ans.posterUrl || matchingQ?.posterUrl;
                  const exhibitTitle = ans.posterTitle || matchingQ?.posterTitle || `Forensic Exhibit #${idx + 1}`;
                  const evidenceNotes = ans.forensicEvidenceNotes || matchingQ?.forensicEvidenceNotes;

                  return (
                    <div
                      key={ans.questionId}
                      className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                        ans.isCorrect
                          ? 'border-emerald-800/80 bg-gradient-to-br from-emerald-950/30 via-[#071318] to-[#070e1c] shadow-[0_4px_20px_rgba(16,185,129,0.08)]'
                          : 'border-rose-900/70 bg-gradient-to-br from-rose-950/30 via-[#140b12] to-[#070e1c] shadow-[0_4px_20px_rgba(244,63,94,0.08)]'
                      }`}
                    >
                      {/* Exhibit Header */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`w-6 h-6 rounded-lg font-mono text-xs font-black flex items-center justify-center shrink-0 border ${
                              ans.isCorrect
                                ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                                : 'bg-rose-600 text-white border-rose-500'
                            }`}
                          >
                            {idx + 1}
                          </span>
                          <div>
                            <span className="text-xs font-mono font-bold text-slate-200 uppercase">
                              EXHIBIT #{idx + 1} &mdash; {exhibitTitle}
                            </span>
                          </div>
                        </div>

                        {/* Verdict Badge */}
                        <div className="flex items-center gap-2">
                          {ans.isCorrect ? (
                            <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-emerald-950 border border-emerald-600 text-emerald-300 flex items-center gap-1.5 shadow-xs">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              VERIFIED RIGHT (+100 PTS)
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-rose-950 border border-rose-600 text-rose-300 flex items-center gap-1.5 shadow-xs">
                              <XCircle className="w-3.5 h-3.5 text-rose-400" />
                              INCONCLUSIVE / WRONG (0 PTS)
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Exhibit Content Body */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-3.5">
                        {/* Poster thumbnail if available */}
                        {exhibitPoster && (
                          <div className="md:col-span-3">
                            <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden relative group">
                              <img
                                src={exhibitPoster}
                                alt={exhibitTitle}
                                className="w-full h-28 object-cover object-center group-hover:scale-105 transition-transform duration-300"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent flex items-end p-1.5">
                                <span className="text-[9px] font-mono text-cyan-300 truncate font-semibold">
                                  {exhibitTitle}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Details & Explanation */}
                        <div className={`${exhibitPoster ? 'md:col-span-9' : 'md:col-span-12'} space-y-2.5 text-xs`}>
                          {/* Question prompt */}
                          {exhibitPrompt && (
                            <div className="text-slate-200 font-semibold text-xs sm:text-sm">
                              &ldquo;{exhibitPrompt}&rdquo;
                            </div>
                          )}

                          {/* Deduction comparison */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono">
                            <div
                              className={`p-2 rounded-lg border ${
                                ans.isCorrect
                                  ? 'border-emerald-900/60 bg-emerald-950/40 text-emerald-200'
                                  : 'border-rose-900/60 bg-rose-950/40 text-rose-200'
                              }`}
                            >
                              <span className="text-slate-400 block text-[10px] uppercase">Detective Deduction:</span>
                              <strong className="font-bold">
                                Option {ans.chosenOptionLabel || 'N/A'}:
                              </strong>{' '}
                              <span>{ans.chosenOptionText || (matchingQ?.options.find(o => o.optionLabel === ans.chosenOptionLabel)?.optionText) || 'No deduction entered'}</span>
                            </div>

                            <div className="p-2 rounded-lg border border-sky-900/60 bg-sky-950/40 text-cyan-200">
                              <span className="text-slate-400 block text-[10px] uppercase">Bureau Verified Answer:</span>
                              <strong className="font-bold text-cyan-300">
                                Option {ans.correctOptionLabel}:
                              </strong>{' '}
                              <span>{ans.correctOptionText || (matchingQ?.options.find(o => o.optionLabel === ans.correctOptionLabel)?.optionText)}</span>
                            </div>
                          </div>

                          {/* Detailed Forensic Explanation Box */}
                          <div className="p-3 rounded-xl border border-slate-800 bg-[#060b16] text-xs space-y-1.5">
                            <div className="flex items-center gap-1.5 font-mono font-bold text-cyan-400 text-[11px] uppercase tracking-wider">
                              <FileText className="w-3.5 h-3.5" />
                              <span>Forensic Science Analysis & Explanation</span>
                            </div>
                            <p className="text-slate-200 leading-relaxed font-sans text-xs">
                              {ans.explanation}
                            </p>
                          </div>

                          {/* Forensic Evidence Notes if present */}
                          {evidenceNotes && (
                            <div className="text-[11px] font-mono text-cyan-300/90 flex items-center gap-1.5 bg-slate-900/50 px-2.5 py-1 rounded-lg border border-slate-800">
                              <span className="text-slate-400 uppercase font-semibold">Evidence Log:</span>
                              <span>{evidenceNotes}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Official Symposium Submission Callout matching Page 6 */}
            {/* Critical Button Visibility: On 2 or 3 stars (intermediate levels), DO NOT show submit details. Only show Next Level! */}
            {resultData && resultData.stars >= 2 && currentLevel !== 'hard' ? (
              /* Case B & C: 2 or 3 stars earned on Easy or Medium - ONLY Next Level Directive */
              <div className="p-6 rounded-2xl border border-emerald-700/80 bg-gradient-to-r from-emerald-950/40 via-[#0a1b20] to-cyan-950/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono shadow-xl">
                <div className="space-y-1 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    <span>Stage Cleared ({resultData.stars} Stars Earned)</span>
                  </div>
                  <p className="text-slate-200 text-sm font-semibold">
                    {getNextLevelName()?.toUpperCase()} clearance stage is unlocked. Continue investigation to proceed.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleStartNextLevel}
                  className="w-full sm:w-auto py-3 px-8 rounded-xl cyber-glow-btn text-xs font-black uppercase tracking-wider whitespace-nowrap cursor-pointer shadow-[0_0_20px_rgba(6,182,212,0.4)]"
                >
                  NEXT LEVEL: {getNextLevelName()?.toUpperCase()} &gt;
                </button>
              </div>
            ) : currentLevel === 'hard' ? (
              /* Case D: Final Hard Level Finished - Show Final Submission */
              <div className="p-5 rounded-2xl border border-cyan-800/60 bg-gradient-to-r from-sky-950/60 via-[#0a152d] to-cyan-950/40 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center sm:text-left">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
                    OFFICIAL SYMPOSIUM SUBMISSION
                  </div>
                  <h3 className="text-sm font-bold text-slate-100">
                    Completed Your Final Investigation Session
                  </h3>
                  <p className="text-xs text-slate-400">
                    Submit your tournament details to record your certified investigation standing in the bureau database.
                  </p>
                </div>

                <button
                  onClick={() => navigate(`/case/${caseItem.id}/submit?type=final`)}
                  className="w-full sm:w-auto py-2.5 px-5 rounded-xl cyber-glow-btn text-xs font-bold uppercase tracking-wider whitespace-nowrap shadow-md cursor-pointer"
                >
                  SUBMIT DETAILS TO PERSIST STANDING
                </button>
              </div>
            ) : (
              /* Case A: Incomplete Stage (0 or 1 star) - Show Early Submission Option & Retry */
              <div className="p-5 rounded-2xl border border-amber-800/60 bg-gradient-to-r from-amber-950/30 via-[#19140c] to-slate-900/40 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center sm:text-left">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold">
                    INSUFFICIENT CLEARANCE ({resultData?.stars || 0} STARS)
                  </div>
                  <h3 className="text-sm font-bold text-slate-100">
                    Stage Threshold Not Met (Requires minimum 2 stars to unlock next level)
                  </h3>
                  <p className="text-xs text-slate-400">
                    You can retry this stage to earn more stars, or choose early submission with your current score.
                  </p>
                </div>

                <button
                  onClick={() => navigate(`/case/${caseItem.id}/submit?type=early`)}
                  className="w-full sm:w-auto py-2.5 px-5 rounded-xl border border-amber-600 bg-amber-950/60 hover:bg-amber-900 text-amber-200 text-xs font-bold uppercase tracking-wider whitespace-nowrap shadow-md cursor-pointer transition-colors"
                >
                  EARLY SUBMISSION
                </button>
              </div>
            )}

            {/* Footer Navigation Buttons matching State Machine */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
              {/* State Machine Action Buttons */}
              <div className="flex items-center gap-3">

                {/* CRITICAL: If 2+ stars earned and not Hard: ONLY SHOW NEXT LEVEL BUTTON */}
                {resultData && resultData.stars >= 2 && currentLevel !== 'hard' && (
                  <button
                    onClick={handleStartNextLevel}
                    className="py-2.5 px-7 rounded-xl cyber-glow-btn text-xs font-bold uppercase tracking-wider cursor-pointer shadow-lg"
                  >
                    <span>Next Level: {getNextLevelName()?.toUpperCase()} &gt;</span>
                  </button>
                )}

                {/* If final hard completed: show Final Submit */}
                {currentLevel === 'hard' && (
                  <button
                    onClick={() => navigate(`/case/${caseItem.id}/submit?type=final`)}
                    className="py-2.5 px-6 rounded-xl cyber-glow-btn text-xs font-bold uppercase tracking-wider cursor-pointer"
                  >
                    Submit & Finish Game
                  </button>
                )}

                {/* If 0 or 1 star on intermediate level: allow early submission */}
                {resultData && resultData.stars < 2 && currentLevel !== 'hard' && (
                  <button
                    onClick={() => navigate(`/case/${caseItem.id}/submit?type=early`)}
                    className="py-2.5 px-6 rounded-xl border border-amber-600/70 bg-amber-950/40 text-amber-300 hover:bg-amber-900 text-xs font-bold uppercase tracking-wider cursor-pointer"
                  >
                    Submit Early
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
