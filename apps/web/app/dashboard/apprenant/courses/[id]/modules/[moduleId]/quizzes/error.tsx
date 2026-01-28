"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Quiz page error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white border border-red-200 rounded-lg p-8 max-w-md w-full shadow-lg">
        <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>

        <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
          Une erreur est survenue
        </h2>

        <p className="text-gray-600 text-center mb-6">
          Impossible de charger les quiz du module. Veuillez réessayer.
        </p>

        {error.message && (
          <div className="bg-red-50 border border-red-200 rounded p-3 mb-6">
            <p className="text-sm text-red-800 font-mono">{error.message}</p>
          </div>
        )}

        <button
          onClick={reset}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <RefreshCw className="w-5 h-5" />
          Réessayer
        </button>
      </div>
    </div>
  );
}
