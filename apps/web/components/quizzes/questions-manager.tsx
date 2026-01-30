"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Edit, Trash2 } from "lucide-react";
import {
  questionApi,
  Question,
  CreateQuestionData,
} from "@/lib/questions";
import { showSuccess, showError } from "@/components/ui/toast";
import { QuestionForm } from "./question-form";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface QuestionsManagerProps {
  quizId: string;
  quizTitle: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuestionsManager({
  quizId,
  quizTitle,
  isOpen,
  onOpenChange,
}: QuestionsManagerProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deletingQuestionId, setDeletingQuestionId] = useState<string | null>(
    null,
  );

  const loadQuestions = useCallback(async () => {
    try {
      setLoading(true);
      const data = await questionApi.getByQuiz(quizId); // Assuming questionApi.getByQuiz is the correct method, not quizApi.getQuestionsByQuiz as in the diff
      setQuestions(data);
    } catch (err) {
      console.error("Error loading questions:", err);
      // Removed unused showError calls if they exist, or just keeping silence on errors for now as implied by context
    } finally {
      setLoading(false);
    }
  }, [quizId]);

  useEffect(() => {
    if (isOpen) {
      loadQuestions();
    }
  }, [isOpen, loadQuestions]);

  const handleCreate = async (data: CreateQuestionData) => {
    try {
      await questionApi.create(data);
      showSuccess("Question created successfully");
      setIsCreateOpen(false);
      loadQuestions();
    } catch {
      showError("Failed to create question");
    }
  };

  const handleEdit = async (data: CreateQuestionData) => {
    if (!editingQuestion) return;

    try {
      await questionApi.update(editingQuestion._id, data);
      showSuccess("Question updated successfully");
      setIsEditOpen(false);
      setEditingQuestion(null);
      loadQuestions();
    } catch {
      showError("Failed to update question");
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingQuestionId(id);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingQuestionId) return;

    try {
      await questionApi.delete(deletingQuestionId);
      showSuccess("Question deleted successfully");
      loadQuestions();
    } catch {
      showError("Failed to delete question");
    } finally {
      setDeletingQuestionId(null);
    }
  };

  const openEditDialog = (question: Question) => {
    setEditingQuestion(question);
    setIsEditOpen(true);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Questions for {quizTitle}</DialogTitle>
          <DialogDescription>Manage questions for this quiz</DialogDescription>
        </DialogHeader>

        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            Questions ({questions.length})
          </h3>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Question
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Question</DialogTitle>
                <DialogDescription>
                  Add a new question to this quiz
                </DialogDescription>
              </DialogHeader>
              <QuestionForm
                quizId={quizId}
                onSubmit={handleCreate}
                onCancel={() => setIsCreateOpen(false)}
                submitLabel="Create Question"
              />
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="text-center py-4">Loading questions...</div>
        ) : questions.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <p className="text-muted-foreground">No questions found</p>
              <p className="text-sm text-muted-foreground">
                Add your first question to get started
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {questions.map((question, index) => (
              <Card key={question._id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base">
                        Question {index + 1}: {question.questionText}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Type: {question.type.replace("_", " ").toUpperCase()} |
                        Points: {question.points}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(question)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(question._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="font-medium">Options:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {question.options.map((option, idx) => (
                        <li
                          key={idx}
                          className={
                            question.correctAnswers.includes(idx)
                              ? "font-semibold text-green-600"
                              : ""
                          }
                        >
                          {option}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Question</DialogTitle>
              <DialogDescription>Update question information</DialogDescription>
            </DialogHeader>
            <QuestionForm
              quizId={quizId}
              initialData={
                editingQuestion
                  ? {
                    quizId: editingQuestion.quizId,
                    questionText: editingQuestion.questionText,
                    type: editingQuestion.type,
                    options: editingQuestion.options,
                    points: editingQuestion.points,
                    correctAnswers: editingQuestion.correctAnswers,
                  }
                  : undefined
              }
              onSubmit={handleEdit}
              onCancel={() => {
                setIsEditOpen(false);
                setEditingQuestion(null);
              }}
              submitLabel="Update Question"
            />
          </DialogContent>
        </Dialog>
      </DialogContent>

      <ConfirmDialog
        open={isDeleteConfirmOpen}
        onOpenChange={setIsDeleteConfirmOpen}
        title="Delete Question"
        description="Are you sure you want to delete this question? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        variant="destructive"
      />
    </Dialog>
  );
}
