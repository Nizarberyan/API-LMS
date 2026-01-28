"use client";

import { Quiz } from "@/lib/quiz-api";
import { Clock, Target, Lock, CheckCircle2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

interface QuizCardProps {
  quiz: Quiz;
  courseId: string;
  moduleId: string;
  userAttempts?: number;
  bestScore?: number;
  isPassed?: boolean;
  isLocked?: boolean;
}

export default function QuizCard({
  quiz,
  courseId,
  moduleId,
  userAttempts = 0,
  bestScore,
  isPassed = false,
  isLocked = false,
}: QuizCardProps) {
  const router = useRouter();

  const handleStartQuiz = () => {
    if (isLocked) return;
    router.push(
      `/dashboard/apprenant/courses/${courseId}/modules/${moduleId}/quizzes/${quiz._id}`,
    );
  };

  return (
    <div
      className={`
        bg-white rounded-xl border-2 p-6 transition-all
        ${
          isLocked
            ? "border-gray-200 opacity-60 cursor-not-allowed"
            : isPassed
              ? "border-green-200 hover:border-green-300 cursor-pointer hover:shadow-lg"
              : "border-gray-200 hover:border-blue-300 cursor-pointer hover:shadow-lg"
        }
      `}
      onClick={handleStartQuiz}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-xl font-semibold text-gray-900">
              {quiz.title}
            </h3>
            {quiz.isRequired && (
              <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded">
                Obligatoire
              </span>
            )}
          </div>
        </div>

        {/* Status Icon */}
        {isLocked ? (
          <Lock className="w-6 h-6 text-gray-400" />
        ) : isPassed ? (
          <CheckCircle2 className="w-6 h-6 text-green-500" />
        ) : userAttempts > 0 ? (
          <AlertCircle className="w-6 h-6 text-orange-500" />
        ) : null}
      </div>

      {/* Quiz Info */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Target className="w-4 h-4" />
            <span>
              Score minimum: <strong>{quiz.passingScore}%</strong>
            </span>
          </div>
        </div>

        {/* User Progress */}
        {userAttempts > 0 && (
          <div className="pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="w-4 h-4" />
                <span>
                  Tentatives: <strong>{userAttempts}</strong>
                </span>
              </div>

              {bestScore !== undefined && (
                <div
                  className={`font-semibold ${isPassed ? "text-green-600" : "text-orange-600"}`}
                >
                  Meilleur: {bestScore}%
                </div>
              )}
            </div>
          </div>
        )}

        {/* Status Message */}
        <div
          className={`
          mt-4 p-3 rounded-lg text-sm font-medium
          ${
            isLocked
              ? "bg-gray-100 text-gray-700"
              : isPassed
                ? "bg-green-50 text-green-700"
                : userAttempts > 0
                  ? "bg-orange-50 text-orange-700"
                  : "bg-blue-50 text-blue-700"
          }
        `}
        >
          {isLocked
            ? "🔒 Quiz verrouillé - Complétez les modules précédents"
            : isPassed
              ? "✅ Quiz réussi ! Vous pouvez le refaire pour améliorer votre score"
              : userAttempts > 0
                ? "⚠️ Score insuffisant - Réessayez pour valider"
                : "▶️ Cliquez pour commencer le quiz"}
        </div>
      </div>
    </div>
  );
}
