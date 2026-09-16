"use client";

import * as React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import {
  TrendingUp,
  CloudSun,
  Package,
  Recycle,
  Truck,
  IndianRupee,
  AlertTriangle,
  Brain,
  Droplets,
  Wind,
  Sun,
  Thermometer,
  Gauge,
} from "lucide-react";
import {
  CONTROL_TOWER,
  GMV_TREND,
  WEATHER,
  DEMAND_FORECAST,
  AI_ALERTS,
  getProduct,
  inr,
  LOCATIONS,
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
} from "@/components/koottam/ui";
import { cn } from "@/lib/utils";

/* ====================== AI CONTROL TOWER ====================== */
export function ControlTowerView({ locationId }: { locationId: string }) {
  const summary = CONTROL_TOWER;
  const gap = summary.demandKg - summary.supplyKg;
  return (
    <Panel>
      <SectionHeading
        title="Koottam AI Control Tower"
        subtitle="Supply-demand control tower with AI-generated executive summary"
        icon={<Brain className="h-5 w-5" />}
        right={<DataLabelBadge label="Demo" />}
      />
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard label="Demand" value={`${summary.demandKg.toLocaleString("en-IN")} kg`} icon={TrendingUp} accent="emerald" trend={{ dir: "up", pct: 9 }} dataLabel="Predicted" />
        <StatCard label="Supply" value={`${summary.supplyKg.toLocaleString("en-IN")} kg`} sub={`gap ${gap.toLocaleString("en-IN")} kg`} icon={Package} accent="amber" dataLabel="Estimated" />
        <StatCard label="Forecast Accuracy" value={`${summary.forecastAccuracy}%`} icon={Gauge} accent="teal" trend={{ dir: "up", pct: 1.2 }} dataLabel="Actual" />
        <StatCard label="Revenue Forecast" value={`${inr(summary.revenueForecastInr)}`} sub={`₹${summary.revenueForecastLakh} lakh`} icon={IndianRupee} accent="gold" dataLabel="Predicted" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><Brain className="h-4 w-4 text-primary" /> AI Executive Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-foreground/90">{summary.summary}</p>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <RiskRow label="Waste Risk" level={summary.wasteRisk} icon={<Recycle className="h-4 w-4" />} />
              <RiskRow label="Weather Risk" level={summary.weatherRisk} icon={<CloudSun className="h-4 w-4" />} />
              <RiskRow label="Logistics Risk" level={summary.logisticsRisk} icon={<Truck className="h-4 w-4" />} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">7-Day GMV Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={170}>
              <AreaChart data={GMV_TREND}>
                <defs>
                  <linearGradient id="gmvGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip
                  contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
                  formatter={(v: number) => [inr(v), "GMV"]}
                />
                <Area type="monotone" dataKey="gmv" stroke="var(--chart-1)" strokeWidth={2} fill="url(#gmvGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Demand vs Orders — Daily</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={GMV_TREND}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
              <YAxis yAxisId="l" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" tickFormatter={(v) => `${v / 1000}k`} />
              <YAxis yAxisId="r" orientation="right" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
              <Bar yAxisId="l" dataKey="gmv" name="GMV ₹" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
              <Bar yAxisId="r" dataKey="orders" name="Orders" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </Panel>
  );
}

function RiskRow({ label, level, icon }: { label: string; level: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-lg border bg-muted/30 p-3">
      <div className="flex items-center gap-1.5 text-muted-foreground">{icon}<span className="text-[11px] font-medium uppercase tracking-wide">{label}</span></div>
      <div className="mt-1.5"><RiskBadge level={level as "Low" | "Medium" | "High"} /></div>
    </div>
  );
}

