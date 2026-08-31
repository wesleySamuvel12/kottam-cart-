"use client";

import * as React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  LineChart,
  Line,
} from "recharts";
import {
  Users,
  HeartHandshake,
  ShieldCheck,
  CreditCard,
  Brain,
  FlaskConical,
  Gauge,
  Send,
  UserMinus,
  AlertTriangle,
  TrendingDown,
  CheckCircle2,
} from "lucide-react";
import {
  GROUP_INTEL,
  CHURN_LIST,
  ANOMALIES,
  PAYMENT_INTEL,
  MODEL_PERF,
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

/* ====================== GROUP AI ====================== */
export function GroupView() {
  return (
    <Panel>
      <SectionHeading
        title="Group AI"
        subtitle="SHG group behaviour, engagement & growth analysis"
        icon={<Users className="h-5 w-5" />}
        right={<DataLabelBadge label="Estimated" />}
      />
      <InsightCard
        title="14 customers have not ordered in the last 10 days"
        priority="Medium"
        icon="👥"
        insight="Sending a personalized reminder may improve repeat ordering. Group D — Vandiyur shows the highest inactivity (8 members) and declining growth (-8%)."
        evidence={["Order recency across groups", "Group growth trend", "Member engagement score"]}
        action="Send personalized reminders to inactive members; focus reactivation on Group D."
      />
      <div className="grid gap-4 lg:grid-cols-2">
        {GROUP_INTEL.map((g) => (
          <Card key={g.group}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-medium text-sm">{g.group}</p>
                  <p className="text-xs text-muted-foreground">Top product: {g.topProduct}</p>
                </div>
                <Badge variant="outline" className={cn("text-xs", g.growthPct >= 0 ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : "border-orange-500/30 bg-orange-500/10 text-orange-700 dark:text-orange-300")}>
                  {g.growthPct >= 0 ? "▲" : "▼"} {Math.abs(g.growthPct)}%
                </Badge>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div><span className="text-muted-foreground">Predicted orders</span><br /><strong className="text-base">{g.predictedOrders}</strong></div>
                <div><span className="text-muted-foreground">Inactive</span><br /><strong className="text-base text-orange-600">{g.inactiveMembers}</strong></div>
                <div><span className="text-muted-foreground">Repeat likely</span><br /><strong className="text-base">{g.repeatLikelihood}%</strong></div>
              </div>
              <div className="mt-3"><ConfidenceMeter value={g.repeatLikelihood} label="Repeat likelihood" /></div>
            </CardContent>
          </Card>
        ))}
      </div>
    </Panel>
  );
}

/* ====================== CHURN PREDICTION ====================== */
export function ChurnView() {
  return (
    <Panel>
      <SectionHeading
        title="AI Customer Churn Prediction"
        subtitle="Customers likely to stop ordering — with reasons & actions"
        icon={<HeartHandshake className="h-5 w-5" />}
        right={<DataLabelBadge label="Predicted" />}
      />
      <DemoNote>We never use sensitive personal characteristics. Signals are based on order recency, frequency and basket-value trends only.</DemoNote>
      <div className="grid gap-4 lg:grid-cols-2">
        {CHURN_LIST.map((c) => (
          <Card key={c.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">{c.name.charAt(0)}</div>
                  <div>
                    <p className="font-medium text-sm">{c.name}</p>
                    <p className="text-xs text-muted-foreground">#{c.id} • {c.group}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-muted-foreground uppercase">Churn prob.</p>
                  <p className={cn("text-xl font-bold", c.churnProb >= 70 ? "text-red-600" : c.churnProb >= 50 ? "text-orange-600" : "text-amber-600")}>{c.churnProb}%</p>
                </div>
              </div>
              <div className="space-y-1.5 text-xs">
                <p className="font-semibold text-muted-foreground uppercase text-[10px]">Signals</p>
                {c.signals.map((s, i) => (
                  <p key={i} className="flex items-start gap-1.5"><span className="mt-1 h-1 w-1 rounded-full bg-muted-foreground" />{s}</p>
                ))}
              </div>
              <Separator className="my-3" />
              <div className="rounded-md bg-emerald-500/5 p-2 text-xs">
                <p className="font-semibold text-emerald-700 dark:text-emerald-300 mb-0.5">Recommended action</p>
                <p className="text-emerald-800 dark:text-emerald-200">{c.recommendedAction}</p>
              </div>
              <Button size="sm" variant="outline" className="w-full mt-3" onClick={() => toast.success("Reactivation offer queued", { description: `${c.name} • ${c.id}` })}>
                <Send className="h-3.5 w-3.5" /> Send reactivation
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </Panel>
  );
}

function DemoNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 rounded-md border border-sky-500/30 bg-sky-500/5 p-3">
      <AlertTriangle className="h-4 w-4 text-sky-600 dark:text-sky-400 mt-0.5 shrink-0" />
      <p className="text-xs text-sky-800 dark:text-sky-200">{children}</p>
    </div>
  );
}

/* ====================== TRUSTGUARD AI ====================== */
export function TrustView() {
  return (
    <Panel>
      <SectionHeading
        title="TrustGuard AI"
        subtitle="Fraud & anomaly detection — never auto-punishes; human review required"
        icon={<ShieldCheck className="h-5 w-5" />}
        right={<DataLabelBadge label="Estimated" />}
      />
      <DemoNote>AI flags anomalies for review only. We never automatically punish users based solely on AI output. All flags require human confirmation.</DemoNote>
      <div className="grid gap-4 lg:grid-cols-2">
        {ANOMALIES.map((a) => (
          <Card key={a.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-medium text-sm">{a.type}</p>
                  <p className="text-xs text-muted-foreground">{a.area}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-muted-foreground uppercase">Risk score</p>
                  <p className={cn("text-lg font-bold", a.riskScore >= 70 ? "text-red-600" : a.riskScore >= 60 ? "text-orange-600" : "text-amber-600")}>{a.riskScore}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mb-3">{a.reason}</p>
              <div className="rounded-md bg-amber-500/5 p-2 text-xs">
                <p className="font-semibold text-amber-700 dark:text-amber-300 mb-0.5">Recommended review</p>
                <p className="text-amber-800 dark:text-amber-200">{a.action}</p>
              </div>
              <div className="flex gap-2 mt-3">
                <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => toast.success("Flagged for manual review")}>Review</Button>
                <Button size="sm" variant="ghost" className="flex-1 text-xs" onClick={() => toast.info("Dismissed as benign")}>Dismiss</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </Panel>
  );
}

/* ====================== PAYMENT INTELLIGENCE ====================== */
export function PaymentView() {
  return (
    <Panel>
      <SectionHeading
        title="AI Payment Intelligence"
        subtitle="Payment operations, settlement & commission analytics"
        icon={<CreditCard className="h-5 w-5" />}
        right={<DataLabelBadge label="Actual" />}
      />
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard label="Success Rate" value={`${PAYMENT_INTEL.successRate}%`} icon={CheckCircle2} accent="emerald" dataLabel="Actual" />
        <StatCard label="Pending Payments" value={PAYMENT_INTEL.pendingCount} sub={inr(PAYMENT_INTEL.pendingValueInr)} icon={CreditCard} accent="amber" />
        <StatCard label="Failed Today" value={PAYMENT_INTEL.failedToday} icon={TrendingDown} accent="terracotta" />
        <StatCard label="Settlement Delay" value={`${PAYMENT_INTEL.settlementDelayHrs}h`} icon={Gauge} accent="gold" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Commission & Hub Revenue</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Commission this month</span>
              <span className="text-lg font-bold text-emerald-600">{inr(PAYMENT_INTEL.commissionThisMonthInr)}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Hub revenue this month</span>
              <span className="text-lg font-bold text-primary">{inr(PAYMENT_INTEL.hubRevenueThisMonthInr)}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Failed Payment Patterns</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={PAYMENT_INTEL.failedPatterns} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
                <XAxis type="number" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                <YAxis type="category" dataKey="reason" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" width={110} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="count" name="Failures" radius={[0, 4, 4, 0]}>
                  {PAYMENT_INTEL.failedPatterns.map((_, i) => (
                    <Cell key={i} fill={["var(--chart-3)", "var(--chart-2)", "var(--chart-1)"][i % 3]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <InsightCard
        title="Why did today's settlement amount decrease?"
        priority="Medium"
        icon="💳"
        insight={`Today's settlement is lower primarily due to ${PAYMENT_INTEL.failedToday} failed payments (4 UPI timeouts) and ${PAYMENT_INTEL.pendingCount} pending settlements worth ${inr(PAYMENT_INTEL.pendingValueInr)}. Settlement delay is ${PAYMENT_INTEL.settlementDelayHrs}h, slightly above the 4h SLA.`}
        evidence={["Failed payment breakdown", "Pending settlement queue", "Settlement SLA tracking"]}
        action="Retry UPI failures after 30 min; escalate pending settlements older than 6h."
      />
    </Panel>
  );
}

/* ====================== BUSINESS COPILOT ====================== */
export function CopilotView() {
  const [messages, setMessages] = React.useState<{ role: "user" | "assistant"; content: string }[]>([
    { role: "assistant", content: "வணக்கம்! I'm **Koottam AI**, your Business Copilot. Ask me anything about Koottam Cart — GMV, hubs, margins, forecasts, pilot health, or scenarios. I'll always label data as Actual / Estimated / Predicted / Demo.\n\nTry: *“Why did GMV decrease this week?”* or *“Which hub is most profitable?”*" },
  ]);
  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const ask = async (q: string) => {
    if (!q.trim() || loading) return;
    const next = [...messages, { role: "user" as const, content: q }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/ai/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, history: next.slice(0, -1) }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setMessages([...next, { role: "assistant", content: data.answer }]);
    } catch (e) {
      setMessages([...next, { role: "assistant", content: "Sorry, I couldn't reach the AI orchestrator. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    "Why did GMV decrease this week?",
    "Which hub is most profitable?",
    "Which vegetable has the highest margin?",
    "Forecast next month's GMV",
    "What happens if we add 500 households?",
  ];

  return (
    <Panel>
      <SectionHeading
        title="Business Copilot"
        subtitle="Ask Koottam AI — grounded in live platform data"
        icon={<Brain className="h-5 w-5" />}
        right={<DataLabelBadge label="Mixed" />}
      />
      <Card className="flex flex-col h-[60vh] min-h-[420px]">
        <div ref={scrollRef} className="flex-1 overflow-y-auto koottam-scroll p-4 space-y-4">
          {messages.map((m, i) => (
            <div key={i} className={cn("flex gap-3", m.role === "user" && "flex-row-reverse")}>
              <div className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full shrink-0 text-xs font-bold",
                m.role === "assistant" ? "bg-primary text-primary-foreground" : "bg-muted"
              )}>
                {m.role === "assistant" ? "AI" : "You"}
              </div>
              <div className={cn(
                "rounded-2xl px-4 py-2.5 max-w-[80%] text-sm leading-relaxed",
                m.role === "assistant" ? "bg-muted" : "bg-primary text-primary-foreground"
              )}>
                <FormattedContent content={m.content} />
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">AI</div>
              <div className="rounded-2xl bg-muted px-4 py-3 flex gap-1">
                <span className="h-2 w-2 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="h-2 w-2 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="h-2 w-2 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}
        </div>
        <div className="border-t p-3 space-y-2">
          <div className="flex flex-wrap gap-1.5">
            {suggestions.map((s) => (
              <button key={s} onClick={() => ask(s)} disabled={loading} className="rounded-full border bg-background px-2.5 py-1 text-[11px] hover:bg-muted transition-colors disabled:opacity-50">
                {s}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  ask(input);
                }
              }}
              placeholder="Ask Koottam AI…"
              rows={1}
              className="flex-1 resize-none rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              disabled={loading}
            />
            <Button size="icon" onClick={() => ask(input)} disabled={loading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </Panel>
  );
}

function FormattedContent({ content }: { content: string }) {
  // Lightweight markdown rendering for **bold**, `code`, lists, tables
  const lines = content.split("\n");
  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        if (line.trim().startsWith("|")) {
          // table row
          const cells = line.split("|").filter((c) => c.trim());
          return (
            <div key={i} className="flex gap-2 text-xs">
              {cells.map((c, j) => (
                <span key={j} className={cn("flex-1", i === 0 && "font-bold")}>{renderInline(c.trim())}</span>
              ))}
            </div>
          );
        }
        if (line.startsWith("- ") || line.startsWith("* ")) {
          return <div key={i} className="flex gap-1.5"><span className="text-muted-foreground">•</span><span>{renderInline(line.slice(2))}</span></div>;
        }
        if (/^\d+\.\s/.test(line)) {
          return <div key={i}>{renderInline(line)}</div>;
        }
        if (line.startsWith("### ")) {
          return <p key={i} className="font-bold mt-2">{renderInline(line.slice(4))}</p>;
        }
        if (line.startsWith("## ")) {
          return <p key={i} className="font-bold text-base mt-2">{renderInline(line.slice(3))}</p>;
        }
        return line.trim() ? <p key={i}>{renderInline(line)}</p> : <div key={i} className="h-1" />;
      })}
    </div>
  );
}

function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((p, i) => {
    if (p.startsWith("**") && p.endsWith("**")) return <strong key={i}>{p.slice(2, -2)}</strong>;
    if (p.startsWith("`") && p.endsWith("`")) return <code key={i} className="rounded bg-muted-foreground/15 px-1 py-0.5 text-[11px] font-mono">{p.slice(1, -1)}</code>;
    return <span key={i}>{p}</span>;
  });
}

/* ====================== GROWTH SIMULATOR ====================== */
export function SimulatorView() {
  const [households, setHouseholds] = React.useState(1000);
  const [aov, setAov] = React.useState(320);
  const [commissionPct, setCommissionPct] = React.useState(12);
  const [hubs, setHubs] = React.useState(2);
  const [ordersPerDay, setOrdersPerDay] = React.useState(0.6);
  const [repeatRate, setRepeatRate] = React.useState(70);

  const dailyOrders = Math.round(households * ordersPerDay);
  const gmv = dailyOrders * aov;
  const revenue = gmv * (commissionPct / 100);
  const opex = hubs * 8200 * 0.6 + households * 2;
  const profit = revenue - opex;
  const farmerVolume = dailyOrders * 2.4;

  return (
    <Panel>
      <SectionHeading
        title="Growth Simulator"
        subtitle="Scenario model — adjust inputs to forecast GMV, revenue, profit & logistics"
        icon={<FlaskConical className="h-5 w-5" />}
        right={<DataLabelBadge label="Predicted" />}
      />
      <DemoNote>This is an interactive model. Outputs are <strong>Predicted</strong>, not guaranteed. Assumptions are stated explicitly.</DemoNote>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle className="text-base">Inputs</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Slider label="Households" value={households} min={100} max={10000} step={100} onChange={setHouseholds} format={(v) => v.toLocaleString("en-IN")} />
            <Slider label="Avg order value (₹)" value={aov} min={150} max={800} step={10} onChange={setAov} format={(v) => inr(v)} />
            <Slider label="Commission %" value={commissionPct} min={5} max={25} step={1} onChange={setCommissionPct} format={(v) => `${v}%`} />
            <Slider label="Number of hubs" value={hubs} min={1} max={20} step={1} onChange={setHubs} format={(v) => `${v}`} />
            <Slider label="Orders / household / day" value={ordersPerDay * 100} min={20} max={100} step={5} onChange={(v) => setOrdersPerDay(v / 100)} format={(v) => `${(v / 100).toFixed(2)}`} />
            <Slider label="Repeat order rate %" value={repeatRate} min={30} max={95} step={1} onChange={setRepeatRate} format={(v) => `${v}%`} />
          </CardContent>
        </Card>

        <div className="lg:col-span-2 grid gap-4 grid-cols-2 content-start">
          <StatCard label="Daily GMV" value={inr(gmv)} sub={`${dailyOrders} orders/day`} icon={Brain} accent="emerald" dataLabel="Predicted" />
          <StatCard label="Platform Revenue" value={inr(revenue)} sub={`${commissionPct}% commission`} icon={CreditCard} accent="teal" dataLabel="Predicted" />
          <StatCard label="Operating Cost" value={inr(opex)} sub={`${hubs} hubs`} icon={Gauge} accent="amber" dataLabel="Estimated" />
          <StatCard label="Profit / day" value={inr(profit)} accent={profit > 0 ? "emerald" : "terracotta"} dataLabel="Predicted" />
          <StatCard label="Monthly Profit" value={inr(profit * 30)} icon={CheckCircle2} accent={profit > 0 ? "emerald" : "terracotta"} dataLabel="Predicted" />
          <StatCard label="Farmer Volume" value={`${farmerVolume.toLocaleString("en-IN")} kg/day`} icon={FlaskConical} accent="gold" dataLabel="Estimated" />
          <Card className="col-span-2">
            <CardContent className="p-4">
              <p className="text-sm font-medium mb-1">Scenario summary</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                At <strong>{households.toLocaleString("en-IN")} households</strong> with ₹{aov} AOV and {commissionPct}% commission across {hubs} hubs, Koottam Cart would generate approximately <strong>{inr(gmv)} daily GMV</strong> and <strong>{inr(profit * 30)} monthly profit</strong>, requiring ~{farmerVolume.toLocaleString("en-IN")} kg/day of farmer supply. Repeat-rate of {repeatRate}% is {repeatRate >= 70 ? "above" : "below"} the 70% pilot target.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Panel>
  );
}

function Slider({ label, value, min, max, step, onChange, format }: {
  label: string; value: number; min: number; max: number; step: number;
  onChange: (v: number) => void; format: (v: number) => string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-sm font-bold">{format(value)}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-primary" />
    </div>
  );
}

/* ====================== MODEL PERFORMANCE ====================== */
export function ModelView() {
  return (
    <Panel>
      <SectionHeading
        title="AI Model Performance"
        subtitle="Forecast accuracy, error metrics & recommendation acceptance"
        icon={<Gauge className="h-5 w-5" />}
        right={<DataLabelBadge label="Actual" />}
      />
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard label="Forecast Accuracy" value={`${MODEL_PERF.forecastAccuracy}%`} icon={Gauge} accent="emerald" trend={{ dir: "up", pct: 1.2 }} dataLabel="Actual" />
        <StatCard label="MAE" value={`${MODEL_PERF.mae} kg`} sub="mean abs error" icon={TrendingDown} accent="amber" />
        <StatCard label="RMSE" value={`${MODEL_PERF.rmse} kg`} icon={Gauge} accent="teal" />
        <StatCard label="Anomaly Precision" value={`${MODEL_PERF.anomalyPrecision}%`} icon={ShieldCheck} accent="gold" />
      </div>
      <Card>
        <CardHeader><CardTitle className="text-base">Forecast Accuracy Trend (6 weeks)</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={MODEL_PERF.history}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis dataKey="week" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
              <YAxis domain={[80, 95]} tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} formatter={(v: number) => [`${v}%`, "Accuracy"]} />
              <Line type="monotone" dataKey="accuracy" stroke="var(--chart-1)" strokeWidth={2.5} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div><p className="text-[10px] text-muted-foreground uppercase">Bias</p><p className="font-bold text-lg">{MODEL_PERF.bias} kg</p></div>
          <div><p className="text-[10px] text-muted-foreground uppercase">Anomaly precision</p><p className="font-bold text-lg">{MODEL_PERF.anomalyPrecision}%</p></div>
          <div><p className="text-[10px] text-muted-foreground uppercase">Rec. acceptance</p><p className="font-bold text-lg">{MODEL_PERF.recommendationAcceptanceRate}%</p></div>
          <div><p className="text-[10px] text-muted-foreground uppercase">Data logged</p><p className="font-bold text-lg">6 wk</p></div>
        </CardContent>
      </Card>
    </Panel>
  );
}
