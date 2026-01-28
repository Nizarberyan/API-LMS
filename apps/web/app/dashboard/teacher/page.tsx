"use client";

import { useEffect, useState, useMemo } from "react";
import { Course, getCourses, deleteCourse, updateCourse } from "@/lib/courses";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Loader2,
  Plus,
  BookOpen,
  Eye,
  Pencil,
  Trash2,
  BarChart3,
  Search,
} from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  role: string;
}

export default function TeacherDashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "published" | "draft"
  >("all");
  const [debugLogs, setDebugLogs] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, coursesRes] = await Promise.all([
          api.get("/auth/profile"),
          getCourses(),
        ]);
        console.log("RAW coursesRes:", coursesRes);
        setUser(profileRes.data);

        // Debugging Logic
        const logs = coursesRes.map((c: any) => {
          const teacherId = typeof c.teacher === "string" ? c.teacher : c.teacher?._id;
          return {
            id: c._id,
            title: c.title,
            teacherVal: c.teacher,
            extractedTeacherId: teacherId,
            currentUserId: profileRes.data._id,
            isMatch: String(teacherId) === String(profileRes.data._id)
          };
        });
        setDebugLogs(logs);

        // Filter to show only this teacher's courses
        console.log('Fetching data for teacher dashboard...');
        const myCourses = coursesRes.filter((course) => {
          const teacherId =
            typeof course.teacher === "string"
              ? course.teacher
              : course.teacher?._id;
          return String(teacherId) === String(profileRes.data._id);
        });

        console.log("Teacher Dashboard Debug:", {
          userId: profileRes.data._id,
          totalCourses: coursesRes.length,
          myCoursesCount: myCourses.length,
        });

        setCourses(myCourses);
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError("Failed to load courses");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDelete = async (courseId: string) => {
    try {
      await deleteCourse(courseId);
      setCourses(courses.filter((c) => c._id !== courseId));
    } catch (err) {
      console.error("Failed to delete course:", err);
    }
  };

  const handleTogglePublish = async (
    courseId: string,
    currentStatus: boolean,
  ) => {
    try {
      const updated = await updateCourse(courseId, {
        isPublished: !currentStatus,
      });
      setCourses(courses.map((c) => (c._id === courseId ? updated : c)));
    } catch (err) {
      console.error("Failed to update course:", err);
    }
  };

  const publishedCount = courses.filter((c) => c.isPublished).length;
  const draftCount = courses.filter((c) => !c.isPublished).length;

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesSearch =
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "published" && course.isPublished) ||
        (statusFilter === "draft" && !course.isPublished);
      return matchesSearch && matchesStatus;
    });
  }, [courses, searchQuery, statusFilter]);

  if (isLoading) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center text-destructive">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* DEBUG PANEL - REMOVE AFTER FIXING */}
      <Card className="bg-zinc-900 border-zinc-700">
        <CardHeader><CardTitle className="text-sm text-white">Debug Info (Visible only for debugging)</CardTitle></CardHeader>
        <CardContent>
          <div className="text-xs font-mono space-y-1 max-h-60 overflow-y-auto text-zinc-200">
            <p><strong className="text-white">CurrentUser ID:</strong> {user?._id}</p>
            <div className="mt-2 border-t border-zinc-700 pt-2">
              {debugLogs.length === 0 ? <p className="text-zinc-400">No courses fetched from API</p> : null}
              {debugLogs.map((log: any) => (
                <div key={log.id} className={log.isMatch ? "text-green-400 font-bold" : "text-red-400"}>
                  [{log.isMatch ? 'MATCH' : 'NO MATCH'}] Course: {log.title}
                  <br />TeacherID: {String(log.extractedTeacherId)}
                  <br />UserID: {String(log.currentUserId)}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      {/* END DEBUG PANEL */}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Courses</h1>
          <p className="text-muted-foreground">
            Manage your courses as a teacher
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/teacher/create">
            <Plus className="mr-2 h-4 w-4" />
            Create Course
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{courses.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {publishedCount}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Drafts</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-muted-foreground">
              {draftCount}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(value: "all" | "published" | "draft") =>
            setStatusFilter(value)
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Courses</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Drafts</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Course List */}
      {filteredCourses.length === 0 ? (
        <Card className="p-12 text-center">
          <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {courses.length === 0
              ? "No courses yet"
              : "No courses match your filters"}
          </h3>
          <p className="text-muted-foreground mb-4">
            {courses.length === 0
              ? "Create your first course to get started"
              : "Try adjusting your search or filter"}
          </p>
          {courses.length === 0 && (
            <Button asChild>
              <Link href="/dashboard/teacher/create">
                <Plus className="mr-2 h-4 w-4" />
                Create Course
              </Link>
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredCourses.map((course) => (
            <Card key={course._id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium truncate">{course.title}</h3>
                    <p className="text-sm text-muted-foreground truncate">
                      {course.description || "No description"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 ml-4">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={course.isPublished}
                      onCheckedChange={() =>
                        handleTogglePublish(course._id, course.isPublished)
                      }
                    />
                    <span className="text-xs text-muted-foreground w-16">
                      {course.isPublished ? "Published" : "Draft"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/dashboard/teacher/${course._id}/edit`}>
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/dashboard/courses/${course._id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Course</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete &quot;{course.title}
                            &quot;? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(course._id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
