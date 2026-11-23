import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildMixedQuestionSplit,
  calculateDimensionAverages,
  calculateOverallScore,
  getPerformanceTier,
  sanitizeHistoryRecords,
  validateAnswerText,
  validateContactForm,
  validateSetupConfig,
} from './interviewLogic';

test('validateSetupConfig accepts preset and valid custom roles and rejects empty custom role', () => {
  const presetOk = validateSetupConfig({
    role: 'Python Developer',
    isCustomRole: false,
    customRoleText: '',
    experienceLevel: 'Fresher',
    interviewType: 'Mixed',
    questionCount: 5,
    difficulty: 'Medium',
  });
  assert.equal(presetOk.valid, true);
  assert.equal(presetOk.resolvedRole, 'Python Developer');

  const customBad = validateSetupConfig({
    role: 'Python Developer',
    isCustomRole: true,
    customRoleText: ' ',
    experienceLevel: 'Experienced',
    interviewType: 'Technical',
    questionCount: 5,
    difficulty: 'Hard',
  });
  assert.equal(customBad.valid, false);
  assert.ok(customBad.errors.role);

  const countBad = validateSetupConfig({
    role: 'AI Engineer',
    isCustomRole: false,
    customRoleText: '',
    experienceLevel: 'Fresher',
    interviewType: 'Technical',
    questionCount: 15,
    difficulty: 'Medium',
  });
  assert.equal(countBad.valid, false);
  assert.ok(countBad.errors.questionCount);
});

test('buildMixedQuestionSplit returns balanced technical and HR counts', () => {
  assert.deepEqual(buildMixedQuestionSplit(5), { technicalCount: 3, hrCount: 2 });
  assert.deepEqual(buildMixedQuestionSplit(4), { technicalCount: 3, hrCount: 1 });
  assert.deepEqual(buildMixedQuestionSplit(2), { technicalCount: 1, hrCount: 1 });
  assert.deepEqual(buildMixedQuestionSplit(1), { technicalCount: 1, hrCount: 0 });
});

test('calculateOverallScore and calculateDimensionAverages compute accurate clamped scores', () => {
  const evals = [
    { score: 8, technicalAccuracy: 8.5, communicationQuality: 7.5 },
    { score: 7, technicalAccuracy: 6.5, communicationQuality: 8.0 },
    { score: 9, technicalAccuracy: 9.0, communicationQuality: 9.0 },
  ];
  assert.equal(calculateOverallScore(evals), 80);
  assert.deepEqual(calculateDimensionAverages(evals), {
    averageScore: 8,
    averageTechnical: 8,
    averageCommunication: 8.2,
  });
  assert.equal(calculateOverallScore([]), 0);
  assert.equal(calculateOverallScore([{ score: 15 }, { score: -4 }]), 50);
});

test('getPerformanceTier maps score ranges accurately', () => {
  assert.equal(getPerformanceTier(92), 'Strong Hire');
  assert.equal(getPerformanceTier(75), 'Interview Ready');
  assert.equal(getPerformanceTier(55), 'Developing');
  assert.equal(getPerformanceTier(32), 'Needs Practice');
});

test('validateAnswerText enforces minimum depth and counts words', () => {
  const tooShort = validateAnswerText('short');
  assert.equal(tooShort.valid, false);
  assert.equal(tooShort.wordCount, 1);

  const good = validateAnswerText('I would index the foreign key column and analyze query execution plans.');
  assert.equal(good.valid, true);
  assert.equal(good.wordCount, 12);
});

test('validateContactForm validates all required fields', () => {
  const invalid = validateContactForm({
    name: 'A',
    email: 'not-an-email',
    subject: 'Hi',
    message: 'Too short',
  });
  assert.equal(invalid.valid, false);
  assert.ok(invalid.errors.name);
  assert.ok(invalid.errors.email);
  assert.ok(invalid.errors.subject);
  assert.ok(invalid.errors.message);

  const valid = validateContactForm({
    name: 'Ananya Sharma',
    email: 'ananya@college.edu',
    subject: 'Campus placement inquiry',
    message: 'We would love to use InterviewAce AI for our B.Tech placement drive.',
  });
  assert.equal(valid.valid, true);
  assert.deepEqual(valid.errors, {});
});

test('sanitizeHistoryRecords filters malformed entries safely', () => {
  const validRecord = {
    id: 'session-1',
    createdAt: '2026-11-22T12:00:00.000Z',
    config: {
      role: 'Python Developer',
      experienceLevel: 'Fresher',
      interviewType: 'Mixed',
      questionCount: 5,
      difficulty: 'Medium',
    },
    responses: [],
    analysis: {
      overallScore: 82,
      performanceTier: 'Interview Ready',
      performanceSummary: 'Solid performance.',
      strongestAreas: ['Clarity'],
      areasNeedingImprovement: ['Edge cases'],
      personalizedRecommendations: ['Practice complexity analysis'],
      finalFeedback: 'Keep practicing.',
    },
  };
  const result = sanitizeHistoryRecords([null, { id: 123 }, validRecord]);
  assert.equal(result.length, 1);
  assert.equal(result[0].id, 'session-1');
  assert.deepEqual(sanitizeHistoryRecords('corrupt'), []);
});
