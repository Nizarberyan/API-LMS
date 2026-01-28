"use client";

import { AlertCircle, CheckCircle2 } from "lucide-react";

interface QuizSubmitModalProps {
  totalQuestions: number;
  answeredCount: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function QuizSubmitModal({
  totalQuestions,
  answeredCount,
  onConfirm,
  onCancel,
}: QuizSubmitModalProps) {
  const unansweredCount = totalQuestions - answeredCount;
  const allAnswered = unansweredCount === 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          {allAnswered ? (
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          ) : (
            <AlertCircle className="w-8 h-8 text-orange-600" />
          )}
          <h2 className="text-xl font-bold text-gray-900">Soumettre le quiz</h2>
        </div>

        {/* Content */}
        <div className="space-y-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Questions répondues</span>
              <span className="font-bold text-gray-900">
                {answeredCount}/{totalQuestions}
              </span>
            </div>
            {!allAnswered && (
              <div className="flex justify-between items-center text-orange-600">
                <span>Questions non répondues</span>
                <span className="font-bold">{unansweredCount}</span>
              </div>
            )}
          </div>

          {allAnswered ? (
            <p className="text-gray-700">
              Toutes les questions ont été répondues. Êtes-vous prêt à soumettre
              votre quiz ?
            </p>
          ) : (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <p className="text-orange-900 text-sm">
                <strong>Attention :</strong> Vous avez {unansweredCount}{" "}
                question{unansweredCount > 1 ? "s" : ""} non répondue
                {unansweredCount > 1 ? "s" : ""}. Les questions sans réponse
                seront comptées comme incorrectes.
              </p>
            </div>
          )}

          <p className="text-sm text-gray-600">
            ⚠️ Une fois soumis, vous ne pourrez plus modifier vos réponses.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className={`
              flex-1 px-4 py-3 rounded-lg font-medium transition-colors
              ${
                allAnswered
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-orange-600 hover:bg-orange-700 text-white"
              }
            `}
          >
            Confirmer la soumission
          </button>
        </div>
      </div>
    </div>
  );
}
