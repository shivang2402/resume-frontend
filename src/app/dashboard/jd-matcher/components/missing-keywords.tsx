"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Copy } from "lucide-react";
import { toast } from "sonner";

interface MissingKeywordsProps {
  keywords: string[];
}

export function MissingKeywords({ keywords }: MissingKeywordsProps) {
  if (keywords.length === 0) return null;

  const handleCopy = (keyword: string) => {
    navigator.clipboard.writeText(keyword);
    toast.success(`Copied "${keyword}"`);
  };

  return (
    <Card className="border-amber-300 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2 text-amber-800 dark:text-amber-200">
          <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          Missing Keywords ({keywords.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-3">
          These keywords from the JD are not in your selected sections. Click to copy.
        </p>
        <div className="flex flex-wrap gap-2">
          {keywords.map((kw) => (
            <Badge
              key={kw}
              variant="outline"
              className="cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-900 gap-1 py-1.5"
              onClick={() => handleCopy(kw)}
            >
              {kw}
              <Copy className="h-3 w-3" />
            </Badge>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          These keywords were not found in your saved Content Sections — not necessarily skills you lack. Add or edit sections to improve your match score.
        </p>
      </CardContent>
    </Card>
  );
}
