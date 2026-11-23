import type {
  AnswerEvaluation,
  ContactFormInput,
  DifficultyLevel,
  ExperienceLevel,
  InterviewConfig,
  InterviewSessionRecord,
  InterviewType,
  PerformanceTier,
} from '../types/interview';

export interface SetupValidationResult {
  valid: boolean;
  resolvedRole: string;
  errors: Partial<Record<'role' | 'questionCount', string>>;
}

export interface ContactValidationResult {
  valid: boolean;
  errors: Partial<Record<keyof ContactFormInput, string>>;
}

export interface DimensionAverages {
  averageScore: number;
  averageTechnical: number;
  averageCommunication: number;
}

export function clampScore(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

export function roundToOneDecimal(value: number): number {
  return Math.round(value * 10) / 10;
}

export function validateSetupConfig(config: InterviewConfig): SetupValidationResult {
  const errors: Partial<Record<'role' | 'questionCount', string>> = {};
  const resolvedRole = (config.isCustomRole ? config.customRoleText : config.role).trim();

  if (resolvedRole.length < 2) {
    errors.role = config.isCustomRole
      ? 'Enter a custom job role with at least 2 characters.'
      : 'Select a target job role to continue.';
  } else if (resolvedRole.length > 80) {
    errors.role = 'Job role must be 80 characters or fewer.';
  }

  if (!Number.isInteger(config.questionCount) || config.questionCount < 1 || config.questionCount > 10) {
    errors.questionCount = 'Choose between 1 and 10 questions.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    resolvedRole,
    errors,
  };
}

export function buildMixedQuestionSplit(totalCount: number): { technicalCount: number; hrCount: number } {
  const safeTotal = Math.max(1, Math.min(10, Math.floor(totalCount)));
  if (safeTotal === 1) {
    return { technicalCount: 1, hrCount: 0 };
  }
  const technicalCount = Math.min(safeTotal - 1, Math.ceil(safeTotal * 0.6));
  const hrCount = safeTotal - technicalCount;
  return { technicalCount, hrCount };
}

export function calculateOverallScore(evaluations: Array<Pick<AnswerEvaluation, 'score'>>): number {
  if (evaluations.length === 0) return 0;
  const total = evaluations.reduce((sum, item) => sum + clampScore(item.score, 0, 10), 0);
  const avgOutOfTen = total / evaluations.length;
  return Math.round(clampScore(avgOutOfTen * 10, 0, 100));
}

export function calculateDimensionAverages(
  evaluations: Array<Pick<AnswerEvaluation, 'score' | 'technicalAccuracy' | 'communicationQuality'>>
): DimensionAverages {
  if (evaluations.length === 0) {
    return {
      averageScore: 0,
      averageTechnical: 0,
      averageCommunication: 0,
    };
  }

  const count = evaluations.length;
  const scoreSum = evaluations.reduce((sum, e) => sum + clampScore(e.score, 0, 10), 0);
  const techSum = evaluations.reduce((sum, e) => sum + clampScore(e.technicalAccuracy, 0, 10), 0);
  const commSum = evaluations.reduce((sum, e) => sum + clampScore(e.communicationQuality, 0, 10), 0);

  return {
    averageScore: roundToOneDecimal(scoreSum / count),
    averageTechnical: roundToOneDecimal(techSum / count),
    averageCommunication: roundToOneDecimal(commSum / count),
  };
}

export function getPerformanceTier(overallScore: number): PerformanceTier {
  const normalized = clampScore(overallScore, 0, 100);
  if (normalized >= 85) return 'Strong Hire';
  if (normalized >= 70) return 'Interview Ready';
  if (normalized >= 50) return 'Developing';
  return 'Needs Practice';
}

export function validateAnswerText(answer: string): { valid: boolean; error?: string; wordCount: number } {
  const trimmed = answer.trim();
  const words = trimmed ? trimmed.split(/\s+/).filter(Boolean) : [];
  if (trimmed.length < 10) {
    return {
      valid: false,
      error: 'Write a fuller response (at least 10 characters) so the AI coach can evaluate your reasoning.',
      wordCount: words.length,
    };
  }
  return {
    valid: true,
    wordCount: words.length,
  };
}

export function validateContactForm(input: ContactFormInput): ContactValidationResult {
  const errors: Partial<Record<keyof ContactFormInput, string>> = {};
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  if (input.name.trim().length < 2) {
    errors.name = 'Please enter your full name.';
  }
  if (!emailPattern.test(input.email.trim())) {
    errors.email = 'Please enter a valid email address.';
  }
  if (input.subject.trim().length < 3) {
    errors.subject = 'Please provide a brief subject line.';
  }
  if (input.message.trim().length < 15) {
    errors.message = 'Please include at least 15 characters in your message.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

const VALID_EXPERIENCE: ReadonlySet<string> = new Set<ExperienceLevel>(['Fresher', 'Experienced']);
const VALID_TYPE: ReadonlySet<string> = new Set<InterviewType>(['Technical', 'HR', 'Mixed']);
const VALID_DIFFICULTY: ReadonlySet<string> = new Set<DifficultyLevel>(['Easy', 'Medium', 'Hard']);

export function sanitizeHistoryRecords(raw: unknown): InterviewSessionRecord[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((item): item is InterviewSessionRecord => {
    if (!item || typeof item !== 'object') return false;
    const rec = item as Partial<InterviewSessionRecord>;
    if (typeof rec.id !== 'string' || typeof rec.createdAt !== 'string') return false;
    if (!rec.config || typeof rec.config.role !== 'string') return false;
    if (!VALID_EXPERIENCE.has(rec.config.experienceLevel)) return false;
    if (!VALID_TYPE.has(rec.config.interviewType)) return false;
    if (!VALID_DIFFICULTY.has(rec.config.difficulty)) return false;
    if (!Array.isArray(rec.responses) || !rec.analysis || typeof rec.analysis.overallScore !== 'number') {
      return false;
    }
    return true;
  });
}

export function formatShortDate(isoString: string): string {
  const parsed = new Date(isoString);
  if (Number.isNaN(parsed.getTime())) return 'Recent';
  return parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
