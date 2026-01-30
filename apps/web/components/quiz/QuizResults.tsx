"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { quizApi, Quiz, QuizAttempt, Answer, Question } from "@/lib/quiz-api";
import {
  CheckCircle2,
  XCircle,
  Trophy,
  TrendingUp,
  RotateCcw,
  Home,
} from "lucide-react";

interface QuizResultsProps {
  quizId: string;
  attemptId: string;
  moduleId: string;
  courseId: string;
}

export default function QuizResults({
  quizId,
  attemptId,
  moduleId,
  courseId,
}: QuizResultsProps) {
  const router = useRouter();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadResults = async () => {
      try {
        const [quizData, attemptData, answersData, questionsData] =
          await Promise.all([
            quizApi.getQuizById(quizId),
            quizApi.getAttemptById(attemptId),
            quizApi.getAnswersByAttempt(attemptId),
            quizApi.getQuestionsByQuiz(quizId),
          ]);

        setQuiz(quizData);
        setAttempt(attemptData);
        setAnswers(answersData);
        setQuestions(questionsData);
      } catch (err) {
        console.error("Error loading results:", err);
      } finally {
        setLoading(false);
      }
    };

    loadResults();
  }, [quizId, attemptId]);

  const handleRetry = () => {
    router.push(
      `/dashboard/apprenant/courses/${courseId}/modules/${moduleId}/quizzes/${quizId}`,
    );
  };

  const handleBackToModule = () => {
    router.push(`/dashboard/apprenant/courses/${courseId}/modules/${moduleId}`);
  };

  if (loading || !quiz || !attempt) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
  const percentage =
    totalPoints > 0 ? Math.round((attempt.score / totalPoints) * 100) : 0;
  const passed = attempt.passed;

  const correctCount = answers.filter((a) => a.isCorrect).length;
  const incorrectCount = answers.length - correctCount;

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Hero Section */}
      <div
        className={`
        ${passed ? "bg-gradient-to-br from-green-500 to-green-600" : "bg-gradient-to-br from-orange-500 to-orange-600"}
        text-white py-12
      `}
      >
        <div className="container mx-auto px-4 max-w-4xl text-center">
          {passed ? (
            <Trophy className="w-20 h-20 mx-auto mb-4" />
          ) : (
            <TrendingUp className="w-20 h-20 mx-auto mb-4" />
          )}

          <h1 className="text-4xl font-bold mb-2">
            {passed ? "Félicitations ! 🎉" : "Bon effort ! 💪"}
          </h1>

          <p className="text-xl opacity-90 mb-6">
            {passed
              ? "Vous avez réussi le quiz !"
              : "Continuez à apprendre, vous y êtes presque !"}
          </p>

          {/* Score Display */}
          <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl p-8 inline-block">
            <div className="text-6xl font-bold mb-2">{percentage}%</div>
            <div className="text-lg opacity-90">
              {attempt.score} / {totalPoints} points
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="container mx-auto px-4 max-w-4xl -mt-8">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Score */}
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {percentage}%
              </div>
              <div className="text-sm text-gray-600">Score obtenu</div>
            </div>

            {/* Passing Score */}
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {quiz.passingScore}%
              </div>
              <div className="text-sm text-gray-600">Score minimum</div>
            </div>

            {/* Correct Answers */}
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-1">
                {correctCount}
              </div>
              <div className="text-sm text-gray-600">Réponses correctes</div>
            </div>

            {/* Incorrect Answers */}
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600 mb-1">
                {incorrectCount}
              </div>
              <div className="text-sm text-gray-600">Réponses incorrectes</div>
            </div>
          </div>
        </div>

        {/* Detailed Results */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Résultats détaillés
          </h2>

          <div className="space-y-4">
            {questions.map((question, index) => {
              const answer = answers.find(
                (a) => a.questionId.toString() === question._id,
              );
              const isCorrect = answer?.isCorrect || false;

              return (
                <div
                  key={question._id}
                  className={`
                    border-2 rounded-lg p-4
                    ${isCorrect ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}
                  `}
                >
                  <div className="flex items-start gap-3">
                    {isCorrect ? (
                      <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                    )}

                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-gray-900">
                          Question {index + 1}
                        </span>
                        <span
                          className={`
                          text-sm font-medium
                          ${isCorrect ? "text-green-700" : "text-red-700"}
                        `}
                        >
                          {answer?.pointsEarned || 0} / {question.points} points
                        </span>
                      </div>

                      <p className="text-gray-700 mb-3">
                        {question.questionText}
                      </p>

                      <div className="space-y-2">
                        <div className="text-sm">
                          <span className="font-medium text-gray-700">
                            Votre réponse:{" "}
                          </span>
                          <span
                            className={
                              isCorrect ? "text-green-700" : "text-red-700"
                            }
                          >
                            {answer?.selectedAnswers
                              .map((i) => question.options[i])
                              .join(", ") || "Non répondu"}
                          </span>
                        </div>

                        {!isCorrect && (
                          <div className="text-sm">
                            <span className="font-medium text-gray-700">
                              Bonne(s) réponse(s):{" "}
                            </span>
                            <span className="text-green-700">
                              {question.correctAnswers
                                .map((i) => question.options[i])
                                .join(", ")}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          {!passed && (
            <button
              onClick={handleRetry}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
              Réessayer le quiz
            </button>
          )}

          <button
            onClick={handleBackToModule}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors"
          >
            <Home className="w-5 h-5" />
            Retour au module
          </button>
        </div>
      </div>
    </div>
  );
}
