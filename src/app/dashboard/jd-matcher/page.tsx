"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { hasGeminiApiKey, generateResume, updateSection } from "@/lib/api/jd-matcher";
import { useJDAnalysis } from "./hooks/use-jd-analysis";
import { useTempEdits } from "./hooks/use-temp-edits";
import { JDInput } from "./components/jd-input";
import { SectionList } from "./components/section-list";
import { MissingKeywords } from "./components/missing-keywords";
import { ActionButtons } from "./components/action-buttons";
import { EditModal } from "./components/edit-modal";
import { SelectedSections, SectionContent } from "@/types/jd-matcher";
import { toast } from "sonner";
import { AlertTriangle, FileDown, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function JDMatcherPage() {
  const [hasKey, setHasKey] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [jobDescription, setJobDescription] = useState("");
  const [instructions, setInstructions] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSavingAll, setIsSavingAll] = useState(false);

  useEffect(() => {
    setHasKey(hasGeminiApiKey());
    setIsLoaded(true);
  }, []);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<{
    type: string;
    key: string;
    flavor: string;
    version: string;
    content: SectionContent;
  } | null>(null);

  const { analyze, suggestions, allSections, missingKeywords, isAnalyzing } = useJDAnalysis();
  const { tempEdits, addTempEdit, removeTempEdit, clearAllTempEdits, hasTempEdits, tempEditCount } = useTempEdits();

  const [selectedSections, setSelectedSections] = useState<SelectedSections>({
    skills_flavor: "",
    experiences: [],
    projects: [],
  });

  const handleAnalyze = async () => {
    const result = await analyze(jobDescription, instructions);
    if (result) {
      setSelectedSections({
        skills_flavor: result.suggestions.skills_flavor,
        experiences: result.suggestions.experiences.map((e) => ({
          key: e.key,
          flavor: e.flavor,
          version: e.version,
        })),
        projects: result.suggestions.projects.map((p) => ({
          key: p.key,
          flavor: p.flavor,
          version: p.version,
        })),
      });
    }
  };

  const handleEdit = useCallback(
    (type: string, key: string, flavor: string, version: string, content: SectionContent) => {
      const tempEditKey = `${type}:${key}:${flavor}`;
      const existingEdit = tempEdits[tempEditKey];
      setEditingSection({
        type,
        key,
        flavor,
        version,
        content: existingEdit?.content || content,
      });
      setEditModalOpen(true);
    },
    [tempEdits]
  );

  const handleSaveTemp = useCallback(
    (content: SectionContent) => {
      if (!editingSection) return;
      addTempEdit(editingSection.type, editingSection.key, editingSection.flavor, editingSection.version, content);
    },
    [editingSection, addTempEdit]
  );

  const handleSaveToLibrary = useCallback(
    async (content: SectionContent) => {
      if (!editingSection) return;
      await updateSection(editingSection.type, editingSection.key, editingSection.flavor, content);
      removeTempEdit(editingSection.type, editingSection.key, editingSection.flavor);
    },
    [editingSection, removeTempEdit]
  );

  const handleSaveAll = async () => {
    setIsSavingAll(true);
    try {
      for (const [, edit] of Object.entries(tempEdits)) {
        await updateSection(edit.type, edit.key, edit.flavor, edit.content);
      }
      clearAllTempEdits();
      toast.success("All edits saved to library!");
    } catch (error) {
      toast.error("Failed to save some edits");
    } finally {
      setIsSavingAll(false);
    }
  };

  const handleGenerate = async () => {
    // Debug logging
    console.log("=== GENERATE DEBUG ===");
    console.log("skills_flavor:", selectedSections.skills_flavor);
    console.log("experiences:", JSON.stringify(selectedSections.experiences, null, 2));
    console.log("projects:", JSON.stringify(selectedSections.projects, null, 2));

    if (!selectedSections.skills_flavor) {
      toast.error("Please select a skills flavor");
      return;
    }

    setIsGenerating(true);
    try {
      const resumeConfig = {
        skills: `${selectedSections.skills_flavor}:1.0`,
        experiences: selectedSections.experiences.map((e) => `${e.key}:${e.flavor}:${e.version}`),
        projects: selectedSections.projects.map((p) => `${p.key}:${p.flavor}:${p.version}`),
      };

      // Debug logging
      console.log("=== RESUME CONFIG ===");
      console.log(JSON.stringify(resumeConfig, null, 2));

      const blob = await generateResume(
        resumeConfig,
        { company: "Company", role: "Role", job_description: jobDescription },
        tempEdits
      );

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `resume_${new Date().toISOString().split("T")[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      clearAllTempEdits();
      toast.success("Resume generated!");
    } catch (error) {
      console.error("=== GENERATE ERROR ===", error);
      toast.error("Failed to generate resume");
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">JD Matcher</h1>
        <p className="text-muted-foreground">AI-powered job description analysis and resume optimization</p>
      </div>

      {!hasKey && (
        <div className="flex items-start gap-3 rounded-lg border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
          <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium">Gemini API Key Required</p>
            <p className="mt-0.5">
              AI features require your Gemini API key.{" "}
              <Link href="/dashboard/settings" className="underline font-medium">
                Configure it in Settings →
              </Link>
            </p>
          </div>
        </div>
      )}

      <JDInput
        jobDescription={jobDescription}
        onJobDescriptionChange={setJobDescription}
        instructions={instructions}
        onInstructionsChange={setInstructions}
        onAnalyze={handleAnalyze}
        isAnalyzing={isAnalyzing}
        hasAnalyzed={!!suggestions}
        apiKeyMissing={!hasKey}
      />

      {allSections && (
        <>
          <MissingKeywords keywords={missingKeywords} />

          <SectionList
            allSections={allSections}
            selectedSections={selectedSections}
            onSelectionChange={setSelectedSections}
            tempEdits={tempEdits}
            onEdit={handleEdit}
            onResetEdit={removeTempEdit}
          />

          <ActionButtons
            hasTempEdits={hasTempEdits}
            tempEditCount={tempEditCount}
            onSaveAll={handleSaveAll}
            onDiscardAll={clearAllTempEdits}
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
            isSavingAll={isSavingAll}
          />

          {suggestions && (
            <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
              <p className="text-sm font-medium">Next Steps</p>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/dashboard/generate">
                    <FileDown className="h-4 w-4 mr-2" />
                    Generate Resume with These Sections
                  </Link>
                </Button>
                {suggestions.experiences.map((exp) => (
                  <Button
                    key={`exp-${exp.key}-${exp.flavor}`}
                    variant="ghost"
                    size="sm"
                    asChild
                  >
                    <Link href={`/dashboard/content/experience/${exp.key}/${exp.flavor}`}>
                      <Pencil className="h-3 w-3 mr-1" />
                      Edit {exp.key}
                    </Link>
                  </Button>
                ))}
                {suggestions.projects.map((proj) => (
                  <Button
                    key={`proj-${proj.key}-${proj.flavor}`}
                    variant="ghost"
                    size="sm"
                    asChild
                  >
                    <Link href={`/dashboard/content/project/${proj.key}/${proj.flavor}`}>
                      <Pencil className="h-3 w-3 mr-1" />
                      Edit {proj.key}
                    </Link>
                  </Button>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {editingSection && (
        <EditModal
          open={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setEditingSection(null);
          }}
          type={editingSection.type}
          sectionKey={editingSection.key}
          flavor={editingSection.flavor}
          version={editingSection.version}
          content={editingSection.content}
          missingKeywords={missingKeywords}
          onSaveTemp={handleSaveTemp}
          onSaveToLibrary={handleSaveToLibrary}
        />
      )}
    </div>
  );
}