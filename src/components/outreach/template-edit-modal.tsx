"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { outreachApi } from "@/lib/api/outreach";
import { OutreachTemplate } from "@/types/outreach";

const schema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  content: z.string().min(10, "Content must be at least 10 characters"),
  style: z.enum(["professional", "semi_formal", "casual", "friend"]),
  length: z.enum(["short", "long"]),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: OutreachTemplate | null;
}

export function TemplateEditModal({ open, onOpenChange, template }: Props) {
  const queryClient = useQueryClient();
  const isEditing = !!template;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", content: "", style: "professional", length: "short" },
  });

  useEffect(() => {
    if (template) {
      form.reset({ name: template.name, content: template.content, style: template.style, length: template.length });
    } else {
      form.reset({ name: "", content: "", style: "professional", length: "short" });
    }
  }, [template, form]);

  const createMutation = useMutation({
    mutationFn: (data: FormValues) => outreachApi.templates.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["outreach-templates"] }); onOpenChange(false); form.reset(); },
  });

  const isPending = createMutation.isPending;

  const onSubmit = (values: FormValues) => {
    // Note: Update not implemented in API yet, only create
    createMutation.mutate(values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Template" : "Create Template"}</DialogTitle>
          <DialogDescription>{isEditing ? "Update your template details." : "Create a new message template."}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl><Input placeholder="e.g., LinkedIn Recruiter Intro" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="style" render={({ field }) => (
                <FormItem>
                  <FormLabel>Style</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="semi_formal">Semi-formal</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="friend">Friend</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="length" render={({ field }) => (
                <FormItem>
                  <FormLabel>Length</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="short">Short (~300)</SelectItem>
                      <SelectItem value="long">Long (~600)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <FormField control={form.control} name="content" render={({ field }) => (
              <FormItem>
                <FormLabel>Content</FormLabel>
                <FormControl><Textarea placeholder="Enter template content..." className="min-h-[150px]" {...field} /></FormControl>
                <div className="flex justify-between">
                  <FormMessage />
                  <span className="text-xs text-muted-foreground">{field.value?.length || 0} chars</span>
                </div>
              </FormItem>
            )} />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>Cancel</Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? "Save" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
