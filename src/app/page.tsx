import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-background">
      <div className="text-center space-y-6">
        <h1 className="text-5xl font-bold tracking-tight">Resume Forge</h1>
        <p className="text-xl text-muted-foreground max-w-md">
          Build tailored resumes for every job application. Version control your content. Track your applications.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/dashboard">
            <Button size="lg">Get Started</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}