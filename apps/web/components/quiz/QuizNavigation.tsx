"use client";

import { Question } from "@/lib/quiz-api";

interface QuizNavigationProps {
  questions: Question[];
  currentIndex: number;
  answers: Record<string, number[]>;
  onSelectQuestion: (index: number) => void;
}

export default function QuizNavigation({
  questions,
  currentIndex,
  answers,
  onSelectQuestion,
}: QuizNavigationProps) {
  const isAnswered = (questionId: string) => {
    return (answers[questionId]?.length ?? 0) > 0;
  };

  const answeredCount = questions.filter((q) => isAnswered(q._id)).length;

  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 p-4 sticky top-24">
      <h3 className="font-semibold text-gray-900 mb-4">Navigation</h3>

      {/* Progress Summary */}
      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
        <div className="text-sm text-gray-600 mb-1">Progression</div>
        <div className="text-2xl font-bold text-blue-600">
          {answeredCount}/{questions.length}
        </div>
      </div>

      {/* Question Grid */}
      <div className="grid grid-cols-4 gap-2">
        {questions.map((question, index) => {
          const answered = isAnswered(question._id);
          const isCurrent = index === currentIndex;

          return (
            <button
              key={question._id}
              onClick={() => onSelectQuestion(index)}
              className={`
                aspect-square rounded-lg font-semibold text-sm transition-all
                ${isCurrent
                  ? "bg-blue-600 text-white ring-2 ring-blue-600 ring-offset-2"
                  : answered
                    ? "bg-green-100 text-green-700 hover:bg-green-200"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }
              `}
            >
              {index + 1}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-gray-200 space-y-2 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-600 rounded"></div>
          <span className="text-gray-600">En cours</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-100 rounded"></div>
          <span className="text-gray-600">Répondue</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-100 rounded"></div>
          <span className="text-gray-600">Non répondue</span>
        </div>
      </div>
    </div>
  );
}
