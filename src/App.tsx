import { useEffect, useState } from 'react';
import { AboutContactPage } from './components/AboutContactPage';
import { InterviewSession } from './components/InterviewSession';
import { InterviewSetup } from './components/InterviewSetup';
import { LandingPage } from './components/LandingPage';
import { Navbar } from './components/Navbar';
import { ResultsDashboard } from './components/ResultsDashboard';
import {
  requestAnswerEvaluation,
  requestFinalSummary,
  requestGeneratedQuestions,
} from './services/api';
import type {
  AppView,
  InterviewConfig,
  InterviewSessionRecord,
  QuestionResponseRecord,
} from './types/interview';
import { calculateOverallScore } from './utils/interviewLogic';
import {
  clearInterviewHistory,
  loadInterviewHistory,
  loadRecentQuestionTexts,
  recordAskedQuestions,
  saveInterviewSession,
} from './utils/storage';

const DEFAULT_CONFIG: InterviewConfig = {
  role: 'Python Developer',
  isCustomRole: false,
  customRoleText: '',
  experienceLevel: 'Fresher',
  interviewType: 'Mixed',
  questionCount: 5,
  difficulty: 'Medium',
};

function getInitialView(): AppView {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1') {
      return 'setup';
    }
  }
  return 'landing';
}

