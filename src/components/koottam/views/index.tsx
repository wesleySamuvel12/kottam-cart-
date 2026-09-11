"use client";

import { ControlTowerView, WeatherView, DemandView, AlertsView } from "./operations";
import { FarmerView, HarvestView, WasteView, PriceView, SourcingView } from "./farm";
import { RouteView, PickupView, HubView } from "./logistics";
import { ShoppingView, VoiceView } from "./customer";
import { WhatsappView } from "./whatsapp";
import { DemandAnalysisView } from "./demand-analysis";
import { FarmersView } from "./farmers";
import { CommunicationHistoryView } from "./history";
import {
  GroupView,
  ChurnView,
  TrustView,
  PaymentView,
  CopilotView,
  SimulatorView,
  ModelView,
} from "./intelligence";
import {
  PilotView,
  ImpactView,
  ExpansionView,
  ReportsView,
  KnowledgeView,
} from "./strategy";

export interface ViewProps {
  locationId: string;
}

export const VIEWS: Record<string, (props: ViewProps) => React.ReactNode> = {
  "control-tower": (p) => <ControlTowerView {...p} />,
  "demand-analysis": () => <DemandAnalysisView />,
  farmers: () => <FarmersView />,
  "comm-history": () => <CommunicationHistoryView />,
  weather: (p) => <WeatherView {...p} />,
  demand: (p) => <DemandView {...p} />,
  alerts: () => <AlertsView />,
  farmer: () => <FarmerView />,
  harvest: () => <HarvestView />,
  waste: () => <WasteView />,
  pricing: () => <PriceView />,
  sourcing: () => <SourcingView />,
  route: () => <RouteView />,
  pickup: () => <PickupView />,
  hub: () => <HubView />,
  whatsapp: () => <WhatsappView />,
  shopping: () => <ShoppingView />,
  voice: () => <VoiceView />,
  group: () => <GroupView />,
  churn: () => <ChurnView />,
  trust: () => <TrustView />,
  payment: () => <PaymentView />,
  copilot: () => <CopilotView />,
  simulator: () => <SimulatorView />,
  model: () => <ModelView />,
  pilot: () => <PilotView />,
  impact: () => <ImpactView />,
  expansion: () => <ExpansionView />,
  reports: () => <ReportsView />,
  knowledge: () => <KnowledgeView />,
};

