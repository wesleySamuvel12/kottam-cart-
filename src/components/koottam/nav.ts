// Koottam Cart — navigation registry for all AI modules (single-page, client-routed).

import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  CloudSun,
  TrendingUp,
  Sprout,
  CalendarDays,
  Recycle,
  BadgeIndianRupee,
  Truck,
  Map,
  ShoppingBag,
  Mic,
  Users,
  ShieldCheck,
  CreditCard,
  Route,
  Warehouse,
  Brain,
  FlaskConical,
  Target,
  HeartHandshake,
  MapPinned,
  HelpCircle,
  BellRing,
  FileText,
  Gauge,
  MessageSquare,
} from "lucide-react";

export interface NavItem {
  id: string;
  label: string;
  ta: string;
  icon: LucideIcon;
  group: string;
  section: number;
  desc: string;
}

export const NAV: NavItem[] = [
  // Operations
  { id: "control-tower", label: "AI Control Tower", ta: "கட்டுப்பாட்டு கோபுரம்", icon: LayoutDashboard, group: "Operations", section: 9, desc: "Supply-demand control tower & executive summary" },
  { id: "demand-analysis", label: "AI Demand Analysis", ta: "தேவை பகுப்பாய்வு", icon: TrendingUp, group: "Operations", section: 2, desc: "Live demand aggregation & farmer requirement dispatch" },
  { id: "weather", label: "Weather AI", ta: "வானிலை AI", icon: CloudSun, group: "Operations", section: 1, desc: "Location weather intelligence & alerts" },
  { id: "demand", label: "Demand Forecast", ta: "தேவை முன்னறிவிப்பு", icon: TrendingUp, group: "Operations", section: 2, desc: "Weather-driven demand prediction" },
  { id: "alerts", label: "AI Alert Center", ta: "எச்சரிக்கை", icon: BellRing, group: "Operations", section: 34, desc: "Prioritized AI alerts across the ecosystem" },

  // Farm & Supply
  { id: "farmers", label: "Farmer Directory", ta: "விவசாயி கோப்பகம்", icon: Sprout, group: "Farm & Supply", section: 3, desc: "Farmer contacts & channel management" },
  { id: "farmer", label: "Farmer AI", ta: "விவசாயி AI", icon: Sprout, group: "Farm & Supply", section: 3, desc: "What should I harvest tomorrow?" },
  { id: "harvest", label: "Harvest Planner", ta: "அறுவடை திட்டம்", icon: CalendarDays, group: "Farm & Supply", section: 5, desc: "Per-farmer harvest optimization" },
  { id: "waste", label: "WasteGuard AI", ta: "கழிவு தடுப்பு", icon: Recycle, group: "Farm & Supply", section: 6, desc: "Over/under-supply & spoilage prevention" },
  { id: "pricing", label: "PriceSense AI", ta: "விலை AI", icon: BadgeIndianRupee, group: "Farm & Supply", section: 7, desc: "Price intelligence & trend analysis" },
  { id: "sourcing", label: "Dynamic Sourcing", ta: "மூல திட்டம்", icon: Truck, group: "Farm & Supply", section: 8, desc: "Which farmers supply each product" },

  // Logistics
  { id: "route", label: "Route AI", ta: "வழி AI", icon: Route, group: "Logistics", section: 19, desc: "Optimized pickup & delivery routes" },
  { id: "pickup", label: "Pickup Optimizer", ta: "பிக்கப் நேரம்", icon: Map, group: "Logistics", section: 20, desc: "Best pickup window per neighbourhood" },
  { id: "hub", label: "Hub AI Advisor", ta: "ஹப் AI", icon: Warehouse, group: "Logistics", section: 22, desc: "Hub profitability & staffing" },

  // Customer
  { id: "whatsapp", label: "WhatsApp Orders", ta: "வாட்ஸ்அப் ஆணை", icon: MessageSquare, group: "Customer", section: 11, desc: "WhatsApp live order monitoring & logs" },
  { id: "shopping", label: "Personal Shopping AI", ta: "தனிப்பட்ட கடை", icon: ShoppingBag, group: "Customer", section: 10, desc: "Predict next basket & essentials" },
  { id: "voice", label: "Voice Assistant", ta: "குரல் உதவியாளர்", icon: Mic, group: "Customer", section: 13, desc: "Tamil + English voice ordering" },

  // Intelligence
  { id: "comm-history", label: "Communication Logs", ta: "தகவல் தொடர்பு பதிவு", icon: FileText, group: "Intelligence", section: 14, desc: "Unified Customer & Farmer communication history" },
  { id: "group", label: "Group AI", ta: "குழு AI", icon: Users, group: "Intelligence", section: 15, desc: "SHG group behaviour & engagement" },
  { id: "churn", label: "Churn Prediction", ta: "வாடிக்கையாளர் இழப்பு", icon: HeartHandshake, group: "Intelligence", section: 16, desc: "Customers likely to stop ordering" },
  { id: "trust", label: "TrustGuard AI", ta: "நம்பிக்கை AI", icon: ShieldCheck, group: "Intelligence", section: 17, desc: "Fraud & anomaly detection" },
  { id: "payment", label: "Payment Intelligence", ta: "கட்டண நுண்ணறிவு", icon: CreditCard, group: "Intelligence", section: 18, desc: "Payment ops & settlement analytics" },
  { id: "copilot", label: "Business Copilot", ta: "வணிக இணைய", icon: Brain, group: "Intelligence", section: 23, desc: "Ask Koottam AI anything" },
  { id: "simulator", label: "Growth Simulator", ta: "வளர்ச்சி சைமுலேட்டர்", icon: FlaskConical, group: "Intelligence", section: 24, desc: "Scenario modelling & forecasting" },
  { id: "model", label: "AI Model Performance", ta: "மாதிரி செயல்திறன்", icon: Gauge, group: "Intelligence", section: 33, desc: "Forecast accuracy & acceptance" },

  // Strategy
  { id: "pilot", label: "Madurai Pilot AI", ta: "மதுரை பைலட்", icon: Target, group: "Strategy", section: 25, desc: "Pilot health vs targets" },
  { id: "impact", label: "Impact AI", ta: "தாக்கம் AI", icon: HeartHandshake, group: "Strategy", section: 26, desc: "Social & economic impact" },
  { id: "expansion", label: "Expansion AI", ta: "விரிவாக்கம்", icon: MapPinned, group: "Strategy", section: 27, desc: "New district hub potential" },
  { id: "reports", label: "Report Generator", ta: "அறிக்கை", icon: FileText, group: "Strategy", section: 38, desc: "One-click operational reports" },
  { id: "knowledge", label: "Knowledge Center", ta: "அறிவு மையம்", icon: HelpCircle, group: "Strategy", section: 28, desc: "AI help center over Koottam docs" },
];

export const NAV_GROUPS = ["Operations", "Farm & Supply", "Logistics", "Customer", "Intelligence", "Strategy"];
