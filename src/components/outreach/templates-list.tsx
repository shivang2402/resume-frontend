"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FileText, Plus, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { outreachApi } from "@/lib/api/outreach";
import { OutreachTemplate } from "@/types/outreach";
import { TemplateCard } from "./template-card";
import { TemplateEditModal } from "./template-edit-modal";

interface TemplatesListProps {
  onUseTemplate: (template: OutreachTemplate) => void;
}

type GroupedTemplates = Record<string, OutreachTemplate[]>;

function groupTemplates(templates: OutreachTemplate[]): GroupedTemplates {
  return templates.reduce((acc, template) => {
    const styleLabel = template.style.charAt(0).toUpperCase() + template.style.slice(1).replace("_", " ");
    const lengthLabel = template.length.charAt(0).toUpperCase() + template.length.slice(1);
    const key = `${styleLabel} - ${lengthLabel}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(template);
    return acc;
  }, {} as GroupedTemplates);
}

export function TemplatesList({ onUseTemplate }: TemplatesListProps) {
  const queryClient = useQueryClient();
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [editingTemplate, setEditingTemplate] = useState<OutreachTemplate | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { data: templates, isLoading, error } = useQuery({
    queryKey: ["outreach-templates"],
    queryFn: () => outreachApi.templates.list(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => outreachApi.templates.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["outreach-templates"] }),
  });

  const toggleGroup = (group: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(group)) next.delete(group);
      else next.add(group);
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Failed to load templates</p>
        <Button variant="outline" className="mt-4" onClick={() => queryClient.invalidateQueries({ queryKey: ["outreach-templates"] })}>
          Retry
        </Button>
      </div>
    );
  }

  const grouped = groupTemplates(templates || []);
  const sortedGroups = Object.keys(grouped).sort();

  if (sortedGroups.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">No templates yet</h3>
        <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
          Templates are created when you save a generated message. Generate a cold outreach message and click "Save as Template" to create your first template.
        </p>
        <Button className="mt-6" onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Template Manually
        </Button>
        <TemplateEditModal open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen} template={null} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{templates?.length} template{templates?.length !== 1 ? "s" : ""} saved</p>
        <Button size="sm" variant="outline" onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Template
        </Button>
      </div>

      {sortedGroups.map((group) => {
        const isCollapsed = collapsedGroups.has(group);
        const groupTemplates = grouped[group];
        return (
          <div key={group} className="border rounded-lg">
            <button onClick={() => toggleGroup(group)} className="flex items-center justify-between w-full px-4 py-3 hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-2">
                {isCollapsed ? <ChevronRight className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                <span className="font-medium">{group}</span>
                <span className="text-sm text-muted-foreground">({groupTemplates.length})</span>
              </div>
            </button>
            {!isCollapsed && (
              <div className="px-4 pb-4 space-y-3">
                {groupTemplates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    onUse={() => onUseTemplate(template)}
                    onEdit={() => setEditingTemplate(template)}
                    onDelete={() => deleteMutation.mutate(template.id)}
                    isDeleting={deleteMutation.isPending}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}

      <TemplateEditModal open={!!editingTemplate} onOpenChange={(open) => !open && setEditingTemplate(null)} template={editingTemplate} />
      <TemplateEditModal open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen} template={null} />
    </div>
  );
}
