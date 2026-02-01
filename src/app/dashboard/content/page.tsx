"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { sectionsAPI, Section } from "@/lib/api";
import { Plus, FileText, Briefcase, FolderOpen, Award } from "lucide-react";

const typeIcons: Record<string, any> = {
  experience: Briefcase,
  project: FolderOpen,
  skills: Award,
  education: FileText,
};

const typeLabels: Record<string, string> = {
  experience: "Experiences",
  project: "Projects",
  skills: "Skills",
  education: "Education",
};

export default function ContentPage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await sectionsAPI.list();
        setSections(data);
      } catch (error) {
        console.error("Failed to fetch sections:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  // Group sections by type
  const sectionsByType = sections.reduce((acc, section) => {
    if (!acc[section.type]) {
      acc[section.type] = [];
    }
    acc[section.type].push(section);
    return acc;
  }, {} as Record<string, Section[]>);

  // Get unique types
  const types = Object.keys(sectionsByType);

  // Filter sections based on active tab
  const filteredSections = activeTab === "all" 
    ? sections 
    : sections.filter(s => s.type === activeTab);

  // Group filtered sections by key+flavor for display
  const groupedSections = filteredSections.reduce((acc, section) => {
    const groupKey = `${section.type}:${section.key}:${section.flavor}`;
    if (!acc[groupKey]) {
      acc[groupKey] = [];
    }
    acc[groupKey].push(section);
    return acc;
  }, {} as Record<string, Section[]>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Content Library</h1>
          <p className="text-muted-foreground">Manage your resume sections</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Section
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All ({sections.length})</TabsTrigger>
          {types.map(type => (
            <TabsTrigger key={type} value={type}>
              {typeLabels[type] || type} ({sectionsByType[type].length})
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {Object.keys(groupedSections).length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No content yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first section to get started
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Section
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(groupedSections).map(([groupKey, versions]) => {
                const current = versions.find(v => v.is_current) || versions[0];
                const Icon = typeIcons[current.type] || FileText;
                
                return (
                  <Card key={groupKey} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-md bg-primary/10">
                            <Icon className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-base">{current.key}</CardTitle>
                            <p className="text-xs text-muted-foreground">
                              {current.type} • {current.flavor}
                            </p>
                          </div>
                        </div>
                        {current.is_current && (
                          <Badge variant="secondary" className="text-xs">
                            v{current.version}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-muted-foreground">
                        {current.type === "experience" && current.content.title && (
                          <p className="truncate">{current.content.title} @ {current.content.company}</p>
                        )}
                        {current.type === "project" && current.content.name && (
                          <p className="truncate">{current.content.name}</p>
                        )}
                        {current.type === "skills" && (
                          <p className="truncate">Skills section</p>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t">
                        <span className="text-xs text-muted-foreground">
                          {versions.length} version{versions.length > 1 ? "s" : ""}
                        </span>
                        <Button variant="ghost" size="sm">
                          Edit
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}