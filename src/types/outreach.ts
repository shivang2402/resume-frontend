export type WritingStyle = "professional" | "semi_formal" | "casual" | "friend";
export type MessageLength = "short" | "long";
export type ContactMethod = "linkedin" | "email" | "other";
export type MessageDirection = "sent" | "received";

export interface OutreachTemplate {
  id: string;
  name: string;
  content: string;
  style: WritingStyle;
  length: MessageLength;
  created_at: string;
}

export interface OutreachThread {
  id: string;
  company: string;
  contact_name?: string;
  contact_method?: ContactMethod;
  resume_config?: Record<string, unknown>;
  is_active: boolean;
  application_ids: string[];
  message_count: number;
  last_message_at?: string;
  created_at: string;
  updated_at: string;
}

export interface OutreachMessage {
  id: string;
  thread_id: string;
  direction: MessageDirection;
  content: string;
  message_at?: string;
  is_raw_dump: boolean;
  created_at: string;
}

export interface GenerateMessageRequest {
  company: string;
  style?: WritingStyle;
  length?: MessageLength;
  template_id?: string;
  contact_name?: string;
  jd_text?: string;
  application_id?: string;
}

export interface GenerateMessageResponse {
  message: string;
}

export interface RefineMessageRequest {
  original_message: string;
  refinement_instructions: string;
  style?: WritingStyle;
  length?: MessageLength;
}

export interface RefineMessageResponse {
  message: string;
  char_count: number;
}

export interface ThreadCreateRequest {
  company: string;
  contact_name?: string;
  contact_method?: ContactMethod;
  application_ids?: string[];
  resume_config?: Record<string, unknown>;
}

export interface TemplateCreateRequest {
  name: string;
  content: string;
  style: WritingStyle;
  length: MessageLength;
}

export const STYLE_LABELS: Record<WritingStyle, string> = {
  professional: "Professional",
  semi_formal: "Semi-formal",
  casual: "Casual",
  friend: "Friend",
};

export const LENGTH_LABELS: Record<MessageLength, string> = {
  short: "Short (300 chars)",
  long: "Long (600 chars)",
};

export const CHAR_LIMITS: Record<MessageLength, { limit: number; strict: boolean }> = {
  short: { limit: 300, strict: true },
  long: { limit: 600, strict: false },
};
