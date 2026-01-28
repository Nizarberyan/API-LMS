"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpen,
  LayoutDashboard,
  GraduationCap,
  User,
  LogOut,
  Briefcase,
  Shield,
  ListChecks,
  BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Role } from "@/lib/types";
import api from "@/lib/api";
import Cookies from "js-cookie";

interface DashboardSidebarProps {
  userRole: string;
}

export function DashboardSidebar({
  userRole,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      Cookies.remove("token");
      router.push("/auth/login");
    }
  };

  const getNavItems = () => {
    const baseItems = [
      { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    ];

    if (userRole === Role.STUDENT) {
      baseItems.push({ href: "/dashboard/courses", label: "My Learning", icon: GraduationCap });
    }

    if (userRole === Role.TEACHER) {
      baseItems.push(
        { href: "/dashboard/quizzes", label: "Quizzes", icon: ListChecks },
        { href: "/dashboard/formateur/students", label: "Suivi Apprenants", icon: BarChart3 },
        { href: "/dashboard/teacher", label: "My Courses", icon: Briefcase },
        { href: "/dashboard/courses", label: "Catalog", icon: BookOpen } // Teachers can view catalog
      );
    }

    if (userRole === Role.ADMIN) {
      baseItems.push(
        { href: "/dashboard/admin/users", label: "Utilisateurs", icon: User },
        { href: "/dashboard/admin/courses", label: "Cours", icon: GraduationCap },
        { href: "/dashboard/admin", label: "Administration", icon: Shield }
      );
    }

    baseItems.push({ href: "/dashboard/profile", label: "Profile", icon: User });
    return baseItems;
  };

  const navItems = getNavItems();

  return (
    <div className="flex h-full w-64 flex-col bg-card border-r">
      <div className="flex h-14 items-center border-b px-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 font-semibold"
        >
          <BookOpen className="h-6 w-6 text-primary" />
          <span>LMS Platform</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Button
              key={item.href}
              variant={isActive ? "secondary" : "ghost"}
              className={cn("w-full justify-start", isActive && "bg-secondary")}
              asChild
            >
              <Link href={item.href}>
                <Icon className="mr-2 h-4 w-4" />
                {item.label}
              </Link>
            </Button>
          );
        })}
      </nav>
      <div className="border-t p-4">
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </Button>
      </div>
    </div>
  );
}
