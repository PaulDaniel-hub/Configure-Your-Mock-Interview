import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';

const MODEL_NAME = 'gemini-4-hydrogen';

export interface GenerateQuestionsPayload {
  role: string;
  experienceLevel: 'Fresher' | 'Experienced';
  interviewType: 'Technical' | 'HR' | 'Mixed';
  questionCount: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  previousQuestions?: string[];
}

export interface GeneratedQuestionItem {
  id: string;
  number: number;
  question: string;
  category: 'Technical' | 'HR';
  topic: string;
  expectedFocus: string;
}

export interface EvaluateAnswerPayload {
  role: string;
  experienceLevel: 'Fresher' | 'Experienced';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  question: string;
  category: 'Technical' | 'HR';
  topic: string;
  userAnswer: string;
}

export interface EvaluatedAnswerResult {
  score: number;
  technicalAccuracy: number;
  communicationQuality: number;
  technicalAccuracyNote: string;
  communicationQualityNote: string;
  whatWasGood: string[];
  whatWasMissing: string[];
  improvementSuggestions: string[];
  betterSampleAnswer: string;
}

export interface FinalSummaryPayload {
  role: string;
  experienceLevel: 'Fresher' | 'Experienced';
  interviewType: 'Technical' | 'HR' | 'Mixed';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  computedOverallScore: number;
  responses: Array<{
    number: number;
    category: 'Technical' | 'HR';
    topic: string;
    question: string;
    userAnswer: string;
    score: number;
    technicalAccuracy: number;
    communicationQuality: number;
    whatWasGood: string[];
    whatWasMissing: string[];
  }>;
}

export interface FinalSummaryResult {
  overallScore: number;
  performanceTier: 'Strong Hire' | 'Interview Ready' | 'Developing' | 'Needs Practice';
  performanceSummary: string;
  strongestAreas: string[];
  areasNeedingImprovement: string[];
  personalizedRecommendations: string[];
  finalFeedback: string;
}

export class GeminiServiceError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.name = 'GeminiServiceError';
    this.statusCode = statusCode;
  }
}

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    throw new GeminiServiceError(
      'Gemini API key is not configured on the server. Add GEMINI_API_KEY in Settings > Secrets and try again.',
      503
    );
  }

  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function mapGeminiError(error: unknown): GeminiServiceError {
  if (error instanceof GeminiServiceError) return error;

  const rawMessage = error instanceof Error ? error.message : String(error);
  const lower = rawMessage.toLowerCase();

  if (lower.includes('api_key_invalid') || lower.includes('permission_denied') || lower.includes('403')) {
    return new GeminiServiceError(
      'The Gemini API key appears invalid or lacks permission. Please verify GEMINI_API_KEY in Settings > Secrets.',
      403
    );
  }

  if (lower.includes('resource_exhausted') || lower.includes('429') || lower.includes('quota')) {
    return new GeminiServiceError(
      'Gemini API rate limit reached. Please wait a few seconds and retry your request.',
      429
    );
  }

  if (lower.includes('not_found') || lower.includes('404')) {
    return new GeminiServiceError(
      'The requested Gemini model could not be reached. Please try again shortly.',
      502
    );
  }

  return new GeminiServiceError(
    `AI evaluation service encountered an error: ${rawMessage.slice(0, 180)}`,
    502
  );
}

async function withRetry<T>(fn: () => Promise<T>, maxAttempts = 2): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      const mapped = mapGeminiError(err);
      if (mapped.statusCode === 400 || mapped.statusCode === 403 || mapped.statusCode === 503) {
        throw mapped;
      }
      if (attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 600 * attempt));
      }
    }
  }
  throw mapGeminiError(lastError);
}

function parseJsonSafe<T>(text: string | undefined, fallbackLabel: string): T {
  const cleaned = (text ?? '')
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  if (!cleaned) {
    throw new GeminiServiceError(`Gemini returned an empty response while generating ${fallbackLabel}.`, 502);
  }

  try {
    return JSON.parse(cleaned) as T;
  } catch {
    throw new GeminiServiceError(`Gemini returned malformed JSON while generating ${fallbackLabel}. Please retry.`, 502);
  }
}

