"use client";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Save, Trash2, FileDown, Loader2 } from "lucide-react";

interface ActionButtonsProps {
  hasTempEdits: boolean;
  tempEditCount: number;
  onSaveAll: () => Promise<void>;
  onDiscardAll: () => void;
  onGenerate: () => void;
  isGenerating: boolean;
  isSavingAll: boolean;
}

export function ActionButtons({
  hasTempEdits,
  tempEditCount,
  onSaveAll,
  onDiscardAll,
  onGenerate,
  isGenerating,
  isSavingAll,
}: ActionButtonsProps) {
  return (
    <div className="flex flex-wrap gap-3 justify-end">
      {hasTempEdits && (
        <>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline">
                <Trash2 className="h-4 w-4 mr-2" />
                Discard All Edits
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Discard all edits?</AlertDialogTitle>
                <AlertDialogDescription>
                  You have {tempEditCount} unsaved edit(s). This will reset all sections.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onDiscardAll}>Discard All</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button variant="outline" onClick={onSaveAll} disabled={isSavingAll}>
            {isSavingAll ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save All to Library
          </Button>
        </>
      )}

      {hasTempEdits ? (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button disabled={isGenerating}>
              {isGenerating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <FileDown className="h-4 w-4 mr-2" />
              )}
              Generate Resume
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Generate with unsaved edits?</AlertDialogTitle>
              <AlertDialogDescription>
                You have {tempEditCount} section(s) with unsaved edits. These will be included but not saved to library.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onGenerate}>Generate Anyway</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ) : (
        <Button onClick={onGenerate} disabled={isGenerating}>
          {isGenerating ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <FileDown className="h-4 w-4 mr-2" />
          )}
          Generate Resume
        </Button>
      )}
    </div>
  );
}
