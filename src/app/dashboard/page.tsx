"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { sectionsAPI, applicationsAPI, Section, Application } from "@/lib/api";
import { FileText, Briefcase, Download, Plus, ArrowRight } from "lucide-react";

export default function DashboardPage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [sectionsData, appsData] = await Promise.all([
          sectionsAPI.list(),
          applicationsAPI.list(),
        ]);
        setSections(sectionsData);
        setApplications(appsData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
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

  const recentSections = sections.slice(0, 5);
  const recentApps = applications.slice(0, 5);

  const statusColors: Record<string, string> = {
    applied: "bg-blue-100 text-blue-800",
    phone_screen: "bg-yellow-100 text-yellow-800",
    interview: "bg-purple-100 text-purple-800",
    offer: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's your overview.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Content Sections
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{sections.length}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {sections.filter(s => s.is_current).length} current versions
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Applications
            </CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{applications.length}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {applications.filter(a => a.status === "applied").length} pending response
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Resumes Generated
            </CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{applications.length}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Unique configurations
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Button asChild>
            <Link href="/dashboard/generate">
              <Download className="h-4 w-4 mr-2" />
              Generate Resume
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard/content">
              <Plus className="h-4 w-4 mr-2" />
              Add Content
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard/applications">
              <Briefcase className="h-4 w-4 mr-2" />
              Log Application
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sections */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent Content</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/content">
                View all <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentSections.length === 0 ? (
              <p className="text-sm text-muted-foreground">No content yet.</p>
            ) : (
              <div className="space-y-3">
                {recentSections.map((section) => (
                  <div
                    key={section.id}
                    className="flex items-center justify-between py-2 border-b last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium">{section.key}</p>
                      <p className="text-xs text-muted-foreground">
                        {section.type} • {section.flavor} • v{section.version}
                      </p>
                    </div>
                    {section.is_current && (
                      <Badge variant="secondary">Current</Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Applications */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent Applications</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/applications">
                View all <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentApps.length === 0 ? (
              <p className="text-sm text-muted-foreground">No applications yet.</p>
            ) : (
              <div className="space-y-3">
                {recentApps.map((app) => (
                  <div
                    key={app.id}
                    className="flex items-center justify-between py-2 border-b last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium">{app.company}</p>
                      <p className="text-xs text-muted-foreground">{app.role}</p>
                    </div>
                    <Badge className={statusColors[app.status] || "bg-gray-100 text-gray-800"}>
                      {app.status.replace("_", " ")}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}