import 'dotenv/config';
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  evaluateCandidateAnswer,
  GeminiServiceError,
  generateFinalInterviewSummary,
  generateInterviewQuestions,
} from './server/gemini.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, service: 'InterviewAce AI API' });
  });

  app.post('/api/interview/generate-questions', async (req, res) => {
    try {
      const { role, experienceLevel, interviewType, questionCount, difficulty, previousQuestions } = req.body ?? {};

      if (typeof role !== 'string' || role.trim().length < 2 || role.trim().length > 80) {
        res.status(400).json({ error: 'Please provide a valid target job role (2 to 80 characters).' });
        return;
      }

      if (!['Fresher', 'Experienced'].includes(experienceLevel)) {
        res.status(400).json({ error: 'Experience level must be Fresher or Experienced.' });
        return;
      }

      if (!['Technical', 'HR', 'Mixed'].includes(interviewType)) {
        res.status(400).json({ error: 'Interview type must be Technical, HR, or Mixed.' });
        return;
      }

      if (!['Easy', 'Medium', 'Hard'].includes(difficulty)) {
        res.status(400).json({ error: 'Difficulty must be Easy, Medium, or Hard.' });
        return;
      }

      const parsedCount = Number(questionCount ?? 5);
      if (!Number.isInteger(parsedCount) || parsedCount < 1 || parsedCount > 10) {
        res.status(400).json({ error: 'Number of questions must be an integer between 1 and 10.' });
        return;
      }

      const safePrev = Array.isArray(previousQuestions)
        ? previousQuestions.filter((q): q is string => typeof q === 'string' && q.trim().length > 0).slice(0, 25)
        : [];

      const questions = await generateInterviewQuestions({
        role: role.trim(),
        experienceLevel,
        interviewType,
        questionCount: parsedCount,
        difficulty,
        previousQuestions: safePrev,
      });

      res.json({ questions });
    } catch (err) {
      if (err instanceof GeminiServiceError) {
        res.status(err.statusCode).json({ error: err.message });
        return;
      }
      res.status(500).json({ error: 'Unable to generate interview questions right now. Please try again.' });
    }
  });

  app.post('/api/interview/evaluate-answer', async (req, res) => {
    try {
      const { role, experienceLevel, difficulty, question, category, topic, userAnswer } = req.body ?? {};

      if (typeof question !== 'string' || question.trim().length < 5) {
        res.status(400).json({ error: 'Interview question is required for evaluation.' });
        return;
      }

      if (typeof userAnswer !== 'string' || userAnswer.trim().length < 10) {
        res.status(400).json({ error: 'Please provide a fuller answer (at least 10 characters) before submitting.' });
        return;
      }

      const evaluation = await evaluateCandidateAnswer({
        role: typeof role === 'string' && role.trim() ? role.trim() : 'Software Engineer',
        experienceLevel: experienceLevel === 'Experienced' ? 'Experienced' : 'Fresher',
        difficulty: ['Easy', 'Medium', 'Hard'].includes(difficulty) ? difficulty : 'Medium',
        question: question.trim(),
        category: category === 'HR' ? 'HR' : 'Technical',
        topic: typeof topic === 'string' && topic.trim() ? topic.trim() : 'Core Competency',
        userAnswer: userAnswer.trim(),
      });

      res.json({ evaluation });
    } catch (err) {
      if (err instanceof GeminiServiceError) {
        res.status(err.statusCode).json({ error: err.message });
        return;
      }
      res.status(500).json({ error: 'Unable to evaluate your answer right now. Please retry.' });
    }
  });

  app.post('/api/interview/final-summary', async (req, res) => {
    try {
      const { role, experienceLevel, interviewType, difficulty, computedOverallScore, responses } = req.body ?? {};

      if (!Array.isArray(responses) || responses.length === 0) {
        res.status(400).json({ error: 'Completed question responses are required to generate a final summary.' });
        return;
      }

      const summary = await generateFinalInterviewSummary({
        role: typeof role === 'string' && role.trim() ? role.trim() : 'Software Engineer',
        experienceLevel: experienceLevel === 'Experienced' ? 'Experienced' : 'Fresher',
        interviewType: ['Technical', 'HR', 'Mixed'].includes(interviewType) ? interviewType : 'Mixed',
        difficulty: ['Easy', 'Medium', 'Hard'].includes(difficulty) ? difficulty : 'Medium',
        computedOverallScore: Number.isFinite(Number(computedOverallScore))
          ? Math.round(Math.min(100, Math.max(0, Number(computedOverallScore))))
          : 0,
        responses,
      });

      res.json({ analysis: summary });
    } catch (err) {
      if (err instanceof GeminiServiceError) {
        res.status(err.statusCode).json({ error: err.message });
        return;
      }
      res.status(500).json({ error: 'Unable to generate the final performance analysis right now. Please retry.' });
    }
  });

  app.post('/api/contact', (req, res) => {
    const { name, email, subject, message } = req.body ?? {};
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    if (typeof name !== 'string' || name.trim().length < 2) {
      res.status(400).json({ error: 'Please enter your full name.' });
      return;
    }
    if (typeof email !== 'string' || !emailPattern.test(email.trim())) {
      res.status(400).json({ error: 'Please enter a valid email address.' });
      return;
    }
    if (typeof subject !== 'string' || subject.trim().length < 3) {
      res.status(400).json({ error: 'Please provide a brief subject line.' });
      return;
    }
    if (typeof message !== 'string' || message.trim().length < 15) {
      res.status(400).json({ error: 'Please include at least 15 characters in your message.' });
      return;
    }

    const referenceId = `IA-${Date.now().toString(36).toUpperCase().slice(-6)}`;
    res.json({
      ok: true,
      referenceId,
      receivedAt: new Date().toISOString(),
    });
  });

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.use((_req, res) => {
      const indexPath = path.join(distDir, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send('Build output not found. Run npm run build first.');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`InterviewAce AI server running at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start InterviewAce AI server:', err);
  process.exit(1);
});
