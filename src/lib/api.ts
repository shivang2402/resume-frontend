const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Use your actual user ID
const USER_ID = "ca99f200-da44-49f7-bf63-35a4fe1cef92";

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    "X-User-Id": USER_ID,
    ...(options.headers || {}),
  };

  // Add Gemini API key from localStorage if available (for AI features)
  if (typeof window !== "undefined") {
    const geminiKey = localStorage.getItem("gemini_api_key");
    if (geminiKey) {
      headers["X-Gemini-API-Key"] = geminiKey;
    }
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json();
}

export interface Section {
  id: string;
  user_id: string;
  type: string;
  key: string;
  flavor: string;
  version: string;
  content: any;
  is_current: boolean;
  tags?: string[];
  created_at: string;
  updated_at: string;
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
  resume_config: any;
  applied_at: string;
  created_at: string;
  updated_at: string;
  notes?: string;
  referral?: string;
  salary_range?: string;
  job_description?: string;
}

export const sectionsAPI = {
  list: () => fetchAPI("/api/sections"),
  getByType: (type: string) => fetchAPI(`/api/sections/${type}`),
  create: (data: any) => fetchAPI("/api/sections", {
    method: "POST",
    body: JSON.stringify(data),
  }),
  update: (type: string, key: string, flavor: string, data: any) =>
    fetchAPI(`/api/sections/${type}/${key}/${flavor}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (type: string, key: string, flavor: string, version: string) =>
    fetchAPI(`/api/sections/${type}/${key}/${flavor}/${version}`, {
      method: "DELETE",
    }),
};

export const applicationsAPI = {
  list: () => fetchAPI("/api/applications"),
  get: (id: string) => fetchAPI(`/api/applications/${id}`),
  create: (data: any) => fetchAPI("/api/applications", {
    method: "POST",
    body: JSON.stringify(data),
  }),
  update: (id: string, data: any) =>
    fetchAPI(`/api/applications/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    fetchAPI(`/api/applications/${id}`, {
      method: "DELETE",
    }),
};

export const generateAPI = {
  pdf: (data: any) =>
    fetchAPI("/api/generate", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};
