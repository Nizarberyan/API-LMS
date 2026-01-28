import { FileText } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-gray-200 p-2 rounded-lg animate-pulse">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <div className="flex-1">
              <div className="h-8 bg-gray-200 rounded w-64 mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-96 animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Quiz Cards Skeleton */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white border border-gray-200 rounded-lg p-6 animate-pulse"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="h-12 bg-gray-200 rounded mb-6"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-3 bg-gray-200 rounded w-32 mt-3 mx-auto"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
