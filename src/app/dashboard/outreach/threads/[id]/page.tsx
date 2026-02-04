"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { outreachApi } from "@/lib/api/outreach";
import { ThreadHeader } from "@/components/outreach/thread-header";
import { ThreadTimeline } from "@/components/outreach/thread-timeline";
import { ReplyGenerator } from "@/components/outreach/reply-generator";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ThreadDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();

  const { data: thread, isLoading, error } = useQuery({
    queryKey: ["outreach-thread", id],
    queryFn: () => outreachApi.threads.get(id),
  });

  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ["outreach-messages", id],
    queryFn: () => outreachApi.getMessages(id),
    enabled: !!thread,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !thread) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.push("/dashboard/outreach")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Threads
        </Button>
        <div className="text-center py-12 text-muted-foreground">
          Thread not found
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => router.push("/dashboard/outreach")}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Threads
      </Button>

      <ThreadHeader thread={thread} />

      <ThreadTimeline 
        threadId={id} 
        messages={messages} 
        isLoading={messagesLoading} 
      />

      <ReplyGenerator threadId={id} />
    </div>
  );
}
