"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Course, getCourse } from "@/lib/courses"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, ArrowLeft, User, Calendar, BookOpen } from "lucide-react"
import api from "@/lib/api";
import Link from "next/link"

export default function CourseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [course, setCourse] = useState<Course | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null);


  useEffect(() => {
    const fetchCourse = async () => {
        console.log("Invalid course ID:", params.id)
      if (!params.id || typeof params.id !== "string") {
        setError("Invalid course ID")
        setIsLoading(false)
        return
      }

      try {
        const data = await getCourse(params.id)
        console.log("Fetched course data:", data)
        setCourse(data)
      } catch (err) {
        console.error("Failed to fetch course:", err)
        setError("Course not found")
      } finally {
        setIsLoading(false)
      }
    }

    fetchCourse()

  }, [params.id])

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/auth/profile");
        console.log("Profil utilisateur :", res.data);
        setUserRole(res.data.role);
      } catch (err) {
        console.error("Erreur profil :", err);
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
    )
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
    )
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
                    {course.teacher.firstName} {course.teacher.lastName}
                  </CardDescription>
                </div>
              </div>
            </div>
            {course.isPublished ? (
              <Badge variant="default" className="shrink-0">Published</Badge>
            ) : (
              <Badge variant="secondary" className="shrink-0">Draft</Badge>
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
              <span>Created: {new Date(course.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="pt-4 border-t">
            {userRole === "student" && (
              <Button size="lg" asChild>
                <Link href={`/dashboard/apprenant/courses/${params.id}/modules`}>
                  Start Learning
                </Link>
              </Button>
            )}
            {userRole === "teacher" && (
              <Button size="lg" asChild>
                <Link href={`/dashboard/formateur/courses/${params.id}/modules`}>
                  Gérer les modules
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
