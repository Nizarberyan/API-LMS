"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreateQuizData } from "@/lib/quizzes";
import { modulesApi, Module } from "@/lib/modules";

interface QuizFormProps {
  initialData?: Partial<CreateQuizData>;
  onSubmit: (data: CreateQuizData) => Promise<void>;
  onCancel: () => void;
  submitLabel: string;
}

export function QuizForm({
  initialData,
  onSubmit,
  onCancel,
  submitLabel,
}: QuizFormProps) {
  const [formData, setFormData] = useState<CreateQuizData>({
    moduleId: initialData?.moduleId || "",
    title: initialData?.title || "",
    passingScore: initialData?.passingScore || 70,
    isRequired: initialData?.isRequired || false,
  });
  const [loading, setLoading] = useState(false);
  const [modules, setModules] = useState<Module[]>([]);

  useEffect(() => {
    const loadModules = async () => {
      try {
        const data = await modulesApi.getByTeacher();
        setModules(data);
      } catch (error) {
        console.error("Failed to load modules", error);
      }
    };
    loadModules();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            required
            disabled={loading}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="moduleId">Module</Label>
          <Select
            value={formData.moduleId}
            onValueChange={(value) =>
              setFormData({ ...formData, moduleId: value })
            }
            disabled={loading}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a module" />
            </SelectTrigger>
            <SelectContent>
              {modules.map((module) => (
                <SelectItem key={module._id} value={module._id}>
                  {module.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="passingScore">Passing Score (%)</Label>
          <Input
            id="passingScore"
            type="number"
            min="0"
            max="100"
            value={formData.passingScore}
            onChange={(e) =>
              setFormData({
                ...formData,
                passingScore: parseInt(e.target.value),
              })
            }
            required
            disabled={loading}
          />
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="isRequired"
            checked={formData.isRequired}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, isRequired: checked })
            }
            disabled={loading}
          />
          <Label htmlFor="isRequired">Required Quiz</Label>
        </div>
      </div>
      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
