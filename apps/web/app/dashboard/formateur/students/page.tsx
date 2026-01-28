"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Course, formateurApi } from "@/lib/formateur-api";
import { BookOpen, Users, Loader2, Plus, GraduationCap } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import CourseCard from "@/components/formateur/CourseCard";

export default function StudentsPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const fetchCourses = async () => {
    if (!token) {
      router.push("/login");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await formateurApi.getMyCourses();
      setCourses(data);
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Erreur lors du chargement des cours",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-muted/40">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Chargement de vos cours...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Card */}
        <Card className="shadow-lg mb-8">
          <CardContent className="p-8">
            <div className="flex items-center gap-4 mb-3">
              <div className="p-3 rounded-full bg-primary/10">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-4xl font-bold tracking-tight">
                  Suivi des Apprenants
                </h1>
              </div>
            </div>
            <p className="text-muted-foreground text-lg ml-[72px]">
              Sélectionnez un cours pour voir la progression des étudiants
            </p>
          </CardContent>
        </Card>

        {/* Error State */}
        {error && (
          <Card className="shadow-lg mb-6 border-destructive">
            <CardContent className="p-8 text-center">
              <div className="p-4 rounded-full bg-destructive/10 inline-flex mb-4">
                <BookOpen className="w-12 h-12 text-destructive" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{error}</h3>
              <Button onClick={fetchCourses} className="mt-4">
                Réessayer
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!error && courses.length === 0 && (
          <Card className="shadow-lg">
            <CardContent className="p-12 text-center">
              <div className="p-4 rounded-full bg-muted inline-flex mb-6">
                <GraduationCap className="w-16 h-16 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-bold tracking-tight mb-2">
                Aucun cours trouvé
              </h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Vous n'avez pas encore créé de cours. Commencez par créer votre
                premier cours pour suivre vos étudiants.
              </p>
              <Button
                size="lg"
                onClick={() =>
                  router.push("/dashboard/formateur/courses/create")
                }
                className="gap-2"
              >
                <Plus className="w-5 h-5" />
                Créer mon premier cours
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Courses Grid */}
        {!error && courses.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <BookOpen className="w-5 h-5 text-primary" />
                <span className="font-semibold text-foreground">
                  {courses.length}
                </span>
                <span>cours disponible{courses.length > 1 ? "s" : ""}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <CourseCard
                  key={course._id}
                  course={course}
                  onClick={() =>
                    router.push(`/dashboard/formateur/students/${course._id}`)
                  }
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
