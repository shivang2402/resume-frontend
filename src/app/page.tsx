import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, GitBranch, Briefcase, Zap } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Resume Forge</h1>
          <Link href="/dashboard">
            <Button variant="outline">Dashboard</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-24 text-center">
        <h2 className="text-5xl font-bold tracking-tight mb-6">
          Build Tailored Resumes
          <br />
          <span className="text-muted-foreground">For Every Application</span>
        </h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Stop editing the same resume over and over. Create modular content sections, 
          mix and match for each job, and generate polished PDFs instantly.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/dashboard">
            <Button size="lg" className="text-lg px-8">
              Get Started
            </Button>
          </Link>
          <Link href="/dashboard/content">
            <Button size="lg" variant="outline" className="text-lg px-8">
              View Demo
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-16">
        <h3 className="text-2xl font-bold text-center mb-12">How It Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-semibold mb-2">Modular Content</h4>
              <p className="text-sm text-muted-foreground">
                Create reusable sections for experiences, projects, and skills. 
                Write once, use everywhere.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                <GitBranch className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-semibold mb-2">Version Control</h4>
              <p className="text-sm text-muted-foreground">
                Every edit creates a new version. Compare changes, 
                roll back anytime, never lose work.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-semibold mb-2">Instant PDF</h4>
              <p className="text-sm text-muted-foreground">
                Select your sections, hit generate. 
                Professional LaTeX-quality PDFs in seconds.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                <Briefcase className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-semibold mb-2">Track Applications</h4>
              <p className="text-sm text-muted-foreground">
                Log every application with the exact resume config used. 
                Never forget what you sent where.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-16 text-center">
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="py-12">
            <h3 className="text-2xl font-bold mb-4">Ready to forge your resume??</h3>
            <p className="mb-6 opacity-90">
              Start building your content library today.
            </p>
            <Link href="/dashboard">
              <Button size="lg" variant="secondary">
                Launch Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
          Built for job seekers who value efficiency
        </div>
      </footer>
    </main>
  );
}


