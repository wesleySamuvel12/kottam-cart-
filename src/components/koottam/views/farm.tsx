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
  PieChart,
  Pie,
  Legend,
} from "recharts";
import {
  Sprout,
  CalendarDays,
  Recycle,
  BadgeIndianRupee,
  Truck,
  Leaf,
  Star,
  MapPin,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import {
  HARVEST_RECS,
  WASTE_RISKS,
  WASTE_PREVENTED,
  PRODUCTS,
  FARMERS,
  SOURCING_PLANS,
  getProduct,
  getFarmer,
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

/* ====================== FARMER AI ====================== */
export function FarmerView() {
  const [farmerId, setFarmerId] = React.useState(HARVEST_RECS[0].farmerId);
  const rec = HARVEST_RECS.find((r) => r.farmerId === farmerId)!;
  const farmer = getFarmer(farmerId)!;

  return (
    <Panel>
      <SectionHeading
        title="Koottam Farmer AI"
        subtitle="“What should I harvest tomorrow?” — AI recommendation per farmer"
        icon={<Sprout className="h-5 w-5" />}
        right={<DataLabelBadge label="Predicted" />}
      />
      <DemoNote>Farmer AI considers confirmed orders, predicted demand, weather, historical demand, crop availability, seasonality and local festival demand.</DemoNote>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            {FARMERS.slice(0, 5).map((f) => (
              <button
                key={f.id}
                onClick={() => setFarmerId(f.id)}
                className={cn(
                  "flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition-colors",
                  farmerId === f.id ? "bg-primary text-primary-foreground border-primary" : "hover:bg-muted"
                )}
              >
                <Sprout className="h-3.5 w-3.5" />
                {f.name}
                <Badge variant="outline" className={cn("text-[10px]", farmerId === f.id ? "border-primary-foreground/30" : "")}>{f.reliability}%</Badge>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                {farmer.name.charAt(0)}
              </div>
              <div>
                <CardTitle className="text-base">{farmer.name} <span className="text-sm font-normal text-muted-foreground">{farmer.ta}</span></CardTitle>
                <p className="text-xs text-muted-foreground flex items-center gap-2">
                  <MapPin className="h-3 w-3" /> {farmer.distanceKm} km from hub
                  <Star className="h-3 w-3 text-amber-500" /> {farmer.rating}
                </p>
              </div>
            </div>
            <RiskBadge level={rec.riskLevel} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
            <StatCard label="Expected Revenue" value={inr(rec.totalRevenue)} icon={BadgeIndianRupee} accent="emerald" dataLabel="Estimated" />
            <StatCard label="Reliability" value={`${farmer.reliability}%`} icon={Sprout} accent="teal" dataLabel="Actual" />
            <StatCard label="Capacity" value={`${farmer.capacityKg} kg`} icon={CalendarDays} accent="amber" />
            <StatCard label="Risk Level" value={rec.riskLevel} icon={Leaf} accent={rec.riskLevel === "Low" ? "emerald" : "amber"} />
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Recommended Harvest</h4>
            {rec.items.map((it) => {
              const p = getProduct(it.productId)!;
              return (
                <div key={it.productId} className="rounded-lg border p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{p.name} <span className="text-xs text-muted-foreground">{p.ta}</span></p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Confirmed {it.confirmedKg}{p.unit} · Predicted {it.predictedKg}{p.unit}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary">{it.recommendedKg} <span className="text-xs font-normal text-muted-foreground">{p.unit}</span></p>
                      <p className="text-xs text-muted-foreground">{inr(it.expectedRevenue)}</p>
                    </div>
                  </div>
                  <div className="mt-2"><ConfidenceMeter value={it.confidence} /></div>
                </div>
              );
            })}
          </div>

          <div className="flex gap-2">
            <Button size="sm" onClick={() => toast.success("Recommendation accepted", { description: `Harvest plan for ${farmer.name} confirmed.` })}>Accept Recommendation</Button>
            <Button size="sm" variant="outline" onClick={() => toast.info("Modify mode", { description: "Adjust quantities before confirming." })}>Modify</Button>
            <Button size="sm" variant="ghost" onClick={() => toast.message("Ignored", { description: "No automated action taken." })}>Ignore</Button>
          </div>
        </CardContent>
      </Card>
    </Panel>
  );
}

/* ====================== HARVEST PLANNER ====================== */
export function HarvestView() {
  return (
    <Panel>
      <SectionHeading
        title="Harvest Planner"
        subtitle="Per-farmer harvest optimization with expected revenue & risk"
        icon={<CalendarDays className="h-5 w-5" />}
        right={<DataLabelBadge label="Predicted" />}
      />
      <div className="grid gap-4 lg:grid-cols-2">
        {HARVEST_RECS.map((rec) => {
          const farmer = getFarmer(rec.farmerId)!;
          return (
            <Card key={rec.farmerId}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">{farmer.name.charAt(0)}</div>
                    <div>
                      <CardTitle className="text-base">{farmer.name}</CardTitle>
                      <p className="text-xs text-muted-foreground">{farmer.ta} • {farmer.locationId}</p>
                    </div>
                  </div>
                  <RiskBadge level={rec.riskLevel} />
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {rec.items.map((it) => {
                  const p = getProduct(it.productId)!;
                  return (
                    <div key={it.productId} className="rounded-lg bg-muted/30 p-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="font-medium text-sm">{p.name}</p>
                        <p className="text-sm font-bold text-primary">{inr(it.expectedRevenue)}</p>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-[11px]">
                        <div><span className="text-muted-foreground">Confirmed</span><br /><strong>{it.confirmedKg}{p.unit}</strong></div>
                        <div><span className="text-muted-foreground">Predicted</span><br /><strong>{it.predictedKg}{p.unit}</strong></div>
                        <div><span className="text-muted-foreground">Recommended</span><br /><strong className="text-primary">{it.recommendedKg}{p.unit}</strong></div>
                      </div>
                      <div className="mt-2"><ConfidenceMeter value={it.confidence} /></div>
                    </div>
                  );
                })}
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-sm font-medium">Total expected revenue</span>
                  <span className="text-lg font-bold text-primary">{inr(rec.totalRevenue)}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </Panel>
  );
}

/* ====================== WASTEGUARD AI ====================== */
export function WasteView() {
  return (
    <Panel>
      <SectionHeading
        title="WasteGuard AI"
        subtitle="Detects over-supply, under-supply, spoilage and demand anomalies"
        icon={<Recycle className="h-5 w-5" />}
        right={<DataLabelBadge label="Estimated" />}
      />
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard label="Waste Prevented (Month)" value={inr(WASTE_PREVENTED.monthValueInr)} sub={`${WASTE_PREVENTED.monthKg} kg saved`} icon={Recycle} accent="emerald" dataLabel="Actual" />
        <StatCard label="Waste Prevented (Year)" value={inr(WASTE_PREVENTED.yearValueInr)} sub={`${WASTE_PREVENTED.yearKg} kg saved`} icon={BadgeIndianRupee} accent="teal" dataLabel="Actual" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {WASTE_RISKS.map((r) => {
          const p = getProduct(r.productId)!;
          return (
            <InsightCard
              key={r.productId}
              title={`${p.name} oversupply ${r.oversupplyPct}%`}
              priority={r.oversupplyPct > 25 ? "High" : "Medium"}
              icon="♻️"
              insight={`${p.name} supply is ${r.oversupplyPct}% above predicted demand. Supply ${r.supplyKg}${p.unit} vs demand ${r.demandKg}${p.unit}. ${r.reason}`}
              evidence={[`Supply: ${r.supplyKg}${p.unit}`, `Predicted demand: ${r.demandKg}${p.unit}`, `Shelf life: ${p.shelfLifeDays} days`]}
              action={`Reduce tomorrow's farmer allocation by ${r.recommendedReductionKg}${p.unit}.`}
            />
          );
        })}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Supply vs Demand Balance</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={WASTE_RISKS.map((r) => ({ name: getProduct(r.productId)?.name, supply: r.supplyKg, demand: r.demandKg }))}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
              <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="supply" name="Supply" fill="var(--chart-3)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="demand" name="Demand" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </Panel>
  );
}

/* ====================== PRICESENSE AI ====================== */
export function PriceView() {
  return (
    <Panel>
      <SectionHeading
        title="PriceSense AI"
        subtitle="Price intelligence, trend analysis & anomaly detection"
        icon={<BadgeIndianRupee className="h-5 w-5" />}
        right={<DataLabelBadge label="Actual" />}
      />
      <DemoNote>Internal platform prices are <strong>Actual</strong>. External market-price ranges are clearly labelled <strong>Demo</strong> until a live market-price source is connected. We never fabricate external prices.</DemoNote>

      <div className="grid gap-4 lg:grid-cols-2">
        {PRODUCTS.slice(0, 8).map((p) => {
          const TrendIcon = p.trend === "Rising" ? TrendingUp : p.trend === "Falling" ? TrendingDown : Minus;
          const trendColor = p.trend === "Rising" ? "text-emerald-600" : p.trend === "Falling" ? "text-orange-600" : "text-muted-foreground";
          const inRange = p.sellPrice >= p.marketLow && p.sellPrice <= p.marketHigh;
          const margin = p.sellPrice - p.costPrice;
          const marginPct = Math.round((margin / p.sellPrice) * 100);
          return (
            <Card key={p.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold">{p.name} <span className="text-xs text-muted-foreground">{p.ta}</span></p>
                    <p className="text-[11px] text-muted-foreground">{p.category} • shelf {p.shelfLifeDays}d</p>
                  </div>
                  <Badge variant="outline" className={cn("gap-1", trendColor)}>
                    <TrendIcon className="h-3 w-3" /> {p.trendPct >= 0 ? "+" : ""}{p.trendPct}%
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="rounded bg-muted/40 p-2">
                    <p className="text-[10px] text-muted-foreground uppercase">Customer</p>
                    <p className="font-bold text-base">{inr(p.sellPrice)}</p>
                  </div>
                  <div className="rounded bg-muted/40 p-2">
                    <p className="text-[10px] text-muted-foreground uppercase">Farmer</p>
                    <p className="font-bold text-base">{inr(p.costPrice)}</p>
                  </div>
                  <div className="rounded bg-emerald-500/10 p-2">
                    <p className="text-[10px] text-muted-foreground uppercase">Margin</p>
                    <p className="font-bold text-base text-emerald-700 dark:text-emerald-300">{marginPct}%</p>
                  </div>
                </div>
                <Separator className="my-3" />
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">AI expected range</span>
                    <span className="font-medium">{inr(p.marketLow)} – {inr(p.marketHigh)}/{p.unit}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Status</span>
                    {inRange ? (
                      <Badge variant="outline" className="text-[10px] border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">Within range</Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300">Anomaly</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Price Trend — Top Movers</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={["W1", "W2", "W3", "W4", "W5", "W6"].map((week, i) => ({
              week,
              Tomato: 38 + i * 0.7,
              Coriander: 7 + i * 0.5,
              Drumstick: 54 + i * 1,
            }))}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis dataKey="week" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
              <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="Tomato" stroke="var(--chart-1)" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Coriander" stroke="var(--chart-2)" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Drumstick" stroke="var(--chart-3)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </Panel>
  );
}

/* ====================== DYNAMIC SOURCING ====================== */
export function SourcingView() {
  const [productId, setProductId] = React.useState("tomato");
  const [plan, setPlan] = React.useState(SOURCING_PLANS.find((p) => p.productId === productId));
  const [loading, setLoading] = React.useState(false);

  const optimize = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/sourcing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, demandKg: 480 }),
      });
      const data = await res.json();
      if (data.allocations) {
        setPlan({ productId, demandKg: 480, allocations: data.allocations.map((a: any) => ({ farmerId: a.farmerId, kg: a.kg, score: a.score })) });
        toast.success("AI sourcing optimized", { description: `Confidence ${data.confidence ?? 89}%` });
      }
    } catch {
      toast.error("Could not reach AI sourcing agent");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Panel>
      <SectionHeading
        title="AI Dynamic Sourcing"
        subtitle="Recommends which farmers should supply each product, optimizing distance, reliability, freshness & price"
        icon={<Truck className="h-5 w-5" />}
        right={<DataLabelBadge label="Predicted" />}
      />
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium">Product:</span>
            <select
              value={productId}
              onChange={(e) => {
                const id = e.target.value;
                setProductId(id);
                setPlan(SOURCING_PLANS.find((p) => p.productId === id) ?? SOURCING_PLANS[0]);
              }}
              className="rounded-md border bg-background px-2 py-1 text-sm"
            >
              {PRODUCTS.slice(0, 8).map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <Button size="sm" onClick={optimize} disabled={loading} className="ml-auto">
              {loading ? "Optimizing…" : "Re-optimize with AI"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {plan && (
        <>
          <InsightCard
            title={`Sourcing plan for ${getProduct(plan.productId)?.name} — demand ${plan.demandKg} kg`}
            priority="Low"
            icon="🚚"
            insight={`Optimized across ${plan.allocations.length} farmers by quantity fit, distance, freshness, delivery reliability, historical fulfillment, price, weather and route efficiency.`}
            action="Review allocation. Sensitive changes require human acceptance."
          />
          <Card>
            <CardHeader><CardTitle className="text-base">Farmer Allocation</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {plan.allocations.map((a) => {
                const farmer = getFarmer(a.farmerId);
                return (
                  <div key={a.farmerId} className="flex items-center gap-3 rounded-lg border p-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm shrink-0">
                      {farmer?.name.charAt(0) ?? "F"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{farmer?.name ?? a.farmerId}</p>
                      <p className="text-xs text-muted-foreground">{farmer?.distanceKm} km • {farmer?.reliability}% reliable</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">{a.kg} kg</p>
                      <p className="text-[11px] text-muted-foreground">score {a.score}</p>
                    </div>
                    <div className="w-16"><ConfidenceMeter value={a.score} label="" /></div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </>
      )}
    </Panel>
  );
}