export default function App() {
  const [view, setView] = useState<AppView>(getInitialView);
  const [activeNavSection, setActiveNavSection] = useState<string | undefined>(undefined);
  const [config, setConfig] = useState<InterviewConfig>(DEFAULT_CONFIG);
  const [resolvedRole, setResolvedRole] = useState<string>(DEFAULT_CONFIG.role);

  const [records, setRecords] = useState<QuestionResponseRecord[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [setupError, setSetupError] = useState<string | null>(null);
  const [sessionError, setSessionError] = useState<string | null>(null);

  const [completedSession, setCompletedSession] = useState<InterviewSessionRecord | null>(null);
  const [history, setHistory] = useState<InterviewSessionRecord[]>(() => loadInterviewHistory());

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [view]);

  const handleNavigate = (targetView: AppView, sectionId?: string) => {
    setView(targetView);
    setActiveNavSection(sectionId);
    if (sectionId) {
      requestAnimationFrame(() => {
        setTimeout(() => {
          const el = document.getElementById(sectionId);
          el?.scrollIntoView({ behavior: 'smooth' });
        }, 60);
      });
    }
  };

  const handleStartSession = async (selectedConfig: InterviewConfig, roleTitle: string) => {
    setConfig(selectedConfig);
    setResolvedRole(roleTitle);
    setSetupError(null);
    setSessionError(null);
    setIsGenerating(true);

    try {
      const recentQuestions = loadRecentQuestionTexts();
      const generated = await requestGeneratedQuestions({
        role: roleTitle,
        experienceLevel: selectedConfig.experienceLevel,
        interviewType: selectedConfig.interviewType,
        questionCount: selectedConfig.questionCount,
        difficulty: selectedConfig.difficulty,
        previousQuestions: recentQuestions,
      });

      recordAskedQuestions(generated.map((q) => q.question));

      setRecords(
        generated.map((q) => ({
          question: q,
          userAnswer: '',
          evaluation: null,
          submittedAt: null,
        }))
      );
      setCurrentIndex(0);
      setView('interview');
    } catch (err) {
      setSetupError(
        err instanceof Error ? err.message : 'Unable to generate questions. Please try again.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpdateDraftAnswer = (index: number, text: string) => {
    setRecords((prev) =>
      prev.map((rec, idx) => (idx === index ? { ...rec, userAnswer: text } : rec))
    );
  };

  const handleSubmitAnswer = async (index: number) => {
    const target = records[index];
    if (!target) return;

    setSessionError(null);
    setIsEvaluating(true);

    try {
      const evaluation = await requestAnswerEvaluation({
        role: resolvedRole,
        experienceLevel: config.experienceLevel,
        difficulty: config.difficulty,
        question: target.question.question,
        category: target.question.category,
        topic: target.question.topic,
        userAnswer: target.userAnswer,
      });

      setRecords((prev) =>
        prev.map((rec, idx) =>
          idx === index
            ? {
                ...rec,
                evaluation,
                submittedAt: new Date().toISOString(),
              }
            : rec
        )
      );
    } catch (err) {
      setSessionError(
        err instanceof Error ? err.message : 'Unable to evaluate your answer. Please retry.'
      );
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleNextQuestion = () => {
    setSessionError(null);
    setCurrentIndex((prev) => Math.min(records.length - 1, prev + 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFinishInterview = async () => {
    const evaluatedRecords = records.filter(
      (r): r is QuestionResponseRecord & { evaluation: NonNullable<QuestionResponseRecord['evaluation']> } =>
        r.evaluation !== null
    );
    if (evaluatedRecords.length === 0) return;

    setSessionError(null);
    setIsFinalizing(true);

    try {
      const computedOverallScore = calculateOverallScore(
        evaluatedRecords.map((r) => r.evaluation)
      );

      const analysis = await requestFinalSummary({
        role: resolvedRole,
        experienceLevel: config.experienceLevel,
        interviewType: config.interviewType,
        difficulty: config.difficulty,
        computedOverallScore,
        responses: evaluatedRecords.map((r) => ({
          number: r.question.number,
          category: r.question.category,
          topic: r.question.topic,
          question: r.question.question,
          userAnswer: r.userAnswer,
          score: r.evaluation.score,
          technicalAccuracy: r.evaluation.technicalAccuracy,
          communicationQuality: r.evaluation.communicationQuality,
          whatWasGood: r.evaluation.whatWasGood,
          whatWasMissing: r.evaluation.whatWasMissing,
        })),
      });

      const sessionRecord: InterviewSessionRecord = {
        id: `session-${Date.now()}`,
        createdAt: new Date().toISOString(),
        config: {
          role: resolvedRole,
          experienceLevel: config.experienceLevel,
          interviewType: config.interviewType,
          questionCount: evaluatedRecords.length,
          difficulty: config.difficulty,
        },
        responses: evaluatedRecords.map((r) => ({
          question: r.question,
          userAnswer: r.userAnswer,
          evaluation: r.evaluation,
          submittedAt: r.submittedAt ?? new Date().toISOString(),
        })),
        analysis,
      };

      const updatedHistory = saveInterviewSession(sessionRecord);
      setHistory(updatedHistory);
      setCompletedSession(sessionRecord);
      setView('results');
    } catch (err) {
      setSessionError(
        err instanceof Error ? err.message : 'Unable to generate final report. Please retry.'
      );
    } finally {
      setIsFinalizing(false);
    }
  };

  const handleRestartSameConfig = () => {
    setView('setup');
    void handleStartSession(config, resolvedRole);
  };

  const handleClearHistory = () => {
    clearInterviewHistory();
    setHistory([]);
  };

  return (
    <div className="min-h-screen bg-[#080D1B] text-slate-100">
      <Navbar
        activeView={view}
        activeNavSection={activeNavSection}
        onNavigate={handleNavigate}
        onStartInterview={() => handleNavigate('setup')}
      />

      <main>
        {view === 'landing' && (
          <LandingPage
            onStartInterview={() => handleNavigate('setup')}
            onNavigate={handleNavigate}
            historyCount={history.length}
          />
        )}

        {view === 'setup' && (
          <InterviewSetup
            initialConfig={config}
            isGenerating={isGenerating}
            errorMessage={setupError}
            history={history}
            onStartSession={handleStartSession}
            onOpenHistorySession={(session) => {
              setCompletedSession(session);
              setView('results');
            }}
            onClearHistory={handleClearHistory}
          />
        )}

        {view === 'interview' && (
          <InterviewSession
            role={resolvedRole}
            experienceLevel={config.experienceLevel}
            interviewType={config.interviewType}
            difficulty={config.difficulty}
            records={records}
            currentIndex={currentIndex}
            isEvaluating={isEvaluating}
            isFinalizing={isFinalizing}
            errorMessage={sessionError}
            onSelectQuestion={(idx) => {
              setSessionError(null);
              setCurrentIndex(idx);
            }}
            onUpdateDraftAnswer={handleUpdateDraftAnswer}
            onSubmitAnswer={handleSubmitAnswer}
            onNextQuestion={handleNextQuestion}
            onFinishInterview={handleFinishInterview}
            onExitToSetup={() => setView('setup')}
          />
        )}

        {view === 'results' && completedSession && (
          <ResultsDashboard
            session={completedSession}
            onRestartInterview={handleRestartSameConfig}
            onNewSetup={() => setView('setup')}
          />
        )}

        {view === 'contact' && (
          <AboutContactPage onStartInterview={() => handleNavigate('setup')} />
        )}
      </main>
    </div>
  );
}
