"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { sectionsAPI, Section } from "@/lib/api";
import { Upload, FileJson } from "lucide-react";

interface BulkImportDialogProps {
  onImported?: (sections: Section[]) => void;
}

const sampleJson = `[
  {
    "type": "experience",
    "key": "google",
    "flavor": "swe",
    "content": {
      "title": "Software Engineer",
      "company": "Google",
      "location": "Mountain View, CA",
      "dates": "Jan 2024 -- Present",
      "bullets": [
        "Built distributed systems serving 1M+ requests per second",
        "Reduced latency by 40% through caching optimizations"
      ]
    }
  },
  {
    "type": "project",
    "key": "my_project",
    "flavor": "default",
    "content": {
      "name": "My Awesome Project",
      "tech": "React, Node.js, PostgreSQL",
      "bullets": [
        "Developed a full-stack web application",
        "Implemented CI/CD pipeline with GitHub Actions"
      ]
    }
  }
]`;

export function BulkImportDialog({ onImported }: BulkImportDialogProps) {
  const [open, setOpen] = useState(false);
  const [jsonInput, setJsonInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{ success: number; failed: number } | null>(null);

  const handleImport = async () => {
    let data;
    try {
      data = JSON.parse(jsonInput);
    } catch (e) {
      alert("Invalid JSON format");
      return;
    }

    if (!Array.isArray(data)) {
      alert("JSON must be an array of sections");
      return;
    }

    setLoading(true);
    setResults(null);

    let success = 0;
    let failed = 0;
    const imported: Section[] = [];

    for (const item of data) {
      try {
        const section = await sectionsAPI.create({
          type: item.type,
          key: item.key,
          flavor: item.flavor || "default",
          content: item.content,
        });
        imported.push(section);
        success++;
      } catch (error) {
        console.error("Failed to import:", item, error);
        failed++;
      }
    }

    setResults({ success, failed });
    
    if (success > 0) {
      onImported?.(imported);
    }

    if (failed === 0) {
      setTimeout(() => {
        setOpen(false);
        setJsonInput("");
        setResults(null);
      }, 1500);
    }

    setLoading(false);
  };

  const loadSample = () => {
    setJsonInput(sampleJson);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="h-4 w-4 mr-2" />
          Bulk Import
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Import Sections</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Paste a JSON array of sections to import
            </p>
            <Button variant="ghost" size="sm" onClick={loadSample}>
              <FileJson className="h-4 w-4 mr-2" />
              Load Sample
            </Button>
          </div>

          <Textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder="Paste JSON here..."
            className="min-h-[300px] font-mono text-sm"
          />

          {results && (
            <div className="p-3 rounded-md bg-muted">
              <p className="text-sm">
                <span className="text-green-600 font-medium">{results.success} imported</span>
                {results.failed > 0 && (
                  <span className="text-red-600 font-medium ml-2">{results.failed} failed</span>
                )}
              </p>
            </div>
          )}

          <div className="text-xs text-muted-foreground">
            <p className="font-medium mb-1">Expected format:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Array of objects with type, key, flavor, content</li>
              <li>type: &quot;experience&quot;, &quot;project&quot;, &quot;skills&quot;, or &quot;education&quot;</li>
              <li>key: unique identifier (e.g., &quot;google&quot;, &quot;amazon&quot;)</li>
              <li>flavor: variant name (default: &quot;default&quot;)</li>
              <li>content: object with section-specific fields</li>
            </ul>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={loading || !jsonInput.trim()}>
            {loading ? "Importing..." : "Import Sections"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
