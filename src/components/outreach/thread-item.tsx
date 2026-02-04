"use client";

import { useState } from "react";
import { OutreachThread } from "@/types/outreach";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Trash2, Loader2, MessageSquare, User, Linkedin, Mail, HelpCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface ThreadItemProps {
  thread: OutreachThread;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}

const contactMethodIcons = {
  linkedin: Linkedin,
  email: Mail,
  other: HelpCircle,
};

export function ThreadItem({
  thread,
  isSelected,
  onSelect,
  onDelete,
  isDeleting,
}: ThreadItemProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDelete = () => {
    onDelete();
    setShowDeleteDialog(false);
  };

  const messageCount = thread.message_count ?? 0;
  const lastActivity = thread.last_message_at
    ? formatDistanceToNow(new Date(thread.last_message_at), { addSuffix: true })
    : thread.updated_at
    ? formatDistanceToNow(new Date(thread.updated_at), { addSuffix: true })
    : null;

  const ContactIcon = thread.contact_method
    ? contactMethodIcons[thread.contact_method]
    : null;

  const displayName = thread.contact_name || "Unknown Contact";

  return (
    <>
      <Card
        className={cn(
          "p-3 cursor-pointer transition-colors hover:bg-muted/50",
          isSelected && "ring-2 ring-primary bg-muted/30"
        )}
        onClick={onSelect}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="font-medium truncate">{displayName}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {ContactIcon && <ContactIcon className="h-3.5 w-3.5" />}
              <span className="flex items-center gap-1">
                <MessageSquare className="h-3.5 w-3.5" />
                {messageCount} message{messageCount !== 1 ? "s" : ""}
              </span>
              {lastActivity && (
                <>
                  <span>·</span>
                  <span>{lastActivity}</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <Badge variant={thread.is_active ? "default" : "secondary"}>
              {thread.is_active ? "Active" : "Inactive"}
            </Badge>

            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDeleteDialog(true);
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete thread
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete thread?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete your conversation thread with{" "}
              <strong>{displayName}</strong> at {thread.company}, including
              all {messageCount} message{messageCount !== 1 ? "s" : ""}. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
