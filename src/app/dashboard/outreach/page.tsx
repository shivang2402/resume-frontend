"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Plus, MessageSquare, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageStepper } from "@/components/outreach/message-stepper";
import { TemplatesList } from "@/components/outreach/templates-list";
import { ThreadsList } from "@/components/outreach/threads-list";
import { OutreachTemplate, OutreachThread } from "@/types/outreach";

export default function OutreachPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isStepperOpen, setIsStepperOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<OutreachTemplate | null>(null);
  const [selectedThreadId, setSelectedThreadId] = useState<string | undefined>();

  const currentTab = searchParams.get("tab") || "threads";

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", value);
    router.push(`/dashboard/outreach?${params.toString()}`);
  };

  const handleNewMessage = () => {
    setSelectedTemplate(null);
    setIsStepperOpen(true);
  };

  const handleUseTemplate = (template: OutreachTemplate) => {
    setSelectedTemplate(template);
    setIsStepperOpen(true);
  };

  const handleStepperClose = () => {
    setIsStepperOpen(false);
    setSelectedTemplate(null);
  };

  const handleSelectThread = (thread: OutreachThread) => {
    router.push(`/dashboard/outreach/threads/${thread.id}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cold Outreach</h1>
          <p className="text-muted-foreground">Generate personalized outreach messages and track conversations</p>
        </div>
        <Button onClick={handleNewMessage}>
          <Plus className="mr-2 h-4 w-4" />
          New Message
        </Button>
      </div>

      <Tabs value={currentTab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="threads" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            Threads
          </TabsTrigger>
          <TabsTrigger value="templates" className="gap-2">
            <FileText className="h-4 w-4" />
            Templates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="threads" className="mt-6">
          <ThreadsList 
            onSelectThread={handleSelectThread}
            selectedThreadId={selectedThreadId}
          />
        </TabsContent>

        <TabsContent value="templates" className="mt-6">
          <TemplatesList onUseTemplate={handleUseTemplate} />
        </TabsContent>
      </Tabs>

      <MessageStepper
        open={isStepperOpen}
        onClose={handleStepperClose}
      />
    </div>
  );
}
