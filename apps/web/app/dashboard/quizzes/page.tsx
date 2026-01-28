"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, HelpCircle } from "lucide-react"
import { quizApi, Quiz, CreateQuizData } from "@/lib/quizzes"
import { QuizForm } from "@/components/quizzes/quiz-form"
import { showSuccess, showError } from "@/components/ui/toast";
import { QuizCard } from "@/components/quizzes/quiz-card"
import { QuestionsManager } from "@/components/quizzes/questions-manager"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { useRouter } from "next/navigation";
import api from "@/lib/api"

export default function QuizzesPage() {
    const [quizzes, setQuizzes] = useState<Quiz[]>([])
    const [loading, setLoading] = useState(true)
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null)
    const [isQuestionsOpen, setIsQuestionsOpen] = useState(false)
    const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null)
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
    const [deletingQuizId, setDeletingQuizId] = useState<string | null>(null)
    const router = useRouter();

    useEffect(() => {
        const checkRoleAndFetch = async () => {
            try {
                const profile = await api.get("/auth/profile");
                if (profile.data.role !== "teacher") {
                    router.replace("/dashboard");
                    return;
                }
                loadQuizzes();
            } catch (error) {
                showError("Accès refusé ou session expirée");
                router.replace("/auth/login");
            }
        };
        checkRoleAndFetch();
    }, [router]);

    const loadQuizzes = async () => {
        try {
            const data = await quizApi.getAll()
            setQuizzes(data)
        } catch (error) {
            showError("Failed to load quizzes")
        } finally {
            setLoading(false)
        }
    }

    const handleCreate = async (data: CreateQuizData) => {
        try {
            await quizApi.create(data)
            showSuccess("Quiz created successfully")
            setIsCreateOpen(false)
            loadQuizzes()
        } catch (error) {
            showError("Failed to create quiz")
        }
    }

    const handleEdit = async (data: CreateQuizData) => {
        if (!editingQuiz) return
        
        try {
            await quizApi.update(editingQuiz._id, data)
            showSuccess("Quiz updated successfully")
            setIsEditOpen(false)
            setEditingQuiz(null)
            loadQuizzes()
        } catch (error) {
            showError("Failed to update quiz")
        }
    }

    const handleDelete = async (id: string) => {
        setDeletingQuizId(id)
        setIsDeleteConfirmOpen(true)
    }

    const confirmDelete = async () => {
        if (!deletingQuizId) return

        try {
            await quizApi.delete(deletingQuizId)
            showSuccess("Quiz deleted successfully")
            loadQuizzes()
        } catch (error) {
            showError("Failed to delete quiz")
        } finally {
            setDeletingQuizId(null)
        }
    }

    const openEditDialog = (quiz: Quiz) => {
        setEditingQuiz(quiz)
        setIsEditOpen(true)
    }

    const openQuestionsDialog = (quiz: Quiz) => {
        setSelectedQuiz(quiz)
        setIsQuestionsOpen(true)
    }

    if (loading) {
        return <div className="flex items-center justify-center h-64">Loading...</div>
    }

    console.log(quizzes)
    return (
        <div className="container mx-auto py-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold">Quiz Management</h1>
                    <p className="text-muted-foreground">Create and manage quizzes for your courses</p>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Quiz
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Quiz</DialogTitle>
                            <DialogDescription>Add a new quiz to your course module</DialogDescription>
                        </DialogHeader>
                        <QuizForm
                            onSubmit={handleCreate}
                            onCancel={() => setIsCreateOpen(false)}
                            submitLabel="Create Quiz"
                        />
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-4">
                {quizzes.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <HelpCircle className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No quizzes found</h3>
                            <p className="text-muted-foreground text-center mb-4">
                                Get started by creating your first quiz
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    quizzes.map((quiz) => (
                        <QuizCard
                            key={quiz._id}
                            quiz={quiz}
                            onEdit={openEditDialog}
                            onDelete={handleDelete}
                            onQuestions={openQuestionsDialog}
                        />
                    ))
                )}
            </div>

            {/* Edit Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Quiz</DialogTitle>
                        <DialogDescription>Update quiz information</DialogDescription>
                    </DialogHeader>
                    <QuizForm
                        initialData={editingQuiz ? {
                            moduleId: editingQuiz.moduleId != null ? editingQuiz.moduleId._id : '',
                            title: editingQuiz.title,
                            passingScore: editingQuiz.passingScore,
                            isRequired: editingQuiz.isRequired
                        } : undefined}
                        onSubmit={handleEdit}
                        onCancel={() => {
                            setIsEditOpen(false)
                            setEditingQuiz(null)
                        }}
                        submitLabel="Update Quiz"
                    />
                </DialogContent>
            </Dialog>

            <QuestionsManager
                quizId={selectedQuiz?._id || ""}
                quizTitle={selectedQuiz?.title || ""}
                isOpen={isQuestionsOpen}
                onOpenChange={setIsQuestionsOpen}
            />

            <ConfirmDialog
                open={isDeleteConfirmOpen}
                onOpenChange={setIsDeleteConfirmOpen}
                title="Delete Quiz"
                description="Are you sure you want to delete this quiz? This action cannot be undone and will also delete all associated questions."
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={confirmDelete}
                variant="destructive"
            />
        </div>
    )
}