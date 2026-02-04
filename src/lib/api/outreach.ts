import {
  OutreachTemplate,
  OutreachThread,
  OutreachMessage,
  GenerateMessageRequest,
  GenerateMessageResponse,
  RefineMessageRequest,
  RefineMessageResponse,
  ThreadCreateRequest,
  TemplateCreateRequest,
} from "@/types/outreach";
import { Application } from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function getUserId(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("userId") || "00000000-0000-0000-0000-000000000001";
}

function getGeminiApiKey(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("gemini_api_key");
}

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const userId = getUserId();

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "X-User-ID": userId,
      ...options.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Unknown error" }));
    console.error("API Error:", error);
    throw new Error(error.detail || `API error: ${res.status}`);
  }

  return res.json();
}

export const outreachApi = {
  // Templates
  templates: {
    list: () => fetchApi<OutreachTemplate[]>("/api/outreach/templates"),
    create: (data: TemplateCreateRequest) =>
      fetchApi<OutreachTemplate>("/api/outreach/templates", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      fetchApi<void>(`/api/outreach/templates/${id}`, { method: "DELETE" }),
  },

  // Threads
  threads: {
    list: (activeOnly?: boolean) => {
      const params = activeOnly ? "?active_only=true" : "";
      return fetchApi<OutreachThread[]>(`/api/outreach/threads${params}`);
    },
    create: (data: ThreadCreateRequest) =>
      fetchApi<OutreachThread>("/api/outreach/threads", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    get: (id: string) => fetchApi<OutreachThread>(`/api/outreach/threads/${id}`),
    delete: (id: string) =>
      fetchApi<void>(`/api/outreach/threads/${id}`, { method: "DELETE" }),
  },

  // Top-level thread methods for components using flat API structure
  getThreads: (params?: { active_only?: boolean }) => {
    return fetchApi<OutreachThread[]>(
      `/api/outreach/threads${params?.active_only ? "?active_only=true" : ""}`
    );
  },
  deleteThread: (id: string) =>
    fetchApi<void>(`/api/outreach/threads/${id}`, { method: "DELETE" }),
  updateThread: (id: string, data: Partial<OutreachThread>) =>
    fetchApi<OutreachThread>(`/api/outreach/threads/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  // Messages
  getMessages: (threadId: string) =>
    fetchApi<OutreachMessage[]>(`/api/outreach/threads/${threadId}/messages`),

  addMessage: (
    threadId: string,
    data: { direction: string; content: string; message_at?: string; is_raw_dump?: boolean }
  ) =>
    fetchApi<OutreachMessage>(`/api/outreach/threads/${threadId}/messages`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  deleteMessage: (threadId: string, messageId: string) =>
    fetchApi<void>(`/api/outreach/threads/${threadId}/messages/${messageId}`, {
      method: "DELETE",
    }),

  // AI Generation
  generate: async (data: GenerateMessageRequest): Promise<GenerateMessageResponse> => {
    const apiKey = getGeminiApiKey();
    if (!apiKey) {
      throw new Error("Gemini API key not configured. Please add it in settings.");
    }

    const userId = getUserId();

    const res = await fetch(`${API_BASE}/api/outreach/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-User-ID": userId,
        "X-Gemini-API-Key": apiKey,
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ detail: "Unknown error" }));
      throw new Error(error.detail || `API error: ${res.status}`);
    }

    return res.json();
  },

  refine: async (data: RefineMessageRequest): Promise<RefineMessageResponse> => {
    const apiKey = getGeminiApiKey();
    if (!apiKey) {
      throw new Error("Gemini API key not configured. Please add it in settings.");
    }

    const res = await fetch(`${API_BASE}/api/outreach/refine`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Gemini-API-Key": apiKey,
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ detail: "Unknown error" }));
      throw new Error(error.detail || `API error: ${res.status}`);
    }

    return res.json();
  },

  parseConversation: async (rawText: string) => {
    const apiKey = getGeminiApiKey();
    if (!apiKey) {
      throw new Error("Gemini API key not configured.");
    }

    const res = await fetch(`${API_BASE}/api/outreach/parse-conversation`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Gemini-API-Key": apiKey,
      },
      body: JSON.stringify({ raw_text: rawText }),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ detail: "Unknown error" }));
      throw new Error(error.detail || `API error: ${res.status}`);
    }

    return res.json();
  },

  generateReply: async (data: { thread_id: string; instructions?: string }) => {
    const apiKey = getGeminiApiKey();
    if (!apiKey) {
      throw new Error("Gemini API key not configured.");
    }

    const userId = getUserId();

    const res = await fetch(`${API_BASE}/api/outreach/generate-reply`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-User-ID": userId,
        "X-Gemini-API-Key": apiKey,
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ detail: "Unknown error" }));
      throw new Error(error.detail || `API error: ${res.status}`);
    }

    return res.json();
  },

  hasApiKey: (): boolean => {
    return !!getGeminiApiKey();
  },

  searchApplicationsByCompany: async (company: string): Promise<Application[]> => {
    try {
      const apps = await fetchApi<Application[]>("/api/applications");
      const searchTerm = company.toLowerCase();
      return apps.filter((app) =>
        app.company.toLowerCase().includes(searchTerm)
      );
    } catch (err) {
      console.error("Error fetching applications:", err);
      return [];
    }
  },
};
