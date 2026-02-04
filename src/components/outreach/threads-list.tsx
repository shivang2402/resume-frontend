"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { outreachApi } from "@/lib/api/outreach";
import { OutreachThread } from "@/types/outreach";
import { ThreadItem } from "./thread-item";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Search, Loader2, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThreadsListProps {
  onSelectThread: (thread: OutreachThread) => void;
  selectedThreadId?: string;
}

export function ThreadsList({ onSelectThread, selectedThreadId }: ThreadsListProps) {
  const [filter, setFilter] = useState<"active" | "all">("active");
  const [search, setSearch] = useState("");
  const [expandedCompanies, setExpandedCompanies] = useState<Set<string>>(new Set());
  const queryClient = useQueryClient();

  const { data: threads = [], isLoading } = useQuery({
    queryKey: ["outreach-threads", filter],
    queryFn: () => outreachApi.getThreads(filter === "active" ? { active_only: true } : {}),
  });

  const deleteMutation = useMutation({
    mutationFn: outreachApi.deleteThread,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["outreach-threads"] });
    },
  });

  const filteredThreads = threads.filter((thread) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      thread.company.toLowerCase().includes(q) ||
      thread.contact_name?.toLowerCase().includes(q) ||
      thread.contact_method?.toLowerCase().includes(q)
    );
  });

  // Group threads by company
  const groupedThreads = filteredThreads.reduce<Record<string, OutreachThread[]>>(
    (acc, thread) => {
      const company = thread.company;
      if (!acc[company]) acc[company] = [];
      acc[company].push(thread);
      return acc;
    },
    {}
  );

  const sortedCompanies = Object.keys(groupedThreads).sort((a, b) =>
    a.localeCompare(b)
  );

  // Auto-expand all companies on first load
  useEffect(() => {
    if (sortedCompanies.length > 0 && expandedCompanies.size === 0) {
      setExpandedCompanies(new Set(sortedCompanies));
    }
  }, [sortedCompanies.length]);

  const toggleCompany = (company: string) => {
    setExpandedCompanies((prev) => {
      const next = new Set(prev);
      if (next.has(company)) {
        next.delete(company);
      } else {
        next.add(company);
      }
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by company or contact..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Tabs value={filter} onValueChange={(v) => setFilter(v as "active" | "all")}>
          <TabsList>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {sortedCompanies.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          {search ? "No threads match your search" : "No outreach threads yet"}
        </div>
      ) : (
        <div className="space-y-2">
          {sortedCompanies.map((company) => (
            <Collapsible
              key={company}
              open={expandedCompanies.has(company)}
              onOpenChange={() => toggleCompany(company)}
            >
              <CollapsibleTrigger className="flex items-center gap-2 w-full p-2 hover:bg-muted/50 rounded-md transition-colors">
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-muted-foreground transition-transform",
                    !expandedCompanies.has(company) && "-rotate-90"
                  )}
                />
                <span className="font-medium">{company}</span>
                <span className="text-sm text-muted-foreground">
                  ({groupedThreads[company].length} thread{groupedThreads[company].length !== 1 ? "s" : ""})
                </span>
              </CollapsibleTrigger>
              <CollapsibleContent className="pl-6 space-y-2 mt-2">
                {groupedThreads[company].map((thread) => (
                  <ThreadItem
                    key={thread.id}
                    thread={thread}
                    isSelected={thread.id === selectedThreadId}
                    onSelect={() => onSelectThread(thread)}
                    onDelete={() => deleteMutation.mutate(thread.id)}
                    isDeleting={deleteMutation.isPending && deleteMutation.variables === thread.id}
                  />
                ))}
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      )}
    </div>
  );
}
