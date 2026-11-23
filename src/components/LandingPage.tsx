import { ArrowRight, BarChart3, CheckCircle2, FileDown, History, Layers, MessageSquareText } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import type { AppView } from '../types/interview';

interface LandingPageProps {
  onStartInterview: () => void;
  onNavigate: (view: AppView, sectionId?: string) => void;
  historyCount: number;
}

const HERO_IMAGE_SRC = '/src/assets/images/hero_interview_studio_1795415872276.jpg';

const HOW_IT_WORKS_STEPS = [
  {
    step: '01',
    title: 'Configure Your Session',
    description:
      'Choose your target role—from Python Developer and AI Engineer to any custom position—along with experience level, Technical, HR, or Mixed track, and difficulty.',
  },
  {
    step: '02',
    title: 'Answer Tailored Questions',
    description:
      'Google Gemini dynamically generates fresh, non-repeating questions matched to your role and seniority, presented one at a time with live session progress.',
  },
  {
    step: '03',
    title: 'Review Real-Time AI Evaluation',
    description:
      'Submit each answer for structured grading out of 10 covering technical accuracy, communication quality, concrete gaps, actionable suggestions, and a strong model answer.',
  },
  {
    step: '04',
    title: 'Analyze Results & Export PDF',
    description:
      'Finish with a complete performance dashboard out of 100, per-question score charts, personalized study recommendations, local session history, and a downloadable PDF report.',
  },
];

