"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, MessageSquare, FileText } from "lucide-react";

export default function OutreachPage() {
  const [activeTab, setActiveTab] = useState("threads");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Cold Outreach</h1>
          <p className="text-muted-foreground">
            Generate personalized messages and track conversations
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Message
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="threads" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Threads
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Templates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="threads" className="mt-6">
          <div className="rounded-lg border border-dashed p-12 text-center">
            <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No threads yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Start a conversation by generating a new message
            </p>
            <Button className="mt-4" variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              New Thread
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="mt-6">
          <div className="rounded-lg border border-dashed p-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No templates yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Save generated messages as templates for reuse
            </p>
            <Button className="mt-4" variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Create Template
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
