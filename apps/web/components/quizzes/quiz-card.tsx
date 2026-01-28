"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Edit, Trash2, FileQuestion } from "lucide-react";
import { Quiz } from "@/lib/quizzes";

interface QuizCardProps {
  quiz: Quiz;
  onEdit: (quiz: Quiz) => void;
  onDelete: (id: string) => void;
  onQuestions: (quiz: Quiz) => void;
}

export function QuizCard({
  quiz,
  onEdit,
  onDelete,
  onQuestions,
}: QuizCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              {quiz.title}
              {quiz.isRequired && (
                <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                  Required
                </span>
              )}
            </CardTitle>
            <CardDescription>
              Module: {quiz.moduleId?.title} • Passing Score:{" "}
              {quiz?.passingScore}%
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onQuestions(quiz)}
            >
              <FileQuestion className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => onEdit(quiz)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(quiz._id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}
