"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Eye, EyeOff, Key, Check, Trash2 } from "lucide-react";
import { toast } from "sonner";

const STORAGE_KEY = "gemini_api_key";

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState("");
  const [inputKey, setInputKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setApiKey(stored);
      setInputKey(stored);
    }
    setIsLoaded(true);
  }, []);

  const handleSave = () => {
    if (!inputKey.trim()) {
      toast.error("Please enter an API key");
      return;
    }
    if (inputKey.length < 20) {
      toast.error("Invalid API key format");
      return;
    }
    localStorage.setItem(STORAGE_KEY, inputKey.trim());
    setApiKey(inputKey.trim());
    toast.success("API key saved");
  };

  const handleRemove = () => {
    localStorage.removeItem(STORAGE_KEY);
    setApiKey("");
    setInputKey("");
    toast.success("API key removed");
  };

  const hasKey = !!apiKey && apiKey.length > 0;
  const maskedKey = inputKey
    ? inputKey.slice(0, 8) + "••••••••••••••••••••" + inputKey.slice(-4)
    : "";

  if (!isLoaded) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and AI settings
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            AI Features
          </CardTitle>
          <CardDescription>
            Configure your Gemini API key to enable AI-powered features like JD
            Matcher and Cold Outreach.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="api-key">Gemini API Key</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="api-key"
                  type={showKey ? "text" : "password"}
                  value={showKey ? inputKey : maskedKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowKey(!showKey)}
                >
                  {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <Button onClick={handleSave} disabled={!inputKey.trim()}>
                <Check className="h-4 w-4 mr-2" />
                Save
              </Button>
              {hasKey && (
                <Button variant="outline" onClick={handleRemove}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="rounded-lg bg-muted p-4 space-y-2">
            <p className="text-sm font-medium">How to get your free API key:</p>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Go to aistudio.google.com/apikey</li>
              <li>Sign in with your Google account</li>
              <li>Click Create API Key</li>
              <li>Copy and paste it above</li>
            </ol>
            <p className="text-xs text-muted-foreground mt-2">
              Your key is stored locally in your browser. We never store it on our servers.
            </p>
          </div>

          {hasKey && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <Check className="h-4 w-4" />
              API key configured - AI features enabled
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
