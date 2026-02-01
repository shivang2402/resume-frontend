"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { sectionsAPI, generateAPI, Section } from "@/lib/api";
import { Download, FileText, Briefcase, FolderOpen, Loader2 } from "lucide-react";

export default function GeneratePage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  // Selected sections
  const [selectedExperiences, setSelectedExperiences] = useState<string[]>([]);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);

  // Job info (optional)
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [location, setLocation] = useState("");
  const [jobUrl, setJobUrl] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await sectionsAPI.list();
        setSections(data);
      } catch (error) {
        console.error("Failed to fetch sections:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const experiences = sections.filter((s) => s.type === "experience" && s.is_current);
  const projects = sections.filter((s) => s.type === "project" && s.is_current);

  const toggleExperience = (ref: string) => {
    setSelectedExperiences((prev) =>
      prev.includes(ref) ? prev.filter((r) => r !== ref) : [...prev, ref]
    );
  };

  const toggleProject = (ref: string) => {
    setSelectedProjects((prev) =>
      prev.includes(ref) ? prev.filter((r) => r !== ref) : [...prev, ref]
    );
  };

  const handleGenerate = async () => {
    if (selectedExperiences.length === 0 && selectedProjects.length === 0) {
      alert("Please select at least one experience or project");
      return;
    }

    setGenerating(true);
    try {
      const resumeConfig = {
        experiences: selectedExperiences,
        projects: selectedProjects,
      };

      const job = company
        ? { company, role, location, job_url: jobUrl || undefined }
        : undefined;

      const blob = await generateAPI.generate(resumeConfig, job);

      // Download the PDF
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = company
        ? `resume_${company.toLowerCase().replace(/\s+/g, "_")}.pdf`
        : "resume.pdf";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      if (company) {
        alert(`Resume generated and application logged for ${company}!`);
      } else {
        alert("Resume generated!");
      }
    } catch (error) {
      console.error("Failed to generate:", error);
      alert("Failed to generate resume. Make sure the backend is running.");
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Generate Resume</h1>
        <p className="text-muted-foreground">
          Select sections and generate a tailored PDF resume
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Experiences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Experiences
              </CardTitle>
            </CardHeader>
            <CardContent>
              {experiences.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  No experiences found. Create some in the Content Library.
                </p>
              ) : (
                <div className="space-y-3">
                  {experiences.map((exp) => {
                    const ref = `${exp.key}:${exp.flavor}:${exp.version}`;
                    return (
                      <div
                        key={exp.id}
                        className="flex items-start gap-3 p-3 rounded-md border hover:bg-muted/50 cursor-pointer"
                        onClick={() => toggleExperience(ref)}
                      >
                        <Checkbox
                          checked={selectedExperiences.includes(ref)}
                          onCheckedChange={() => toggleExperience(ref)}
                        />
                        <div className="flex-1">
                          <p className="font-medium">{exp.content.title || exp.key}</p>
                          <p className="text-sm text-muted-foreground">
                            {exp.content.company} • {exp.flavor} • v{exp.version}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Projects */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5" />
                Projects
              </CardTitle>
            </CardHeader>
            <CardContent>
              {projects.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  No projects found. Create some in the Content Library.
                </p>
              ) : (
                <div className="space-y-3">
                  {projects.map((proj) => {
                    const ref = `${proj.key}:${proj.flavor}:${proj.version}`;
                    return (
                      <div
                        key={proj.id}
                        className="flex items-start gap-3 p-3 rounded-md border hover:bg-muted/50 cursor-pointer"
                        onClick={() => toggleProject(ref)}
                      >
                        <Checkbox
                          checked={selectedProjects.includes(ref)}
                          onCheckedChange={() => toggleProject(ref)}
                        />
                        <div className="flex-1">
                          <p className="font-medium">{proj.content.name || proj.key}</p>
                          <p className="text-sm text-muted-foreground">
                            {proj.content.tech} • v{proj.version}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Job Info & Generate */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Job Details (Optional)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Fill in to log this application automatically
              </p>
              <div className="space-y-2">
                <Label>Company</Label>
                <Input
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Google"
                />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Input
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="Software Engineer"
                />
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Mountain View, CA"
                />
              </div>
              <div className="space-y-2">
                <Label>Job URL</Label>
                <Input
                  value={jobUrl}
                  onChange={(e) => setJobUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm">
                <p>
                  <span className="font-medium">{selectedExperiences.length}</span> experiences selected
                </p>
                <p>
                  <span className="font-medium">{selectedProjects.length}</span> projects selected
                </p>
              </div>
              <Button
                className="w-full"
                size="lg"
                onClick={handleGenerate}
                disabled={generating || (selectedExperiences.length === 0 && selectedProjects.length === 0)}
              >
                {generating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Generate PDF
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
