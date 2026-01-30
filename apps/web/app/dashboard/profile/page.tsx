"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, User, Mail, Shield, Pencil } from "lucide-react";
import api from "@/lib/api";
import Link from "next/link";
import Image from "next/image";

interface UserProfile {
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  profilePicture?: string;
}

export default function ProfilePage() {
  // ... (keeping lines 26-70 unrelated to replacement scope)
  // Wait, I cannot use ReplacementContent that skips lines unless I use multiple chunks or careful range.
  // I will just do the import addition and the img replacement separately.
  // Actually, I can do it in one go if I include the lines in between, but that's risky if they change.
  // I'll use separate calls for cleaner diff.

  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/auth/profile");
        setUser(response.data);
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        setError("Failed to load profile. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center text-destructive">
        {error || "User not found"}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-2xl">
      <h1 className="text-3xl font-bold tracking-tight mb-8">My Profile</h1>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 overflow-hidden border border-border">
                {user.profilePicture ? (
                  <Image
                    src={
                      user.profilePicture.startsWith("http")
                        ? user.profilePicture
                        : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}${user.profilePicture}`
                    }
                    alt="Profile"
                    width={64}
                    height={64}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User className="h-8 w-8 text-primary" />
                )}
              </div>
              <div>
                <CardTitle className="text-2xl">
                  {user.firstName} {user.lastName}
                </CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  <Mail className="h-4 w-4" />
                  {user.email}
                </CardDescription>
              </div>
            </div>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              {user.role}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">First Name</p>
                <p className="font-medium">{user.firstName}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Last Name</p>
                <p className="font-medium">{user.lastName}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Role</p>
                <p className="font-medium capitalize">{user.role}</p>
              </div>
            </div>

            <div className="pt-4 border-t">
              <Button asChild>
                <Link href="/dashboard/profile/edit">
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit Profile
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
