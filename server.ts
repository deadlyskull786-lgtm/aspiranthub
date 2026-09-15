import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { leaderboardStore } from './server/leaderboardStore.js';

dotenv.config();

let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Real Aspirants Leaderboard endpoints (No Bots - Ranked by Questions Solved)
  app.get('/api/leaderboard', (req, res) => {
    try {
      const exam = (req.query.exam as string) || 'All';
      const sortBy = (req.query.sortBy as 'solved' | 'accuracy' | 'exp') || 'solved';
      const currentUserId = req.query.currentUserId as string | undefined;

      const entries = leaderboardStore.getRankedLeaderboard(exam, sortBy, currentUserId);
      res.json({
        success: true,
        entries,
        totalAspirants: entries.length,
        rankedBy: sortBy,
      });
    } catch (err: any) {
      console.error('Error fetching leaderboard:', err);
      res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
  });

  app.post('/api/leaderboard/sync', (req, res) => {
    try {
      const {
        id,
        name,
        avatar,
        targetExam,
        classGrade,
        level,
        levelName,
        exp,
        solvedCount,
        correctCount,
        accuracy,
      } = req.body;

      if (!id || !name) {
        return res.status(400).json({ error: 'id and name are required' });
      }

      const updatedAspirant = leaderboardStore.syncUser({
        id,
        name,
        avatar,
        targetExam: targetExam || 'JEE',
        classGrade: classGrade || '12',
        level: Number(level) || 1,
        levelName: levelName || 'Novice Aspirant',
        exp: Number(exp) || 0,
        solvedCount: Number(solvedCount) || 0,
        correctCount: Number(correctCount) || 0,
        accuracy: Number(accuracy) || 0,
      });

      const updatedLeaderboard = leaderboardStore.getRankedLeaderboard('All', 'solved', id);

      res.json({
        success: true,
        user: updatedAspirant,
        entries: updatedLeaderboard,
      });
    } catch (err: any) {
      console.error('Error syncing user progress:', err);
      res.status(500).json({ error: 'Failed to sync user progress' });
    }
  });

  app.post('/api/leaderboard/add-peer', (req, res) => {
    try {
      const { name, targetExam, classGrade, initialSolved, initialCorrect, avatar } = req.body;
      if (!name) {
        return res.status(400).json({ error: 'Name is required' });
      }
      const peer = leaderboardStore.addPeerAspirant({
        name,
        targetExam: targetExam || 'JEE',
        classGrade: classGrade || '12',
        initialSolved: Number(initialSolved) || 0,
        initialCorrect: Number(initialCorrect) || 0,
        avatar,
      });
      const updatedLeaderboard = leaderboardStore.getRankedLeaderboard('All', 'solved');
      res.json({ success: true, peer, entries: updatedLeaderboard });
    } catch (err: any) {
      console.error('Error adding peer aspirant:', err);
      res.status(500).json({ error: 'Failed to add peer aspirant' });
    }
  });

  // Aspirant Registration Endpoint - sets the user's official name upon registration
  app.post('/api/user/register', (req, res) => {
    try {
      const {
        id,
        name,
        avatar,
        targetExam,
        classGrade,
        level,
        levelName,
        exp,
        solvedCount,
        correctCount,
        accuracy,
      } = req.body;

      if (!name || typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({ error: 'A valid student name is required for registration' });
      }

      const userId = id || `user-asp-${Date.now()}`;
      const cleanName = name.trim();

      const registered = leaderboardStore.syncUser({
        id: userId,
        name: cleanName,
        avatar:
          avatar ||
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
        targetExam: targetExam || 'JEE',
        classGrade: classGrade || '12',
        level: Number(level) || 1,
        levelName: levelName || 'Novice Aspirant',
        exp: Number(exp) || 140,
        solvedCount: Number(solvedCount) || 6,
        correctCount: Number(correctCount) || 5,
        accuracy: Number(accuracy) || 83.3,
      });

      const updatedLeaderboard = leaderboardStore.getRankedLeaderboard('All', 'solved', userId);

      res.json({
        success: true,
        user: {
          id: userId,
          name: cleanName,
          avatar: registered.avatar,
          targetExam: registered.targetExam,
          classGrade: registered.classGrade,
          isRegistered: true,
          registeredAt: new Date().toISOString(),
        },
        entries: updatedLeaderboard,
        message: `Welcome, ${cleanName}! Your registration is complete.`,
      });
    } catch (err: any) {
      console.error('Error in user registration:', err);
      res.status(500).json({ error: 'Registration failed' });
    }
  });

  // AI Study Assistant Chat endpoint
  app.post('/api/ai/ask', async (req, res) => {
    try {
      const { message, exam, classGrade, subject, chapter } = req.body;
      if (!message) {
        return res.status(400).json({ error: 'Message prompt is required' });
      }

      const ai = getAIClient();
      if (!ai) {
        // High quality educational fallback if Gemini key is being configured
        const fallbackResponse = `### Study Guidance (${exam || 'Competitive Exam'} Prep)
Here is a comprehensive breakdown for **"${message}"**:

1. **Core Concept / Formula**:
   - Focus on standard NCERT definitions and direct formula application.
   - For **${subject || 'this topic'}** in **${chapter || 'syllabus'}**, identify the fundamental principles and sign conventions.

2. **Exam Trick & Pitfall Prevention**:
   - In ${exam || 'JEE/NEET/KCET'}, check the units (SI vs CGS) and dimensional consistency before calculating.
   - For numerical MCQs, use substitution or boundary-value elimination when possible to save time.

3. **Recommended Revision Step**:
   - Solve 5-10 PYQs from 2020-2024 to lock in the pattern.
*(Tip: Configure your Gemini API Key in the Settings panel for dynamic live reasoning!)*`;
        return res.json({ reply: fallbackResponse });
      }

      const systemInstruction = `You are a premier Master Faculty & Study Mentor specializing in Indian competitive entrance exams: JEE Main/Advanced, NEET-UG, and KCET.
Your role:
- Provide rigorous yet crystal-clear explanations of Physics, Chemistry, Mathematics, and Biology concepts.
- Provide step-by-step mathematical derivations, formulas with symbol meanings, and standard NCERT shortcuts.
- Point out common traps and negative-marking pitfalls.
- Format equations and points with clean Markdown, bold headers, and bullet points.
Context of student:
- Target Exam: ${exam || 'JEE/NEET/KCET'}
- Grade: Class ${classGrade || '11/12'}
- Subject: ${subject || 'General'}
- Chapter: ${chapter || 'General'}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: message,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const reply = response.text || 'No response generated. Please try again.';
      return res.json({ reply });
    } catch (err: any) {
      console.error('Gemini API Error:', err);
      return res.status(500).json({
        error: 'Failed to process AI response',
        details: err?.message || String(err),
      });
    }
  });

  // Dynamic PYQ/Question Generation endpoint for unlimited practice
  app.post('/api/ai/generate-questions', async (req, res) => {
    try {
      const { exam = 'JEE', classGrade = '11', subject = 'Physics', chapter = 'Kinematics', difficulty = 'Medium', count = 5 } = req.body;
      const ai = getAIClient();

      if (!ai) {
        return res.json({ questions: [] });
      }

      const prompt = `Generate exactly ${count} authentic, multiple-choice questions (MCQs) in standard ${exam} exam style.
Target Details:
- Exam: ${exam}
- Class: Class ${classGrade}
- Subject: ${subject}
- Chapter: ${chapter}
- Difficulty Level: ${difficulty}

Respond ONLY with a valid JSON array of objects. Do not wrap in markdown quotes if possible or output clean JSON. Each object MUST strictly follow this structure:
[
  {
    "id": "gen-${Date.now()}-1",
    "exam": "${exam}",
    "year": "${exam} Pattern PYQ",
    "subject": "${subject}",
    "classGrade": "${classGrade}",
    "chapter": "${chapter}",
    "question": "Question text here with clear numericals or statements...",
    "options": ["Option A text", "Option B text", "Option C text", "Option D text"],
    "correctOptionIndex": 0,
    "explanation": "Step-by-step rigorous NCERT/exam explanation...",
    "difficulty": "${difficulty}",
    "formulaUsed": "Key formula used here",
    "tags": ["${subject}", "${chapter}", "${exam}"]
  }
]`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.4,
        },
      });

      const text = response.text;
      if (!text) {
        return res.json({ questions: [] });
      }

      const parsed = JSON.parse(text);
      return res.json({ questions: Array.isArray(parsed) ? parsed : [] });
    } catch (err: any) {
      console.error('Error generating AI questions:', err);
      return res.json({ questions: [] });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AspirantHub server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
