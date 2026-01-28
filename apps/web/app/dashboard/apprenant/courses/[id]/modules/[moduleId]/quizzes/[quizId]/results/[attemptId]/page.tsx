import QuizResults from "@/components/quiz/QuizResults";

interface PageProps {
  params: Promise<{
    id: string; // ← Votre route utilise [id], pas [courseId]
    moduleId: string;
    quizId: string;
    attemptId: string;
  }>;
}

export default async function ResultsPage({ params }: PageProps) {
  // Destructurez 'id' et renommez-le en 'courseId'
  const { id: courseId, moduleId, quizId, attemptId } = await params;

  return (
    <QuizResults
      quizId={quizId}
      attemptId={attemptId}
      moduleId={moduleId}
      courseId={courseId} // Maintenant courseId est défini
    />
  );
}
