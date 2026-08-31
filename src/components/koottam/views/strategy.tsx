"use client";

import * as React from "react";
import {
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";
import {
  Target,
  HeartHandshake,
  MapPinned,
  FileText,
  HelpCircle,
  Send,
  MapPin,
  Download,
  TrendingUp,
  Users,
  Sprout,
  Recycle,
  Route,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import {
  PILOT,
  IMPACT,
  EXPANSION,
  LOCATIONS,
  inr,
} from "@/lib/koottam/data";
import {
  StatCard,
  InsightCard,
  RiskBadge,
  SectionHeading,
  ConfidenceMeter,
  DataLabelBadge,
  Panel,
  DemoNote,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Separator,
  Button,
} from "@/components/koottam/ui";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

/* ====================== MADURAI PILOT AI ====================== */
export function PilotView() {
  const metrics = [
    { label: "Customer Savings", target: PILOT.targets.customerSavingsPct, actual: PILOT.actuals.customerSavingsPct, unit: "%" },
    { label: "Farmer Income Improvement", target: PILOT.targets.farmerIncomeImprovePct, actual: PILOT.actuals.farmerIncomeImprovePct, unit: "%" },
    { label: "Repeat Order Rate", target: PILOT.targets.repeatOrderRatePct, actual: PILOT.actuals.repeatOrderRatePct, unit: "%" },
  ];
  return (
    <Panel>
      <SectionHeading
        title="Madurai Pilot AI"
        subtitle="Continuous actual-vs-target monitoring for the 2-month pilot"
        icon={<Target className="h-5 w-5" />}
        right={<RiskBadge level={PILOT.health} />}
      />
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard label="Farmers" value={PILOT.farmers} icon={Sprout} accent="emerald" dataLabel="Actual" />
        <StatCard label="SHG Leaders" value={PILOT.shgLeaders} icon={Users} accent="teal" />
        <StatCard label="Households" value={PILOT.households} icon={HeartHandshake} accent="amber" />
        <StatCard label="Duration" value={`${PILOT.durationMonths} mo`} icon={Target} accent="gold" />
      </div>

      <InsightCard
        title="Pilot Health: At Risk"
        priority="Medium"
        icon="🎯"
        insight={PILOT.note}
        evidence={metrics.map((m) => `${m.label}: target ${m.target}${m.unit} → actual ${m.actual}${m.unit}`)}
        action="Launch reactivation campaign for dormant households; aim to lift repeat-order rate above 70%."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        {metrics.map((m) => {
          const pct = Math.round((m.actual / m.target) * 100);
          const achieved = m.actual >= m.target;
          return (
            <Card key={m.label}>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground mb-1">{m.label}</p>
                <div className="flex items-end justify-between mb-2">
                  <div>
                    <p className="text-2xl font-bold">{m.actual}{m.unit}</p>
                    <p className="text-xs text-muted-foreground">target {m.target}{m.unit}</p>
                  </div>
                  <Badge variant="outline" className={cn("text-xs", achieved ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300")}>
                    {achieved ? <CheckCircle2 className="h-3 w-3 mr-1" /> : <AlertTriangle className="h-3 w-3 mr-1" />} {pct}%
                  </Badge>
                </div>
                <ConfidenceMeter value={Math.min(pct, 100)} label="Progress to target" />
              </CardContent>
            </Card>
          );
        })}
      </div>
    </Panel>
  );
}

/* ====================== IMPACT AI ====================== */
const IMPACT_ACCENT: Record<string, string> = {
  emerald: "bg-emerald-500/15 text-emerald-600",
  teal: "bg-teal-500/15 text-teal-600",
  amber: "bg-amber-500/15 text-amber-600",
  gold: "bg-yellow-500/15 text-yellow-600",
};

export function ImpactView() {
  const items = [
    { label: "Customer Savings", value: IMPACT.customerSavingsInr, display: inrLakh(IMPACT.customerSavingsInr), icon: HeartHandshake, accent: "emerald" as const },
    { label: "Additional Farmer Income", value: IMPACT.farmerIncomeInr, display: inrLakh(IMPACT.farmerIncomeInr), icon: Sprout, accent: "teal" as const },
    { label: "Waste Avoided", value: IMPACT.wasteAvoidedKg, display: `${(IMPACT.wasteAvoidedKg / 1000).toFixed(1)} t`, icon: Recycle, accent: "amber" as const },
    { label: "Households Served", value: IMPACT.householdsServed, display: IMPACT.householdsServed.toLocaleString("en-IN"), icon: Users, accent: "gold" as const },
    { label: "KM Reduced", value: IMPACT.kmReduced, display: `${(IMPACT.kmReduced / 1000).toFixed(1)}k km`, icon: Route, accent: "emerald" as const },
    { label: "SHG Income Generated", value: IMPACT.shgIncomeInr, display: inrLakh(IMPACT.shgIncomeInr), icon: TrendingUp, accent: "teal" as const },
  ];
  return (
    <Panel>
      <SectionHeading
        title="Impact AI"
        subtitle={`Social & economic impact — ${IMPACT.period}`}
        icon={<HeartHandshake className="h-5 w-5" />}
        right={<DataLabelBadge label="Actual" />}
      />
      <DemoNote>Impact metrics are calculated from platform transactions and route data. Estimates are clearly identified.</DemoNote>
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <Card key={it.label} className="relative overflow-hidden">
              <div className="absolute -right-4 -top-4 opacity-10">
                <Icon className="h-24 w-24" />
              </div>
              <CardContent className="relative p-5">
                <div className="flex items-center gap-2 mb-2">
                  <div className={cn("rounded-lg p-1.5", IMPACT_ACCENT[it.accent])}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <p className="text-xs text-muted-foreground font-medium">{it.label}</p>
                </div>
                <p className="text-3xl font-bold tracking-tight">{it.display}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </Panel>
  );
}

function inrLakh(n: number): string {
  const lakh = n / 100000;
  return `₹${lakh.toFixed(1)}L`;
}

/* ====================== EXPANSION AI ====================== */
export function ExpansionView() {
  return (
    <Panel>
      <SectionHeading
        title="Expansion AI"
        subtitle="Modelled new-hub potential across Tamil Nadu"
        icon={<MapPinned className="h-5 w-5" />}
        right={<DataLabelBadge label="Predicted" />}
      />
      <DemoNote>These are <strong>model outputs</strong>, not guaranteed market facts. Confidence reflects data availability per district.</DemoNote>

      <div className="grid gap-4 lg:grid-cols-2">
        {EXPANSION.sort((a, b) => b.confidence - a.confidence).map((e, idx) => {
          const loc = LOCATIONS.find((l) => l.id === e.locationId);
          return (
            <Card key={e.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-sm">{idx + 1}</div>
                    <div>
                      <p className="font-medium text-sm">{loc?.name}</p>
                      <p className="text-xs text-muted-foreground">{loc?.ta}</p>
                    </div>
                  </div>
                  <RiskBadge level={e.complexity === "Low" ? "Low" : e.complexity === "Medium" ? "Medium" : "High"} />
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div><span className="text-muted-foreground">Households</span><br /><strong className="text-sm">{e.households.toLocaleString("en-IN")}</strong></div>
                  <div><span className="text-muted-foreground">Est. GMV</span><br /><strong className="text-sm">{inr(e.estGmvInr)}</strong></div>
                  <div><span className="text-muted-foreground">Complexity</span><br /><strong className="text-sm">{e.complexity}</strong></div>
                </div>
                <div className="mt-3"><ConfidenceMeter value={e.confidence} /></div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </Panel>
  );
}

/* ====================== REPORT GENERATOR ====================== */
const REPORTS = [
  { id: "daily", name: "Daily Operations Report", icon: FileText, desc: "Today's orders, GMV, routes, alerts" },
  { id: "weekly", name: "Weekly Business Report", icon: TrendingUp, desc: "GMV trend, retention, hub performance" },
  { id: "farmer", name: "Farmer Performance Report", icon: Sprout, desc: "Per-farmer fulfilment, revenue, reliability" },
  { id: "hub", name: "Hub Performance Report", icon: Target, desc: "Profitability, staffing, waste per hub" },
  { id: "savings", name: "Customer Savings Report", icon: HeartHandshake, desc: "Customer savings vs market prices" },
  { id: "pilot", name: "Pilot Progress Report", icon: Target, desc: "Madurai pilot actuals vs targets" },
  { id: "investor", name: "Investor Report", icon: Sparkles, desc: "GMV, retention, unit economics, impact" },
];

export function ReportsView() {
  const [generating, setGenerating] = React.useState<string | null>(null);

  const generate = (id: string, format: "PDF" | "CSV" | "Excel") => {
    setGenerating(id + format);
    setTimeout(() => {
      setGenerating(null);
      toast.success(`${format} report ready`, {
        description: `${REPORTS.find((r) => r.id === id)?.name} generated with executive summary, charts & KPIs.`,
      });
    }, 1200);
  };

  return (
    <Panel>
      <SectionHeading
        title="AI Report Generator"
        subtitle="One-click reports with executive summary, charts, KPIs & recommendations"
        icon={<FileText className="h-5 w-5" />}
      />
      <div className="grid gap-4 lg:grid-cols-2">
        {REPORTS.map((r) => {
          const Icon = r.icon;
          return (
            <Card key={r.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{r.name}</p>
                    <p className="text-xs text-muted-foreground">{r.desc}</p>
                    <div className="flex gap-1.5 mt-3">
                      {(["PDF", "CSV", "Excel"] as const).map((fmt) => (
                        <Button
                          key={fmt}
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs"
                          disabled={generating === r.id + fmt}
                          onClick={() => generate(r.id, fmt)}
                        >
                          {generating === r.id + fmt ? "Generating…" : <><Download className="h-3 w-3" /> {fmt}</>}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </Panel>
  );
}

/* ====================== KNOWLEDGE CENTER ====================== */
export function KnowledgeView() {
  const [question, setQuestion] = React.useState("");
  const [answer, setAnswer] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const ask = async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    setAnswer("");
    setQuestion(q);
    try {
      const res = await fetch("/api/ai/knowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setAnswer(data.answer);
    } catch {
      setAnswer("I couldn't reach the knowledge center. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    "How does group buying work?",
    "How is farmer payment calculated?",
    "How does pickup work?",
    "How is my data used?",
    "How is the demand forecast generated?",
  ];

  return (
    <Panel>
      <SectionHeading
        title="AI Knowledge Center"
        subtitle="Answers grounded in official Koottam documentation — never hallucinated"
        icon={<HelpCircle className="h-5 w-5" />}
        right={<DataLabelBadge label="Actual" />}
      />
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex gap-2">
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && ask(question)}
              placeholder="Ask about Koottam Cart…"
              className="flex-1 rounded-md border bg-background px-3 py-2 text-sm"
              disabled={loading}
            />
            <Button size="icon" onClick={() => ask(question)} disabled={loading || !question.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => ask(s)}
                disabled={loading}
                className="rounded-full border bg-background px-3 py-1 text-xs hover:bg-muted transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
      {(answer || loading) && (
        <Card>
          <CardContent className="p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-primary mb-2">Koottam Knowledge AI</p>
            {loading ? (
              <div className="flex gap-1 py-2">
                <span className="h-2 w-2 rounded-full bg-muted-foreground/60 animate-bounce" />
                <span className="h-2 w-2 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="h-2 w-2 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            ) : (
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{answer}</p>
            )}
          </CardContent>
        </Card>
      )}
    </Panel>
  );
}
