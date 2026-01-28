"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { CreateQuestionData, QuestionType } from "@/lib/questions";

interface QuestionFormProps {
  quizId: string;
  initialData?: Partial<CreateQuestionData>;
  onSubmit: (data: CreateQuestionData) => Promise<void>;
  onCancel: () => void;
  submitLabel: string;
}

export function QuestionForm({
  quizId,
  initialData,
  onSubmit,
  onCancel,
  submitLabel,
}: QuestionFormProps) {
  const [formData, setFormData] = useState<CreateQuestionData>({
    quizId,
    questionText: initialData?.questionText || "",
    type: initialData?.type || QuestionType.SINGLE_CHOICE,
    options: initialData?.options || ["", ""],
    points: initialData?.points || 1,
    correctAnswers: initialData?.correctAnswers || [],
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
    } finally {
      setLoading(false);
    }
  };

  const addOption = () => {
    setFormData((prev) => ({
      ...prev,
      options: [...prev.options, ""],
    }));
  };

  const removeOption = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
      correctAnswers: prev.correctAnswers
        .filter((ans) => ans !== index)
        .map((ans) => (ans > index ? ans - 1 : ans)),
    }));
  };

  const updateOption = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      options: prev.options.map((opt, i) => (i === index ? value : opt)),
    }));
  };

  const toggleCorrectAnswer = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      correctAnswers: prev.correctAnswers.includes(index)
        ? prev.correctAnswers.filter((ans) => ans !== index)
        : prev.type === QuestionType.SINGLE_CHOICE
          ? [index]
          : [...prev.correctAnswers, index].sort(),
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="questionText">Question Text</Label>
        <Textarea
          id="questionText"
          value={formData.questionText}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, questionText: e.target.value }))
          }
          required
          disabled={loading}
          placeholder="Enter your question here..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="type">Question Type</Label>
          <Select
            value={formData.type}
            onValueChange={(value: QuestionType) =>
              setFormData((prev) => ({
                ...prev,
                type: value,
                correctAnswers:
                  value === QuestionType.SINGLE_CHOICE
                    ? prev.correctAnswers.slice(0, 1)
                    : prev.correctAnswers,
              }))
            }
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={QuestionType.SINGLE_CHOICE}>
                Single Choice
              </SelectItem>
              <SelectItem value={QuestionType.MULTIPLE_CHOICE}>
                Multiple Choice
              </SelectItem>
              <SelectItem value={QuestionType.TRUE_FALSE}>
                True/False
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="points">Points</Label>
          <Input
            id="points"
            type="number"
            min="1"
            value={formData.points}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                points: parseInt(e.target.value) || 1,
              }))
            }
            required
            disabled={loading}
          />
        </div>
      </div>

      <div>
        <Label>Options</Label>
        <div className="space-y-2 mt-2">
          {formData.options.map((option, index) => (
            <div key={index} className="flex items-center gap-2">
              <Checkbox
                checked={formData.correctAnswers.includes(index)}
                onCheckedChange={() => toggleCorrectAnswer(index)}
                disabled={loading}
              />
              <Input
                value={option}
                onChange={(e) => updateOption(index, e.target.value)}
                placeholder={`Option ${index + 1}`}
                disabled={loading}
                required
              />
              {formData.options.length > 2 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeOption(index)}
                  disabled={loading}
                >
                  Remove
                </Button>
              )}
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={addOption}
            disabled={loading}
          >
            Add Option
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Check the boxes for correct answers.{" "}
          {formData.type === QuestionType.SINGLE_CHOICE
            ? "Only one answer can be selected."
            : "Multiple answers can be selected."}
        </p>
      </div>

      <div className="flex justify-end gap-2">
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
