"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { StudentProgressReport, formateurApi } from "@/lib/formateur-api";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  TrendingUp,
  Clock,
  FileText,
  User,
  Mail,
  Calendar,
  Award,
  XCircle,
  Loader2,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ProgressBar from "@/components/formateur/ProgressBar";

export default function StudentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params?.courseId as string;
  const studentId = params?.studentId as string;

  const [report, setReport] = useState<StudentProgressReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const fetchProgress = async () => {
    if (!token || !courseId || !studentId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await formateurApi.getStudentProgress(courseId, studentId);
      setReport(data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, [token, courseId, studentId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-muted/40">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Chargement des données...</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-muted/40">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>

          <Card className="shadow-lg">
            <CardContent className="p-8 text-center">
              <XCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">
                {error || "Données introuvables"}
              </h3>
              <Button onClick={fetchProgress} className="mt-4">
                Réessayer
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour à la liste
        </Button>

        {/* Student Header Card */}
        <Card className="shadow-lg mb-6 overflow-hidden border-none">
          <div className="bg-gradient-to-br from-primary to-primary/80 p-8 text-primary-foreground">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-full bg-primary-foreground/20 backdrop-blur-sm">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                      {report.studentName}
                    </h1>
                  </div>
                </div>

                <div className="space-y-2 text-primary-foreground/90">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm">{report.studentEmail}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    <span className="text-sm">{report.courseTitle}</span>
                  </div>
                </div>
              </div>

              {/* Overall Progress */}
              <div className="bg-primary-foreground/20 backdrop-blur-sm rounded-xl p-6 min-w-[180px]">
                <div className="text-center">
                  <div className="text-5xl font-bold mb-1">
                    {report.overallProgress}%
                  </div>
                  <p className="text-sm text-primary-foreground/80">
                    Progression globale
                  </p>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-lg p-4 border border-primary-foreground/20">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-5 h-5" />
                  <p className="text-sm text-primary-foreground/80">
                    Quiz réussis
                  </p>
                </div>
                <p className="text-2xl font-bold">
                  {report.totalQuizzesPassed}/{report.totalQuizzesTaken}
                </p>
              </div>

              <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-lg p-4 border border-primary-foreground/20">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5" />
                  <p className="text-sm text-primary-foreground/80">
                    Score moyen
                  </p>
                </div>
                <p className="text-2xl font-bold">{report.averageQuizScore}%</p>
              </div>

              <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-lg p-4 border border-primary-foreground/20">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5" />
                  <p className="text-sm text-primary-foreground/80">
                    Dernière activité
                  </p>
                </div>
                <p className="text-lg font-bold">
                  {report.lastActivityAt
                    ? new Date(report.lastActivityAt).toLocaleDateString(
                        "fr-FR",
                        {
                          day: "numeric",
                          month: "short",
                        },
                      )
                    : "Aucune"}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Module Progress Card */}
        <Card className="shadow-lg mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-primary/10">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              Progression des Modules
            </CardTitle>
          </CardHeader>
          <CardContent>
            {report.moduleProgress.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">
                  Aucune progression enregistrée
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {report.moduleProgress.map((module) => (
                  <Card
                    key={module.moduleId}
                    className="border-muted hover:border-primary/50 transition-colors"
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-2">
                            {module.moduleTitle}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                              <BookOpen className="w-4 h-4" />
                              <span>
                                {module.completedLessons}/{module.totalLessons}{" "}
                                leçons
                              </span>
                            </div>
                            <span className="text-muted-foreground/40">•</span>
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-4 h-4" />
                              <span>
                                {new Date(
                                  module.lastAccessedAt,
                                ).toLocaleDateString("fr-FR")}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="ml-4">
                          <span
                            className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold ${
                              module.completionPercentage === 100
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                : module.completionPercentage >= 50
                                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                                  : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {module.completionPercentage}%
                          </span>
                        </div>
                      </div>
                      <ProgressBar
                        percentage={module.completionPercentage}
                        showLabel={false}
                      />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quiz Results Card */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-primary/10">
                <Award className="w-5 h-5 text-primary" />
              </div>
              Résultats des Quiz
            </CardTitle>
          </CardHeader>
          <CardContent>
            {report.quizResults.length === 0 ? (
              <div className="text-center py-12">
                <Award className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">Aucun quiz tenté</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Quiz
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Module
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Score
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Résultat
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Tentative
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {report.quizResults.map((quiz, idx) => (
                      <tr
                        key={idx}
                        className="hover:bg-muted/50 transition-colors"
                      >
                        <td className="px-4 py-4">
                          <div className="text-sm font-medium">
                            {quiz.quizTitle}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-muted-foreground">
                          {quiz.moduleTitle}
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm">
                            <span className="font-semibold">
                              {quiz.score}/{quiz.passingScore}
                            </span>
                            <span className="text-muted-foreground ml-2">
                              ({quiz.percentage}%)
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          {quiz.passed ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                              <CheckCircle2 className="w-3 h-3" />
                              Réussi
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                              <XCircle className="w-3 h-3" />
                              Échoué
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-sm text-muted-foreground">
                          Tentative {quiz.attemptNumber}
                        </td>
                        <td className="px-4 py-4 text-sm text-muted-foreground">
                          {new Date(quiz.attemptedAt).toLocaleDateString(
                            "fr-FR",
                            {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            },
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
