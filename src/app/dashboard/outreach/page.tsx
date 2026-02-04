"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Plus, MessageSquare, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageStepper } from "@/components/outreach/message-stepper";
import { TemplatesList } from "@/components/outreach/templates-list";
import { OutreachTemplate } from "@/types/outreach";

function ThreadsList() {
  return (
    <div className="text-center py-12">
      <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
      <h3 className="mt-4 text-lg font-semibold">No threads yet</h3>
      <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
        Threads track your ongoing conversations. Create a new message and start a thread to begin tracking.
      </p>
    </div>
  );
}

export default function OutreachPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isStepperOpen, setIsStepperOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<OutreachTemplate | null>(null);

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
          <ThreadsList />
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
