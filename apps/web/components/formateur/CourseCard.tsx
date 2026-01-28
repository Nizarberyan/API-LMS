"use client";

import { Course } from "@/lib/formateur-api";
import { Calendar, Users, ArrowRight, BookOpen } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

interface CourseCardProps {
  course: Course;
  onClick: () => void;
}

export default function CourseCard({ course, onClick }: CourseCardProps) {
  return (
    <Card
      onClick={onClick}
      className="w-full shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden group border-muted"
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="p-3 rounded-full bg-primary/10 text-primary">
            <BookOpen className="w-5 h-5" />
          </div>
          <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
        </div>

        <h3 className="text-xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors mb-2 line-clamp-2">
          {course.title}
        </h3>

        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
          {course.description}
        </p>

        <div className="flex items-center gap-4 pt-4 border-t">
          <div className="flex items-center text-xs text-muted-foreground">
            <Calendar className="w-4 h-4 mr-1.5" />
            {new Date(course.createdAt).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </div>
        </div>
      </CardContent>

      <CardFooter className="px-6 pb-6 pt-0">
        <div className="flex items-center text-sm font-medium text-primary group-hover:underline">
          <Users className="w-4 h-4 mr-2" />
          Voir les étudiants
        </div>
      </CardFooter>
    </Card>
  );
}