function clampTen(val: number): number {
  if (!Number.isFinite(val)) return 0;
  return Math.round(Math.min(10, Math.max(0, val)) * 10) / 10;
}

function computeMixedSplit(totalCount: number): { technicalCount: number; hrCount: number } {
  const safe = Math.max(1, Math.min(10, Math.floor(totalCount)));
  if (safe === 1) return { technicalCount: 1, hrCount: 0 };
  const technicalCount = Math.min(safe - 1, Math.ceil(safe * 0.6));
  return { technicalCount, hrCount: safe - technicalCount };
}

function resolveTier(score: number): 'Strong Hire' | 'Interview Ready' | 'Developing' | 'Needs Practice' {
  if (score >= 85) return 'Strong Hire';
  if (score >= 70) return 'Interview Ready';
  if (score >= 50) return 'Developing';
  return 'Needs Practice';
}

export async function generateInterviewQuestions(
  payload: GenerateQuestionsPayload
): Promise<GeneratedQuestionItem[]> {
  const ai = getGeminiClient();
  const count = Math.max(1, Math.min(10, Math.floor(payload.questionCount)));
  const avoidList = (payload.previousQuestions ?? []).slice(0, 25);

  let categoryInstruction = `All ${count} questions must have category "${payload.interviewType}".`;
  if (payload.interviewType === 'Mixed') {
    const { technicalCount, hrCount } = computeMixedSplit(count);
    categoryInstruction = `Generate exactly ${technicalCount} "Technical" questions and ${hrCount} "HR" behavioral/situational questions, interleaved naturally in a realistic interview order.`;
  }

  const avoidBlock =
    avoidList.length > 0
      ? `\nDo NOT repeat or closely paraphrase any of these previously asked questions:\n${avoidList
          .map((q, i) => `${i + 1}. ${q}`)
          .join('\n')}`
      : '';

  const prompt = `You are a senior hiring panel interviewer designing a realistic mock interview.

Candidate Target Profile:
- Job Role: ${payload.role}
- Experience Level: ${payload.experienceLevel}
- Interview Type: ${payload.interviewType}
- Difficulty: ${payload.difficulty}
- Number of Questions: ${count}

Requirements:
1. ${categoryInstruction}
2. Every question must be directly tailored to a ${payload.experienceLevel} ${payload.role} candidate at ${payload.difficulty} difficulty.
3. Cover distinct, non-overlapping topics (e.g., core fundamentals, practical debugging/scenarios, architecture/trade-offs for Technical; teamwork, ownership, conflict resolution, learning mindset for HR).
4. Write clear, realistic interview questions that invite structured, detailed explanations (not one-word trivia).
5. Include a short 2–4 word topic label and a concise one-sentence "expectedFocus" explaining what an interviewer listens for.${avoidBlock}`;

  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING, description: 'The full interview question prompt.' },
                  category: { type: Type.STRING, description: 'Either Technical or HR.' },
                  topic: { type: Type.STRING, description: 'Short 2-4 word competency or topic label.' },
                  expectedFocus: {
                    type: Type.STRING,
                    description: 'Concise note on what strong answers address.',
                  },
                },
                required: ['question', 'category', 'topic', 'expectedFocus'],
              },
            },
          },
          required: ['questions'],
        },
      },
    });

    const parsed = parseJsonSafe<{
      questions: Array<{
        question: string;
        category: string;
        topic: string;
        expectedFocus: string;
      }>;
    }>(response.text, 'interview questions');

    if (!Array.isArray(parsed.questions) || parsed.questions.length === 0) {
      throw new GeminiServiceError('Gemini did not return any interview questions. Please retry.', 502);
    }

    return parsed.questions.slice(0, count).map((item, index) => {
      const normalizedCategory: 'Technical' | 'HR' =
        payload.interviewType === 'Technical'
          ? 'Technical'
          : payload.interviewType === 'HR'
            ? 'HR'
            : item.category.toLowerCase().includes('hr')
              ? 'HR'
              : 'Technical';

      return {
        id: `q-${Date.now()}-${index + 1}`,
        number: index + 1,
        question: item.question.trim(),
        category: normalizedCategory,
        topic: item.topic.trim() || normalizedCategory,
        expectedFocus: item.expectedFocus.trim() || 'Clear reasoning with concrete examples.',
      };
    });
  });
}

