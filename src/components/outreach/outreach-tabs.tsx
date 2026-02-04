"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, FileText } from "lucide-react";
import { EmptyState } from "./empty-state";

interface OutreachTabsProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export function OutreachTabs({ currentTab, onTabChange }: OutreachTabsProps) {
  return (
    <Tabs value={currentTab} onValueChange={onTabChange}>
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
        <EmptyState
          icon={MessageSquare}
          title="No conversation threads yet"
          description="Start a thread after generating a message to track your outreach conversations."
        />
      </TabsContent>

      <TabsContent value="templates" className="mt-6">
        <EmptyState
          icon={FileText}
          title="No saved templates"
          description="Save generated messages as templates to reuse them later."
        />
      </TabsContent>
    </Tabs>
  );
}
