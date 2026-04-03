"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { outreachApi } from "@/lib/api/outreach";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Copy, RefreshCw, Check } from "lucide-react";

interface ReplyGeneratorProps {
  threadId: string;
}

export function ReplyGenerator({ threadId }: ReplyGeneratorProps) {
  const [instructions, setInstructions] = useState("");
  const [generatedReply, setGeneratedReply] = useState("");
  const [copied, setCopied] = useState(false);

  const generateMutation = useMutation({
    mutationFn: () =>
      outreachApi.generateReply({
        thread_id: threadId,
        instructions: instructions || undefined,
      }),
    onSuccess: (data) => {
      setGeneratedReply(data.message);
    },
  });

  const handleGenerate = () => {
    generateMutation.mutate();
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generatedReply);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const hasApiKey = outreachApi.hasApiKey();

  return (
    <Card className="p-4 space-y-4">
      <h2 className="text-lg font-medium">Generate Reply</h2>

      {!hasApiKey && (
        <div className="flex items-center gap-2 p-3 border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-200 rounded-md text-sm">
          <span>Gemini API key not configured. Add it in <a href="/dashboard/settings" className="underline font-medium">Settings</a> to use AI features.</span>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="instructions">Instructions (optional)</Label>
        <Textarea
          id="instructions"
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          placeholder="e.g., I'm available Tuesday or Thursday afternoon..."
          rows={2}
          disabled={!hasApiKey}
        />
      </div>

      <Button
        onClick={handleGenerate}
        disabled={!hasApiKey || generateMutation.isPending}
      >
        {generateMutation.isPending ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Generating...
          </>
        ) : (
          "Generate Reply"
        )}
      </Button>

      {generateMutation.error && (
        <div className="flex items-center gap-2 p-3 border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/50 text-red-800 dark:text-red-200 rounded-md text-sm">
          {generateMutation.error.message}
        </div>
      )}

      {generatedReply && (
        <div className="space-y-2 pt-2 border-t">
          <div className="flex items-center justify-between">
            <Label>Suggested Reply</Label>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={handleCopy}>
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-1" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </>
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleGenerate}
                disabled={generateMutation.isPending}
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Regenerate
              </Button>
            </div>
          </div>
          <Textarea
            value={generatedReply}
            onChange={(e) => setGeneratedReply(e.target.value)}
            rows={4}
            className="bg-muted/50"
          />
          <p className="text-xs text-muted-foreground text-right">
            {generatedReply.length} characters
          </p>
        </div>
      )}
    </Card>
  );
}
