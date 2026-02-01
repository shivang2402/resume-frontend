"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { sectionsAPI, Section } from "@/lib/api";
import { ArrowLeft, Save, History, Trash2 } from "lucide-react";

export default function SectionEditPage() {
  const params = useParams();
  const type = decodeURIComponent(params.type as string);
  const key = decodeURIComponent(params.key as string);
  const flavor = decodeURIComponent(params.flavor as string);

  const [versions, setVersions] = useState<Section[]>([]);
  const [current, setCurrent] = useState<Section | null>(null);
  const [content, setContent] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await sectionsAPI.getVersions(type, key, flavor);
        setVersions(data);
        const currentVersion = data.find(v => v.is_current) || data[0];
        setCurrent(currentVersion);
        setContent(currentVersion?.content || {});
      } catch (error) {
        console.error("Failed to fetch section:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [type, key, flavor]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await sectionsAPI.update(type, key, flavor, { content });
      setVersions(prev => [updated, ...prev.map(v => ({ ...v, is_current: false }))]);
      setCurrent(updated);
      alert(`Saved as version ${updated.version}`);
    } catch (error) {
      console.error("Failed to save:", error);
      alert("Failed to save section");
    } finally {
      setSaving(false);
    }
  };

  const handleContentChange = (field: string, value: any) => {
    setContent(prev => ({ ...prev, [field]: value }));
  };

  const handleBulletChange = (index: number, value: string) => {
    const bullets = [...(content.bullets || [])];
    bullets[index] = value;
    setContent(prev => ({ ...prev, bullets }));
  };

  const addBullet = () => {
    setContent(prev => ({ ...prev, bullets: [...(prev.bullets || []), ""] }));
  };

  const removeBullet = (index: number) => {
    const bullets = [...(content.bullets || [])];
    bullets.splice(index, 1);
    setContent(prev => ({ ...prev, bullets }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!current) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Section not found</p>
        <Button variant="link" asChild>
          <Link href="/dashboard/content">Back to Content Library</Link>
        </Button>
      </div>
    );
  }

  const isExperience = type === "experience";
  const isProject = type === "project";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/content">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{key}</h1>
            <p className="text-muted-foreground">
              {type} • {flavor} • <Badge variant="secondary">v{current.version}</Badge>
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" disabled>
            <History className="h-4 w-4 mr-2" />
            {versions.length} versions
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isExperience && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input
                        value={content.title || ""}
                        onChange={(e) => handleContentChange("title", e.target.value)}
                        placeholder="Software Engineer"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Company</Label>
                      <Input
                        value={content.company || ""}
                        onChange={(e) => handleContentChange("company", e.target.value)}
                        placeholder="Google"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Location</Label>
                      <Input
                        value={content.location || ""}
                        onChange={(e) => handleContentChange("location", e.target.value)}
                        placeholder="San Francisco, CA"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Dates</Label>
                      <Input
                        value={content.dates || ""}
                        onChange={(e) => handleContentChange("dates", e.target.value)}
                        placeholder="Jan 2024 -- Present"
                      />
                    </div>
                  </div>
                </>
              )}

              {isProject && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Project Name</Label>
                      <Input
                        value={content.name || ""}
                        onChange={(e) => handleContentChange("name", e.target.value)}
                        placeholder="Resume Forge"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Technologies</Label>
                      <Input
                        value={content.tech || ""}
                        onChange={(e) => handleContentChange("tech", e.target.value)}
                        placeholder="React, Python, PostgreSQL"
                      />
                    </div>
                  </div>
                </>
              )}

              {(isExperience || isProject) && (
                <div className="space-y-2">
                  <Label>Bullet Points</Label>
                  {(content.bullets || []).map((bullet: string, index: number) => (
                    <div key={index} className="flex gap-2">
                      <Textarea
                        value={bullet}
                        onChange={(e) => handleBulletChange(index, e.target.value)}
                        placeholder="Describe your achievement..."
                        className="min-h-[60px]"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeBullet(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={addBullet}>
                    Add Bullet
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Version History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {versions.map((version) => (
                  <div
                    key={version.id}
                    className={`p-3 rounded-md border cursor-pointer transition-colors ${
                      version.id === current.id
                        ? "border-primary bg-primary/5"
                        : "hover:bg-muted"
                    }`}
                    onClick={() => {
                      setCurrent(version);
                      setContent(version.content);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">v{version.version}</span>
                      {version.is_current && (
                        <Badge variant="secondary" className="text-xs">Current</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(version.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
