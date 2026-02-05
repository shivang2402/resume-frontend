"use client";

import { useState, useCallback } from "react";
import { analyzeJD, hasGeminiApiKey } from "@/lib/api/jd-matcher";
import { JDAnalyzeResponse, AllSections } from "@/types/jd-matcher";
import { toast } from "sonner";

export function useJDAnalysis() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [suggestions, setSuggestions] =
    useState<JDAnalyzeResponse["suggestions"] | null>(null);
  const [allSections, setAllSections] = useState<AllSections | null>(null);
  const [missingKeywords, setMissingKeywords] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const analyze = useCallback(
    async (jobDescription: string, additionalInstructions?: string) => {
      if (!hasGeminiApiKey()) {
        toast.error("Please add your Gemini API key in Settings");
        return null;
      }

      if (!jobDescription.trim()) {
        toast.error("Please enter a job description");
        return null;
      }

      setIsAnalyzing(true);
      setError(null);

      try {
        const response: JDAnalyzeResponse = await analyzeJD(
          jobDescription,
          additionalInstructions
        );

        setSuggestions(response.suggestions);
        setAllSections(response.all_sections);
        setMissingKeywords(response.missing_keywords || []);

        toast.success("Analysis complete!");
        return response;
      } catch (err: any) {
        const message = err.message || "Analysis failed";
        setError(message);

        if (message.includes("401") || message.includes("Invalid")) {
          toast.error("Invalid API key. Please check your settings.");
        } else if (message.includes("429") || message.includes("rate")) {
          toast.error("Rate limit exceeded. Try again later.");
        } else {
          toast.error(message);
        }
        return null;
      } finally {
        setIsAnalyzing(false);
      }
    },
    []
  );

  const reset = useCallback(() => {
    setSuggestions(null);
    setAllSections(null);
    setMissingKeywords([]);
    setError(null);
  }, []);

  return {
    analyze,
    reset,
    suggestions,
    allSections,
    missingKeywords,
    setMissingKeywords,
    isAnalyzing,
    error,
  };
}
