"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Application } from "@/types";

interface StepContextProps {
  jdText: string;
  setJdText: (v: string) => void;
  selectedAppId: string | undefined;
  setSelectedAppId: (v: string | undefined) => void;
  matchingApps: Application[];
  onBack: () => void;
  onNext: () => void;
  onSkip: () => void;
}

export function StepContext({
  jdText,
  setJdText,
  selectedAppId,
  setSelectedAppId,
  matchingApps,
  onBack,
  onNext,
  onSkip,
}: StepContextProps) {
  const [contextType, setContextType] = useState<"jd" | "app">(
    matchingApps.length > 0 ? "app" : "jd"
  );

  const hasContext = jdText.trim().length > 0 || selectedAppId;

  const handleContextTypeChange = (value: "jd" | "app") => {
    setContextType(value);
    if (value === "jd") {
      setSelectedAppId(undefined);
    } else {
      setJdText("");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground mb-4">
          Add context to personalize your message (optional)
        </p>

        <RadioGroup
          value={contextType}
          onValueChange={(v) => handleContextTypeChange(v as "jd" | "app")}
          className="space-y-4"
        >
          <div className="flex items-start space-x-3">
            <RadioGroupItem value="jd" id="jd" className="mt-1" />
            <div className="flex-1 space-y-2">
              <Label htmlFor="jd" className="cursor-pointer">
                Paste Job Description
              </Label>
              {contextType === "jd" && (
                <Textarea
                  placeholder="Paste the job description here..."
                  value={jdText}
                  onChange={(e) => setJdText(e.target.value)}
                  rows={6}
                />
              )}
            </div>
          </div>

          {matchingApps.length > 0 && (
            <div className="flex items-start space-x-3">
              <RadioGroupItem value="app" id="app" className="mt-1" />
              <div className="flex-1 space-y-2">
                <Label htmlFor="app" className="cursor-pointer">
                  Select from your applications
                </Label>
                {contextType === "app" && (
                  <Select
                    value={selectedAppId || "none"}
                    onValueChange={(v) =>
                      setSelectedAppId(v === "none" ? undefined : v)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select an application..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None selected</SelectItem>
                      {matchingApps.map((app) => (
                        <SelectItem key={app.id} value={app.id}>
                          {app.role} @ {app.company}
                          {app.applied_at && (
                            <span className="text-muted-foreground ml-2">
                              (Applied {new Date(app.applied_at).toLocaleDateString()})
                            </span>
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          )}
        </RadioGroup>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          ← Back
        </Button>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={onSkip}>
            Skip
          </Button>
          <Button onClick={onNext} disabled={!hasContext}>
            Next →
          </Button>
        </div>
      </div>
    </div>
  );
}
