"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { StudentProgressReport, formateurApi } from "@/lib/formateur-api";
import {
  ArrowLeft,
  Users,
  UserCheck,
  TrendingUp,
  Calendar,
  ArrowRight,
  Loader2,
  AlertCircle,
  BookOpen,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ProgressBar from "@/components/formateur/ProgressBar";

export default function CourseStudentsPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params?.courseId as string;

  const [reports, setReports] = useState<StudentProgressReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const fetchProgress = async () => {
    if (!token || !courseId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await formateurApi.getCourseProgress(courseId);
      setReports(data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, [token, courseId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-muted/40">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Chargement des étudiants...</p>
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
          Retour aux cours
        </Button>

        {/* Header Card */}
        <Card className="shadow-lg mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-full bg-primary/10">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  {reports[0]?.courseTitle || "Cours"}
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="w-5 h-5 text-primary" />
              <span className="font-semibold text-foreground">
                {reports.length}
              </span>
              <span>
                étudiant{reports.length > 1 ? "s" : ""} inscrit
                {reports.length > 1 ? "s" : ""}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Error State */}
        {error && (
          <Card className="shadow-lg mb-6 border-destructive">
            <CardContent className="p-8 text-center">
              <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">{error}</h3>
              <Button onClick={fetchProgress} className="mt-4">
                Réessayer
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!error && reports.length === 0 && (
          <Card className="shadow-lg">
            <CardContent className="p-12 text-center">
              <div className="p-4 rounded-full bg-muted inline-flex mb-4">
                <Users className="w-12 h-12 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Aucun étudiant inscrit
              </h3>
              <p className="text-muted-foreground">
                Aucun étudiant ne s'est encore inscrit à ce cours
              </p>
            </CardContent>
          </Card>
        )}

        {/* Students Table */}
        {!error && reports.length > 0 && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-primary/10">
                  <UserCheck className="w-5 h-5 text-primary" />
                </div>
                Liste des Étudiants
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Étudiant
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Progression
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Quiz
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Score moyen
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Dernière activité
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {reports.map((report) => (
                      <tr
                        key={report.studentId}
                        className="hover:bg-muted/50 transition-colors group"
                      >
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-semibold">
                              {report.studentName}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {report.studentEmail}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="max-w-xs">
                            <ProgressBar percentage={report.overallProgress} />
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium">
                            {report.totalQuizzesPassed}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            /{report.totalQuizzesTaken}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold bg-primary/10 text-primary">
                            <TrendingUp className="w-3 h-3" />
                            {report.averageQuizScore}%
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            {report.lastActivityAt
                              ? new Date(
                                  report.lastActivityAt,
                                ).toLocaleDateString("fr-FR")
                              : "Aucune"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              router.push(
                                `/dashboard/formateur/students/${courseId}/${report.studentId}`,
                              )
                            }
                            className="group-hover:bg-primary/10 group-hover:text-primary"
                          >
                            Voir détails
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
