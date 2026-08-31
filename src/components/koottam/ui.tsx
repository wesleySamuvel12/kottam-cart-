"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Lightbulb, ChevronRight, Info } from "lucide-react";
import type { DataLabel } from "@/lib/koottam/data";

/* ---------- Data label badge ---------- */
export function DataLabelBadge({ label }: { label: DataLabel }) {
  const map: Record<DataLabel, string> = {
    Actual: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
    Estimated: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
    Predicted: "bg-violet-500/15 text-violet-700 dark:text-violet-300 border-violet-500/30",
    Demo: "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30",
  };
  return (
    <Badge variant="outline" className={cn("text-[10px] font-medium", map[label])}>
      {label}
    </Badge>
  );
}

/* ---------- Stat card ---------- */
export function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  accent = "emerald",
  trend,
  dataLabel,
}: {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  accent?: "emerald" | "amber" | "terracotta" | "teal" | "gold" | "violet";
  trend?: { dir: "up" | "down" | "flat"; pct: number };
  dataLabel?: DataLabel;
}) {
  const accentMap: Record<string, string> = {
    emerald: "from-emerald-500/15 to-emerald-500/0 text-emerald-700 dark:text-emerald-300",
    amber: "from-amber-500/15 to-amber-500/0 text-amber-700 dark:text-amber-300",
    terracotta: "from-orange-500/15 to-orange-500/0 text-orange-700 dark:text-orange-300",
    teal: "from-teal-500/15 to-teal-500/0 text-teal-700 dark:text-teal-300",
    gold: "from-yellow-500/15 to-yellow-500/0 text-yellow-700 dark:text-yellow-300",
    violet: "from-violet-500/15 to-violet-500/0 text-violet-700 dark:text-violet-300",
  };
  return (
    <Card className="relative overflow-hidden">
      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-60", accentMap[accent])} />
      <CardContent className="relative p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
          </div>
          {Icon && (
            <div className={cn("rounded-lg p-2 bg-background/60", accentMap[accent].split(" ").slice(-2).join(" "))}>
              <Icon className="h-5 w-5" />
            </div>
          )}
        </div>
        <div className="mt-3 flex items-center gap-2">
          {trend && (
            <span
              className={cn(
                "text-xs font-medium",
                trend.dir === "up" && "text-emerald-600 dark:text-emerald-400",
                trend.dir === "down" && "text-orange-600 dark:text-orange-400",
                trend.dir === "flat" && "text-muted-foreground"
              )}
            >
              {trend.dir === "up" ? "▲" : trend.dir === "down" ? "▼" : "—"} {Math.abs(trend.pct)}%
            </span>
          )}
          {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
          {dataLabel && <DataLabelBadge label={dataLabel} />}
        </div>
      </CardContent>
    </Card>
  );
}

/* ---------- AI Insight card (Insight → Evidence → Action) ---------- */
export function InsightCard({
  title,
  insight,
  evidence,
  action,
  icon,
  priority,
  children,
}: {
  title: string;
  insight: React.ReactNode;
  evidence?: string[];
  action?: React.ReactNode;
  icon?: React.ReactNode;
  priority?: "Critical" | "High" | "Medium" | "Low";
  children?: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  const priorityColor: Record<string, string> = {
    Critical: "bg-red-500",
    High: "bg-orange-500",
    Medium: "bg-amber-500",
    Low: "bg-emerald-500",
  };
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          {priority && <span className={cn("mt-1.5 h-2 w-2 rounded-full shrink-0", priorityColor[priority])} />}
          {icon && <div className="text-2xl leading-none">{icon}</div>}
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base leading-tight">{title}</CardTitle>
            <CardDescription className="mt-1 text-foreground/80 text-sm leading-relaxed">
              {insight}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {evidence && evidence.length > 0 && (
          <div className="rounded-md bg-muted/60 p-3">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 flex items-center gap-1">
              <Info className="h-3 w-3" /> Evidence
            </p>
            <ul className="space-y-1">
              {evidence.map((e, i) => (
                <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                  <span className="mt-1 h-1 w-1 rounded-full bg-muted-foreground/60 shrink-0" />
                  {e}
                </li>
              ))}
            </ul>
          </div>
        )}
        {action && (
          <div className="flex items-start gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/5 p-3">
            <Lightbulb className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
            <p className="text-xs text-emerald-800 dark:text-emerald-200">{action}</p>
          </div>
        )}
        {children}
        {(evidence || action) && (
          <Collapsible open={open} onOpenChange={setOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="text-xs h-7 px-2">
                <ChevronRight className={cn("h-3 w-3 transition-transform", open && "rotate-90")} />
                {open ? "Hide reasoning" : "Why this recommendation?"}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2">
              <div className="rounded-md bg-muted/40 p-3 text-xs text-muted-foreground space-y-2">
                <p><span className="font-semibold text-foreground">Why?</span> This output is generated by the Koottam AI orchestrator combining weather signals, historical demand, weekday seasonality and fulfilment reliability. It is a recommendation, not an automated decision.</p>
                <p><span className="font-semibold text-foreground">Human override:</span> Accept · Modify · Ignore.</p>
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
      </CardContent>
    </Card>
  );
}

/* ---------- Risk / status badge ---------- */
export function RiskBadge({ level }: { level: "Low" | "Medium" | "High" | "Critical" | "Healthy" | "At Risk" }) {
  const map: Record<string, string> = {
    Low: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
    Healthy: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
    Medium: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
    "At Risk": "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
    High: "bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-500/30",
    Critical: "bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/30",
  };
  return <Badge variant="outline" className={cn("text-xs", map[level])}>{level}</Badge>;
}

/* ---------- Section heading ---------- */
export function SectionHeading({
  title,
  subtitle,
  icon,
  right,
}: {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
      <div className="flex items-center gap-3">
        {icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            {icon}
          </div>
        )}
        <div>
          <h2 className="text-xl font-bold tracking-tight">{title}</h2>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      {right}
    </div>
  );
}

/* ---------- Confidence meter ---------- */
export function ConfidenceMeter({ value, label }: { value: number; label?: string }) {
  const color = value >= 85 ? "text-emerald-600" : value >= 70 ? "text-amber-600" : "text-orange-600";
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label ?? "Confidence"}</span>
        <span className={cn("font-semibold", color)}>{value}%</span>
      </div>
      <Progress value={value} className="h-1.5" />
    </div>
  );
}

/* ---------- Panel wrapper for consistent spacing ---------- */
export function Panel({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("space-y-4", className)}>{children}</div>;
}

/* ---------- Empty data note ---------- */
export function DemoNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 rounded-md border border-sky-500/30 bg-sky-500/5 p-3">
      <Info className="h-4 w-4 text-sky-600 dark:text-sky-400 mt-0.5 shrink-0" />
      <p className="text-xs text-sky-800 dark:text-sky-200">{children}</p>
    </div>
  );
}

export { Card, CardContent, CardDescription, CardHeader, CardTitle, Badge, Separator, Button };
