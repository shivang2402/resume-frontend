"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  Copy,
  Check,
  MessageSquare,
  Save,
  RefreshCw,
} from "lucide-react";
import { MessageLength, WritingStyle, CHAR_LIMITS } from "@/types/outreach";

interface StepPreviewProps {
  message: string;
  charCount: number;
  sectionsUsed: string[];
  length: MessageLength;
  style: WritingStyle;
  isRefining: boolean;
  onRefine: (instructions: string) => void;
  onCopy: () => void;
  onStartThread: () => void;
  onSaveTemplate: () => void;
  onBack: () => void;
}

export function StepPreview({
  message,
  charCount,
  sectionsUsed,
  length,
  style,
  isRefining,
  onRefine,
  onCopy,
  onStartThread,
  onSaveTemplate,
  onBack,
}: StepPreviewProps) {
  const [refineInstructions, setRefineInstructions] = useState("");
  const [copied, setCopied] = useState(false);

  const { limit, strict } = CHAR_LIMITS[length];
  const isOverLimit = charCount > limit;
  const charCountColor = isOverLimit
    ? strict
      ? "text-destructive"
      : "text-yellow-600"
    : "text-green-600";

  const handleCopy = () => {
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRefine = () => {
    if (refineInstructions.trim()) {
      onRefine(refineInstructions);
      setRefineInstructions("");
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Generated Message</Label>
          <Badge variant="outline" className={charCountColor}>
            {charCount}/{limit} {isOverLimit && strict && "⚠️"}
          </Badge>
        </div>
        <Card>
          <CardContent className="p-4">
            <p className="whitespace-pre-wrap">{message}</p>
          </CardContent>
        </Card>
        {sectionsUsed.length > 0 && (
          <p className="text-xs text-muted-foreground">
            Used sections: {sectionsUsed.join(", ")}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="refine">Refine your message</Label>
        <div className="flex gap-2">
          <Input
            id="refine"
            placeholder="e.g., Make it more casual, mention Python experience..."
            value={refineInstructions}
            onChange={(e) => setRefineInstructions(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleRefine()}
            disabled={isRefining}
          />
          <Button
            onClick={handleRefine}
            disabled={!refineInstructions.trim() || isRefining}
            variant="secondary"
          >
            {isRefining ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button onClick={handleCopy} variant="outline">
          {copied ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="mr-2 h-4 w-4" />
              Copy
            </>
          )}
        </Button>
        <Button onClick={onStartThread} variant="outline">
          <MessageSquare className="mr-2 h-4 w-4" />
          Start Thread
        </Button>
        <Button onClick={onSaveTemplate} variant="outline">
          <Save className="mr-2 h-4 w-4" />
          Save as Template
        </Button>
      </div>

      <div className="flex justify-start">
        <Button variant="ghost" onClick={onBack}>
          ← Back
        </Button>
      </div>
    </div>
  );
}
