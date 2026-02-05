"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  FileText, 
  Briefcase, 
  Download,
  LogOut,
  User,
  MessageSquare,
  Sparkles,
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Toaster } from "sonner";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/content", label: "Content Library", icon: FileText },
  { href: "/dashboard/applications", label: "Applications", icon: Briefcase },
  { href: "/dashboard/generate", label: "Generate Resume", icon: Download },
  { href: "/dashboard/jd-matcher", label: "JD Matcher", icon: Sparkles },
  { href: "/dashboard/outreach", label: "Outreach", icon: MessageSquare },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card flex flex-col">
        <div className="p-6">
          <Link href="/" className="block">
            <h2 className="text-xl font-bold">Resume Forge</h2>
          </Link>
        </div>
        
        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User section at bottom */}
        <div className="p-4 border-t">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">Test User</p>
              <p className="text-xs text-muted-foreground truncate">test@example.com</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="w-full mt-2 justify-start" asChild>
            <Link href="/">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Link>
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 bg-muted/30 overflow-auto">
        {children}
      </main>
      
      <Toaster position="top-right" />
    </div>
  );
}
