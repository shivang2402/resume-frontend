"use client";

import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  sectionsAPI,
  generateAPI,
  presetsAPI,
  Section,
  ResumePreset,
} from "@/lib/api";
import {
  Download,
  Briefcase,
  FolderOpen,
  Loader2,
  Save,
  Pencil,
  Trash2,
  BookMarked,
  GripVertical,
} from "lucide-react";

// ─── Native Drag & Drop Hook ───────────────────────────────────
function useDragReorder<T>(
  items: T[],
  setItems: React.Dispatch<React.SetStateAction<T[]>>
) {
  const dragIdx = useRef<number | null>(null);
  const overIdx = useRef<number | null>(null);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  const onDragStart = (index: number) => (e: React.DragEvent) => {
    dragIdx.current = index;
    setDraggingIndex(index);
    e.dataTransfer.effectAllowed = "move";
    // Make drag image slightly transparent
    if (e.currentTarget instanceof HTMLElement) {
      e.dataTransfer.setDragImage(e.currentTarget, 20, 20);
    }
  };

  const onDragOver = (index: number) => (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    overIdx.current = index;
    setOverIndex(index);
  };

  const onDragEnd = () => {
    const from = dragIdx.current;
    const to = overIdx.current;

    if (from !== null && to !== null && from !== to) {
      setItems((prev) => {
        const result = [...prev];
        const [removed] = result.splice(from, 1);
        result.splice(to, 0, removed);
        return result;
      });
    }

    dragIdx.current = null;
    overIdx.current = null;
    setDraggingIndex(null);
    setOverIndex(null);
  };

  const onDragLeave = () => {
    setOverIndex(null);
  };

  return {
    draggingIndex,
    overIndex,
    onDragStart,
    onDragOver,
    onDragEnd,
    onDragLeave,
  };
}

