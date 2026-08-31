"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { NAV, NAV_GROUPS } from "@/components/koottam/nav";
import { LOCATIONS } from "@/lib/koottam/data";
import { ThemeToggle } from "@/components/koottam/theme-toggle";
import { CommandPalette } from "@/components/koottam/command-palette";
import { Leaf, Menu, Search, Sparkles, MapPin } from "lucide-react";

export function KoottamShell({
  active,
  onNavigate,
  locationId,
  onLocationChange,
  children,
}: {
  active: string;
  onNavigate: (id: string) => void;
  locationId: string;
  onLocationChange: (id: string) => void;
  children: React.ReactNode;
}) {
  const [cmdOpen, setCmdOpen] = React.useState(false);
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCmdOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const activeLoc = LOCATIONS.find((l) => l.id === locationId);

  const Sidebar = (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-2.5 px-4 h-16 border-b border-sidebar-border">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground shrink-0">
          <Leaf className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="font-bold text-sm leading-tight">Koottam Cart</p>
          <p className="text-[10px] text-sidebar-foreground/60 leading-tight">AI Community Commerce</p>
        </div>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto koottam-sidebar-scroll">
        <nav className="px-2 py-3 space-y-4">
          {NAV_GROUPS.map((group) => (
            <div key={group}>
              <p className="px-2 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/50">
                {group}
              </p>
              <div className="space-y-0.5">
                {NAV.filter((n) => n.group === group).map((item) => {
                  const Icon = item.icon;
                  const isActive = active === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onNavigate(item.id);
                        setMobileNavOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors text-left group",
                        isActive
                          ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium shadow-sm"
                          : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="flex-1 truncate">{item.label}</span>
                      {isActive && <Sparkles className="h-3 w-3 opacity-70" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>
      <div className="border-t border-sidebar-border p-3">
        <div className="rounded-lg bg-sidebar-accent/60 p-2.5">
          <p className="text-[10px] font-semibold text-sidebar-foreground/70 uppercase tracking-wide">Live Pilot</p>
          <p className="text-xs text-sidebar-foreground/80 mt-0.5">Madurai • 300 households</p>
          <div className="mt-1.5 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] text-sidebar-foreground/60">AI orchestrator active</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      {/* Top bar */}
      <header className="shrink-0 z-40 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center gap-2 px-4">
          <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              {Sidebar}
            </SheetContent>
          </Sheet>

          <div className="flex items-center gap-2 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Leaf className="h-4 w-4" />
            </div>
            <span className="font-bold text-sm">Koottam Cart</span>
          </div>

          <div className="hidden lg:flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setCmdOpen(true)} className="w-72 justify-start text-muted-foreground">
              <Search className="h-4 w-4 mr-2" />
              <span className="flex-1 text-left">Search or ask AI…</span>
              <kbd className="pointer-events-none select-none rounded border bg-muted px-1.5 font-mono text-[10px] text-muted-foreground">
                ⌘K
              </kbd>
            </Button>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-primary" />
              <select
                value={locationId}
                onChange={(e) => onLocationChange(e.target.value)}
                className="bg-transparent text-sm font-medium outline-none cursor-pointer pr-1"
              >
                {LOCATIONS.map((l) => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </Button>
            <Badge variant="outline" className="hidden sm:flex gap-1 text-xs border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              {activeLoc?.ta ?? "மதுரை"}
            </Badge>
            <ThemeToggle />
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setCmdOpen(true)}>
              <Search className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <CommandPalette
        open={cmdOpen}
        onOpenChange={setCmdOpen}
        onNavigate={(id) => {
          onNavigate(id);
          setCmdOpen(false);
        }}
      />

      {/* Body — fills viewport; main scrolls internally so footer always sticks to bottom */}
      <div className="flex flex-1 min-h-0">
        <aside className="hidden lg:block w-64 shrink-0 border-r overflow-hidden">
          {Sidebar}
        </aside>
        <main className="flex-1 min-w-0 overflow-y-auto koottam-scroll">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>

      {/* Footer — always pinned to bottom (shrink-0 in the column) */}
      <footer className="shrink-0 border-t bg-background">
        <div className="mx-auto max-w-7xl px-4 py-2.5 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-1 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Leaf className="h-3.5 w-3.5 text-primary" />
            <span className="font-medium text-foreground">Koottam Cart</span>
            <span className="hidden sm:inline">— AI that coordinates the entire community market.</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Weather → Demand → Farming → Supply → Logistics → Payments
            </span>
            <span className="hidden md:inline">Demo data • Tamil Nadu</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
