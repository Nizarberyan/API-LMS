import { redirect } from "next/navigation";
import QuizTaker from "@/components/quiz/QuizTaker";

interface PageProps {
  params: Promise<{
    id: string;
    moduleId: string;
    quizId: string;
  }>;
}

export default async function QuizPage({ params }: PageProps) {
  const { id: courseId, moduleId, quizId } = await params;

  return <QuizTaker quizId={quizId} moduleId={moduleId} courseId={courseId} />;
}
