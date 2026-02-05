"use client";

import { SectionCard } from "./section-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AllSections,
  SelectedSections,
  TempEdits,
  SectionContent,
} from "@/types/jd-matcher";

interface SectionListProps {
  allSections: AllSections;
  selectedSections: SelectedSections;
  onSelectionChange: (sections: SelectedSections) => void;
  tempEdits: TempEdits;
  onEdit: (
    type: string,
    key: string,
    flavor: string,
    version: string,
    content: SectionContent
  ) => void;
  onResetEdit: (type: string, key: string, flavor: string) => void;
}

export function SectionList({
  allSections,
  selectedSections,
  onSelectionChange,
  tempEdits,
  onEdit,
  onResetEdit,
}: SectionListProps) {
  const handleExperienceToggle = (key: string, selected: boolean) => {
    const section = allSections.experiences.find((e) => e.key === key);
    if (!section) return;

    if (selected) {
      const defaultFlavor = section.flavors[0];
      onSelectionChange({
        ...selectedSections,
        experiences: [
          ...selectedSections.experiences,
          { key, flavor: defaultFlavor.flavor, version: defaultFlavor.version },
        ],
      });
    } else {
      onSelectionChange({
        ...selectedSections,
        experiences: selectedSections.experiences.filter((e) => e.key !== key),
      });
    }
  };

  const handleProjectToggle = (key: string, selected: boolean) => {
    const section = allSections.projects.find((p) => p.key === key);
    if (!section) return;

    if (selected) {
      const defaultFlavor = section.flavors[0];
      onSelectionChange({
        ...selectedSections,
        projects: [
          ...selectedSections.projects,
          { key, flavor: defaultFlavor.flavor, version: defaultFlavor.version },
        ],
      });
    } else {
      onSelectionChange({
        ...selectedSections,
        projects: selectedSections.projects.filter((p) => p.key !== key),
      });
    }
  };

  const handleExperienceFlavorChange = (key: string, flavor: string, version: string) => {
    onSelectionChange({
      ...selectedSections,
      experiences: selectedSections.experiences.map((e) =>
        e.key === key ? { ...e, flavor, version } : e
      ),
    });
  };

  const handleProjectFlavorChange = (key: string, flavor: string, version: string) => {
    onSelectionChange({
      ...selectedSections,
      projects: selectedSections.projects.map((p) =>
        p.key === key ? { ...p, flavor, version } : p
      ),
    });
  };

  const getSelectedExperience = (key: string) =>
    selectedSections.experiences.find((e) => e.key === key);

  const getSelectedProject = (key: string) =>
    selectedSections.projects.find((p) => p.key === key);

  const getTempEditKey = (type: string, key: string, flavor: string) =>
    `${type}:${key}:${flavor}`;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Skills</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Label>Flavor:</Label>
            <Select
              value={selectedSections.skills_flavor}
              onValueChange={(value) =>
                onSelectionChange({ ...selectedSections, skills_flavor: value })
              }
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select skills flavor" />
              </SelectTrigger>
              <SelectContent>
                {allSections.skills.map((s) => (
                  <SelectItem key={s.flavor} value={s.flavor}>
                    {s.flavor} (v{s.version})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Experiences ({selectedSections.experiences.length} selected)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {allSections.experiences.map((section) => {
            const selected = getSelectedExperience(section.key);
            const currentFlavor = selected?.flavor || section.flavors[0]?.flavor;
            const currentVersion = selected?.version || section.flavors[0]?.version;
            const tempEditKey = getTempEditKey("experience", section.key, currentFlavor);
            const flavorData = section.flavors.find((f) => f.flavor === currentFlavor);

            return (
              <SectionCard
                key={section.key}
                type="experience"
                sectionKey={section.key}
                flavors={section.flavors}
                selectedFlavor={currentFlavor}
                selectedVersion={currentVersion}
                isSelected={!!selected}
                isPinned={section.priority === "always"}
                tempEdit={tempEdits[tempEditKey]}
                onToggle={(checked) => handleExperienceToggle(section.key, checked)}
                onFlavorChange={(flavor, version) =>
                  handleExperienceFlavorChange(section.key, flavor, version)
                }
                onEdit={() =>
                  onEdit("experience", section.key, currentFlavor, currentVersion, flavorData?.content || { bullets: [] })
                }
                onResetEdit={() => onResetEdit("experience", section.key, currentFlavor)}
              />
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Projects ({selectedSections.projects.length} selected)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {allSections.projects.map((section) => {
            const selected = getSelectedProject(section.key);
            const currentFlavor = selected?.flavor || section.flavors[0]?.flavor;
            const currentVersion = selected?.version || section.flavors[0]?.version;
            const tempEditKey = getTempEditKey("project", section.key, currentFlavor);
            const flavorData = section.flavors.find((f) => f.flavor === currentFlavor);

            return (
              <SectionCard
                key={section.key}
                type="project"
                sectionKey={section.key}
                flavors={section.flavors}
                selectedFlavor={currentFlavor}
                selectedVersion={currentVersion}
                isSelected={!!selected}
                isPinned={section.priority === "always"}
                tempEdit={tempEdits[tempEditKey]}
                onToggle={(checked) => handleProjectToggle(section.key, checked)}
                onFlavorChange={(flavor, version) =>
                  handleProjectFlavorChange(section.key, flavor, version)
                }
                onEdit={() =>
                  onEdit("project", section.key, currentFlavor, currentVersion, flavorData?.content || { bullets: [] })
                }
                onResetEdit={() => onResetEdit("project", section.key, currentFlavor)}
              />
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
