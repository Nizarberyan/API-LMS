"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Loader2, ArrowLeft, Save } from "lucide-react";
import { createCourse } from "@/lib/courses";
import api from "@/lib/api";
import Link from "next/link";

const courseSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  description: z.string().max(2000).optional(),
});

type CourseFormValues = z.infer<typeof courseSchema>;

export default function CreateCoursePage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  async function onSubmit(values: CourseFormValues) {
    setIsSaving(true);
    setError(null);

    try {
      await createCourse({
        title: values.title,
        description: values.description || "",
      });
      router.push("/dashboard/teacher");
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to create course";
      setError(Array.isArray(message) ? message[0] : message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Button variant="ghost" asChild>
          <Link href="/dashboard/teacher">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to My Courses
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create New Course</CardTitle>
          <CardDescription>
            Fill in the details to create a new course
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {error && (
                <div className="p-3 text-sm font-medium text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                  {error}
                </div>
              )}

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Introduction to Web Development"
                        {...field}
                        disabled={isSaving}
                      />
                    </FormControl>
                    <FormDescription>
                      A clear, descriptive title for your course
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe what apprenants will learn..."
                        className="min-h-32 resize-none"
                        {...field}
                        disabled={isSaving}
                      />
                    </FormControl>
                    <FormDescription>
                      Explain the course content and objectives
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4">
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Create Course
                    </>
                  )}
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link href="/dashboard/teacher">Cancel</Link>
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
