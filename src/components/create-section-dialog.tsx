"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { sectionsAPI, Section } from "@/lib/api";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface CreateSectionDialogProps {
  onCreated?: (section: Section) => void;
}

export function CreateSectionDialog({ onCreated }: CreateSectionDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [duplicateError, setDuplicateError] = useState("");
  const [type, setType] = useState("experience");
  const [key, setKey] = useState("");
  const [flavor, setFlavor] = useState("default");
  const [content, setContent] = useState<Record<string, any>>({
    bullets: [""],
  });

  const handleContentChange = (field: string, value: any) => {
    setContent((prev) => ({ ...prev, [field]: value }));
  };

  const handleBulletChange = (index: number, value: string) => {
    const bullets = [...(content.bullets || [])];
    bullets[index] = value;
    setContent((prev) => ({ ...prev, bullets }));
  };

  const addBullet = () => {
    setContent((prev) => ({ ...prev, bullets: [...(prev.bullets || []), ""] }));
  };

  const removeBullet = (index: number) => {
    const bullets = [...(content.bullets || [])];
    bullets.splice(index, 1);
    setContent((prev) => ({ ...prev, bullets }));
  };

  const handleSubmit = async () => {
    if (!key.trim()) {
      toast.error("Section Name is required");
      return;
    }

    if (type === "experience") {
      if (!content.title?.trim()) {
        toast.error("Title is required for experience sections");
        return;
      }
      if (!content.company?.trim()) {
        toast.error("Company is required for experience sections");
        return;
      }
      const nonEmptyBullets = (content.bullets || []).filter((b: string) => b.trim());
      if (nonEmptyBullets.length === 0) {
        toast.error("Add at least one bullet point");
        return;
      }
    }

    if (type === "project") {
      if (!content.name?.trim()) {
        toast.error("Project Name is required");
        return;
      }
      const nonEmptyBullets = (content.bullets || []).filter((b: string) => b.trim());
      if (nonEmptyBullets.length === 0) {
        toast.error("Add at least one bullet point");
        return;
      }
    }

    if (type === "skills") {
      const hasAny = content.languages?.trim() || content.frameworks?.trim() || content.tools?.trim();
      if (!hasAny) {
        toast.error("Add at least one skill category (languages, frameworks, or tools)");
        return;
      }
    }

    if (type === "education") {
      if (!content.degree?.trim()) {
        toast.error("Degree is required for education sections");
        return;
      }
      if (!content.school?.trim()) {
        toast.error("School is required for education sections");
        return;
      }
    }

    setLoading(true);
    setDuplicateError("");
    try {
      const section = await sectionsAPI.create({
        type,
        key: key.trim().toLowerCase().replace(/\s+/g, "_"),
        flavor: flavor.trim().toLowerCase().replace(/\s+/g, "_"),
        content,
      });
      onCreated?.(section);
      setOpen(false);
      resetForm();
    } catch (error: any) {
      console.error("Failed to create section:", error);
      const msg: string = error?.message || "";
      if (msg.includes("409") || msg.includes("already exists") || msg.includes("duplicate")) {
        setDuplicateError(
          "A section with this name and variant already exists. Edit the existing section or choose a different variant name."
        );
      } else {
        toast.error("Failed to create section");
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setType("experience");
    setKey("");
    setFlavor("default");
    setContent({ bullets: [""] });
    setDuplicateError("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Section
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Section</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Type, Key, Flavor */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="experience">Experience</SelectItem>
                  <SelectItem value="project">Project</SelectItem>
                  <SelectItem value="skills">Skills</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Section Name *</Label>
              <Input
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="e.g. amazon, google, personal-proj"
              />
              <p className="text-xs text-muted-foreground">A short identifier for this employer or project</p>
            </div>
            <div className="space-y-2">
              <Label>Role Variant</Label>
              <Input
                value={flavor}
                onChange={(e) => setFlavor(e.target.value)}
                placeholder="e.g. systems, fullstack, ml, default"
              />
              <p className="text-xs text-muted-foreground">Which type of role is this version tailored for? Use &quot;default&quot; if you only have one version</p>
            </div>
          </div>

          {/* Experience Fields */}
          {type === "experience" && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Title *</Label>
                  <Input
                    value={content.title || ""}
                    onChange={(e) => handleContentChange("title", e.target.value)}
                    placeholder="Software Engineer"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Company *</Label>
                  <Input
                    value={content.company || ""}
                    onChange={(e) => handleContentChange("company", e.target.value)}
                    placeholder="Google"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input
                    value={content.location || ""}
                    onChange={(e) => handleContentChange("location", e.target.value)}
                    placeholder="San Francisco, CA"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Dates</Label>
                  <Input
                    value={content.dates || ""}
                    onChange={(e) => handleContentChange("dates", e.target.value)}
                    placeholder="Jan 2024 -- Present"
                  />
                </div>
              </div>
            </>
          )}

          {/* Project Fields */}
          {type === "project" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Project Name *</Label>
                <Input
                  value={content.name || ""}
                  onChange={(e) => handleContentChange("name", e.target.value)}
                  placeholder="Resume Forge"
                />
              </div>
              <div className="space-y-2">
                <Label>Technologies</Label>
                <Input
                  value={content.tech || ""}
                  onChange={(e) => handleContentChange("tech", e.target.value)}
                  placeholder="React, Python, PostgreSQL"
                />
              </div>
            </div>
          )}

          {/* Bullets for experience and project */}
          {(type === "experience" || type === "project") && (
            <div className="space-y-2">
              <Label>Bullet Points *</Label>
              {(content.bullets || []).map((bullet: string, index: number) => (
                <div key={index} className="flex gap-2">
                  <Textarea
                    value={bullet}
                    onChange={(e) => handleBulletChange(index, e.target.value)}
                    placeholder="Describe your achievement..."
                    className="min-h-[60px]"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeBullet(index)}
                    disabled={content.bullets.length <= 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addBullet}>
                Add Bullet
              </Button>
            </div>
          )}

          {/* Skills Fields */}
          {type === "skills" && (
            <div className="space-y-4">
              <p className="text-xs text-muted-foreground">Fill in at least one category below.</p>
              <div className="space-y-2">
                <Label>Languages</Label>
                <Input
                  value={content.languages || ""}
                  onChange={(e) => handleContentChange("languages", e.target.value)}
                  placeholder="Python, TypeScript, Java"
                />
              </div>
              <div className="space-y-2">
                <Label>Frameworks</Label>
                <Input
                  value={content.frameworks || ""}
                  onChange={(e) => handleContentChange("frameworks", e.target.value)}
                  placeholder="React, FastAPI, Spring Boot"
                />
              </div>
              <div className="space-y-2">
                <Label>Tools</Label>
                <Input
                  value={content.tools || ""}
                  onChange={(e) => handleContentChange("tools", e.target.value)}
                  placeholder="Docker, AWS, PostgreSQL"
                />
              </div>
            </div>
          )}

          {/* Education Fields */}
          {type === "education" && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Degree *</Label>
                  <Input
                    value={content.degree || ""}
                    onChange={(e) => handleContentChange("degree", e.target.value)}
                    placeholder="Master of Science in Computer Science"
                  />
                </div>
                <div className="space-y-2">
                  <Label>School *</Label>
                  <Input
                    value={content.school || ""}
                    onChange={(e) => handleContentChange("school", e.target.value)}
                    placeholder="Northeastern University"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input
                    value={content.location || ""}
                    onChange={(e) => handleContentChange("location", e.target.value)}
                    placeholder="Boston, MA"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Dates</Label>
                  <Input
                    value={content.dates || ""}
                    onChange={(e) => handleContentChange("dates", e.target.value)}
                    placeholder="Sep 2024 -- May 2026"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>GPA</Label>
                <Input
                  value={content.gpa || ""}
                  onChange={(e) => handleContentChange("gpa", e.target.value)}
                  placeholder="3.87 / 4.00"
                />
              </div>
            </>
          )}
        </div>

        {duplicateError && (
          <p className="text-sm border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/50 text-red-800 dark:text-red-200 rounded-md px-3 py-2">
            {duplicateError}
          </p>
        )}

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Creating..." : "Create Section"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
