"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { outreachApi } from "@/lib/api/outreach";
import { WritingStyle, MessageLength, STYLE_LABELS, LENGTH_LABELS } from "@/types/outreach";

interface SaveTemplateModalProps {
  open: boolean;
  onClose: () => void;
  content: string;
  style: WritingStyle;
  length: MessageLength;
  onSaved: () => void;
}

export function SaveTemplateModal({
  open,
  onClose,
  content,
  style,
  length,
  onSaved,
}: SaveTemplateModalProps) {
  const [name, setName] = useState("");
  const [templateContent, setTemplateContent] = useState(content);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    try {
      await outreachApi.templates.create({
        name,
        content: templateContent,
        style,
        length,
      });
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save template");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save as Template</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <div className="space-y-2">
            <Label htmlFor="template-name">Template Name *</Label>
            <Input
              id="template-name"
              placeholder="e.g., LinkedIn Referral Request"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="template-content">Content</Label>
            <Textarea
              id="template-content"
              value={templateContent}
              onChange={(e) => setTemplateContent(e.target.value)}
              rows={6}
            />
          </div>

          <div className="flex gap-4 text-sm text-muted-foreground">
            <span>Style: {STYLE_LABELS[style]}</span>
            <span>Length: {LENGTH_LABELS[length]}</span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name.trim() || isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