export function LandingPage({ onStartInterview, onNavigate, historyCount }: LandingPageProps) {
  const [heroImgFailed, setHeroImgFailed] = useState(false);

  return (
    <div className="ambient-backdrop">
      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-5 pt-14 pb-20 sm:px-8 lg:pt-20 lg:pb-28">
        <div className="grid grid-cols-1 items-stretch gap-10 lg:grid-cols-12 lg:gap-12">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col justify-center lg:col-span-6"
          >
            <p className="text-sm font-medium tracking-wide text-[#6994FF]">
              Practice Smart. Answer Confidently. Get Hired.
            </p>
            <h1
              className="mt-4 font-display text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-[3.4rem] lg:leading-[1.08]"
              style={{ textWrap: 'balance' }}
            >
              Your Personal AI Interview Coach
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
              InterviewAce AI helps college students and job seekers rehearse real-world technical and HR
              interviews with Google Gemini AI. Get role-specific questions, grounded feedback on every answer,
              model sample responses, and a complete performance report.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={onStartInterview}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#477BFF] to-[#5B6BFF] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#477BFF]/20 transition-all hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6994FF] whitespace-nowrap shrink-0"
              >
                <span>Start Interview</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>

              <a
                href="#how-it-works"
                className="inline-flex items-center rounded-xl border border-slate-700/80 bg-[#111A2E]/70 px-5 py-3.5 text-sm font-medium text-slate-200 transition-colors hover:border-slate-500 hover:text-white whitespace-nowrap shrink-0"
              >
                See How It Works
              </a>
            </div>

            <div className="mt-10 flex flex-col gap-y-1.5 border-t border-slate-800/90 pt-6 text-xs text-slate-400 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-5 sm:gap-y-2">
              <span>Technical, HR &amp; Mixed Tracks</span>
              <span aria-hidden="true" className="hidden sm:inline">·</span>
              <span>Structured Gemini AI Scoring</span>
              <span aria-hidden="true" className="hidden sm:inline">·</span>
              <span>Downloadable PDF Reports</span>
              {historyCount > 0 && (
                <>
                  <span aria-hidden="true" className="hidden sm:inline">·</span>
                  <span className="font-mono tabular-nums text-slate-300">
                    {historyCount} {historyCount === 1 ? 'session' : 'sessions'} saved locally
                  </span>
                </>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6"
          >
            <div className="relative h-full min-h-[300px] overflow-hidden rounded-2xl border border-slate-800/90 bg-[#111A2E] lg:min-h-[430px]">
              {!heroImgFailed ? (
                <img
                  src={HERO_IMAGE_SRC}
                  alt="Candidate practicing system design and technical interview questions at a modern workspace"
                  referrerPolicy="no-referrer"
                  onError={() => setHeroImgFailed(true)}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full min-h-[340px] flex-col items-center justify-center bg-gradient-to-br from-[#111A2E] via-[#15223D] to-[#080D1B] p-8 text-center">
                  <Layers className="h-10 w-10 text-[#477BFF]" aria-hidden="true" />
                  <p className="mt-3 font-display text-lg font-semibold text-white">
                    Structured Technical &amp; HR Interview Practice
                  </p>
                </div>
              )}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#080D1B]/90 via-[#080D1B]/25 to-transparent" />
              <div className="absolute right-0 bottom-0 left-0 p-6">
                <p className="text-xs font-medium text-[#93B4FF]">
                  Role-Adaptive Coaching · Technical &amp; Behavioral Rubrics
                </p>
                <p className="mt-1 text-sm text-slate-200">
                  Every answer is evaluated on domain accuracy, clarity, missing concepts, and paired with a
                  refined sample response.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Capabilities / Asymmetric Feature Bento */}
      <section id="features" className="border-t border-slate-800/80 py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-[#8857FF]">Platform Capabilities</p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Built for Real Hiring Loops, Not Generic Flashcards
            </h2>
            <p className="mt-3 text-base leading-relaxed text-slate-400">
              Every question, score, and recommendation is generated live by Google Gemini around your chosen
              role, experience tier, and actual written answers.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Marquee Card 1 (7 cols) */}
            <div className="glass-surface flex flex-col justify-between rounded-2xl p-7 lg:col-span-7">
              <div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#477BFF]/15 text-[#6994FF]">
                  <Layers className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="mt-5 font-display text-xl font-semibold text-white">
                  Dynamic Role-Specific Question Generation
                </h3>
                <p className="mt-2.5 max-w-xl text-sm leading-relaxed text-slate-300">
                  Generate tailored sets for Python Developer, AI Engineer, Data Analyst, Web Developer, Java
                  Developer, Software Engineer, or any custom job title. Mixed mode balances technical depth
                  with realistic HR behavioral scenarios while preventing repeated questions across sessions.
                </p>
              </div>
              <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-slate-800/80 pt-5 text-xs text-slate-400">
                <span>Fresher &amp; Experienced Calibration</span>
                <span aria-hidden="true">·</span>
                <span>Easy, Medium &amp; Hard Difficulty</span>
                <span aria-hidden="true">·</span>
                <span>One Question at a Time</span>
              </div>
            </div>

            {/* Card 2 (5 cols) */}
            <div className="glass-surface flex flex-col justify-between rounded-2xl p-7 lg:col-span-5">
              <div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#8857FF]/15 text-[#A17AFF]">
                  <MessageSquareText className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="mt-5 font-display text-xl font-semibold text-white">
                  Honest, Answer-Specific AI Evaluation
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-slate-300">
                  Receive a score out of 10 with separate ratings for technical accuracy and communication
                  quality, specific notes on what worked and what was missing, plus a high-scoring model answer.
                </p>
              </div>
              <div className="mt-7 border-t border-slate-800/80 pt-5 text-xs text-slate-400">
                Grounded strictly in your response · Actionable improvement steps
              </div>
            </div>

            {/* Card 3 (5 cols) */}
            <div className="glass-surface flex flex-col justify-between rounded-2xl p-7 lg:col-span-5">
              <div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#8857FF]/15 text-[#A17AFF]">
                  <BarChart3 className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="mt-5 font-display text-xl font-semibold text-white">
                  Results Dashboard &amp; Score Charts
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-slate-300">
                  Review your overall score out of 100, question-by-question bar chart, strongest areas,
                  priority gaps, and tailored preparation roadmap in one clean dashboard.
                </p>
              </div>
              <div className="mt-7 border-t border-slate-800/80 pt-5 text-xs text-slate-400">
                Overall /100 score · Visual breakdowns · Coach summary
              </div>
            </div>

            {/* Card 4 (7 cols) */}
            <div className="glass-surface flex flex-col justify-between rounded-2xl p-7 lg:col-span-7">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#477BFF]/15 text-[#6994FF]">
                    <FileDown className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <h3 className="mt-5 font-display text-lg font-semibold text-white">
                    Downloadable PDF Interview Reports
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-300">
                    Export any completed mock interview into a structured PDF report containing scores,
                    feedback, your original answers, and recommended model answers for offline study or mentor
                    review.
                  </p>
                </div>

                <div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#477BFF]/15 text-[#6994FF]">
                    <History className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <h3 className="mt-5 font-display text-lg font-semibold text-white">
                    Local Session History &amp; Review
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-300">
                    Every completed session saves automatically in browser local storage so you can revisit
                    older scorecards, track steady score gains, or clear history anytime.
                  </p>
                </div>
              </div>

              <div className="mt-7 flex items-center justify-between border-t border-slate-800/80 pt-5 text-xs text-slate-400">
                <span>Private browser storage · Instant PDF export</span>
                <button
                  type="button"
                  onClick={onStartInterview}
                  className="font-semibold text-[#6994FF] hover:text-white transition-colors"
                >
                  Open Interview Setup →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="border-t border-slate-800/80 bg-[#0B1224]/70 py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-[#6994FF]">How It Works</p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Four Steps from Setup to Interview Readiness
            </h2>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {HOW_IT_WORKS_STEPS.map((item) => (
              <div
                key={item.step}
                className="flex flex-col border-t border-slate-700/70 pt-6"
              >
                <span className="font-mono text-sm font-semibold tabular-nums text-[#6994FF]">
                  {item.step}
                </span>
                <h3 className="mt-3 font-display text-lg font-semibold text-white">{item.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-slate-400">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA Band */}
      <section className="border-t border-slate-800/80 py-20">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <div className="glass-surface-elevated flex flex-col items-start justify-between gap-8 rounded-2xl p-8 sm:p-10 lg:flex-row lg:items-center">
            <div className="max-w-xl">
              <h2 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Ready for Your Next Mock Interview?
              </h2>
              <p className="mt-2.5 text-sm leading-relaxed text-slate-300 sm:text-base">
                Pick a target role, answer five tailored questions, and walk away with a clear action plan and
                downloadable PDF scorecard.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-400">
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#477BFF]" aria-hidden="true" />
                  Instant setup
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#477BFF]" aria-hidden="true" />
                  Real-time Gemini evaluation
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#477BFF]" aria-hidden="true" />
                  No account required
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onStartInterview}
              className="inline-flex items-center gap-2 rounded-xl bg-[#477BFF] px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#3A6DF0] whitespace-nowrap shrink-0"
            >
              <span>Start Interview</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#060A15] py-12">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-8 px-5 sm:px-8 md:flex-row md:items-center">
          <div>
            <p className="font-display text-base font-bold text-white">InterviewAce AI</p>
            <p className="mt-1 text-xs text-slate-400">
              Practice Smart. Answer Confidently. Get Hired.
            </p>
          </div>

          <nav aria-label="Footer navigation" className="flex flex-wrap items-center gap-6 text-sm text-slate-400">
            <button
              type="button"
              onClick={() => onNavigate('landing')}
              className="transition-colors hover:text-white"
            >
              Home
            </button>
            <button
              type="button"
              onClick={() => onNavigate('landing', 'features')}
              className="transition-colors hover:text-white"
            >
              Features
            </button>
            <button
              type="button"
              onClick={onStartInterview}
              className="transition-colors hover:text-white"
            >
              Interview Setup
            </button>
            <button
              type="button"
              onClick={() => onNavigate('contact', 'about')}
              className="transition-colors hover:text-white"
            >
              About
            </button>
            <button
              type="button"
              onClick={() => onNavigate('contact', 'contact-form')}
              className="transition-colors hover:text-white"
            >
              Contact
            </button>
          </nav>

          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} InterviewAce AI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
