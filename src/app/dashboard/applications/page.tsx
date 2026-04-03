"use client";
import Link from "next/link";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { applicationsAPI, Application } from "@/lib/api";
import { ExternalLink, Briefcase, ChevronDown, Check } from "lucide-react";
import { toast } from "sonner";
import { LogApplicationDialog } from "@/components/log-application-dialog";

const statusColors: Record<string, string> = {
  applied: "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200",
  oa: "bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200",
  phone_screen: "bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200",
  technical: "bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200",
  interview: "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200",
  onsite: "bg-cyan-100 dark:bg-cyan-900 text-cyan-800 dark:text-cyan-200",
  offer: "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200",
  rejected: "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200",
  ghosted: "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400",
  withdrawn: "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200",
};

const statusLabels: Record<string, string> = {
  applied: "Applied",
  oa: "OA",
  phone_screen: "Phone Screen",
  technical: "Technical",
  interview: "Interview",
  onsite: "Onsite",
  offer: "Offer",
  rejected: "Rejected",
  ghosted: "Ghosted",
  withdrawn: "Withdrawn",
};

const ALL_STATUSES = ["applied", "oa", "phone_screen", "technical", "interview", "onsite", "offer", "rejected", "ghosted", "withdrawn"];

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  const fetchData = async () => {
    try {
      const data = await applicationsAPI.list();
      setApplications(data);
    } catch (error) {
      console.error("Failed to fetch applications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await applicationsAPI.update(id, { status: newStatus });
      setApplications((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
      );
      toast.success(`Status updated to ${statusLabels[newStatus] || newStatus}`);
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error("Failed to update status");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const statusCounts = applications.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const filteredApps =
    activeTab === "all"
      ? applications
      : applications.filter((a) => a.status === activeTab);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Applications</h1>
          <p className="text-muted-foreground">Track your job applications</p>
        </div>
        <LogApplicationDialog onSuccess={fetchData} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-2xl font-bold">{applications.length}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </CardContent>
        </Card>
        {Object.entries(statusLabels).map(([status, label]) => (
          <Card key={status}>
            <CardContent className="pt-4 pb-4">
              <p className="text-2xl font-bold">{statusCounts[status] || 0}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {applications.length > 0 && (
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground px-1">
          {(
            [
              ["applied", "phone_screen"],
              ["applied", "oa"],
              ["oa", "phone_screen"],
              ["phone_screen", "technical"],
              ["technical", "onsite"],
              ["onsite", "offer"],
            ] as [string, string][]
          ).map(([from, to]) => {
            const fromCount = statusCounts[from] || 0;
            const toCount = statusCounts[to] || 0;
            if (fromCount === 0 && toCount === 0) return null;
            const rate = fromCount > 0 ? `${Math.round((toCount / fromCount) * 100)}%` : "—";
            return (
              <span key={`${from}-${to}`}>
                {statusLabels[from]} → {statusLabels[to]}: <strong>{rate}</strong>
              </span>
            );
          })}
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="all">All ({applications.length})</TabsTrigger>
          <TabsTrigger value="applied">Applied ({statusCounts["applied"] || 0})</TabsTrigger>
          <TabsTrigger value="oa">OA ({statusCounts["oa"] || 0})</TabsTrigger>
          <TabsTrigger value="phone_screen">Phone Screen ({statusCounts["phone_screen"] || 0})</TabsTrigger>
          <TabsTrigger value="technical">Technical ({statusCounts["technical"] || 0})</TabsTrigger>
          <TabsTrigger value="onsite">Onsite ({statusCounts["onsite"] || 0})</TabsTrigger>
          <TabsTrigger value="offer">Offer ({statusCounts["offer"] || 0})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({statusCounts["rejected"] || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {filteredApps.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No applications yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start tracking your job applications
                </p>
                <LogApplicationDialog onSuccess={fetchData} />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Applied</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApps.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell className="font-medium">{app.company}</TableCell>
                      <TableCell>{app.role}</TableCell>
                      <TableCell>{app.location || "-"}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="cursor-pointer focus:outline-none">
                              <Badge className={`${statusColors[app.status] || "bg-gray-100 text-gray-800"} gap-1`}>
                                {statusLabels[app.status] || app.status}
                                <ChevronDown className="h-3 w-3" />
                              </Badge>
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start">
                            {ALL_STATUSES.map((s) => (
                              <DropdownMenuItem
                                key={s}
                                onClick={() => handleStatusChange(app.id, s)}
                                className="flex items-center justify-between gap-4"
                              >
                                <div className="flex items-center gap-2">
                                  <span className={`inline-block h-2 w-2 rounded-full ${statusColors[s]?.split(" ")[0] || "bg-gray-100"}`} />
                                  {statusLabels[s] || s}
                                </div>
                                {app.status === s && <Check className="h-4 w-4" />}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                      <TableCell>{new Date(app.applied_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {app.job_url && (
                            <a href={app.job_url} target="_blank" rel="noopener noreferrer">
                              <Button variant="ghost" size="sm">
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </a>
                          )}
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/dashboard/applications/${app.id}`}>View</Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
