"use client";

import { useEffect, useState } from "react";
import { Course } from "@/lib/courses";
import { CourseList } from "@/components/courses/course-list";
import { getStudentEnrollments } from "@/lib/enrollments";
import { Loader2 } from "lucide-react";
import api from "@/lib/api";

export default function MyLearningPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchEnrollments = async () => {
            try {
                const userRes = await api.get("/auth/profile");
                const userId = userRes.data._id;

                const enrollments = await getStudentEnrollments(userId);
                // Map enrollments to courses. The backend returns enrollments with populated course objects.
                // We need to extract the course object from each enrollment.
                // Based on the service implementation: populate('course')
                const enrolledCourses = enrollments.map((enrollment: any) => enrollment.course);
                setCourses(enrolledCourses);
            } catch (err) {
                console.error("Failed to fetch enrollments:", err);
                setError("Failed to load your courses. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchEnrollments();
    }, []);

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
        <div className="container mx-auto px-4 py-10">
            <h1 className="text-3xl font-bold tracking-tight mb-8">My Learning</h1>
            <CourseList courses={courses} />
        </div>
    );
}
