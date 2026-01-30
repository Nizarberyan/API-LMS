"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Course, getCourse } from "@/lib/courses";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, User, Calendar, BookOpen } from "lucide-react";
import api from "@/lib/api";
import { AxiosError } from "axios";
import Link from "next/link";

export default function CourseDetailPage() {
  const params = useParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const router = useRouter();

  const handleStartLearning = async () => {
    if (!params.id) return;

    try {
      setIsStarting(true);
      // Fetch the module to resume from
      const res = await api.get(`/courses/${params.id}/resume`);
      const nextModule = res.data;

      if (nextModule && nextModule._id) {
        router.push(`/dashboard/apprenant/courses/${params.id}/modules/${nextModule._id}`);
      } else {
        // Fallback to module list if something goes wrong or no modules
        router.push(`/dashboard/apprenant/courses/${params.id}/modules`);
      }
    } catch (err) {
      const error = err as AxiosError;
      if (error.response && error.response.status === 404) {
        // No modules found or resume point not found - straightforward redirect to modules list
        router.push(`/dashboard/apprenant/courses/${params.id}/modules`);
      } else {
        console.error("Failed to start learning:", err);
        router.push(`/dashboard/apprenant/courses/${params.id}/modules`);
      }
    } finally {
      // Don't set loading false immediately if we are navigating away, 
      // but if we failed/fallback and didn't navigate, we might want to reset? 
      // Actually often better to leave it spinning or handle error gracefully.
      // For now, if we error'd and fellback, we are navigating anyway.
      // If we failed completely, we might want to show a toast.
      // Simply navigating to the list is a safe fallback.
    }
  };

  useEffect(() => {
    const fetchCourse = async () => {
      if (!params.id || typeof params.id !== "string") {
        setError("Invalid course ID");
        setIsLoading(false);
        return;
      }

      try {
        const data = await getCourse(params.id);
        setCourse(data);
      } catch (err) {
        console.error("Failed to fetch course:", err);
        setError("Course not found");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourse();
  }, [params.id]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/auth/profile");
        setUserRole(res.data.role);
      } catch {
        setUserRole(null);
      }
    };
    fetchUser();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" asChild>
          <Link href="/dashboard/courses">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Courses
          </Link>
        </Button>
        <div className="flex h-[40vh] w-full items-center justify-center text-destructive">
          {error || "Course not found"}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" asChild>
          <Link href="/dashboard/courses">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Courses
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <BookOpen className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-2xl">{course.title}</CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <User className="h-4 w-4" />
                    {course.teacher ? `${course.teacher.firstName} ${course.teacher.lastName}` : "Unknown Teacher"}
                  </CardDescription>
                </div>
              </div>
            </div>
            {course.isPublished ? (
              <Badge variant="default" className="shrink-0">
                Published
              </Badge>
            ) : (
              <Badge variant="secondary" className="shrink-0">
                Draft
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-muted-foreground leading-relaxed">
              {course.description}
            </p>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>
                Created: {new Date(course.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
          <div className="pt-4 border-t">
            {userRole === "student" && (
              <Button
                size="lg"
                onClick={handleStartLearning}
                disabled={isStarting}
              >
                {isStarting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Starting...
                  </>
                ) : (
                  "Start Learning"
                )}
              </Button>
            )}
            {userRole === "teacher" && (
              <Button size="lg" asChild>
                <Link
                  href={`/dashboard/formateur/courses/${params.id}/modules`}
                >
                  Gérer les modules
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div >
  );
}
