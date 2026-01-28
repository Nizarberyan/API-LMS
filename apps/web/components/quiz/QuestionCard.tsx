"use client";

import { Question, QuestionType } from "@/lib/quiz-api";
import { CheckCircle2, Circle } from "lucide-react";

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  selectedAnswers: number[];
  onAnswerChange: (selectedAnswers: number[]) => void;
}

export default function QuestionCard({
  question,
  questionNumber,
  selectedAnswers,
  onAnswerChange,
}: QuestionCardProps) {
  const handleOptionClick = (optionIndex: number) => {
    if (
      question.type === QuestionType.SINGLE_CHOICE ||
      question.type === QuestionType.TRUE_FALSE
    ) {
      // Single selection
      onAnswerChange([optionIndex]);
    } else {
      // Multiple selection
      if (selectedAnswers.includes(optionIndex)) {
        onAnswerChange(selectedAnswers.filter((i) => i !== optionIndex));
      } else {
        onAnswerChange([...selectedAnswers, optionIndex]);
      }
    }
  };

  const isSelected = (optionIndex: number) =>
    selectedAnswers.includes(optionIndex);

  const getQuestionTypeLabel = () => {
    switch (question.type) {
      case QuestionType.SINGLE_CHOICE:
        return "Question à choix unique";
      case QuestionType.MULTIPLE_CHOICE:
        return "Question à choix multiples";
      case QuestionType.TRUE_FALSE:
        return "Vrai ou Faux";
      default:
        return "";
    }
  };

  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 p-8 shadow-sm">
      {/* Question Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            Question {questionNumber}
          </span>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">
              {getQuestionTypeLabel()}
            </span>
            <span className="text-sm font-semibold text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
              {question.points} {question.points > 1 ? "points" : "point"}
            </span>
          </div>
        </div>

        <h2 className="text-xl font-semibold text-gray-900 leading-relaxed">
          {question.questionText}
        </h2>

        {question.type === QuestionType.MULTIPLE_CHOICE && (
          <p className="text-sm text-gray-500 mt-2">
            ⚠️ Sélectionnez toutes les bonnes réponses
          </p>
        )}
      </div>

      {/* Options */}
      <div className="space-y-3">
        {question.options.map((option, index) => {
          const selected = isSelected(index);

          return (
            <button
              key={index}
              onClick={() => handleOptionClick(index)}
              className={`
                w-full text-left p-4 rounded-lg border-2 transition-all
                ${
                  selected
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }
              `}
            >
              <div className="flex items-center gap-3">
                {/* Selection Icon */}
                {question.type === QuestionType.MULTIPLE_CHOICE ? (
                  <div
                    className={`
                    w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0
                    ${
                      selected
                        ? "border-blue-500 bg-blue-500"
                        : "border-gray-300"
                    }
                  `}
                  >
                    {selected && (
                      <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                ) : selected ? (
                  <CheckCircle2 className="w-5 h-5 text-blue-500 flex-shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-300 flex-shrink-0" />
                )}

                {/* Option Text */}
                <span
                  className={`
                  text-base
                  ${selected ? "font-medium text-gray-900" : "text-gray-700"}
                `}
                >
                  {option}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Answer status */}
      {selectedAnswers.length > 0 && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-700 font-medium">
            ✓ Réponse enregistrée ({selectedAnswers.length}{" "}
            {selectedAnswers.length > 1
              ? "options sélectionnées"
              : "option sélectionnée"}
            )
          </p>
        </div>
      )}
    </div>
  );
}
