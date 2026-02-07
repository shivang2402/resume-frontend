const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Use your actual user ID
const USER_ID = "ca99f200-da44-49f7-bf63-35a4fe1cef92";

async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_URL}${endpoint}`;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    "X-User-Id": USER_ID,
    ...options.headers,
  };

  // Add Gemini API key from localStorage if available (for AI features)
  if (typeof window !== "undefined") {
    const geminiKey = localStorage.getItem("gemini_api_key");
    if (geminiKey) {
      (headers as Record<string, string>)["X-Gemini-API-Key"] = geminiKey;
    }
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || `API error: ${response.status}`);
  }

  // Handle empty responses (204 No Content)
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

// Sections API
export const sectionsAPI = {
  list: () => fetchAPI<Section[]>("/api/sections"),

  listByType: (type: string) => fetchAPI<Section[]>(`/api/sections/${type}`),

  getVersions: (type: string, key: string, flavor: string) =>
    fetchAPI<Section[]>(`/api/sections/${type}/${key}/${flavor}`),

  getByVersion: (type: string, key: string, flavor: string, version: string) =>
    fetchAPI<Section>(`/api/sections/${type}/${key}/${flavor}/${version}`),

  create: (data: SectionCreate) =>
    fetchAPI<Section>("/api/sections", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (type: string, key: string, flavor: string, data: SectionUpdate) =>
    fetchAPI<Section>(`/api/sections/${type}/${key}/${flavor}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (type: string, key: string, flavor: string, version: string) =>
    fetchAPI<void>(`/api/sections/${type}/${key}/${flavor}/${version}`, {
      method: "DELETE",
    }),
};

// Applications API
export const applicationsAPI = {
  list: (status?: string) => {
    const params = status ? `?status=${status}` : "";
    return fetchAPI<Application[]>(`/api/applications${params}`);
  },

  get: (id: string) => fetchAPI<Application>(`/api/applications/${id}`),

  create: (data: ApplicationCreate) =>
    fetchAPI<Application>("/api/applications", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: ApplicationUpdate) =>
    fetchAPI<Application>(`/api/applications/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetchAPI<void>(`/api/applications/${id}`, {
      method: "DELETE",
    }),
};

// Generate API
export const generateAPI = {
  generate: async (resumeConfig: ResumeConfig, job?: JobInfo): Promise<Blob> => {
    const url = `${API_URL}/api/generate`;

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      "X-User-Id": USER_ID,
    };

    // Add Gemini API key if available
    if (typeof window !== "undefined") {
      const geminiKey = localStorage.getItem("gemini_api_key");
      if (geminiKey) {
        (headers as Record<string, string>)["X-Gemini-API-Key"] = geminiKey;
      }
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({ resume_config: resumeConfig, job }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || "Failed to generate PDF");
    }

    return response.blob();
  },

  preview: (resumeConfig: ResumeConfig) =>
    fetchAPI<{ pdf_base64: string }>("/api/generate/preview", {
      method: "POST",
      body: JSON.stringify({ resume_config: resumeConfig }),
    }),
};

// Auth API
export const authAPI = {
  sync: (data: UserCreate) =>
    fetchAPI<User>("/api/auth/sync", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  me: () => fetchAPI<User>("/api/auth/me"),
};

// Types
export interface Section {
  id: string;
  user_id: string;
  type: string;
  key: string;
  flavor: string;
  version: string;
  content: Record<string, any>;
  is_current: boolean;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface SectionCreate {
  type: string;
  key: string;
  flavor: string;
  content: Record<string, any>;
}

export interface SectionUpdate {
  content: Record<string, any>;
}

export interface Application {
  id: string;
  user_id: string;
  company: string;
  role: string;
  job_url?: string;
  job_id?: string;
  location?: string;
  status: string;
  resume_config: ResumeConfig;
  applied_at: string;
  created_at: string;
  updated_at: string;
  notes?: string;
  referral?: string;
  salary_range?: string;
  job_description?: string;
}

export interface ApplicationCreate {
  company: string;
  role: string;
  job_url?: string;
  job_id?: string;
  location?: string;
  resume_config: ResumeConfig;
  applied_at: string;
  notes?: string;
  referral?: string;
  salary_range?: string;
  job_description?: string;
}

export interface ApplicationUpdate {
  status?: string;
  notes?: string;
  referral?: string;
  salary_range?: string;
  job_description?: string;
}

export interface ResumeConfig {
  experiences?: string[];
  projects?: string[];
  skills?: string;
  heading?: string;
  education?: string;
}

export interface JobInfo {
  company: string;
  role: string;
  location?: string;
  job_url?: string;
  job_id?: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  provider: string;
  provider_id: string;
  created_at: string;
  updated_at: string;
}

export interface UserCreate {
  email: string;
  name?: string;
  avatar_url?: string;
  provider: string;
  provider_id: string;
}