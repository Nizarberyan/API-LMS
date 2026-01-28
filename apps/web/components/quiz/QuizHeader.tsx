"use client";

import { Quiz, QuizAttempt } from "@/lib/quiz-api";
import { Clock, Target, Hash } from "lucide-react";
import { useEffect, useState } from "react";

interface QuizHeaderProps {
  quiz: Quiz;
  attempt: QuizAttempt;
  currentQuestionIndex: number;
  totalQuestions: number;
  answeredCount: number;
}

export default function QuizHeader({
  quiz,
  attempt,
  currentQuestionIndex,
  totalQuestions,
  answeredCount,
}: QuizHeaderProps) {
  const [elapsedTime, setElapsedTime] = useState("00:00");

  useEffect(() => {
    const startTime = new Date(attempt.startedAt).getTime();

    const interval = setInterval(() => {
      const now = Date.now();
      const diff = now - startTime;

      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);

      setElapsedTime(
        `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`,
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [attempt.startedAt]);

  const progress = (answeredCount / totalQuestions) * 100;

  return (
    <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        {/* Title and Info */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Target className="w-4 h-4" />
                <span>
                  Score minimum: <strong>{quiz.passingScore}%</strong>
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Hash className="w-4 h-4" />
                <span>
                  Tentative: <strong>#{attempt.attemptNumber}</strong>
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span className="font-mono font-semibold">{elapsedTime}</span>
              </div>
            </div>
          </div>

          {/* Progress Stats */}
          <div className="text-right">
            <div className="text-sm text-gray-600 mb-1">
              Questions répondues
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {answeredCount} / {totalQuestions}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="absolute h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
