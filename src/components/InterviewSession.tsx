import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Copy,
  Lightbulb,
  Loader2,
  Send,
  Sparkles,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import type {
  DifficultyLevel,
  ExperienceLevel,
  InterviewType,
  QuestionResponseRecord,
} from '../types/interview';
import { validateAnswerText } from '../utils/interviewLogic';

interface InterviewSessionProps {
  role: string;
  experienceLevel: ExperienceLevel;
  interviewType: InterviewType;
  difficulty: DifficultyLevel;
  records: QuestionResponseRecord[];
  currentIndex: number;
  isEvaluating: boolean;
  isFinalizing: boolean;
  errorMessage: string | null;
  onSelectQuestion: (index: number) => void;
  onUpdateDraftAnswer: (index: number, text: string) => void;
  onSubmitAnswer: (index: number) => void;
  onNextQuestion: () => void;
  onFinishInterview: () => void;
  onExitToSetup: () => void;
}

export function InterviewSession({
  role,
  experienceLevel,
  interviewType,
  difficulty,
  records,
  currentIndex,
  isEvaluating,
  isFinalizing,
  errorMessage,
  onSelectQuestion,
  onUpdateDraftAnswer,
  onSubmitAnswer,
  onNextQuestion,
  onFinishInterview,
  onExitToSetup,
}: InterviewSessionProps) {
  const [answerError, setAnswerError] = useState<string | null>(null);
  const [copiedSample, setCopiedSample] = useState(false);

  const currentRecord = records[currentIndex];
  if (!currentRecord) return null;

  const totalQuestions = records.length;
  const evaluatedCount = records.filter((r) => r.evaluation !== null).length;
  const allEvaluated = evaluatedCount === totalQuestions && totalQuestions > 0;
  const isLastQuestion = currentIndex === totalQuestions - 1;
  const progressPercent = Math.round(((currentIndex + 1) / totalQuestions) * 100);

  const { wordCount } = validateAnswerText(currentRecord.userAnswer);

  const handleEvaluateClick = () => {
    const check = validateAnswerText(currentRecord.userAnswer);
    if (!check.valid) {
      setAnswerError(check.error ?? 'Please write a fuller answer before submitting.');
      return;
    }
    setAnswerError(null);
    onSubmitAnswer(currentIndex);
  };

  const handleCopySample = async () => {
    if (!currentRecord.evaluation?.betterSampleAnswer) return;
    try {
      await navigator.clipboard.writeText(currentRecord.evaluation.betterSampleAnswer);
      setCopiedSample(true);
      setTimeout(() => setCopiedSample(false), 1800);
    } catch {
      // Clipboard may be unavailable in restricted contexts
    }
  };

  return (
    <div className="ambient-backdrop min-h-[calc(100vh-65px)] py-8 sm:py-10">
      <div className="mx-auto max-w-5xl px-5 sm:px-8">
        {/* Session Header & Progress */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <button
              type="button"
              onClick={onExitToSetup}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 transition-colors hover:text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Back to Setup</span>
            </button>
            <h1 className="mt-2 font-display text-2xl font-bold text-white sm:text-3xl">{role}</h1>
            <p className="mt-1 text-xs text-slate-400">
              {experienceLevel} · {interviewType} · {difficulty} ·{' '}
              <span className="font-mono tabular-nums text-slate-300">
                {evaluatedCount}/{totalQuestions} evaluated
              </span>
            </p>
          </div>

          <div className="sm:text-right">
            <p className="font-mono text-sm font-semibold tabular-nums text-white">
              Question {currentIndex + 1} of {totalQuestions}
            </p>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-800 sm:w-52">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#477BFF] to-[#8857FF] transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Question Review Stepper */}
        <nav
          aria-label="Interview questions navigation"
          className="mt-6 flex flex-wrap items-center gap-2 border-b border-slate-800/80 pb-5"
        >
          {records.map((rec, idx) => {
            const isCurrent = idx === currentIndex;
            const isDone = rec.evaluation !== null;
            return (
              <button
                key={rec.question.id}
                type="button"
                onClick={() => {
                  setAnswerError(null);
                  onSelectQuestion(idx);
                }}
                disabled={isEvaluating || isFinalizing}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-mono text-xs font-medium tabular-nums transition-colors ${
                  isCurrent
                    ? 'border-[#477BFF] bg-[#477BFF]/20 text-white'
                    : isDone
                      ? 'border-emerald-500/40 bg-emerald-950/25 text-emerald-200 hover:border-emerald-400'
                      : 'border-slate-800 bg-[#111A2E]/70 text-slate-400 hover:border-slate-600 hover:text-slate-200'
                }`}
                aria-current={isCurrent ? 'step' : undefined}
              >
                <span>Q{rec.question.number}</span>
                {isDone && (
                  <span className="text-emerald-300">· {rec.evaluation!.score}/10</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Active Question Card */}
        <motion.section
          key={currentRecord.question.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="glass-surface mt-6 rounded-2xl p-6 sm:p-8"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
            <span>
              <span className="font-semibold text-[#6994FF]">{currentRecord.question.category}</span>
              <span className="mx-2" aria-hidden="true">·</span>
              <span>{currentRecord.question.topic}</span>
            </span>
            <span className="font-mono tabular-nums">
              Question {currentRecord.question.number} / {totalQuestions}
            </span>
          </div>

          <h2 className="mt-4 font-display text-xl leading-snug font-semibold text-white sm:text-2xl">
            {currentRecord.question.question}
          </h2>

          <p className="mt-3 text-xs leading-relaxed text-slate-400">
            Interviewer focus: {currentRecord.question.expectedFocus}
          </p>

          {/* Answer Input Area */}
          <div className="mt-6">
            <div className="flex items-center justify-between">
              <label htmlFor="candidate-answer" className="text-sm font-medium text-slate-200">
                Your Answer
              </label>
              <span className="font-mono text-xs tabular-nums text-slate-400">
                {wordCount} {wordCount === 1 ? 'word' : 'words'}
              </span>
            </div>

            <textarea
              id="candidate-answer"
              rows={7}
              value={currentRecord.userAnswer}
              onChange={(e) => {
                setAnswerError(null);
                onUpdateDraftAnswer(currentIndex, e.target.value);
              }}
              disabled={isEvaluating || isFinalizing}
              placeholder="Write your complete, structured answer here. Explain your reasoning, trade-offs, or STAR examples clearly..."
              className="mt-2.5 w-full resize-y rounded-xl border border-slate-700/90 bg-[#080D1B] p-4 text-sm leading-relaxed text-slate-100 placeholder-slate-500 focus:border-[#477BFF] focus:outline-none disabled:opacity-65 sm:text-base"
            />

            {answerError && (
              <p role="alert" className="mt-2 text-xs font-medium text-rose-400">
                {answerError}
              </p>
            )}

            {errorMessage && (
              <div
                role="alert"
                className="mt-4 flex items-start gap-3 rounded-xl border border-rose-500/40 bg-rose-950/35 px-4 py-3 text-sm text-rose-200"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" aria-hidden="true" />
                <div>
                  <p className="font-medium text-rose-100">AI request failed</p>
                  <p className="mt-0.5 text-xs text-rose-200/90">{errorMessage}</p>
                </div>
              </div>
            )}

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleEvaluateClick}
                disabled={isEvaluating || isFinalizing}
                className="inline-flex items-center gap-2 rounded-xl bg-[#477BFF] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#3A6DF0] disabled:opacity-60 whitespace-nowrap shrink-0"
              >
                {isEvaluating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    <span>Evaluating with Gemini…</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" aria-hidden="true" />
                    <span>{currentRecord.evaluation ? 'Re-evaluate Answer' : 'Submit Answer'}</span>
                  </>
                )}
              </button>

              <div className="flex flex-wrap items-center gap-3">
                {!isLastQuestion && (
                  <button
                    type="button"
                    onClick={() => {
                      setAnswerError(null);
                      onNextQuestion();
                    }}
                    disabled={isEvaluating || isFinalizing || !currentRecord.evaluation}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-[#111A2E] px-5 py-3 text-sm font-semibold text-white transition-colors hover:border-[#477BFF] hover:bg-[#192642] disabled:opacity-45 whitespace-nowrap shrink-0"
                  >
                    <span>Next Question</span>
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                )}

                {(isLastQuestion || allEvaluated) && (
                  <button
                    type="button"
                    onClick={onFinishInterview}
                    disabled={isEvaluating || isFinalizing || !allEvaluated}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#477BFF] to-[#8857FF] px-5 py-3 text-sm font-semibold text-white transition-all hover:brightness-110 disabled:opacity-45 whitespace-nowrap shrink-0"
                  >
                    {isFinalizing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                        <span>Compiling Results…</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" aria-hidden="true" />
                        <span>View Final Results</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.section>

        {/* Loading Skeleton during Gemini evaluation */}
        {isEvaluating && (
          <section
            aria-live="polite"
            className="glass-surface mt-6 rounded-2xl p-6 sm:p-8"
          >
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-[#477BFF]" aria-hidden="true" />
              <p className="font-display text-base font-semibold text-white">
                Gemini AI is analyzing your response…
              </p>
            </div>
            <p className="mt-1.5 text-xs text-slate-400">
              Checking technical accuracy, clarity, missing concepts, and drafting a tailored model answer.
            </p>
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="h-20 animate-pulse rounded-xl bg-slate-800/70" />
              <div className="h-20 animate-pulse rounded-xl bg-slate-800/70" />
              <div className="h-20 animate-pulse rounded-xl bg-slate-800/70" />
            </div>
            <div className="mt-5 space-y-2.5">
              <div className="h-4 w-3/4 animate-pulse rounded bg-slate-800/70" />
              <div className="h-4 w-full animate-pulse rounded bg-slate-800/60" />
              <div className="h-4 w-5/6 animate-pulse rounded bg-slate-800/60" />
            </div>
          </section>
        )}

        {/* AI Evaluation Feedback Panel */}
        {!isEvaluating && currentRecord.evaluation && (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            aria-label="AI Answer Evaluation"
            className="glass-surface-elevated mt-6 rounded-2xl p-6 sm:p-8"
          >
            <div className="flex flex-col gap-4 border-b border-slate-800 pb-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-medium text-[#6994FF]">Gemini AI Evaluation</p>
                <h3 className="mt-1 font-display text-xl font-bold text-white">
                  Answer Feedback &amp; Coaching
                </h3>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-4xl font-bold tabular-nums text-white">
                  {currentRecord.evaluation.score}
                </span>
                <span className="font-mono text-base text-slate-400">/ 10</span>
              </div>
            </div>

            {/* Technical Accuracy & Communication Quality Metrics */}
            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-white">Technical Accuracy</span>
                  <span className="font-mono font-semibold tabular-nums text-[#6994FF]">
                    {currentRecord.evaluation.technicalAccuracy} / 10
                  </span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-[#477BFF]"
                    style={{ width: `${Math.min(100, currentRecord.evaluation.technicalAccuracy * 10)}%` }}
                  />
                </div>
                <p className="mt-2 text-xs leading-relaxed text-slate-300">
                  {currentRecord.evaluation.technicalAccuracyNote}
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-white">Communication Quality</span>
                  <span className="font-mono font-semibold tabular-nums text-[#A17AFF]">
                    {currentRecord.evaluation.communicationQuality} / 10
                  </span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-[#8857FF]"
                    style={{ width: `${Math.min(100, currentRecord.evaluation.communicationQuality * 10)}%` }}
                  />
                </div>
                <p className="mt-2 text-xs leading-relaxed text-slate-300">
                  {currentRecord.evaluation.communicationQualityNote}
                </p>
              </div>
            </div>

            {/* What Was Good & What Was Missing */}
            <div className="mt-8 grid grid-cols-1 gap-8 border-t border-slate-800 pt-7 md:grid-cols-2">
              <div>
                <h4 className="font-display text-sm font-semibold text-emerald-300">
                  What Was Good
                </h4>
                <ul className="mt-3 space-y-2.5 text-sm leading-relaxed text-slate-200">
                  {currentRecord.evaluation.whatWasGood.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-display text-sm font-semibold text-amber-300">
                  What Was Missing
                </h4>
                <ul className="mt-3 space-y-2.5 text-sm leading-relaxed text-slate-200">
                  {currentRecord.evaluation.whatWasMissing.map((gap, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" aria-hidden="true" />
                      <span>{gap}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Specific Improvement Suggestions */}
            <div className="mt-8 border-t border-slate-800 pt-7">
              <h4 className="font-display text-sm font-semibold text-white">
                Specific Improvement Suggestions
              </h4>
              <ul className="mt-3 space-y-2.5 text-sm leading-relaxed text-slate-300">
                {currentRecord.evaluation.improvementSuggestions.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-[#6994FF]" aria-hidden="true" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Better Sample Answer */}
            <div className="mt-8 border-t border-slate-800 pt-7">
              <div className="flex items-center justify-between gap-4">
                <h4 className="font-display text-sm font-semibold text-[#A17AFF]">
                  Better Sample Answer
                </h4>
                <button
                  type="button"
                  onClick={handleCopySample}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:border-slate-500 hover:text-white whitespace-nowrap"
                >
                  {copiedSample ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Copy Sample</span>
                    </>
                  )}
                </button>
              </div>
              <p className="mt-3 rounded-xl bg-[#080D1B]/90 p-4 text-sm leading-relaxed text-slate-200 whitespace-pre-line">
                {currentRecord.evaluation.betterSampleAnswer}
              </p>
            </div>

            {/* Bottom Step Action */}
            <div className="mt-7 flex justify-end border-t border-slate-800 pt-6">
              {!isLastQuestion ? (
                <button
                  type="button"
                  onClick={onNextQuestion}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#477BFF] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#3A6DF0]"
                >
                  <span>Next Question</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onFinishInterview}
                  disabled={!allEvaluated || isFinalizing}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#477BFF] to-[#8857FF] px-6 py-3 text-sm font-semibold text-white transition-all hover:brightness-110 disabled:opacity-50"
                >
                  {isFinalizing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                      <span>Generating Final Results…</span>
                    </>
                  ) : (
                    <>
                      <span>Complete &amp; View Results Dashboard</span>
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </>
                  )}
                </button>
              )}
            </div>
          </motion.section>
        )}
      </div>
    </div>
  );
}
