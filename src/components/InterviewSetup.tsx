import { AlertCircle, ArrowRight, Clock, Loader2, Trash2 } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import {
  PRESET_ROLES,
  type DifficultyLevel,
  type ExperienceLevel,
  type InterviewConfig,
  type InterviewSessionRecord,
  type InterviewType,
} from '../types/interview';
import { formatShortDate, validateSetupConfig } from '../utils/interviewLogic';

interface InterviewSetupProps {
  initialConfig: InterviewConfig;
  isGenerating: boolean;
  errorMessage: string | null;
  history: InterviewSessionRecord[];
  onStartSession: (config: InterviewConfig, resolvedRole: string) => void;
  onOpenHistorySession: (session: InterviewSessionRecord) => void;
  onClearHistory: () => void;
}

const EXPERIENCE_LEVELS: ExperienceLevel[] = ['Fresher', 'Experienced'];
const INTERVIEW_TYPES: InterviewType[] = ['Technical', 'HR', 'Mixed'];
const DIFFICULTY_LEVELS: DifficultyLevel[] = ['Easy', 'Medium', 'Hard'];
const QUESTION_PRESETS = [3, 5, 7, 10];

export function InterviewSetup({
  initialConfig,
  isGenerating,
  errorMessage,
  history,
  onStartSession,
  onOpenHistorySession,
  onClearHistory,
}: InterviewSetupProps) {
  const [config, setConfig] = useState<InterviewConfig>(initialConfig);
  const [countDraft, setCountDraft] = useState<string>(String(initialConfig.questionCount));
  const [validationErrors, setValidationErrors] = useState<Partial<Record<'role' | 'questionCount', string>>>({});
  const [confirmClear, setConfirmClear] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const parsedDraft = Number(countDraft.trim());
    const nextConfig: InterviewConfig = {
      ...config,
      questionCount: countDraft.trim() === '' || Number.isNaN(parsedDraft) ? 0 : parsedDraft,
    };
    const check = validateSetupConfig(nextConfig);
    if (!check.valid) {
      setValidationErrors(check.errors);
      return;
    }
    setConfig(nextConfig);
    setValidationErrors({});
    onStartSession(nextConfig, check.resolvedRole);
  };

  return (
    <div className="ambient-backdrop min-h-[calc(100vh-65px)] py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-[#6994FF]">Interview Setup</p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Configure Your Mock Interview
          </h1>
          <p className="mt-2.5 text-sm leading-relaxed text-slate-400 sm:text-base">
            Select your role, seniority, track, and difficulty. Google Gemini will generate a tailored set of
            fresh questions for your session.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
          {/* Setup Form Column */}
          <form
            onSubmit={handleSubmit}
            noValidate
            className="glass-surface rounded-2xl p-6 sm:p-8 lg:col-span-7"
          >
            {/* Job Role */}
            <div>
              <label className="block font-display text-sm font-semibold text-white">
                Job Role
              </label>
              <p className="mt-1 text-xs text-slate-400">
                Choose a target discipline or enter any custom role title.
              </p>

              <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                {PRESET_ROLES.map((roleName) => {
                  const active = !config.isCustomRole && config.role === roleName;
                  return (
                    <button
                      key={roleName}
                      type="button"
                      onClick={() => {
                        setConfig((prev) => ({ ...prev, role: roleName, isCustomRole: false }));
                        setValidationErrors((prev) => ({ ...prev, role: undefined }));
                      }}
                      className={`rounded-xl border px-3.5 py-2.5 text-left text-sm font-medium transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#477BFF] ${
                        active
                          ? 'border-[#477BFF] bg-[#477BFF]/15 text-white shadow-sm shadow-[#477BFF]/15'
                          : 'border-slate-700/80 bg-[#0A1122]/80 text-slate-300 hover:border-slate-500 hover:text-white'
                      }`}
                    >
                      {roleName}
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() => {
                    setConfig((prev) => ({ ...prev, isCustomRole: true }));
                    setValidationErrors((prev) => ({ ...prev, role: undefined }));
                  }}
                  className={`rounded-xl border px-3.5 py-2.5 text-left text-sm font-medium transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8857FF] ${
                    config.isCustomRole
                      ? 'border-[#8857FF] bg-[#8857FF]/15 text-white shadow-sm shadow-[#8857FF]/15'
                      : 'border-slate-700/80 bg-[#0A1122]/80 text-slate-300 hover:border-slate-500 hover:text-white'
                  }`}
                >
                  Custom Role
                </button>
              </div>

              {config.isCustomRole && (
                <div className="mt-3">
                  <label htmlFor="custom-role-input" className="sr-only">
                    Custom Job Role
                  </label>
                  <input
                    id="custom-role-input"
                    type="text"
                    value={config.customRoleText}
                    onChange={(e) => {
                      setConfig((prev) => ({ ...prev, customRoleText: e.target.value }));
                      setValidationErrors((prev) => ({ ...prev, role: undefined }));
                    }}
                    placeholder="e.g., Machine Learning Intern, Cloud DevOps Engineer, Product Analyst"
                    className="w-full rounded-xl border border-slate-700 bg-[#080D1B] px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-[#477BFF] focus:outline-none"
                  />
                </div>
              )}

              {validationErrors.role && (
                <p role="alert" className="mt-2 text-xs font-medium text-rose-400">
                  {validationErrors.role}
                </p>
              )}
            </div>

            {/* Experience & Interview Type Row */}
            <div className="mt-7 grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <span className="block font-display text-sm font-semibold text-white">
                  Experience Level
                </span>
                <div className="mt-2.5 grid grid-cols-2 gap-2 rounded-xl bg-[#080D1B] p-1.5 border border-slate-800">
                  {EXPERIENCE_LEVELS.map((level) => {
                    const active = config.experienceLevel === level;
                    return (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setConfig((prev) => ({ ...prev, experienceLevel: level }))}
                        className={`rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                          active
                            ? 'bg-[#477BFF] text-white'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {level}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <span className="block font-display text-sm font-semibold text-white">
                  Interview Type
                </span>
                <div className="mt-2.5 grid grid-cols-3 gap-1.5 rounded-xl bg-[#080D1B] p-1.5 border border-slate-800">
                  {INTERVIEW_TYPES.map((type) => {
                    const active = config.interviewType === type;
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setConfig((prev) => ({ ...prev, interviewType: type }))}
                        className={`rounded-lg px-2.5 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                          active
                            ? 'bg-[#477BFF] text-white'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {type}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Difficulty & Number of Questions */}
            <div className="mt-7 grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <span className="block font-display text-sm font-semibold text-white">
                  Difficulty
                </span>
                <div className="mt-2.5 grid grid-cols-3 gap-1.5 rounded-xl bg-[#080D1B] p-1.5 border border-slate-800">
                  {DIFFICULTY_LEVELS.map((diff) => {
                    const active = config.difficulty === diff;
                    return (
                      <button
                        key={diff}
                        type="button"
                        onClick={() => setConfig((prev) => ({ ...prev, difficulty: diff }))}
                        className={`rounded-lg px-2.5 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                          active
                            ? 'bg-[#8857FF] text-white'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {diff}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label htmlFor="question-count-input" className="block font-display text-sm font-semibold text-white">
                  Number of Questions
                </label>
                <div className="mt-2.5 flex items-center gap-2">
                  <div className="grid flex-1 grid-cols-4 gap-1.5 rounded-xl bg-[#080D1B] p-1.5 border border-slate-800">
                    {QUESTION_PRESETS.map((count) => {
                      const active = countDraft.trim() === String(count);
                      return (
                        <button
                          key={count}
                          type="button"
                          onClick={() => {
                            setConfig((prev) => ({ ...prev, questionCount: count }));
                            setCountDraft(String(count));
                            setValidationErrors((prev) => ({ ...prev, questionCount: undefined }));
                          }}
                          className={`rounded-lg py-2 font-mono text-sm font-medium tabular-nums transition-colors ${
                            active
                              ? 'bg-[#477BFF] text-white'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {count}
                        </button>
                      );
                    })}
                  </div>
                  <input
                    id="question-count-input"
                    type="number"
                    min={1}
                    max={10}
                    value={countDraft}
                    onChange={(e) => {
                      const raw = e.target.value;
                      setCountDraft(raw);
                      const val = parseInt(raw, 10);
                      if (!Number.isNaN(val)) {
                        setConfig((prev) => ({ ...prev, questionCount: val }));
                      }
                      setValidationErrors((prev) => ({ ...prev, questionCount: undefined }));
                    }}
                    aria-label="Custom number of questions"
                    className="w-16 rounded-xl border border-slate-700 bg-[#080D1B] px-3 py-2.5 text-center font-mono text-sm tabular-nums text-white focus:border-[#477BFF] focus:outline-none"
                  />
                </div>
                {validationErrors.questionCount && (
                  <p role="alert" className="mt-2 text-xs font-medium text-rose-400">
                    {validationErrors.questionCount}
                  </p>
                )}
              </div>
            </div>

            {errorMessage && (
              <div
                role="alert"
                className="mt-6 flex items-start gap-3 rounded-xl border border-rose-500/40 bg-rose-950/35 px-4 py-3.5 text-sm text-rose-200"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" aria-hidden="true" />
                <div>
                  <p className="font-medium text-rose-100">Could not start interview</p>
                  <p className="mt-0.5 text-xs text-rose-200/90">{errorMessage}</p>
                </div>
              </div>
            )}

            <div className="mt-8 flex flex-col gap-3 border-t border-slate-800 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-slate-400">
                {config.interviewType === 'Mixed'
                  ? 'Includes both Technical and HR questions tailored to your role.'
                  : `Generates ${config.questionCount} ${config.interviewType} questions calibrated for ${config.experienceLevel} level.`}
              </p>

              <button
                type="submit"
                disabled={isGenerating}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#477BFF] to-[#5E6BFF] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#477BFF]/20 transition-all hover:brightness-110 disabled:opacity-60 whitespace-nowrap shrink-0"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    <span>Generating Questions…</span>
                  </>
                ) : (
                  <>
                    <span>Start Interview</span>
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Local Storage Interview History Column */}
          <aside className="glass-surface rounded-2xl p-6 sm:p-7 lg:col-span-5" aria-label="Interview History">
            <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h2 className="font-display text-lg font-semibold text-white">Interview History</h2>
                <p className="mt-0.5 text-xs text-slate-400">
                  Saved locally in your browser
                </p>
              </div>

              {history.length > 0 && !confirmClear && (
                <button
                  type="button"
                  onClick={() => setConfirmClear(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700/80 px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:border-rose-500/50 hover:text-rose-300 whitespace-nowrap shrink-0"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Clear History</span>
                </button>
              )}

              {history.length > 0 && confirmClear && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onClearHistory();
                      setConfirmClear(false);
                    }}
                    className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-500 whitespace-nowrap"
                  >
                    Confirm Clear
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmClear(false)}
                    className="rounded-lg border border-slate-700 px-2.5 py-1.5 text-xs text-slate-300 hover:text-white whitespace-nowrap"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {history.length === 0 ? (
              <div className="py-10 text-center">
                <Clock className="mx-auto h-8 w-8 text-slate-600" aria-hidden="true" />
                <p className="mt-3 text-sm font-medium text-slate-300">No completed sessions yet</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-400">
                  Complete your first mock interview on the left to record your score, review past feedback,
                  and export PDF reports anytime.
                </p>
              </div>
            ) : (
              <ul className="mt-4 divide-y divide-slate-800/80">
                {history.map((session) => (
                  <li key={session.id} className="py-3.5 first:pt-1 last:pb-0">
                    <button
                      type="button"
                      onClick={() => onOpenHistorySession(session)}
                      className="group flex w-full items-center justify-between gap-4 rounded-xl px-2 py-2 text-left transition-colors hover:bg-slate-800/50"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-white group-hover:text-[#6994FF] transition-colors">
                          {session.config.role}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-400">
                          {session.config.interviewType} · {session.config.difficulty} ·{' '}
                          {formatShortDate(session.createdAt)}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="font-mono text-base font-semibold tabular-nums text-white">
                          {session.analysis.overallScore}
                          <span className="text-xs font-normal text-slate-400">/100</span>
                        </p>
                        <p className="text-xs text-slate-400">{session.analysis.performanceTier}</p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
