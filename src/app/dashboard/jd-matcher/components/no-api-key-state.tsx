"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Key, Sparkles, Target, Lightbulb } from "lucide-react";

export function NoApiKeyState() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">JD Matcher</h1>
        <p className="text-muted-foreground">
          AI-powered job description analysis
        </p>
      </div>

      <Card className="border-dashed">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <Key className="h-6 w-6 text-muted-foreground" />
          </div>
          <CardTitle>AI Features Disabled</CardTitle>
          <CardDescription>
            Add your free Gemini API key to unlock AI-powered features
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <Sparkles className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-sm">Smart Suggestions</p>
                <p className="text-xs text-muted-foreground">
                  AI picks the best sections for each job
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <Target className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-sm">Missing Keywords</p>
                <p className="text-xs text-muted-foreground">
                  See what skills to add for better matching
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <Lightbulb className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-sm">Flavor Selection</p>
                <p className="text-xs text-muted-foreground">
                  Auto-picks the right version for each role
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <Button asChild>
              <Link href="/dashboard/settings">
                <Key className="h-4 w-4 mr-2" />
                Add API Key in Settings
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
