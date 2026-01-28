interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export default function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
      <div className="flex items-start">
        <svg
          className="w-6 h-6 text-red-500 mr-3 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <div className="flex-1">
          <h3 className="text-red-800 font-semibold mb-1">Erreur</h3>
          <p className="text-red-700 text-sm">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-3 text-sm text-red-800 font-medium hover:text-red-900 underline"
            >
              Réessayer
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
