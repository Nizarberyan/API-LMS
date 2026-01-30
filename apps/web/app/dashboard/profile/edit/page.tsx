"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Loader2,
  ArrowLeft,
  Save,
  User,
  Camera,
  Lock,
  Upload,
} from "lucide-react";
import api from "@/lib/api";
import Link from "next/link";
import { AxiosError } from "axios";

const profileSchema = z.object({
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(50),
  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .max(50),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z
      .string()
      .min(6, "Password must be at least 6 characters"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function EditProfilePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
    },
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/auth/profile");
        form.reset({
          firstName: response.data.firstName,
          lastName: response.data.lastName,
        });
        if (response.data.profilePicture) {
          // Handle both absolute URL (if implemented) or relative path
          const avatarUrl = response.data.profilePicture.startsWith("http")
            ? response.data.profilePicture
            : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}${response.data.profilePicture}`;
          setAvatarPreview(avatarUrl);
        }
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        setError("Failed to load profile.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [form]);

  async function onSubmit(values: ProfileFormValues) {
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await api.patch("/auth/profile", values);
      setSuccess("Profile updated successfully!");
      // Don't redirect immediately so user can see success
      // Or redirect after short delay
      setTimeout(() => {
        router.push("/dashboard/profile");
      }, 1000);
    } catch (err) {
      if (err instanceof AxiosError) {
        const message =
          err.response?.data?.message || "Failed to update profile.";
        setError(Array.isArray(message) ? message[0] : message);
      }
    } finally {
      setIsSaving(false);
    }
  }

  async function onPasswordSubmit(values: PasswordFormValues) {
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await api.post("/auth/change-password", {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      setSuccess("Password changed successfully!");
      passwordForm.reset();
    } catch (err) {
      if (err instanceof AxiosError) {
        const message =
          err.response?.data?.message || "Failed to change password.";
        setError(Array.isArray(message) ? message[0] : message);
      }
    } finally {
      setIsSaving(false);
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await api.post("/auth/profile/avatar", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      // Handle both absolute URL (if implemented) or relative path
      const avatarUrl = response.data.user.profilePicture.startsWith("http")
        ? response.data.user.profilePicture
        : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}${response.data.user.profilePicture}`;
      setAvatarPreview(avatarUrl);
      setSuccess("Avatar updated successfully!");
    } catch (err) {
      if (err instanceof AxiosError) {
        const message =
          err.response?.data?.message || "Failed to upload avatar.";
        setError(Array.isArray(message) ? message[0] : message);
      }
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-xl space-y-8">
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href="/dashboard/profile">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Profile
          </Link>
        </Button>
      </div>

      <div className="space-y-6">
        {/* Profile Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your personal details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar Section */}
            <div className="flex flex-col items-center gap-4 py-4">
              <div
                className="relative group cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="h-24 w-24 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center border-2 border-border">
                  {avatarPreview ? (
                    <Image
                      src={avatarPreview}
                      alt="Profile"
                      width={96}
                      height={96}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User className="h-12 w-12 text-primary" />
                  )}
                </div>
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="h-8 w-8 text-white" />
                </div>
                {isUploading && (
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                    <Loader2 className="h-8 w-8 text-white animate-spin" />
                  </div>
                )}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mr-2 h-4 w-4" />
                Change Picture
              </Button>
            </div>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                {error && (
                  <div className="p-3 text-sm font-medium text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="p-3 text-sm font-medium text-green-600 bg-green-50 border border-green-200 rounded-md">
                    {success}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={isSaving} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={isSaving} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" asChild>
                    <Link href="/dashboard/profile">Cancel</Link>
                  </Button>
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Details
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Change Password Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Change Password</CardTitle>
            </div>
            <CardDescription>
              Secure your account with a new password
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...passwordForm}>
              <form
                onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={passwordForm.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} disabled={isSaving} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={passwordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            {...field}
                            disabled={isSaving}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={passwordForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            {...field}
                            disabled={isSaving}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Update Password"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
