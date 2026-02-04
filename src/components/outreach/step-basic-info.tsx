"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertCircle } from "lucide-react";
import {
  WritingStyle,
  MessageLength,
  OutreachTemplate,
  STYLE_LABELS,
  LENGTH_LABELS,
} from "@/types/outreach";
import { Application } from "@/types";
import { outreachApi } from "@/lib/api/outreach";

interface StepBasicInfoProps {
  company: string;
  setCompany: (v: string) => void;
  style: WritingStyle;
  setStyle: (v: WritingStyle) => void;
  length: MessageLength;
  setLength: (v: MessageLength) => void;
  templateId: string | undefined;
  setTemplateId: (v: string | undefined) => void;
  matchingApps: Application[];
  setMatchingApps: (v: Application[]) => void;
  onNext: () => void;
}

export function StepBasicInfo({
  company,
  setCompany,
  style,
  setStyle,
  length,
  setLength,
  templateId,
  setTemplateId,
  matchingApps,
  setMatchingApps,
  onNext,
}: StepBasicInfoProps) {
  const [templates, setTemplates] = useState<OutreachTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [searchingApps, setSearchingApps] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(true);

  // Load templates on mount
  useEffect(() => {
    setHasApiKey(outreachApi.hasApiKey());
    outreachApi.templates
      .list()
      .then(setTemplates)
      .catch(console.error)
      .finally(() => setLoadingTemplates(false));
  }, []);

  // Debounced company search
  useEffect(() => {
    if (!company || company.length < 2) {
      setMatchingApps([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearchingApps(true);
      try {
        const apps = await outreachApi.searchApplicationsByCompany(company);
        setMatchingApps(apps);
      } catch (err) {
        console.error(err);
      } finally {
        setSearchingApps(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [company, setMatchingApps]);

  const canProceed = company.trim().length > 0 && hasApiKey;

  return (
    <div className="space-y-6">
      {!hasApiKey && (
        <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-md">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">
            Gemini API key not configured. Add it in localStorage as &quot;gemini_api_key&quot;.
          </span>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="company">Company *</Label>
        <Input
          id="company"
          placeholder="e.g., Amazon, Google, Stripe"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />
        {searchingApps && (
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <Loader2 className="h-3 w-3 animate-spin" />
            Searching applications...
          </p>
        )}
        {!searchingApps && matchingApps.length > 0 && (
          <p className="text-sm text-muted-foreground">
            ⚡ Found {matchingApps.length} application{matchingApps.length > 1 ? "s" : ""} at {company}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Style *</Label>
          <Select value={style} onValueChange={(v) => setStyle(v as WritingStyle)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(STYLE_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Length *</Label>
          <Select value={length} onValueChange={(v) => setLength(v as MessageLength)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(LENGTH_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Template (Optional)</Label>
        <Select
          value={templateId || "none"}
          onValueChange={(v) => setTemplateId(v === "none" ? undefined : v)}
          disabled={loadingTemplates}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a template..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No template</SelectItem>
            {templates.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                <div className="flex items-center gap-2">
                  {t.name}
                  <Badge variant="outline" className="text-xs">
                    {STYLE_LABELS[t.style]}
                  </Badge>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {loadingTemplates && (
          <p className="text-sm text-muted-foreground">Loading templates...</p>
        )}
      </div>

      <div className="flex justify-end">
        <Button onClick={onNext} disabled={!canProceed}>
          Next →
        </Button>
      </div>
    </div>
  );
}
