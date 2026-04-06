import { z } from 'zod';

// Shared enums
const ageGroupEnum = z.enum(['4-6', '7-9', '10-12', '13-15', '16-18']);
const behavioralProfileEnum = z.enum(['default', 'tdah', 'anxiety', 'gifted']);
const messageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1).max(10000),
});

// /api/tutor
export const tutorSchema = z.object({
  messages: z.array(messageSchema).min(1).max(100),
  homework: z.string().max(15000).default(''),
  subject: z.string().max(50).default('other'),
  ageGroup: ageGroupEnum.default('10-12'),
  behavioralProfile: behavioralProfileEnum.default('default'),
  studentName: z.string().max(100).optional(),
  age: z.number().int().min(4).max(18).optional(),
  grade: z.string().max(30).optional(),
  knownDifficulties: z.array(z.string().max(200)).max(10).optional(),
  errorPatterns: z.array(z.string().max(200)).max(10).optional(),
});

// /api/faq
export const faqSchema = z.object({
  question: z.string().min(1).max(500),
});

// /api/generate-quiz
export const generateQuizSchema = z.object({
  materialText: z.string().min(1).max(8000),
  subject: z.string().max(50).optional(),
  ageGroup: ageGroupEnum.default('10-12'),
  questionCount: z.number().int().min(1).max(20).default(5),
});

// /api/session-summary
export const sessionSummarySchema = z.object({
  messages: z.array(z.object({
    role: z.string().min(1).max(20),
    content: z.string().min(1).max(10000),
  })).min(1).max(200),
  subject: z.string().max(50).default('other'),
  ageGroup: z.string().max(10).default('10-12'),
  durationMinutes: z.number().min(0).max(600).default(0),
  xpEarned: z.number().min(0).max(10000).default(0),
});

// /api/suggestions
export const suggestionsSchema = z.object({
  content: z.string().min(5).max(2000),
  userName: z.string().max(100).optional(),
  userEmail: z.string().email().max(200).optional().or(z.literal('')),
});

// /api/school-lead
export const schoolLeadSchema = z.object({
  schoolName: z.string().min(2).max(200),
  contactName: z.string().min(2).max(200),
  email: z.string().email().max(200),
  phone: z.string().max(30).optional(),
  role: z.string().max(50).default('professor'),
  studentCount: z.string().max(20).optional(),
  message: z.string().max(2000).optional(),
});

// /api/exam
export const examSchema = z.object({
  topic: z.string().max(500).default(''),
  subject: z.string().max(50).default('other'),
  ageGroup: ageGroupEnum.default('10-12'),
  questionCount: z.number().int().min(1).max(30).default(10),
  fileContent: z.string().max(8000).optional(),
});

// /api/materials (DELETE)
export const deleteMaterialSchema = z.object({
  materialId: z.string().uuid(),
});
