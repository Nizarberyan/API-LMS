"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2, Mail, ArrowLeft, CheckCircle } from "lucide-react";
import Link from "next/link";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit() {
    setIsLoading(true);
    setError(null);

    try {
      // TODO: Implement when backend supports password reset
      // await api.post("/auth/forgot-password", { email: values.email })

      // For now, simulate success
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsSubmitted(true);
    } catch (err) {
      if (err instanceof Error) {
        setError(`Failed to send reset email. Please try again. ${err.message}`);
      } else {
        setError(`Failed to send reset email. Please try again.`);
      }
    } finally {
      setIsLoading(false);
    }
  }

  if (isSubmitted) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 bg-muted/40">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <CheckCircle className="w-8 h-8" />
              </div>
            </div>
            <CardTitle>Check Your Email</CardTitle>
            <CardDescription>
              If an account exists with that email, we&apos;ve sent password
              reset instructions.
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Button variant="outline" asChild>
              <Link href="/auth/login">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Login
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-muted/40">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <div className="p-3 rounded-full bg-primary/10 text-primary">
              <Mail className="w-6 h-6" />
            </div>
          </div>
          <CardTitle>Forgot Password</CardTitle>
          <CardDescription>
            Enter your email address and we&apos;ll send you a link to reset
            your password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <div className="p-3 text-sm font-medium text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                  {error}
                </div>
              )}

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="you@example.com"
                          className="pl-9"
                          {...field}
                          disabled={isLoading}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="justify-center">
          <Link
            href="/auth/login"
            className="text-sm text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="inline mr-1 h-3 w-3" />
            Back to Login
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
