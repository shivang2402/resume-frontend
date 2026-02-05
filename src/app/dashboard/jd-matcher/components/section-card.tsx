"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Pencil, RotateCcw, Pin } from "lucide-react";
import { FlavorInfo, TempEdit, SectionContent } from "@/types/jd-matcher";

interface SectionCardProps {
  type: "experience" | "project";
  sectionKey: string;
  flavors: FlavorInfo[];
  selectedFlavor: string;
  selectedVersion: string;
  isSelected: boolean;
  isPinned?: boolean;
  tempEdit?: TempEdit;
  onToggle: (selected: boolean) => void;
  onFlavorChange: (flavor: string, version: string) => void;
  onEdit: () => void;
  onResetEdit: () => void;
}

export function SectionCard({
  type,
  sectionKey,
  flavors,
  selectedFlavor,
  selectedVersion,
  isSelected,
  isPinned,
  tempEdit,
  onToggle,
  onFlavorChange,
  onEdit,
  onResetEdit,
}: SectionCardProps) {
  const currentFlavor = flavors.find((f) => f.flavor === selectedFlavor);
  const content: SectionContent = tempEdit?.content || currentFlavor?.content || { bullets: [] };
  const hasTempEdit = !!tempEdit;

  const handleFlavorChange = (value: string) => {
    const flavor = flavors.find((f) => f.flavor === value);
    if (flavor) {
      onFlavorChange(value, flavor.version);
    }
  };

  return (
    <Card className={`transition-colors ${isSelected ? "border-primary" : "border-muted"}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Checkbox
            checked={isSelected}
            onCheckedChange={onToggle}
            disabled={isPinned}
            className="mt-1"
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium capitalize">{sectionKey.replace(/_/g, " ")}</span>
              
              {isPinned && (
                <Badge variant="secondary" className="gap-1">
                  <Pin className="h-3 w-3" />
                  Pinned
                </Badge>
              )}

              <Select value={selectedFlavor} onValueChange={handleFlavorChange}>
                <SelectTrigger className="w-[140px] h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {flavors.map((f) => (
                    <SelectItem key={f.flavor} value={f.flavor}>
                      {f.flavor} (v{f.version})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Badge variant="outline" className="text-xs">
                v{selectedVersion}
              </Badge>

              {hasTempEdit && (
                <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                  not saved to library
                </Badge>
              )}
            </div>

            {content.title && (
              <p className="text-sm font-medium mt-2">{content.title}</p>
            )}
            {content.company && (
              <p className="text-sm text-muted-foreground">{content.company}</p>
            )}

            {content.bullets && content.bullets.length > 0 && (
              <ul className="mt-2 space-y-1">
                {content.bullets.slice(0, 3).map((bullet, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex">
                    <span className="mr-2">•</span>
                    <span className="line-clamp-2">{bullet}</span>
                  </li>
                ))}
                {content.bullets.length > 3 && (
                  <li className="text-sm text-muted-foreground italic">
                    +{content.bullets.length - 3} more bullets
                  </li>
                )}
              </ul>
            )}

            <div className="flex gap-2 mt-3">
              <Button variant="outline" size="sm" onClick={onEdit}>
                <Pencil className="h-3 w-3 mr-1" />
                Edit
              </Button>
              {hasTempEdit && (
                <Button variant="ghost" size="sm" onClick={onResetEdit}>
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Reset
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
