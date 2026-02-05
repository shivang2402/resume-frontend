"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Copy } from "lucide-react";
import { toast } from "sonner";
import { SectionContent } from "@/types/jd-matcher";

interface EditModalProps {
  open: boolean;
  onClose: () => void;
  type: string;
  sectionKey: string;
  flavor: string;
  version: string;
  content: SectionContent;
  missingKeywords: string[];
  onSaveTemp: (content: SectionContent) => void;
  onSaveToLibrary: (content: SectionContent) => Promise<void>;
}

export function EditModal({
  open,
  onClose,
  type,
  sectionKey,
  flavor,
  version,
  content: initialContent,
  missingKeywords,
  onSaveTemp,
  onSaveToLibrary,
}: EditModalProps) {
  const [content, setContent] = useState<SectionContent>(initialContent);
  const [saveMode, setSaveMode] = useState<"temp" | "library">("temp");
  const [isSaving, setIsSaving] = useState(false);

  const handleBulletChange = (index: number, value: string) => {
    const newBullets = [...content.bullets];
    newBullets[index] = value;
    setContent({ ...content, bullets: newBullets });
  };

  const handleAddBullet = () => {
    setContent({ ...content, bullets: [...content.bullets, ""] });
  };

  const handleRemoveBullet = (index: number) => {
    const newBullets = content.bullets.filter((_, i) => i !== index);
    setContent({ ...content, bullets: newBullets });
  };

  const handleKeywordClick = (keyword: string) => {
    navigator.clipboard.writeText(keyword);
    toast.success(`Copied "${keyword}" to clipboard`);
  };

  const getNextVersion = (v: string) => {
    const [major, minor] = v.split(".").map(Number);
    return `${major}.${minor + 1}`;
  };

  const handleApply = async () => {
    if (saveMode === "library") {
      setIsSaving(true);
      try {
        await onSaveToLibrary(content);
        toast.success(`Saved to library as v${getNextVersion(version)}`);
        onClose();
      } catch (error) {
        toast.error("Failed to save to library");
      } finally {
        setIsSaving(false);
      }
    } else {
      onSaveTemp(content);
      toast.success("Changes saved for this resume only");
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Edit: {sectionKey} - {flavor} (v{version})
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {type === "experience" && (
            <>
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={content.title || ""}
                  onChange={(e) => setContent({ ...content, title: e.target.value })}
                  placeholder="Software Engineer"
                />
              </div>

              <div className="space-y-2">
                <Label>Company</Label>
                <Input
                  value={content.company || ""}
                  onChange={(e) => setContent({ ...content, company: e.target.value })}
                  placeholder="Company Name"
                />
              </div>

              <div className="space-y-2">
                <Label>Dates</Label>
                <Input
                  value={content.dates || ""}
                  onChange={(e) => setContent({ ...content, dates: e.target.value })}
                  placeholder="Jan 2023 - Present"
                />
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label>Bullets</Label>
            <div className="space-y-2">
              {content.bullets.map((bullet, index) => (
                <div key={index} className="flex gap-2">
                  <Textarea
                    value={bullet}
                    onChange={(e) => handleBulletChange(index, e.target.value)}
                    className="flex-1 min-h-[60px]"
                    placeholder="Bullet point..."
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveBullet(index)}
                    className="shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={handleAddBullet} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Bullet
              </Button>
            </div>
          </div>

          {missingKeywords.length > 0 && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-2 flex items-center gap-2">
                💡 Missing Keywords
                <span className="text-muted-foreground font-normal">(click to copy)</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {missingKeywords.map((kw) => (
                  <Badge
                    key={kw}
                    variant="secondary"
                    className="cursor-pointer hover:bg-secondary/80 gap-1"
                    onClick={() => handleKeywordClick(kw)}
                  >
                    {kw}
                    <Copy className="h-3 w-3" />
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="border-t pt-4">
            <Label className="mb-3 block">Save as:</Label>
            <RadioGroup value={saveMode} onValueChange={(v) => setSaveMode(v as "temp" | "library")}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="temp" id="temp" />
                <Label htmlFor="temp" className="font-normal cursor-pointer">
                  This resume only (won&apos;t update Content Library)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="library" id="library" />
                <Label htmlFor="library" className="font-normal cursor-pointer">
                  Save to Content Library (creates v{getNextVersion(version)})
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleApply} disabled={isSaving}>
            {isSaving ? "Saving..." : "Apply Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
