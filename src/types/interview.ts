export type ExperienceLevel = 'Fresher' | 'Experienced';
export type InterviewType = 'Technical' | 'HR' | 'Mixed';
export type DifficultyLevel = 'Easy' | 'Medium' | 'Hard';
export type QuestionCategory = 'Technical' | 'HR';
export type PerformanceTier = 'Strong Hire' | 'Interview Ready' | 'Developing' | 'Needs Practice';

export type AppView = 'landing' | 'setup' | 'interview' | 'results' | 'contact';

export const PRESET_ROLES = [
  'Python Developer',
  'AI Engineer',
  'Data Analyst',
  'Web Developer',
  'Java Developer',
  'Software Engineer',
] as const;

export interface InterviewConfig {
  role: string;
  isCustomRole: boolean;
  customRoleText: string;
  experienceLevel: ExperienceLevel;
  interviewType: InterviewType;
  questionCount: number;
  difficulty: DifficultyLevel;
}

export interface InterviewQuestion {
  id: string;
  number: number;
  question: string;
  category: QuestionCategory;
  topic: string;
  expectedFocus: string;
}

export interface AnswerEvaluation {
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

export interface QuestionResponseRecord {
  question: InterviewQuestion;
  userAnswer: string;
  evaluation: AnswerEvaluation | null;
  submittedAt: string | null;
}

export interface FinalInterviewAnalysis {
  overallScore: number;
  performanceTier: PerformanceTier;
  performanceSummary: string;
  strongestAreas: string[];
  areasNeedingImprovement: string[];
  personalizedRecommendations: string[];
  finalFeedback: string;
}

export interface InterviewSessionRecord {
  id: string;
  createdAt: string;
  config: {
    role: string;
    experienceLevel: ExperienceLevel;
    interviewType: InterviewType;
    questionCount: number;
    difficulty: DifficultyLevel;
  };
  responses: Array<{
    question: InterviewQuestion;
    userAnswer: string;
    evaluation: AnswerEvaluation;
    submittedAt: string;
  }>;
  analysis: FinalInterviewAnalysis;
}

export interface ContactFormInput {
  name: string;
  email: string;
  subject: string;
  message: string;
}
