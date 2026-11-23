import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Download,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import type { InterviewSessionRecord } from '../types/interview';
import { calculateDimensionAverages, formatShortDate } from '../utils/interviewLogic';
import { exportInterviewReportPdf } from '../utils/pdfExport';

interface ResultsDashboardProps {
  session: InterviewSessionRecord;
  onRestartInterview: () => void;
  onNewSetup: () => void;
}

export function ResultsDashboard({
  session,
  onRestartInterview,
  onNewSetup,
}: ResultsDashboardProps) {
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(
    session.responses[0]?.question.id ?? null
  );
  const [selectedChartIndex, setSelectedChartIndex] = useState<number>(0);
  const [pdfDownloaded, setPdfDownloaded] = useState(false);

  const averages = calculateDimensionAverages(session.responses.map((r) => r.evaluation));
  const overall = session.analysis.overallScore;

  // Radial SVG gauge geometry
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = circumference - (overall / 100) * circumference;

  const handleDownloadPdf = () => {
    exportInterviewReportPdf(session);
    setPdfDownloaded(true);
    setTimeout(() => setPdfDownloaded(false), 2400);
  };

  const selectedResponse = session.responses[selectedChartIndex] ?? session.responses[0];

  return (
    <div className="ambient-backdrop min-h-[calc(100vh-65px)] py-10 sm:py-12">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        {/* Dashboard Top Action Bar */}
        <div className="flex flex-col justify-between gap-6 border-b border-slate-800 pb-7 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-medium text-[#6994FF]">Interview Results Dashboard</p>
            <h1 className="mt-1.5 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {session.config.role}
            </h1>
            <p className="mt-2 text-xs text-slate-400">
              {session.config.experienceLevel} · {session.config.interviewType} · {session.config.difficulty}{' '}
              · {session.responses.length} Questions · {formatShortDate(session.createdAt)}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleDownloadPdf}
              className="inline-flex items-center gap-2 rounded-xl bg-[#477BFF] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#3A6DF0] whitespace-nowrap shrink-0"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              <span>{pdfDownloaded ? 'PDF Report Downloaded' : 'Download PDF Report'}</span>
            </button>

            <button
              type="button"
              onClick={onRestartInterview}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-[#111A2E] px-4 py-2.5 text-sm font-medium text-slate-200 transition-colors hover:border-slate-500 hover:text-white whitespace-nowrap shrink-0"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              <span>Restart Interview</span>
            </button>

            <button
              type="button"
              onClick={onNewSetup}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-800 px-4 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:border-slate-600 hover:text-white whitespace-nowrap shrink-0"
            >
              <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
              <span>New Setup</span>
            </button>
          </div>
        </div>

        {/* Score Overview & Per-Question Chart Row */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12"
        >
          {/* Overall Score Gauge Card */}
          <section className="glass-surface rounded-2xl p-6 sm:p-7 lg:col-span-5">
            <div className="flex flex-col items-center gap-6 sm:flex-row">
              <div className="relative flex h-40 w-40 shrink-0 items-center justify-center">
                <svg className="h-40 w-40 -rotate-90" viewBox="0 0 160 160" aria-hidden="true">
                  <defs>
                    <linearGradient id="scoreGaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#477BFF" />
                      <stop offset="100%" stopColor="#8857FF" />
                    </linearGradient>
                  </defs>
                  <circle
                    cx="80"
                    cy="80"
                    r={radius}
                    stroke="#1E293B"
                    strokeWidth="12"
                    fill="none"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r={radius}
                    stroke="url(#scoreGaugeGradient)"
                    strokeWidth="12"
                    strokeLinecap="round"
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeOffset}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="font-mono text-4xl font-bold tabular-nums text-white">{overall}</span>
                  <span className="font-mono text-xs text-slate-400">out of 100</span>
                </div>
              </div>

              <div className="w-full space-y-4">
                <div>
                  <p className="text-xs text-slate-400">Overall Readiness</p>
                  <p className="mt-0.5 font-display text-xl font-bold text-white">
                    {session.analysis.performanceTier}
                  </p>
                </div>

                <div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300">Technical Accuracy</span>
                    <span className="font-mono font-semibold tabular-nums text-[#6994FF]">
                      {averages.averageTechnical} / 10
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-[#477BFF]"
                      style={{ width: `${Math.min(100, averages.averageTechnical * 10)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300">Communication Quality</span>
                    <span className="font-mono font-semibold tabular-nums text-[#A17AFF]">
                      {averages.averageCommunication} / 10
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-[#8857FF]"
                      style={{ width: `${Math.min(100, averages.averageCommunication * 10)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Individual Question Scores Bar Chart */}
          <section className="glass-surface rounded-2xl p-6 sm:p-7 lg:col-span-7">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-lg font-semibold text-white">
                  Individual Question Scores
                </h2>
                <p className="mt-0.5 text-xs text-slate-400">
                  Select a bar to inspect question topic and rubric scores
                </p>
              </div>
              <span className="font-mono text-xs tabular-nums text-slate-400">
                Avg {averages.averageScore}/10
              </span>
            </div>

            <div className="mt-6 flex h-44 items-end gap-3 border-b border-slate-800 pb-3 sm:gap-5">
              {session.responses.map((item, idx) => {
                const heightPct = Math.max(8, Math.round((item.evaluation.score / 10) * 100));
                const isSelected = idx === selectedChartIndex;
                const isHr = item.question.category === 'HR';
                return (
                  <button
                    key={item.question.id}
                    type="button"
                    onClick={() => setSelectedChartIndex(idx)}
                    className="group flex h-full flex-1 flex-col items-center justify-end gap-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#477BFF]"
                    aria-label={`Question ${item.question.number}: score ${item.evaluation.score} out of 10`}
                  >
                    <span className="font-mono text-xs font-semibold tabular-nums text-slate-200">
                      {item.evaluation.score}
                    </span>
                    <div className="flex w-full max-w-[52px] flex-1 items-end rounded-lg bg-slate-900/80 p-1">
                      <div
                        className={`w-full rounded-md transition-all ${
                          isHr
                            ? isSelected
                              ? 'bg-[#8857FF]'
                              : 'bg-[#8857FF]/65 group-hover:bg-[#8857FF]'
                            : isSelected
                              ? 'bg-[#477BFF]'
                              : 'bg-[#477BFF]/65 group-hover:bg-[#477BFF]'
                        }`}
                        style={{ height: `${heightPct}%` }}
                      />
                    </div>
                    <span
                      className={`font-mono text-xs tabular-nums ${
                        isSelected ? 'font-semibold text-white' : 'text-slate-400'
                      }`}
                    >
                      Q{item.question.number}
                    </span>
                  </button>
                );
              })}
            </div>

            {selectedResponse && (
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300">
                <span className="truncate">
                  <strong className="text-white">Q{selectedResponse.question.number}:</strong>{' '}
                  {selectedResponse.question.category} · {selectedResponse.question.topic}
                </span>
                <span className="font-mono tabular-nums text-slate-400">
                  Accuracy {selectedResponse.evaluation.technicalAccuracy}/10 · Comm{' '}
                  {selectedResponse.evaluation.communicationQuality}/10
                </span>
              </div>
            )}
          </section>
        </motion.div>

        {/* Performance Summary & Final AI Coach Feedback */}
        <section className="glass-surface mt-6 rounded-2xl p-6 sm:p-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <h2 className="font-display text-lg font-semibold text-white">Performance Summary</h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-300 whitespace-pre-line">
                {session.analysis.performanceSummary}
              </p>
            </div>

            <div className="border-t border-slate-800 pt-6 lg:col-span-5 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8">
              <h2 className="font-display text-lg font-semibold text-[#A17AFF]">
                Final AI Interview Feedback
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-200 whitespace-pre-line">
                {session.analysis.finalFeedback}
              </p>
            </div>
          </div>
        </section>

        {/* Strongest Areas & Areas Needing Improvement */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="glass-surface rounded-2xl p-6 sm:p-7">
            <h2 className="font-display text-lg font-semibold text-emerald-300">Strongest Areas</h2>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-slate-200">
              {session.analysis.strongestAreas.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="glass-surface rounded-2xl p-6 sm:p-7">
            <h2 className="font-display text-lg font-semibold text-amber-300">
              Areas Needing Improvement
            </h2>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-slate-200">
              {session.analysis.areasNeedingImprovement.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Personalized Recommendations */}
        <section className="glass-surface mt-6 rounded-2xl p-6 sm:p-8">
          <h2 className="font-display text-lg font-semibold text-white">
            Personalized Recommendations
          </h2>
          <ol className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
            {session.analysis.personalizedRecommendations.map((rec, idx) => (
              <li
                key={idx}
                className="flex items-start gap-3.5 rounded-xl border border-slate-800/90 bg-[#0A1122]/80 p-4"
              >
                <span className="font-mono text-xs font-semibold tabular-nums text-[#6994FF]">
                  0{idx + 1}
                </span>
                <p className="text-sm leading-relaxed text-slate-200">{rec}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Question-by-Question Transcript & Review */}
        <section className="glass-surface mt-6 rounded-2xl p-6 sm:p-8">
          <h2 className="font-display text-lg font-semibold text-white">
            Question-by-Question Review
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Expand any question to compare your submitted response against the Gemini model answer.
          </p>

          <div className="mt-5 divide-y divide-slate-800/90">
            {session.responses.map((item) => {
              const isOpen = expandedQuestionId === item.question.id;
              return (
                <div key={item.question.id} className="py-4 first:pt-1 last:pb-0">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setExpandedQuestionId(isOpen ? null : item.question.id)}
                    className="flex w-full items-center justify-between gap-4 text-left"
                  >
                    <div className="min-w-0">
                      <p className="text-xs text-slate-400">
                        Question {item.question.number} · {item.question.category} · {item.question.topic}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-white sm:text-base">
                        {item.question.question}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="font-mono text-sm font-semibold tabular-nums text-[#6994FF]">
                        {item.evaluation.score}/10
                      </span>
                      {isOpen ? (
                        <ChevronUp className="h-4 w-4 text-slate-400" aria-hidden="true" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-slate-400" aria-hidden="true" />
                      )}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="mt-4 space-y-4 rounded-xl bg-[#080D1B]/90 p-5 text-sm">
                      <div>
                        <p className="text-xs font-semibold text-slate-400">Your Submitted Answer</p>
                        <p className="mt-1.5 leading-relaxed text-slate-200 whitespace-pre-line">
                          {item.userAnswer}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 gap-4 border-t border-slate-800 pt-4 md:grid-cols-2">
                        <div>
                          <p className="text-xs font-semibold text-emerald-300">What Was Good</p>
                          <ul className="mt-1.5 list-disc space-y-1 pl-4 text-xs leading-relaxed text-slate-300">
                            {item.evaluation.whatWasGood.map((g, i) => (
                              <li key={i}>{g}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-amber-300">What Was Missing</p>
                          <ul className="mt-1.5 list-disc space-y-1 pl-4 text-xs leading-relaxed text-slate-300">
                            {item.evaluation.whatWasMissing.map((m, i) => (
                              <li key={i}>{m}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="border-t border-slate-800 pt-4">
                        <p className="text-xs font-semibold text-[#A17AFF]">Better Sample Answer</p>
                        <p className="mt-1.5 leading-relaxed text-slate-200 whitespace-pre-line">
                          {item.evaluation.betterSampleAnswer}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