export async function evaluateCandidateAnswer(
  payload: EvaluateAnswerPayload
): Promise<EvaluatedAnswerResult> {
  const ai = getGeminiClient();

  const prompt = `You are a rigorous, constructive senior interviewer evaluating a candidate's mock interview answer.

Interview Context:
- Job Role: ${payload.role}
- Experience Level: ${payload.experienceLevel}
- Difficulty: ${payload.difficulty}
- Category: ${payload.category}
- Topic: ${payload.topic}

Interview Question:
"${payload.question}"

Candidate's Answer:
"""
${payload.userAnswer}
"""

Evaluation Instructions:
1. Evaluate strictly based on what the candidate ACTUALLY wrote. Never give generic praise if the answer is vague, off-topic, incomplete, or incorrect.
2. Score fairly on a 0 to 10 scale (1 decimal precision allowed):
   - 0–3: Incorrect, irrelevant, or severely incomplete.
   - 4–5.5: Partial understanding with major missing concepts or weak structure.
   - 6–7.5: Solid core answer, missing depth, edge cases, metrics, or clearer framing.
   - 8–9: Strong, accurate, well-structured answer with concrete detail.
   - 9.5–10: Exceptional, interview-winning answer with trade-offs and clarity.
3. Provide:
   - score (overall out of 10)
   - technicalAccuracy (0 to 10; for HR questions, evaluate domain relevance & realism of actions)
   - communicationQuality (0 to 10; clarity, structure such as STAR or logical flow, conciseness)
   - technicalAccuracyNote (1–2 specific sentences grounded in the candidate's answer)
   - communicationQualityNote (1–2 specific sentences grounded in the candidate's answer)
   - whatWasGood (2–4 specific bullets referencing exact strengths from their response; if answer is very weak, note at least one honest baseline observation such as attempt clarity or effort without fabricating technical correctness)
   - whatWasMissing (2–4 concrete concepts, edge cases, examples, or structural elements omitted)
   - improvementSuggestions (2–4 actionable, specific tips the candidate can immediately apply)
   - betterSampleAnswer (a crisp, realistic, high-scoring 1–2 paragraph model answer tailored to a ${payload.experienceLevel} ${payload.role} candidate).`;

  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER, description: 'Overall answer score from 0 to 10.' },
            technicalAccuracy: { type: Type.NUMBER, description: 'Technical or domain accuracy from 0 to 10.' },
            communicationQuality: { type: Type.NUMBER, description: 'Communication clarity and structure from 0 to 10.' },
            technicalAccuracyNote: { type: Type.STRING },
            communicationQualityNote: { type: Type.STRING },
            whatWasGood: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            whatWasMissing: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            improvementSuggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            betterSampleAnswer: { type: Type.STRING },
          },
          required: [
            'score',
            'technicalAccuracy',
            'communicationQuality',
            'technicalAccuracyNote',
            'communicationQualityNote',
            'whatWasGood',
            'whatWasMissing',
            'improvementSuggestions',
            'betterSampleAnswer',
          ],
        },
      },
    });

    const parsed = parseJsonSafe<EvaluatedAnswerResult>(response.text, 'answer evaluation');

    return {
      score: clampTen(parsed.score),
      technicalAccuracy: clampTen(parsed.technicalAccuracy),
      communicationQuality: clampTen(parsed.communicationQuality),
      technicalAccuracyNote: parsed.technicalAccuracyNote?.trim() || 'Evaluated for role accuracy and depth.',
      communicationQualityNote: parsed.communicationQualityNote?.trim() || 'Evaluated for structure and clarity.',
      whatWasGood: Array.isArray(parsed.whatWasGood) ? parsed.whatWasGood.filter(Boolean).slice(0, 5) : [],
      whatWasMissing: Array.isArray(parsed.whatWasMissing) ? parsed.whatWasMissing.filter(Boolean).slice(0, 5) : [],
      improvementSuggestions: Array.isArray(parsed.improvementSuggestions)
        ? parsed.improvementSuggestions.filter(Boolean).slice(0, 5)
        : [],
      betterSampleAnswer: parsed.betterSampleAnswer?.trim() || '',
    };
  });
}

