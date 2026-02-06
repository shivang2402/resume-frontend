const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function getGeminiApiKey(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("gemini_api_key");
}

function getUserId(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("userId") || "ca99f200-da44-49f7-bf63-35a4fe1cef92";
}

function getHeaders(includeGeminiKey = false): HeadersInit {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-User-Id": getUserId(),
  };
  if (includeGeminiKey) {
    const apiKey = getGeminiApiKey();
    if (apiKey) {
      headers["X-Gemini-API-Key"] = apiKey;
    }
  }
  return headers;
}

export function hasGeminiApiKey(): boolean {
  return !!getGeminiApiKey();
}

export async function analyzeJD(
  jobDescription: string,
  additionalInstructions?: string
) {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error("Gemini API key not configured. Please add it in settings.");
  }

  const res = await fetch(`${API_URL}/api/jd/analyze`, {
    method: "POST",
    headers: getHeaders(true),
    body: JSON.stringify({
      job_description: jobDescription,
      additional_instructions: additionalInstructions,
    }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Analysis failed" }));
    throw new Error(error.detail || `Error: ${res.status}`);
  }

  return res.json();
}

export async function recalculateKeywords(
  jobDescription: string,
  selectedSections: {
    type: string;
    key: string;
    flavor: string;
    version: string;
  }[],
  tempEdits?: Record<string, any>
) {
  const res = await fetch(`${API_URL}/api/jd/recalculate-keywords`, {
    method: "POST",
    headers: getHeaders(true), // Include Gemini key for better results
    body: JSON.stringify({
      job_description: jobDescription,
      selected_sections: selectedSections,
      temp_edits: tempEdits || {},
    }),
  });

  if (!res.ok) {
    throw new Error("Failed to recalculate keywords");
  }

  return res.json();
}

export async function getSectionConfigs() {
  const res = await fetch(`${API_URL}/api/section-configs`, {
    headers: getHeaders(false),
  });
  if (!res.ok) throw new Error("Failed to fetch section configs");
  return res.json();
}

export async function updateSectionConfig(
  sectionType: string,
  sectionKey: string,
  data: { priority: string; fixed_flavor?: string }
) {
  const res = await fetch(
    `${API_URL}/api/section-configs/${sectionType}/${sectionKey}`,
    {
      method: "PUT",
      headers: getHeaders(false),
      body: JSON.stringify(data),
    }
  );
  if (!res.ok) throw new Error("Failed to update section config");
  return res.json();
}

export async function updateSection(
  type: string,
  key: string,
  flavor: string,
  content: any
) {
  const res = await fetch(
    `${API_URL}/api/sections/${type}/${key}/${flavor}`,
    {
      method: "PUT",
      headers: getHeaders(true), // Include Gemini key for tag generation
      body: JSON.stringify({ content }),
    }
  );
  if (!res.ok) throw new Error("Failed to update section");
  return res.json();
}

export async function generateResume(
  resumeConfig: any,
  jobInfo?: {
    company: string;
    role: string;
    location?: string;
    job_description?: string;
  },
  tempEdits?: Record<string, any>
) {
  const res = await fetch(`${API_URL}/api/generate`, {
    method: "POST",
    headers: getHeaders(false),
    body: JSON.stringify({
      resume_config: resumeConfig,
      job: jobInfo,
      temp_edits: tempEdits,
    }),
  });

  if (!res.ok) throw new Error("Failed to generate resume");
  return res.blob();
}