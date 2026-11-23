import type { InterviewSessionRecord } from '../types/interview';
import { sanitizeHistoryRecords } from './interviewLogic';

const HISTORY_STORAGE_KEY = 'interviewace_ai_history_v1';
const ASKED_QUESTIONS_KEY = 'interviewace_ai_recent_questions_v1';
const MAX_HISTORY_ITEMS = 25;
const MAX_RECENT_QUESTIONS = 30;

export function loadInterviewHistory(): InterviewSessionRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return sanitizeHistoryRecords(parsed);
  } catch {
    return [];
  }
}

export function saveInterviewSession(record: InterviewSessionRecord): InterviewSessionRecord[] {
  const existing = loadInterviewHistory().filter((item) => item.id !== record.id);
  const updated = [record, ...existing].slice(0, MAX_HISTORY_ITEMS);
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Ignore storage quota errors gracefully
    }
  }
  return updated;
}

export function clearInterviewHistory(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(HISTORY_STORAGE_KEY);
  } catch {
    // Ignore storage errors gracefully
  }
}

export function loadRecentQuestionTexts(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(ASKED_QUESTIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((q): q is string => typeof q === 'string' && q.trim().length > 0);
  } catch {
    return [];
  }
}

export function recordAskedQuestions(questions: string[]): void {
  if (typeof window === 'undefined') return;
  const existing = loadRecentQuestionTexts();
  const merged = [...questions, ...existing].filter(
    (q, idx, arr) => arr.indexOf(q) === idx
  );
  try {
    window.localStorage.setItem(
      ASKED_QUESTIONS_KEY,
      JSON.stringify(merged.slice(0, MAX_RECENT_QUESTIONS))
    );
  } catch {
    // Ignore storage errors gracefully
  }
}
