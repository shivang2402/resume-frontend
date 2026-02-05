"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Sparkles, RefreshCw, Loader2 } from "lucide-react";

interface JDInputProps {
  jobDescription: string;
  onJobDescriptionChange: (value: string) => void;
  instructions: string;
  onInstructionsChange: (value: string) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  hasAnalyzed: boolean;
}

export function JDInput({
  jobDescription,
  onJobDescriptionChange,
  instructions,
  onInstructionsChange,
  onAnalyze,
  isAnalyzing,
  hasAnalyzed,
}: JDInputProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Job Description</CardTitle>
        <CardDescription>
          Paste the job description and let AI suggest the best resume sections
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="jd">Job Description *</Label>
          <Textarea
            id="jd"
            placeholder="Paste the full job description here..."
            value={jobDescription}
            onChange={(e) => onJobDescriptionChange(e.target.value)}
            className="min-h-[200px] font-mono text-sm"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="instructions">
            Additional Instructions (optional)
          </Label>
          <Textarea
            id="instructions"
            placeholder="E.g., 'Focus on backend experience' or 'Emphasize leadership roles'"
            value={instructions}
            onChange={(e) => onInstructionsChange(e.target.value)}
            className="min-h-[80px]"
          />
        </div>

        <div className="flex gap-2">
          <Button
            onClick={onAnalyze}
            disabled={isAnalyzing || !jobDescription.trim()}
            className="flex-1 sm:flex-none"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : hasAnalyzed ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Re-analyze
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Analyze with AI
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
