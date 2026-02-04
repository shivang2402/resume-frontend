"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { OutreachThread } from "@/types/outreach";
import { outreachApi } from "@/lib/api/outreach";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Pencil, User, Building2, Linkedin, Mail, HelpCircle } from "lucide-react";

interface ThreadHeaderProps {
  thread: OutreachThread;
}

const contactMethodIcons = {
  linkedin: Linkedin,
  email: Mail,
  other: HelpCircle,
};

export function ThreadHeader({ thread }: ThreadHeaderProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [contactName, setContactName] = useState(thread.contact_name || "");
  const [contactMethod, setContactMethod] = useState(thread.contact_method || "");
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: (data: { contact_name?: string; contact_method?: string }) =>
      outreachApi.updateThread(thread.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["outreach-thread", thread.id] });
      setEditOpen(false);
    },
  });

  const handleSave = () => {
    updateMutation.mutate({
      contact_name: contactName || undefined,
      contact_method: contactMethod || undefined,
    });
  };

  const ContactIcon = thread.contact_method
    ? contactMethodIcons[thread.contact_method as keyof typeof contactMethodIcons]
    : null;

  const displayName = thread.contact_name || "Unknown Contact";

  return (
    <>
      <Card className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-muted-foreground" />
              <h1 className="text-xl font-semibold">{displayName}</h1>
              <span className="text-muted-foreground">@</span>
              <div className="flex items-center gap-1">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-lg">{thread.company}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              {ContactIcon && (
                <div className="flex items-center gap-1">
                  <ContactIcon className="h-4 w-4" />
                  <span className="capitalize">{thread.contact_method}</span>
                </div>
              )}
              {thread.application_ids && thread.application_ids.length > 0 && (
                <span>
                  Linked to {thread.application_ids.length} application
                  {thread.application_ids.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={thread.is_active ? "default" : "secondary"}>
              {thread.is_active ? "Active" : "Inactive"}
            </Badge>
            <Button variant="ghost" size="icon" onClick={() => setEditOpen(true)}>
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Thread</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="contactName">Contact Name</Label>
              <Input
                id="contactName"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="John Smith"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactMethod">Contact Method</Label>
              <Select value={contactMethod} onValueChange={setContactMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
