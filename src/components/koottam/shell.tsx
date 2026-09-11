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
import { OrderNotifier } from "./order-notifier";
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
      <OrderNotifier onNavigate={onNavigate} />
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
      <footer className="shrink-0 border-t bg-background relative">
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

      {/* Floating WhatsApp Action Button */}
      <a
        href="https://wa.me/919942445964?text=Hi%20KottamCart%2C%20I%20want%20to%20place%20an%20order"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Order on WhatsApp"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white p-3 sm:px-4 sm:py-3 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group border border-emerald-400/30"
      >
        <div className="relative flex items-center justify-center">
          <span className="absolute -inset-1 rounded-full bg-white/30 animate-ping opacity-75" />
          <svg
            className="h-6 w-6 fill-current relative z-10"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 448 512"
          >
            <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3 18.6-68.1-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
          </svg>
        </div>
        <span className="font-semibold text-sm hidden sm:inline-block">Order on WhatsApp</span>
        <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full font-mono hidden md:inline-block">
          Live
        </span>
      </a>
    </div>
  );
}
