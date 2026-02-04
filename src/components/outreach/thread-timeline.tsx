"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { OutreachMessage } from "@/types/outreach";
import { outreachApi } from "@/lib/api/outreach";
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
import { Trash2, Loader2, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { AddConversationModal } from "./add-conversation-modal";

interface ThreadTimelineProps {
  threadId: string;
  messages: OutreachMessage[];
  isLoading: boolean;
}

export function ThreadTimeline({ threadId, messages, isLoading }: ThreadTimelineProps) {
  const [deleteMessageId, setDeleteMessageId] = useState<string | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (messageId: string) => outreachApi.deleteMessage(threadId, messageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["outreach-messages", threadId] });
      setDeleteMessageId(null);
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Conversation</h2>
        <Button variant="outline" size="sm" onClick={() => setAddModalOpen(true)}>
          + Add Conversation
        </Button>
      </div>

      {messages.length === 0 ? (
        <Card className="p-6 text-center text-muted-foreground">
          No messages yet. Add a conversation to track your communication.
        </Card>
      ) : (
        <div className="space-y-3">
          {messages.map((message) => (
            <MessageItem
              key={message.id}
              message={message}
              onDelete={() => setDeleteMessageId(message.id)}
            />
          ))}
        </div>
      )}

      <AlertDialog open={!!deleteMessageId} onOpenChange={() => setDeleteMessageId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete message?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this message from the conversation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMessageId && deleteMutation.mutate(deleteMessageId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AddConversationModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        threadId={threadId}
      />
    </div>
  );
}

interface MessageItemProps {
  message: OutreachMessage;
  onDelete: () => void;
}

function MessageItem({ message, onDelete }: MessageItemProps) {
  const isSent = message.direction === "sent";
  const timestamp = message.message_at || message.created_at;

  return (
    <Card
      className={cn(
        "p-4 relative group",
        isSent ? "border-l-4 border-l-blue-500" : "border-l-4 border-l-green-500"
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant={isSent ? "default" : "secondary"} className="text-xs">
              {isSent ? (
                <>
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  SENT
                </>
              ) : (
                <>
                  <ArrowDownLeft className="h-3 w-3 mr-1" />
                  RECEIVED
                </>
              )}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {format(new Date(timestamp), "MMM d, yyyy h:mm a")}
            </span>
            {message.is_raw_dump && (
              <Badge variant="outline" className="text-xs">
                Raw
              </Badge>
            )}
          </div>
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
        </Button>
      </div>
    </Card>
  );
}
