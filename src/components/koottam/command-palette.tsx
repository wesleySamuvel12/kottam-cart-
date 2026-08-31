"use client";

import * as React from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { NAV, NAV_GROUPS } from "@/components/koottam/nav";
import { LOCATIONS } from "@/lib/koottam/data";
import { ArrowRight, CornerDownLeft, MapPin } from "lucide-react";

const QUICK_ACTIONS = [
  { id: "control-tower", label: "Open Control Tower", hint: "Dashboard" },
  { id: "demand", label: "Forecast tomorrow", hint: "Demand AI" },
  { id: "route", label: "Optimize today's routes", hint: "Route AI" },
  { id: "churn", label: "Show customers at churn risk", hint: "Churn" },
  { id: "voice", label: "Open Voice Assistant", hint: "Tamil voice" },
  { id: "copilot", label: "Ask Koottam AI", hint: "Copilot" },
  { id: "reports", label: "Generate pilot report", hint: "Reports" },
];

export function CommandPalette({
  open,
  onOpenChange,
  onNavigate,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onNavigate: (id: string) => void;
}) {
  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Type a command or search AI modules…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Quick Actions">
          {QUICK_ACTIONS.map((a) => (
            <CommandItem
              key={a.id + a.label}
              value={`${a.label} ${a.hint}`}
              onSelect={() => onNavigate(a.id)}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <ArrowRight className="h-3.5 w-3.5 text-primary" />
                <span>{a.label}</span>
              </div>
              <span className="text-[10px] text-muted-foreground">{a.hint}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        {NAV_GROUPS.map((group) => (
          <CommandGroup key={group} heading={group}>
            {NAV.filter((n) => n.group === group).map((item) => {
              const Icon = item.icon;
              return (
                <CommandItem
                  key={item.id}
                  value={`${item.label} ${item.ta} ${item.desc}`}
                  onSelect={() => onNavigate(item.id)}
                >
                  <Icon className="h-4 w-4 mr-2 text-primary" />
                  <span>{item.label}</span>
                  <span className="ml-auto text-[10px] text-muted-foreground">{item.ta}</span>
                </CommandItem>
              );
            })}
          </CommandGroup>
        ))}
        <CommandSeparator />
        <CommandGroup heading="Locations">
          {LOCATIONS.map((l) => (
            <CommandItem key={l.id} value={`location ${l.name} ${l.ta}`} onSelect={() => onNavigate("control-tower")}>
              <MapPin className="h-4 w-4 mr-2 text-primary" />
              <span>{l.name}</span>
              <span className="ml-auto text-[10px] text-muted-foreground">{l.ta}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
