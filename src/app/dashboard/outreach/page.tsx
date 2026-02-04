"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OutreachTabs } from "@/components/outreach/outreach-tabs";
import { MessageStepper } from "@/components/outreach/message-stepper";

export default function OutreachPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showStepper, setShowStepper] = useState(false);

  const currentTab = searchParams.get("tab") || "threads";

  const handleTabChange = (tab: string) => {
    router.push(`/dashboard/outreach?tab=${tab}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Outreach</h1>
          <p className="text-muted-foreground">
            Generate personalized messages and track conversations
          </p>
        </div>
        <Button onClick={() => setShowStepper(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Message
        </Button>
      </div>

      <OutreachTabs currentTab={currentTab} onTabChange={handleTabChange} />

      <MessageStepper open={showStepper} onClose={() => setShowStepper(false)} />
    </div>
  );
}
