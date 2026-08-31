"use client";

import * as React from "react";
import { KoottamShell } from "@/components/koottam/shell";
import { VIEWS } from "@/components/koottam/views";
import { NAV } from "@/components/koottam/nav";

export default function Home() {
  const [active, setActive] = React.useState("control-tower");
  const [locationId, setLocationId] = React.useState("madurai");

  const activeNav = NAV.find((n) => n.id === active);
  const View = VIEWS[active] ?? VIEWS["control-tower"];

  return (
    <KoottamShell
      active={active}
      onNavigate={setActive}
      locationId={locationId}
      onLocationChange={setLocationId}
    >
      <div className="space-y-1 mb-5">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight">{activeNav?.label}</h1>
          <span className="text-sm text-muted-foreground">{activeNav?.ta}</span>
        </div>
        <p className="text-sm text-muted-foreground">{activeNav?.desc}</p>
      </div>
      <View locationId={locationId} />
    </KoottamShell>
  );
}
