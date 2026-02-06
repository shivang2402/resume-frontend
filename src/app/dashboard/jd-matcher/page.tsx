"use client";

import { useState, useCallback, useEffect } from "react";
import { hasGeminiApiKey, generateResume, updateSection } from "@/lib/api/jd-matcher";
import { useJDAnalysis } from "./hooks/use-jd-analysis";
import { useTempEdits } from "./hooks/use-temp-edits";
import { JDInput } from "./components/jd-input";
import { SectionList } from "./components/section-list";
import { MissingKeywords } from "./components/missing-keywords";
import { ActionButtons } from "./components/action-buttons";
import { NoApiKeyState } from "./components/no-api-key-state";
import { EditModal } from "./components/edit-modal";
import { SelectedSections, SectionContent } from "@/types/jd-matcher";
import { toast } from "sonner";

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

  if (!hasKey) {
    return <NoApiKeyState />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">JD Matcher</h1>
        <p className="text-muted-foreground">AI-powered job description analysis and resume optimization</p>
      </div>

      <JDInput
        jobDescription={jobDescription}
        onJobDescriptionChange={setJobDescription}
        instructions={instructions}
        onInstructionsChange={setInstructions}
        onAnalyze={handleAnalyze}
        isAnalyzing={isAnalyzing}
        hasAnalyzed={!!suggestions}
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