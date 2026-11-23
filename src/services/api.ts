import type {
  AnswerEvaluation,
  ContactFormInput,
  DifficultyLevel,
  ExperienceLevel,
  FinalInterviewAnalysis,
  InterviewQuestion,
  InterviewType,
  QuestionCategory,
} from '../types/interview';

async function postJson<TResponse>(url: string, body: unknown): Promise<TResponse> {
  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error('Could not reach the InterviewAce AI server. Check your connection and try again.');
  }

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const msg =
      data && typeof data.error === 'string'
        ? data.error
        : `Request failed with status ${response.status}. Please retry.`;
    throw new Error(msg);
  }

  return data as TResponse;
}

export async function requestGeneratedQuestions(params: {
  role: string;
  experienceLevel: ExperienceLevel;
  interviewType: InterviewType;
  questionCount: number;
  difficulty: DifficultyLevel;
  previousQuestions: string[];
}): Promise<InterviewQuestion[]> {
  const data = await postJson<{ questions: InterviewQuestion[] }>('/api/interview/generate-questions', params);
  return data.questions;
}

export async function requestAnswerEvaluation(params: {
  role: string;
  experienceLevel: ExperienceLevel;
  difficulty: DifficultyLevel;
  question: string;
  category: QuestionCategory;
  topic: string;
  userAnswer: string;
}): Promise<AnswerEvaluation> {
  const data = await postJson<{ evaluation: AnswerEvaluation }>('/api/interview/evaluate-answer', params);
  return data.evaluation;
}

export async function requestFinalSummary(params: {
  role: string;
  experienceLevel: ExperienceLevel;
  interviewType: InterviewType;
  difficulty: DifficultyLevel;
  computedOverallScore: number;
  responses: Array<{
    number: number;
    category: QuestionCategory;
    topic: string;
    question: string;
    userAnswer: string;
    score: number;
    technicalAccuracy: number;
    communicationQuality: number;
    whatWasGood: string[];
    whatWasMissing: string[];
  }>;
}): Promise<FinalInterviewAnalysis> {
  const data = await postJson<{ analysis: FinalInterviewAnalysis }>('/api/interview/final-summary', params);
  return data.analysis;
}

export async function submitContactMessage(
  input: ContactFormInput
): Promise<{ ok: boolean; referenceId: string; receivedAt: string }> {
  return postJson<{ ok: boolean; referenceId: string; receivedAt: string }>('/api/contact', input);
}
