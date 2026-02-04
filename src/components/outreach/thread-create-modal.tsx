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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { outreachApi } from "@/lib/api/outreach";
import { ContactMethod } from "@/types/outreach";
import { Application } from "@/types";

interface ThreadCreateModalProps {
  open: boolean;
  onClose: () => void;
  defaultCompany: string;
  matchingApps: Application[];
  onCreated: () => void;
}

const CONTACT_METHOD_LABELS: Record<ContactMethod, string> = {
  linkedin: "LinkedIn",
  email: "Email",
  phone: "Phone",
  other: "Other",
};

export function ThreadCreateModal({
  open,
  onClose,
  defaultCompany,
  matchingApps,
  onCreated,
}: ThreadCreateModalProps) {
  const [company, setCompany] = useState(defaultCompany);
  const [contactName, setContactName] = useState("");
  const [contactMethod, setContactMethod] = useState<ContactMethod | "">("");
  const [selectedAppIds, setSelectedAppIds] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    setIsCreating(true);
    setError(null);

    try {
      await outreachApi.threads.create({
        company,
        contact_name: contactName || undefined,
        contact_method: contactMethod || undefined,
        application_ids: selectedAppIds.length > 0 ? selectedAppIds : undefined,
      });
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create thread");
    } finally {
      setIsCreating(false);
    }
  };

  const toggleApp = (appId: string) => {
    setSelectedAppIds((prev) =>
      prev.includes(appId)
        ? prev.filter((id) => id !== appId)
        : [...prev, appId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Start Conversation Thread</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <div className="space-y-2">
            <Label htmlFor="thread-company">Company *</Label>
            <Input
              id="thread-company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact-name">Contact Name (Optional)</Label>
            <Input
              id="contact-name"
              placeholder="e.g., John Smith"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Contact Method (Optional)</Label>
            <Select
              value={contactMethod}
              onValueChange={(v) => setContactMethod(v as ContactMethod)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select method..." />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CONTACT_METHOD_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {matchingApps.length > 0 && (
            <div className="space-y-2">
              <Label>Link Applications (Optional)</Label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {matchingApps.map((app) => (
                  <div key={app.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`app-${app.id}`}
                      checked={selectedAppIds.includes(app.id)}
                      onCheckedChange={() => toggleApp(app.id)}
                    />
                    <label
                      htmlFor={`app-${app.id}`}
                      className="text-sm cursor-pointer"
                    >
                      {app.role} @ {app.company}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!company.trim() || isCreating}>
            {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Thread
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
