import QuizList from "@/components/quiz/QuizList";
import { FileText, BookOpen } from "lucide-react";

interface PageProps {
  params: Promise<{
    id: string; // ← Votre route utilise [id], pas [courseId]
    moduleId: string;
  }>;
}

export default async function QuizzesPage({ params }: PageProps) {
  const { id: courseId, moduleId } = await params;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Quiz du module
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                Testez vos connaissances et validez votre compréhension
              </p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
            <div className="flex gap-3">
              <BookOpen className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-blue-900">
                  <strong>Conseil:</strong> Les quiz obligatoires doivent être
                  complétés avec un score minimum pour débloquer la suite du
                  module.
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Quiz List */}
        <QuizList moduleId={moduleId} courseId={courseId} />
      </div>
    </div>
  );
}
