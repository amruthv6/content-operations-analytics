import { ReactNode } from "react";
import { Sidebar } from "./sidebar";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[100dvh] w-full bg-background flex">
      <Sidebar />
      <main className="flex-1 ml-64 flex flex-col relative overflow-hidden">
        <div className="h-16 flex items-center px-8 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10 shrink-0">
          {/* Header area could be used for global search or user profile */}
          <div className="ml-auto flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center border border-border">
              <span className="text-xs font-bold">JD</span>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-8 relative">
          {children}
        </div>
      </main>
    </div>
  );
}
