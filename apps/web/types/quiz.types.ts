export enum QuestionType {
  MULTIPLE_CHOICE = "multiple_choice",
  SINGLE_CHOICE = "single_choice",
  TRUE_FALSE = "true_false",
}

export interface Quiz {
  _id: string;
  moduleId: string;
  title: string;
  description?: string;
  duration?: number; // Durée en minutes
  passingScore: number; // Score minimum pour réussir (en %)
  isRequired: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Question - Une question du quiz
 */
export interface Question {
  _id: string;
  quizId: string;
  text: string;
  type: "multiple_choice" | "single_choice" | "true_false";
  options: QuestionOption[]; // Les choix de réponse
  points: number; // Points attribués à cette question
  correctAnswers: number[]; // ⚠️ Array d'indices (0, 1, 2...) des bonnes réponses
  createdAt?: string;
  updatedAt?: string;
}

/**
 * QuestionOption - Option de réponse
 */
export interface QuestionOption {
  id: number;
  text: string;
}

/**
 * QuizAttempt - Une tentative de quiz par un apprenant
 */
export interface QuizAttempt {
  _id: string;
  quizId: string;
  apprenantId: string;
  startedAt: string;
  completedAt?: string;
  score: number; // Score obtenu (0-100)
  passed: boolean; // true si score >= passingScore
  attemptNumber: number; // Numéro de la tentative (1, 2, 3...)
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Answer - Une réponse à une question
 */
export interface Answer {
  _id: string;
  attemptId: string;
  questionId: string;
  selectedAnswers: number[]; //  Array d'indices sélectionnés (0, 1, 2...)
  isCorrect: boolean; // Corrigé automatiquement par le backend
  pointsEarned: number; // Points gagnés
  createdAt?: string;
  updatedAt?: string;
}

/**
 * QuizResultWithDetails - Résultat détaillé avec questions et réponses
 */
export interface QuizResultWithDetails {
  attempt: QuizAttempt;
  quiz: Quiz;
  answers: AnswerWithQuestion[];
}

export interface AnswerWithQuestion extends Answer {
  question: Question;
}

/**
 * QuizResult - Résultat final d'une tentative
 */
export interface QuizResult {
  _id: string;
  attemptId: string;
  quizId: string;
  apprenantId: string;
  score: number;
  totalPoints: number;
  percentage: number;
  passed: boolean;
  completedAt: string;
  answers: Answer[];
}

/**
 * ModuleProgress - Progression d'un apprenant dans un module
 */
export interface ModuleProgress {
  _id: string;
  apprenantId: string;
  moduleId: string;
  enrollmentId: string;
  status: "not_started" | "in_progress" | "completed" | "locked";
  progressPercentage: number;
  isLocked: boolean;
  startedAt?: string;
  completedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}