// ─── Main Component ────────────────────────────────────────────
export default function GeneratePage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [presets, setPresets] = useState<ResumePreset[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generatingPresetId, setGeneratingPresetId] = useState<string | null>(null);

  // Ordered lists (maintains drag order)
  const [orderedExperiences, setOrderedExperiences] = useState<Section[]>([]);
  const [orderedProjects, setOrderedProjects] = useState<Section[]>([]);

  // Selected sections
  const [selectedExperiences, setSelectedExperiences] = useState<string[]>([]);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);

  // Job info
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [location, setLocation] = useState("");
  const [jobUrl, setJobUrl] = useState("");

  // Preset dialogs
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [presetName, setPresetName] = useState("");
  const [editingPreset, setEditingPreset] = useState<ResumePreset | null>(null);
  const [quickDownloadOpen, setQuickDownloadOpen] = useState(false);
  const [quickPreset, setQuickPreset] = useState<ResumePreset | null>(null);
  const [qdCompany, setQdCompany] = useState("");
  const [qdRole, setQdRole] = useState("");
  const [qdLocation, setQdLocation] = useState("");
  const [qdJobUrl, setQdJobUrl] = useState("");

  // Drag hooks
  const expDrag = useDragReorder(orderedExperiences, setOrderedExperiences);
  const projDrag = useDragReorder(orderedProjects, setOrderedProjects);

  useEffect(() => {
    async function fetchData() {
      try {
        const [sectionData, presetData] = await Promise.all([
          sectionsAPI.list(),
          presetsAPI.list(),
        ]);
        setSections(sectionData);
        setPresets(presetData);

        const exp = sectionData.filter(
          (s: Section) => s.type === "experience" && s.is_current
        );
        const proj = sectionData.filter(
          (s: Section) => s.type === "project" && s.is_current
        );
        setOrderedExperiences(exp);
        setOrderedProjects(proj);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const getRef = (s: Section) => `${s.key}:${s.flavor}:${s.version}`;

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

  const downloadPdf = async (resumeConfig: any, jobInfo?: any) => {
    const blob = await generateAPI.generate(resumeConfig, jobInfo);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const name = jobInfo?.company
      ? `resume_${jobInfo.company.toLowerCase().replace(/\s+/g, "_")}.pdf`
      : "resume.pdf";
    a.download = name;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleGenerate = async () => {
    if (selectedExperiences.length === 0 && selectedProjects.length === 0) {
      alert("Please select at least one experience or project");
      return;
    }
    setGenerating(true);
    try {
      const orderedSelectedExp = orderedExperiences
        .map(getRef)
        .filter((ref) => selectedExperiences.includes(ref));
      const orderedSelectedProj = orderedProjects
        .map(getRef)
        .filter((ref) => selectedProjects.includes(ref));

      const resumeConfig = {
        experiences: orderedSelectedExp,
        projects: orderedSelectedProj,
      };
      const job = company
        ? { company, role, location, job_url: jobUrl || undefined }
        : undefined;
      await downloadPdf(resumeConfig, job);
    } catch (error) {
      console.error("Failed to generate:", error);
      alert("Failed to generate resume.");
    } finally {
      setGenerating(false);
    }
  };

  const handlePresetDownload = (preset: ResumePreset) => {
    setQuickPreset(preset);
    setQdCompany("");
    setQdRole("");
    setQdLocation("");
    setQdJobUrl("");
    setQuickDownloadOpen(true);
  };

  const handleQuickGenerate = async () => {
    if (!quickPreset) return;
    setGeneratingPresetId(quickPreset.id);
    try {
      const job = qdCompany
        ? { company: qdCompany, role: qdRole, location: qdLocation, job_url: qdJobUrl || undefined }
        : undefined;
      await downloadPdf(quickPreset.resume_config, job);
      setQuickDownloadOpen(false);
    } catch (error) {
      console.error("Failed to generate:", error);
      alert("Failed to generate resume.");
    } finally {
      setGeneratingPresetId(null);
    }
  };

  const handleSavePreset = async () => {
    if (!presetName.trim()) return;
    try {
      const orderedSelectedExp = orderedExperiences
        .map(getRef)
        .filter((ref) => selectedExperiences.includes(ref));
      const orderedSelectedProj = orderedProjects
        .map(getRef)
        .filter((ref) => selectedProjects.includes(ref));

      const config = {
        experiences: orderedSelectedExp,
        projects: orderedSelectedProj,
      };
      if (editingPreset) {
        const updated = await presetsAPI.update(editingPreset.id, {
          name: presetName.trim(),
          resume_config: config,
        });
        setPresets((prev) => prev.map((p) => (p.id === editingPreset.id ? updated : p)));
      } else {
        const created = await presetsAPI.create({
          name: presetName.trim(),
          resume_config: config,
        });
        setPresets((prev) => [created, ...prev]);
      }
      setSaveDialogOpen(false);
      setPresetName("");
      setEditingPreset(null);
    } catch (error) {
      console.error("Failed to save preset:", error);
    }
  };

  const handleLoadPreset = (preset: ResumePreset) => {
    const presetExp = preset.resume_config.experiences || [];
    const presetProj = preset.resume_config.projects || [];

    setSelectedExperiences(presetExp);
    setSelectedProjects(presetProj);

    setOrderedExperiences((prev) => {
      const selected = presetExp
        .map((ref: string) => prev.find((s) => getRef(s) === ref))
        .filter(Boolean) as Section[];
      const unselected = prev.filter((s) => !presetExp.includes(getRef(s)));
      return [...selected, ...unselected];
    });
    setOrderedProjects((prev) => {
      const selected = presetProj
        .map((ref: string) => prev.find((s) => getRef(s) === ref))
        .filter(Boolean) as Section[];
      const unselected = prev.filter((s) => !presetProj.includes(getRef(s)));
      return [...selected, ...unselected];
    });
  };

  const handleEditPreset = (preset: ResumePreset) => {
    handleLoadPreset(preset);
    setEditingPreset(preset);
    setPresetName(preset.name);
    setSaveDialogOpen(true);
  };

  const handleDeletePreset = async (id: string) => {
    try {
      await presetsAPI.delete(id);
      setPresets((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      console.error("Failed to delete preset:", error);
    }
  };

  const openSaveDialog = () => {
    setEditingPreset(null);
    setPresetName("");
    setSaveDialogOpen(true);
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
          Select sections and drag to reorder for your tailored PDF resume
        </p>
      </div>

      {/* Presets */}
      {presets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookMarked className="h-5 w-5" />
              Saved Presets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {presets.map((preset) => (
                <Card key={preset.id} className="border hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium">{preset.name}</h3>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEditPreset(preset)}>
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete preset?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete <strong>{preset.name}</strong>.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                onClick={() => handleDeletePreset(preset.id)}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground mb-3 space-y-1">
                      <p>{(preset.resume_config.experiences || []).length} experiences</p>
                      <p>{(preset.resume_config.projects || []).length} projects</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1" onClick={() => handlePresetDownload(preset)} disabled={generatingPresetId === preset.id}>
                        {generatingPresetId === preset.id ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Download className="h-3 w-3 mr-1" />}
                        Download
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleLoadPreset(preset)}>Load</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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
              {orderedExperiences.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  No experiences found. Create some in the Content Library.
                </p>
              ) : (
                <div className="space-y-2">
                  {orderedExperiences.map((exp, index) => {
                    const ref = getRef(exp);
                    const isDragging = expDrag.draggingIndex === index;
                    const isOver = expDrag.overIndex === index && expDrag.draggingIndex !== index;
                    return (
                      <div
                        key={exp.id}
                        draggable
                        onDragStart={expDrag.onDragStart(index)}
                        onDragOver={expDrag.onDragOver(index)}
                        onDragEnd={expDrag.onDragEnd}
                        onDragLeave={expDrag.onDragLeave}
                        className={`flex items-start gap-3 p-3 rounded-md border hover:bg-muted/50 transition-all select-none ${
                          isDragging ? "opacity-40 scale-[0.98]" : ""
                        } ${isOver ? "border-primary border-dashed bg-primary/5" : ""}`}
                      >
                        <div className="mt-0.5 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground">
                          <GripVertical className="h-5 w-5" />
                        </div>
                        <Checkbox
                          checked={selectedExperiences.includes(ref)}
                          onCheckedChange={() => toggleExperience(ref)}
                        />
                        <div
                          className="flex-1 cursor-pointer"
                          onClick={() => toggleExperience(ref)}
                        >
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
              {orderedProjects.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  No projects found. Create some in the Content Library.
                </p>
              ) : (
                <div className="space-y-2">
                  {orderedProjects.map((proj, index) => {
                    const ref = getRef(proj);
                    const isDragging = projDrag.draggingIndex === index;
                    const isOver = projDrag.overIndex === index && projDrag.draggingIndex !== index;
                    return (
                      <div
                        key={proj.id}
                        draggable
                        onDragStart={projDrag.onDragStart(index)}
                        onDragOver={projDrag.onDragOver(index)}
                        onDragEnd={projDrag.onDragEnd}
                        onDragLeave={projDrag.onDragLeave}
                        className={`flex items-start gap-3 p-3 rounded-md border hover:bg-muted/50 transition-all select-none ${
                          isDragging ? "opacity-40 scale-[0.98]" : ""
                        } ${isOver ? "border-primary border-dashed bg-primary/5" : ""}`}
                      >
                        <div className="mt-0.5 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground">
                          <GripVertical className="h-5 w-5" />
                        </div>
                        <Checkbox
                          checked={selectedProjects.includes(ref)}
                          onCheckedChange={() => toggleProject(ref)}
                        />
                        <div
                          className="flex-1 cursor-pointer"
                          onClick={() => toggleProject(ref)}
                        >
                          <p className="font-medium">{proj.content.name || proj.key}</p>
                          <p className="text-sm text-muted-foreground">
                            {Array.isArray(proj.content.tech)
                              ? proj.content.tech.join(", ")
                              : proj.content.tech}{" "}
                            • {proj.flavor} • v{proj.version}
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

        {/* Sidebar */}
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
                <Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Google" />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Software Engineer" />
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Mountain View, CA" />
              </div>
              <div className="space-y-2">
                <Label>Job URL</Label>
                <Input value={jobUrl} onChange={(e) => setJobUrl(e.target.value)} placeholder="https://..." />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm">
                <p><span className="font-medium">{selectedExperiences.length}</span> experiences selected</p>
                <p><span className="font-medium">{selectedProjects.length}</span> projects selected</p>
              </div>
              <Button
                className="w-full"
                size="lg"
                onClick={handleGenerate}
                disabled={generating || (selectedExperiences.length === 0 && selectedProjects.length === 0)}
              >
                {generating ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Generating...</>
                ) : (
                  <><Download className="h-4 w-4 mr-2" />Generate PDF</>
                )}
              </Button>
              {(selectedExperiences.length > 0 || selectedProjects.length > 0) && (
                <Button variant="outline" className="w-full" onClick={openSaveDialog}>
                  <Save className="h-4 w-4 mr-2" />
                  Save as Preset
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Save Preset Dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingPreset ? "Update Preset" : "Save as Preset"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Preset Name</Label>
              <Input
                placeholder="e.g. AI Resume, SDE Resume"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSavePreset()}
              />
            </div>
            <div className="text-sm text-muted-foreground">
              <p>{selectedExperiences.length} experiences, {selectedProjects.length} projects will be saved.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSavePreset} disabled={!presetName.trim()}>
              {editingPreset ? "Update" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Quick Download Dialog */}
      <Dialog open={quickDownloadOpen} onOpenChange={setQuickDownloadOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Download — {quickPreset?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Job details are optional. Click download to generate immediately.
            </p>
            <div className="space-y-2">
              <Label>Company</Label>
              <Input value={qdCompany} onChange={(e) => setQdCompany(e.target.value)} placeholder="Google" />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Input value={qdRole} onChange={(e) => setQdRole(e.target.value)} placeholder="Software Engineer" />
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <Input value={qdLocation} onChange={(e) => setQdLocation(e.target.value)} placeholder="Mountain View, CA" />
            </div>
            <div className="space-y-2">
              <Label>Job URL</Label>
              <Input value={qdJobUrl} onChange={(e) => setQdJobUrl(e.target.value)} placeholder="https://..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setQuickDownloadOpen(false)}>Cancel</Button>
            <Button onClick={handleQuickGenerate} disabled={generatingPresetId !== null}>
              {generatingPresetId ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Generating...</>
              ) : (
                <><Download className="h-4 w-4 mr-2" />Download PDF</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}