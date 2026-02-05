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
    <Card className="border-yellow-200 bg-yellow-50/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-600" />
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
              className="cursor-pointer hover:bg-yellow-100 gap-1 py-1.5"
              onClick={() => handleCopy(kw)}
            >
              {kw}
              <Copy className="h-3 w-3" />
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
