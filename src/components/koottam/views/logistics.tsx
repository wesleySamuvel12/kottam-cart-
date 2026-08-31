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
  PieChart,
  Pie,
  Legend,
} from "recharts";
import {
  Route as RouteIcon,
  Map,
  Warehouse,
  Truck,
  Clock,
  Fuel,
  MapPin,
  Users,
  TrendingDown,
  IndianRupee,
  Package,
} from "lucide-react";
import {
  ROUTE_PLANS,
  PICKUP_WINDOWS,
  HUB_PNL,
  HUB_STAFFING,
  HUBS,
  getHub,
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
} from "@/components/koottam/ui";
import { cn } from "@/lib/utils";

/* ====================== ROUTE AI ====================== */
export function RouteView() {
  const totalSavings = ROUTE_PLANS.reduce((a, b) => a + b.savingsKm, 0);
  return (
    <Panel>
      <SectionHeading
        title="Route AI"
        subtitle="Optimized pickup & delivery routes with map visualization"
        icon={<RouteIcon className="h-5 w-5" />}
        right={<DataLabelBadge label="Estimated" />}
      />
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard label="Distance Saved Today" value={`${totalSavings} km`} icon={TrendingDown} accent="emerald" dataLabel="Estimated" />
        <StatCard label="Routes Optimized" value={ROUTE_PLANS.length} icon={RouteIcon} accent="teal" />
        <StatCard label="Fuel Saved" value={`${ROUTE_PLANS.reduce((a, b) => a + (b.fuelEstimateL * 0.15), 0).toFixed(1)} L`} icon={Fuel} accent="amber" dataLabel="Estimated" />
        <StatCard label="Late-Delivery Risk" value="Low" icon={Clock} accent="emerald" />
      </div>

      <InsightCard
        title="Route optimization reduced today's travel distance by 14.8 km"
        priority="Low"
        icon="🚚"
        insight="Route AI clustered orders by neighbourhood and reordered farmer pickups by distance & freshness window. Tempo Traveller #1 savings: 14.8 km / 36 min. Mini Truck #2 savings: 15.3 km / 31 min."
        evidence={["Order clustering", "Farmer distance matrix", "Weather-adjusted windows", "Vehicle capacity constraints"]}
        action="Adopt optimized route plan for today's Madurai pickups."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        {ROUTE_PLANS.map((r) => (
          <Card key={r.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2"><Truck className="h-4 w-4 text-primary" /> {r.vehicle}</CardTitle>
                <RiskBadge level={r.lateRisk} />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="rounded bg-muted/40 p-2 text-center">
                  <p className="text-[10px] text-muted-foreground uppercase">Original</p>
                  <p className="font-bold">{r.distanceKm} km</p>
                </div>
                <div className="rounded bg-emerald-500/10 p-2 text-center">
                  <p className="text-[10px] text-muted-foreground uppercase">Optimized</p>
                  <p className="font-bold text-emerald-700 dark:text-emerald-300">{r.optimizedDistanceKm} km</p>
                </div>
                <div className="rounded bg-primary/10 p-2 text-center">
                  <p className="text-[10px] text-muted-foreground uppercase">Saved</p>
                  <p className="font-bold text-primary">{r.savingsKm} km</p>
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase">Optimized Stops</p>
                {r.stops.map((s, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className={cn(
                      "flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold shrink-0",
                      s.type === "hub" ? "bg-primary text-primary-foreground" : s.type === "farmer" ? "bg-amber-500/20 text-amber-700 dark:text-amber-300" : "bg-teal-500/20 text-teal-700 dark:text-teal-300"
                    )}>{s.order}</div>
                    <span className="text-xs">{s.label}</span>
                  </div>
                ))}
              </div>
              <Separator />
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1 text-muted-foreground"><Clock className="h-3 w-3" /> {r.optimizedTimeMin} min</span>
                <span className="flex items-center gap-1 text-muted-foreground"><Fuel className="h-3 w-3" /> {r.fuelEstimateL} L</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </Panel>
  );
}

/* ====================== PICKUP TIME OPTIMIZER ====================== */
export function PickupView() {
  return (
    <Panel>
      <SectionHeading
        title="AI Pickup Time Optimizer"
        subtitle="Predicts the best pickup window per neighbourhood"
        icon={<Map className="h-5 w-5" />}
        right={<DataLabelBadge label="Predicted" />}
      />
      <InsightCard
        title="Pickup windows optimized for member availability & weather"
        priority="Low"
        icon="📍"
        insight="Considers historical collection behavior, order volume, group leader availability, weather and local operational constraints."
        action="Schedule pickups within recommended windows to maximize collection rate."
      />
      <div className="grid gap-4 lg:grid-cols-2">
        {PICKUP_WINDOWS.map((w) => (
          <Card key={w.group}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-sm">{w.group}</p>
                  <p className="text-2xl font-bold mt-1 text-primary">{w.window}</p>
                  <p className="text-xs text-muted-foreground mt-1">{w.reason}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-muted-foreground uppercase">Confidence</p>
                  <p className="text-lg font-bold text-emerald-600">{w.confidence}%</p>
                </div>
              </div>
              <div className="mt-3"><ConfidenceMeter value={w.confidence} /></div>
            </CardContent>
          </Card>
        ))}
      </div>
    </Panel>
  );
}

/* ====================== HUB AI ADVISOR ====================== */
export function HubView() {
  return (
    <Panel>
      <SectionHeading
        title="Hub AI Advisor"
        subtitle="Per-hub profitability, staffing & operational recommendations"
        icon={<Warehouse className="h-5 w-5" />}
        right={<DataLabelBadge label="Estimated" />}
      />
      <div className="grid gap-4 lg:grid-cols-2">
        {HUB_PNL.map((h) => {
          const hub = getHub(h.hubId)!;
          const staffing = HUB_STAFFING.find((s) => s.hubId === h.hubId);
          const marginPct = Math.round((h.profitForecastInr / h.revenueForecastInr) * 100);
          return (
            <div key={h.hubId} className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2"><Warehouse className="h-4 w-4 text-primary" /> {hub.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded bg-muted/40 p-2">
                      <p className="text-[10px] text-muted-foreground uppercase">Revenue forecast</p>
                      <p className="font-bold text-sm">{inr(h.revenueForecastInr)}</p>
                    </div>
                    <div className="rounded bg-muted/40 p-2">
                      <p className="text-[10px] text-muted-foreground uppercase">Operating cost</p>
                      <p className="font-bold text-sm">{inr(h.operatingCostForecastInr)}</p>
                    </div>
                    <div className="rounded bg-emerald-500/10 p-2">
                      <p className="text-[10px] text-muted-foreground uppercase">Profit forecast</p>
                      <p className="font-bold text-sm text-emerald-700 dark:text-emerald-300">{inr(h.profitForecastInr)}</p>
                    </div>
                    <div className="rounded bg-amber-500/10 p-2">
                      <p className="text-[10px] text-muted-foreground uppercase">Margin</p>
                      <p className="font-bold text-sm text-amber-700 dark:text-amber-300">{marginPct}%</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div><span className="text-muted-foreground">Cost/order</span><br /><strong>{inr(h.costPerOrder)}</strong></div>
                    <div><span className="text-muted-foreground">GMV/order</span><br /><strong>{inr(h.gmvPerOrder)}</strong></div>
                    <div><span className="text-muted-foreground">Waste</span><br /><strong>{h.wastePct}%</strong></div>
                  </div>
                </CardContent>
              </Card>

              {staffing && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2"><Users className="h-4 w-4 text-primary" /> Staffing Forecast</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div><span className="text-muted-foreground">Orders forecast (tomorrow)</span><br /><strong className="text-base">{staffing.ordersForecast}</strong></div>
                      <div><span className="text-muted-foreground">Recommended workers</span><br /><strong className="text-base text-primary">{staffing.recommendedWorkers}</strong></div>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Sorting workload</span>
                      <Badge variant="outline" className="text-xs">{staffing.sortingWorkload}</Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Expected peak</span>
                      <span className="font-medium">{staffing.peak}</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              <InsightCard
                title="Hub AI recommendation"
                priority="Low"
                icon="💡"
                insight={`Reducing average sorting time by 4 min/order could improve monthly contribution by approximately ${inr(18000)}. Pilot one extra sorter at the 5 PM peak.`}
                evidence={["Sort-time analytics", "Staffing model", "Peak-volume distribution"]}
                action="Pilot 1 extra sorter at 5 PM peak for 2 weeks; measure delta."
              />
            </div>
          );
        })}
      </div>
    </Panel>
  );
}