/* ====================== WEATHER AI ====================== */
export function WeatherView({ locationId }: { locationId: string }) {
  const w = WEATHER[locationId] ?? WEATHER.madurai;
  const loc = LOCATIONS.find((l) => l.id === locationId);
  return (
    <Panel>
      <SectionHeading
        title="Koottam Weather AI"
        subtitle={`Location-based weather intelligence for ${loc?.name} ${loc?.ta ?? ""}`}
        icon={<CloudSun className="h-5 w-5" />}
        right={<DataLabelBadge label={w.label} />}
      />
      <DemoNote>
        Showing <strong>Demo Weather Data</strong>. When <code>WEATHER_API_KEY</code> &amp; <code>WEATHER_PROVIDER</code> are configured, this connects to a live weather API. Business logic never hard-codes a specific provider.
      </DemoNote>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard label="Temperature" value={`${w.temp}°C`} sub={`feels ${w.feelsLike}°C`} icon={Thermometer} accent="amber" />
        <StatCard label="Rain Probability" value={`${w.rainProb}%`} sub={`${w.rainfall} mm`} icon={Droplets} accent="teal" />
        <StatCard label="Humidity" value={`${w.humidity}%`} icon={Gauge} accent="emerald" />
        <StatCard label="Wind Speed" value={`${w.windSpeed} km/h`} sub={`UV ${w.uvIndex}`} icon={Wind} accent="gold" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Hourly Forecast</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={w.hourly}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="hour" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" />
                <YAxis tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="rainProb" name="Rain %" radius={[4, 4, 0, 0]}>
                  {w.hourly.map((h, i) => (
                    <Cell key={i} fill={h.rainProb > 60 ? "var(--chart-3)" : h.rainProb > 40 ? "var(--chart-2)" : "var(--chart-1)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Current Condition</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="text-4xl">{w.condition.includes("Rain") ? "🌧️" : w.condition.includes("Sunny") ? "☀️" : "⛅"}</div>
              <div>
                <p className="text-sm font-medium">{w.condition}</p>
                <p className="text-xs text-muted-foreground">{loc?.name} • now</p>
              </div>
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1.5"><Sun className="h-3.5 w-3.5 text-amber-500" /> UV Index <strong>{w.uvIndex}</strong></div>
              <div className="flex items-center gap-1.5"><Droplets className="h-3.5 w-3.5 text-teal-500" /> Humidity <strong>{w.humidity}%</strong></div>
              <div className="flex items-center gap-1.5"><Wind className="h-3.5 w-3.5" /> Wind <strong>{w.windSpeed} km/h</strong></div>
              <div className="flex items-center gap-1.5"><Thermometer className="h-3.5 w-3.5" /> Feels <strong>{w.feelsLike}°C</strong></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">7-Day Forecast</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {w.daily.map((d, i) => (
              <div key={i} className="rounded-lg border bg-muted/30 p-3 text-center">
                <p className="text-xs font-medium">{d.day}</p>
                <p className="text-[10px] text-muted-foreground">{d.date}</p>
                <div className="text-2xl my-1.5">{d.icon}</div>
                <p className="text-xs font-semibold">{d.tempHi}° / {d.tempLo}°</p>
                <div className="mt-1 flex items-center justify-center gap-1 text-[10px] text-teal-600 dark:text-teal-400">
                  <Droplets className="h-3 w-3" /> {d.rainProb}%
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tamil Nadu Weather Map</CardTitle>
        </CardHeader>
        <CardContent>
          <TNWeatherMap activeLocationId={locationId} />
        </CardContent>
      </Card>

      {w.alerts.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-orange-500" /> Severe-Weather Alerts</h3>
          {w.alerts.map((a) => (
            <InsightCard
              key={a.id}
              title={a.title}
              priority={a.severity}
              icon={a.title.includes("Rain") ? "🌧️" : a.title.includes("Heat") ? "🔥" : "⚠️"}
              insight={a.detail}
              evidence={[`Area: ${a.area}`, `Window: ${a.window}`]}
              action="Review operational impact via the Demand Forecast and Route AI modules."
            />
          ))}
        </div>
      )}
    </Panel>
  );
}

function TNWeatherMap({ activeLocationId }: { activeLocationId: string }) {
  const pins = [
    { id: "chennai", x: 78, y: 18, label: "Chennai" },
    { id: "coimbatore", x: 32, y: 52, label: "Coimbatore" },
    { id: "salem", x: 48, y: 42, label: "Salem" },
    { id: "tiruchirappalli", x: 54, y: 52, label: "Trichy" },
    { id: "madurai", x: 52, y: 72, label: "Madurai" },
    { id: "dindigul", x: 45, y: 66, label: "Dindigul" },
    { id: "thanjavur", x: 60, y: 56, label: "Thanjavur" },
    { id: "tirunelveli", x: 40, y: 88, label: "Tirunelveli" },
  ];
  return (
    <div className="relative w-full aspect-[4/5] max-w-md mx-auto rounded-xl border bg-gradient-to-br from-emerald-500/5 to-amber-500/5 overflow-hidden">
      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
        <path
          d="M30 10 L40 8 L55 10 L65 18 L72 30 L70 45 L62 55 L58 70 L52 88 L42 92 L36 80 L32 65 L28 50 L26 35 L28 20 Z"
          fill="var(--chart-1)"
          fillOpacity={0.08}
          stroke="var(--chart-1)"
          strokeOpacity={0.4}
          strokeWidth={0.5}
        />
      </svg>
      {pins.map((p) => {
        const wt = WEATHER[p.id];
        const isRainy = wt ? wt.rainProb > 50 : p.id === "madurai";
        const isActive = p.id === activeLocationId;
        return (
          <div
            key={p.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
            style={{ left: `${p.x}%`, top: `${p.y}%` }}
          >
            <div
              className={cn(
                "relative flex items-center justify-center rounded-full text-base transition-all",
                isActive ? "h-9 w-9 ring-2 ring-primary ring-offset-2 ring-offset-background z-20" : "h-7 w-7",
                isRainy ? "animate-pulse-ring" : ""
              )}
              title={`${p.label}: ${wt ? wt.condition : "n/a"}`}
            >
              {isRainy ? "🌧️" : "☀️"}
            </div>
            <span className={cn("mt-0.5 text-[9px] font-medium px-1 rounded bg-background/80", isActive && "text-primary font-bold")}>{p.label}</span>
          </div>
        );
      })}
      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-center gap-3 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1">🌧️ Rain risk</span>
        <span className="flex items-center gap-1">☀️ Clear</span>
      </div>
    </div>
  );
}

/* ====================== DEMAND FORECAST ====================== */
export function DemandView({ locationId }: { locationId: string }) {
  return (
    <Panel>
      <SectionHeading
        title="AI Weather → Demand Forecast"
        subtitle="Tomorrow's predicted demand, explained with confidence and recommended action"
        icon={<TrendingUp className="h-5 w-5" />}
        right={<DataLabelBadge label="Predicted" />}
      />
      <InsightCard
        title="Rain expected tomorrow → demand shift detected"
        priority="High"
        icon="🌧️"
        insight="Rain probability is high tomorrow (Madurai 82%). Based on previous rainy-day purchasing patterns, leafy-green demand is expected to decline while onion, tomato and coriander demand will increase."
        evidence={["Historical rainy-day orders (last 90 days)", "Weekday pattern (Monday uplift)", "Festival calendar approaching", "Local weather forecast"]}
        action="Increase tomato allocation by 12 kg; reduce leafy-green allocation; shift pickup to 6–7 PM window."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        {DEMAND_FORECAST.map((d) => {
          const p = getProduct(d.productId);
          const up = d.changePct >= 0;
          return (
            <Card key={d.productId}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold">{p?.name} <span className="text-xs text-muted-foreground">{p?.ta}</span></p>
                    <p className="text-2xl font-bold mt-1">{d.predictedKg} <span className="text-sm font-normal text-muted-foreground">{p?.unit}</span></p>
                    <p className={cn("text-xs font-medium mt-0.5", up ? "text-emerald-600" : "text-orange-600")}>
                      {up ? "▲" : "▼"} {Math.abs(d.changePct)}% vs confirmed {d.confirmedKg}{p?.unit}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-muted-foreground uppercase">Confidence</p>
                    <p className="text-lg font-bold text-emerald-600">{d.confidence}%</p>
                  </div>
                </div>
                <div className="mt-3"><ConfidenceMeter value={d.confidence} /></div>
                <Separator className="my-3" />
                <div className="space-y-2 text-xs">
                  <div><span className="font-semibold text-foreground">Why:</span> <span className="text-muted-foreground">{d.reason}</span></div>
                  <div className="flex items-start gap-1.5 rounded bg-emerald-500/5 p-2"><span className="font-semibold text-emerald-700 dark:text-emerald-300">Action:</span> <span className="text-emerald-800 dark:text-emerald-200">{d.action}</span></div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Confirmed vs Predicted Demand</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={DEMAND_FORECAST.map((d) => ({ name: getProduct(d.productId)?.name, confirmed: d.confirmedKg, predicted: d.predictedKg }))}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
              <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="confirmed" name="Confirmed" fill="var(--chart-4)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="predicted" name="Predicted" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </Panel>
  );
}

/* ====================== AI ALERT CENTER ====================== */
export function AlertsView() {
  const [filter, setFilter] = React.useState<string>("All");
  const priorities = ["All", "Critical", "High", "Medium", "Low"];
  const filtered = filter === "All" ? AI_ALERTS : AI_ALERTS.filter((a) => a.priority === filter);
  return (
    <Panel>
      <SectionHeading
        title="AI Alert Center"
        subtitle="Prioritized operational alerts across the ecosystem"
        icon={<AlertTriangle className="h-5 w-5" />}
      />
      <div className="flex flex-wrap gap-2">
        {priorities.map((p) => (
          <button
            key={p}
            onClick={() => setFilter(p)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium border transition-colors",
              filter === p ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-muted"
            )}
          >
            {p} {p !== "All" && `(${AI_ALERTS.filter((a) => a.priority === p).length})`}
          </button>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {filtered.map((a) => (
          <InsightCard
            key={a.id}
            title={a.title}
            priority={a.priority}
            icon={a.icon}
            insight={a.detail}
            evidence={a.evidence}
            action={a.action}
          >
            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
              <Badge variant="outline" className="text-[10px]">{a.category}</Badge>
              <span>{a.time}</span>
            </div>
          </InsightCard>
        ))}
      </div>
    </Panel>
  );
}
