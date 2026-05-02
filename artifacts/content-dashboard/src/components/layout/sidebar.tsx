import { Link, useLocation } from "wouter";
import { LayoutDashboard, Library, CalendarDays, LineChart, Tags, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Content", href: "/content", icon: Library },
  { name: "Calendar", href: "/calendar", icon: CalendarDays },
  { name: "Analytics", href: "/analytics", icon: LineChart },
  { name: "Categories", href: "/categories", icon: Tags },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-sidebar border-r border-sidebar-border text-sidebar-foreground flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-sidebar-border">
        <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-bold font-mono text-lg mr-3 shadow-md">
          C
        </div>
        <span className="font-semibold tracking-tight text-lg">CmdCenter</span>
      </div>
      
      <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-1">
        <div className="mb-4">
          <p className="px-2 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50 mb-2">
            Main
          </p>
          <div className="flex flex-col gap-1">
            {navigation.map((item) => {
              const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200",
                    isActive 
                      ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm" 
                      : "hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
      
      <div className="p-4 border-t border-sidebar-border">
        <Link
          href="/content/new"
          className="flex items-center justify-center gap-2 w-full bg-primary hover:bg-primary/90 text-primary-foreground py-2.5 px-4 rounded-md text-sm font-semibold transition-colors shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          Create Content
        </Link>
      </div>
    </aside>
  );
}