export async function generateFinalInterviewSummary(
  payload: FinalSummaryPayload
): Promise<FinalSummaryResult> {
  const ai = getGeminiClient();

  const transcript = payload.responses
    .map(
      (r) =>
        `Question ${r.number} [${r.category} · ${r.topic}]: ${r.question}\n` +
        `Candidate Answer: ${r.userAnswer}\n` +
        `Scores: Overall ${r.score}/10 | Accuracy ${r.technicalAccuracy}/10 | Communication ${r.communicationQuality}/10\n` +
        `Strengths noted: ${r.whatWasGood.join('; ')}\n` +
        `Gaps noted: ${r.whatWasMissing.join('; ')}`
    )
    .join('\n\n---\n\n');

  const prompt = `You are a lead hiring manager compiling a final mock interview performance report.

Session Details:
- Target Role: ${payload.role}
- Experience Level: ${payload.experienceLevel}
- Interview Type: ${payload.interviewType}
- Difficulty: ${payload.difficulty}
- Computed Score Benchmark: ${payload.computedOverallScore}/100

Complete Session Transcript & Question Evaluations:
${transcript}

Instructions:
1. Synthesize the candidate's full performance honestly across all questions.
2. Keep overallScore aligned with the actual question scores (within +/- 3 points of ${payload.computedOverallScore}, integer 0–100).
3. Write:
   - performanceSummary: 2 concise paragraphs summarizing readiness, consistency, technical depth, and communication across the session.
   - strongestAreas: 3–4 concrete strengths demonstrated in their answers.
   - areasNeedingImprovement: 3–4 specific knowledge or delivery gaps observed.
   - personalizedRecommendations: 4 concrete, actionable study or practice steps tailored to a ${payload.experienceLevel} ${payload.role} preparing for real interviews.
   - finalFeedback: A motivating yet candid closing paragraph from an AI interview coach.`;

  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallScore: { type: Type.INTEGER, description: 'Overall score from 0 to 100.' },
            performanceSummary: { type: Type.STRING },
            strongestAreas: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            areasNeedingImprovement: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            personalizedRecommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            finalFeedback: { type: Type.STRING },
          },
          required: [
            'overallScore',
            'performanceSummary',
            'strongestAreas',
            'areasNeedingImprovement',
            'personalizedRecommendations',
            'finalFeedback',
          ],
        },
      },
    });

    const parsed = parseJsonSafe<Omit<FinalSummaryResult, 'performanceTier'>>(
      response.text,
      'final performance analysis'
    );

    const boundedScore = Math.round(
      Math.min(
        100,
        Math.max(
          0,
          Number.isFinite(parsed.overallScore) ? parsed.overallScore : payload.computedOverallScore
        )
      )
    );

    return {
      overallScore: boundedScore,
      performanceTier: resolveTier(boundedScore),
      performanceSummary: parsed.performanceSummary?.trim() || '',
      strongestAreas: Array.isArray(parsed.strongestAreas) ? parsed.strongestAreas.filter(Boolean).slice(0, 5) : [],
      areasNeedingImprovement: Array.isArray(parsed.areasNeedingImprovement)
        ? parsed.areasNeedingImprovement.filter(Boolean).slice(0, 5)
        : [],
      personalizedRecommendations: Array.isArray(parsed.personalizedRecommendations)
        ? parsed.personalizedRecommendations.filter(Boolean).slice(0, 6)
        : [],
      finalFeedback: parsed.finalFeedback?.trim() || '',
    };
  });
}
