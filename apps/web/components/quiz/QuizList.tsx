"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { quizApi, type Quiz } from "@/lib/quiz-api";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileText,
  PlayCircle,
  AlertCircle,
  Award,
  Loader2,
} from "lucide-react";

interface QuizListProps {
  moduleId: string;
  courseId: string;
}

export default function QuizList({ moduleId, courseId }: QuizListProps) {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Moved fetchQuizzes here
  const fetchQuizzes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await quizApi.getQuizzesByModule(moduleId);
      setQuizzes(data);
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setError(
        apiError.response?.data?.message || "Erreur lors du chargement des quiz",
      );
    } finally {
      setLoading(false);
    }
  }, [moduleId]);

  // useEffect usage after definition
  useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes]);

  const handleStartQuiz = (quizId: string) => {
    router.push(
      `/dashboard/apprenant/courses/${courseId}/modules/${moduleId}/quizzes/${quizId}`,
    );
  };

  /* -------------------- Loading -------------------- */
  if (loading) {
    return (
      <div className="flex justify-center mt-20">
        <Card className="w-full max-w-md text-center p-8">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Chargement des quiz...</p>
        </Card>
      </div>
    );
  }

  /* -------------------- Error -------------------- */
  if (error) {
    return (
      <div className="flex justify-center mt-20">
        <Card className="w-full max-w-md border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="w-5 h-5" />
              Erreur
            </CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={fetchQuizzes} className="w-full">
              Réessayer
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  /* -------------------- Empty -------------------- */
  if (quizzes.length === 0) {
    return (
      <div className="flex justify-center mt-20">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <FileText className="mx-auto w-10 h-10 text-muted-foreground mb-2" />
            <CardTitle>Aucun quiz</CardTitle>
            <CardDescription>
              Ce module ne contient pas encore de quiz
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  /* -------------------- Data -------------------- */
  /* -------------------- Data -------------------- */
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {quizzes.map((quiz) => (
        <Card
          key={quiz._id}
          className="
          bg-zinc-900 
          border border-zinc-800 
          text-white 
          transition-all 
          hover:shadow-xl 
          hover:border-zinc-700
        "
        >
          <CardHeader>
            <CardTitle className="flex items-center justify-between gap-2 text-white">
              <span>{quiz.title}</span>

              {/* Badge */}
              {quiz.isRequired ? (
                <span className="text-xs px-3 py-1 rounded-full bg-rose-600/20 text-rose-400 border border-rose-500/30">
                  Obligatoire
                </span>
              ) : (
                <span className="text-xs px-3 py-1 rounded-full bg-zinc-700 text-zinc-300 border border-zinc-600">
                  Facultatif
                </span>
              )}
            </CardTitle>

            <CardDescription className="flex items-center gap-2 mt-2 text-zinc-400">
              <Award className="w-4 h-4 text-yellow-500" />
              Score minimum :
              <span className="font-semibold text-white">
                {quiz.passingScore}%
              </span>
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Button
              onClick={() => handleStartQuiz(quiz._id)}
              className="
              w-full 
              flex 
              items-center 
              gap-2 
              bg-white 
              text-black 
              hover:bg-zinc-200
            "
            >
              <PlayCircle className="w-4 h-4" />
              Commencer le quiz
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
