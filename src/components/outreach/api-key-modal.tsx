"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Key } from "lucide-react";

interface ApiKeyModalProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export function ApiKeyModal({ open, onClose, onSaved }: ApiKeyModalProps) {
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [existingKey, setExistingKey] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      const key = localStorage.getItem("gemini_api_key");
      setExistingKey(key);
      setApiKey(key || "");
    }
  }, [open]);

  const handleSave = () => {
    if (apiKey.trim()) {
      localStorage.setItem("gemini_api_key", apiKey.trim());
      onSaved();
      onClose();
    }
  };

  const handleRemove = () => {
    localStorage.removeItem("gemini_api_key");
    setApiKey("");
    setExistingKey(null);
  };

  const maskedKey = existingKey
    ? existingKey.slice(0, 8) + "..." + existingKey.slice(-4)
    : null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Gemini API Key
          </DialogTitle>
          <DialogDescription>
            Enter your Google Gemini API key to enable AI-powered message generation.
            Your key is stored locally in your browser and never sent to our servers.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {existingKey && !apiKey.includes(existingKey) && (
            <div className="p-3 bg-muted rounded-md">
              <p className="text-sm text-muted-foreground">
                Current key: <code className="font-mono">{maskedKey}</code>
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="api-key">API Key</Label>
            <div className="relative">
              <Input
                id="api-key"
                type={showKey ? "text" : "password"}
                placeholder="AIza..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowKey(!showKey)}
              >
                {showKey ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
          </div>

          <div className="text-sm text-muted-foreground space-y-2">
            <p>To get an API key:</p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Visit aistudio.google.com/app/apikey</li>
              <li>Sign in with your Google account</li>
              <li>Click Create API Key</li>
              <li>Copy and paste the key here</li>
            </ol>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {existingKey && (
            <Button variant="destructive" onClick={handleRemove} className="sm:mr-auto">
              Remove Key
            </Button>
          )}
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!apiKey.trim()}>
            Save Key
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
