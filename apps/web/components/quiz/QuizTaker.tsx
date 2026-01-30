"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  quizApi,
  Quiz,
  Question,
  QuizAttempt,
  CreateQuizAttemptDto,
  SubmitQuizDto,
} from "@/lib/quiz-api";
import QuizHeader from "./QuizHeader";
import QuestionCard from "./QuestionCard";
import QuizNavigation from "./QuizNavigation";
import QuizSubmitModal from "./QuizSubmitModal";
import { Loader2, AlertCircle } from "lucide-react";
import { jwtDecode } from "jwt-decode";

interface QuizTakerProps {
  quizId: string;
  moduleId: string;
  courseId: string;
}

export default function QuizTaker({
  quizId,
  moduleId,
  courseId,
}: QuizTakerProps) {
  const router = useRouter();
  const initialized = useRef(false);

  // State
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number[]>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeQuiz = async () => {
      try {
        setLoading(true);
        setError(null);

        // Check authentication
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/auth/login");
          return;
        }

        let userId: string;
        try {
          interface DecodedToken {
            sub?: string;
            id?: string;
            userId?: string;
          }
          const decoded = jwtDecode<DecodedToken>(token);
          userId = decoded.sub || decoded.id || decoded.userId || "";

          if (!userId) {
            throw new Error("User ID not found in token");
          }
        } catch (e) {
          console.error("Invalid token:", e);
          router.push("/auth/login");
          return;
        }

        // 1. Load basic quiz data
        const [quizData, questionsData] = await Promise.all([
          quizApi.getQuizById(quizId),
          quizApi.getQuestionsByQuiz(quizId),
        ]);

        setQuiz(quizData);
        setQuestions(questionsData);

        // Initialize empty answers structure
        const initialAnswers: Record<string, number[]> = {};
        questionsData.forEach((q) => {
          initialAnswers[q._id] = [];
        });

        // 2. Check for existing active attempt
        const userAttempts = await quizApi.getAttemptsByQuiz(quizId);
        const activeAttempt = userAttempts.find((a) => !a.completedAt);

        if (activeAttempt) {
          console.log("Resuming active attempt:", activeAttempt._id);
          setAttempt(activeAttempt);

          // Load existing answers for this attempt
          try {
            const existingAnswers = await quizApi.getAnswersByAttempt(
              activeAttempt._id,
            );
            const restoredAnswers = { ...initialAnswers };

            existingAnswers.forEach((ans) => {
              if (ans.questionId) {
                restoredAnswers[ans.questionId] = ans.selectedAnswers || [];
              }
            });

            setAnswers(restoredAnswers);
          } catch (err) {
            console.error("Error loading existing answers:", err);
            setAnswers(initialAnswers);
          }
        } else {
          console.log("Creating new attempt");
          // Create a new attempt
          const attemptData: CreateQuizAttemptDto = {
            quizId,
            apprenantId: userId,
          };

          const newAttempt = await quizApi.createQuizAttempt(attemptData);
          setAttempt(newAttempt);
          setAnswers(initialAnswers);
        }
      } catch (err: unknown) {
        console.error("Error initializing quiz:", err);
        const apiError = err as { response?: { data?: { message?: string } }; message?: string };
        setError(
          apiError.response?.data?.message ||
          apiError.message ||
          "Erreur lors du chargement du quiz",
        );
      } finally {
        setLoading(false);
      }
    };

    if (!initialized.current) {
      initialized.current = true;
      initializeQuiz();
    }
  }, [quizId, router]);

  const handleAnswerChange = (
    questionId: string,
    selectedAnswers: number[],
  ) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: selectedAnswers,
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleQuestionSelect = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  const handleSubmitQuiz = async () => {
    if (!attempt) return;

    try {
      setSubmitting(true);
      setShowSubmitModal(false);

      // Prepare submission data
      const submitData: SubmitQuizDto = {
        attemptId: attempt._id,
        answers: Object.entries(answers).map(
          ([questionId, selectedAnswers]) => ({
            questionId,
            selectedAnswers,
          }),
        ),
      };

      // Submit quiz
      await quizApi.submitQuiz(submitData);

      // Finalize the attempt
      const finalizedAttempt = await quizApi.finalizeAttempt(attempt._id);

      // Redirect to results page
      router.push(
        `/dashboard/apprenant/courses/${courseId}/modules/${moduleId}/quizzes/${quizId}/results/${finalizedAttempt._id}`,
      );
    } catch (err: unknown) {
      console.error("Error submitting quiz:", err);
      const apiError = err as { response?: { data?: { message?: string } } };
      setError(
        apiError.response?.data?.message || "Erreur lors de la soumission du quiz",
      );
      setSubmitting(false);
    }
  };

  const getAnsweredCount = () => {
    return Object.values(answers).filter((ans) => ans && ans.length > 0).length;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Chargement du quiz...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white border border-red-200 rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4 text-red-600">
            <AlertCircle className="w-8 h-8" />
            <h2 className="text-xl font-semibold">Une erreur est survenue</h2>
          </div>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.back()}
            className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            Retourner au module
          </button>
        </div>
      </div>
    );
  }

  if (!quiz || !attempt || questions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white border border-yellow-200 rounded-xl shadow-lg p-6 text-center">
          <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Quiz non disponible
          </h2>
          <p className="text-gray-600 mb-6">
            Ce quiz ne contient aucune question ou est introuvable.
          </p>
          <button
            onClick={() => router.back()}
            className="w-full px-4 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-medium"
          >
            Retourner en arrière
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  if (!currentQuestion) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center text-red-600">
          <p>Erreur: Question introuvable</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <QuizHeader
        quiz={quiz}
        attempt={attempt}
        currentQuestionIndex={currentQuestionIndex}
        totalQuestions={questions.length}
        answeredCount={getAnsweredCount()}
      />

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question Navigation Sidebar */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <QuizNavigation
              questions={questions}
              currentIndex={currentQuestionIndex}
              answers={answers}
              onSelectQuestion={handleQuestionSelect}
            />
          </div>

          {/* Main Question Area */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            <QuestionCard
              question={currentQuestion}
              questionNumber={currentQuestionIndex + 1}
              selectedAnswers={answers[currentQuestion._id] || []}
              onAnswerChange={(selected) =>
                handleAnswerChange(currentQuestion._id, selected)
              }
            />

            {/* Navigation Buttons */}
            <div className="mt-6 flex items-center justify-between gap-4">
              <button
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                className="flex-1 sm:flex-none px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                ← Précédent
              </button>

              {currentQuestionIndex === questions.length - 1 ? (
                <button
                  onClick={() => setShowSubmitModal(true)}
                  disabled={submitting}
                  className="flex-1 sm:flex-none px-8 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-70 transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Soumission...
                    </>
                  ) : (
                    "Soumettre le quiz"
                  )}
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="flex-1 sm:flex-none px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
                >
                  Suivant →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <QuizSubmitModal
          totalQuestions={questions.length}
          answeredCount={getAnsweredCount()}
          onConfirm={handleSubmitQuiz}
          onCancel={() => setShowSubmitModal(false)}
        />
      )}
    </div>
  );
}
