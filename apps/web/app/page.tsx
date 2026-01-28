import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Users,
  Shield,
  GraduationCap,
  LayoutDashboard,
} from "lucide-react";

export default function Page() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <header className="px-4 lg:px-6 h-14 flex items-center border-b border-border/40 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <Link className="flex items-center justify-center gap-2" href="#">
          <GraduationCap className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg tracking-tight">LMS Platform</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link
            className="text-sm font-medium hover:text-primary transition-colors flex items-center"
            href="/auth/login"
          >
            Log In
          </Link>
          <Link
            className="text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors shadow-sm"
            href="/auth/register"
          >
            Get Started
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 relative overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
          <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 opacity-20 blur-[100px]"></div>

          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                  Empowering Education <br /> for Everyone
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  A modern Learning Management System designed for Seamless
                  Teaching and Effective Learning. Unlock your potential today.
                </p>
              </div>
              <div className="space-x-4 pt-4">
                <Link
                  className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                  href="/auth/register"
                >
                  Start Learning <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link
                  className="inline-flex h-11 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                  href="/dashboard"
                >
                  View Demo
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/40">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Why Choose Us?
              </h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed mt-4">
                Built with the needs of modern education in mind.
              </p>
            </div>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {/* Feature 1 */}
              <div className="flex flex-col items-center space-y-4 p-6 bg-card rounded-xl shadow-sm border border-border/50 hover:shadow-md transition-shadow">
                <div className="p-3 bg-primary/10 rounded-full">
                  <BookOpen className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Comprehensive Courses</h3>
                <p className="text-muted-foreground text-center">
                  Access a wide range of structured courses designed by experts
                  in their fields.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="flex flex-col items-center space-y-4 p-6 bg-card rounded-xl shadow-sm border border-border/50 hover:shadow-md transition-shadow">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Role-Based Access</h3>
                <p className="text-muted-foreground text-center">
                  Dedicated portals for Students, Teachers, and Admins to ensure
                  a tailored experience.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="flex flex-col items-center space-y-4 p-6 bg-card rounded-xl shadow-sm border border-border/50 hover:shadow-md transition-shadow">
                <div className="p-3 bg-primary/10 rounded-full">
                  <LayoutDashboard className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Intuitive Dashboard</h3>
                <p className="text-muted-foreground text-center">
                  Track progress, manage assignments, and view grades from a
                  single, clean interface.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t font-light text-xs text-muted-foreground">
        <p>© 2024 LMS Platform. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="hover:underline underline-offset-4" href="#">
            Terms of Service
          </Link>
          <Link className="hover:underline underline-offset-4" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
