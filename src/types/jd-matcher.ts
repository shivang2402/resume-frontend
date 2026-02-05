export interface SectionContent {
  title?: string;
  company?: string;
  dates?: string;
  location?: string;
  bullets: string[];
  skills?: Record<string, string[]>;
}

export interface SectionSuggestion {
  key: string;
  flavor: string;
  version: string;
  score?: number;
  pinned?: boolean;
}

export interface FlavorInfo {
  flavor: string;
  version: string;
  content: SectionContent;
}

export interface SectionInfo {
  key: string;
  flavors: FlavorInfo[];
  priority: "always" | "normal" | "never";
  fixed_flavor?: string;
}

export interface AllSections {
  experiences: SectionInfo[];
  projects: SectionInfo[];
  skills: FlavorInfo[];
}

export interface JDAnalyzeResponse {
  suggestions: {
    skills_flavor: string;
    experiences: SectionSuggestion[];
    projects: SectionSuggestion[];
  };
  missing_keywords: string[];
  all_sections: AllSections;
}

export interface SelectedSections {
  skills_flavor: string;
  experiences: Array<{ key: string; flavor: string; version: string }>;
  projects: Array<{ key: string; flavor: string; version: string }>;
}

export interface TempEdit {
  type: "experience" | "project" | "skills";
  key: string;
  flavor: string;
  originalVersion: string;
  content: SectionContent;
  editedAt: string;
}

export interface TempEdits {
  [sectionId: string]: TempEdit;
}

export interface SectionConfig {
  id?: string;
  section_type: string;
  section_key: string;
  priority: "always" | "normal" | "never";
  fixed_flavor?: string;
}
