"use client";

import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { outreachApi } from "@/lib/api/outreach";
import { MessageDirection, OutreachMessage } from "@/types/outreach";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, ArrowUpRight, ArrowDownLeft, Check, X, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface AddConversationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  threadId: string;
}

interface ParsedMessage {
  direction: MessageDirection;
  content: string;
  message_at?: string;
  isDuplicate?: boolean;
}

export function AddConversationModal({
  open,
  onOpenChange,
  threadId,
}: AddConversationModalProps) {
  const [mode, setMode] = useState<"single" | "dump">("single");
  const [direction, setDirection] = useState<MessageDirection>("sent");
  const [content, setContent] = useState("");
  const [dumpText, setDumpText] = useState("");
  const [parsedMessages, setParsedMessages] = useState<ParsedMessage[] | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Fetch existing messages to detect duplicates
  const { data: existingMessages = [] } = useQuery({
    queryKey: ["outreach-messages", threadId],
    queryFn: () => outreachApi.getMessages(threadId),
    enabled: open,
  });

  const addMessageMutation = useMutation({
    mutationFn: (data: { direction: MessageDirection; content: string }) =>
      outreachApi.addMessage(threadId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["outreach-messages", threadId] });
      setContent("");
      onOpenChange(false);
    },
  });

  const parseMutation = useMutation({
    mutationFn: (rawText: string) => outreachApi.parseConversation(rawText),
    onSuccess: (result) => {
      if (result.success && result.messages.length > 0) {
        // Mark duplicates
        const messagesWithDuplicateCheck = result.messages.map((msg: ParsedMessage) => ({
          ...msg,
          isDuplicate: isDuplicateMessage(msg.content, existingMessages),
        }));
        setParsedMessages(messagesWithDuplicateCheck);
        setParseError(null);
      } else if (result.raw_fallback) {
        setParseError("Couldn't parse conversation. You can save it as a single message block.");
        setParsedMessages([{
          direction: "sent" as MessageDirection,
          content: result.raw_fallback,
          isDuplicate: isDuplicateMessage(result.raw_fallback, existingMessages),
        }]);
      }
    },
    onError: (error) => {
      setParseError(error.message);
      setParsedMessages(null);
    },
  });

  // Check if a message content already exists (fuzzy match)
  const isDuplicateMessage = (content: string, existing: OutreachMessage[]): boolean => {
    const normalizedNew = normalizeContent(content);
    return existing.some((msg) => {
      const normalizedExisting = normalizeContent(msg.content);
      // Check for exact match or high similarity
      return normalizedNew === normalizedExisting || 
             normalizedExisting.includes(normalizedNew) ||
             normalizedNew.includes(normalizedExisting);
    });
  };

  const normalizeContent = (text: string): string => {
    return text.toLowerCase().trim().replace(/\s+/g, ' ');
  };

  const handleAddSingle = () => {
    if (!content.trim()) return;
    
    // Check for duplicate
    if (isDuplicateMessage(content.trim(), existingMessages)) {
      if (!confirm("This message appears to already exist in the conversation. Add anyway?")) {
        return;
      }
    }
    
    addMessageMutation.mutate({ direction, content: content.trim() });
  };

  const handleParseDump = () => {
    if (!dumpText.trim()) return;
    setParsedMessages(null);
    setParseError(null);
    parseMutation.mutate(dumpText.trim());
  };

  const handleConfirmParsed = async () => {
    if (!parsedMessages) return;

    // Filter out duplicates
    const newMessages = parsedMessages.filter((msg) => !msg.isDuplicate);
    
    if (newMessages.length === 0) {
      alert("All messages already exist in the conversation. Nothing to add.");
      return;
    }

    for (const msg of newMessages) {
      await outreachApi.addMessage(threadId, {
        direction: msg.direction,
        content: msg.content,
        message_at: msg.message_at,
      });
    }
    
    queryClient.invalidateQueries({ queryKey: ["outreach-messages", threadId] });
    handleReset();
    onOpenChange(false);
  };

  const handleReset = () => {
    setParsedMessages(null);
    setParseError(null);
    setDumpText("");
    setContent("");
  };

  const handleClose = () => {
    handleReset();
    onOpenChange(false);
  };

  const isLoading = addMessageMutation.isPending || parseMutation.isPending;
  const newMessagesCount = parsedMessages?.filter((m) => !m.isDuplicate).length ?? 0;
  const duplicateCount = parsedMessages?.filter((m) => m.isDuplicate).length ?? 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {parsedMessages ? "Review Parsed Messages" : "Add Conversation"}
          </DialogTitle>
        </DialogHeader>

        {parsedMessages ? (
          // Preview parsed messages
          <div className="space-y-4">
            {duplicateCount > 0 && (
              <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-950 rounded-md text-sm">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <span>
                  {duplicateCount} message{duplicateCount !== 1 ? "s" : ""} already exist and will be skipped.
                </span>
              </div>
            )}

            <div className="space-y-2 max-h-[40vh] overflow-y-auto">
              {parsedMessages.map((msg, idx) => (
                <Card
                  key={idx}
                  className={cn(
                    "p-3",
                    msg.isDuplicate && "opacity-50 bg-muted",
                    msg.direction === "sent" 
                      ? "border-l-4 border-l-blue-500" 
                      : "border-l-4 border-l-green-500"
                  )}
                >
                  <div className="flex items-start gap-2">
                    <Badge 
                      variant={msg.direction === "sent" ? "default" : "secondary"} 
                      className="text-xs shrink-0"
                    >
                      {msg.direction === "sent" ? (
                        <><ArrowUpRight className="h-3 w-3 mr-1" />SENT</>
                      ) : (
                        <><ArrowDownLeft className="h-3 w-3 mr-1" />RECEIVED</>
                      )}
                    </Badge>
                    {msg.isDuplicate && (
                      <Badge variant="outline" className="text-xs text-amber-600 shrink-0">
                        Duplicate - will skip
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm mt-2 whitespace-pre-wrap">{msg.content}</p>
                </Card>
              ))}
            </div>

            <DialogFooter className="flex gap-2">
              <Button variant="outline" onClick={handleReset}>
                Back
              </Button>
              <Button 
                onClick={handleConfirmParsed} 
                disabled={newMessagesCount === 0}
              >
                <Check className="h-4 w-4 mr-2" />
                Add {newMessagesCount} Message{newMessagesCount !== 1 ? "s" : ""}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          // Input form
          <>
            <Tabs value={mode} onValueChange={(v) => setMode(v as "single" | "dump")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="single">Single Message</TabsTrigger>
                <TabsTrigger value="dump">Paste Conversation</TabsTrigger>
              </TabsList>

              <TabsContent value="single" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Direction</Label>
                  <Select
                    value={direction}
                    onValueChange={(v) => setDirection(v as MessageDirection)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sent">Sent (from me)</SelectItem>
                      <SelectItem value="received">Received (from them)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Message</Label>
                  <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Enter the message content..."
                    rows={4}
                  />
                </div>
              </TabsContent>

              <TabsContent value="dump" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Paste Conversation</Label>
                  <Textarea
                    value={dumpText}
                    onChange={(e) => setDumpText(e.target.value)}
                    placeholder="Paste your entire conversation here. AI will try to parse it into individual messages..."
                    rows={8}
                  />
                  <p className="text-xs text-muted-foreground">
                    AI will parse messages and detect duplicates. Existing messages will be skipped automatically.
                  </p>
                </div>
                {parseError && (
                  <p className="text-sm text-destructive">{parseError}</p>
                )}
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              {mode === "single" ? (
                <Button onClick={handleAddSingle} disabled={!content.trim() || isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    "Add Message"
                  )}
                </Button>
              ) : (
                <Button onClick={handleParseDump} disabled={!dumpText.trim() || isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Parsing...
                    </>
                  ) : (
                    "Parse & Preview"
                  )}
                </Button>
              )}
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
